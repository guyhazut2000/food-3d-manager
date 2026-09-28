from typing import Annotated

from pydantic import BaseModel, Field

from app.cart.models import MAX_QUANTITY
from app.cart.service import CartLine

Quantity = Annotated[int, Field(ge=1, le=MAX_QUANTITY)]


class AddItemIn(BaseModel):
    product_id: int
    quantity: Quantity = 1


class SetQuantityIn(BaseModel):
    quantity: Annotated[int, Field(ge=0, le=MAX_QUANTITY)]


class CartLineOut(BaseModel):
    product_id: int
    name: str
    unit: str
    color: str
    quantity: int
    unit_price: int
    total: int
    savings: int


class CartOut(BaseModel):
    items: list[CartLineOut]
    item_count: int
    total: int
    savings: int

    @classmethod
    def from_lines(cls, lines: list[CartLine]) -> "CartOut":
        items = [
            CartLineOut(
                product_id=line.product.id,
                name=line.product.name,
                unit=line.product.unit,
                color=line.product.color,
                quantity=line.quantity,
                unit_price=line.price.unit,
                total=line.totals.total,
                savings=line.totals.savings,
            )
            for line in lines
        ]
        return cls(
            items=items,
            item_count=sum(item.quantity for item in items),
            total=sum(item.total for item in items),
            savings=sum(item.savings for item in items),
        )
