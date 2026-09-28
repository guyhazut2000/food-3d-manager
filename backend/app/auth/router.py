from fastapi import APIRouter, HTTPException, Response, status

from app.auth import service
from app.auth.dependencies import CurrentUser, SessionToken
from app.auth.schemas import Credentials, UserOut
from app.core.config import COOKIE_SECURE, SESSION_COOKIE_NAME
from app.core.db import DbSession

router = APIRouter(prefix="/auth", tags=["auth"])

COOKIE_OPTIONS = {"httponly": True, "secure": COOKIE_SECURE, "samesite": "lax"}


def set_session_cookie(response: Response, token: str) -> None:
    max_age = int(service.SESSION_TTL.total_seconds())
    response.set_cookie(SESSION_COOKIE_NAME, token, max_age=max_age, **COOKIE_OPTIONS)


@router.post("/register", status_code=status.HTTP_201_CREATED)
async def register(credentials: Credentials, response: Response, db: DbSession) -> UserOut:
    try:
        user = await service.create_user(db, credentials.username, credentials.password)
    except service.UsernameTakenError:
        raise HTTPException(status.HTTP_409_CONFLICT, "Username is already taken")
    set_session_cookie(response, await service.create_session(db, user))
    return UserOut.from_user(user)


@router.post("/login")
async def login(credentials: Credentials, response: Response, db: DbSession) -> UserOut:
    user = await service.authenticate(db, credentials.username, credentials.password)
    if user is None:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Invalid username or password")
    set_session_cookie(response, await service.create_session(db, user))
    return UserOut.from_user(user)


@router.post("/logout", status_code=status.HTTP_204_NO_CONTENT)
async def logout(response: Response, db: DbSession, session_token: SessionToken = None) -> None:
    if session_token:
        await service.delete_session(db, session_token)
    response.delete_cookie(SESSION_COOKIE_NAME, **COOKIE_OPTIONS)


@router.get("/me")
async def me(user: CurrentUser) -> UserOut:
    return UserOut.from_user(user)
