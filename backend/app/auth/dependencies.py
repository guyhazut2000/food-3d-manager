from typing import Annotated

from fastapi import Cookie, Depends, HTTPException, status

from app.auth import service
from app.auth.models import User
from app.core.config import SESSION_COOKIE_NAME
from app.core.db import DbSession

SessionToken = Annotated[str | None, Cookie(alias=SESSION_COOKIE_NAME)]


async def current_user(db: DbSession, session_token: SessionToken = None) -> User:
    user = await service.get_session_user(db, session_token) if session_token else None
    if user is None:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Not logged in")
    return user


CurrentUser = Annotated[User, Depends(current_user)]
