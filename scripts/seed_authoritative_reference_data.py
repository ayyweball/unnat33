"""
scripts/seed_authoritative_reference_data.py

Deterministic, idempotent seeding script for authoritative reference data:
- states (36 States and Union Territories)
- districts (785 LGD districts)
- msme_district_data (785 district enterprise breakdown records)
- district_geo_centroids (785 district coordinates and elevation)

Reads exact authoritative records from scripts/authoritative_reference_data.json.
Guarantees:
- Fully transactional: executes in a single transaction.
- Idempotent: safe to run multiple times (uses ON CONFLICT DO UPDATE).
- Cross-database compatible with PostgreSQL and SQLite.
- Verifies exact counts and mathematical consistency post-seed.
"""

import os
import sys
import json
from pathlib import Path
from decimal import Decimal
from sqlalchemy import text

BACKEND_DIR = Path(__file__).resolve().parent.parent
if str(BACKEND_DIR) not in sys.path:
    sys.path.insert(0, str(BACKEND_DIR))

from app.db.database import engine, Base
import app.models.master
import app.models.research_models

def seed_reference_data(custom_engine=None):
    target_engine = custom_engine or engine
    json_path = Path(__file__).resolve().parent / "authoritative_reference_data.json"
    if not json_path.exists():
        raise FileNotFoundError(f"Authoritative reference file not found at: {json_path}")

    with open(json_path, "r", encoding="utf-8") as f:
        data = json.load(f)

    states = data.get("states", [])
    districts = data.get("districts", [])
    msme = data.get("msme_district_data", [])
    geo = data.get("district_geo_centroids", [])

    dialect = target_engine.dialect.name
    print(f"Seeding authoritative reference data on dialect: {dialect} ({target_engine.url})...")

    with target_engine.begin() as conn:
        # 1. States
        print(f"Upserting {len(states)} States/UTs...")
        for s in states:
            if dialect == "sqlite":
                conn.execute(text("""
                    INSERT OR REPLACE INTO states (id, state_code, state_name, region, created_at)
                    VALUES (:id, :state_code, :state_name, :region, :created_at);
                """), s)
            else:
                conn.execute(text("""
                    INSERT INTO states (id, state_code, state_name, region, created_at)
                    VALUES (:id, :state_code, :state_name, :region, CAST(:created_at AS TIMESTAMP))
                    ON CONFLICT (id) DO UPDATE SET
                        state_code = EXCLUDED.state_code,
                        state_name = EXCLUDED.state_name,
                        region = EXCLUDED.region;
                """), s)

        # 2. Districts
        print(f"Upserting {len(districts)} Districts...")
        for d in districts:
            if dialect == "sqlite":
                conn.execute(text("""
                    INSERT OR REPLACE INTO districts (id, district_code, district_name, state_id, created_at)
                    VALUES (:id, :district_code, :district_name, :state_id, :created_at);
                """), d)
            else:
                conn.execute(text("""
                    INSERT INTO districts (id, district_code, district_name, state_id, created_at)
                    VALUES (:id, :district_code, :district_name, :state_id, CAST(:created_at AS TIMESTAMP))
                    ON CONFLICT (id) DO UPDATE SET
                        district_code = EXCLUDED.district_code,
                        district_name = EXCLUDED.district_name,
                        state_id = EXCLUDED.state_id;
                """), d)

        # 3. MSME District Data
        print(f"Upserting {len(msme)} MSME District Data records...")
        for m in msme:
            if dialect == "sqlite":
                conn.execute(text("""
                    INSERT OR REPLACE INTO msme_district_data (
                        id, district_id, reporting_date, micro_enterprises, small_enterprises, medium_enterprises,
                        manufacturing_enterprises, service_enterprises, trading_enterprises, employment,
                        male_owned, female_owned, sc_enterprises, st_enterprises, obc_enterprises,
                        source_name, source_url, created_at
                    ) VALUES (
                        :id, :district_id, :reporting_date, :micro_enterprises, :small_enterprises, :medium_enterprises,
                        :manufacturing_enterprises, :service_enterprises, :trading_enterprises, :employment,
                        :male_owned, :female_owned, :sc_enterprises, :st_enterprises, :obc_enterprises,
                        :source_name, :source_url, :created_at
                    );
                """), m)
            else:
                conn.execute(text("""
                    INSERT INTO msme_district_data (
                        id, district_id, reporting_date, micro_enterprises, small_enterprises, medium_enterprises,
                        manufacturing_enterprises, service_enterprises, trading_enterprises, employment,
                        male_owned, female_owned, sc_enterprises, st_enterprises, obc_enterprises,
                        source_name, source_url, created_at
                    ) VALUES (
                        :id, :district_id, CAST(:reporting_date AS DATE), :micro_enterprises, :small_enterprises, :medium_enterprises,
                        :manufacturing_enterprises, :service_enterprises, :trading_enterprises, :employment,
                        :male_owned, :female_owned, :sc_enterprises, :st_enterprises, :obc_enterprises,
                        :source_name, :source_url, CAST(:created_at AS TIMESTAMP)
                    )
                    ON CONFLICT (id) DO UPDATE SET
                        district_id = EXCLUDED.district_id,
                        reporting_date = EXCLUDED.reporting_date,
                        micro_enterprises = EXCLUDED.micro_enterprises,
                        small_enterprises = EXCLUDED.small_enterprises,
                        medium_enterprises = EXCLUDED.medium_enterprises,
                        manufacturing_enterprises = EXCLUDED.manufacturing_enterprises,
                        service_enterprises = EXCLUDED.service_enterprises,
                        trading_enterprises = EXCLUDED.trading_enterprises,
                        employment = EXCLUDED.employment,
                        male_owned = EXCLUDED.male_owned,
                        female_owned = EXCLUDED.female_owned,
                        sc_enterprises = EXCLUDED.sc_enterprises,
                        st_enterprises = EXCLUDED.st_enterprises,
                        obc_enterprises = EXCLUDED.obc_enterprises,
                        source_name = EXCLUDED.source_name,
                        source_url = EXCLUDED.source_url;
                """), m)

        # 4. District Geo Centroids
        print(f"Upserting {len(geo)} District Geo Centroids...")
        for g in geo:
            if dialect == "sqlite":
                conn.execute(text("""
                    INSERT OR REPLACE INTO district_geo_centroids (
                        id, district_id, latitude, longitude, elevation_meters, source, created_at, updated_at
                    ) VALUES (
                        :id, :district_id, :latitude, :longitude, :elevation_meters, :source, :created_at, :updated_at
                    );
                """), g)
            else:
                conn.execute(text("""
                    INSERT INTO district_geo_centroids (
                        id, district_id, latitude, longitude, elevation_meters, source, created_at, updated_at
                    ) VALUES (
                        :id, :district_id, CAST(:latitude AS NUMERIC), CAST(:longitude AS NUMERIC), CAST(:elevation_meters AS NUMERIC), :source,
                        CAST(:created_at AS TIMESTAMP), CAST(:updated_at AS TIMESTAMP)
                    )
                    ON CONFLICT (district_id) DO UPDATE SET
                        latitude = EXCLUDED.latitude,
                        longitude = EXCLUDED.longitude,
                        elevation_meters = EXCLUDED.elevation_meters,
                        source = EXCLUDED.source,
                        updated_at = EXCLUDED.updated_at;
                """), g)

    # Verification
    with target_engine.connect() as conn:
        state_count = conn.execute(text("SELECT COUNT(*) FROM states;")).scalar()
        district_count = conn.execute(text("SELECT COUNT(*) FROM districts;")).scalar()
        msme_count = conn.execute(text("SELECT COUNT(*) FROM msme_district_data;")).scalar()
        geo_count = conn.execute(text("SELECT COUNT(*) FROM district_geo_centroids;")).scalar()

        sums = conn.execute(text("""
            SELECT SUM(micro_enterprises) AS micro,
                   SUM(small_enterprises) AS small,
                   SUM(medium_enterprises) AS medium
            FROM msme_district_data;
        """)).mappings().first()

        micro = int(sums["micro"])
        small = int(sums["small"])
        medium = int(sums["medium"])
        total = micro + small + medium

        print("--- VERIFICATION METRICS ---")
        print(f"States:     {state_count} (Expected: 36)")
        print(f"Districts:  {district_count} (Expected: 785)")
        print(f"MSME Rows:  {msme_count} (Expected: 785)")
        print(f"Geo Rows:   {geo_count} (Expected: 785)")
        print(f"Micro:      {micro} (Expected: 27136305)")
        print(f"Small:      {small} (Expected: 712961)")
        print(f"Medium:     {medium} (Expected: 67756)")
        print(f"Total:      {total} (Expected: 27917022)")

        assert state_count == 36, f"State count mismatch: {state_count}"
        assert district_count == 785, f"District count mismatch: {district_count}"
        assert msme_count == 785, f"MSME count mismatch: {msme_count}"
        assert geo_count == 785, f"Geo count mismatch: {geo_count}"
        assert micro == 27136305, f"Micro mismatch: {micro}"
        assert small == 712961, f"Small mismatch: {small}"
        assert medium == 67756, f"Medium mismatch: {medium}"
        assert total == 27917022, f"Total mismatch: {total}"

    print("Authoritative reference data seeding completed and verified.")

if __name__ == "__main__":
    seed_reference_data()
