"""Declaration page parser for InsuranceIQ.

Uses PyMuPDF for text extraction and Claude vision for image analysis.
Returns structured policy data.
"""

import json
import os
import re
from pathlib import Path
from typing import Optional, Union

import anthropic

from ..models.policy import (
    AutoPolicy,
    Coverage,
    Deductible,
    Driver,
    HomeownersPolicy,
    ValuationType,
    Vehicle,
)
from ..utils.pdf import (
    extract_images_from_pdf,
    extract_text_from_pdf,
    load_image_as_base64,
)


HOMEOWNERS_EXTRACTION_PROMPT = """You are an expert insurance document analyst. Analyze this insurance declaration page and extract all relevant information.

Return a JSON object with the following structure (use null for any fields you cannot determine):

{
  "policy_type": "homeowners" or "auto",
  "carrier": "Insurance company name",
  "policy_number": "Policy number",
  "effective_date": "YYYY-MM-DD",
  "expiration_date": "YYYY-MM-DD",
  "insured_name": "Name of insured",
  "property_address": "Full property address",
  "policy_form": "HO-3, HO-5, etc. if visible",
  "coverages": {
    "dwelling": {"limit": 250000, "valuation": "replacement_cost" or "actual_cash_value"},
    "other_structures": {"limit": 25000, "percentage": 10},
    "personal_property": {"limit": 175000, "percentage": 70, "valuation": "replacement_cost" or "actual_cash_value"},
    "loss_of_use": {"limit": 50000, "percentage": 20},
    "liability": {"limit": 100000},
    "medical_payments": {"limit": 1000}
  },
  "deductibles": {
    "all_peril": 1000,
    "wind_hail": 2500,
    "wind_hail_percentage": 2,
    "hurricane": null,
    "hurricane_percentage": null
  },
  "endorsements": ["list", "of", "endorsements"],
  "annual_premium": 1500.00
}

Important notes:
- Coverage limits should be integers (no dollar signs or commas)
- Dates should be in YYYY-MM-DD format
- For valuation, look for terms like "Replacement Cost", "RC", "ACV", "Actual Cash Value"
- Wind/hail deductibles may be shown as percentages (e.g., "2% of Coverage A")
- Endorsements may be listed as codes (e.g., "HO-61") or descriptions
- If the policy form shows HO-3 with "Special" coverage on dwelling and "Broad" on personal property, that's standard
- Look for Coverage A/B/C/D/E/F labels which correspond to dwelling/other structures/personal property/loss of use/liability/medical payments

Return ONLY the JSON object, no additional text."""


AUTO_EXTRACTION_PROMPT = """You are an expert insurance document analyst. Analyze this auto insurance declaration page and extract all relevant information.

Return a JSON object with the following structure (use null for any fields you cannot determine):

{
  "policy_type": "auto",
  "carrier": "Insurance company name",
  "policy_number": "Policy number",
  "effective_date": "YYYY-MM-DD",
  "expiration_date": "YYYY-MM-DD",
  "insured_name": "Name of insured",
  "insured_address": "Full address",
  "coverages": {
    "bodily_injury": {"per_person": 100000, "per_accident": 300000},
    "property_damage": {"limit": 100000},
    "um_uim": {"per_person": 100000, "per_accident": 300000},
    "medical_payments": {"limit": 5000},
    "collision": {"deductible": 500},
    "comprehensive": {"deductible": 250},
    "rental_reimbursement": {"limit": 30},
    "roadside": {"limit": 100}
  },
  "vehicles": [
    {
      "year": 2022,
      "make": "Honda",
      "model": "Accord",
      "vin": "1HGCV1F34NA123456"
    }
  ],
  "drivers": [
    {
      "name": "John Smith",
      "age": 45,
      "relationship": "Insured"
    }
  ],
  "annual_premium": 1200.00,
  "six_month_premium": 600.00
}

Important notes:
- BI limits are typically shown as "100/300" meaning $100K per person, $300K per accident
- UM/UIM (Uninsured/Underinsured Motorist) may be shown separately or combined
- Look for "waived" next to UM/UIM - in NC this requires signed waiver
- Collision and Comp deductibles are per-vehicle
- Premium may be shown as 6-month or annual

Return ONLY the JSON object, no additional text."""


