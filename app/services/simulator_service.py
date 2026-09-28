"""
app/services/simulator_service.py

Single authoritative source of truth for UnnatE What-If Simulator calculations.
Purely deterministic, transparent financial calculations without LLM or heuristics.
Completely isolated from HCES and PwC external research datasets.
"""

import math
from typing import Dict, List, Optional, Tuple
from app.schemas.simulator import (
    SimulatorAssumptions,
    SimulatorCalculateRequest,
    SimulatorCalculateResponse,
    SimulatorFinancialMetrics,
    SimulatorImpactObservation,
    SimulatorMetricDelta,
)


class SimulatorService:
    """Isolated, stateless calculation service for what-if financial modeling."""

    @classmethod
    def calculate_emi(
        cls,
        principal: float,
        annual_rate_pct: float,
        tenure_months: int,
    ) -> float:
        """
        Calculate monthly reducing-balance loan installment (EMI).
        Handles zero principal, zero tenure, and zero-interest concessions.
        """
        if principal <= 0.0 or tenure_months <= 0:
            return 0.0

        if annual_rate_pct <= 0.0:
            return round(principal / float(tenure_months), 2)

        monthly_rate = (annual_rate_pct / 100.0) / 12.0
        n = float(tenure_months)
        compound = math.pow(1.0 + monthly_rate, n)
        
        # Guard against zero division in extreme cases
        if compound <= 1.0:
            return round(principal / n, 2)

        emi = (principal * monthly_rate * compound) / (compound - 1.0)
        return round(emi, 2)

    @classmethod
    def compute_metrics(cls, a: SimulatorAssumptions) -> SimulatorFinancialMetrics:
        """Compute all verified operating metrics for a given assumption set."""
        monthly_revenue = round(float(a.monthly_customers) * a.average_selling_price, 2)
        variable_costs = round(float(a.monthly_customers) * a.variable_cost_per_unit, 2)
        fixed_costs = round(a.fixed_operating_costs + a.marketing_expense, 2)
        total_operating_cost = round(variable_costs + fixed_costs, 2)

        operating_profit = round(monthly_revenue - total_operating_cost, 2)
        operating_margin_pct = (
            round((operating_profit / monthly_revenue) * 100.0, 2)
            if monthly_revenue > 0.0
            else 0.0
        )

        monthly_loan_emi = cls.calculate_emi(
            principal=a.loan_amount,
            annual_rate_pct=a.annual_interest_rate,
            tenure_months=a.loan_tenure_months,
        )
        cash_remaining_after_loan = round(operating_profit - monthly_loan_emi, 2)

        unit_cm = round(a.average_selling_price - a.variable_cost_per_unit, 2)
        cm_ratio = (
            round(unit_cm / a.average_selling_price, 4)
            if a.average_selling_price > 0.0
            else 0.0
        )

        # Break-even determination
        is_break_even_achievable = unit_cm > 0.0
        if is_break_even_achievable:
            be_customers = round(fixed_costs / unit_cm, 1)
            be_revenue = round(fixed_costs / cm_ratio, 2) if cm_ratio > 0.0 else round(be_customers * a.average_selling_price, 2)
        else:
            be_customers = None
            be_revenue = None

        return SimulatorFinancialMetrics(
            monthly_revenue=monthly_revenue,
            variable_costs=variable_costs,
            fixed_costs=fixed_costs,
            marketing_expense=round(a.marketing_expense, 2),
            total_operating_cost=total_operating_cost,
            operating_profit=operating_profit,
            operating_margin_pct=operating_margin_pct,
            monthly_loan_emi=monthly_loan_emi,
            cash_remaining_after_loan=cash_remaining_after_loan,
            unit_contribution_margin=unit_cm,
            contribution_margin_ratio=cm_ratio,
            break_even_customers=be_customers,
            break_even_revenue=be_revenue,
            is_break_even_achievable=is_break_even_achievable,
        )

    @classmethod
    def compute_delta(
        cls,
        key: str,
        name: str,
        base_val: float,
        scen_val: float,
        is_percentage_metric: bool = False,
    ) -> SimulatorMetricDelta:
        """Compute verified mathematical difference between baseline and scenario values."""
        abs_change = round(scen_val - base_val, 2)
        pct_change = (
            round((abs_change / abs(base_val)) * 100.0, 2)
            if base_val != 0.0
            else None
        )
        pp_change = round(scen_val - base_val, 2) if is_percentage_metric else None

        return SimulatorMetricDelta(
            metric_key=key,
            metric_name=name,
            baseline_value=round(base_val, 2),
            scenario_value=round(scen_val, 2),
            absolute_change=abs_change,
            percentage_change=pct_change,
            percentage_points_change=pp_change,
        )

    @classmethod
    def generate_observations(
        cls,
        base: SimulatorFinancialMetrics,
        scen: SimulatorFinancialMetrics,
        deltas: Dict[str, SimulatorMetricDelta],
        base_assumptions: SimulatorAssumptions,
        scen_assumptions: SimulatorAssumptions,
    ) -> List[SimulatorImpactObservation]:
        """
        Generate strictly deterministic, objective observations based on calculated numbers.
        Avoids all subjective / evaluative labels (no 'Excellent', 'Poor', 'Best', 'Winner', etc.).
        """
        obs: List[SimulatorImpactObservation] = []

        # 1. Revenue observation
        rev_delta = deltas["monthly_revenue"]
        if rev_delta.absolute_change > 0:
            pct_str = f" (+{rev_delta.percentage_change}%)" if rev_delta.percentage_change is not None else ""
            obs.append(
                SimulatorImpactObservation(
                    category="revenue",
                    message=f"Monthly revenue increases by ₹{rev_delta.absolute_change:,.2f}{pct_str}.",
                    direction="positive",
                )
            )
        elif rev_delta.absolute_change < 0:
            pct_str = f" ({rev_delta.percentage_change}%)" if rev_delta.percentage_change is not None else ""
            obs.append(
                SimulatorImpactObservation(
                    category="revenue",
                    message=f"Monthly revenue decreases by ₹{abs(rev_delta.absolute_change):,.2f}{pct_str}.",
                    direction="negative",
                )
            )
        else:
            obs.append(
                SimulatorImpactObservation(
                    category="revenue",
                    message=f"Monthly revenue remains unchanged at ₹{base.monthly_revenue:,.2f}.",
                    direction="neutral",
                )
            )

        # 2. Operating Cost observation
        cost_delta = deltas["total_operating_cost"]
        if cost_delta.absolute_change > 0:
            pct_str = f" (+{cost_delta.percentage_change}%)" if cost_delta.percentage_change is not None else ""
            obs.append(
                SimulatorImpactObservation(
                    category="cost",
                    message=f"Operating costs increase by ₹{cost_delta.absolute_change:,.2f}{pct_str}.",
                    direction="negative",
                )
            )
        elif cost_delta.absolute_change < 0:
            pct_str = f" ({cost_delta.percentage_change}%)" if cost_delta.percentage_change is not None else ""
            obs.append(
                SimulatorImpactObservation(
                    category="cost",
                    message=f"Operating costs decrease by ₹{abs(cost_delta.absolute_change):,.2f}{pct_str}.",
                    direction="positive",
                )
            )
        else:
            obs.append(
                SimulatorImpactObservation(
                    category="cost",
                    message=f"Total operating costs remain unchanged at ₹{base.total_operating_cost:,.2f}.",
                    direction="neutral",
                )
            )

        # 3. Operating Profit & Margin observation
        profit_delta = deltas["operating_profit"]
        margin_delta = deltas["operating_margin_pct"]
        if profit_delta.absolute_change > 0:
            obs.append(
                SimulatorImpactObservation(
                    category="profit",
                    message=(
                        f"Monthly operating profit changes from ₹{base.operating_profit:,.2f} to ₹{scen.operating_profit:,.2f} "
                        f"(an increase of ₹{profit_delta.absolute_change:,.2f})."
                    ),
                    direction="positive",
                )
            )
        elif profit_delta.absolute_change < 0:
            obs.append(
                SimulatorImpactObservation(
                    category="profit",
                    message=(
                        f"Monthly operating profit changes from ₹{base.operating_profit:,.2f} to ₹{scen.operating_profit:,.2f} "
                        f"(a decrease of ₹{abs(profit_delta.absolute_change):,.2f})."
                    ),
                    direction="negative",
                )
            )
        else:
            obs.append(
                SimulatorImpactObservation(
                    category="profit",
                    message=f"Monthly operating profit remains steady at ₹{base.operating_profit:,.2f}.",
                    direction="neutral",
                )
            )

        if margin_delta.absolute_change != 0.0:
            pp = margin_delta.percentage_points_change or margin_delta.absolute_change
            sign = "+" if pp > 0 else ""
            obs.append(
                SimulatorImpactObservation(
                    category="profit",
                    message=(
                        f"Operating margin changes from {base.operating_margin_pct:.1f}% to {scen.operating_margin_pct:.1f}%, "
                        f"a change of {sign}{pp:.1f} percentage points."
                    ),
                    direction="positive" if pp > 0 else "negative",
                )
            )

        # 4. Break-even observation
        if not scen.is_break_even_achievable:
            obs.append(
                SimulatorImpactObservation(
                    category="break_even",
                    message=(
                        f"Break-even is unachievable in the scenario because variable cost per unit (₹{scen_assumptions.variable_cost_per_unit:,.2f}) "
                        f"is greater than or equal to selling price (₹{scen_assumptions.average_selling_price:,.2f})."
                    ),
                    direction="negative",
                )
            )
        elif not base.is_break_even_achievable and scen.is_break_even_achievable:
            obs.append(
                SimulatorImpactObservation(
                    category="break_even",
                    message=f"Break-even becomes achievable at {scen.break_even_customers} monthly transactions (₹{scen.break_even_revenue:,.2f} revenue).",
                    direction="positive",
                )
            )
        elif base.break_even_customers is not None and scen.break_even_customers is not None:
            be_diff = round(scen.break_even_customers - base.break_even_customers, 1)
            if be_diff != 0.0:
                obs.append(
                    SimulatorImpactObservation(
                        category="break_even",
                        message=f"Break-even volume changes from {base.break_even_customers} to {scen.break_even_customers} monthly transactions.",
                        direction="positive" if be_diff < 0 else "negative",
                    )
                )
            else:
                obs.append(
                    SimulatorImpactObservation(
                        category="break_even",
                        message=f"Break-even volume remains stable at {scen.break_even_customers} monthly transactions.",
                        direction="neutral",
                    )
                )

        # 5. Debt Service & Cash Remaining observation
        if scen.monthly_loan_emi > 0.0:
            obs.append(
                SimulatorImpactObservation(
                    category="debt_service",
                    message=(
                        f"Monthly loan servicing is ₹{scen.monthly_loan_emi:,.2f}, "
                        f"leaving ₹{scen.cash_remaining_after_loan:,.2f} after operating profit."
                    ),
                    direction="positive" if scen.cash_remaining_after_loan >= 0 else "negative",
                )
            )
        elif base.monthly_loan_emi > 0.0 and scen.monthly_loan_emi == 0.0:
            obs.append(
                SimulatorImpactObservation(
                    category="debt_service",
                    message=f"Eliminating debt servicing liabilities frees up ₹{base.monthly_loan_emi:,.2f}/month in cash flow.",
                    direction="positive",
                )
            )

        return obs

    @classmethod
    def calculate_simulation(cls, req: SimulatorCalculateRequest) -> SimulatorCalculateResponse:
        """Execute full stateless simulation comparing Baseline and Scenario."""
        base_metrics = cls.compute_metrics(req.baseline)
        scen_metrics = cls.compute_metrics(req.scenario)

        deltas: Dict[str, SimulatorMetricDelta] = {
            "monthly_revenue": cls.compute_delta(
                "monthly_revenue", "Monthly Revenue", base_metrics.monthly_revenue, scen_metrics.monthly_revenue
            ),
            "variable_costs": cls.compute_delta(
                "variable_costs", "Variable Costs", base_metrics.variable_costs, scen_metrics.variable_costs
            ),
            "fixed_costs": cls.compute_delta(
                "fixed_costs", "Fixed Operating Costs", base_metrics.fixed_costs, scen_metrics.fixed_costs
            ),
            "marketing_expense": cls.compute_delta(
                "marketing_expense", "Marketing Expense", base_metrics.marketing_expense, scen_metrics.marketing_expense
            ),
            "total_operating_cost": cls.compute_delta(
                "total_operating_cost", "Total Operating Cost", base_metrics.total_operating_cost, scen_metrics.total_operating_cost
            ),
            "operating_profit": cls.compute_delta(
                "operating_profit", "Operating Profit", base_metrics.operating_profit, scen_metrics.operating_profit
            ),
            "operating_margin_pct": cls.compute_delta(
                "operating_margin_pct", "Operating Margin (%)", base_metrics.operating_margin_pct, scen_metrics.operating_margin_pct, is_percentage_metric=True
            ),
            "monthly_loan_emi": cls.compute_delta(
                "monthly_loan_emi", "Monthly Loan Payment (EMI)", base_metrics.monthly_loan_emi, scen_metrics.monthly_loan_emi
            ),
            "cash_remaining_after_loan": cls.compute_delta(
                "cash_remaining_after_loan", "Cash Remaining After Loan", base_metrics.cash_remaining_after_loan, scen_metrics.cash_remaining_after_loan
            ),
            "unit_contribution_margin": cls.compute_delta(
                "unit_contribution_margin", "Unit Contribution Margin", base_metrics.unit_contribution_margin, scen_metrics.unit_contribution_margin
            ),
            "break_even_customers": cls.compute_delta(
                "break_even_customers",
                "Break-Even Transactions",
                base_metrics.break_even_customers if base_metrics.break_even_customers is not None else 0.0,
                scen_metrics.break_even_customers if scen_metrics.break_even_customers is not None else 0.0,
            ),
            "break_even_revenue": cls.compute_delta(
                "break_even_revenue",
                "Break-Even Monthly Revenue",
                base_metrics.break_even_revenue if base_metrics.break_even_revenue is not None else 0.0,
                scen_metrics.break_even_revenue if scen_metrics.break_even_revenue is not None else 0.0,
            ),
        }

        observations = cls.generate_observations(
            base=base_metrics,
            scen=scen_metrics,
            deltas=deltas,
            base_assumptions=req.baseline,
            scen_assumptions=req.scenario,
        )

        metadata = {
            "engine": "UnnatE Deterministic Financial Simulator v1.0",
            "operating_profit_formula": "Revenue - (Variable Costs + Fixed Costs + Marketing Expense)",
            "amortization_formula": "Standard monthly compounding reducing balance EMI; zero-interest handled via linear allocation",
            "break_even_formula": "Fixed Costs / Unit Contribution Margin (where Unit CM = Selling Price - Variable Cost per unit)",
            "isolation_notice": "Financial calculations are 100% deterministic and derived solely from user operational assumptions. External HCES and PwC datasets are never blended or utilized in financial equations.",
        }

        return SimulatorCalculateResponse(
            baseline_metrics=base_metrics,
            scenario_metrics=scen_metrics,
            deltas=deltas,
            observations=observations,
            calculation_metadata=metadata,
        )


simulator_service = SimulatorService()
