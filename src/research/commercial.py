"""Commercial lines research module for InsuranceIQ.

Uses Claude with web search to research businesses for commercial insurance.
"""

import json
import os
import re
from dataclasses import dataclass, field
from typing import Optional

import anthropic


@dataclass
class CompanyProfile:
    """Company profile information."""
    name: str
    legal_name: Optional[str] = None
    address: Optional[str] = None
    website: Optional[str] = None
    description: Optional[str] = None
    industry: Optional[str] = None
    naics_code: Optional[str] = None
    naics_description: Optional[str] = None
    formation_date: Optional[str] = None
    status: Optional[str] = None


@dataclass
class BusinessDetails:
    """Business operational details."""
    employee_count_estimate: Optional[str] = None
    revenue_estimate: Optional[str] = None
    years_in_business: Optional[int] = None
    business_type: Optional[str] = None
    operations_description: Optional[str] = None
    locations: int = 1
    owns_vehicles: bool = False
    owns_property: bool = False


@dataclass
class RiskAssessment:
    """Risk assessment for the business."""
    risk_level: Optional[str] = None  # Low, Medium, High
    key_exposures: list[str] = field(default_factory=list)
    risk_factors: list[str] = field(default_factory=list)
    loss_history_notes: Optional[str] = None


@dataclass
class CoverageRecommendation:
    """Coverage recommendations for the business."""
    required: list[str] = field(default_factory=list)
    recommended: list[str] = field(default_factory=list)
    optional: list[str] = field(default_factory=list)
    notes: list[str] = field(default_factory=list)


@dataclass
class CarrierSuggestion:
    """Carrier suggestion with appetite level."""
    name: str
    appetite: str  # High, Medium, Low
    notes: Optional[str] = None


@dataclass
class Source:
    """Research source citation."""
    name: str
    url: Optional[str] = None
    notes: Optional[str] = None


@dataclass
class CommercialResearch:
    """Complete commercial research results."""
    company_profile: CompanyProfile
    business_details: BusinessDetails = field(default_factory=BusinessDetails)
    risk_assessment: RiskAssessment = field(default_factory=RiskAssessment)
    coverage_recommendations: CoverageRecommendation = field(default_factory=CoverageRecommendation)
    carrier_suggestions: list[CarrierSuggestion] = field(default_factory=list)
    sources: list[Source] = field(default_factory=list)
    confidence_level: str = "medium"

    def to_dict(self) -> dict:
        """Convert to dictionary for JSON serialization."""
        return {
            "company_profile": {
                "name": self.company_profile.name,
                "legal_name": self.company_profile.legal_name,
                "address": self.company_profile.address,
                "website": self.company_profile.website,
                "description": self.company_profile.description,
                "industry": self.company_profile.industry,
                "naics_code": self.company_profile.naics_code,
                "naics_description": self.company_profile.naics_description,
                "formation_date": self.company_profile.formation_date,
                "status": self.company_profile.status,
            },
            "business_details": {
                "employee_count_estimate": self.business_details.employee_count_estimate,
                "revenue_estimate": self.business_details.revenue_estimate,
                "years_in_business": self.business_details.years_in_business,
                "business_type": self.business_details.business_type,
                "operations_description": self.business_details.operations_description,
            },
            "risk_assessment": {
                "risk_level": self.risk_assessment.risk_level,
                "key_exposures": self.risk_assessment.key_exposures,
                "risk_factors": self.risk_assessment.risk_factors,
            },
            "coverage_recommendations": {
                "required": self.coverage_recommendations.required,
                "recommended": self.coverage_recommendations.recommended,
                "optional": self.coverage_recommendations.optional,
                "notes": self.coverage_recommendations.notes,
            },
            "carrier_suggestions": [
                {"name": c.name, "appetite": c.appetite, "notes": c.notes}
                for c in self.carrier_suggestions
            ],
            "sources": [
                {"name": s.name, "url": s.url}
                for s in self.sources
            ],
        }


COMMERCIAL_RESEARCH_PROMPT = """You are an expert commercial insurance researcher. Research this business and gather information relevant for commercial insurance placement.

Company: {company_name}
Location: {city_state}

Search for and compile information about:

1. **Company Profile**
   - Official company name and legal entity type
   - Website and contact information
   - NC Secretary of State registration (formation date, status)
   - Industry and business description

2. **Business Operations**
   - What services/products do they provide?
   - Estimated employee count (check LinkedIn, website)
   - Approximate revenue range if determinable
   - Years in business
   - Number of locations
   - Do they operate vehicles?

3. **Risk Assessment**
   - Primary industry (determine NAICS code)
   - Key liability exposures for this business type
   - Any news about lawsuits, claims, or incidents
   - Customer reviews that might indicate operational risks

4. **Coverage Recommendations**
   Based on the business type, recommend:
   - Required coverages (GL, WC if 3+ employees in NC, Auto if vehicles)
   - Recommended coverages
   - Optional/nice-to-have coverages

Return your findings as a JSON object:

{{
  "company_profile": {{
    "name": "Business Name",
    "legal_name": "BUSINESS NAME, LLC",
    "address": "Full address if found",
    "website": "https://...",
    "description": "What the business does",
    "industry": "Industry category",
    "naics_code": "XXXXXX",
    "naics_description": "NAICS description",
    "formation_date": "2015",
    "status": "Active"
  }},
  "business_details": {{
    "employee_count_estimate": "5-10",
    "revenue_estimate": "$500K-$1M",
    "years_in_business": 9,
    "business_type": "Contractor",
    "operations_description": "Detailed description of operations"
  }},
  "risk_assessment": {{
    "risk_level": "Medium",
    "key_exposures": ["List", "of", "exposures"],
    "risk_factors": ["Specific", "risk", "factors"]
  }},
  "coverage_recommendations": {{
    "required": ["General Liability", "Workers Compensation"],
    "recommended": ["Commercial Auto", "Umbrella"],
    "optional": ["Cyber Liability"],
    "notes": ["GL minimum $1M/$2M", "WC required - 3+ employees"]
  }},
  "carrier_suggestions": [
    {{"name": "Carrier Name", "appetite": "High", "notes": "Good for this class"}}
  ],
  "sources": [
    {{"name": "NC Secretary of State", "url": "https://..."}}
  ]
}}

Return ONLY the JSON object."""


