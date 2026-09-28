"""
tests/test_simulator.py

Comprehensive test suite for UnnatE What-If Simulator.
Verifies deterministic financial calculations, reducing-balance debt servicing,
break-even logic, edge-case validation, observation neutrality,
correct labeling of 'Operating Profit', and strict isolation from external HCES/PwC datasets.
"""

import pytest
from fastapi.testclient import TestClient
from main import app
from app.schemas.simulator import SimulatorAssumptions, SimulatorCalculateRequest
from app.services.simulator_service import simulator_service

client = TestClient(app)


def test_normal_profitable_business():
    """Verify standard profitable business metrics."""
    assumptions = SimulatorAssumptions(
        monthly_customers=200,
        average_selling_price=500.0,
        variable_cost_per_unit=300.0,
        fixed_operating_costs=20000.0,
        marketing_expense=5000.0,
        initial_investment=100000.0,
        loan_amount=50000.0,
        annual_interest_rate=9.0,
        loan_tenure_months=24,
    )
    metrics = simulator_service.compute_metrics(assumptions)

    # Revenue = 200 * 500 = 100,000
    assert metrics.monthly_revenue == 100000.0
    # Variable cost = 200 * 300 = 60,000
    assert metrics.variable_costs == 60000.0
    # Fixed cost = 20,000 + 5,000 = 25,000
    assert metrics.fixed_costs == 25000.0
    # Total operating cost = 60,000 + 25,000 = 85,000
    assert metrics.total_operating_cost == 85000.0
    # Operating profit = 100,000 - 85,000 = 15,000
    assert metrics.operating_profit == 15000.0
    # Operating margin = 15%
    assert metrics.operating_margin_pct == 15.0
    # Unit CM = 500 - 300 = 200
    assert metrics.unit_contribution_margin == 200.0
    # CM ratio = 200 / 500 = 0.4
    assert metrics.contribution_margin_ratio == 0.4
    # Break-even customers = 25,000 / 200 = 125.0
    assert metrics.break_even_customers == 125.0
    # Break-even revenue = 25,000 / 0.4 = 62,500.0
    assert metrics.break_even_revenue == 62500.0
    assert metrics.is_break_even_achievable is True
    # EMI for 50,000 at 9% over 24 months = ~2,284.24
    assert metrics.monthly_loan_emi > 2280.0 and metrics.monthly_loan_emi < 2290.0
    # Cash remaining = Operating profit - EMI
    assert metrics.cash_remaining_after_loan == round(15000.0 - metrics.monthly_loan_emi, 2)


def test_price_increase_scenario():
    """Verify price increase raises revenue, margin, and lowers break-even volume."""
    base = SimulatorAssumptions(
        monthly_customers=100,
        average_selling_price=400.0,
        variable_cost_per_unit=250.0,
        fixed_operating_costs=10000.0,
    )
    scen = SimulatorAssumptions(
        monthly_customers=100,
        average_selling_price=500.0,  # +25% price
        variable_cost_per_unit=250.0,
        fixed_operating_costs=10000.0,
    )
    req = SimulatorCalculateRequest(baseline=base, scenario=scen)
    res = simulator_service.calculate_simulation(req)

    # Base revenue = 40,000; Scen revenue = 50,000 (+10,000, +25%)
    assert res.baseline_metrics.monthly_revenue == 40000.0
    assert res.scenario_metrics.monthly_revenue == 50000.0
    assert res.deltas["monthly_revenue"].absolute_change == 10000.0
    assert res.deltas["monthly_revenue"].percentage_change == 25.0

    # Break-even volume drops from 10,000 / 150 = 66.7 to 10,000 / 250 = 40.0
    assert res.baseline_metrics.break_even_customers == 66.7
    assert res.scenario_metrics.break_even_customers == 40.0
    assert res.deltas["break_even_customers"].absolute_change == -26.7


def test_customer_volume_increase():
    """Verify volume increase raises variable costs, revenue, and profit."""
    base = SimulatorAssumptions(
        monthly_customers=100,
        average_selling_price=200.0,
        variable_cost_per_unit=120.0,
        fixed_operating_costs=5000.0,
    )
    scen = SimulatorAssumptions(
        monthly_customers=150,  # +50% customers
        average_selling_price=200.0,
        variable_cost_per_unit=120.0,
        fixed_operating_costs=5000.0,
    )
    req = SimulatorCalculateRequest(baseline=base, scenario=scen)
    res = simulator_service.calculate_simulation(req)

    # Base profit = 20,000 - (12,000 + 5,000) = 3,000
    # Scen profit = 30,000 - (18,000 + 5,000) = 7,000 (+4,000, +133.33%)
    assert res.baseline_metrics.operating_profit == 3000.0
    assert res.scenario_metrics.operating_profit == 7000.0
    assert res.deltas["operating_profit"].absolute_change == 4000.0
    assert res.deltas["operating_profit"].percentage_change == 133.33


