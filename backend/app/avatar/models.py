import uuid
from datetime import datetime

from sqlalchemy import CheckConstraint, DateTime, ForeignKey, String, func
from sqlalchemy.orm import Mapped, mapped_column

from app.core.db import Base

BODY_TYPES = ("round", "tall", "small")
HATS = ("cap", "beanie", "chef")
CART_STYLES = ("classic", "basket", "racer")


def _in(column: str, values: tuple[str, ...]) -> str:
    return f"{column} IN ({', '.join(repr(v) for v in values)})"


class Avatar(Base):
    __tablename__ = "avatars"
    __table_args__ = (
        CheckConstraint(_in("body_type", BODY_TYPES), name="ck_avatars_body_type"),
        CheckConstraint(f"hat IS NULL OR {_in('hat', HATS)}", name="ck_avatars_hat"),
        CheckConstraint(_in("cart_style", CART_STYLES), name="ck_avatars_cart_style"),
    )

    user_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), primary_key=True)
    body_type: Mapped[str] = mapped_column(String(20))
    skin_color: Mapped[str] = mapped_column(String(7))
    shirt_color: Mapped[str] = mapped_column(String(7))
    hat: Mapped[str | None] = mapped_column(String(20))
    cart_style: Mapped[str] = mapped_column(String(20))
    cart_color: Mapped[str] = mapped_column(String(7))
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )
