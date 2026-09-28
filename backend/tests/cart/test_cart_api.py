import asyncio

import httpx2

from app.main import app


def test_cart_requires_login(client):
    assert client.get("/cart").status_code == 401


def test_new_cart_is_empty(logged_in_client):
    assert logged_in_client.get("/cart").json() == {"items": [], "item_count": 0, "total": 0, "savings": 0}


def test_add_item_returns_updated_cart(logged_in_client, catalog):
    cart = logged_in_client.post("/cart/items", json={"product_id": catalog["plain"], "quantity": 2}).json()

    assert cart["item_count"] == 2
    assert cart["total"] == 2000
    [line] = cart["items"]
    assert (line["name"], line["quantity"], line["unit_price"], line["total"]) == ("plain", 2, 1000, 2000)


def test_adding_same_product_increases_quantity(logged_in_client, catalog):
    logged_in_client.post("/cart/items", json={"product_id": catalog["plain"]})
    cart = logged_in_client.post("/cart/items", json={"product_id": catalog["plain"], "quantity": 2}).json()

    assert [line["quantity"] for line in cart["items"]] == [3]


def test_cart_total_applies_sale_and_deal_with_savings(logged_in_client, catalog):
    logged_in_client.post("/cart/items", json={"product_id": catalog["sale"], "quantity": 1})
    cart = logged_in_client.post("/cart/items", json={"product_id": catalog["deal"], "quantity": 3}).json()

    # sale: 8.00; deal: 2 for 15.00 + 1 x 10.00 = 25.00
    assert cart["total"] == 800 + 2500
    assert cart["savings"] == 200 + 500


def test_quantity_is_capped_at_99(logged_in_client, catalog):
    logged_in_client.post("/cart/items", json={"product_id": catalog["plain"], "quantity": 90})
    cart = logged_in_client.post("/cart/items", json={"product_id": catalog["plain"], "quantity": 20}).json()

    assert cart["items"][0]["quantity"] == 99


def test_set_quantity_and_zero_removes(logged_in_client, catalog):
    logged_in_client.post("/cart/items", json={"product_id": catalog["plain"]})

    updated = logged_in_client.patch(f"/cart/items/{catalog['plain']}", json={"quantity": 5}).json()
    emptied = logged_in_client.patch(f"/cart/items/{catalog['plain']}", json={"quantity": 0}).json()

    assert updated["items"][0]["quantity"] == 5
    assert emptied["items"] == []


def test_remove_item(logged_in_client, catalog):
    logged_in_client.post("/cart/items", json={"product_id": catalog["plain"]})

    assert logged_in_client.delete(f"/cart/items/{catalog['plain']}").json()["items"] == []


def test_unknown_product_and_missing_line_return_404(logged_in_client, catalog):
    assert logged_in_client.post("/cart/items", json={"product_id": 999999}).status_code == 404
    assert logged_in_client.patch(f"/cart/items/{catalog['plain']}", json={"quantity": 2}).status_code == 404


def test_invalid_quantities_are_rejected(logged_in_client, catalog):
    assert logged_in_client.post("/cart/items", json={"product_id": catalog["plain"], "quantity": 0}).status_code == 422
    assert logged_in_client.post("/cart/items", json={"product_id": catalog["plain"], "quantity": 100}).status_code == 422


def test_carts_are_private(client, catalog):
    client.post("/auth/register", json={"username": "alice", "password": "password123"})
    client.post("/cart/items", json={"product_id": catalog["plain"]})

    client.cookies.clear()
    client.post("/auth/register", json={"username": "bob", "password": "password123"})

    assert client.get("/cart").json()["items"] == []


def test_concurrent_adds_are_not_lost(logged_in_client, catalog):
    cookies = dict(logged_in_client.cookies)

    async def add_five_at_once():
        transport = httpx2.ASGITransport(app=app)
        async with httpx2.AsyncClient(transport=transport, base_url="http://test", cookies=cookies) as c:
            await asyncio.gather(*(c.post("/cart/items", json={"product_id": catalog["plain"]}) for _ in range(5)))

    asyncio.run(add_five_at_once())

    assert logged_in_client.get("/cart").json()["items"][0]["quantity"] == 5
