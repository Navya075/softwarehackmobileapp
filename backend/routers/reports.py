from fastapi import APIRouter, Depends, Query
from firebase.auth import get_current_user, AuthUser
from services.report_service import ReportService
from models.report import MonthlyReportItem, CarbonReportItem

router = APIRouter(prefix="/reports", tags=["Reports"])

@router.get("/monthly", response_model=MonthlyReportItem)
async def get_monthly_report(
    month: str = Query("September", description="Month name"),
    year: int = Query(2026, description="Year"),
    current_user: AuthUser = Depends(get_current_user)
):
    """Returns monthly energy consumption, costs, and departure readiness rate."""
    return await ReportService.get_monthly_report(current_user.uid, month, year)

@router.get("/carbon", response_model=CarbonReportItem)
async def get_carbon_report(
    month: str = Query("September", description="Month name"),
    year: int = Query(2026, description="Year"),
    current_user: AuthUser = Depends(get_current_user)
):
    """Returns environmental impact metrics (CO2 avoided, trees equivalent, gasoline saved)."""
    return await ReportService.get_carbon_report(current_user.uid, month, year)
