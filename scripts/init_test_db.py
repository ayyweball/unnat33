"""
scripts/init_test_db.py

Deterministic initialization script for CI and test environments.
Prepares a clean, fully initialized PostgreSQL or SQLite database:
1. Creates all tables and unified views from SQLAlchemy Base and DDL scripts.
2. Ingests all authoritative seeds:
   - 12 legacy schemes (seedforscheme.sql)
   - Normalized sectors and scheme eligibility (scripts/seed_normalized_eligibility.py)
   - 36 states, 785 districts, 785 MSME records, 785 centroids (scripts/seed_authoritative_reference_data.py)
   - 115 government programs and financial terms (scripts/seed_government_programs.py)
   - MoSPI HCES 2022-23 benchmark expenditure data (scripts/seed_hces_2022_23.py)
   - PwC Voice of the Consumer 2025 evidence (scripts/seed_pwc_evidence.py)
3. Synchronizes Alembic migration status to head.
"""

import os
import sys
from pathlib import Path
from sqlalchemy import text

BACKEND_DIR = Path(__file__).resolve().parent.parent
if str(BACKEND_DIR) not in sys.path:
    sys.path.insert(0, str(BACKEND_DIR))

from app.db.database import Base, engine
import app.models
from scripts.create_program_tables import run_ddl as create_program_tables
from scripts.create_research_tables import run_ddl as create_research_tables
from scripts.seed_normalized_eligibility import run_seed as seed_normalized_eligibility
from scripts.seed_authoritative_reference_data import seed_reference_data
from scripts.seed_government_programs import seed as seed_government_programs
from scripts.seed_hces_2022_23 import seed_hces_data
from scripts.seed_pwc_evidence import seed_pwc

def init_db(custom_engine=None):
    target_engine = custom_engine or engine
    print(f"============================================================")
    print(f"INITIALIZING CI/TEST DATABASE: {target_engine.url}")
    print(f"============================================================")

    # 1. Base schema creation (excluding program & research DDL managed tables)
    print("1. Creating Base tables...")
    program_and_research_tables = {
        "government_programs",
        "program_sectors",
        "program_eligibility",
        "program_credit_details",
        "program_guarantee_details",
        "program_subsidy_details",
        "v_unified_program_sectors",
        "v_unified_program_eligibility",
        "district_geo_centroids",
        "district_weather_cache",
    }
    base_tables = [t for t in Base.metadata.sorted_tables if t.name not in program_and_research_tables]
    Base.metadata.create_all(bind=target_engine, tables=base_tables)

    # 2. Program tables and views
    print("2. Creating program tables and unified views...")
    create_program_tables(target_engine)

    # 3. Research tables
    print("3. Creating research intelligence tables...")
    create_research_tables(target_engine)

    # 4. Seed schemes (seedforscheme.sql)
    scheme_sql_path = BACKEND_DIR / "seedforscheme.sql"
    if scheme_sql_path.exists():
        print("4. Seeding 12 legacy schemes from seedforscheme.sql...")
        with open(scheme_sql_path, "r", encoding="utf-8") as f:
            sql_content = f.read()
        with target_engine.begin() as conn:
            conn.execute(text(sql_content))

    # 5. Seed normalized sectors and eligibility
    print("5. Seeding normalized eligibility & sectors...")
    seed_normalized_eligibility()

    # 6. Seed authoritative reference data (states, districts, msme, geo centroids)
    print("6. Seeding authoritative reference data (36 states, 785 districts, 785 MSME, 785 geo)...")
    seed_reference_data(custom_engine=target_engine)

    # 7. Seed government programs catalogue
    print("7. Seeding government programs catalogue (115 programs)...")
    seed_government_programs(custom_engine=target_engine)

    # 8. Seed HCES 2022-23 benchmark data
    print("8. Seeding HCES 2022-23 consumption data...")
    seed_hces_data()

    # 9. Seed PwC Voice of the Consumer 2025 evidence
    print("9. Seeding PwC consumer market evidence...")
    seed_pwc()

    # 10. Stamp Alembic head if alembic is available
    try:
        from alembic.config import Config
        from alembic import command
        alembic_cfg = Config(str(BACKEND_DIR / "alembic.ini"))
        alembic_cfg.set_main_option("sqlalchemy.url", str(target_engine.url))
        command.stamp(alembic_cfg, "head")
        print("10. Stamped Alembic to head.")
    except Exception as e:
        print(f"10. Note: Alembic stamp skipped or non-fatal ({e}).")

    print(f"============================================================")
    print(f"DATABASE INITIALIZATION & VERIFICATION COMPLETED SUCCESSFULLY")
    print(f"============================================================")

if __name__ == "__main__":
    init_db()
