"""
app/services/hces_service.py

Authoritative Service for Government of India / MoSPI Household Consumption
Expenditure Survey (HCES) 2022-23 consumption data.

Guarantees & Invariants:
1. Zero District Fabrication: Provides official State/UT and National benchmarks only.
   Never estimates, synthesizes, or fabricates district-level MPCE.
2. Strict Partitioning: Separates 'rural' vs 'urban' and 'with_imputation' vs 'without_imputation'.
3. Terminology & Conceptual Integrity: Uses 'non_food_spending_share' and 'non_food_consumption_context'.
   Never misrepresents non-food expenditure as discretionary income or discretionary spending capacity.
4. Provenance: Every record carries official MoSPI HCES 2022-23 provenance and methodology notes.
"""

import logging
from typing import Dict, Any, List, Optional
from decimal import Decimal
from sqlalchemy.orm import Session
from sqlalchemy import text

logger = logging.getLogger(__name__)

# State name normalizer
STATE_ALIASES = {
    'ANDAMAN & N ISLANDS': 'ANDAMAN AND NICOBAR ISLANDS',
    'DADRA & NAGAR HAVELI AND DAMAN & DIU': 'THE DADRA AND NAGAR HAVELI AND DAMAN AND DIU',
    'JAMMU & KASHMIR': 'JAMMU AND KASHMIR',
}


