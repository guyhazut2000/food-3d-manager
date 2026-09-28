import uuid
from datetime import datetime

from sqlalchemy import CheckConstraint, DateTime, ForeignKey, Index, String, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db import Base

BODY_TYPES = ("round", "tall", "small")
HATS = ("cap", "beanie", "chef")
CART_STYLES = ("classic", "basket", "racer")


def _in(column: str, values: tuple[str, ...]) -> str:
    return f"{column} IN ({', '.join(repr(v) for v in values)})"


class User(Base):
    __tablename__ = "users"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    username: Mapped[str] = mapped_column(String(20))
    password_hash: Mapped[str] = mapped_column(String(255))
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    onboarded_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))

    avatar: Mapped["Avatar | None"] = relationship(back_populates="user", cascade="all, delete-orphan")


Index("uq_users_username_lower", func.lower(User.username), unique=True)


class Session(Base):
    __tablename__ = "sessions"

    id: Mapped[str] = mapped_column(String(64), primary_key=True)
    user_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), index=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    expires_at: Mapped[datetime] = mapped_column(DateTime(timezone=True))

    user: Mapped[User] = relationship()


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

    user: Mapped[User] = relationship(back_populates="avatar")
