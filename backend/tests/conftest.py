import os

os.environ["DATABASE_URL"] = os.getenv(
    "TEST_DATABASE_URL", "postgresql+asyncpg://food3d:food3d@localhost:5432/food3d_test"
)

import pytest
from alembic import command
from alembic.config import Config
from fastapi.testclient import TestClient

from app.core.db import get_db
from app.main import app
from tests.db import TestSessionLocal, run_sql


async def override_get_db():
    async with TestSessionLocal() as db:
        yield db


app.dependency_overrides[get_db] = override_get_db


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
