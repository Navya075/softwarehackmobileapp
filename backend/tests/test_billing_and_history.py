def test_billing_endpoints(client):
    # Summary
    res = client.get("/api/billing/summary")
    assert res.status_code == 200
    summary = res.json()
    assert "total_spent" in summary
    assert "currency" in summary
    assert summary["currency"] == "INR"

    # Invoices
    res_inv = client.get("/api/billing/invoices")
    assert res_inv.status_code == 200
    invoices = res_inv.json()
    assert len(invoices) >= 1
    bill_id = invoices[0]["bill_id"]

    # Single invoice detail
    res_one = client.get(f"/api/billing/invoices/{bill_id}")
    assert res_one.status_code == 200
    assert res_one.json()["bill_id"] == bill_id

    # Pay bill demo payment
    res_pay = client.post(f"/api/billing/pay/{bill_id}", json={"payment_method": "UPI (Demo)"})
    assert res_pay.status_code == 200
    paid_bill = res_pay.json()
    assert paid_bill["status"] == "paid"
    assert paid_bill["payment_method"] == "UPI (Demo)"
    assert paid_bill.get("invoice_number") is not None


def test_history_endpoints(client):
    res = client.get("/api/history")
    assert res.status_code == 200
    history = res.json()
    assert len(history) >= 1
    session_id = history[0]["session_id"]

    # History detail
    res_one = client.get(f"/api/history/{session_id}")
    assert res_one.status_code == 200
    assert res_one.json()["session_id"] == session_id

def test_reports_endpoints(client):
    res_m = client.get("/api/reports/monthly?month=September&year=2026")
    assert res_m.status_code == 200
    m_data = res_m.json()
    assert m_data["month"] == "September"
    assert m_data["departure_readiness_percent"] > 90.0

    res_c = client.get("/api/reports/carbon?month=September&year=2026")
    assert res_c.status_code == 200
    c_data = res_c.json()
    assert c_data["co2_avoided_kg"] > 0
    assert c_data["trees_equivalent"] > 0

def test_trips_endpoints(client):
    # List trips
    res = client.get("/api/trips")
    assert res.status_code == 200
    trips = res.json()
    assert len(trips) >= 1

    # Create new trip
    trip_in = {
        "vehicle_id": "EV-001",
        "origin": "Bengaluru",
        "destination": "Mysuru",
        "distance_km": 145.0
    }
    create_res = client.post("/api/trips", json=trip_in)
    assert create_res.status_code == 201
    created = create_res.json()
    assert created["origin"] == "Bengaluru"
    assert created["distance_km"] == 145.0
    trip_id = created["trip_id"]

    # Delete trip
    del_res = client.delete(f"/api/trips/{trip_id}")
    assert del_res.status_code == 204
