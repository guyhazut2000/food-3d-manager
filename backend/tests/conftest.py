import os
from datetime import UTC, datetime, timedelta

os.environ["DATABASE_URL"] = os.getenv(
    "TEST_DATABASE_URL", "postgresql+asyncpg://food3d:food3d@localhost:5432/food3d_test"
)

import pytest
from alembic import command
from alembic.config import Config
from fastapi.testclient import TestClient

from app.core.db import get_db
from app.main import app
from app.products.models import Product
from app.products.pricing import Price
from app.products.service import record_price
from tests.db import TestSessionLocal, run_sql, run_with_session


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
    run_sql(
        "TRUNCATE users, sessions, avatars, products, product_prices, cart_items, trips, trip_items "
        "RESTART IDENTITY CASCADE"
    )


@pytest.fixture
def client():
    with TestClient(app) as test_client:
        yield test_client


@pytest.fixture
def logged_in_client(client):
    response = client.post("/auth/register", json={"username": "shopper", "password": "password123"})
    assert response.status_code == 201
    return client


CATALOG_PRICES = {
    "plain": (Price(regular=1000), [Price(regular=1100), Price(regular=1200)]),
    "sale": (Price(regular=1000, sale=800), [Price(regular=1000)]),
    "deal": (Price(regular=1000, deal_quantity=2, deal_price=1500), [Price(regular=700)]),
}


@pytest.fixture
def catalog() -> dict[str, int]:
    """Three products (plain, on sale, 2-for-15 deal) with a little price history; returns name -> id."""

    async def create(db):
        ids = {}
        now = datetime.now(UTC)
        for name, (current, history) in CATALOG_PRICES.items():
            product = Product(name=name, category="pantry", unit="1 pc", color="#123456")
            db.add(product)
            await db.flush()
            for days_ago, past in enumerate(history, start=1):
                await record_price(db, product.id, past, "test", now - timedelta(days=days_ago * 10))
            await record_price(db, product.id, current, "test", now)
            ids[name] = product.id
        return ids

    return run_with_session(create)
