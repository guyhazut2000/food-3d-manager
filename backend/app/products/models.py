from datetime import datetime

from sqlalchemy import CheckConstraint, DateTime, ForeignKey, Index, Integer, String, func
from sqlalchemy.orm import Mapped, mapped_column

from app.core.db import Base

CATEGORIES = ("produce", "dairy", "bakery", "pantry")
PACKAGES = (
    "round", "long", "bunch", "tray", "carton", "tub", "cup", "block",
    "egg_carton", "loaf", "bag", "box", "bottle", "can", "jar",
)


def _in(column: str, values: tuple[str, ...]) -> str:
    return f"{column} IN ({', '.join(repr(v) for v in values)})"


class Product(Base):
    __tablename__ = "products"
    __table_args__ = (
        CheckConstraint(_in("category", CATEGORIES), name="ck_products_category"),
        CheckConstraint(_in("package", PACKAGES), name="ck_products_package"),
    )

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(80), unique=True)
    category: Mapped[str] = mapped_column(String(20))
    unit: Mapped[str] = mapped_column(String(30))
    color: Mapped[str] = mapped_column(String(7))
    package: Mapped[str] = mapped_column(String(20), server_default="box")


class ProductPrice(Base):
    """One observed price for a product. Prices are in agorot; the latest observation is the current price."""

    __tablename__ = "product_prices"
    __table_args__ = (
        CheckConstraint("regular_price > 0", name="ck_product_prices_regular_positive"),
        CheckConstraint(
            "sale_price IS NULL OR (sale_price > 0 AND sale_price < regular_price)",
            name="ck_product_prices_sale_below_regular",
        ),
        CheckConstraint(
            "(deal_quantity IS NULL) = (deal_price IS NULL)", name="ck_product_prices_deal_complete"
        ),
        CheckConstraint(
            "deal_quantity IS NULL OR (deal_quantity >= 2 AND deal_price > 0)", name="ck_product_prices_deal_valid"
        ),
        Index("ix_product_prices_product_observed", "product_id", "observed_at"),
    )

    id: Mapped[int] = mapped_column(primary_key=True)
    product_id: Mapped[int] = mapped_column(ForeignKey("products.id", ondelete="CASCADE"))
    regular_price: Mapped[int] = mapped_column(Integer)
    sale_price: Mapped[int | None] = mapped_column(Integer)
    deal_quantity: Mapped[int | None] = mapped_column(Integer)
    deal_price: Mapped[int | None] = mapped_column(Integer)
    source: Mapped[str] = mapped_column(String(40))
    observed_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
