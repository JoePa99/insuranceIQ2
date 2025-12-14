"""Carrier appetite matching system for InsuranceIQ.

Provides carrier recommendations based on risk characteristics.
"""

from dataclasses import dataclass, field
from enum import Enum
from typing import Optional


class AppetiteLevel(str, Enum):
    """Carrier appetite level for a risk type."""
    HIGH = "High"
    MEDIUM = "Medium"
    LOW = "Low"
    NO = "No"


class LineType(str, Enum):
    """Insurance line type."""
    PERSONAL = "personal"
    COMMERCIAL = "commercial"
    BOTH = "both"


@dataclass
class AppetiteEntry:
    """Carrier appetite for a specific category."""
    category: str
    level: AppetiteLevel
    notes: Optional[str] = None


@dataclass
class CarrierAppetite:
    """Carrier information with appetite details."""
    name: str
    line_type: LineType
    lines: list[str]
    appetite: list[AppetiteEntry]
    strengths: list[str]
    considerations: list[str]
    am_best_rating: Optional[str] = None
    contact: Optional[str] = None

    def get_appetite_for(self, category: str) -> Optional[AppetiteEntry]:
        """Get appetite for a specific category."""
        category_lower = category.lower()
        for apt in self.appetite:
            if category_lower in apt.category.lower():
                return apt
        return None

    def has_high_appetite_for(self, category: str) -> bool:
        """Check if carrier has high appetite for category."""
        apt = self.get_appetite_for(category)
        return apt is not None and apt.level == AppetiteLevel.HIGH


