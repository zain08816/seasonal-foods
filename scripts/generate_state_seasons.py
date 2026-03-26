#!/usr/bin/env python3
"""Regenerate backend/app/seed/seasons/states/*.json from curated regional baselines (git HEAD)
and per-state locality rules in backend/app/seed/food_locality.py.

Requires git (reads historical regional JSON via `git show`).

Usage, from repo root:
  PYTHONPATH=backend python3 scripts/generate_state_seasons.py
"""

from __future__ import annotations

import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
STATE_DIR = ROOT / "backend" / "app" / "seed" / "seasons" / "states"

sys.path.insert(0, str(ROOT / "backend"))

from app.seed.curated_region_templates import templates_for_region  # noqa: E402
from app.seed.food_locality import (  # noqa: E402
    food_is_local_to_state,
    scrub_hawaii_notes,
)

# Region keys must match curated_region_templates.CURATED_BUILDERS and git filenames.
STATE_TO_REGION: dict[str, str] = {
    "NJ": "northeast",
    "NY": "northeast",
    "PA": "northeast",
    "CT": "northeast",
    "MA": "northeast",
    "ME": "northeast",
    "NH": "northeast",
    "VT": "northeast",
    "RI": "northeast",
    "DE": "northeast",
    "MD": "northeast",
    "OH": "midwest",
    "IN": "midwest",
    "IL": "midwest",
    "MI": "midwest",
    "WI": "midwest",
    "MN": "midwest",
    "IA": "midwest",
    "MO": "midwest",
    "VA": "southeast",
    "WV": "southeast",
    "NC": "southeast",
    "SC": "southeast",
    "GA": "southeast",
    "FL": "southeast",
    "AL": "southeast",
    "MS": "southeast",
    "TN": "southeast",
    "KY": "southeast",
    "AR": "southeast",
    "LA": "southeast",
    "TX": "south-central",
    "OK": "south-central",
    "ND": "great-plains",
    "SD": "great-plains",
    "NE": "great-plains",
    "KS": "great-plains",
    "MT": "mountain-west",
    "WY": "mountain-west",
    "CO": "mountain-west",
    "NM": "mountain-west",
    "UT": "mountain-west",
    "AZ": "mountain-west",
    "NV": "mountain-west",
    "WA": "pacific-northwest",
    "OR": "pacific-northwest",
    "ID": "pacific-northwest",
    "AK": "pacific-northwest",
    "CA": "california-hawaii",
    "HI": "california-hawaii",
}


def build_state_payload(state_code: str) -> dict:
    upper = state_code.upper()
    region = STATE_TO_REGION[upper]
    templates = templates_for_region(region)
    filtered = [
        t
        for t in templates
        if food_is_local_to_state(int(t["food_id"]), upper)
    ]
    if upper == "HI":
        filtered = scrub_hawaii_notes(filtered)
    return {"availability_templates": filtered}


def main() -> None:
    STATE_DIR.mkdir(parents=True, exist_ok=True)
    for code in sorted(STATE_TO_REGION.keys()):
        data = build_state_payload(code)
        path = STATE_DIR / f"{code.lower()}.json"
        path.write_text(json.dumps(data, indent=2) + "\n", encoding="utf-8")
        n = len(data["availability_templates"])
        print(f"Wrote {path.name} ({n} template rows)")


if __name__ == "__main__":
    main()
