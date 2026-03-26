from __future__ import annotations

import os
from pathlib import Path
from typing import Generator

from sqlalchemy import create_engine
from sqlalchemy.orm import Session, declarative_base, sessionmaker


Base = declarative_base()


def _default_db_path() -> str:
    # backend/app -> backend -> project root
    backend_dir = Path(__file__).resolve().parent.parent
    return str(backend_dir / "seasonal_food_finder.sqlite3")


DB_PATH = os.getenv("SEASONAL_FOOD_DB_PATH", _default_db_path())

engine = create_engine(
    f"sqlite:///{DB_PATH}",
    connect_args={"check_same_thread": False},
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def get_db() -> Generator[Session, None, None]:
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

