"""
app/schemas/hces.py

Pydantic schemas for official MoSPI Household Consumption Expenditure Survey (HCES) 2022-23.
"""

from typing import Optional, List, Dict, Any
from pydantic import BaseModel, ConfigDict, Field


class HcesStateMpceResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    state_id: Optional[int] = None
    state_name: str
    geographic_level: str
    survey_year: str
    estimate_type: str
    rural_mpce: float
    urban_mpce: float
    rural_urban_difference_pct: Optional[float] = None
    sample_households_rural: Optional[int] = None
    sample_households_urban: Optional[int] = None
    sample_households_total: Optional[int] = None
    estimated_households_rural_hundreds: Optional[int] = None
    estimated_households_urban_hundreds: Optional[int] = None
    source: str
    publisher: str
    survey_period: str
    methodology_notes: Optional[str] = None


class HcesConsumptionCategoryResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    survey_year: str
    estimate_type: str
    sector: str
    category_type: str
    item_group: str
    item_code: Optional[str] = None
    display_order: int
    mpce_amount: float
    share_percentage: float
    notes: Optional[str] = None
    source: str
    publisher: str


class HcesFractileResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    survey_year: str
    estimate_type: str
    sector: str
    fractile_class: str
    fractile_order: int
    mpce_amount: float
    source: str
    publisher: str


class HcesDemographicResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    survey_year: str
    estimate_type: str
    demographic_type: str
    group_name: str
    sector: str
    mpce_amount: float
    source: str
    publisher: str


class HcesSurveyMetadataResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    survey_name: str
    survey_year: str
    survey_period: str
    publisher: str
    coverage_summary: Optional[str] = None
    total_villages: Optional[int] = None
    total_urban_blocks: Optional[int] = None
    total_sample_households: Optional[int] = None
    rural_sample_households: Optional[int] = None
    urban_sample_households: Optional[int] = None
    methodology: Optional[str] = None
    imputation_methodology_notes: Optional[str] = None
    questionnaires: Optional[Any] = None
    metadata_info: Optional[Any] = None


class HcesMarketBenchmarkResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    geographic_level: str = "state_and_national_benchmarks"
    district_level_estimate_available: bool = False
    zero_district_fabrication_policy: str
    state_name: str
    estimate_type: str
    survey_year: str
    state_consumption_benchmark: Dict[str, Any]
    national_consumption_benchmark: Dict[str, Any]
    macro_consumption_shares: Dict[str, Any]
    non_food_consumption_context: str
    provenance: Dict[str, str]
