import uuid

from fastapi import APIRouter, HTTPException, status

from app.auth.dependencies import CurrentUser
from app.core.db import DbSession
from app.trips import service
from app.trips.schemas import TripOut, TripSummaryOut

router = APIRouter(prefix="/trips", tags=["trips"])


@router.post("", status_code=status.HTTP_201_CREATED)
async def checkout(user: CurrentUser, db: DbSession) -> TripOut:
    """Checks out the current cart as a new trip."""
    try:
        trip = await service.checkout(db, user.id)
    except service.EmptyCartError:
        raise HTTPException(status.HTTP_409_CONFLICT, "Your cart is empty")
    return TripOut.model_validate(trip)


@router.get("")
async def list_trips(user: CurrentUser, db: DbSession) -> list[TripSummaryOut]:
    return [TripSummaryOut.model_validate(trip) for trip in await service.list_trips(db, user.id)]


@router.get("/{trip_id}")
async def get_trip(trip_id: uuid.UUID, user: CurrentUser, db: DbSession) -> TripOut:
    trip = await service.get_trip(db, user.id, trip_id)
    if trip is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Trip not found")
    return TripOut.model_validate(trip)