class DecPageParser:
    """Parser for insurance declaration pages."""

    def __init__(self, api_key: Optional[str] = None):
        """
        Initialize the parser.

        Args:
            api_key: Anthropic API key. If not provided, uses ANTHROPIC_API_KEY env var.
        """
        self.api_key = api_key or os.environ.get("ANTHROPIC_API_KEY")
        if not self.api_key:
            raise ValueError(
                "Anthropic API key required. Set ANTHROPIC_API_KEY env var or pass api_key."
            )
        self.client = anthropic.Anthropic(api_key=self.api_key)

    def parse(
        self, file_path: str | Path, policy_type: Optional[str] = None
    ) -> Union[HomeownersPolicy, AutoPolicy]:
        """
        Parse a declaration page from PDF or image.

        Args:
            file_path: Path to PDF or image file
            policy_type: 'homeowners' or 'auto'. If None, will auto-detect.

        Returns:
            Parsed policy data as HomeownersPolicy or AutoPolicy
        """
        file_path = Path(file_path)

        # Extract content based on file type
        if file_path.suffix.lower() == ".pdf":
            return self._parse_pdf(file_path, policy_type)
        elif file_path.suffix.lower() in [".png", ".jpg", ".jpeg", ".gif", ".webp"]:
            return self._parse_image(file_path, policy_type)
        else:
            raise ValueError(f"Unsupported file type: {file_path.suffix}")

    def _parse_pdf(
        self, pdf_path: Path, policy_type: Optional[str] = None
    ) -> Union[HomeownersPolicy, AutoPolicy]:
        """Parse a PDF declaration page."""
        # First try text extraction
        text = extract_text_from_pdf(pdf_path)

        # If text is sparse, use vision on rendered pages
        if len(text.strip()) < 200:
            return self._parse_with_vision(pdf_path, policy_type, is_pdf=True)

        # Use Claude to analyze the text
        return self._analyze_text(text, policy_type)

    def _parse_image(
        self, image_path: Path, policy_type: Optional[str] = None
    ) -> Union[HomeownersPolicy, AutoPolicy]:
        """Parse an image of a declaration page."""
        return self._parse_with_vision(image_path, policy_type, is_pdf=False)

    def _parse_with_vision(
        self, file_path: Path, policy_type: Optional[str] = None, is_pdf: bool = False
    ) -> Union[HomeownersPolicy, AutoPolicy]:
        """Use Claude vision to analyze the document."""
        # Prepare image(s)
        if is_pdf:
            images = extract_images_from_pdf(file_path, max_images=3)
        else:
            img = load_image_as_base64(file_path)
            images = [{"page": 1, **img}]

        # Build message content
        content = []
        for img in images:
            content.append({
                "type": "image",
                "source": {
                    "type": "base64",
                    "media_type": img["media_type"],
                    "data": img["data"],
                },
            })

        # Add prompt - auto-detect policy type if not specified
        if policy_type == "auto":
            prompt = AUTO_EXTRACTION_PROMPT
        elif policy_type == "homeowners":
            prompt = HOMEOWNERS_EXTRACTION_PROMPT
        else:
            # Auto-detect prompt
            prompt = """First, determine if this is a homeowners/property insurance policy or an auto insurance policy.

If HOMEOWNERS/PROPERTY:
""" + HOMEOWNERS_EXTRACTION_PROMPT + """

If AUTO:
""" + AUTO_EXTRACTION_PROMPT

        content.append({"type": "text", "text": prompt})

        # Call Claude
        response = self.client.messages.create(
            model="claude-sonnet-4-20250514",
            max_tokens=4096,
            messages=[{"role": "user", "content": content}],
        )

        # Parse response
        response_text = response.content[0].text
        return self._parse_response(response_text)

    def _analyze_text(
        self, text: str, policy_type: Optional[str] = None
    ) -> Union[HomeownersPolicy, AutoPolicy]:
        """Analyze extracted text with Claude."""
        # Determine prompt based on policy type
        if policy_type == "auto":
            prompt = AUTO_EXTRACTION_PROMPT
        elif policy_type == "homeowners":
            prompt = HOMEOWNERS_EXTRACTION_PROMPT
        else:
            # Auto-detect
            prompt = """Analyze this insurance declaration page text. First determine if it's homeowners or auto insurance.

If HOMEOWNERS:
""" + HOMEOWNERS_EXTRACTION_PROMPT + """

If AUTO:
""" + AUTO_EXTRACTION_PROMPT

        full_prompt = f"{prompt}\n\nDocument text:\n{text}"

        response = self.client.messages.create(
            model="claude-sonnet-4-20250514",
            max_tokens=4096,
            messages=[{"role": "user", "content": full_prompt}],
        )

        response_text = response.content[0].text
        return self._parse_response(response_text, raw_text=text)

    def _parse_response(
        self, response_text: str, raw_text: Optional[str] = None
    ) -> Union[HomeownersPolicy, AutoPolicy]:
        """Parse Claude's JSON response into policy objects."""
        # Extract JSON from response (handle markdown code blocks)
        json_match = re.search(r"```(?:json)?\s*([\s\S]*?)\s*```", response_text)
        if json_match:
            json_str = json_match.group(1)
        else:
            # Try to find JSON object directly
            json_match = re.search(r"\{[\s\S]*\}", response_text)
            if json_match:
                json_str = json_match.group(0)
            else:
                raise ValueError(f"Could not extract JSON from response: {response_text[:500]}")

        try:
            data = json.loads(json_str)
        except json.JSONDecodeError as e:
            raise ValueError(f"Invalid JSON in response: {e}")

        # Determine policy type and create appropriate object
        policy_type = data.get("policy_type", "").lower()

        if policy_type == "auto" or "bodily_injury" in data.get("coverages", {}):
            return self._create_auto_policy(data, raw_text)
        else:
            return self._create_homeowners_policy(data, raw_text)

    def _create_homeowners_policy(
        self, data: dict, raw_text: Optional[str] = None
    ) -> HomeownersPolicy:
        """Create HomeownersPolicy from parsed data."""
        coverages = data.get("coverages", {})

        def parse_coverage(cov_data: Optional[dict]) -> Optional[Coverage]:
            if not cov_data:
                return None
            valuation = None
            if cov_data.get("valuation"):
                val_str = cov_data["valuation"].lower().replace(" ", "_")
                if "replacement" in val_str:
                    valuation = ValuationType.REPLACEMENT_COST
                elif "actual" in val_str or "acv" in val_str:
                    valuation = ValuationType.ACTUAL_CASH_VALUE
            return Coverage(
                limit=cov_data.get("limit"),
                percentage=cov_data.get("percentage"),
                valuation=valuation,
            )

        deductibles_data = data.get("deductibles", {})
        deductibles = Deductible(
            all_peril=deductibles_data.get("all_peril"),
            wind_hail=deductibles_data.get("wind_hail"),
            wind_hail_percentage=deductibles_data.get("wind_hail_percentage"),
            hurricane=deductibles_data.get("hurricane"),
            hurricane_percentage=deductibles_data.get("hurricane_percentage"),
        ) if deductibles_data else None

        return HomeownersPolicy(
            carrier=data.get("carrier"),
            policy_number=data.get("policy_number"),
            effective_date=data.get("effective_date"),
            expiration_date=data.get("expiration_date"),
            insured_name=data.get("insured_name"),
            property_address=data.get("property_address"),
            dwelling=parse_coverage(coverages.get("dwelling")),
            other_structures=parse_coverage(coverages.get("other_structures")),
            personal_property=parse_coverage(coverages.get("personal_property")),
            loss_of_use=parse_coverage(coverages.get("loss_of_use")),
            liability=parse_coverage(coverages.get("liability")),
            medical_payments=parse_coverage(coverages.get("medical_payments")),
            deductibles=deductibles,
            endorsements=data.get("endorsements", []),
            annual_premium=data.get("annual_premium"),
            policy_form=data.get("policy_form"),
            raw_text=raw_text,
        )

    def _create_auto_policy(
        self, data: dict, raw_text: Optional[str] = None
    ) -> AutoPolicy:
        """Create AutoPolicy from parsed data."""
        coverages = data.get("coverages", {})

        def parse_coverage(cov_data: Optional[dict]) -> Optional[Coverage]:
            if not cov_data:
                return None
            return Coverage(
                limit=cov_data.get("limit"),
                per_person=cov_data.get("per_person"),
                per_accident=cov_data.get("per_accident"),
                deductible=cov_data.get("deductible"),
            )

        vehicles = [
            Vehicle(
                year=v.get("year"),
                make=v.get("make"),
                model=v.get("model"),
                vin=v.get("vin"),
            )
            for v in data.get("vehicles", [])
        ]

        drivers = [
            Driver(
                name=d.get("name"),
                age=d.get("age"),
                relationship=d.get("relationship"),
            )
            for d in data.get("drivers", [])
        ]

        return AutoPolicy(
            carrier=data.get("carrier"),
            policy_number=data.get("policy_number"),
            effective_date=data.get("effective_date"),
            expiration_date=data.get("expiration_date"),
            insured_name=data.get("insured_name"),
            insured_address=data.get("insured_address"),
            bodily_injury=parse_coverage(coverages.get("bodily_injury")),
            property_damage=parse_coverage(coverages.get("property_damage")),
            um_uim=parse_coverage(coverages.get("um_uim")),
            medical_payments=parse_coverage(coverages.get("medical_payments")),
            collision=parse_coverage(coverages.get("collision")),
            comprehensive=parse_coverage(coverages.get("comprehensive")),
            rental_reimbursement=parse_coverage(coverages.get("rental_reimbursement")),
            roadside=parse_coverage(coverages.get("roadside")),
            vehicles=vehicles,
            drivers=drivers,
            annual_premium=data.get("annual_premium"),
            six_month_premium=data.get("six_month_premium"),
            raw_text=raw_text,
        )


def parse_dec_page(
    file_path: str | Path,
    policy_type: Optional[str] = None,
    api_key: Optional[str] = None,
) -> Union[HomeownersPolicy, AutoPolicy]:
    """
    Convenience function to parse a declaration page.

    Args:
        file_path: Path to PDF or image file
        policy_type: 'homeowners' or 'auto'. If None, will auto-detect.
        api_key: Anthropic API key (optional, uses env var if not provided)

    Returns:
        Parsed policy data
    """
    parser = DecPageParser(api_key=api_key)
    return parser.parse(file_path, policy_type=policy_type)
