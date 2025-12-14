"""Policy data models for InsuranceIQ."""

from datetime import date
from enum import Enum
from typing import Optional
from pydantic import BaseModel, Field


class ValuationType(str, Enum):
    """Valuation method for coverage."""
    REPLACEMENT_COST = "replacement_cost"
    ACTUAL_CASH_VALUE = "actual_cash_value"
    FUNCTIONAL_REPLACEMENT = "functional_replacement"


class Coverage(BaseModel):
    """Generic coverage with limit and optional details."""
    limit: Optional[int] = None
    per_person: Optional[int] = None
    per_accident: Optional[int] = None
    percentage: Optional[int] = None  # As percentage of dwelling
    valuation: Optional[ValuationType] = None
    deductible: Optional[int] = None


class Deductible(BaseModel):
    """Deductible structure for homeowners."""
    all_peril: Optional[int] = None
    wind_hail: Optional[int] = None  # Dollar amount or percentage
    wind_hail_percentage: Optional[float] = None  # If percentage-based
    hurricane: Optional[int] = None
    hurricane_percentage: Optional[float] = None
    earthquake: Optional[int] = None
    flood: Optional[int] = None


class HomeownersPolicy(BaseModel):
    """Homeowners insurance declaration page data."""
    carrier: Optional[str] = None
    policy_number: Optional[str] = None
    effective_date: Optional[date] = None
    expiration_date: Optional[date] = None
    insured_name: Optional[str] = None
    property_address: Optional[str] = None

    # Coverages
    dwelling: Optional[Coverage] = None  # Coverage A
    other_structures: Optional[Coverage] = None  # Coverage B
    personal_property: Optional[Coverage] = None  # Coverage C
    loss_of_use: Optional[Coverage] = None  # Coverage D
    liability: Optional[Coverage] = None  # Coverage E
    medical_payments: Optional[Coverage] = None  # Coverage F

    # Deductibles
    deductibles: Optional[Deductible] = None

    # Endorsements
    endorsements: list[str] = Field(default_factory=list)

    # Premium
    annual_premium: Optional[float] = None

    # Policy form
    policy_form: Optional[str] = None  # HO-3, HO-5, etc.

    # Raw text for reference
    raw_text: Optional[str] = None

    def get_dwelling_limit(self) -> int:
        """Get the dwelling coverage limit."""
        if self.dwelling and self.dwelling.limit:
            return self.dwelling.limit
        return 0

    def get_liability_limit(self) -> int:
        """Get the liability coverage limit."""
        if self.liability and self.liability.limit:
            return self.liability.limit
        return 0

    def has_endorsement(self, endorsement: str) -> bool:
        """Check if policy has a specific endorsement (case-insensitive partial match)."""
        endorsement_lower = endorsement.lower()
        return any(endorsement_lower in e.lower() for e in self.endorsements)


class Vehicle(BaseModel):
    """Vehicle information."""
    year: Optional[int] = None
    make: Optional[str] = None
    model: Optional[str] = None
    vin: Optional[str] = None
    use: Optional[str] = None  # Pleasure, commute, business


class Driver(BaseModel):
    """Driver information."""
    name: Optional[str] = None
    age: Optional[int] = None
    license_status: Optional[str] = None
    relationship: Optional[str] = None  # Insured, spouse, child


class AutoPolicy(BaseModel):
    """Auto insurance declaration page data."""
    carrier: Optional[str] = None
    policy_number: Optional[str] = None
    effective_date: Optional[date] = None
    expiration_date: Optional[date] = None
    insured_name: Optional[str] = None
    insured_address: Optional[str] = None

    # Coverages
    bodily_injury: Optional[Coverage] = None
    property_damage: Optional[Coverage] = None
    um_uim: Optional[Coverage] = None  # Uninsured/Underinsured motorist
    medical_payments: Optional[Coverage] = None
    pip: Optional[Coverage] = None  # Personal Injury Protection (if applicable)
    collision: Optional[Coverage] = None
    comprehensive: Optional[Coverage] = None
    rental_reimbursement: Optional[Coverage] = None
    roadside: Optional[Coverage] = None

    # Vehicles and Drivers
    vehicles: list[Vehicle] = Field(default_factory=list)
    drivers: list[Driver] = Field(default_factory=list)

    # Premium
    annual_premium: Optional[float] = None
    six_month_premium: Optional[float] = None

    # Raw text for reference
    raw_text: Optional[str] = None

    def get_bi_limits(self) -> tuple[int, int]:
        """Get bodily injury limits as (per_person, per_accident)."""
        if self.bodily_injury:
            return (
                self.bodily_injury.per_person or 0,
                self.bodily_injury.per_accident or 0
            )
        return (0, 0)

    def get_pd_limit(self) -> int:
        """Get property damage limit."""
        if self.property_damage and self.property_damage.limit:
            return self.property_damage.limit
        return 0
