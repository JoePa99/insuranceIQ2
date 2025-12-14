"""Property data models for InsuranceIQ."""

from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field


class ValueEstimate(BaseModel):
    """Property value estimates from various sources."""
    zillow: Optional[int] = None
    redfin: Optional[int] = None
    realtor: Optional[int] = None
    tax_assessed: Optional[int] = None
    estimated_market: Optional[int] = None  # Our best estimate

    def get_best_estimate(self) -> int:
        """Return the best available estimate, preferring Zillow/Redfin."""
        if self.estimated_market:
            return self.estimated_market
        if self.zillow:
            return self.zillow
        if self.redfin:
            return self.redfin
        if self.realtor:
            return self.realtor
        if self.tax_assessed:
            # Tax assessed is often 80-90% of market value
            return int(self.tax_assessed * 1.15)
        return 0


class PropertyDetails(BaseModel):
    """Physical property details."""
    year_built: Optional[int] = None
    square_footage: Optional[int] = None
    lot_size_sqft: Optional[int] = None
    lot_size_acres: Optional[float] = None
    bedrooms: Optional[int] = None
    bathrooms: Optional[float] = None
    stories: Optional[int] = None
    construction_type: Optional[str] = None  # Frame, masonry, etc.
    exterior_material: Optional[str] = None  # Brick, vinyl, etc.
    roof_type: Optional[str] = None  # Asphalt shingle, metal, tile
    roof_age_years: Optional[int] = None
    heating_type: Optional[str] = None
    cooling_type: Optional[str] = None
    garage: Optional[str] = None  # Attached 2-car, detached, none
    foundation_type: Optional[str] = None  # Slab, crawl, basement

    def get_age(self) -> int:
        """Get the age of the property in years."""
        if self.year_built:
            return datetime.now().year - self.year_built
        return 0


class RiskFactors(BaseModel):
    """Risk factors identified for the property."""
    # Flood
    flood_zone: Optional[str] = None  # X, A, AE, V, VE, etc.
    flood_zone_description: Optional[str] = None
    in_sfha: bool = False  # Special Flood Hazard Area

    # Fire
    fire_protection_class: Optional[int] = None  # 1-10, lower is better
    distance_to_fire_station_miles: Optional[float] = None
    distance_to_fire_hydrant_feet: Optional[int] = None

    # Visible risks (from imagery or descriptions)
    has_pool: bool = False
    has_trampoline: bool = False
    has_detached_structures: bool = False
    has_dog: Optional[bool] = None  # May not be determinable

    # Location risks
    coastal_zone: bool = False
    wildfire_risk: Optional[str] = None  # Low, moderate, high
    hail_risk: Optional[str] = None
    crime_rate: Optional[str] = None  # Low, moderate, high

    # Other
    visible_risks: list[str] = Field(default_factory=list)
    notes: list[str] = Field(default_factory=list)


class Source(BaseModel):
    """Citation source for research data."""
    name: str
    url: Optional[str] = None
    accessed_date: datetime = Field(default_factory=datetime.now)
    notes: Optional[str] = None


class PropertyResearch(BaseModel):
    """Complete property research results."""
    address: str
    address_normalized: Optional[str] = None  # Standardized address format

    # Value data
    value_estimates: ValueEstimate = Field(default_factory=ValueEstimate)

    # Property details
    details: PropertyDetails = Field(default_factory=PropertyDetails)

    # Risk assessment
    risk_factors: RiskFactors = Field(default_factory=RiskFactors)

    # Ownership info (if available)
    owner_name: Optional[str] = None
    last_sale_date: Optional[str] = None
    last_sale_price: Optional[int] = None

    # Sources
    sources: list[Source] = Field(default_factory=list)

    # Research metadata
    research_date: datetime = Field(default_factory=datetime.now)
    confidence_level: Optional[str] = None  # High, medium, low

    def get_replacement_cost_estimate(self) -> int:
        """
        Estimate replacement cost based on square footage.
        NC average is roughly $150-200/sqft for standard construction.
        """
        if self.details.square_footage:
            # Use $175/sqft as baseline, adjust for age and construction
            base_cost = self.details.square_footage * 175

            # Adjust for construction type
            if self.details.construction_type:
                if "brick" in self.details.construction_type.lower():
                    base_cost *= 1.1
                elif "custom" in self.details.construction_type.lower():
                    base_cost *= 1.25

            return int(base_cost)

        # Fall back to market value if no sqft
        market_value = self.value_estimates.get_best_estimate()
        if market_value:
            # Replacement cost is typically 80-100% of market value
            # (land has value but doesn't need to be rebuilt)
            return int(market_value * 0.85)

        return 0

    def add_source(self, name: str, url: Optional[str] = None, notes: Optional[str] = None):
        """Add a source citation."""
        self.sources.append(Source(name=name, url=url, notes=notes))
