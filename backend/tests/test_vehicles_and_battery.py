def test_vehicle_crud(client):
    # List vehicles (should return default EV-001 for demo user)
    res = client.get("/api/vehicles")
    assert res.status_code == 200
    vehicles = res.json()
    assert len(vehicles) >= 1
    v0 = vehicles[0]
    assert v0["vehicle_id"] == "EV-001"
    assert v0["battery_capacity_kwh"] == 75.0

    # Create new vehicle
    new_v = {
        "manufacturer": "Hyundai",
        "model": "Ioniq 5",
        "variant": "Long Range AWD",
        "year": 2024,
        "battery_capacity_kwh": 77.4,
        "usable_battery_capacity_kwh": 74.0,
        "battery_health_percent": 98.0,
        "max_charging_power_kw": 11.0,
        "connector": "CCS2"
    }
    create_res = client.post("/api/vehicles", json=new_v)
    assert create_res.status_code == 201
    created = create_res.json()
    vid = created["vehicle_id"]
    assert vid.startswith("EV-")
    assert created["model"] == "Ioniq 5"

    # Get single vehicle
    get_res = client.get(f"/api/vehicles/{vid}")
    assert get_res.status_code == 200
    assert get_res.json()["vehicle_id"] == vid

    # Update vehicle
    put_res = client.put(f"/api/vehicles/{vid}", json={"target_soc": 90.0, "plugged_in": True})
    assert put_res.status_code == 200
    assert put_res.json()["target_soc"] == 90.0
    assert put_res.json()["plugged_in"] is True

    # Delete vehicle
    del_res = client.delete(f"/api/vehicles/{vid}")
    assert del_res.status_code == 204

    # Verify deleted
    verify_res = client.get(f"/api/vehicles/{vid}")
    assert verify_res.status_code == 404

def test_battery_health_separation_from_soc(client):
    # Retrieve battery health for EV-001
    res = client.get("/api/vehicles/EV-001/battery-health")
    assert res.status_code == 200
    health = res.json()
    
    # Check that battery health metrics are dedicated and present
    assert "battery_health_percent" in health
    assert "usable_capacity_kwh" in health
    assert "original_capacity_kwh" in health
    assert "degradation_percent" in health
    assert health["battery_health_percent"] == 94.0
    assert health["original_capacity_kwh"] == 75.0
    assert health["usable_capacity_kwh"] == 71.2
    assert health["degradation_percent"] >= 0.0
