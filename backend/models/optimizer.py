"""
EXTERNAL OPTIMIZER INTEGRATION CONTRACT

DO NOT IMPLEMENT THE OPTIMIZATION ALGORITHM HERE.
This module defines the exact input and output data contract for the separate
Optimization Engine developed by the optimization team.
"""

from typing import Dict, Any, List, Optional
from pydantic import BaseModel, Field

class OptimizationRequest(BaseModel):
    """
    Input schema sent to the external optimizer.
    Contains all physical state, constraints, and user preferences.
    """
    vehicle_id: str
    current_soc: float = Field(..., ge=0, le=100, description="Current battery State of Charge %")
    target_soc: float = Field(..., ge=0, le=100, description="Target battery State of Charge %")
    battery_capacity_kwh: float = Field(..., description="Total battery capacity in kWh")
    max_charging_power_kw: float = Field(..., description="Max charger/onboard inverter AC/DC power in kW")
    departure_time: str = Field(..., description="Target departure deadline, e.g. 'Tomorrow, 7:30 AM'")
    building_load_kw: float = Field(..., description="Current building non-EV baseline electrical load in kW")
    grid_limit_kw: float = Field(..., description="Substation/transformer maximum grid power capacity in kW")
    solar_kw: float = Field(default=0.0, description="Current local solar generation in kW")
    current_ev_load_kw: float = Field(default=0.0, description="Total aggregated EV load currently charging in kW")
    charging_preferences: Dict[str, Any] = Field(
        default_factory=dict,
        description="User charging preferences (prefer_renewable, prefer_lower_cost, emergency_charging, etc.)"
    )
    other_vehicle_states: Optional[List[Dict[str, Any]]] = Field(
        default=None,
        description="Optional list of other active fleet/community vehicles competing for capacity"
    )

class OptimizationResult(BaseModel):
    """
    Output schema returned by the external optimizer.
    Consumed by the backend to dispatch commands to vehicles/chargers.
    """
    vehicle_id: str
    recommended_charging_power_kw: float = Field(
        ...,
        description="Optimized power setpoint to dispatch to charger/vehicle in kW"
    )
    charging_action: str = Field(
        default="continue",
        description="Action keyword: 'continue' | 'slow_down' | 'pause' | 'boost'"
    )
    estimated_completion_time: str = Field(
        ...,
        description="Estimated completion time under this plan, e.g. '6:42 AM'"
    )
    departure_guaranteed: bool = Field(
        default=True,
        description="True if target SOC will be satisfied before departure time"
    )
    departure_risk: bool = Field(
        default=False,
        description="True if constraints prevent reaching target SOC before departure"
    )
    reason: str = Field(
        ...,
        description="Human-friendly explanation for the decision (e.g. 'Charging slowed to prevent building peak')"
    )
    renewable_share: float = Field(
        default=0.0,
        description="Estimated percentage of solar/renewable energy used in this session"
    )
    estimated_cost: float = Field(
        default=0.0,
        description="Estimated cost in local currency units (INR/USD)"
    )
