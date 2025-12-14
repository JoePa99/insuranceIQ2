"""Mock declaration page data for testing InsuranceIQ.

These represent typical NC clients with common coverage gaps.
"""

from typing import Optional
import sys
from pathlib import Path

# Add parent to path for imports
sys.path.insert(0, str(Path(__file__).parent.parent.parent))

from src.models.policy import (
    HomeownersPolicy,
    AutoPolicy,
    Coverage,
    Deductible,
    ValuationType,
    Vehicle,
    Driver,
)


# Mock scenarios representing common gap situations
MOCK_SCENARIOS = {
    "low-liability": "Home valued at $450K with only $100K liability",
    "acv-dwelling": "Older home with ACV instead of replacement cost",
    "no-water-backup": "Standard policy missing water backup coverage",
    "flood-zone": "Coastal property in flood zone without flood insurance",
    "no-umbrella": "High-value home with no umbrella policy",
    "minimal-auto": "NC minimum auto limits",
    "well-covered": "Example of a well-structured policy for comparison",
}


def get_mock_policy(scenario: str) -> HomeownersPolicy:
    """Get a mock policy for the given scenario."""
    scenarios = {
        "low-liability": _mock_low_liability(),
        "acv-dwelling": _mock_acv_dwelling(),
        "no-water-backup": _mock_no_water_backup(),
        "flood-zone": _mock_flood_zone(),
        "no-umbrella": _mock_no_umbrella(),
        "minimal-auto": _mock_minimal_auto(),
        "well-covered": _mock_well_covered(),
    }
    return scenarios.get(scenario, _mock_low_liability())


def _mock_low_liability() -> HomeownersPolicy:
    """
    Scenario: Client with expensive home but inadequate liability.

    Gap: $450K home with only $100K liability - common and dangerous.
    """
    return HomeownersPolicy(
        carrier="NC Farm Bureau",
        policy_number="HO-2024-12345",
        effective_date="2024-06-01",
        expiration_date="2025-06-01",
        insured_name="John and Jane Smith",
        property_address="456 Stratford Rd, Winston-Salem, NC 27103",
        dwelling=Coverage(
            limit=425000,
            valuation=ValuationType.REPLACEMENT_COST,
        ),
        other_structures=Coverage(limit=42500, percentage=10),
        personal_property=Coverage(
            limit=297500,
            percentage=70,
            valuation=ValuationType.REPLACEMENT_COST,
        ),
        loss_of_use=Coverage(limit=85000, percentage=20),
        liability=Coverage(limit=100000),  # Gap: too low
        medical_payments=Coverage(limit=1000),
        deductibles=Deductible(
            all_peril=1000,
        ),
        endorsements=[],  # Gap: no water backup
        annual_premium=2100.00,
        policy_form="HO-3",
    )


def _mock_acv_dwelling() -> HomeownersPolicy:
    """
    Scenario: Older home insured at ACV instead of replacement cost.

    Gap: ACV valuation will severely undercompensate at claim time.
    """
    return HomeownersPolicy(
        carrier="State Farm",
        policy_number="23-BN-4567-8",
        effective_date="2024-03-15",
        expiration_date="2025-03-15",
        insured_name="Robert Johnson",
        property_address="789 Country Club Rd, Winston-Salem, NC 27104",
        dwelling=Coverage(
            limit=275000,
            valuation=ValuationType.ACTUAL_CASH_VALUE,  # Gap: ACV
        ),
        other_structures=Coverage(limit=27500, percentage=10),
        personal_property=Coverage(
            limit=137500,
            percentage=50,  # Gap: low percentage
            valuation=ValuationType.ACTUAL_CASH_VALUE,  # Gap: ACV on contents too
        ),
        loss_of_use=Coverage(limit=55000, percentage=20),
        liability=Coverage(limit=100000),  # Gap: also low
        medical_payments=Coverage(limit=1000),
        deductibles=Deductible(
            all_peril=2500,
        ),
        endorsements=[],
        annual_premium=1450.00,
        policy_form="HO-3",
    )


def _mock_no_water_backup() -> HomeownersPolicy:
    """
    Scenario: Good coverage overall but missing water backup.

    Gap: Water backup is one of the most common claims and not covered.
    """
    return HomeownersPolicy(
        carrier="Travelers",
        policy_number="TRV-HO-9876543",
        effective_date="2024-01-01",
        expiration_date="2025-01-01",
        insured_name="Michael and Sarah Davis",
        property_address="234 Robinhood Rd, Winston-Salem, NC 27106",
        dwelling=Coverage(
            limit=385000,
            valuation=ValuationType.REPLACEMENT_COST,
        ),
        other_structures=Coverage(limit=38500, percentage=10),
        personal_property=Coverage(
            limit=269500,
            percentage=70,
            valuation=ValuationType.REPLACEMENT_COST,
        ),
        loss_of_use=Coverage(limit=77000, percentage=20),
        liability=Coverage(limit=300000),  # Good
        medical_payments=Coverage(limit=5000),
        deductibles=Deductible(
            all_peril=1000,
        ),
        endorsements=[
            "Scheduled Personal Property - Jewelry $15,000",
            "Identity Theft Protection",
        ],  # Gap: No water backup
        annual_premium=2450.00,
        policy_form="HO-3",
    )


