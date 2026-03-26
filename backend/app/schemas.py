from __future__ import annotations

from typing import Dict, List, Literal, Optional

from pydantic import BaseModel


CategorySlug = Literal["fruit", "vegetable", "herb", "fungus", "seafood", "game"]
Availability = Literal["peak", "moderate", "light"]


class RegionGroupOut(BaseModel):
    id: int
    name: str
    slug: str
    description: Optional[str] = None
    region_count: int


class RegionRefOut(BaseModel):
    state_code: str
    name: str
    usda_zones: str


class RegionOut(BaseModel):
    id: int
    name: str
    state_code: str
    usda_zones: str
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    region_group: Dict[str, str | int]


class StateProfileLinkOut(BaseModel):
    label: str
    url: str


class StateProfileOut(BaseModel):
    nickname: str
    capital: str
    top_crops: List[str]
    agricultural_highlights: str
    fun_facts: List[str]
    resource_links: List[StateProfileLinkOut]


class RegionDetailOut(BaseModel):
    id: int
    name: str
    state_code: str
    usda_zones: str
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    description: str
    region_group: Dict[str, str | int]
    state_profile: Optional[StateProfileOut] = None


class CategoryCountOut(BaseModel):
    slug: CategorySlug
    name: str
    count: int


class SeasonalFoodItemOut(BaseModel):
    id: int
    name: str
    category: CategorySlug
    description: str
    availability: Availability
    notes: Optional[str] = None
    storage_tips: Optional[str] = None


class SeasonalCategoryGroupOut(BaseModel):
    count: int
    items: List[SeasonalFoodItemOut]


class SeasonalResponseOut(BaseModel):
    region: RegionRefOut
    month: int
    month_name: str
    total_count: int
    categories: Dict[CategorySlug, SeasonalCategoryGroupOut]


class FoodOut(BaseModel):
    id: int
    name: str
    category: CategorySlug
    description: str
    image_url: Optional[str] = None
    storage_tips: Optional[str] = None


class FoodMonthAvailabilityOut(BaseModel):
    month: int
    month_name: str
    availability: Availability
    notes: Optional[str] = None


class FoodRegionMonthsOut(BaseModel):
    region: RegionRefOut
    months: List[FoodMonthAvailabilityOut]


class FoodDetailOut(BaseModel):
    id: int
    name: str
    category: CategorySlug
    description: str
    image_url: Optional[str] = None
    storage_tips: Optional[str] = None
    availability_by_region: List[FoodRegionMonthsOut]

