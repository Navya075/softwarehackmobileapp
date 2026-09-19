def test_health_check(client):
    res = client.get("/")
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "online"
    assert "firebase-auth" in data["features"]
    assert "optimizer-adapter-interface" in data["features"]

def test_auth_verify(client):
    res = client.post("/api/auth/verify", json={"id_token": "demo-token"})
    assert res.status_code == 200
    data = res.json()
    assert "uid" in data
    assert "profile" in data
    assert data["profile"]["user_id"] == data["uid"]

def test_get_and_update_user_profile(client):
    res = client.get("/api/users/me")
    assert res.status_code == 200
    profile = res.json()
    assert "user_id" in profile
    assert profile["context"] in ("residential", "commercial")

    # Update profile
    update_res = client.put("/api/users/me", json={"name": "Alex Mercer", "phone": "+1 555-9999"})
    assert update_res.status_code == 200
    updated = update_res.json()
    assert updated["name"] == "Alex Mercer"
    assert updated["phone"] == "+1 555-9999"

def test_switch_context(client):
    # Switch to commercial
    res = client.post("/api/users/switch-context", json={"context": "commercial"})
    assert res.status_code == 200
    assert res.json()["context"] == "commercial"

    # Switch back to residential
    res2 = client.post("/api/users/switch-context", json={"context": "residential"})
    assert res2.status_code == 200
    assert res2.json()["context"] == "residential"
