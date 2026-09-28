"""
app/schemas/simulator.py

Pydantic schemas for UnnatE What-If Simulator.
Deterministic, stateless contract for business assumption changes and financial impact modeling.
"""

from typing import Dict, List, Optional
from pydantic import BaseModel, Field


class SimulatorAssumptions(BaseModel):
    """Business input assumptions for a single scenario (baseline or proposed)."""

    monthly_customers: int = Field(
        ...,
        ge=0,
        description="Number of monthly paying customers or completed transactions",
    )
    average_selling_price: float = Field(
        ...,
        ge=0.0,
        description="Average selling price or revenue per transaction in INR (₹)",
    )
    variable_cost_per_unit: float = Field(
        ...,
        ge=0.0,
        description="Variable cost incurred per transaction/unit in INR (₹)",
    )
    fixed_operating_costs: float = Field(
        ...,
        ge=0.0,
        description="Monthly recurring fixed operating expenses (rent, utilities, baseline salaries) in INR (₹)",
    )
    marketing_expense: float = Field(
        default=0.0,
        ge=0.0,
        description="Monthly marketing, promotional, and customer acquisition expenditure in INR (₹)",
    )
    initial_investment: float = Field(
        default=0.0,
        ge=0.0,
        description="Capital expenditure or promoter investment outlay in INR (₹)",
    )
    loan_amount: float = Field(
        default=0.0,
        ge=0.0,
        description="Total debt/borrowing principal in INR (₹)",
    )
    annual_interest_rate: float = Field(
        default=0.0,
        ge=0.0,
        le=100.0,
        description="Annual interest rate in percentage (% p.a.)",
    )
    loan_tenure_months: int = Field(
        default=0,
        ge=0,
        le=360,
        description="Loan repayment tenure in months",
    )


class SimulatorFinancialMetrics(BaseModel):
    """Deterministic financial metrics computed strictly by the backend engine."""

    monthly_revenue: float = Field(..., description="Monthly gross sales revenue in INR (₹)")
    variable_costs: float = Field(..., description="Monthly total variable operating costs in INR (₹)")
    fixed_costs: float = Field(..., description="Monthly total fixed operating costs including marketing in INR (₹)")
    marketing_expense: float = Field(..., description="Monthly marketing expenditure in INR (₹)")
    total_operating_cost: float = Field(..., description="Total monthly operating expenses (Variable + Fixed) in INR (₹)")
    operating_profit: float = Field(
        ...,
        description="Monthly operating profit (Revenue - Total Operating Costs) in INR (₹). Strictly labeled Operating Profit.",
    )
    operating_margin_pct: float = Field(..., description="Operating profit margin as percentage of revenue (%)")
    monthly_loan_emi: float = Field(..., description="Monthly reducing-balance loan repayment installment (EMI) in INR (₹)")
    cash_remaining_after_loan: float = Field(
        ...,
        description="Net cash flow remaining after operating expenses and monthly debt servicing (Operating Profit - Loan EMI) in INR (₹)",
    )
    unit_contribution_margin: float = Field(
        ...,
        description="Unit contribution margin (Selling Price - Variable Cost per unit) in INR (₹)",
    )
    contribution_margin_ratio: float = Field(
        ...,
        description="Contribution margin ratio ((Selling Price - Variable Cost) / Selling Price)",
    )
    break_even_customers: Optional[float] = Field(
        default=None,
        description="Number of monthly transactions required to cover fixed operating costs. None if unachievable.",
    )
    break_even_revenue: Optional[float] = Field(
        default=None,
        description="Monthly sales revenue required to cover fixed operating costs in INR (₹). None if unachievable.",
    )
    is_break_even_achievable: bool = Field(
        ...,
        description="True if unit contribution margin is positive and covers fixed costs.",
    )


class SimulatorMetricDelta(BaseModel):
    """Mathematical difference between Scenario and Baseline for a given metric."""

    metric_key: str = Field(..., description="Identifier of the metric")
    metric_name: str = Field(..., description="Human-readable title of the metric")
    baseline_value: float = Field(..., description="Baseline value")
    scenario_value: float = Field(..., description="Scenario value")
    absolute_change: float = Field(..., description="Scenario value minus baseline value")
    percentage_change: Optional[float] = Field(
        default=None,
        description="Percentage change relative to baseline ((Scenario - Baseline) / |Baseline| * 100). None if baseline is zero.",
    )
    percentage_points_change: Optional[float] = Field(
        default=None,
        description="Direct difference in percentage points (for margin metrics)",
    )


class SimulatorImpactObservation(BaseModel):
    """Deterministic, objective analytical finding derived strictly from metric variances."""

    category: str = Field(..., description="Category: revenue | cost | profit | break_even | debt_service")
    message: str = Field(..., description="Purely factual, objective observation without subjective labels")
    direction: str = Field(..., description="Directional indicator: positive | negative | neutral")


class SimulatorCalculateRequest(BaseModel):
    """Request payload for deterministic What-If simulation."""

    baseline: SimulatorAssumptions = Field(..., description="Current baseline operational assumptions")
    scenario: SimulatorAssumptions = Field(..., description="Proposed what-if scenario assumptions")
    # Contextual metadata (passed for logging/reference only; strictly isolated from math)
    sector: Optional[str] = Field(default=None, description="Business sector / domain")
    sub_type: Optional[str] = Field(default=None, description="Specific trade / sub-type")
    state_name: Optional[str] = Field(default=None, description="State / UT")
    district_name: Optional[str] = Field(default=None, description="District")
    is_rural: Optional[bool] = Field(default=None, description="Rural or urban classification")


class SimulatorCalculateResponse(BaseModel):
    """Response payload containing verified metrics, comparison deltas, and observations."""

    baseline_metrics: SimulatorFinancialMetrics = Field(..., description="Calculated baseline metrics")
    scenario_metrics: SimulatorFinancialMetrics = Field(..., description="Calculated scenario metrics")
    deltas: Dict[str, SimulatorMetricDelta] = Field(..., description="Map of metric variances")
    observations: List[SimulatorImpactObservation] = Field(..., description="Deterministic factual observations")
    calculation_metadata: Dict[str, str] = Field(
        default_factory=dict,
        description="Formulas and methodology disclosure",
    )