def _mock_flood_zone() -> HomeownersPolicy:
    """
    Scenario: Coastal property in flood zone without flood insurance.

    Gap: Property in AE flood zone with no flood coverage - critical gap.
    """
    return HomeownersPolicy(
        carrier="NC Beach Plan + Citizens",
        policy_number="BP-2024-5555",
        effective_date="2024-04-01",
        expiration_date="2025-04-01",
        insured_name="William and Patricia Brown",
        property_address="789 Beach Rd, Wilmington, NC 28480",
        dwelling=Coverage(
            limit=525000,
            valuation=ValuationType.REPLACEMENT_COST,
        ),
        other_structures=Coverage(limit=52500, percentage=10),
        personal_property=Coverage(
            limit=262500,
            percentage=50,
            valuation=ValuationType.REPLACEMENT_COST,
        ),
        loss_of_use=Coverage(limit=105000, percentage=20),
        liability=Coverage(limit=300000),
        medical_payments=Coverage(limit=5000),
        deductibles=Deductible(
            all_peril=2500,
            wind_hail_percentage=2.0,  # 2% hurricane deductible
            hurricane_percentage=2.0,
        ),
        endorsements=[
            "Water Backup - $10,000",
        ],  # Has water backup but NO FLOOD - critical gap
        annual_premium=4500.00,
        policy_form="HO-3",
    )


def _mock_no_umbrella() -> HomeownersPolicy:
    """
    Scenario: High-value home owner with no umbrella policy.

    Gap: $650K home, high net worth implied, no umbrella protection.
    """
    return HomeownersPolicy(
        carrier="Erie Insurance",
        policy_number="Q12 345678 9",
        effective_date="2024-07-01",
        expiration_date="2025-07-01",
        insured_name="Dr. James and Elizabeth Wilson",
        property_address="1200 Reynolda Rd, Winston-Salem, NC 27106",
        dwelling=Coverage(
            limit=625000,
            valuation=ValuationType.REPLACEMENT_COST,
        ),
        other_structures=Coverage(limit=62500, percentage=10),
        personal_property=Coverage(
            limit=437500,
            percentage=70,
            valuation=ValuationType.REPLACEMENT_COST,
        ),
        loss_of_use=Coverage(limit=125000, percentage=20),
        liability=Coverage(limit=300000),  # Decent but needs umbrella
        medical_payments=Coverage(limit=5000),
        deductibles=Deductible(
            all_peril=2500,
        ),
        endorsements=[
            "Water Backup - $25,000",
            "Service Line Coverage - $10,000",
            "Scheduled Personal Property - Art $50,000",
            "Scheduled Personal Property - Jewelry $35,000",
            "Extended Replacement Cost 125%",
        ],
        annual_premium=3200.00,
        policy_form="HO-5",  # Special form - good
    )


def _mock_minimal_auto() -> AutoPolicy:
    """
    Scenario: NC minimum auto insurance limits.

    Gap: State minimums leave massive exposure.
    """
    return AutoPolicy(
        carrier="Progressive",
        policy_number="12345678-0",
        effective_date="2024-05-15",
        expiration_date="2024-11-15",
        insured_name="David Miller",
        insured_address="567 Oak St, Winston-Salem, NC 27101",
        bodily_injury=Coverage(
            per_person=30000,  # NC minimum
            per_accident=60000,  # NC minimum
        ),
        property_damage=Coverage(limit=25000),  # NC minimum
        um_uim=Coverage(
            per_person=30000,
            per_accident=60000,
        ),  # Required to match BI unless waived
        medical_payments=Coverage(limit=1000),
        collision=Coverage(deductible=1000),
        comprehensive=Coverage(deductible=500),
        vehicles=[
            Vehicle(year=2019, make="Toyota", model="Camry", vin="4T1B11HK5KU123456"),
        ],
        drivers=[
            Driver(name="David Miller", age=35, relationship="Insured"),
        ],
        six_month_premium=485.00,
    )


def _mock_well_covered() -> HomeownersPolicy:
    """
    Scenario: Example of a well-structured policy.

    This shows what a good policy looks like for comparison.
    """
    return HomeownersPolicy(
        carrier="Nationwide",
        policy_number="NW-HO-7654321",
        effective_date="2024-02-01",
        expiration_date="2025-02-01",
        insured_name="Thomas and Linda Anderson",
        property_address="890 Valley Rd, Winston-Salem, NC 27106",
        dwelling=Coverage(
            limit=475000,
            valuation=ValuationType.REPLACEMENT_COST,
        ),
        other_structures=Coverage(limit=47500, percentage=10),
        personal_property=Coverage(
            limit=332500,
            percentage=70,
            valuation=ValuationType.REPLACEMENT_COST,
        ),
        loss_of_use=Coverage(limit=95000, percentage=20),
        liability=Coverage(limit=500000),  # Good - high liability
        medical_payments=Coverage(limit=5000),
        deductibles=Deductible(
            all_peril=2500,
        ),
        endorsements=[
            "Water Backup - $25,000",
            "Service Line Coverage - $10,000",
            "Identity Theft - $25,000",
            "Extended Replacement Cost 125%",
            "Scheduled Personal Property - Jewelry $20,000",
            "Equipment Breakdown",
        ],
        annual_premium=2850.00,
        policy_form="HO-5",
    )


# List all scenarios for CLI help
def list_scenarios() -> str:
    """Return formatted list of available scenarios."""
    lines = ["Available mock scenarios:\n"]
    for key, desc in MOCK_SCENARIOS.items():
        lines.append(f"  {key}: {desc}")
    return "\n".join(lines)