def test_variable_cost_increase_scenario():
    """Verify variable cost inflation erodes contribution margin and profit."""
    base = SimulatorAssumptions(
        monthly_customers=100,
        average_selling_price=500.0,
        variable_cost_per_unit=250.0,
        fixed_operating_costs=10000.0,
    )
    scen = SimulatorAssumptions(
        monthly_customers=100,
        average_selling_price=500.0,
        variable_cost_per_unit=350.0,  # Variable cost rises by 100/unit
        fixed_operating_costs=10000.0,
    )
    req = SimulatorCalculateRequest(baseline=base, scenario=scen)
    res = simulator_service.calculate_simulation(req)

    assert res.baseline_metrics.unit_contribution_margin == 250.0
    assert res.scenario_metrics.unit_contribution_margin == 150.0
    # Operating profit drops from 15,000 to 5,000 (-10,000)
    assert res.deltas["operating_profit"].absolute_change == -10000.0


def test_fixed_cost_increase_scenario():
    """Verify fixed cost increases raise break-even volume while unit CM is unchanged."""
    base = SimulatorAssumptions(
        monthly_customers=200,
        average_selling_price=100.0,
        variable_cost_per_unit=60.0,
        fixed_operating_costs=4000.0,
    )
    scen = SimulatorAssumptions(
        monthly_customers=200,
        average_selling_price=100.0,
        variable_cost_per_unit=60.0,
        fixed_operating_costs=6000.0,  # +2000 fixed overhead
    )
    req = SimulatorCalculateRequest(baseline=base, scenario=scen)
    res = simulator_service.calculate_simulation(req)

    # Unit CM = 40.0 for both
    assert res.baseline_metrics.unit_contribution_margin == 40.0
    assert res.scenario_metrics.unit_contribution_margin == 40.0
    # Break-even shifts from 4000/40 = 100.0 to 6000/40 = 150.0
    assert res.baseline_metrics.break_even_customers == 100.0
    assert res.scenario_metrics.break_even_customers == 150.0
    assert res.deltas["break_even_customers"].absolute_change == 50.0


def test_loan_repayment_reducing_balance():
    """Verify standard loan compounding reducing-balance formula."""
    # ₹1,00,000 loan at 12% annual interest for 12 months
    emi = simulator_service.calculate_emi(100000.0, 12.0, 12)
    # Standard formula for 100,000, 1% monthly rate, 12 periods:
    # 100000 * 0.01 * (1.01)^12 / ((1.01)^12 - 1) = 8,884.88
    assert round(emi, 2) == 8884.88


def test_zero_interest_loan_concession():
    """Verify zero-interest loan linear amortization without math domain errors."""
    emi = simulator_service.calculate_emi(60000.0, 0.0, 12)
    assert emi == 5000.0

    # Negative rate handled as 0%
    emi_neg = simulator_service.calculate_emi(60000.0, -5.0, 12)
    assert emi_neg == 5000.0


def test_break_even_unachievable_when_margin_non_positive():
    """Verify break-even correctly marks unachievable when selling price <= variable cost."""
    # Selling price equals variable cost
    zero_margin = SimulatorAssumptions(
        monthly_customers=50,
        average_selling_price=100.0,
        variable_cost_per_unit=100.0,
        fixed_operating_costs=5000.0,
    )
    metrics_zero = simulator_service.compute_metrics(zero_margin)
    assert metrics_zero.is_break_even_achievable is False
    assert metrics_zero.break_even_customers is None
    assert metrics_zero.break_even_revenue is None

    # Variable cost exceeds selling price
    negative_margin = SimulatorAssumptions(
        monthly_customers=50,
        average_selling_price=80.0,
        variable_cost_per_unit=100.0,
        fixed_operating_costs=5000.0,
    )
    metrics_neg = simulator_service.compute_metrics(negative_margin)
    assert metrics_neg.is_break_even_achievable is False
    assert metrics_neg.break_even_customers is None
    assert metrics_neg.break_even_revenue is None