class CommercialResearcher:
    """Researches commercial businesses for insurance placement."""

    def __init__(self, api_key: Optional[str] = None):
        """Initialize the researcher."""
        self.api_key = api_key or os.environ.get("ANTHROPIC_API_KEY")
        if not self.api_key:
            raise ValueError(
                "Anthropic API key required. Set ANTHROPIC_API_KEY env var or pass api_key."
            )
        self.client = anthropic.Anthropic(api_key=self.api_key)

    def research(self, company_name: str, city_state: str) -> CommercialResearch:
        """
        Research a commercial business.

        Args:
            company_name: Name of the company
            city_state: City and state (e.g., "Greensboro, NC")

        Returns:
            CommercialResearch object with findings
        """
        prompt = COMMERCIAL_RESEARCH_PROMPT.format(
            company_name=company_name,
            city_state=city_state
        )

        # Use Claude with web search
        response = self.client.messages.create(
            model="claude-sonnet-4-20250514",
            max_tokens=4096,
            messages=[{"role": "user", "content": prompt}],
            tools=[{"type": "web_search_20250305"}],
        )

        # Extract the final text response
        response_text = ""
        for block in response.content:
            if block.type == "text":
                response_text = block.text
                break

        return self._parse_response(response_text, company_name)

    def _parse_response(self, response_text: str, company_name: str) -> CommercialResearch:
        """Parse Claude's JSON response into CommercialResearch."""
        # Extract JSON from response
        json_match = re.search(r"```(?:json)?\s*([\s\S]*?)\s*```", response_text)
        if json_match:
            json_str = json_match.group(1)
        else:
            json_match = re.search(r"\{[\s\S]*\}", response_text)
            if json_match:
                json_str = json_match.group(0)
            else:
                return CommercialResearch(
                    company_profile=CompanyProfile(name=company_name),
                    confidence_level="low",
                )

        try:
            data = json.loads(json_str)
        except json.JSONDecodeError:
            return CommercialResearch(
                company_profile=CompanyProfile(name=company_name),
                confidence_level="low",
            )

        # Build CommercialResearch object
        profile_data = data.get("company_profile", {})
        company_profile = CompanyProfile(
            name=profile_data.get("name", company_name),
            legal_name=profile_data.get("legal_name"),
            address=profile_data.get("address"),
            website=profile_data.get("website"),
            description=profile_data.get("description"),
            industry=profile_data.get("industry"),
            naics_code=profile_data.get("naics_code"),
            naics_description=profile_data.get("naics_description"),
            formation_date=profile_data.get("formation_date"),
            status=profile_data.get("status"),
        )

        details_data = data.get("business_details", {})
        business_details = BusinessDetails(
            employee_count_estimate=details_data.get("employee_count_estimate"),
            revenue_estimate=details_data.get("revenue_estimate"),
            years_in_business=details_data.get("years_in_business"),
            business_type=details_data.get("business_type"),
            operations_description=details_data.get("operations_description"),
        )

        risk_data = data.get("risk_assessment", {})
        risk_assessment = RiskAssessment(
            risk_level=risk_data.get("risk_level"),
            key_exposures=risk_data.get("key_exposures", []),
            risk_factors=risk_data.get("risk_factors", []),
        )

        cov_data = data.get("coverage_recommendations", {})
        coverage_recommendations = CoverageRecommendation(
            required=cov_data.get("required", []),
            recommended=cov_data.get("recommended", []),
            optional=cov_data.get("optional", []),
            notes=cov_data.get("notes", []),
        )

        carrier_suggestions = [
            CarrierSuggestion(
                name=c.get("name", "Unknown"),
                appetite=c.get("appetite", "Medium"),
                notes=c.get("notes"),
            )
            for c in data.get("carrier_suggestions", [])
        ]

        sources = [
            Source(name=s.get("name", "Unknown"), url=s.get("url"))
            for s in data.get("sources", [])
        ]

        return CommercialResearch(
            company_profile=company_profile,
            business_details=business_details,
            risk_assessment=risk_assessment,
            coverage_recommendations=coverage_recommendations,
            carrier_suggestions=carrier_suggestions,
            sources=sources,
            confidence_level="high" if profile_data.get("website") else "medium",
        )


def research_commercial(
    company_name: str,
    city_state: str,
    api_key: Optional[str] = None,
) -> CommercialResearch:
    """
    Convenience function to research a commercial business.

    Args:
        company_name: Name of the company
        city_state: City and state (e.g., "Greensboro, NC")
        api_key: Anthropic API key (optional)

    Returns:
        CommercialResearch object with findings
    """
    researcher = CommercialResearcher(api_key=api_key)
    return researcher.research(company_name, city_state)
