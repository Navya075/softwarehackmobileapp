def test_charging_preferences(client):
    res = client.get("/api/charging/preferences")
    assert res.status_code == 200
    prefs = res.json()
    assert "target_soc" in prefs
    assert "departure_time" in prefs

    # Update preferences
    update_res = client.put("/api/charging/preferences", json={
        "target_soc": 80.0,
        "departure_time": "08:00 AM",
        "departure_readiness_guarantee": True
    })
    assert update_res.status_code == 200
    updated = update_res.json()
    assert updated["target_soc"] == 80.0
    assert updated["departure_time"] == "08:00 AM"

def test_charging_session_lifecycle_and_charge_faster(client):
    # 1. Start session
    start_res = client.post("/api/charging/session/start", json={
        "vehicle_id": "EV-001",
        "charger_name": "Phoenix Fast Charger",
        "target_soc": 85.0
    })
    assert start_res.status_code == 200
    session = start_res.json()
    assert session["status"] == "charging"
    assert session["vehicle_id"] == "EV-001"

    # 2. Get active session
    active_res = client.get("/api/charging/session/active")
    assert active_res.status_code == 200
    active = active_res.json()
    assert active is not None
    assert active["status"] == "charging"

    # 3. Pause session
    pause_res = client.post("/api/charging/session/pause")
    assert pause_res.status_code == 200
    assert pause_res.json()["status"] == "paused"

    # 4. Resume session
    resume_res = client.post("/api/charging/session/resume")
    assert resume_res.status_code == 200
    assert resume_res.json()["status"] == "charging"

    # 5. Trigger charge faster override
    cf_res = client.post("/api/charging/charge-faster", json={"vehicle_id": "EV-001"})
    assert cf_res.status_code == 200
    assert cf_res.json()["charge_faster"] is True

    # 6. Stop session
    stop_res = client.post("/api/charging/session/stop")
    assert stop_res.status_code == 200
    stopped = stop_res.json()
    assert stopped["status"] == "completed"

    # 7. Check that stopping session generated an invoice in billing
    bills_res = client.get("/api/billing/invoices")
    assert bills_res.status_code == 200
    bills = bills_res.json()
    assert len(bills) >= 1