def test_zero_and_edge_case_inputs():
    """Verify edge cases like 0 customers, 0 price, 0 loan amount, 0 tenure."""
    zero_assumptions = SimulatorAssumptions(
        monthly_customers=0,
        average_selling_price=0.0,
        variable_cost_per_unit=0.0,
        fixed_operating_costs=0.0,
        marketing_expense=0.0,
        initial_investment=0.0,
        loan_amount=0.0,
        annual_interest_rate=0.0,
        loan_tenure_months=0,
    )
    metrics = simulator_service.compute_metrics(zero_assumptions)
    assert metrics.monthly_revenue == 0.0
    assert metrics.total_operating_cost == 0.0
    assert metrics.operating_profit == 0.0
    assert metrics.operating_margin_pct == 0.0
    assert metrics.monthly_loan_emi == 0.0
    assert metrics.cash_remaining_after_loan == 0.0
    assert metrics.is_break_even_achievable is False


def test_scenario_identical_to_baseline():
    """Verify identical baseline and scenario produces zero deltas and neutral observations."""
    same = SimulatorAssumptions(
        monthly_customers=80,
        average_selling_price=250.0,
        variable_cost_per_unit=150.0,
        fixed_operating_costs=4000.0,
    )
    req = SimulatorCalculateRequest(baseline=same, scenario=same)
    res = simulator_service.calculate_simulation(req)

    for k, delta in res.deltas.items():
        assert delta.absolute_change == 0.0

    # Observations should report unchanged revenue and costs
    assert any("remains unchanged" in o.message or "steady" in o.message for o in res.observations)


def test_operating_profit_label_strictness():
    """Verify Operating Profit is labeled strictly as 'operating_profit' and NOT EBITDA."""
    assumptions = SimulatorAssumptions(
        monthly_customers=100,
        average_selling_price=300.0,
        variable_cost_per_unit=150.0,
        fixed_operating_costs=5000.0,
    )
    metrics = simulator_service.compute_metrics(assumptions)

    # Check field existence
    assert hasattr(metrics, "operating_profit")
    assert not hasattr(metrics, "ebitda")
    assert not hasattr(metrics, "operating_profit_ebitda")

    data = metrics.model_dump()
    assert "operating_profit" in data
    assert "ebitda" not in data


def test_isolation_from_hces_and_pwc():
    """
    Verify that contextual metadata (state, district, sector) cannot alter
    financial calculation results for identical financial assumptions.
    """
    assumptions = SimulatorAssumptions(
        monthly_customers=150,
        average_selling_price=400.0,
        variable_cost_per_unit=220.0,
        fixed_operating_costs=8000.0,
        loan_amount=20000.0,
        annual_interest_rate=8.5,
        loan_tenure_months=12,
    )

    # Request A: Uttar Pradesh / Food
    req_a = SimulatorCalculateRequest(
        baseline=assumptions,
        scenario=assumptions,
        state_name="Uttar Pradesh",
        district_name="Varanasi",
        sector="Food",
        is_rural=True,
    )
    res_a = simulator_service.calculate_simulation(req_a)

    # Request B: Karnataka / IT Services
    req_b = SimulatorCalculateRequest(
        baseline=assumptions,
        scenario=assumptions,
        state_name="Karnataka",
        district_name="Bengaluru Urban",
        sector="IT Services",
        is_rural=False,
    )
    res_b = simulator_service.calculate_simulation(req_b)

    # Both must compute identical mathematical numbers regardless of external geography/sector
    assert res_a.baseline_metrics.monthly_revenue == res_b.baseline_metrics.monthly_revenue
    assert res_a.baseline_metrics.operating_profit == res_b.baseline_metrics.operating_profit
    assert res_a.baseline_metrics.monthly_loan_emi == res_b.baseline_metrics.monthly_loan_emi
    assert res_a.baseline_metrics.break_even_customers == res_b.baseline_metrics.break_even_customers


