from services.optimizer_service import (
    BaseOptimizerClient,
    MockOptimizerClient,
    get_optimizer_client,
    set_optimizer_client,
)
from models.optimizer import OptimizationRequest, OptimizationResult

def test_optimizer_integration_endpoint_and_mock(client):
    req_data = {
        "vehicle_id": "EV-001",
        "current_soc": 45.0,
        "target_soc": 85.0,
        "battery_capacity_kwh": 75.0,
        "max_charging_power_kw": 11.0,
        "departure_time": "Tomorrow, 7:30 AM",
        "building_load_kw": 61.0,
        "grid_limit_kw": 85.0,
        "solar_kw": 18.0,
        "charging_preferences": {"charge_faster": False}
    }
    res = client.post("/api/optimizer/evaluate", json=req_data)
    assert res.status_code == 200
    data = res.json()
    assert data["vehicle_id"] == "EV-001"
    assert "recommended_charging_power_kw" in data
    assert "charging_action" in data
    assert "departure_guaranteed" in data
    assert "renewable_share" in data

def test_optimizer_hot_swap_capability(client):
    """
    Verifies that an external optimizer (e.g. built by teammate) can be plugged
    in cleanly via set_optimizer_client without modifying any caller or API code.
    """
    class FriendExternalOptimizer(BaseOptimizerClient):
        async def evaluate(self, request: OptimizationRequest) -> OptimizationResult:
            # Custom external optimizer behavior
            return OptimizationResult(
                vehicle_id=request.vehicle_id,
                recommended_charging_power_kw=9.9,
                charging_action="external_optimized",
                estimated_completion_time="5:15 AM",
                departure_guaranteed=True,
                departure_risk=False,
                reason="Friend's custom external optimizer executed",
                renewable_share=88.5,
                estimated_cost=55.0
            )

    # Swap to external client
    original_client = get_optimizer_client()
    try:
        set_optimizer_client(FriendExternalOptimizer())
        
        req_data = {
            "vehicle_id": "EV-002",
            "current_soc": 30.0,
            "target_soc": 90.0,
            "battery_capacity_kwh": 77.4,
            "max_charging_power_kw": 22.0,
            "departure_time": "Tomorrow, 8:00 AM",
            "building_load_kw": 50.0,
            "grid_limit_kw": 100.0,
            "solar_kw": 10.0,
            "charging_preferences": {"charge_faster": True}
        }
        res = client.post("/api/optimizer/evaluate", json=req_data)
        assert res.status_code == 200
        data = res.json()
        assert data["vehicle_id"] == "EV-002"
        assert data["recommended_charging_power_kw"] == 9.9
        assert data["charging_action"] == "external_optimized"
        assert "Friend's custom external optimizer" in data["reason"]
    finally:
        # Restore original mock client
        set_optimizer_client(original_client)
