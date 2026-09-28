from pydantic import BaseModel

from app.products.pricing import InsightKind
from app.products.service import PricedProduct


class PriceOut(BaseModel):
    regular: int
    sale: int | None
    deal_quantity: int | None
    deal_price: int | None
    unit: int
    best_unit: int


class InsightOut(BaseModel):
    kind: InsightKind
    lowest: int
    highest: int
    percent_above_low: int


class ProductOut(BaseModel):
    id: int
    name: str
    category: str
    unit: str
    color: str
    package: str
    price: PriceOut
    insight: InsightOut

    @classmethod
    def from_priced(cls, item: PricedProduct) -> "ProductOut":
        product, price, insight = item.product, item.price, item.insight
        return cls(
            id=product.id,
            name=product.name,
            category=product.category,
            unit=product.unit,
            color=product.color,
            package=product.package,
            price=PriceOut(
                regular=price.regular,
                sale=price.sale,
                deal_quantity=price.deal_quantity,
                deal_price=price.deal_price,
                unit=price.unit,
                best_unit=price.best_unit,
            ),
            insight=InsightOut(
                kind=insight.kind,
                lowest=insight.lowest,
                highest=insight.highest,
                percent_above_low=insight.percent_above_low,
            ),
        )
