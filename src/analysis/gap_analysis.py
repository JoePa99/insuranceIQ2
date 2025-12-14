"""Gap analysis engine for InsuranceIQ.

Compares policy data against property research and best practices
to identify coverage gaps and make recommendations.
"""

from dataclasses import dataclass, field
from typing import Optional

from ..models.policy import HomeownersPolicy, AutoPolicy, ValuationType
from ..models.property import PropertyResearch


@dataclass
class Gap:
    """Represents a coverage gap or recommendation."""
    issue: str
    current: str
    recommended: str
    rationale: str
    action: str
    priority: str = "medium"  # high, medium, low


@dataclass
class Consideration:
    """A question or consideration for the agent to discuss with client."""
    question: str
    why_it_matters: str
    if_yes: str
    if_no: Optional[str] = None


@dataclass
class RecommendedCoverages:
    """Recommended coverage levels."""
    dwelling: Optional[int] = None
    other_structures: Optional[int] = None
    personal_property: Optional[int] = None
    liability: Optional[int] = None
    medical_payments: Optional[int] = None
    umbrella: Optional[int] = None
    add_endorsements: list[str] = field(default_factory=list)
    remove_endorsements: list[str] = field(default_factory=list)
    notes: list[str] = field(default_factory=list)


@dataclass
class GapAnalysisResult:
    """Complete gap analysis results."""
    high_priority_gaps: list[Gap] = field(default_factory=list)
    medium_priority_gaps: list[Gap] = field(default_factory=list)
    low_priority_gaps: list[Gap] = field(default_factory=list)
    considerations: list[Consideration] = field(default_factory=list)
    recommended_coverages: RecommendedCoverages = field(default_factory=RecommendedCoverages)
    agent_summary: str = ""

    def to_dict(self) -> dict:
        """Convert to dictionary for JSON serialization."""
        return {
            "high_priority_gaps": [
                {
                    "issue": g.issue,
                    "current": g.current,
                    "recommended": g.recommended,
                    "rationale": g.rationale,
                    "action": g.action,
                }
                for g in self.high_priority_gaps
            ],
            "medium_priority_gaps": [
                {
                    "issue": g.issue,
                    "current": g.current,
                    "recommended": g.recommended,
                    "rationale": g.rationale,
                    "action": g.action,
                }
                for g in self.medium_priority_gaps
            ],
            "low_priority_gaps": [
                {
                    "issue": g.issue,
                    "current": g.current,
                    "recommended": g.recommended,
                    "rationale": g.rationale,
                    "action": g.action,
                }
                for g in self.low_priority_gaps
            ],
            "considerations": [
                {
                    "question": c.question,
                    "why_it_matters": c.why_it_matters,
                    "if_yes": c.if_yes,
                    "if_no": c.if_no,
                }
                for c in self.considerations
            ],
            "recommended_coverages": {
                "dwelling": self.recommended_coverages.dwelling,
                "other_structures": self.recommended_coverages.other_structures,
                "personal_property": self.recommended_coverages.personal_property,
                "liability": self.recommended_coverages.liability,
                "medical_payments": self.recommended_coverages.medical_payments,
                "umbrella": self.recommended_coverages.umbrella,
                "add_endorsements": self.recommended_coverages.add_endorsements,
                "notes": self.recommended_coverages.notes,
            },
            "agent_summary": self.agent_summary,
        }


