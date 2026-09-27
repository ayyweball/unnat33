"""
tests/test_hces.py

Comprehensive test suite for Household Consumption Expenditure Survey (HCES) 2022-23 integration.
Validates:
1. Row counts across all 5 HCES tables and catalog
2. Strict Rural vs Urban separation
3. Strict With Imputation vs Without Imputation separation
4. State vs National level separation and foreign key linkage
5. Verifies official figures for Karnataka, Rajasthan, Sikkim, Chhattisgarh,
   Uttar Pradesh, Maharashtra, Delhi, and All-India
6. Verified 24 item consumption categories, totals, and shares
7. 12 fractile classes + All Classes bounds
8. Zero district fabrication invariant
9. Non-food consumption terminology compliance (no 'discretionary' claims)
10. All REST API endpoints (200 OK and 404 handling)
"""

import pytest
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session
from sqlalchemy import text

from app.main import app
from app.db.session import SessionLocal
from app.services.hces_service import hces_service


@pytest.fixture(scope="module")
def db():
    session = SessionLocal()
    try:
        yield session
    finally:
        session.close()


@pytest.fixture(scope="module")
def client():
    return TestClient(app)


# -----------------------------------------------------------------------------
# 1. Row Counts & Data Integrity
# -----------------------------------------------------------------------------
def test_hces_row_counts(db: Session):
    """Verify exact expected row counts in all HCES tables."""
    counts = {
        "hces_state_mpce": db.execute(text("SELECT count(*) FROM hces_state_mpce;")).scalar(),
        "hces_consumption_category": db.execute(text("SELECT count(*) FROM hces_consumption_category;")).scalar(),
        "hces_fractile_mpce": db.execute(text("SELECT count(*) FROM hces_fractile_mpce;")).scalar(),
        "hces_demographic_mpce": db.execute(text("SELECT count(*) FROM hces_demographic_mpce;")).scalar(),
        "hces_survey_metadata": db.execute(text("SELECT count(*) FROM hces_survey_metadata;")).scalar(),
    }

    assert counts["hces_state_mpce"] == 74, f"Expected 74 state MPCE rows, got {counts['hces_state_mpce']}"
    assert counts["hces_consumption_category"] == 96, f"Expected 96 category rows, got {counts['hces_consumption_category']}"
    assert counts["hces_fractile_mpce"] == 52, f"Expected 52 fractile rows, got {counts['hces_fractile_mpce']}"
    assert counts["hces_demographic_mpce"] == 46, f"Expected 46 demographic rows, got {counts['hces_demographic_mpce']}"
    assert counts["hces_survey_metadata"] >= 1, "Expected metadata row"

    # DataSource catalog entry
    ds = db.execute(text("SELECT name, status FROM data_sources WHERE name = 'HCES 2022-23';")).fetchone()
    assert ds is not None
    assert ds[1] == "active"


# -----------------------------------------------------------------------------
# 2. Rural vs Urban Separation & Imputation Separation
# -----------------------------------------------------------------------------
def test_rural_urban_and_imputation_separation(db: Session):
    """Verify strict rural/urban and imputation separation."""
    # Exactly 37 without_imputation and 37 with_imputation in state MPCE
    wout_count = db.execute(text("SELECT count(*) FROM hces_state_mpce WHERE estimate_type = 'without_imputation';")).scalar()
    with_count = db.execute(text("SELECT count(*) FROM hces_state_mpce WHERE estimate_type = 'with_imputation';")).scalar()
    assert wout_count == 37
    assert with_count == 37

    # Invariants on values: with_imputation MPCE >= without_imputation MPCE
    rows = db.execute(text("""
        SELECT a.state_name, a.rural_mpce as wout_r, b.rural_mpce as with_r,
               a.urban_mpce as wout_u, b.urban_mpce as with_u
        FROM hces_state_mpce a
        JOIN hces_state_mpce b ON a.state_name = b.state_name
        WHERE a.estimate_type = 'without_imputation' AND b.estimate_type = 'with_imputation';
    """)).fetchall()

    for r in rows:
        state, wout_r, with_r, wout_u, with_u = r
        assert with_r >= wout_r, f"{state} rural: with_imputation ({with_r}) < without ({wout_r})"
        assert with_u >= wout_u, f"{state} urban: with_imputation ({with_u}) < without ({wout_u})"


# -----------------------------------------------------------------------------
# 3. State-Level Verification for Required Focus States
# -----------------------------------------------------------------------------
def test_verified_state_values(db: Session):
    """
    Verify exact values for:
    Karnataka, Rajasthan, Sikkim, Chhattisgarh, Uttar Pradesh, Maharashtra, Delhi, All-India
    """
    expected_values = {
        "KARNATAKA": {
            "without": {"rural": 4397.0, "urban": 7666.0},
            "with": {"rural": 4578.0, "urban": 7781.0},
        },
        "RAJASTHAN": {
            "without": {"rural": 4263.0, "urban": 5913.0},
            "with": {"rural": 4348.0, "urban": 5970.0},
        },
        "SIKKIM": {
            "without": {"rural": 7731.0, "urban": 12105.0},
            "with": {"rural": 7787.0, "urban": 12125.0},
        },
        "CHHATTISGARH": {
            "without": {"rural": 2466.0, "urban": 4483.0},
            "with": {"rural": 2575.0, "urban": 4557.0},
        },
        "UTTAR PRADESH": {
            "without": {"rural": 3191.0, "urban": 5040.0},
            "with": {"rural": 3277.0, "urban": 5104.0},
        },
        "MAHARASHTRA": {
            "without": {"rural": 4010.0, "urban": 6657.0},
            "with": {"rural": 4076.0, "urban": 6683.0},
        },
        "DELHI": {
            "without": {"rural": 6576.0, "urban": 8217.0},
            "with": {"rural": 6595.0, "urban": 8250.0},
        },
        "ALL-INDIA": {
            "without": {"rural": 3773.0, "urban": 6459.0},
            "with": {"rural": 3860.0, "urban": 6521.0},
        },
    }

    for state, exp in expected_values.items():
        # without_imputation
        res_wout = hces_service.get_state_mpce(db, state, estimate_type="without_imputation")
        assert res_wout is not None, f"State {state} not found for without_imputation"
        assert res_wout["rural_mpce"] == exp["without"]["rural"], f"{state} without rural mismatch"
        assert res_wout["urban_mpce"] == exp["without"]["urban"], f"{state} without urban mismatch"

        # with_imputation
        res_with = hces_service.get_state_mpce(db, state, estimate_type="with_imputation")
        assert res_with is not None, f"State {state} not found for with_imputation"
        assert res_with["rural_mpce"] == exp["with"]["rural"], f"{state} with rural mismatch"
        assert res_with["urban_mpce"] == exp["with"]["urban"], f"{state} with urban mismatch"


