"""
tests/test_pwc_evidence.py

Comprehensive test suite for PwC Voice of the Consumer 2025: India perspective
research evidence integration.

Verifies:
1. PostgreSQL data_sources table contains the official PwC record and metadata.
2. Domain relevance filtering:
   - Returns structured evidence for Food, Agriculture, Retail, FMCG.
   - Returns None for unrelated sectors (Handloom, Textiles, IT Services, etc.).
   - Returns None when no business context is provided.
3. Provenance & Non-Fabrication:
   - geography == "India" (national survey benchmark; zero state/district fabrication).
   - survey_year == 2025, sample_size == 1031.
   - source == "PwC Voice of the Consumer 2025: India perspective".
4. Unified Research Context & Market Intelligence aggregation:
   - Injected into DistrictResearchContextResponse and MarketIntelligenceResponse.
   - Distinct from HCES MoSPI state MPCE economic benchmarks.
   - Distinct from Udyam MSME census metrics.
5. FastAPI endpoints:
   - GET /api/v1/research/district-market-context (with & without business_type/sector)
   - POST /api/v1/research/market-intelligence (with relevant & irrelevant business_profile)
"""

import asyncio
import pytest
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session
from sqlalchemy import text

from app.main import app
from app.db.session import SessionLocal
from app.services.research_context_service import research_context_service
from app.services.market_intelligence_service import market_intelligence_service
from app.schemas.market_intelligence import MarketIntelligenceRequest, BusinessProfileContext


@pytest.fixture(scope="module")
def db_session():
    session = SessionLocal()
    try:
        yield session
    finally:
        session.close()


@pytest.fixture(scope="module")
def client():
    return TestClient(app)


# -----------------------------------------------------------------------------
# 1. PostgreSQL data_sources Ingestion Verification
# -----------------------------------------------------------------------------
def test_pwc_data_source_record_exists(db_session: Session):
    """Verify official PwC record exists in data_sources with metadata and sample size."""
    row = db_session.execute(
        text("SELECT name, source_type, record_count, status, metadata_info FROM data_sources WHERE name = :name"),
        {"name": "PwC Voice of the Consumer 2025: India perspective"}
    ).fetchone()

    assert row is not None, "PwC record not found in data_sources table"
    assert row[0] == "PwC Voice of the Consumer 2025: India perspective"
    assert row[1] == "industry_survey"
    assert row[2] == 1031
    assert row[3] == "active"

    meta = row[4]
    if isinstance(meta, str):
        import json
        meta = json.loads(meta)

    assert meta["geography"] == "India"
    assert meta["survey_year"] == 2025
    assert meta["sample_size"] == 1031
    assert "domain_evidence" in meta
    assert "food" in meta["domain_evidence"]
    assert "agriculture" in meta["domain_evidence"]
    assert "retail" in meta["domain_evidence"]
    assert "fmcg" in meta["domain_evidence"]


# -----------------------------------------------------------------------------
# 2. Domain Relevance Filtering in ResearchContextService
# -----------------------------------------------------------------------------
def test_pwc_evidence_relevant_food(db_session: Session):
    """Verify PwC evidence is exposed for Food Processing business type."""
    async def _test():
        context = await research_context_service.get_district_research_context(
            db=db_session,
            district_name="Varanasi",
            state_name="Uttar Pradesh",
            business_type="Food Processing",
        )
        assert context is not None
        assert context.consumer_market_evidence is not None
        evidence = context.consumer_market_evidence
        assert evidence.source == "PwC Voice of the Consumer 2025: India perspective"
        assert evidence.geography == "India"
        assert evidence.survey_year == 2025
        assert evidence.sample_size == 1031
        assert len(evidence.evidence) >= 5
        # Check that food-specific observations are included
        assert any("taste" in item.lower() or "nutrition" in item.lower() for item in evidence.evidence)

        # Verify research observations include consumer market survey note
        assert any("Consumer Market Survey Context (PwC Voice of the Consumer 2025)" in obs for obs in context.research_observations)

    asyncio.run(_test())


