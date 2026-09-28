import asyncio
import os

os.environ["DATABASE_URL"] = os.getenv(
    "TEST_DATABASE_URL", "postgresql+asyncpg://food3d:food3d@localhost:5432/food3d_test"
)

import pytest
from alembic import command
from alembic.config import Config
from fastapi.testclient import TestClient
from sqlalchemy import text
from sqlalchemy.ext.asyncio import async_sessionmaker, create_async_engine
from sqlalchemy.pool import NullPool

from app.config import DATABASE_URL
from app.db import get_db
from app.main import app

# NullPool: each TestClient runs its own event loop, so connections must not be reused across loops.
test_engine = create_async_engine(DATABASE_URL, poolclass=NullPool)
TestSessionLocal = async_sessionmaker(test_engine, expire_on_commit=False)


async def override_get_db():
    async with TestSessionLocal() as db:
        yield db


app.dependency_overrides[get_db] = override_get_db


def run_sql(sql: str):
    async def _run():
        async with test_engine.begin() as conn:
            result = await conn.execute(text(sql))
            return result.all() if result.returns_rows else None

    return asyncio.run(_run())


@pytest.fixture(scope="session", autouse=True)
def migrated_database():
    config = Config(os.path.join(os.path.dirname(__file__), "..", "alembic.ini"))
    command.downgrade(config, "base")
    command.upgrade(config, "head")


@pytest.fixture(autouse=True)
def clean_tables():
    yield
    run_sql("TRUNCATE users, sessions, avatars CASCADE")


@pytest.fixture
def client():
    with TestClient(app) as test_client:
        yield test_client


@pytest.fixture
def logged_in_client(client):
    response = client.post("/auth/register", json={"username": "shopper", "password": "password123"})
    assert response.status_code == 201
    return client
