"""Property research module for InsuranceIQ.

Uses Claude with web search to gather property information for insurance analysis.
"""

import json
import os
import re
from typing import Optional

import anthropic

from ..models.property import (
    PropertyDetails,
    PropertyResearch,
    RiskFactors,
    Source,
    ValueEstimate,
)


PROPERTY_RESEARCH_PROMPT = """You are an expert insurance researcher. Research this property address and gather all information relevant for insurance underwriting and coverage recommendations.

Address: {address}

Search for and compile information about:

1. **Property Value**
   - Zillow estimate (Zestimate)
   - Redfin estimate
   - Recent sale price if available
   - County tax assessed value

2. **Property Details**
   - Year built
   - Square footage
   - Lot size
   - Number of bedrooms/bathrooms
   - Construction type (frame, brick, etc.)
   - Roof type and estimated age
   - Number of stories
   - Garage type

3. **Risk Factors**
   - FEMA flood zone (check FEMA flood map)
   - Distance to coast (if applicable)
   - Fire protection class
   - Any visible risk factors (pool, trampoline, etc. - from listing photos if available)
   - Wildfire risk zone (if applicable)

4. **Additional Context**
   - Neighborhood characteristics
   - Recent renovations mentioned
   - Any notable features that affect insurance

Return your findings as a JSON object with this structure:

{{
  "address_normalized": "Full standardized address",
  "value_estimates": {{
    "zillow": 350000,
    "redfin": 345000,
    "tax_assessed": 285000,
    "last_sale_price": 320000,
    "last_sale_date": "2021-06-15"
  }},
  "details": {{
    "year_built": 1995,
    "square_footage": 2200,
    "lot_size_sqft": 15000,
    "lot_size_acres": 0.35,
    "bedrooms": 4,
    "bathrooms": 2.5,
    "stories": 2,
    "construction_type": "frame",
    "exterior_material": "vinyl siding",
    "roof_type": "asphalt shingle",
    "roof_age_years": 10,
    "heating_type": "forced air",
    "cooling_type": "central AC",
    "garage": "attached 2-car",
    "foundation_type": "crawl space"
  }},
  "risk_factors": {{
    "flood_zone": "X",
    "flood_zone_description": "Minimal flood hazard, outside SFHA",
    "in_sfha": false,
    "fire_protection_class": 4,
    "distance_to_fire_station_miles": 2.3,
    "has_pool": false,
    "has_trampoline": false,
    "coastal_zone": false,
    "wildfire_risk": "low",
    "visible_risks": [],
    "notes": ["Mature trees near structure"]
  }},
  "owner_name": "John Smith",
  "sources": [
    {{"name": "Zillow", "url": "https://zillow.com/...", "notes": "Primary value source"}},
    {{"name": "FEMA Flood Map", "url": "https://msc.fema.gov/...", "notes": "Flood zone determination"}},
    {{"name": "County Tax Records", "url": "...", "notes": "Tax assessment and ownership"}}
  ],
  "confidence_level": "high",
  "research_notes": "Any additional observations or caveats"
}}

Important:
- Use null for any fields you cannot determine
- Include source URLs where possible
- Note any data that seems inconsistent
- For flood zones: X = minimal risk, A/AE = high risk (SFHA), V/VE = coastal high risk
- Fire protection class: 1-10, lower is better (1-4 is good, 8-10 is poor/rural)

Return ONLY the JSON object."""


