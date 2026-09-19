from firebase.firestore import _in_memory_store

def test_telemetry_in_memory_and_fleet(client):
    # Live telemetry
    res = client.get("/api/telemetry/live?vehicle_id=EV-001")
    assert res.status_code == 200
    tel = res.json()
    assert tel["vehicle_id"] == "EV-001"
    assert "current_soc" in tel
    assert "charging_power_kw" in tel
    assert "battery_capacity_kwh" in tel
    assert "estimated_completion_time" in tel

    # Fleet telemetry
    fleet_res = client.get("/api/telemetry/fleet")
    assert fleet_res.status_code == 200
    fleet = fleet_res.json()
    assert len(fleet) >= 3
    vehicle_ids = [v["vehicle_id"] for v in fleet]
    assert "EV-001" in vehicle_ids
    assert "EV-002" in vehicle_ids
    assert "EV-003" in vehicle_ids

    # CRITICAL ARCHITECTURAL CHECK:
    # High-frequency telemetry MUST NOT be persisted into Firestore!
    assert "telemetry" not in _in_memory_store

def test_simulator_controls_and_physics(client):
    # Check status
    res = client.get("/api/simulator/status")
    assert res.status_code == 200
    status = res.json()
    assert "vehicles" in status
    assert len(status["vehicles"]) == 3

    # Speed multiplier (valid)
    speed_res = client.post("/api/simulator/speed", json={"speed": 15})
    assert speed_res.status_code == 200
    assert speed_res.json()["speed"] == 15

    # Speed multiplier (invalid)
    speed_err = client.post("/api/simulator/speed", json={"speed": 999})
    assert speed_err.status_code == 400

    # Override power
    p_res = client.post("/api/simulator/power", json={"vehicle_id": "EV-001", "power_kw": 8.5})
    assert p_res.status_code == 200
    assert p_res.json()["power_kw"] == 8.5

    # Unplug and plug
    unplug_res = client.post("/api/simulator/unplug", json={"vehicle_id": "EV-001"})
    assert unplug_res.status_code == 200
    assert unplug_res.json()["action"] == "unplugged"

    plug_res = client.post("/api/simulator/plug", json={"vehicle_id": "EV-001"})
    assert plug_res.status_code == 200
    assert plug_res.json()["action"] == "plugged"

    # Grid settings
    grid_res = client.post("/api/simulator/grid", json={
        "building_load_kw": 70.0,
        "solar_generation_kw": 25.0,
        "grid_limit_kw": 90.0
    })
    assert grid_res.status_code == 200
    grid_state = grid_res.json()["grid_state"]
    assert grid_state["building_load_kw"] == 70.0
    assert grid_state["solar_generation_kw"] == 25.0

    # Reset
    reset_res = client.post("/api/simulator/reset")
    assert reset_res.status_code == 200