# NC Carrier Database
NC_CARRIERS: list[CarrierAppetite] = [
    CarrierAppetite(
        name="NC Farm Bureau",
        line_type=LineType.BOTH,
        lines=["Homeowners", "Auto", "Farm", "Commercial"],
        appetite=[
            AppetiteEntry("Standard Homeowners", AppetiteLevel.HIGH, "Dominant in rural NC"),
            AppetiteEntry("Coastal Property", AppetiteLevel.LOW, "Limited coastal appetite"),
            AppetiteEntry("Auto", AppetiteLevel.HIGH),
            AppetiteEntry("Farm/Ranch", AppetiteLevel.HIGH),
            AppetiteEntry("Small Commercial", AppetiteLevel.MEDIUM),
        ],
        strengths=["Competitive rates in rural areas", "Local agents throughout NC", "Strong farm program"],
        considerations=["Membership required", "Less competitive in urban areas"],
        am_best_rating="A",
    ),
    CarrierAppetite(
        name="State Farm",
        line_type=LineType.BOTH,
        lines=["Homeowners", "Auto", "Life", "Commercial"],
        appetite=[
            AppetiteEntry("Standard Homeowners", AppetiteLevel.HIGH),
            AppetiteEntry("Coastal Property", AppetiteLevel.MEDIUM, "Selective in high-wind areas"),
            AppetiteEntry("Auto", AppetiteLevel.HIGH),
            AppetiteEntry("New Drivers", AppetiteLevel.MEDIUM),
            AppetiteEntry("Small Commercial", AppetiteLevel.MEDIUM),
        ],
        strengths=["Brand recognition", "Full product suite", "Claims service"],
        considerations=["Captive agents only", "Can be pricey"],
        am_best_rating="A++",
    ),
    CarrierAppetite(
        name="Travelers",
        line_type=LineType.BOTH,
        lines=["Homeowners", "Auto", "Commercial", "Specialty"],
        appetite=[
            AppetiteEntry("Standard Homeowners", AppetiteLevel.HIGH),
            AppetiteEntry("High-Value Homes", AppetiteLevel.HIGH),
            AppetiteEntry("Coastal Property", AppetiteLevel.MEDIUM),
            AppetiteEntry("Small Commercial", AppetiteLevel.HIGH),
            AppetiteEntry("Contractors", AppetiteLevel.HIGH),
            AppetiteEntry("Professional Liability", AppetiteLevel.HIGH),
            AppetiteEntry("Restaurant", AppetiteLevel.MEDIUM, "Selective on class"),
        ],
        strengths=["Broad commercial appetite", "Package policies", "Risk engineering"],
        considerations=["Pricing can be high", "Underwriting standards strict"],
        am_best_rating="A++",
    ),
    CarrierAppetite(
        name="Erie Insurance",
        line_type=LineType.BOTH,
        lines=["Homeowners", "Auto", "Commercial"],
        appetite=[
            AppetiteEntry("Standard Homeowners", AppetiteLevel.HIGH),
            AppetiteEntry("Auto", AppetiteLevel.HIGH),
            AppetiteEntry("Multi-Policy", AppetiteLevel.HIGH, "Best rates with bundling"),
            AppetiteEntry("Small Commercial", AppetiteLevel.HIGH),
        ],
        strengths=["Excellent rates for bundled policies", "Strong claims service", "Rate stability"],
        considerations=["Limited to certain states", "Requires auto for best home rates"],
        am_best_rating="A+",
    ),
    CarrierAppetite(
        name="NC Beach Plan (NCJUA)",
        line_type=LineType.PERSONAL,
        lines=["Wind/Hail Only"],
        appetite=[
            AppetiteEntry("Coastal Wind Coverage", AppetiteLevel.HIGH, "Market of last resort"),
            AppetiteEntry("Beach Properties", AppetiteLevel.HIGH),
        ],
        strengths=["Covers wind where others won't", "Required for many coastal mortgages"],
        considerations=["Wind/hail only - need separate policy for other perils", "Higher rates", "High deductibles"],
        am_best_rating=None,
    ),
    CarrierAppetite(
        name="Hartford",
        line_type=LineType.BOTH,
        lines=["Homeowners", "Auto", "Commercial", "Workers Comp"],
        appetite=[
            AppetiteEntry("Standard Homeowners", AppetiteLevel.HIGH),
            AppetiteEntry("Small Commercial", AppetiteLevel.HIGH),
            AppetiteEntry("AARP Members", AppetiteLevel.HIGH, "Exclusive AARP partner"),
            AppetiteEntry("Workers Compensation", AppetiteLevel.HIGH),
            AppetiteEntry("Professional Liability", AppetiteLevel.HIGH),
            AppetiteEntry("Contractors", AppetiteLevel.HIGH),
        ],
        strengths=["Strong commercial programs", "AARP partnership for 50+", "Workers comp expertise"],
        considerations=["Personal lines focused on AARP market"],
        am_best_rating="A+",
    ),
    CarrierAppetite(
        name="Progressive",
        line_type=LineType.PERSONAL,
        lines=["Auto", "Homeowners", "Motorcycle", "RV"],
        appetite=[
            AppetiteEntry("Auto", AppetiteLevel.HIGH),
            AppetiteEntry("Non-Standard Auto", AppetiteLevel.HIGH, "Good for drivers with violations"),
            AppetiteEntry("Motorcycle/RV", AppetiteLevel.HIGH),
            AppetiteEntry("Homeowners", AppetiteLevel.MEDIUM),
        ],
        strengths=["Competitive auto rates", "Good for non-standard risks", "Easy online quoting"],
        considerations=["Home rates often not competitive", "Bundle savings limited"],
        am_best_rating="A+",
    ),
    CarrierAppetite(
        name="Nationwide",
        line_type=LineType.BOTH,
        lines=["Homeowners", "Auto", "Commercial", "Farm"],
        appetite=[
            AppetiteEntry("Standard Homeowners", AppetiteLevel.HIGH),
            AppetiteEntry("Auto", AppetiteLevel.HIGH),
            AppetiteEntry("Small Commercial", AppetiteLevel.HIGH),
            AppetiteEntry("Farm/Agribusiness", AppetiteLevel.HIGH),
        ],
        strengths=["Broad product portfolio", "Strong farm program", "Multi-policy discounts"],
        considerations=["Rates vary significantly by region"],
        am_best_rating="A+",
    ),
    CarrierAppetite(
        name="Markel",
        line_type=LineType.COMMERCIAL,
        lines=["Specialty Commercial", "Professional Liability", "Excess"],
        appetite=[
            AppetiteEntry("Hard-to-Place Commercial", AppetiteLevel.HIGH),
            AppetiteEntry("Professional Liability", AppetiteLevel.HIGH),
            AppetiteEntry("Contractors", AppetiteLevel.HIGH),
            AppetiteEntry("Restaurant", AppetiteLevel.MEDIUM),
            AppetiteEntry("Artisan Contractors", AppetiteLevel.HIGH),
        ],
        strengths=["Specialty market expertise", "Flexible underwriting", "Good for difficult classes"],
        considerations=["Surplus lines - not admitted in all cases"],
        am_best_rating="A",
    ),
    CarrierAppetite(
        name="Berkshire Hathaway GUARD",
        line_type=LineType.COMMERCIAL,
        lines=["Small Commercial", "BOP", "Workers Comp"],
        appetite=[
            AppetiteEntry("Small Commercial BOP", AppetiteLevel.HIGH),
            AppetiteEntry("Contractors", AppetiteLevel.HIGH),
            AppetiteEntry("Professional Services", AppetiteLevel.HIGH),
            AppetiteEntry("Workers Compensation", AppetiteLevel.HIGH),
        ],
        strengths=["Competitive small commercial rates", "Easy submission process", "Broad appetite"],
        considerations=["Online-focused, less agent support"],
        am_best_rating="A++",
    ),
    CarrierAppetite(
        name="Hiscox",
        line_type=LineType.COMMERCIAL,
        lines=["Professional Liability", "General Liability", "Cyber"],
        appetite=[
            AppetiteEntry("Professional Liability", AppetiteLevel.HIGH),
            AppetiteEntry("Small Business GL", AppetiteLevel.HIGH),
            AppetiteEntry("Technology E&O", AppetiteLevel.HIGH),
            AppetiteEntry("Cyber Liability", AppetiteLevel.HIGH),
        ],
        strengths=["Great for small professional services", "Easy online quoting", "Tech focus"],
        considerations=["Limited to certain classes", "Premium minimum applies"],
        am_best_rating="A",
    ),
    CarrierAppetite(
        name="CNA",
        line_type=LineType.COMMERCIAL,
        lines=["Professional Liability", "Commercial Property", "Workers Comp"],
        appetite=[
            AppetiteEntry("Professional Liability", AppetiteLevel.HIGH),
            AppetiteEntry("Accountant E&O", AppetiteLevel.HIGH, "Specialty program"),
            AppetiteEntry("Lawyer E&O", AppetiteLevel.HIGH),
            AppetiteEntry("Mid-Market Commercial", AppetiteLevel.HIGH),
        ],
        strengths=["Strong professional liability programs", "Middle market expertise"],
        considerations=["Less competitive for small accounts"],
        am_best_rating="A",
    ),
]


