"""
app/api/v1/hces.py

FastAPI router for MoSPI Household Consumption Expenditure Survey (HCES) 2022-23 data.
Provides official State and National consumption expenditure benchmarks, fractiles,
and consumption shares for UnnatE's analytical engine.
"""

import logging
from typing import Optional, List, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.services.hces_service import hces_service
from app.schemas.hces import (
    HcesStateMpceResponse,
    HcesConsumptionCategoryResponse,
    HcesFractileResponse,
    HcesDemographicResponse,
    HcesSurveyMetadataResponse,
    HcesMarketBenchmarkResponse,
)

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/research/hces", tags=["HCES Consumption Intelligence"])


@router.get(
    "/state/{state_name}",
    response_model=HcesStateMpceResponse,
    status_code=status.HTTP_200_OK,
    summary="Get official HCES 2022-23 State/UT MPCE benchmark",
)
def get_state_mpce(
    state_name: str,
    estimate_type: str = Query(
        "without_imputation",
        pattern="^(without_imputation|with_imputation)$",
        description="'without_imputation' (traditional NSS) or 'with_imputation' (social welfare items)"
    ),
    db: Session = Depends(get_db),
) -> HcesStateMpceResponse:
    data = hces_service.get_state_mpce(db, state_name=state_name, estimate_type=estimate_type)
    if not data:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"HCES MPCE data not found for state '{state_name}' with estimate_type='{estimate_type}'.",
        )
    return HcesStateMpceResponse(**data)


@router.get(
    "/national",
    response_model=HcesStateMpceResponse,
    status_code=status.HTTP_200_OK,
    summary="Get official All-India national MPCE benchmark",
)
def get_national_mpce(
    estimate_type: str = Query(
        "without_imputation",
        pattern="^(without_imputation|with_imputation)$",
        description="'without_imputation' or 'with_imputation'"
    ),
    db: Session = Depends(get_db),
) -> HcesStateMpceResponse:
    data = hces_service.get_national_mpce(db, estimate_type=estimate_type)
    if not data:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="National HCES MPCE data not found.",
        )
    return HcesStateMpceResponse(**data)


@router.get(
    "/basket",
    response_model=List[HcesConsumptionCategoryResponse],
    status_code=status.HTTP_200_OK,
    summary="Get 24 major consumption item groups and expenditure shares",
)
def get_consumption_basket(
    sector: Optional[str] = Query(None, pattern="^(rural|urban)$", description="Filter by sector ('rural' or 'urban')"),
    estimate_type: str = Query("without_imputation", pattern="^(without_imputation|with_imputation)$"),
    db: Session = Depends(get_db),
) -> List[HcesConsumptionCategoryResponse]:
    rows = hces_service.get_consumption_basket(db, sector=sector, estimate_type=estimate_type)
    return [HcesConsumptionCategoryResponse(**r) for r in rows]


@router.get(
    "/fractiles",
    response_model=List[HcesFractileResponse],
    status_code=status.HTTP_200_OK,
    summary="Get MPCE fractile distribution (12 classes + All Classes)",
)
def get_fractiles(
    sector: Optional[str] = Query(None, pattern="^(rural|urban)$", description="Filter by sector ('rural' or 'urban')"),
    estimate_type: str = Query("without_imputation", pattern="^(without_imputation|with_imputation)$"),
    db: Session = Depends(get_db),
) -> List[HcesFractileResponse]:
    rows = hces_service.get_fractile_distribution(db, sector=sector, estimate_type=estimate_type)
    return [HcesFractileResponse(**r) for r in rows]


@router.get(
    "/demographics",
    response_model=List[HcesDemographicResponse],
    status_code=status.HTTP_200_OK,
    summary="Get MPCE averages by household occupation type and social group",
)
def get_demographics(
    demographic_type: Optional[str] = Query(None, pattern="^(household_type|social_group)$"),
    sector: Optional[str] = Query(None, pattern="^(rural|urban)$"),
    estimate_type: str = Query("without_imputation", pattern="^(without_imputation|with_imputation)$"),
    db: Session = Depends(get_db),
) -> List[HcesDemographicResponse]:
    rows = hces_service.get_demographic_mpce(db, demographic_type=demographic_type, sector=sector, estimate_type=estimate_type)
    return [HcesDemographicResponse(**r) for r in rows]


@router.get(
    "/metadata",
    response_model=HcesSurveyMetadataResponse,
    status_code=status.HTTP_200_OK,
    summary="Get official HCES 2022-23 survey methodology and metadata",
)
def get_survey_metadata(db: Session = Depends(get_db)) -> HcesSurveyMetadataResponse:
    data = hces_service.get_survey_metadata(db)
    if not data:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="HCES survey metadata not found.",
        )
    return HcesSurveyMetadataResponse(**data)


@router.get(
    "/benchmarks/{state_name}",
    response_model=HcesMarketBenchmarkResponse,
    status_code=status.HTTP_200_OK,
    summary="Get combined state & national consumption benchmarks for market analysis",
)
def get_market_benchmarks(
    state_name: str,
    estimate_type: str = Query("without_imputation", pattern="^(without_imputation|with_imputation)$"),
    db: Session = Depends(get_db),
) -> HcesMarketBenchmarkResponse:
    data = hces_service.get_market_consumption_benchmarks(db, state_name=state_name, estimate_type=estimate_type)
    return HcesMarketBenchmarkResponse(**data)
