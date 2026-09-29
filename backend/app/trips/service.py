import uuid

from sqlalchemy import delete, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.cart.models import CartItem
from app.cart.service import get_cart
from app.trips.models import Trip, TripItem

TRIP_HISTORY_LIMIT = 100


class EmptyCartError(Exception):
    pass


async def checkout(db: AsyncSession, user_id: uuid.UUID) -> Trip:
    """Turns the cart into a trip and empties it, in one transaction.

    The cart rows are locked first, so a concurrent checkout waits and then finds the cart already empty.
    """
    lines = await get_cart(db, user_id, lock=True)
    if not lines:
        raise EmptyCartError

    trip = Trip(
        user_id=user_id,
        item_count=sum(line.quantity for line in lines),
        total=sum(line.totals.total for line in lines),
        savings=sum(line.totals.savings for line in lines),
        items=[
            TripItem(
                position=position,
                product_id=line.product.id,
                name=line.product.name,
                unit=line.product.unit,
                color=line.product.color,
                quantity=line.quantity,
                unit_price=line.price.unit,
                total=line.totals.total,
                savings=line.totals.savings,
            )
            for position, line in enumerate(lines)
        ],
    )
    db.add(trip)
    await db.execute(
        delete(CartItem).where(
            CartItem.user_id == user_id, CartItem.product_id.in_([line.product.id for line in lines])
        )
    )
    await db.commit()
    return await get_trip(db, user_id, trip.id)


async def list_trips(db: AsyncSession, user_id: uuid.UUID) -> list[Trip]:
    return list(
        await db.scalars(
            select(Trip)
            .where(Trip.user_id == user_id)
            .order_by(Trip.checked_out_at.desc())
            .limit(TRIP_HISTORY_LIMIT)
        )
    )


async def get_trip(db: AsyncSession, user_id: uuid.UUID, trip_id: uuid.UUID) -> Trip | None:
    return await db.scalar(
        select(Trip).where(Trip.id == trip_id, Trip.user_id == user_id).options(selectinload(Trip.items))
    )
