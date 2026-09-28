from fastapi import APIRouter, Depends

from app.auth.dependencies import current_user
from app.core.db import DbSession
from app.products import service
from app.products.schemas import ProductOut

router = APIRouter(prefix="/products", tags=["products"], dependencies=[Depends(current_user)])


@router.get("")
async def list_products(db: DbSession) -> list[ProductOut]:
    return [ProductOut.from_priced(item) for item in await service.list_priced_products(db)]
