import asyncio

import httpx2

from app.main import app
from tests.conftest import run_sql

CREDENTIALS = {"username": "Guy_1", "password": "password123"}


def test_register_creates_user_and_logs_in(client):
    response = client.post("/auth/register", json=CREDENTIALS)

    assert response.status_code == 201
    body = response.json()
    assert body["username"] == "Guy_1"
    assert body["onboarded"] is False
    assert "session" in response.cookies
    assert client.get("/auth/me").json()["id"] == body["id"]


def test_password_is_stored_hashed(client):
    client.post("/auth/register", json=CREDENTIALS)

    [(password_hash,)] = run_sql("SELECT password_hash FROM users")
    assert password_hash != CREDENTIALS["password"]
    assert password_hash.startswith("$argon2")


def test_session_token_is_stored_hashed(client):
    response = client.post("/auth/register", json=CREDENTIALS)

    [(session_id,)] = run_sql("SELECT id FROM sessions")
    assert session_id != response.cookies["session"]


def test_register_rejects_duplicate_username_case_insensitively(client):
    client.post("/auth/register", json=CREDENTIALS)

    response = client.post("/auth/register", json={**CREDENTIALS, "username": "guy_1"})

    assert response.status_code == 409


def test_concurrent_registrations_allow_only_one_owner_of_a_username():
    async def register_five_at_once():
        transport = httpx2.ASGITransport(app=app)
        async with httpx2.AsyncClient(transport=transport, base_url="http://test") as c:
            responses = await asyncio.gather(
                *(c.post("/auth/register", json=CREDENTIALS) for _ in range(5))
            )
        return sorted(r.status_code for r in responses)

    assert asyncio.run(register_five_at_once()) == [201, 409, 409, 409, 409]
    assert run_sql("SELECT count(*) FROM users") == [(1,)]


def test_register_validates_input(client):
    too_short_name = client.post("/auth/register", json={"username": "ab", "password": "password123"})
    bad_chars = client.post("/auth/register", json={"username": "guy!", "password": "password123"})
    short_password = client.post("/auth/register", json={"username": "guy", "password": "short"})

    assert too_short_name.status_code == 422
    assert bad_chars.status_code == 422
    assert short_password.status_code == 422


def test_login_with_correct_password(client):
    client.post("/auth/register", json=CREDENTIALS)
    client.cookies.clear()

    response = client.post("/auth/login", json={**CREDENTIALS, "username": "GUY_1"})

    assert response.status_code == 200
    assert client.get("/auth/me").status_code == 200


def test_login_with_wrong_password_or_unknown_user_gives_same_error(client):
    client.post("/auth/register", json=CREDENTIALS)
    client.cookies.clear()

    wrong_password = client.post("/auth/login", json={**CREDENTIALS, "password": "wrongpass1"})
    unknown_user = client.post("/auth/login", json={"username": "nobody", "password": "password123"})

    assert wrong_password.status_code == unknown_user.status_code == 401
    assert wrong_password.json() == unknown_user.json()


def test_me_requires_login(client):
    assert client.get("/auth/me").status_code == 401


def test_logout_ends_session(client):
    client.post("/auth/register", json=CREDENTIALS)
    token = client.cookies["session"]

    assert client.post("/auth/logout").status_code == 204

    client.cookies.set("session", token)
    assert client.get("/auth/me").status_code == 401


def test_expired_session_is_rejected(client):
    client.post("/auth/register", json=CREDENTIALS)
    run_sql("UPDATE sessions SET expires_at = now() - interval '1 minute'")

    assert client.get("/auth/me").status_code == 401
