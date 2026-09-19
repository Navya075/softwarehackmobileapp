from fastapi import APIRouter, Depends, HTTPException
from typing import List, Optional
from firebase.auth import get_current_user, AuthUser
from services.billing_service import BillingService
from models.billing import BillItem, BillingSummary

router = APIRouter(prefix="/billing", tags=["Billing"])

@router.get("/summary", response_model=BillingSummary)
async def get_billing_summary(current_user: AuthUser = Depends(get_current_user)):
    """Provides aggregated billing metrics and recent invoices."""
    return await BillingService.get_billing_summary(current_user.uid)

@router.get("/invoices", response_model=List[BillItem])
async def list_invoices(current_user: AuthUser = Depends(get_current_user)):
    """Lists all charging invoices/bills for the current user."""
    return await BillingService.get_user_bills(current_user.uid)

@router.get("/invoices/{bill_id}", response_model=BillItem)
async def get_invoice(bill_id: str, current_user: AuthUser = Depends(get_current_user)):
    """Retrieves single invoice item with detailed cost breakdown."""
    bill = await BillingService.get_bill(bill_id, current_user.uid)
    if not bill:
        raise HTTPException(status_code=404, detail="Invoice not found")
    return bill