def test_pwc_evidence_relevant_agriculture(db_session: Session):
    """Verify PwC evidence is exposed for Organic Agriculture business type."""
    async def _test():
        context = await research_context_service.get_district_research_context(
            db=db_session,
            district_name="Pune",
            state_name="Maharashtra",
            business_type="Organic Agriculture",
        )
        assert context is not None
        assert context.consumer_market_evidence is not None
        evidence = context.consumer_market_evidence
        assert evidence.sample_size == 1031
        assert any("pesticide" in item.lower() or "sustainability" in item.lower() for item in evidence.evidence)

    asyncio.run(_test())


def test_pwc_evidence_relevant_retail(db_session: Session):
    """Verify PwC evidence is exposed for Grocery Retail sector."""
    async def _test():
        context = await research_context_service.get_district_research_context(
            db=db_session,
            district_name="Lucknow",
            state_name="Uttar Pradesh",
            sector="Retail Grocery Store",
        )
        assert context is not None
        assert context.consumer_market_evidence is not None
        evidence = context.consumer_market_evidence
        assert any("supermarkets" in item.lower() or "delivery" in item.lower() for item in evidence.evidence)

    asyncio.run(_test())


def test_pwc_evidence_relevant_fmcg(db_session: Session):
    """Verify PwC evidence is exposed for FMCG Packaged Goods."""
    async def _test():
        context = await research_context_service.get_district_research_context(
            db=db_session,
            district_name="Varanasi",
            state_name="Uttar Pradesh",
            business_type="FMCG Packaged Goods",
        )
        assert context is not None
        assert context.consumer_market_evidence is not None
        evidence = context.consumer_market_evidence
        assert any("packaging" in item.lower() or "traceability" in item.lower() for item in evidence.evidence)

    asyncio.run(_test())


def test_pwc_evidence_irrelevant_sector_returns_none(db_session: Session):
    """Verify PwC evidence is strictly None for non-food/agri/retail/fmcg sectors."""
    async def _test():
        irrelevant_sectors = [
            "Handloom Weaving",
            "Textiles & Garments",
            "Automotive Repair",
            "IT Services & Software Consulting",
            "Leather Goods",
            "Metal Fabrication",
        ]
        for sector in irrelevant_sectors:
            context = await research_context_service.get_district_research_context(
                db=db_session,
                district_name="Varanasi",
                state_name="Uttar Pradesh",
                business_type=sector,
            )
            assert context is not None
            assert context.consumer_market_evidence is None, f"Expected None for {sector}, but got evidence"
            # Observation note should also NOT be present
            assert not any("Consumer Market Survey Context (PwC" in obs for obs in context.research_observations)

    asyncio.run(_test())


def test_pwc_evidence_unspecified_sector_returns_none(db_session: Session):
    """Verify PwC evidence is None when business type and sector are omitted."""
    async def _test():
        context = await research_context_service.get_district_research_context(
            db=db_session,
            district_name="Varanasi",
            state_name="Uttar Pradesh",
        )
        assert context is not None
        assert context.consumer_market_evidence is None

    asyncio.run(_test())


# -----------------------------------------------------------------------------
# 3. Preservation of HCES Economic Benchmarks & Non-Fabrication
# -----------------------------------------------------------------------------
def test_hces_state_benchmarks_preserved_and_unblended(db_session: Session):
    """Verify HCES MPCE benchmarks remain intact, state-level, and completely unblended."""
    async def _test():
        context = await research_context_service.get_district_research_context(
            db=db_session,
            district_name="Varanasi",
            state_name="Uttar Pradesh",
            business_type="Food Processing",
        )
        assert context is not None

        # HCES benchmark observation must be present
        hces_obs = [obs for obs in context.research_observations if "State Consumption Benchmark (HCES 2022-23)" in obs]
        assert len(hces_obs) == 1
        assert "UTTAR PRADESH" in hces_obs[0].upper()
        assert "district MPCE is not fabricated" in hces_obs[0]

        # PwC survey observation must be present but separate
        pwc_obs = [obs for obs in context.research_observations if "PwC Voice of the Consumer" in obs]
        assert len(pwc_obs) == 1
        assert "do not predict localized footfall" in pwc_obs[0]

    asyncio.run(_test())


