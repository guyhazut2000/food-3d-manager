import asyncio

import httpx2

from app.main import app
from app.products.pricing import Price
from app.products.service import record_price
from tests.db import run_sql, run_with_session


def fill_cart(client, catalog):
    client.post("/cart/items", json={"product_id": catalog["sale"], "quantity": 1})
    client.post("/cart/items", json={"product_id": catalog["deal"], "quantity": 3})


def test_trips_require_login(client):
    assert client.post("/trips").status_code == 401
    assert client.get("/trips").status_code == 401


def test_checkout_creates_trip_matching_cart_and_empties_it(logged_in_client, catalog):
    fill_cart(logged_in_client, catalog)
    cart = logged_in_client.get("/cart").json()

    response = logged_in_client.post("/trips")

    assert response.status_code == 201
    trip = response.json()
    assert (trip["item_count"], trip["total"], trip["savings"]) == (cart["item_count"], cart["total"], cart["savings"])
    assert [(i["name"], i["quantity"], i["total"]) for i in trip["items"]] == [
        ("sale", 1, 800),
        ("deal", 3, 2500),
    ]
    assert logged_in_client.get("/cart").json()["items"] == []


def test_checkout_with_empty_cart_is_rejected(logged_in_client):
    response = logged_in_client.post("/trips")

    assert response.status_code == 409
    assert run_sql("SELECT count(*) FROM trips") == [(0,)]


def test_trip_keeps_checkout_prices_after_price_changes(logged_in_client, catalog):
    logged_in_client.post("/cart/items", json={"product_id": catalog["plain"], "quantity": 2})
    trip_id = logged_in_client.post("/trips").json()["id"]

    run_with_session(lambda db: record_price(db, catalog["plain"], Price(regular=5000), "scraper"))
    run_sql("UPDATE products SET name = 'renamed' WHERE name = 'plain'")

    trip = logged_in_client.get(f"/trips/{trip_id}").json()
    assert (trip["items"][0]["name"], trip["items"][0]["unit_price"], trip["total"]) == ("plain", 1000, 2000)


def test_trip_survives_product_deletion(logged_in_client, catalog):
    logged_in_client.post("/cart/items", json={"product_id": catalog["plain"]})
    trip_id = logged_in_client.post("/trips").json()["id"]

    run_sql(f"DELETE FROM products WHERE id = {catalog['plain']}")

    item = logged_in_client.get(f"/trips/{trip_id}").json()["items"][0]
    assert (item["product_id"], item["name"]) == (None, "plain")


def test_list_trips_newest_first(logged_in_client, catalog):
    logged_in_client.post("/cart/items", json={"product_id": catalog["plain"]})
    first = logged_in_client.post("/trips").json()["id"]
    logged_in_client.post("/cart/items", json={"product_id": catalog["sale"]})
    second = logged_in_client.post("/trips").json()["id"]

    trips = logged_in_client.get("/trips").json()

    assert [t["id"] for t in trips] == [second, first]
    assert "items" not in trips[0]


def test_trips_are_private(client, catalog):
    client.post("/auth/register", json={"username": "alice", "password": "password123"})
    client.post("/cart/items", json={"product_id": catalog["plain"]})
    alice_trip = client.post("/trips").json()["id"]

    client.cookies.clear()
    client.post("/auth/register", json={"username": "bob", "password": "password123"})

    assert client.get("/trips").json() == []
    assert client.get(f"/trips/{alice_trip}").status_code == 404


def test_unknown_trip_returns_404(logged_in_client):
    assert logged_in_client.get("/trips/00000000-0000-0000-0000-000000000000").status_code == 404


def test_concurrent_checkouts_create_exactly_one_trip(logged_in_client, catalog):
    fill_cart(logged_in_client, catalog)
    cookies = dict(logged_in_client.cookies)

    async def checkout_three_times_at_once():
        transport = httpx2.ASGITransport(app=app)
        async with httpx2.AsyncClient(transport=transport, base_url="http://test", cookies=cookies) as c:
            responses = await asyncio.gather(*(c.post("/trips") for _ in range(3)))
        return sorted(r.status_code for r in responses)

    assert asyncio.run(checkout_three_times_at_once()) == [201, 409, 409]
    assert run_sql("SELECT count(*) FROM trips") == [(1,)]
    assert run_sql("SELECT sum(quantity) FROM trip_items") == [(4,)]
