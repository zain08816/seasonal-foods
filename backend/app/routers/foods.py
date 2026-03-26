from __future__ import annotations

import calendar
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import func
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import Food, Region, SeasonalAvailability
from ..schemas import (
    CategoryCountOut,
    FoodDetailOut,
    FoodOut,
    CategorySlug,
    Availability,
    RegionRefOut,
    FoodRegionMonthsOut,
    FoodMonthAvailabilityOut,
)


router = APIRouter(prefix="/api", tags=["foods"])


CATEGORY_SLUGS: List[CategorySlug] = ["fruit", "vegetable", "herb", "fungus", "seafood", "game"]

AVAIL_RANK: dict[str, int] = {"peak": 0, "moderate": 1, "light": 2}


@router.get("/foods", response_model=List[FoodOut])
def list_foods(
    category: Optional[CategorySlug] = Query(default=None),
    db: Session = Depends(get_db),
) -> List[FoodOut]:
    query = db.query(Food)
    if category:
        query = query.filter(Food.category == category)
    rows = query.order_by(Food.name.asc()).all()
    return [
        FoodOut(
            id=r.id,
            name=r.name,
            category=r.category,
            description=r.description,
            image_url=r.image_url,
            storage_tips=r.storage_tips,
        )
        for r in rows
    ]


@router.get("/foods/{id}", response_model=FoodDetailOut)
def get_food_detail(id: int, db: Session = Depends(get_db)) -> FoodDetailOut:
    food = db.query(Food).filter(Food.id == id).first()
    if food is None:
        raise HTTPException(status_code=404, detail="Food not found")

    rows = (
        db.query(SeasonalAvailability, Region)
        .join(Region, SeasonalAvailability.region_id == Region.id)
        .filter(SeasonalAvailability.food_id == id)
        .order_by(Region.id.asc(), SeasonalAvailability.month.asc())
        .all()
    )

    grouped: dict[int, tuple[Region, List[SeasonalAvailability]]] = {}
    for sa, region in rows:
        if region.id not in grouped:
            grouped[region.id] = (region, [])
        grouped[region.id][1].append(sa)

    availability_by_region: List[FoodRegionMonthsOut] = []
    for region_row, entries in grouped.values():
        region_ref = RegionRefOut(
            state_code=region_row.state_code,
            name=region_row.name,
            usda_zones=region_row.usda_zones,
        )
        months_out = [
            FoodMonthAvailabilityOut(
                month=e.month,
                month_name=calendar.month_name[e.month],
                availability=e.availability,  # type: ignore[arg-type]
                notes=e.notes,
            )
            for e in entries
        ]
        availability_by_region.append(
            FoodRegionMonthsOut(region=region_ref, months=months_out)
        )

    return FoodDetailOut(
        id=food.id,
        name=food.name,
        category=food.category,  # type: ignore[arg-type]
        description=food.description,
        image_url=food.image_url,
        storage_tips=food.storage_tips,
        availability_by_region=availability_by_region,
    )


CATEGORY_DISPLAY_NAMES: dict[str, str] = {
    "fruit": "Fruits",
    "vegetable": "Vegetables",
    "herb": "Herbs",
    "fungus": "Fungi",
    "seafood": "Seafood",
    "game": "Game",
}


@router.get("/categories", response_model=List[CategoryCountOut])
def list_categories(db: Session = Depends(get_db)) -> List[CategoryCountOut]:
    return [
        CategoryCountOut(
            slug=slug,
            name=CATEGORY_DISPLAY_NAMES[slug],
            count=db.query(func.count(Food.id)).filter(Food.category == slug).scalar() or 0,
        )
        for slug in CATEGORY_SLUGS
    ]

