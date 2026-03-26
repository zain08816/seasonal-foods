from __future__ import annotations

from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import func
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import Region, RegionGroup, StateProfile
from ..schemas import RegionDetailOut, RegionGroupOut, RegionOut


router = APIRouter(prefix="/api", tags=["regions"])


@router.get("/region-groups", response_model=List[RegionGroupOut])
def list_region_groups(db: Session = Depends(get_db)) -> List[RegionGroupOut]:
    rows = (
        db.query(
            RegionGroup.id,
            RegionGroup.name,
            RegionGroup.slug,
            RegionGroup.description,
            func.count(Region.id).label("region_count"),
        )
        .outerjoin(Region, Region.region_group_id == RegionGroup.id)
        .group_by(RegionGroup.id)
        .order_by(RegionGroup.name.asc())
        .all()
    )
    return [
        RegionGroupOut(
            id=r.id,
            name=r.name,
            slug=r.slug,
            description=r.description,
            region_count=r.region_count,
        )
        for r in rows
    ]


@router.get("/regions", response_model=List[RegionOut])
def list_regions(
    group: Optional[str] = Query(default=None, description="Region group slug"),
    db: Session = Depends(get_db),
) -> List[RegionOut]:
    query = (
        db.query(
            Region.id,
            Region.name,
            Region.state_code,
            Region.usda_zones,
            Region.latitude,
            Region.longitude,
            Region.region_group_id,
            RegionGroup.id.label("rg_id"),
            RegionGroup.name.label("rg_name"),
            RegionGroup.slug.label("rg_slug"),
        )
        .join(RegionGroup, Region.region_group_id == RegionGroup.id)
        .order_by(Region.name.asc())
    )

    if group:
        query = query.filter(RegionGroup.slug == group)

    rows = query.all()
    out: List[RegionOut] = []
    for r in rows:
        out.append(
            RegionOut(
                id=r.id,
                name=r.name,
                state_code=r.state_code,
                usda_zones=r.usda_zones,
                latitude=r.latitude,
                longitude=r.longitude,
                region_group={"id": r.rg_id, "name": r.rg_name, "slug": r.rg_slug},
            )
        )
    return out


@router.get("/regions/{state_code}", response_model=RegionDetailOut)
def get_region(state_code: str, db: Session = Depends(get_db)) -> RegionDetailOut:
    code = state_code.upper()
    row = (
        db.query(
            Region.id,
            Region.name,
            Region.state_code,
            Region.usda_zones,
            Region.latitude,
            Region.longitude,
            Region.description,
            RegionGroup.id.label("rg_id"),
            RegionGroup.name.label("rg_name"),
            RegionGroup.slug.label("rg_slug"),
            StateProfile.nickname.label("sp_nickname"),
            StateProfile.capital.label("sp_capital"),
            StateProfile.top_crops.label("sp_top_crops"),
            StateProfile.agricultural_highlights.label("sp_agricultural_highlights"),
            StateProfile.fun_facts.label("sp_fun_facts"),
            StateProfile.resource_links.label("sp_resource_links"),
        )
        .join(RegionGroup, Region.region_group_id == RegionGroup.id)
        .outerjoin(StateProfile, StateProfile.region_id == Region.id)
        .filter(Region.state_code == code)
        .first()
    )

    if row is None:
        raise HTTPException(status_code=404, detail="Region not found")

    return RegionDetailOut(
        id=row.id,
        name=row.name,
        state_code=row.state_code,
        usda_zones=row.usda_zones,
        latitude=row.latitude,
        longitude=row.longitude,
        description=row.description,
        region_group={"id": row.rg_id, "name": row.rg_name, "slug": row.rg_slug},
        state_profile=(
            None
            if row.sp_nickname is None
            else {
                "nickname": row.sp_nickname,
                "capital": row.sp_capital,
                "top_crops": row.sp_top_crops or [],
                "agricultural_highlights": row.sp_agricultural_highlights,
                "fun_facts": row.sp_fun_facts or [],
                "resource_links": row.sp_resource_links or [],
            }
        ),
    )

