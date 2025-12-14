# InsuranceIQ - AI Insurance Recommendation Tool

## Project Overview

An AI-powered tool for independent insurance agents that:
1. Takes client information (name/address for personal lines, company name for commercial)
2. Researches and enriches the client profile
3. Analyzes insurance needs and identifies coverage gaps
4. Recommends appropriate coverage types and endorsements
5. Matches to carriers with appetite for the risk
6. Pulls comparative quotes where API access allows

**Target User:** Independent insurance agent in North Carolina (expandable to other states)

**Regulatory Constraint:** All recommendations must flow through the licensed agent. This is an agent-facing tool, not consumer-facing.

**Core Philosophy:** This is a research agent, not an API integration. If a human researcher with a browser could find it, AI can find it. No external APIs needed for Phase 1.

## Build Sequence

### Phase 1: Personal Lines MVP (Current Focus)
- [x] Dec page parser (PDF/image extraction with Claude vision)
- [x] Property research (Claude + web search)
- [x] AI coverage gap analysis
- [x] CLI for testing
- [ ] Client data intake (name, address, basic info)
- [ ] Web frontend (React/Next.js)
- [ ] Endorsement recommendations
- [ ] Carrier matching based on client profile

### Phase 2: Small Commercial
- Company enrichment via Apollo.io/Clearbit
- AI risk analysis and insurance needs assessment
- Ask Kodiak integration for carrier appetite
- Bold Penguin or Tarmika integration for quoting

### Phase 3: Specialty Lines
- Professional liability, cyber, E&O
- More complex carrier matching logic

## Current Architecture

```
insuranceiq/
├── src/
│   ├── parsers/           # Document parsing modules
│   │   └── dec_page.py    # Declaration page parser (Claude vision)
│   ├── research/          # Research modules
│   │   ├── property.py    # Property research (web search)
│   │   └── commercial.py  # Commercial business research (future)
│   ├── analysis/          # Analysis engines
│   │   └── gap_analysis.py
│   ├── models/            # Pydantic data models
│   │   ├── policy.py      # HomeownersPolicy, AutoPolicy
│   │   └── property.py    # PropertyResearch, RiskFactors
│   └── utils/
│       └── pdf.py         # PyMuPDF extraction helpers
├── data/
│   └── mock_dec_pages/    # 7 mock scenarios for testing
├── tests/
├── analyze.py             # CLI entry point
├── requirements.txt
└── CLAUDE.md
```

## Technology Stack

**Current (Phase 1 CLI):**
- Python 3.11+
- PyMuPDF (fitz): PDF text extraction
- anthropic: Claude API for vision analysis and web search
- Pydantic: Data validation and models
- Click: CLI framework
- Rich: Terminal output formatting

**Future (Web App):**
- Backend: Python with FastAPI
- Frontend: React with TypeScript, Tailwind CSS
- Database: PostgreSQL
- Cache: Redis for API responses

## API Keys Needed

```bash
# Required for Phase 1
ANTHROPIC_API_KEY=         # Self-serve: console.anthropic.com

# Future integrations (Phase 2+)
CANOPY_CLIENT_ID=          # Self-serve: usecanopy.com ($100/mo)
CANOPY_CLIENT_SECRET=
APOLLO_API_KEY=            # Self-serve: apollo.io (free tier)
GOOGLE_PLACES_API_KEY=     # Self-serve: Google Cloud Console
```

## What's Self-Serve vs. Requires Partnerships

**Self-Serve (build now):**
- Claude API - AI analysis and web search
- Canopy Connect - existing policy data pull ($100/mo)
- Apollo.io - company enrichment (free tier)
- Google Places - business verification
- Public records - NC SOS, county property data

**Manual Workarounds (no API needed):**
- Carrier appetite - build your own database
- Quoting - export to agent's existing rater (EZLynx, etc.)
- Commercial submissions - pre-fill ACORD forms

**Future Partnerships (after MVP proves value):**
- Zywave PL Quoting API
- Ask Kodiak
- Bold Penguin/Tarmika

---

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

---

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
    {"year": 2022, "make": "Honda", "model": "Accord", "vin": "string"}
  ],
  "drivers": [
    {"name": "string", "age": 45, "license_status": "valid"}
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

### Gap Analysis Output
```json
{
  "high_priority_gaps": [
    {
      "issue": "Liability limit inadequate for home value",
      "current": "$100,000",
      "recommended": "$300,000+",
      "rationale": "Home valued at $350K+ suggests assets that need protection.",
      "action": "Increase liability to minimum $300K, discuss umbrella policy"
    }
  ],
  "medium_priority_gaps": [],
  "considerations": [
    {
      "question": "Does the client have a swimming pool?",
      "why_it_matters": "Pools increase liability exposure.",
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

---

## CLI Usage

```bash
# Full analysis with real data (requires ANTHROPIC_API_KEY)
python analyze.py --address "123 Main St, Winston-Salem, NC" --dec-page ./sample.pdf

# Property research only
python analyze.py --address "456 Beach Rd, Wilmington, NC" --property-only

# Parse dec page only
python analyze.py --dec-page ./sample.pdf --parse-only

# Test with mock scenarios (no API key needed)
python analyze.py --mock-scenario low-liability
python analyze.py --mock-scenario acv-dwelling
python analyze.py --mock-scenario flood-zone
python analyze.py --mock-scenario no-umbrella
python analyze.py --mock-scenario well-covered

# Output formats: rich (default), json, markdown
python analyze.py --mock-scenario low-liability --output json
```

## Mock Scenarios

| Scenario | Description |
|----------|-------------|
| `low-liability` | $450K home with only $100K liability |
| `acv-dwelling` | Older home with ACV instead of replacement cost |
| `no-water-backup` | Good coverage but missing water backup |
| `flood-zone` | Coastal property in flood zone without flood insurance |
| `no-umbrella` | High-value home without umbrella |
| `minimal-auto` | NC minimum auto limits |
| `well-covered` | Example of proper coverage for comparison |

---

## Development Notes

- Keep responses concise and agent-focused
- Don't over-engineer - this is MVP
- Focus on the AI analysis layer first; that's the differentiated value
- Real quoting APIs require partnerships; mock them initially
- Log all AI recommendations for E&O protection

### Testing
```bash
pytest tests/ -v
```

### Sample Test Addresses
- `123 Main St, Winston-Salem, NC` - Suburban single family
- `456 Beach Rd, Wilmington, NC` - Coastal, flood zone
- `789 Mountain View Dr, Asheville, NC` - Mountain market