def test_observation_neutrality_no_subjective_adjectives():
    """
    Verify that generated observations avoid subjective adjectives
    (no 'Excellent', 'Poor', 'Best', 'Bad', 'Winner', 'Recommended', 'Attractive', 'Unattractive').
    """
    # Subjective evaluative words explicitly forbidden by user prompt
    forbidden_words = [
        "excellent", "poor", "best", "bad", "winner", "recommended",
        "attractive", "unattractive", "terrible", "disastrous", "fantastic"
    ]

    base = SimulatorAssumptions(
        monthly_customers=100,
        average_selling_price=200.0,
        variable_cost_per_unit=120.0,
        fixed_operating_costs=5000.0,
    )
    # High profit scenario
    scen_super = SimulatorAssumptions(
        monthly_customers=500,
        average_selling_price=400.0,
        variable_cost_per_unit=100.0,
        fixed_operating_costs=5000.0,
    )
    res_super = simulator_service.calculate_simulation(
        SimulatorCalculateRequest(baseline=base, scenario=scen_super)
    )

    import re
    for o in res_super.observations:
        for forbidden in forbidden_words:
            assert not re.search(rf"\b{forbidden}\b", o.message, re.IGNORECASE), (
                f"Forbidden subjective word '{forbidden}' found in observation: {o.message}"
            )

    # Loss scenario
    scen_loss = SimulatorAssumptions(
        monthly_customers=20,
        average_selling_price=80.0,
        variable_cost_per_unit=150.0,
        fixed_operating_costs=15000.0,
    )
    res_loss = simulator_service.calculate_simulation(
        SimulatorCalculateRequest(baseline=base, scenario=scen_loss)
    )

    for o in res_loss.observations:
        for forbidden in forbidden_words:
            assert not re.search(rf"\b{forbidden}\b", o.message, re.IGNORECASE), (
                f"Forbidden subjective word '{forbidden}' found in observation: {o.message}"
            )


def test_api_endpoint_calculate():
    """Verify HTTP POST /api/v1/simulator/calculate endpoint."""
    payload = {
        "baseline": {
            "monthly_customers": 100,
            "average_selling_price": 500.0,
            "variable_cost_per_unit": 250.0,
            "fixed_operating_costs": 10000.0,
            "marketing_expense": 2000.0,
            "initial_investment": 50000.0,
            "loan_amount": 30000.0,
            "annual_interest_rate": 10.0,
            "loan_tenure_months": 12,
        },
        "scenario": {
            "monthly_customers": 120,
            "average_selling_price": 550.0,
            "variable_cost_per_unit": 260.0,
            "fixed_operating_costs": 10000.0,
            "marketing_expense": 3000.0,
            "initial_investment": 50000.0,
            "loan_amount": 30000.0,
            "annual_interest_rate": 10.0,
            "loan_tenure_months": 12,
        },
        "sector": "Retail",
        "state_name": "Maharashtra",
        "district_name": "Pune",
        "is_rural": False,
    }

    response = client.post("/api/v1/simulator/calculate", json=payload)
    assert response.status_code == 200
    data = response.json()

    assert "baseline_metrics" in data
    assert "scenario_metrics" in data
    assert "deltas" in data
    assert "observations" in data
    assert "calculation_metadata" in data

    # Revenue checks
    # Base: 100 * 500 = 50,000
    # Scen: 120 * 550 = 66,000
    assert data["baseline_metrics"]["monthly_revenue"] == 50000.0
    assert data["scenario_metrics"]["monthly_revenue"] == 66000.0
    assert data["deltas"]["monthly_revenue"]["absolute_change"] == 16000.0
    assert data["deltas"]["monthly_revenue"]["percentage_change"] == 32.0

    # Ensure Operating Profit is strictly named
    assert "operating_profit" in data["baseline_metrics"]
    assert "ebitda" not in str(data).lower() or "ebitda" not in data["baseline_metrics"]


def test_frontend_delegates_to_backend_without_independent_calculation():
    """
    Verify that frontend simulator/page.tsx does NOT perform independent local financial calculations,
    strictly calls the backend calculate endpoint, does not use EBITDA, and does not hardcode HCES values.
    """
    from pathlib import Path
    page_path = Path("frontend/app/simulator/page.tsx")
    assert page_path.exists(), "frontend/app/simulator/page.tsx must exist"

    content = page_path.read_text(encoding="utf-8")

    # 1. Frontend calls /api/simulator/calculate
    assert "/api/simulator/calculate" in content, "Frontend must delegate to /api/simulator/calculate"

    # 2. Frontend uses calculationResult from backend for all displayed metrics
    assert "calculationResult.baseline_metrics.monthly_revenue" in content
    assert "calculationResult.scenario_metrics.monthly_revenue" in content
    assert "calculationResult.baseline_metrics.operating_profit" in content
    assert "calculationResult.scenario_metrics.operating_profit" in content
    assert "calculationResult.baseline_metrics.monthly_loan_emi" in content
    assert "calculationResult.scenario_metrics.monthly_loan_emi" in content

    # 3. No EBITDA in page
    assert "ebitda" not in content.lower(), "EBITDA terminology is forbidden; use Operating Profit"

    # 4. No local EMI compounding formula in frontend
    assert "Math.pow" not in content, "Frontend must not duplicate reducing-balance loan formula"

    # 5. HCES values are dynamic from hcesData, not hardcoded
    assert "hcesData.rural_mpce" in content
    assert "hcesData.urban_mpce" in content

