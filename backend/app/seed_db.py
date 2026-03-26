from __future__ import annotations

import json
from pathlib import Path
from typing import Any

from sqlalchemy.orm import Session

from .database import SessionLocal
from .models import Food, Region, RegionGroup, SeasonalAvailability, StateProfile


def _load_json(path: Path) -> Any:
    with path.open("r", encoding="utf-8") as f:
        return json.load(f)


def _seed_region_groups(db: Session, data: dict[str, Any]) -> None:
    for rg in data.get("region_groups", []):
        existing = db.query(RegionGroup).filter(RegionGroup.slug == rg["slug"]).first()
        if existing:
            continue
        db.add(
            RegionGroup(
                id=rg["id"],
                name=rg["name"],
                slug=rg["slug"],
                description=rg.get("description"),
            )
        )
    db.commit()


def _seed_regions(db: Session, data: dict[str, Any]) -> None:
    for r in data.get("regions", []):
        existing = db.query(Region).filter(Region.state_code == r["state_code"]).first()
        if existing:
            continue
        db.add(
            Region(
                id=r["id"],
                region_group_id=r["region_group_id"],
                name=r["name"],
                state_code=r["state_code"],
                usda_zones=r["usda_zones"],
                latitude=r.get("latitude"),
                longitude=r.get("longitude"),
                description=r["description"],
            )
        )
    db.commit()


def _seed_foods(db: Session, foods_path: Path) -> None:
    foods_data = _load_json(foods_path)
    for f in foods_data:
        existing = db.query(Food).filter(Food.id == f["id"]).first()
        if existing:
            continue
        db.add(
            Food(
                id=f["id"],
                name=f["name"],
                category=f["category"],
                description=f["description"],
                image_url=f.get("image_url"),
                storage_tips=f.get("storage_tips"),
            )
        )
    db.commit()


def _seed_seasons(db: Session, seasons_path: Path, region_id: int) -> None:
    seasons_data = _load_json(seasons_path)
    templates = seasons_data.get("availability_templates", [])

    avail_rank = {"peak": 0, "moderate": 1, "light": 2}
    resolved: dict[tuple[int, int], dict[str, Any]] = {}

    for template in templates:
        food_id = int(template["food_id"])
        availability = str(template["availability"])
        months = template.get("months", [])
        notes = template.get("notes")

        for month_num in months:
            m = int(month_num)
            key = (food_id, m)
            current = resolved.get(key)
            if current is None or avail_rank[availability] < avail_rank[current["availability"]]:
                resolved[key] = {"availability": availability, "notes": notes}

    for (food_id, month_num), payload in resolved.items():
        existing = (
            db.query(SeasonalAvailability)
            .filter(
                SeasonalAvailability.food_id == food_id,
                SeasonalAvailability.region_id == region_id,
                SeasonalAvailability.month == month_num,
            )
            .first()
        )
        if existing:
            continue

        db.add(
            SeasonalAvailability(
                food_id=food_id,
                region_id=region_id,
                month=month_num,
                availability=payload["availability"],
                notes=payload["notes"],
            )
        )
    db.commit()


def _seed_state_profiles(db: Session, profiles_path: Path) -> None:
    data = _load_json(profiles_path)
    for sp in data.get("state_profiles", []):
        region_id = int(sp["region_id"])
        existing = db.query(StateProfile).filter(StateProfile.region_id == region_id).first()
        if existing:
            continue

        db.add(
            StateProfile(
                region_id=region_id,
                nickname=sp["nickname"],
                capital=sp["capital"],
                top_crops=sp.get("top_crops", []),
                agricultural_highlights=sp["agricultural_highlights"],
                fun_facts=sp.get("fun_facts", []),
                resource_links=sp.get("resource_links", []),
            )
        )
    db.commit()


def seed_database_if_empty() -> None:
    db = SessionLocal()
    try:
        has_seasonal = db.query(SeasonalAvailability).first() is not None
        has_state_profiles = db.query(StateProfile).first() is not None
        if has_seasonal and has_state_profiles:
            return

        seed_dir = Path(__file__).resolve().parent / "seed"
        state_profiles_dir = seed_dir / "state_profiles"

        if not has_seasonal:
            foods_path = seed_dir / "foods.json"

            _seed_foods(db, foods_path)

            regions_dir = seed_dir / "regions"
            state_seasons_dir = seed_dir / "seasons" / "states"

            for region_file in sorted(regions_dir.glob("*.json")):
                region_data = _load_json(region_file)
                _seed_region_groups(db, region_data)
                _seed_regions(db, region_data)

                for state in region_data.get("regions", []):
                    state_code = state["state_code"].lower()
                    season_file = state_seasons_dir / f"{state_code}.json"
                    if season_file.exists():
                        _seed_seasons(db, season_file, region_id=state["id"])

        if not has_state_profiles and state_profiles_dir.is_dir():
            for profile_file in sorted(state_profiles_dir.glob("*.json")):
                _seed_state_profiles(db, profile_file)
    finally:
        db.close()
