import uuid

from fastapi import APIRouter, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.auth.dependencies import CurrentUser
from app.cart import service
from app.cart.schemas import AddItemIn, CartOut, SetQuantityIn
from app.core.db import DbSession

router = APIRouter(prefix="/cart", tags=["cart"])


async def cart_for(db: AsyncSession, user_id: uuid.UUID) -> CartOut:
    return CartOut.from_lines(await service.get_cart(db, user_id))


@router.get("")
async def get_cart(user: CurrentUser, db: DbSession) -> CartOut:
    return await cart_for(db, user.id)


@router.post("/items")
async def add_item(data: AddItemIn, user: CurrentUser, db: DbSession) -> CartOut:
    try:
        await service.add_item(db, user.id, data.product_id, data.quantity)
    except service.ProductNotFoundError:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Product not found")
    return await cart_for(db, user.id)


@router.patch("/items/{product_id}")
async def set_quantity(product_id: int, data: SetQuantityIn, user: CurrentUser, db: DbSession) -> CartOut:
    try:
        await service.set_quantity(db, user.id, product_id, data.quantity)
    except service.ProductNotFoundError:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Item is not in your cart")
    return await cart_for(db, user.id)


@router.delete("/items/{product_id}")
async def remove_item(product_id: int, user: CurrentUser, db: DbSession) -> CartOut:
    await service.remove_item(db, user.id, product_id)
    return await cart_for(db, user.id)
