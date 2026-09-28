import asyncio

import pytest
from sqlalchemy import text
from sqlalchemy.exc import IntegrityError

from app.core.db import engine
from app.products import seed
from app.products.pricing import Price
from app.products.service import record_price
from tests.db import run_sql, run_with_session


def test_products_require_login(client):
    assert client.get("/products").status_code == 401


def test_lists_products_with_current_price(logged_in_client, catalog):
    products = {p["name"]: p for p in logged_in_client.get("/products").json()}

    assert set(products) == {"plain", "sale", "deal"}
    assert products["sale"]["price"] == {
        "regular": 1000,
        "sale": 800,
        "deal_quantity": None,
        "deal_price": None,
        "unit": 800,
        "best_unit": 800,
    }
    assert products["deal"]["price"]["best_unit"] == 750


def test_insight_compares_current_price_with_history(logged_in_client, catalog):
    products = {p["name"]: p for p in logged_in_client.get("/products").json()}

    assert products["plain"]["insight"] == {"kind": "lowest", "lowest": 1000, "highest": 1200, "percent_above_low": 0}
    assert products["deal"]["insight"]["kind"] == "highest"
    assert products["deal"]["insight"]["percent_above_low"] == 7


def test_newest_recorded_price_becomes_current(logged_in_client, catalog):
    run_with_session(lambda db: record_price(db, catalog["plain"], Price(regular=1300), "scraper"))

    plain = next(p for p in logged_in_client.get("/products").json() if p["name"] == "plain")

    assert plain["price"]["regular"] == 1300
    assert plain["insight"]["kind"] == "highest"


def test_history_outside_insight_window_is_ignored(logged_in_client, catalog):
    run_sql(f"UPDATE product_prices SET observed_at = now() - interval '120 days' "
            f"WHERE product_id = {catalog['plain']} AND regular_price = 1200")

    plain = next(p for p in logged_in_client.get("/products").json() if p["name"] == "plain")

    assert plain["insight"]["highest"] == 1100


def test_seed_creates_catalog_once_and_syncs_details():
    async def seed_with_drift_in_between():
        await seed.seed()
        async with engine.begin() as conn:
            await conn.execute(text("UPDATE products SET package = 'box', color = '#000000' WHERE name = 'Milk 3%'"))
        await seed.seed()
        await engine.dispose()

    asyncio.run(seed_with_drift_in_between())

    assert run_sql("SELECT count(*) FROM products") == [(60,)]
    assert run_sql("SELECT count(*) FROM product_prices") == [(60 * (len(seed.HISTORY_DAYS_AGO) + 1),)]
    assert run_sql("SELECT package, color FROM products WHERE name = 'Milk 3%'") == [("carton", "#2563eb")]
    assert run_sql("SELECT count(*) FROM product_prices WHERE sale_price IS NOT NULL")[0][0] > 0
    assert run_sql("SELECT count(*) FROM product_prices WHERE deal_quantity IS NOT NULL")[0][0] > 0


def test_product_includes_package(logged_in_client, catalog):
    assert {p["package"] for p in logged_in_client.get("/products").json()} == {"box"}


def test_unknown_package_is_rejected_by_database(catalog):
    with pytest.raises(IntegrityError):
        run_sql(f"UPDATE products SET package = 'crate' WHERE id = {catalog['plain']}")
