"""
app/api/v1/simulator.py

FastAPI router for UnnatE What-If Simulator.
Provides stateless, deterministic calculation endpoint comparing baseline and scenario assumptions.
"""

import logging
from fastapi import APIRouter, status
from app.schemas.simulator import SimulatorCalculateRequest, SimulatorCalculateResponse
from app.services.simulator_service import simulator_service

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/simulator", tags=["What-If Simulator"])


@router.post(
    "/calculate",
    response_model=SimulatorCalculateResponse,
    status_code=status.HTTP_200_OK,
    summary="Compute deterministic What-If financial metrics, deltas, and impact observations",
    description=(
        "Single source of truth for business simulation calculations. "
        "Deterministically evaluates revenue, variable/fixed costs, operating profit, "
        "reducing-balance debt servicing, and break-even points without AI/LLM intervention. "
        "Strictly isolated from external HCES and PwC research datasets."
    ),
)
def calculate_scenario(payload: SimulatorCalculateRequest) -> SimulatorCalculateResponse:
    """Execute stateless deterministic financial calculation."""
    return simulator_service.calculate_simulation(payload)
