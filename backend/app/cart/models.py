import uuid
from datetime import datetime

from sqlalchemy import CheckConstraint, DateTime, ForeignKey, Integer, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.db import Base
from app.products.models import Product

MAX_QUANTITY = 99


class CartItem(Base):
    __tablename__ = "cart_items"
    __table_args__ = (
        CheckConstraint(f"quantity BETWEEN 1 AND {MAX_QUANTITY}", name="ck_cart_items_quantity_range"),
    )

    user_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), primary_key=True)
    product_id: Mapped[int] = mapped_column(ForeignKey("products.id", ondelete="CASCADE"), primary_key=True)
    quantity: Mapped[int] = mapped_column(Integer)
    added_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    product: Mapped[Product] = relationship()