# -----------------------------------------------------------------------------
# 4. Market Intelligence Service Integration
# -----------------------------------------------------------------------------
def test_market_intelligence_service_forwards_pwc_evidence(db_session: Session):
    """Verify market_intelligence_service propagates PwC evidence when relevant."""
    async def _test():
        req_food = MarketIntelligenceRequest(
            district_name="Varanasi",
            state_name="Uttar Pradesh",
            business_profile=BusinessProfileContext(
                business_type="Food & Beverage",
                sub_type="Dairy and Bakery",
            )
        )
        res_food = await market_intelligence_service.get_market_intelligence(db=db_session, req=req_food)
        assert res_food is not None
        assert res_food.consumer_market_evidence is not None
        assert res_food.consumer_market_evidence.source == "PwC Voice of the Consumer 2025: India perspective"
        assert res_food.consumer_market_evidence.geography == "India"
        assert res_food.consumer_market_evidence.sample_size == 1031

        # Handloom business profile
        req_handloom = MarketIntelligenceRequest(
            district_name="Varanasi",
            state_name="Uttar Pradesh",
            business_profile=BusinessProfileContext(
                business_type="Handloom",
                sub_type="Silk Saree Weaving",
            )
        )
        res_handloom = await market_intelligence_service.get_market_intelligence(db=db_session, req=req_handloom)
        assert res_handloom is not None
        assert res_handloom.consumer_market_evidence is None

    asyncio.run(_test())


# -----------------------------------------------------------------------------
# 5. FastAPI Endpoints Verification
# -----------------------------------------------------------------------------
def test_api_district_market_context_with_pwc_filter(client: TestClient):
    """Verify GET /api/v1/research/district-market-context with business_type query."""
    # Relevant: Food Processing
    resp = client.get("/api/v1/research/district-market-context?district_name=Varanasi&state_name=Uttar%20Pradesh&business_type=Food%20Processing")
    assert resp.status_code == 200
    data = resp.json()
    assert data["consumer_market_evidence"] is not None
    assert data["consumer_market_evidence"]["source"] == "PwC Voice of the Consumer 2025: India perspective"
    assert data["consumer_market_evidence"]["geography"] == "India"
    assert data["consumer_market_evidence"]["survey_year"] == 2025
    assert data["consumer_market_evidence"]["sample_size"] == 1031
    assert len(data["consumer_market_evidence"]["evidence"]) > 0

    # Irrelevant: Handicrafts
    resp_irrelevant = client.get("/api/v1/research/district-market-context?district_name=Varanasi&state_name=Uttar%20Pradesh&business_type=Handicrafts")
    assert resp_irrelevant.status_code == 200
    data_irrelevant = resp_irrelevant.json()
    assert data_irrelevant["consumer_market_evidence"] is None


def test_api_market_intelligence_endpoint_pwc_integration(client: TestClient):
    """Verify POST /api/v1/research/market-intelligence with business profile."""
    # Relevant: Organic Agriculture
    payload_agri = {
        "district_name": "Pune",
        "state_name": "Maharashtra",
        "business_profile": {
            "business_type": "Agriculture",
            "sub_type": "Organic Vegetables",
        }
    }
    resp = client.post("/api/v1/research/market-intelligence", json=payload_agri)
    assert resp.status_code == 200
    data = resp.json()
    assert data["consumer_market_evidence"] is not None
    assert data["consumer_market_evidence"]["sample_size"] == 1031
    assert any("pesticide" in item.lower() or "sustainability" in item.lower() for item in data["consumer_market_evidence"]["evidence"])

    # Irrelevant: IT Consulting
    payload_it = {
        "district_name": "Pune",
        "state_name": "Maharashtra",
        "business_profile": {
            "business_type": "Information Technology",
            "sub_type": "Cloud Consulting",
        }
    }
    resp_it = client.post("/api/v1/research/market-intelligence", json=payload_it)
    assert resp_it.status_code == 200
    data_it = resp_it.json()
    assert data_it["consumer_market_evidence"] is None
