import uuid
from datetime import datetime

from pydantic import BaseModel, ConfigDict


class TripSummaryOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    checked_out_at: datetime
    item_count: int
    total: int
    savings: int


class TripItemOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    product_id: int | None
    name: str
    unit: str
    color: str
    quantity: int
    unit_price: int
    total: int
    savings: int


class TripOut(TripSummaryOut):
    items: list[TripItemOut]
