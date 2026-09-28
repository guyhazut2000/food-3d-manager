import asyncio
from collections.abc import Awaitable, Callable
from typing import TypeVar

from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine
from sqlalchemy.pool import NullPool

from app.core.config import DATABASE_URL

T = TypeVar("T")

# NullPool: each TestClient runs its own event loop, so connections must not be reused across loops.
test_engine = create_async_engine(DATABASE_URL, poolclass=NullPool)
TestSessionLocal = async_sessionmaker(test_engine, expire_on_commit=False)


def run_sql(sql: str):
    """Runs raw SQL against the test database; returns rows for queries that produce them."""

    async def _run():
        async with test_engine.begin() as conn:
            result = await conn.execute(text(sql))
            return result.all() if result.returns_rows else None

    return asyncio.run(_run())


def run_with_session(work: Callable[[AsyncSession], Awaitable[T]]) -> T:
    """Runs async setup code (e.g. service calls) against the test database and commits."""

    async def _run():
        async with TestSessionLocal() as db:
            result = await work(db)
            await db.commit()
            return result

    return asyncio.run(_run())
