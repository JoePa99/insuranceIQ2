# InsuranceIQ - AI Insurance Research Tool

## Project Overview

InsuranceIQ is an AI-powered insurance research and recommendation tool designed for independent insurance agents. It automates the research process that agents typically do manually - analyzing declaration pages, researching properties, and identifying coverage gaps.

**Core Philosophy**: This is a research agent, not an API integration. If a human researcher with a browser could find it, AI can find it. No external APIs needed for Phase 1.

## Architecture

```
insuranceiq/
├── src/
│   ├── parsers/           # Document parsing modules
│   │   ├── dec_page.py    # Declaration page parser
│   │   └── __init__.py
│   ├── research/          # Research modules
│   │   ├── property.py    # Property research (Zillow, FEMA, etc.)
│   │   ├── commercial.py  # Commercial business research
│   │   └── __init__.py
│   ├── analysis/          # Analysis engines
│   │   ├── gap_analysis.py
│   │   └── __init__.py
│   ├── models/            # Data models
│   │   ├── policy.py      # Policy data structures
│   │   ├── property.py    # Property data structures
│   │   └── __init__.py
│   └── utils/             # Utilities
│       ├── pdf.py         # PDF extraction helpers
│       └── __init__.py
├── tests/                 # Test files
├── data/                  # Mock data and samples
│   └── mock_dec_pages/
├── analyze.py             # Main CLI entry point
├── requirements.txt
└── CLAUDE.md
```

## Technology Stack

- **Python 3.11+**
- **PyMuPDF (fitz)**: PDF text extraction
- **anthropic**: Claude API for vision analysis and AI reasoning
- **Pydantic**: Data validation and models
- **Click**: CLI framework
- **Rich**: Beautiful terminal output

## Insurance Domain Knowledge

### North Carolina Requirements (Personal Lines)

**Auto Insurance Minimums:**
- Bodily Injury: $30,000 per person / $60,000 per accident
- Property Damage: $25,000 per accident
- UM/UIM: Required, matches BI limits unless waived in writing

**Homeowners:**
- No state-mandated minimums, but lenders require coverage
- Coastal areas: Wind/hail often excluded, requires NC Beach Plan
- Flood: Not included in standard HO policies, requires separate NFIP or private flood

### Common Coverage Gaps (Personal Lines)

**High Priority (Red Flags):**
1. **Liability too low for asset level** - Client with $500K home and $100K liability
2. **ACV instead of Replacement Cost** - Common on older homes, devastating at claim time
3. **No water backup coverage** - Most common claim, rarely included by default
4. **Flood zone property without flood insurance** - Especially A/V zones
5. **No umbrella with significant assets** - High net worth clients need $1M+ umbrella
6. **UM/UIM waived or at minimums** - Protects against underinsured drivers

**Medium Priority (Recommendations):**
1. **Personal property limits too low** - Default 50-70% of dwelling often insufficient
2. **Missing scheduled personal property** - Jewelry, art, collectibles need scheduling
3. **No identity theft coverage** - Increasingly important
4. **Outdated home inventory** - Affects claims settlement
5. **Missing ordinance/law coverage** - Critical for older homes

**Considerations (Questions to Ask):**
1. Home-based business? (Excluded from HO)
2. Swimming pool, trampoline, dogs? (Liability exposure)
3. Vacation home or rental property? (Different policy type needed)
4. College student with car at school? (Rating considerations)
5. Recent renovations? (May need to increase dwelling coverage)

### Coverage Level Guidelines

**Dwelling Coverage:**
- Should be full replacement cost, not market value
- Review annually, especially after renovations
- Consider extended replacement cost (125%) endorsement

**Liability:**
- Minimum $300K for most homeowners
- $500K+ if net worth over $500K
- Umbrella policy if net worth over $1M

**Deductibles:**
- Standard: $1,000-$2,500 all peril
- Wind/Hail: Often 2-5% of dwelling in coastal areas
- Consider premium savings vs. out-of-pocket risk

### NC-Specific Carriers (Personal Lines)

**Standard Markets:**
- NC Farm Bureau (dominant in rural areas)
- State Farm, Allstate, Nationwide (majors)
- Erie, Travelers, Hartford (regional strength)