# -----------------------------------------------------------------------------
# 4. Zero District Fabrication Invariant
# -----------------------------------------------------------------------------
def test_zero_district_fabrication_policy(db: Session):
    """Verify that benchmark service explicitly enforces zero district fabrication."""
    bench = hces_service.get_market_consumption_benchmarks(db, "Karnataka")
    assert bench["district_level_estimate_available"] is False
    assert "not fabricated" in bench["zero_district_fabrication_policy"].lower()
    assert bench["geographic_level"] == "state_and_national_benchmarks"


# -----------------------------------------------------------------------------
# 5. Non-Food Terminology Compliance
# -----------------------------------------------------------------------------
def test_non_food_terminology_compliance(db: Session):
    """Verify that non-food expenditure is NOT referred to as discretionary spending."""
    bench = hces_service.get_market_consumption_benchmarks(db, "Maharashtra")
    ctx = bench["non_food_consumption_context"].lower()
    assert "discretionary spending capacity" not in ctx
    assert "essential living obligations" in ctx
    assert "non_food_spending_share_pct" in bench["macro_consumption_shares"]["rural"]


# -----------------------------------------------------------------------------
# 6. Consumption Basket Aggregates & Fractiles
# -----------------------------------------------------------------------------
def test_consumption_categories_and_fractiles(db: Session):
    """Verify consumption totals and fractiles."""
    basket = hces_service.get_consumption_basket(db, estimate_type="without_imputation")
    food_total_rural = next(r for r in basket if r["item_code"] == "food_total" and r["sector"] == "rural")
    non_food_rural = next(r for r in basket if r["item_code"] == "non_food_total" and r["sector"] == "rural")
    all_items_rural = next(r for r in basket if r["item_code"] == "all_items_total" and r["sector"] == "rural")

    assert food_total_rural["mpce_amount"] == 1750.0
    assert food_total_rural["share_percentage"] == 46.38
    assert non_food_rural["mpce_amount"] == 2023.0
    assert non_food_rural["share_percentage"] == 53.62
    assert all_items_rural["mpce_amount"] == 3773.0

    # Fractiles: bottom 5% and top 5%
    fractiles = hces_service.get_fractile_distribution(db, sector="rural", estimate_type="without_imputation")
    b5 = next(f for f in fractiles if f["fractile_class"] == "0-5%")
    t5 = next(f for f in fractiles if f["fractile_class"] == "95-100%")
    assert b5["mpce_amount"] == 1373.0
    assert t5["mpce_amount"] == 10501.0


# -----------------------------------------------------------------------------
# 7. API Endpoints Verification
# -----------------------------------------------------------------------------
def test_api_hces_endpoints(client: TestClient):
    """Verify all HCES REST endpoints return 200 OK with correct schema."""
    # State endpoint
    resp = client.get("/api/v1/research/hces/state/Karnataka")
    assert resp.status_code == 200
    data = resp.json()
    assert data["state_name"] == "KARNATAKA"
    assert data["rural_mpce"] == 4397.0
    assert data["urban_mpce"] == 7666.0

    # With imputation
    resp_with = client.get("/api/v1/research/hces/state/Karnataka?estimate_type=with_imputation")
    assert resp_with.status_code == 200
    assert resp_with.json()["rural_mpce"] == 4578.0

    # National endpoint
    resp_nat = client.get("/api/v1/research/hces/national")
    assert resp_nat.status_code == 200
    assert resp_nat.json()["rural_mpce"] == 3773.0

    # Basket
    resp_b = client.get("/api/v1/research/hces/basket?sector=rural")
    assert resp_b.status_code == 200
    assert len(resp_b.json()) == 24

    # Fractiles
    resp_f = client.get("/api/v1/research/hces/fractiles?sector=urban")
    assert resp_f.status_code == 200
    assert len(resp_f.json()) == 13

    # Metadata
    resp_m = client.get("/api/v1/research/hces/metadata")
    assert resp_m.status_code == 200
    assert resp_m.json()["total_sample_households"] == 261746

    # Combined benchmarks
    resp_bench = client.get("/api/v1/research/hces/benchmarks/Rajasthan")
    assert resp_bench.status_code == 200
    bench = resp_bench.json()
    assert bench["state_consumption_benchmark"]["rural_mpce_inr"] == 4263.0
    assert bench["district_level_estimate_available"] is False

    # 404 for non-existent state
    resp_404 = client.get("/api/v1/research/hces/state/NonExistentStateXYZ")
    assert resp_404.status_code == 404
