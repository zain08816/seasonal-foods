# Seasonal Food Finder

A full-stack app that shows what foods are in season for a selected US region/state and date. Built with a React + TypeScript frontend and a Python FastAPI backend (SQLite + SQLAlchemy + seeded static JSON).

## Repo structure

- `backend/`: FastAPI app + SQLite database + seed JSON loader
- `frontend/`: React + TypeScript + Vite UI

## Development

Start both the backend and frontend with a single command:

```bash
./dev.sh
```

This launches uvicorn (port 8000) and Vite (port 5173) together. Press `Ctrl+C` to stop both.

## Docker

The repo includes separate Dockerfiles for the backend and frontend.

### Backend image

```bash
docker build -f Dockerfile.backend -t seasonal-foods-backend .
docker run --rm -p 8000:8000 -v seasonal-foods-data:/app/data seasonal-foods-backend
```

The backend image installs dependencies with `uv` from `backend/pyproject.toml` and `backend/uv.lock`.

API docs: http://127.0.0.1:8000/docs

### Frontend image

Build the frontend with the backend API URL baked in:

```bash
docker build -f Dockerfile.frontend --build-arg VITE_API_BASE_URL=http://127.0.0.1:8000 -t seasonal-foods-frontend .
docker run --rm -p 8080:80 seasonal-foods-frontend
```

Open: http://127.0.0.1:8080

## Backend

### Setup

```bash
cd backend
uv sync
```

### Run

```bash
uv run uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

Swagger docs: http://127.0.0.1:8000/docs

The database auto-seeds on first run from JSON files in `backend/app/seed/`.

### Re-seeding

To re-seed after adding new data, delete the SQLite file and restart:

```bash
rm backend/seasonal_food_finder.sqlite3
cd backend
uv run uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

## Frontend

### Setup

```bash
cd frontend
pnpm install
```

### Run

```bash
VITE_API_BASE_URL=http://127.0.0.1:8000 pnpm dev
```

Open: http://127.0.0.1:5173

## Adding a new region (zero code changes)

The app is designed so adding new regions requires only new seed data files:

1. Create `backend/app/seed/regions/<region-slug>.json` with region groups and state entries (see `northeast.json` for format)
2. Create `backend/app/seed/seasons/<region-slug>.json` with month-by-month food availability templates
3. Add any region-specific foods to `backend/app/seed/foods.json` (the food catalog is global)
4. Delete `backend/seasonal_food_finder.sqlite3` and restart the backend

The seed script auto-discovers all JSON files in `regions/` and `seasons/`, and the frontend fetches available regions from the API at runtime -- no backend route changes or frontend component changes needed.

## Environment variables

| Variable | Where | Default | Description |
|---|---|---|---|
| `VITE_API_BASE_URL` | Frontend | `http://127.0.0.1:8000` | Backend API base URL |
| `SEASONAL_FOOD_DB_PATH` | Backend | `backend/seasonal_food_finder.sqlite3` | SQLite database file path |