**Coastal/Non-Standard:**
- NC Beach Plan (wind-only for coastal)
- NC FAIR Plan (last resort)
- Various surplus lines for difficult risks

## Data Models

### Declaration Page Data (Homeowners)
```json
{
  "carrier": "string",
  "policy_number": "string",
  "effective_date": "date",
  "expiration_date": "date",
  "insured_name": "string",
  "property_address": "string",
  "coverages": {
    "dwelling": {"limit": 250000, "valuation": "replacement_cost"},
    "other_structures": {"limit": 25000, "percentage": 10},
    "personal_property": {"limit": 175000, "percentage": 70},
    "loss_of_use": {"limit": 50000, "percentage": 20},
    "liability": {"limit": 100000},
    "medical_payments": {"limit": 1000}
  },
  "deductibles": {
    "all_peril": 1000,
    "wind_hail": null,
    "hurricane": null
  },
  "endorsements": ["water_backup", "scheduled_jewelry"],
  "premium": {"annual": 1500, "monthly": null}
}
```

### Declaration Page Data (Auto)
```json
{
  "carrier": "string",
  "policy_number": "string",
  "coverages": {
    "bodily_injury": {"per_person": 100000, "per_accident": 300000},
    "property_damage": {"limit": 100000},
    "um_uim": {"per_person": 100000, "per_accident": 300000},
    "medical_payments": {"limit": 5000},
    "collision": {"deductible": 500},
    "comprehensive": {"deductible": 250}
  },
  "vehicles": [
    {
      "year": 2022,
      "make": "Honda",
      "model": "Accord",
      "vin": "string"
    }
  ],
  "drivers": [
    {
      "name": "string",
      "age": 45,
      "license_status": "valid"
    }
  ]
}
```

### Property Research Data
```json
{
  "address": "string",
  "estimated_value": {
    "zillow": 350000,
    "redfin": 345000,
    "tax_assessed": 285000
  },
  "property_details": {
    "year_built": 1995,
    "square_footage": 2200,
    "lot_size_acres": 0.35,
    "bedrooms": 4,
    "bathrooms": 2.5,
    "construction_type": "frame",
    "roof_type": "asphalt_shingle",
    "roof_age_estimate": "10-15 years"
  },
  "risk_factors": {
    "flood_zone": "X",
    "flood_zone_description": "Minimal flood hazard",
    "visible_risks": ["swimming_pool"],
    "distance_to_fire_station": "2.3 miles",
    "fire_protection_class": 4
  },
  "sources": [
    {"name": "Zillow", "url": "https://...", "accessed": "2024-01-15"}
  ]
}
```

## Gap Analysis Output

```json
{
  "high_priority_gaps": [
    {
      "issue": "Liability limit inadequate for home value",
      "current": "$100,000",
      "recommended": "$300,000+",
      "rationale": "Home valued at $350K+ suggests assets that need protection. Current $100K liability leaves significant exposure.",
      "action": "Increase liability to minimum $300K, discuss umbrella policy"
    }
  ],
  "medium_priority_gaps": [...],
  "considerations": [
    {
      "question": "Does the client have a swimming pool?",
      "why_it_matters": "Satellite imagery suggests possible pool. Pools increase liability exposure and may require additional coverage or higher limits.",
      "if_yes": "Recommend $500K+ liability, consider umbrella"
    }
  ],
  "recommended_coverages": {
    "dwelling": 385000,
    "liability": 300000,
    "umbrella": 1000000,
    "add_endorsements": ["water_backup", "service_line"]
  },
  "agent_summary": "Markdown formatted summary for agent use"
}
```

## Development Notes

### Running the CLI
```bash
# Full analysis
python analyze.py --address "123 Main St, Winston-Salem, NC" --dec-page ./dec.pdf

# Property research only
python analyze.py --address "123 Main St, Winston-Salem, NC" --property-only

# Parse dec page only
python analyze.py --dec-page ./dec.pdf --parse-only
```

### Environment Variables
```
ANTHROPIC_API_KEY=your_key_here
```

### Testing
```bash
pytest tests/ -v
```

## Phase 2 Ideas (Future)

- Web frontend with Next.js
- Commercial lines analysis
- Carrier appetite matching
- Quote comparison automation
- Client portal for document upload
- Integration with agency management systems
