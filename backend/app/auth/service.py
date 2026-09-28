from datetime import UTC, datetime, timedelta

from fastapi.concurrency import run_in_threadpool
from sqlalchemy import delete, func, select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.auth.models import Session, User
from app.core.config import SESSION_TTL_DAYS
from app.core.security import hash_password, hash_session_token, new_session_token, verify_password

SESSION_TTL = timedelta(days=SESSION_TTL_DAYS)


class UsernameTakenError(Exception):
    pass


async def create_user(db: AsyncSession, username: str, password: str) -> User:
    # argon2 is deliberately CPU-heavy; running it in a thread keeps the event loop free for other requests.
    user = User(username=username, password_hash=await run_in_threadpool(hash_password, password))
    db.add(user)
    try:
        await db.flush()
    except IntegrityError as err:
        raise UsernameTakenError(username) from err
    return user


async def authenticate(db: AsyncSession, username: str, password: str) -> User | None:
    user = await db.scalar(select(User).where(func.lower(User.username) == username.lower()))
    if not await run_in_threadpool(verify_password, user.password_hash if user else None, password):
        return None
    return user


async def create_session(db: AsyncSession, user: User) -> str:
    """Stores a new session and returns the raw token for the cookie; only its hash is persisted."""
    token = new_session_token()
    db.add(Session(id=hash_session_token(token), user_id=user.id, expires_at=datetime.now(UTC) + SESSION_TTL))
    await db.commit()
    return token


async def get_session_user(db: AsyncSession, token: str) -> User | None:
    session = await db.scalar(
        select(Session).where(Session.id == hash_session_token(token)).options(selectinload(Session.user))
    )
    if session is None or session.expires_at <= datetime.now(UTC):
        return None
    return session.user


async def delete_session(db: AsyncSession, token: str) -> None:
    await db.execute(delete(Session).where(Session.id == hash_session_token(token)))
    await db.commit()
