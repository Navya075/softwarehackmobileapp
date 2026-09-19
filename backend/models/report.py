from pydantic import BaseModel

class MonthlyReportItem(BaseModel):
    month: str
    year: int = 2026
    total_sessions: int
    total_energy_kwh: float
    total_cost: float
    average_session_duration: str
    renewable_energy_kwh: float
    grid_energy_kwh: float
    renewable_share_percent: float
    departure_readiness_percent: float
    charge_faster_sessions: int = 2

class CarbonReportItem(BaseModel):
    month: str
    year: int = 2026
    total_kwh: float
    renewable_kwh: float
    grid_kwh: float
    renewable_share_percent: float
    co2_avoided_kg: float
    trees_equivalent: int
    gasoline_saved_litres: float
