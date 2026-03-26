from __future__ import annotations

from sqlalchemy import Column, Float, ForeignKey, Integer, JSON, String, Text, UniqueConstraint
from sqlalchemy.orm import relationship

from .database import Base


class RegionGroup(Base):
    __tablename__ = "region_groups"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False, unique=True)
    slug = Column(String(100), nullable=False, unique=True)
    description = Column(Text, nullable=True)

    regions = relationship("Region", back_populates="region_group", cascade="all, delete-orphan")


class Region(Base):
    __tablename__ = "regions"

    id = Column(Integer, primary_key=True, index=True)
    region_group_id = Column(Integer, ForeignKey("region_groups.id"), nullable=False, index=True)

    name = Column(String(100), nullable=False)
    state_code = Column(String(2), nullable=False, unique=True, index=True)
    usda_zones = Column(String(20), nullable=False)

    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)

    description = Column(Text, nullable=False)

    region_group = relationship("RegionGroup", back_populates="regions")
    state_profile = relationship(
        "StateProfile",
        back_populates="region",
        uselist=False,
        cascade="all, delete-orphan",
    )
    seasonal_availability = relationship(
        "SeasonalAvailability", back_populates="region", cascade="all, delete-orphan"
    )


class Food(Base):
    __tablename__ = "foods"

    id = Column(Integer, primary_key=True, index=True)

    name = Column(String(100), nullable=False, unique=True, index=True)
    category = Column(String(20), nullable=False, index=True)
    description = Column(Text, nullable=False)

    image_url = Column(String(255), nullable=True)
    storage_tips = Column(Text, nullable=True)

    seasonal_availability = relationship(
        "SeasonalAvailability", back_populates="food", cascade="all, delete-orphan"
    )


class SeasonalAvailability(Base):
    __tablename__ = "seasonal_availability"

    id = Column(Integer, primary_key=True, index=True)
    food_id = Column(Integer, ForeignKey("foods.id"), nullable=False, index=True)
    region_id = Column(Integer, ForeignKey("regions.id"), nullable=False, index=True)
    month = Column(Integer, nullable=False, index=True)  # 1-12
    availability = Column(String(10), nullable=False, index=True)  # peak/moderate/light
    notes = Column(Text, nullable=True)

    __table_args__ = (UniqueConstraint("food_id", "region_id", "month", name="uq_food_region_month"),)

    food = relationship("Food", back_populates="seasonal_availability")
    region = relationship("Region", back_populates="seasonal_availability")


class StateProfile(Base):
    __tablename__ = "state_profiles"

    id = Column(Integer, primary_key=True, index=True)
    region_id = Column(Integer, ForeignKey("regions.id"), nullable=False, unique=True, index=True)

    nickname = Column(String(100), nullable=False)
    capital = Column(String(100), nullable=False)
    top_crops = Column(JSON, nullable=False)  # list[str]
    agricultural_highlights = Column(Text, nullable=False)
    fun_facts = Column(JSON, nullable=False)  # list[str]
    resource_links = Column(JSON, nullable=False)  # list[{"label": str, "url": str}]

    region = relationship("Region", back_populates="state_profile")

