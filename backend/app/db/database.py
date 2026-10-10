import os
import sys
from urllib.parse import urlparse, quote
from sqlalchemy import create_engine, text
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

# ---------------------------------------------------------------------------
# DATABASE URL resolution
# ---------------------------------------------------------------------------
# Priority:  DATABASE_URL env var  >  component env vars  >  SQLite dev fallback
#
# SPECIAL CHARACTERS IN PASSWORDS:
#   If the password contains URL-unsafe chars (@, /, :, #, ?, [, ]) the raw
#   DATABASE_URL string will mis-parse the host. We detect that case and
#   rebuild the URL with a properly percent-encoded password.
# ---------------------------------------------------------------------------

_EXPLICIT_DB_CONFIGURED = False  # True when caller has set DATABASE_URL env var

_raw_url = os.getenv("DATABASE_URL", "")

if _raw_url:
    _EXPLICIT_DB_CONFIGURED = True
    DATABASE_URL = _raw_url
else:
    # No DATABASE_URL set — developer mode: allow SQLite fallback
    DATABASE_URL = "sqlite:///./health_copilot.db"

# ---------------------------------------------------------------------------
# URL-safety guard: re-encode password if the parsed netloc looks broken.
# A reliable symptom is that parsed.hostname contains "@" or "]".
# ---------------------------------------------------------------------------

def _safe_postgres_url(url: str) -> str:
    """Return a version of the postgresql URL where the password is
    percent-encoded so that special characters don't break URL parsing."""
    try:
        parsed = urlparse(url)
        if parsed.scheme not in ("postgresql", "postgres", "postgresql+psycopg2"):
            return url
        host = parsed.hostname or ""
        # Heuristic: if the host contains brackets or @ the password spilled
        if "@" in host or "]" in host or "[" in host:
            # Rebuild from DATABASE_URL components passed as separate env vars
            pg_user = os.getenv("DB_USER", "postgres")
            pg_pass = os.getenv("DB_PASSWORD", "")
            pg_host = os.getenv("DB_HOST", "localhost")
            pg_port = os.getenv("DB_PORT", "5432")
            pg_name = os.getenv("DB_NAME", "postgres")
            encoded_pass = quote(pg_pass, safe="")
            rebuilt = f"postgresql://{pg_user}:{encoded_pass}@{pg_host}:{pg_port}/{pg_name}"
            print(
                "[DB] WARNING: DATABASE_URL password contained URL-unsafe characters. "
                "Rebuilt URL from DB_USER / DB_PASSWORD / DB_HOST / DB_PORT / DB_NAME env vars."
            )
            return rebuilt
    except Exception:
        pass
    return url


if DATABASE_URL.startswith(("postgresql", "postgres")):
    DATABASE_URL = _safe_postgres_url(DATABASE_URL)

# ---------------------------------------------------------------------------
# Engine creation
# ---------------------------------------------------------------------------

_USE_SQLITE_FALLBACK = False

try:
    if DATABASE_URL.startswith(("postgresql", "postgres")):
        engine = create_engine(
            DATABASE_URL,
            pool_pre_ping=True,
            pool_size=5,
            max_overflow=10,
            connect_args={"connect_timeout": 10},
        )
        # Verify the connection is actually reachable — dialect check alone is not enough
        with engine.connect() as _conn:
            _conn.execute(text("SELECT 1"))
        print(f"[DB] Connected to PostgreSQL successfully.")
    else:
        engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
        print(f"[DB] Using SQLite (developer mode).")

except Exception as _exc:
    _safe_msg = str(_exc)
    # Strip any substring that looks like it contains a password
    import re as _re
    _safe_msg = _re.sub(r"(password|pwd|pass)[^@\s]*", "<REDACTED>", _safe_msg, flags=_re.IGNORECASE)

    if _EXPLICIT_DB_CONFIGURED:
        # The operator explicitly set DATABASE_URL — silently swapping to SQLite
        # would hide a critical misconfiguration and serve wrong data in production.
        print(
            f"\n[DB] FATAL: DATABASE_URL is configured but the PostgreSQL connection failed.\n"
            f"[DB] Error (redacted): {_safe_msg}\n"
            f"[DB] The server will NOT start. Fix the connection details in your .env file.\n"
            f"[DB] If you intend to use SQLite for local development, unset DATABASE_URL.\n"
        )
        sys.exit(1)
    else:
        # No explicit config — use SQLite for local development
        print(
            f"[DB] PostgreSQL not available ({_safe_msg}). "
            f"Falling back to local SQLite for development."
        )
        DATABASE_URL = "sqlite:///./health_copilot.db"
        engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
        _USE_SQLITE_FALLBACK = True

# ---------------------------------------------------------------------------
# Session factory and Base
# ---------------------------------------------------------------------------

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# Expose dialect name so health endpoint can report honestly
db_dialect: str = engine.dialect.name  # "postgresql" or "sqlite"


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
