AVATAR = {
    "body_type": "round",
    "skin_color": "#f1c27d",
    "shirt_color": "#2563eb",
    "hat": "cap",
    "cart_style": "classic",
    "cart_color": "#dc2626",
}


def test_avatar_requires_login(client):
    assert client.get("/avatar").status_code == 401
    assert client.put("/avatar", json=AVATAR).status_code == 401


def test_new_user_has_no_avatar(logged_in_client):
    assert logged_in_client.get("/avatar").status_code == 404


def test_saving_avatar_completes_onboarding(logged_in_client):
    response = logged_in_client.put("/avatar", json=AVATAR)

    assert response.status_code == 200
    assert response.json() == AVATAR
    assert logged_in_client.get("/avatar").json() == AVATAR
    assert logged_in_client.get("/auth/me").json()["onboarded"] is True


def test_saving_again_updates_the_same_avatar(logged_in_client):
    logged_in_client.put("/avatar", json=AVATAR)

    updated = {**AVATAR, "hat": None, "cart_style": "racer"}
    logged_in_client.put("/avatar", json=updated)

    assert logged_in_client.get("/avatar").json() == updated


def test_avatar_rejects_invalid_options(logged_in_client):
    bad_body = logged_in_client.put("/avatar", json={**AVATAR, "body_type": "giant"})
    bad_color = logged_in_client.put("/avatar", json={**AVATAR, "cart_color": "red"})

    assert bad_body.status_code == 422
    assert bad_color.status_code == 422


def test_users_only_see_their_own_avatar(client):
    client.post("/auth/register", json={"username": "alice", "password": "password123"})
    client.put("/avatar", json=AVATAR)

    client.cookies.clear()
    client.post("/auth/register", json={"username": "bob", "password": "password123"})

    assert client.get("/avatar").status_code == 404
