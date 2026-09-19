"""
OPTIMIZER INTEGRATION SERVICE & ADAPTER INTERFACE

CRITICAL BOUNDARY:
DO NOT IMPLEMENT THE OPTIMIZATION ALGORITHM HERE.
The optimization engine (peak-shaving, building demand optimization, EV prioritization,
dynamic scheduling, AI optimizer) is developed externally by a teammate.

This module provides the clean client interface contract (`BaseOptimizerClient`)
and a simple placeholder client (`MockOptimizerClient`) for testing the transport
and platform flow before the real engine is plugged in.
"""

from abc import ABC, abstractmethod
import logging
from models.optimizer import OptimizationRequest, OptimizationResult

logger = logging.getLogger("voltflow.optimizer")

class BaseOptimizerClient(ABC):
    """
    Abstract contract for the Optimization Engine.
    All external optimizer integrations (Friend's Optimizer, REST microservice, gRPC, etc.)
    must implement this evaluate method.
    """
    @abstractmethod
    async def evaluate(self, request: OptimizationRequest) -> OptimizationResult:
        """
        Accept an OptimizationRequest and return an OptimizationResult.
        DO NOT put internal optimization algorithm logic in this interface.
        """
        pass

class MockOptimizerClient(BaseOptimizerClient):
    """
    DEMO ONLY — REPLACE WITH EXTERNAL OPTIMIZER.
    
    This is a contract verification placeholder only.
    It contains ZERO peak shaving, ZERO load balancing, ZERO EV prioritization,
    ZERO dynamic scheduling, and ZERO AI optimization logic.
    
    It simply echoes a valid structured OptimizationResult with the current power
    so the platform, WebSocket, and telemetry flows can be verified end-to-end.
    """
    async def evaluate(self, request: OptimizationRequest) -> OptimizationResult:
        logger.info(
            "[MockOptimizerClient] Received OptimizationRequest for vehicle %s. "
            "(DEMO ONLY — awaiting external optimizer)",
            request.vehicle_id
        )
        
        # Simple contract placeholder: maintains current power or caps to max power
        power = min(request.max_charging_power_kw, 3.2)
        
        return OptimizationResult(
            vehicle_id=request.vehicle_id,
            recommended_charging_power_kw=power,
            charging_action="continue",
            estimated_completion_time="6:42 AM",
            departure_guaranteed=True,
            departure_risk=False,
            reason="Placeholder response: charging scheduled normally (awaiting external optimizer)",
            renewable_share=68.0,
            estimated_cost=74.0
        )

# Factory/Singleton provider to allow swapping to FriendOptimizerClient
_optimizer_client: BaseOptimizerClient = MockOptimizerClient()

def get_optimizer_client() -> BaseOptimizerClient:
    """Returns the configured optimizer client instance."""
    return _optimizer_client

def set_optimizer_client(client: BaseOptimizerClient):
    """Hot-swap to external optimizer implementation without altering other services."""
    global _optimizer_client
    _optimizer_client = client
    logger.info("Optimizer client replaced with: %s", type(client).__name__)
