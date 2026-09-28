from collections import defaultdict
from dataclasses import dataclass
from datetime import UTC, datetime, timedelta

from sqlalchemy import select
from sqlalchemy.dialects.postgresql import distinct_on
from sqlalchemy.ext.asyncio import AsyncSession

from app.products.models import Product, ProductPrice
from app.products.pricing import INSIGHT_WINDOW_DAYS, Price, PriceInsight, price_insight


@dataclass(frozen=True)
class PricedProduct:
    product: Product
    price: Price
    insight: PriceInsight


def to_price(row: ProductPrice) -> Price:
    return Price(row.regular_price, row.sale_price, row.deal_quantity, row.deal_price)


async def current_prices(db: AsyncSession, product_ids: list[int] | None = None) -> dict[int, Price]:
    """Latest observed price per product (Postgres DISTINCT ON keeps the newest row per product)."""
    query = (
        select(ProductPrice)
        .ext(distinct_on(ProductPrice.product_id))
        .order_by(ProductPrice.product_id, ProductPrice.observed_at.desc(), ProductPrice.id.desc())
    )
    if product_ids is not None:
        query = query.where(ProductPrice.product_id.in_(product_ids))
    return {row.product_id: to_price(row) for row in await db.scalars(query)}


async def list_priced_products(db: AsyncSession) -> list[PricedProduct]:
    products = (await db.scalars(select(Product).order_by(Product.category, Product.id))).all()
    prices = await current_prices(db)

    since = datetime.now(UTC) - timedelta(days=INSIGHT_WINDOW_DAYS)
    history: dict[int, list[int]] = defaultdict(list)
    for row in await db.scalars(select(ProductPrice).where(ProductPrice.observed_at >= since)):
        history[row.product_id].append(to_price(row).best_unit)

    return [
        PricedProduct(product, price, price_insight(price.best_unit, history[product.id]))
        for product in products
        if (price := prices.get(product.id)) is not None
    ]


async def record_price(
    db: AsyncSession, product_id: int, price: Price, source: str, observed_at: datetime | None = None
) -> None:
    """Entry point for price updates (seed data today, the scheduled scraper later)."""
    db.add(
        ProductPrice(
            product_id=product_id,
            regular_price=price.regular,
            sale_price=price.sale,
            deal_quantity=price.deal_quantity,
            deal_price=price.deal_price,
            source=source,
            observed_at=observed_at or datetime.now(UTC),
        )
    )