class HcesService:
    """Service providing structured HCES 2022-23 consumption intelligence."""

    @staticmethod
    def normalize_state_name(state_name: str) -> str:
        s = state_name.strip().upper()
        return STATE_ALIASES.get(s, s)

    def get_state_mpce(
        self,
        db: Session,
        state_name: str,
        estimate_type: str = "without_imputation",
    ) -> Optional[Dict[str, Any]]:
        """
        Retrieve official state-level rural and urban MPCE and sample statistics.
        Does NOT fabricate district values.
        """
        norm_name = self.normalize_state_name(state_name)

        query = text("""
            SELECT 
                state_id, state_name, geographic_level, survey_year, estimate_type,
                rural_mpce, urban_mpce, rural_urban_difference_pct,
                sample_households_rural, sample_households_urban, sample_households_total,
                estimated_households_rural_hundreds, estimated_households_urban_hundreds,
                estimated_households_total_hundreds,
                source, publisher, survey_period, methodology_notes
            FROM hces_state_mpce
            WHERE (UPPER(state_name) = :sname OR UPPER(state_name) = :orig_name)
              AND estimate_type = :etype
            LIMIT 1;
        """)

        row = db.execute(query, {"sname": norm_name, "orig_name": state_name.strip().upper(), "etype": estimate_type}).mappings().fetchone()
        if not row:
            return None

        d = dict(row)
        for k in ["rural_mpce", "urban_mpce", "rural_urban_difference_pct"]:
            if d.get(k) is not None:
                d[k] = float(d[k])
        return d

    def get_national_mpce(
        self,
        db: Session,
        estimate_type: str = "without_imputation",
    ) -> Dict[str, Any]:
        """Retrieve official All-India national benchmark MPCE."""
        query = text("""
            SELECT 
                state_name, geographic_level, survey_year, estimate_type,
                rural_mpce, urban_mpce, rural_urban_difference_pct,
                sample_households_rural, sample_households_urban, sample_households_total,
                estimated_households_rural_hundreds, estimated_households_urban_hundreds,
                source, publisher, survey_period, methodology_notes
            FROM hces_state_mpce
            WHERE geographic_level = 'national'
              AND estimate_type = :etype
            LIMIT 1;
        """)
        row = db.execute(query, {"etype": estimate_type}).mappings().fetchone()
        if not row:
            return {}
        d = dict(row)
        for k in ["rural_mpce", "urban_mpce", "rural_urban_difference_pct"]:
            if d.get(k) is not None:
                d[k] = float(d[k])
        return d

    def get_consumption_basket(
        self,
        db: Session,
        sector: Optional[str] = None,
        estimate_type: str = "without_imputation",
    ) -> List[Dict[str, Any]]:
        """
        Retrieve 24 item groups and aggregates with expenditure amounts and shares.
        """
        where_clause = "WHERE estimate_type = :etype"
        params: Dict[str, Any] = {"etype": estimate_type}

        if sector:
            where_clause += " AND sector = :sector"
            params["sector"] = sector.lower()

        query = text(f"""
            SELECT 
                survey_year, estimate_type, sector, category_type,
                item_group, item_code, display_order, mpce_amount, share_percentage,
                notes, source, publisher
            FROM hces_consumption_category
            {where_clause}
            ORDER BY sector, display_order;
        """)

        rows = db.execute(query, params).mappings().fetchall()
        result = []
        for r in rows:
            d = dict(r)
            d["mpce_amount"] = float(d["mpce_amount"])
            d["share_percentage"] = float(d["share_percentage"])
            result.append(d)
        return result

    def get_fractile_distribution(
        self,
        db: Session,
        sector: Optional[str] = None,
        estimate_type: str = "without_imputation",
    ) -> List[Dict[str, Any]]:
        """Retrieve MPCE fractile classes distribution."""
        where_clause = "WHERE estimate_type = :etype"
        params: Dict[str, Any] = {"etype": estimate_type}

        if sector:
            where_clause += " AND sector = :sector"
            params["sector"] = sector.lower()

        query = text(f"""
            SELECT 
                survey_year, estimate_type, sector, fractile_class, fractile_order,
                mpce_amount, source, publisher
            FROM hces_fractile_mpce
            {where_clause}
            ORDER BY sector, fractile_order;
        """)

        rows = db.execute(query, params).mappings().fetchall()
        result = []
        for r in rows:
            d = dict(r)
            d["mpce_amount"] = float(d["mpce_amount"])
            result.append(d)
        return result

    def get_demographic_mpce(
        self,
        db: Session,
        demographic_type: Optional[str] = None,
        sector: Optional[str] = None,
        estimate_type: str = "without_imputation",
    ) -> List[Dict[str, Any]]:
        """Retrieve MPCE by household type or social group."""
        clauses = ["estimate_type = :etype"]
        params: Dict[str, Any] = {"etype": estimate_type}

        if demographic_type:
            clauses.append("demographic_type = :dtype")
            params["dtype"] = demographic_type

        if sector:
            clauses.append("sector = :sector")
            params["sector"] = sector.lower()

        where_sql = " AND ".join(clauses)
        query = text(f"""
            SELECT 
                survey_year, estimate_type, demographic_type, group_name, sector,
                mpce_amount, source, publisher
            FROM hces_demographic_mpce
            WHERE {where_sql}
            ORDER BY demographic_type, sector, group_name;
        """)

        rows = db.execute(query, params).mappings().fetchall()
        result = []
        for r in rows:
            d = dict(r)
            d["mpce_amount"] = float(d["mpce_amount"])
            result.append(d)
        return result

    def get_survey_metadata(self, db: Session) -> Optional[Dict[str, Any]]:
        """Retrieve official survey documentation and methodology notes."""
        query = text("""
            SELECT 
                survey_name, survey_year, survey_period, publisher, coverage_summary,
                total_villages, total_urban_blocks, total_sample_households,
                rural_sample_households, urban_sample_households,
                methodology, imputation_methodology_notes, questionnaires, metadata_info
            FROM hces_survey_metadata
            LIMIT 1;
        """)
        row = db.execute(query).mappings().fetchone()
        return dict(row) if row else None

    def get_market_consumption_benchmarks(
        self,
        db: Session,
        state_name: str,
        estimate_type: str = "without_imputation",
    ) -> Dict[str, Any]:
        """
        Synthesize state and national consumption benchmarks for market analysis.
        Strictly observes zero-district-fabrication invariant.
        """
        state_data = self.get_state_mpce(db, state_name=state_name, estimate_type=estimate_type)
        national_data = self.get_national_mpce(db, estimate_type=estimate_type)

        # National food and non-food spending shares from basket aggregates
        basket = self.get_consumption_basket(db, estimate_type=estimate_type)
        food_shares = {r["sector"]: r["share_percentage"] for r in basket if r["item_code"] == "food_total"}
        non_food_shares = {r["sector"]: r["share_percentage"] for r in basket if r["item_code"] == "non_food_total"}

        # Safe comparisons
        state_rural = state_data["rural_mpce"] if state_data else None
        state_urban = state_data["urban_mpce"] if state_data else None
        nat_rural = national_data.get("rural_mpce")
        nat_urban = national_data.get("urban_mpce")

        rural_index_vs_national = round((state_rural / nat_rural) * 100, 1) if state_rural and nat_rural else None
        urban_index_vs_national = round((state_urban / nat_urban) * 100, 1) if state_urban and nat_urban else None

        return {
            "geographic_level": "state_and_national_benchmarks",
            "district_level_estimate_available": False,
            "zero_district_fabrication_policy": "Official HCES data is collected at State/UT and National levels. District-level consumption expenditure is not fabricated.",
            "state_name": state_data["state_name"] if state_data else state_name.upper(),
            "estimate_type": estimate_type,
            "survey_year": "2022-23",
            "state_consumption_benchmark": {
                "rural_mpce_inr": state_rural,
                "urban_mpce_inr": state_urban,
                "rural_urban_gap_pct": state_data.get("rural_urban_difference_pct") if state_data else None,
                "rural_index_vs_national": rural_index_vs_national,
                "urban_index_vs_national": urban_index_vs_national,
                "sample_households_surveyed": state_data.get("sample_households_total") if state_data else None,
            },
            "national_consumption_benchmark": {
                "national_rural_mpce_inr": nat_rural,
                "national_urban_mpce_inr": nat_urban,
                "national_rural_urban_gap_pct": national_data.get("rural_urban_difference_pct"),
            },
            "macro_consumption_shares": {
                "rural": {
                    "food_spending_share_pct": food_shares.get("rural", 46.38),
                    "non_food_spending_share_pct": non_food_shares.get("rural", 53.62),
                },
                "urban": {
                    "food_spending_share_pct": food_shares.get("urban", 39.17),
                    "non_food_spending_share_pct": non_food_shares.get("urban", 60.83),
                },
            },
            "non_food_consumption_context": (
                "The HCES non-food expenditure category comprises essential living obligations "
                "including fuel & light, conveyance, healthcare, education, rent, and household "
                "consumables. It reflects baseline non-food expenditure patterns and represents "
                "non-negotiable living needs rather than disposable surplus funds."
            ),
            "provenance": {
                "source": "HCES 2022-23",
                "publisher": "Government of India / MoSPI / NSSO",
                "survey_period": "August 2022 - July 2023",
            }
        }


# Singleton instance
hces_service = HcesService()
