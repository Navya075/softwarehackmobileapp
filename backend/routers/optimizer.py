from fastapi import APIRouter
from models.optimizer import OptimizationRequest, OptimizationResult
from services.optimizer_service import get_optimizer_client

router = APIRouter(prefix="/optimizer", tags=["Optimizer Integration"])

@router.post("/evaluate", response_model=OptimizationResult)
async def evaluate_optimization(request: OptimizationRequest):
    """
    HOT-SWAPPABLE OPTIMIZER INTEGRATION CONTRACT ENDPOINT.
    
    Accepts an OptimizationRequest DTO and returns an OptimizationResult DTO.
    Currently delegates to the registered BaseOptimizerClient.
    When the external optimization engine is ready, set_optimizer_client(external_client)
    will route all calls to the friend's algorithm without modifying caller code.
    """
    client = get_optimizer_client()
    return await client.evaluate(request)
