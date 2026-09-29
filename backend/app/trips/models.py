import uuid
from datetime import datetime

from sqlalchemy import CheckConstraint, DateTime, ForeignKey, Index, Integer, String, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.db import Base


class Trip(Base):
    """A completed shopping trip: an immutable receipt of what was bought and what it cost at checkout."""

    __tablename__ = "trips"
    __table_args__ = (
        CheckConstraint("item_count > 0", name="ck_trips_item_count_positive"),
        CheckConstraint("total >= 0 AND savings >= 0", name="ck_trips_amounts_non_negative"),
        Index("ix_trips_user_checked_out", "user_id", "checked_out_at"),
    )

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"))
    checked_out_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    item_count: Mapped[int] = mapped_column(Integer)
    total: Mapped[int] = mapped_column(Integer)
    savings: Mapped[int] = mapped_column(Integer)

    items: Mapped[list["TripItem"]] = relationship(
        back_populates="trip", cascade="all, delete-orphan", order_by="TripItem.position"
    )


class TripItem(Base):
    """One receipt line. Name, unit, and prices are copied at checkout so later catalog changes never alter history."""

    __tablename__ = "trip_items"
    __table_args__ = (CheckConstraint("quantity > 0", name="ck_trip_items_quantity_positive"),)

    trip_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("trips.id", ondelete="CASCADE"), primary_key=True)
    position: Mapped[int] = mapped_column(Integer, primary_key=True)
    product_id: Mapped[int | None] = mapped_column(ForeignKey("products.id", ondelete="SET NULL"))
    name: Mapped[str] = mapped_column(String(80))
    unit: Mapped[str] = mapped_column(String(30))
    color: Mapped[str] = mapped_column(String(7))
    quantity: Mapped[int] = mapped_column(Integer)
    unit_price: Mapped[int] = mapped_column(Integer)
    total: Mapped[int] = mapped_column(Integer)
    savings: Mapped[int] = mapped_column(Integer)

    trip: Mapped[Trip] = relationship(back_populates="items")
