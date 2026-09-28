from datetime import UTC, datetime

from fastapi import APIRouter, HTTPException, status
from sqlalchemy.dialects.postgresql import insert

from app.deps import CurrentUser, DbSession
from app.models import Avatar
from app.schemas import AvatarIn, AvatarOut

router = APIRouter(prefix="/avatar", tags=["avatar"])


@router.get("")
async def get_avatar(user: CurrentUser, db: DbSession) -> AvatarOut:
    avatar = await db.get(Avatar, user.id)
    if avatar is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Avatar not created yet")
    return AvatarOut.model_validate(avatar)


@router.put("")
async def save_avatar(data: AvatarIn, user: CurrentUser, db: DbSession) -> AvatarOut:
    values = data.model_dump()
    upsert = (
        insert(Avatar)
        .values(user_id=user.id, **values)
        .on_conflict_do_update(
            index_elements=[Avatar.user_id],
            set_={**values, "updated_at": datetime.now(UTC)},
        )
    )
    await db.execute(upsert)
    if user.onboarded_at is None:
        user.onboarded_at = datetime.now(UTC)
    await db.commit()
    return AvatarOut(**values)