def match_carriers(
    risk_categories: list[str],
    line_type: Optional[LineType] = None,
    min_appetite: AppetiteLevel = AppetiteLevel.MEDIUM,
) -> list[tuple[CarrierAppetite, list[AppetiteEntry]]]:
    """
    Match carriers based on risk categories.

    Args:
        risk_categories: List of risk categories to match
        line_type: Filter by line type (personal, commercial, both)
        min_appetite: Minimum appetite level to include

    Returns:
        List of (carrier, matching_appetites) tuples, sorted by match quality
    """
    results = []
    min_levels = {
        AppetiteLevel.HIGH: [AppetiteLevel.HIGH],
        AppetiteLevel.MEDIUM: [AppetiteLevel.HIGH, AppetiteLevel.MEDIUM],
        AppetiteLevel.LOW: [AppetiteLevel.HIGH, AppetiteLevel.MEDIUM, AppetiteLevel.LOW],
    }
    acceptable_levels = min_levels.get(min_appetite, [AppetiteLevel.HIGH, AppetiteLevel.MEDIUM])

    for carrier in NC_CARRIERS:
        # Filter by line type
        if line_type and carrier.line_type != LineType.BOTH and carrier.line_type != line_type:
            continue

        # Find matching appetites
        matches = []
        for category in risk_categories:
            apt = carrier.get_appetite_for(category)
            if apt and apt.level in acceptable_levels:
                matches.append(apt)

        if matches:
            results.append((carrier, matches))

    # Sort by number of high-appetite matches, then total matches
    def sort_key(item: tuple[CarrierAppetite, list[AppetiteEntry]]) -> tuple[int, int]:
        carrier, matches = item
        high_count = sum(1 for m in matches if m.level == AppetiteLevel.HIGH)
        return (-high_count, -len(matches))

    results.sort(key=sort_key)
    return results


def get_carrier_by_name(name: str) -> Optional[CarrierAppetite]:
    """Get a carrier by name."""
    name_lower = name.lower()
    for carrier in NC_CARRIERS:
        if name_lower in carrier.name.lower():
            return carrier
    return None


def search_carriers(
    query: str,
    line_type: Optional[LineType] = None,
) -> list[CarrierAppetite]:
    """
    Search carriers by name or line of business.

    Args:
        query: Search term
        line_type: Filter by line type

    Returns:
        List of matching carriers
    """
    query_lower = query.lower()
    results = []

    for carrier in NC_CARRIERS:
        # Filter by line type
        if line_type and carrier.line_type != LineType.BOTH and carrier.line_type != line_type:
            continue

        # Match by name
        if query_lower in carrier.name.lower():
            results.append(carrier)
            continue

        # Match by lines of business
        if any(query_lower in line.lower() for line in carrier.lines):
            results.append(carrier)
            continue

        # Match by appetite category
        if any(query_lower in apt.category.lower() for apt in carrier.appetite):
            results.append(carrier)

    return results


def get_carriers_for_business_type(business_type: str) -> list[tuple[CarrierAppetite, str]]:
    """
    Get carriers with appetite for a specific business type.

    Args:
        business_type: Type of business (e.g., "plumber", "restaurant", "tech")

    Returns:
        List of (carrier, appetite_level) tuples
    """
    type_mappings = {
        "plumber": ["Contractors", "Small Commercial", "Workers Compensation"],
        "electrician": ["Contractors", "Small Commercial", "Workers Compensation"],
        "hvac": ["Contractors", "Small Commercial", "Workers Compensation"],
        "contractor": ["Contractors", "Small Commercial", "Workers Compensation"],
        "restaurant": ["Restaurant", "Small Commercial", "Workers Compensation"],
        "accounting": ["Professional Liability", "Professional Services", "Small Commercial"],
        "cpa": ["Professional Liability", "Accountant E&O", "Professional Services"],
        "lawyer": ["Professional Liability", "Lawyer E&O"],
        "tech": ["Technology E&O", "Cyber Liability", "Professional Liability"],
        "software": ["Technology E&O", "Cyber Liability", "Professional Liability"],
        "retail": ["Small Commercial", "Small Commercial BOP"],
        "manufacturing": ["Mid-Market Commercial", "Workers Compensation"],
    }

    categories = type_mappings.get(business_type.lower(), ["Small Commercial"])
    matches = match_carriers(categories, line_type=LineType.COMMERCIAL)

    return [
        (carrier, matches[0].level.value if matches else "Unknown")
        for carrier, matches in matches
    ]
