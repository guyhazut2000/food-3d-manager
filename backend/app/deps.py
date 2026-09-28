from datetime import UTC, datetime
from typing import Annotated

from fastapi import Cookie, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.config import SESSION_COOKIE_NAME
from app.db import get_db
from app.models import Session, User
from app.security import hash_session_token

DbSession = Annotated[AsyncSession, Depends(get_db)]


async def current_user(
    db: DbSession,
    session_token: Annotated[str | None, Cookie(alias=SESSION_COOKIE_NAME)] = None,
) -> User:
    if session_token:
        session = await db.scalar(
            select(Session)
            .where(Session.id == hash_session_token(session_token))
            .options(selectinload(Session.user))
        )
        if session and session.expires_at > datetime.now(UTC):
            return session.user
    raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Not logged in")


CurrentUser = Annotated[User, Depends(current_user)]
