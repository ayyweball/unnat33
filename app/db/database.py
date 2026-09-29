import logging
import re
import sqlite3
from decimal import Decimal
from sqlalchemy import create_engine, event
from sqlalchemy.orm import declarative_base
from app.core.config import settings

from datetime import datetime

sqlite3.register_adapter(Decimal, lambda d: float(d))

logger = logging.getLogger("app.db")

db_url = settings.DATABASE_URL
Base = declarative_base()

# Normalize PostgreSQL scheme to postgresql+psycopg for psycopg3 driver compatibility
if db_url.startswith("postgres://"):
    db_url = db_url.replace("postgres://", "postgresql+psycopg://", 1)
elif db_url.startswith("postgresql://") and not db_url.startswith("postgresql+"):
    db_url = db_url.replace("postgresql://", "postgresql+psycopg://", 1)

is_production = settings.ENVIRONMENT.lower() == "production"

if "sqlite" in db_url:
    if is_production:
        raise RuntimeError("Production requires PostgreSQL / Neon. SQLite is disabled in production to protect authoritative government scheme data.")
    engine = create_engine(
        db_url,
        connect_args={"check_same_thread": False},
        pool_pre_ping=True,
    )
else:
    connect_args = {
        "connect_timeout": 10,
    }
    if getattr(settings, "DATABASE_SSL", False) or ("neon.tech" in db_url and "sslmode" not in db_url):
        connect_args["sslmode"] = "require"

    temp_engine = create_engine(
        db_url,
        connect_args=connect_args,
        pool_pre_ping=True,
        pool_recycle=300,
        pool_size=getattr(settings, "DATABASE_POOL_SIZE", 10),
        max_overflow=20,
    )
    try:
        with temp_engine.connect() as conn:
            pass
        engine = temp_engine
    except Exception as e:
        if is_production:
            raise RuntimeError(f"FATAL: Production PostgreSQL / Neon connection failed ({e}). SQLite fallback is strictly disabled in production.") from e
        logger.warning(f"PostgreSQL unreachable ({e}), falling back to SQLite database goi_schemes.db for local development.")
        sqlite_url = "sqlite:///./goi_schemes.db"
        engine = create_engine(
            sqlite_url,
            connect_args={"check_same_thread": False},
            pool_pre_ping=True,
        )

@event.listens_for(engine, "connect")
def register_sqlite_functions(dbapi_connection, connection_record):
    if engine.dialect.name == "sqlite":
        def regexp_replace_3(string, pattern, replacement):
            if string is None:
                return None
            try:
                return re.sub(pattern, replacement, str(string))
            except Exception:
                return str(string)

        def regexp_replace_4(string, pattern, replacement, flags=""):
            if string is None:
                return None
            try:
                return re.sub(pattern, replacement, str(string))
            except Exception:
                return str(string)

        def sqlite_now():
            return datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S")

        try:
            dbapi_connection.create_function("now", 0, sqlite_now)
            dbapi_connection.create_function("NOW", 0, sqlite_now)
            dbapi_connection.create_function("regexp_replace", 3, regexp_replace_3)
            dbapi_connection.create_function("REGEXP_REPLACE", 3, regexp_replace_3)
            dbapi_connection.create_function("regexp_replace", 4, regexp_replace_4)
            dbapi_connection.create_function("REGEXP_REPLACE", 4, regexp_replace_4)
        except Exception:
            pass
