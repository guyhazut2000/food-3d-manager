from datetime import UTC, datetime, timedelta
from typing import Annotated

from fastapi import APIRouter, Cookie, HTTPException, Response, status
from sqlalchemy import delete, func, select
from sqlalchemy.exc import IntegrityError

from app.config import COOKIE_SECURE, SESSION_COOKIE_NAME, SESSION_TTL_DAYS
from app.deps import CurrentUser, DbSession
from app.models import Session, User
from app.schemas import Credentials, UserOut
from app.security import hash_password, hash_session_token, new_session_token, verify_password

router = APIRouter(prefix="/auth", tags=["auth"])


def to_user_out(user: User) -> UserOut:
    return UserOut(id=user.id, username=user.username, onboarded=user.onboarded_at is not None)


async def start_session(db: DbSession, response: Response, user: User) -> None:
    token = new_session_token()
    ttl = timedelta(days=SESSION_TTL_DAYS)
    db.add(Session(id=hash_session_token(token), user_id=user.id, expires_at=datetime.now(UTC) + ttl))
    await db.commit()
    response.set_cookie(
        SESSION_COOKIE_NAME,
        token,
        max_age=int(ttl.total_seconds()),
        httponly=True,
        secure=COOKIE_SECURE,
        samesite="lax",
    )


@router.post("/register", status_code=status.HTTP_201_CREATED)
async def register(credentials: Credentials, response: Response, db: DbSession) -> UserOut:
    user = User(username=credentials.username, password_hash=hash_password(credentials.password))
    db.add(user)
    try:
        await db.flush()
    except IntegrityError:
        raise HTTPException(status.HTTP_409_CONFLICT, "Username is already taken")
    await start_session(db, response, user)
    return to_user_out(user)


@router.post("/login")
async def login(credentials: Credentials, response: Response, db: DbSession) -> UserOut:
    user = await db.scalar(
        select(User).where(func.lower(User.username) == credentials.username.lower())
    )
    if not verify_password(user.password_hash if user else None, credentials.password):
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Invalid username or password")
    await start_session(db, response, user)
    return to_user_out(user)


@router.post("/logout", status_code=status.HTTP_204_NO_CONTENT)
async def logout(
    response: Response,
    db: DbSession,
    session_token: Annotated[str | None, Cookie(alias=SESSION_COOKIE_NAME)] = None,
) -> None:
    if session_token:
        await db.execute(delete(Session).where(Session.id == hash_session_token(session_token)))
        await db.commit()
    response.delete_cookie(SESSION_COOKIE_NAME, httponly=True, secure=COOKIE_SECURE, samesite="lax")


@router.get("/me")
async def me(user: CurrentUser) -> UserOut:
    return to_user_out(user)