class GapAnalyzer:
    """Analyzes insurance policies for coverage gaps."""

    def __init__(self):
        """Initialize the analyzer."""
        pass

    def analyze_homeowners(
        self,
        policy: HomeownersPolicy,
        property_research: Optional[PropertyResearch] = None,
        net_worth: Optional[int] = None,
        household_info: Optional[dict] = None,
    ) -> GapAnalysisResult:
        """
        Analyze a homeowners policy for gaps.

        Args:
            policy: Parsed homeowners policy data
            property_research: Property research data (optional but recommended)
            net_worth: Estimated client net worth (optional)
            household_info: Additional household information (optional)

        Returns:
            GapAnalysisResult with findings
        """
        result = GapAnalysisResult()
        result.recommended_coverages = RecommendedCoverages()

        # Get key values
        dwelling_limit = policy.get_dwelling_limit()
        liability_limit = policy.get_liability_limit()

        # Estimate replacement cost if we have property research
        estimated_replacement = 0
        estimated_market_value = 0
        if property_research:
            estimated_replacement = property_research.get_replacement_cost_estimate()
            estimated_market_value = property_research.value_estimates.get_best_estimate()

        # === HIGH PRIORITY CHECKS ===

        # 1. Dwelling coverage adequacy
        if estimated_replacement and dwelling_limit:
            if dwelling_limit < estimated_replacement * 0.8:
                result.high_priority_gaps.append(Gap(
                    issue="Dwelling coverage significantly below replacement cost",
                    current=f"${dwelling_limit:,}",
                    recommended=f"${estimated_replacement:,}+",
                    rationale=f"Based on {property_research.details.square_footage or 'N/A'} sq ft at current construction costs, "
                              f"replacement would cost approximately ${estimated_replacement:,}. Current coverage leaves a "
                              f"${estimated_replacement - dwelling_limit:,} gap.",
                    action="Increase dwelling coverage to full replacement cost. Consider extended replacement cost endorsement (125%).",
                    priority="high",
                ))
                result.recommended_coverages.dwelling = int(estimated_replacement * 1.1)  # 10% buffer

        # 2. ACV vs Replacement Cost
        if policy.dwelling and policy.dwelling.valuation == ValuationType.ACTUAL_CASH_VALUE:
            result.high_priority_gaps.append(Gap(
                issue="Dwelling valued at Actual Cash Value instead of Replacement Cost",
                current="Actual Cash Value (ACV)",
                recommended="Replacement Cost",
                rationale="ACV deducts depreciation from claims, leaving you significantly undercompensated for losses. "
                          "On an older home, ACV could pay 50% or less of repair costs.",
                action="Switch to Replacement Cost valuation immediately. This is critical.",
                priority="high",
            ))

        # 3. Liability vs home value/net worth
        min_recommended_liability = 300000  # Base recommendation
        if estimated_market_value and estimated_market_value > 300000:
            min_recommended_liability = max(min_recommended_liability, 300000)
        if estimated_market_value and estimated_market_value > 500000:
            min_recommended_liability = 500000
        if net_worth and net_worth > 500000:
            min_recommended_liability = max(min_recommended_liability, 500000)

        if liability_limit and liability_limit < min_recommended_liability:
            result.high_priority_gaps.append(Gap(
                issue="Liability limit inadequate for asset level",
                current=f"${liability_limit:,}",
                recommended=f"${min_recommended_liability:,}+",
                rationale=f"With property valued at ${estimated_market_value:,}, current ${liability_limit:,} liability "
                          f"leaves significant exposure. A serious injury claim could exceed your limits.",
                action=f"Increase liability to ${min_recommended_liability:,}. Consider umbrella policy for additional protection.",
                priority="high",
            ))
            result.recommended_coverages.liability = min_recommended_liability

        # 4. Flood zone without flood insurance
        if property_research and property_research.risk_factors.flood_zone:
            flood_zone = property_research.risk_factors.flood_zone.upper()
            if flood_zone in ["A", "AE", "AH", "AO", "V", "VE"] or property_research.risk_factors.in_sfha:
                if not policy.has_endorsement("flood"):
                    result.high_priority_gaps.append(Gap(
                        issue="Property in flood zone without flood insurance",
                        current="No flood coverage",
                        recommended="NFIP or private flood policy",
                        rationale=f"Property is in FEMA flood zone {flood_zone} (Special Flood Hazard Area). "
                                  f"Standard homeowners does NOT cover flood damage. This is a critical gap.",
                        action="Obtain flood insurance immediately. NFIP or private flood options available. "
                               "If mortgaged, lender will likely require this.",
                        priority="high",
                    ))
                    result.recommended_coverages.add_endorsements.append("Flood insurance (separate policy)")

        # 5. Water backup coverage
        if not policy.has_endorsement("water backup") and not policy.has_endorsement("sewer"):
            result.high_priority_gaps.append(Gap(
                issue="No water backup/sewer coverage",
                current="Not covered",
                recommended="$10,000-$25,000 water backup coverage",
                rationale="Water backup from sewers/drains is one of the most common claims and is NOT covered "
                          "by standard homeowners policies. Average claim is $5,000-$10,000.",
                action="Add water backup endorsement. Typically $50-100/year for $10K-$25K coverage.",
                priority="high",
            ))
            result.recommended_coverages.add_endorsements.append("Water backup/sewer endorsement")

        # === MEDIUM PRIORITY CHECKS ===

        # 1. Umbrella policy recommendation
        umbrella_recommended = False
        if net_worth and net_worth > 500000:
            umbrella_recommended = True
            recommended_umbrella = max(1000000, net_worth)
        elif estimated_market_value and estimated_market_value > 400000:
            umbrella_recommended = True
            recommended_umbrella = 1000000
        elif liability_limit and liability_limit >= 300000:
            # Already has decent liability, suggest umbrella for extra protection
            umbrella_recommended = True
            recommended_umbrella = 1000000

        if umbrella_recommended:
            result.medium_priority_gaps.append(Gap(
                issue="No umbrella policy for additional liability protection",
                current="No umbrella",
                recommended=f"${recommended_umbrella:,} umbrella",
                rationale="An umbrella policy provides additional liability coverage above your home and auto limits. "
                          "It's inexpensive ($200-400/year for $1M) relative to the protection provided.",
                action="Quote umbrella policy. Most carriers require $300K underlying liability.",
                priority="medium",
            ))
            result.recommended_coverages.umbrella = recommended_umbrella

        # 2. Personal property coverage
        if policy.personal_property:
            pp_limit = policy.personal_property.limit
            if pp_limit and dwelling_limit:
                pp_percentage = (pp_limit / dwelling_limit) * 100
                if pp_percentage < 50:
                    result.medium_priority_gaps.append(Gap(
                        issue="Personal property coverage may be insufficient",
                        current=f"${pp_limit:,} ({pp_percentage:.0f}% of dwelling)",
                        recommended=f"${int(dwelling_limit * 0.7):,} (70% typical)",
                        rationale="Most homeowners have personal property worth 50-70% of their home's value. "
                                  "Current coverage seems low.",
                        action="Review personal property needs with client. Consider home inventory.",
                        priority="medium",
                    ))

            # ACV on personal property
            if policy.personal_property.valuation == ValuationType.ACTUAL_CASH_VALUE:
                result.medium_priority_gaps.append(Gap(
                    issue="Personal property at Actual Cash Value",
                    current="ACV on contents",
                    recommended="Replacement Cost on contents",
                    rationale="ACV on personal property means you get depreciated value. A 5-year old TV "
                              "might only pay $100 on an ACV policy vs $500 replacement.",
                    action="Upgrade to replacement cost on personal property. Usually modest premium increase.",
                    priority="medium",
                ))

        # 3. Wind/hail deductible awareness (coastal NC)
        if property_research and property_research.risk_factors.coastal_zone:
            if policy.deductibles and policy.deductibles.wind_hail_percentage:
                if policy.deductibles.wind_hail_percentage >= 2:
                    result.medium_priority_gaps.append(Gap(
                        issue="High wind/hail deductible",
                        current=f"{policy.deductibles.wind_hail_percentage}% of dwelling (${int(dwelling_limit * policy.deductibles.wind_hail_percentage / 100):,})",
                        recommended="Awareness - this is common in coastal NC",
                        rationale="Percentage-based wind deductibles are standard in coastal areas. "
                                  f"On a ${dwelling_limit:,} home, a {policy.deductibles.wind_hail_percentage}% deductible "
                                  f"means ${int(dwelling_limit * policy.deductibles.wind_hail_percentage / 100):,} out of pocket for wind claims.",
                        action="Ensure client understands this. Consider emergency fund for deductible.",
                        priority="medium",
                    ))

        # 4. Older roof
        if property_research and property_research.details.roof_age_years:
            roof_age = property_research.details.roof_age_years
            if roof_age >= 15:
                result.medium_priority_gaps.append(Gap(
                    issue="Aging roof may affect coverage",
                    current=f"Roof approximately {roof_age} years old",
                    recommended="Inspection and potential replacement planning",
                    rationale="Roofs over 15-20 years old may be subject to ACV payment or exclusion. "
                              "Some carriers won't write new policies with old roofs.",
                    action="Verify current roof coverage terms. Plan for replacement. Get inspection.",
                    priority="medium",
                ))

        # 5. Service line coverage
        if not policy.has_endorsement("service line"):
            result.medium_priority_gaps.append(Gap(
                issue="No service line coverage",
                current="Not covered",
                recommended="$10,000+ service line coverage",
                rationale="Homeowner is responsible for water/sewer lines from street to house. "
                          "Replacement can cost $5,000-$15,000. Standard policies don't cover.",
                action="Add service line endorsement. Usually $25-50/year.",
                priority="medium",
            ))
            result.recommended_coverages.add_endorsements.append("Service line coverage")

        # === CONSIDERATIONS (Questions to ask) ===

        # Pool
        if property_research and property_research.risk_factors.has_pool:
            result.considerations.append(Consideration(
                question="Does the property have a swimming pool?",
                why_it_matters="Research indicates the property may have a pool. Pools significantly increase "
                               "liability exposure due to drowning risk.",
                if_yes="Recommend $500K+ liability, consider umbrella. Verify pool is disclosed on policy. "
                       "Some carriers require fencing/safety features.",
                if_no="Update property records if research was incorrect.",
            ))
        else:
            result.considerations.append(Consideration(
                question="Does the client have a swimming pool, trampoline, or aggressive dog breed?",
                why_it_matters="These 'attractive nuisances' significantly increase liability exposure and may "
                               "require additional coverage or carrier restrictions.",
                if_yes="Increase liability to $500K+, strongly recommend umbrella. Verify disclosure to carrier.",
            ))

        # Home-based business
        result.considerations.append(Consideration(
            question="Does the client operate any business from home?",
            why_it_matters="Home-based businesses are generally excluded from homeowners policies. "
                           "Business equipment, inventory, and liability need separate coverage.",
            if_yes="Need in-home business endorsement or separate BOP policy.",
        ))

        # Rental/short-term rental
        result.considerations.append(Consideration(
            question="Does the client rent out any portion of the home (including Airbnb)?",
            why_it_matters="Standard homeowners excludes rental activities. Short-term rentals (Airbnb) "
                           "have specific exclusions and liability exposure.",
            if_yes="Need landlord policy or short-term rental endorsement.",
        ))

        # High-value items
        result.considerations.append(Consideration(
            question="Does the client have jewelry, art, collections, or other high-value items?",
            why_it_matters="Standard policies have sublimits ($1,500-$2,500 typical for jewelry). "
                           "Items over sublimits need scheduling.",
            if_yes="Schedule valuable items individually for full coverage.",
        ))

        # === GENERATE SUMMARY ===
        result.agent_summary = self._generate_summary(result, policy, property_research)

        return result

    def _generate_summary(
        self,
        result: GapAnalysisResult,
        policy: HomeownersPolicy,
        property_research: Optional[PropertyResearch],
    ) -> str:
        """Generate agent-ready summary."""
        lines = ["# Insurance Gap Analysis Summary\n"]

        # Property info
        if policy.property_address:
            lines.append(f"**Property:** {policy.property_address}")
        if policy.carrier:
            lines.append(f"**Current Carrier:** {policy.carrier}")
        lines.append("")

        # High priority
        if result.high_priority_gaps:
            lines.append("## 🔴 High Priority Issues\n")
            for gap in result.high_priority_gaps:
                lines.append(f"### {gap.issue}")
                lines.append(f"- **Current:** {gap.current}")
                lines.append(f"- **Recommended:** {gap.recommended}")
                lines.append(f"- **Action:** {gap.action}")
                lines.append("")

        # Medium priority
        if result.medium_priority_gaps:
            lines.append("## 🟡 Recommendations\n")
            for gap in result.medium_priority_gaps:
                lines.append(f"### {gap.issue}")
                lines.append(f"- **Current:** {gap.current}")
                lines.append(f"- **Recommended:** {gap.recommended}")
                lines.append(f"- **Action:** {gap.action}")
                lines.append("")

        # Considerations
        if result.considerations:
            lines.append("## 💬 Questions to Discuss with Client\n")
            for c in result.considerations:
                lines.append(f"**{c.question}**")
                lines.append(f"- *Why it matters:* {c.why_it_matters}")
                if c.if_yes:
                    lines.append(f"- *If yes:* {c.if_yes}")
                lines.append("")

        # Recommended coverages
        rec = result.recommended_coverages
        if any([rec.dwelling, rec.liability, rec.umbrella, rec.add_endorsements]):
            lines.append("## 📋 Recommended Coverage Changes\n")
            if rec.dwelling:
                lines.append(f"- Dwelling: ${rec.dwelling:,}")
            if rec.liability:
                lines.append(f"- Liability: ${rec.liability:,}")
            if rec.umbrella:
                lines.append(f"- Umbrella: ${rec.umbrella:,}")
            if rec.add_endorsements:
                lines.append("- Add endorsements:")
                for e in rec.add_endorsements:
                    lines.append(f"  - {e}")
            lines.append("")

        return "\n".join(lines)


def analyze_gaps(
    policy: HomeownersPolicy,
    property_research: Optional[PropertyResearch] = None,
    net_worth: Optional[int] = None,
    household_info: Optional[dict] = None,
) -> GapAnalysisResult:
    """
    Convenience function to analyze policy gaps.

    Args:
        policy: Parsed homeowners policy
        property_research: Property research data (optional)
        net_worth: Estimated client net worth (optional)
        household_info: Additional household info (optional)

    Returns:
        GapAnalysisResult with findings
    """
    analyzer = GapAnalyzer()
    return analyzer.analyze_homeowners(
        policy=policy,
        property_research=property_research,
        net_worth=net_worth,
        household_info=household_info,
    )
