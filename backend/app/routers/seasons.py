from __future__ import annotations

import calendar
from typing import Dict, List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import and_
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import Food, Region, SeasonalAvailability
from ..schemas import (
    Availability,
    CategorySlug,
    SeasonalCategoryGroupOut,
    SeasonalFoodItemOut,
    SeasonalResponseOut,
)


router = APIRouter(prefix="/api", tags=["seasons"])


CATEGORY_SLUGS: List[CategorySlug] = ["fruit", "vegetable", "herb", "fungus", "seafood", "game"]
AVAIL_RANK: dict[Availability, int] = {"peak": 0, "moderate": 1, "light": 2}


@router.get("/seasonal", response_model=SeasonalResponseOut)
def seasonal_for_region(
    region: str = Query(..., description="State code, e.g., NJ"),
    date: Optional[str] = Query(default=None, description="ISO date YYYY-MM-DD"),
    month: Optional[int] = Query(default=None, ge=1, le=12),
    category: Optional[CategorySlug] = Query(default=None),
    db: Session = Depends(get_db),
) -> SeasonalResponseOut:
    if not date and month is None:
        raise HTTPException(status_code=400, detail="Either 'date' or 'month' query parameter is required")

    code = region.upper()

    month_num: int
    if date:
        try:
            month_num = int(date.split("-")[1])
        except Exception as exc:  # noqa: BLE001
            raise HTTPException(status_code=400, detail="Invalid 'date' format. Expected YYYY-MM-DD") from exc
    else:
        month_num = int(month)  # type: ignore[arg-type]

    region_row = db.query(Region).filter(Region.state_code == code).first()
    if region_row is None:
        raise HTTPException(status_code=404, detail=f"Region '{code}' not found")

    # Fetch seasonal availability entries for (region, month)
    q = (
        db.query(SeasonalAvailability, Food)
        .join(Food, SeasonalAvailability.food_id == Food.id)
        .filter(SeasonalAvailability.region_id == region_row.id)
        .filter(SeasonalAvailability.month == month_num)
    )

    if category:
        q = q.filter(Food.category == category)

    rows = q.all()

    # Build categories with consistent keys.
    categories: Dict[CategorySlug, SeasonalCategoryGroupOut] = {
        slug: SeasonalCategoryGroupOut(count=0, items=[]) for slug in CATEGORY_SLUGS
    }

    # Sort items: peak -> moderate -> light, then name
    def sort_key(item: SeasonalAvailability, food: Food) -> tuple[int, str]:
        return (AVAIL_RANK[item.availability], food.name.lower())

    sorted_rows = sorted(rows, key=lambda rf: sort_key(rf[0], rf[1]))

    for sa, food in sorted_rows:
        slug: CategorySlug = food.category  # type: ignore[assignment]
        item_out = SeasonalFoodItemOut(
            id=food.id,
            name=food.name,
            category=food.category,  # type: ignore[arg-type]
            description=food.description,
            availability=sa.availability,  # type: ignore[arg-type]
            notes=sa.notes,
            storage_tips=food.storage_tips,
        )
        group = categories[slug]
        group.items.append(item_out)
        group.count += 1

    total_count = sum(g.count for g in categories.values())

    region_ref = {"state_code": region_row.state_code, "name": region_row.name, "usda_zones": region_row.usda_zones}

    return SeasonalResponseOut(
        region=region_ref,  # type: ignore[arg-type]
        month=month_num,
        month_name=calendar.month_name[month_num],
        total_count=total_count,
        categories=categories,
    )

