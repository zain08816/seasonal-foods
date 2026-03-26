from __future__ import annotations

import os
from contextlib import asynccontextmanager
from collections.abc import AsyncIterator
from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles

from .database import Base, engine
from .seed_db import seed_database_if_empty

from .routers.regions import router as regions_router
from .routers.seasons import router as seasons_router
from .routers.foods import router as foods_router


@asynccontextmanager
async def lifespan(_app: FastAPI) -> AsyncIterator[None]:
    Base.metadata.create_all(bind=engine)
    seed_database_if_empty()
    yield


app = FastAPI(title="Seasonal Food Finder", lifespan=lifespan)


app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:3000",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/healthz")
def healthz() -> dict[str, str]:
    return {"status": "ok"}


app.include_router(regions_router)
app.include_router(seasons_router)
app.include_router(foods_router)


_static_dir_env = os.getenv("STATIC_DIR", "")
_static_dir = Path(_static_dir_env) if _static_dir_env else None

if _static_dir is not None and _static_dir.is_dir():
    app.mount("/assets", StaticFiles(directory=_static_dir / "assets"), name="frontend-assets")

    @app.get("/{path:path}")
    async def serve_frontend(path: str) -> FileResponse:
        file = _static_dir / path
        if path and file.is_file() and _static_dir in file.resolve().parents:
            return FileResponse(file)
        return FileResponse(_static_dir / "index.html")
