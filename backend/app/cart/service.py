import uuid
from dataclasses import dataclass

from sqlalchemy import delete, func, select, update
from sqlalchemy.dialects.postgresql import insert
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.cart.models import MAX_QUANTITY, CartItem
from app.products.models import Product
from app.products.pricing import LineTotal, Price, line_total
from app.products.service import current_prices


class ProductNotFoundError(Exception):
    pass


@dataclass(frozen=True)
class CartLine:
    product: Product
    quantity: int
    price: Price
    totals: LineTotal


async def get_cart(db: AsyncSession, user_id: uuid.UUID) -> list[CartLine]:
    items = (
        await db.scalars(
            select(CartItem)
            .where(CartItem.user_id == user_id)
            .options(selectinload(CartItem.product))
            .order_by(CartItem.added_at)
        )
    ).all()
    prices = await current_prices(db, [item.product_id for item in items])
    return [
        CartLine(item.product, item.quantity, price, line_total(price, item.quantity))
        for item in items
        if (price := prices.get(item.product_id)) is not None
    ]


async def _ensure_product_exists(db: AsyncSession, product_id: int) -> None:
    if await db.get(Product, product_id) is None:
        raise ProductNotFoundError(product_id)


async def add_item(db: AsyncSession, user_id: uuid.UUID, product_id: int, quantity: int) -> None:
    """Adds to the existing quantity atomically, so concurrent adds never lose an item."""
    await _ensure_product_exists(db, product_id)
    upsert = insert(CartItem).values(user_id=user_id, product_id=product_id, quantity=quantity)
    await db.execute(
        upsert.on_conflict_do_update(
            index_elements=[CartItem.user_id, CartItem.product_id],
            set_={"quantity": func.least(CartItem.quantity + upsert.excluded.quantity, MAX_QUANTITY)},
        )
    )
    await db.commit()


async def set_quantity(db: AsyncSession, user_id: uuid.UUID, product_id: int, quantity: int) -> None:
    if quantity == 0:
        await remove_item(db, user_id, product_id)
        return
    result = await db.execute(
        update(CartItem)
        .where(CartItem.user_id == user_id, CartItem.product_id == product_id)
        .values(quantity=quantity)
    )
    if result.rowcount == 0:
        raise ProductNotFoundError(product_id)
    await db.commit()


async def remove_item(db: AsyncSession, user_id: uuid.UUID, product_id: int) -> None:
    await db.execute(delete(CartItem).where(CartItem.user_id == user_id, CartItem.product_id == product_id))
    await db.commit()