class PropertyResearcher:
    """Researches property information using Claude with web search."""

    def __init__(self, api_key: Optional[str] = None):
        """
        Initialize the researcher.

        Args:
            api_key: Anthropic API key. If not provided, uses ANTHROPIC_API_KEY env var.
        """
        self.api_key = api_key or os.environ.get("ANTHROPIC_API_KEY")
        if not self.api_key:
            raise ValueError(
                "Anthropic API key required. Set ANTHROPIC_API_KEY env var or pass api_key."
            )
        self.client = anthropic.Anthropic(api_key=self.api_key)

    def research(self, address: str) -> PropertyResearch:
        """
        Research a property address.

        Args:
            address: Property address to research

        Returns:
            PropertyResearch object with findings
        """
        prompt = PROPERTY_RESEARCH_PROMPT.format(address=address)

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

        return self._parse_response(response_text, address)

    def _parse_response(self, response_text: str, address: str) -> PropertyResearch:
        """Parse Claude's JSON response into PropertyResearch."""
        # Extract JSON from response
        json_match = re.search(r"```(?:json)?\s*([\s\S]*?)\s*```", response_text)
        if json_match:
            json_str = json_match.group(1)
        else:
            json_match = re.search(r"\{[\s\S]*\}", response_text)
            if json_match:
                json_str = json_match.group(0)
            else:
                # Return minimal research object if parsing fails
                return PropertyResearch(
                    address=address,
                    confidence_level="low",
                )

        try:
            data = json.loads(json_str)
        except json.JSONDecodeError:
            return PropertyResearch(
                address=address,
                confidence_level="low",
            )

        # Build PropertyResearch object
        value_data = data.get("value_estimates", {})
        value_estimates = ValueEstimate(
            zillow=value_data.get("zillow"),
            redfin=value_data.get("redfin"),
            tax_assessed=value_data.get("tax_assessed"),
        )

        details_data = data.get("details", {})
        details = PropertyDetails(
            year_built=details_data.get("year_built"),
            square_footage=details_data.get("square_footage"),
            lot_size_sqft=details_data.get("lot_size_sqft"),
            lot_size_acres=details_data.get("lot_size_acres"),
            bedrooms=details_data.get("bedrooms"),
            bathrooms=details_data.get("bathrooms"),
            stories=details_data.get("stories"),
            construction_type=details_data.get("construction_type"),
            exterior_material=details_data.get("exterior_material"),
            roof_type=details_data.get("roof_type"),
            roof_age_years=details_data.get("roof_age_years"),
            heating_type=details_data.get("heating_type"),
            cooling_type=details_data.get("cooling_type"),
            garage=details_data.get("garage"),
            foundation_type=details_data.get("foundation_type"),
        )

        risk_data = data.get("risk_factors", {})
        risk_factors = RiskFactors(
            flood_zone=risk_data.get("flood_zone"),
            flood_zone_description=risk_data.get("flood_zone_description"),
            in_sfha=risk_data.get("in_sfha", False),
            fire_protection_class=risk_data.get("fire_protection_class"),
            distance_to_fire_station_miles=risk_data.get("distance_to_fire_station_miles"),
            has_pool=risk_data.get("has_pool", False),
            has_trampoline=risk_data.get("has_trampoline", False),
            coastal_zone=risk_data.get("coastal_zone", False),
            wildfire_risk=risk_data.get("wildfire_risk"),
            visible_risks=risk_data.get("visible_risks", []),
            notes=risk_data.get("notes", []),
        )

        sources = [
            Source(
                name=s.get("name", "Unknown"),
                url=s.get("url"),
                notes=s.get("notes"),
            )
            for s in data.get("sources", [])
        ]

        return PropertyResearch(
            address=address,
            address_normalized=data.get("address_normalized"),
            value_estimates=value_estimates,
            details=details,
            risk_factors=risk_factors,
            owner_name=data.get("owner_name"),
            last_sale_date=value_data.get("last_sale_date"),
            last_sale_price=value_data.get("last_sale_price"),
            sources=sources,
            confidence_level=data.get("confidence_level", "medium"),
        )


def research_property(
    address: str, api_key: Optional[str] = None
) -> PropertyResearch:
    """
    Convenience function to research a property.

    Args:
        address: Property address to research
        api_key: Anthropic API key (optional, uses env var if not provided)

    Returns:
        PropertyResearch object with findings
    """
    researcher = PropertyResearcher(api_key=api_key)
    return researcher.research(address)
