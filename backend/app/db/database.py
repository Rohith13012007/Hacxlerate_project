import os
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://postgres:postgres@localhost:5432/health_copilot")

# Try creating PostgreSQL engine, fallback to SQLite if PostgreSQL fails to connect
try:
    if DATABASE_URL.startswith("postgresql"):
        engine = create_engine(DATABASE_URL, pool_pre_ping=True)
        # Test connection
        with engine.connect() as conn:
            pass
    else:
        engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
except Exception as e:
    print(f"[DB Notice] Could not connect to PostgreSQL ({e}). Falling back to local SQLite database.")
    DATABASE_URL = "sqlite:///./health_copilot.db"
    engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
