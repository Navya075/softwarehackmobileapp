def test_notifications(client):
    res = client.get("/api/notifications")
    assert res.status_code == 200
    notifs = res.json()
    assert len(notifs) >= 1
    
    # Check customer-friendly language (no technical jargon)
    messages = [n["message"] for n in notifs]
    assert any("EV is still on track" in m or "departure" in m.lower() for m in messages)

    # Mark first read
    target = notifs[0]
    read_res = client.post(f"/api/notifications/{target['id']}/read")
    assert read_res.status_code == 200

    # Mark all read
    all_read_res = client.post("/api/notifications/read-all")
    assert all_read_res.status_code == 200
    assert all_read_res.json()["status"] == "success"

def test_register_push_token(client):
    res = client.post("/api/notifications/register-token", json={"push_token": "fcm_test_token_12345"})
    assert res.status_code == 200
    assert res.json()["status"] == "success"
