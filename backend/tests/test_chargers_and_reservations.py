def test_charger_discovery_and_filtering(client):
    # Get all chargers
    res = client.get("/api/chargers")
    assert res.status_code == 200
    chargers = res.json()
    assert len(chargers) >= 5

    # Filter by context
    res_comm = client.get("/api/chargers?context=commercial")
    assert res_comm.status_code == 200
    for ch in res_comm.json():
        assert ch["context"] == "commercial"

    # Filter by speed
    res_dc = client.get("/api/chargers?speed=dc")
    assert res_dc.status_code == 200
    for ch in res_dc.json():
        assert "DC" in ch["charging_type"]

    # Filter by search
    res_search = client.get("/api/chargers?search=Phoenix")
    assert res_search.status_code == 200
    assert any("Phoenix" in ch["name"] for ch in res_search.json())

def test_reservation_and_double_booking_prevention(client):
    charger_id = "ch_phoenix_07"
    date = "2026-09-20"
    time_slot = "04:30 PM – 05:30 PM"

    # 1. Check initial slots
    slots_res = client.get(f"/api/chargers/{charger_id}/slots?date={date}")
    assert slots_res.status_code == 200
    slots = slots_res.json()
    target_slot = next(s for s in slots if s["time_range"] == time_slot)
    assert target_slot["is_available"] is True

    # 2. Book the slot
    booking_payload = {
        "charger_id": charger_id,
        "vehicle_id": "EV-001",
        "date": date,
        "time_slot": time_slot,
        "estimated_kwh": 20.0
    }
    book_res = client.post("/api/reservations", json=booking_payload)
    assert book_res.status_code == 201
    booking = book_res.json()
    assert booking["status"] == "confirmed"
    assert booking["charger_id"] == charger_id
    reservation_id = booking["reservation_id"]

    # 3. Verify slot schedule now shows this slot as Booked
    slots_res2 = client.get(f"/api/chargers/{charger_id}/slots?date={date}")
    assert slots_res2.status_code == 200
    slots2 = slots_res2.json()
    updated_slot = next(s for s in slots2 if s["time_range"] == time_slot)
    assert updated_slot["is_available"] is False
    assert updated_slot["status_tag"] == "Booked"

    # 4. DOUBLE-BOOKING PREVENTION TEST:
    # Attempting to book the same slot MUST return HTTP 409 Conflict
    conflict_res = client.post("/api/reservations", json=booking_payload)
    assert conflict_res.status_code == 409
    assert "already reserved" in conflict_res.json()["detail"].lower()

    # 5. Cancel reservation
    cancel_res = client.post(f"/api/reservations/{reservation_id}/cancel")
    assert cancel_res.status_code == 200
    assert cancel_res.json()["status"] == "cancelled"

    # 6. Verify slot is freed after cancellation
    slots_res3 = client.get(f"/api/chargers/{charger_id}/slots?date={date}")
    slots3 = slots_res3.json()
    freed_slot = next(s for s in slots3 if s["time_range"] == time_slot)
    assert freed_slot["is_available"] is True
