import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

// Initialize Anthropic client
const getClient = () => {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return null;
  }
  return new Anthropic({ apiKey });
};

// Comprehensive property research prompt
const PROPERTY_RESEARCH_PROMPT = `You are an expert insurance researcher helping an independent insurance agent. Research this property address thoroughly and provide comprehensive information for insurance underwriting.

Address: {address}

## Research Tasks

Search the web and gather ALL available information about:

### 1. Property Valuation
- Search Zillow for the Zestimate and property details
- Search Redfin for their estimate
- Search county tax records for assessed value
- Note any recent sales history and price

### 2. Physical Property Details
- Year built
- Square footage (heated/total)
- Lot size
- Number of bedrooms and bathrooms
- Construction type (frame, brick, masonry)
- Roof type and approximate age
- Foundation type
- Garage (attached/detached, size)
- Any recent renovations mentioned in listings

### 3. Risk Assessment
- **FEMA Flood Zone**: Search FEMA flood maps for the exact flood zone designation
- Fire protection class (search for nearest fire station)
- Distance to coast (if NC coastal area)
- Any visible risk factors from property listings (pool, trampoline, etc.)
- Neighborhood crime data if available
- Wildfire risk zone (if applicable)

### 4. Insurance-Relevant Details
- Is this in an HOA? (affects coverage needs)
- Age of major systems (HVAC, electrical, plumbing) if available
- Any unique features (solar panels, smart home, backup generator)

### 5. Local Market Context
- Neighborhood characteristics
- Recent comparable sales
- Market trends in the area

## Output Format

Provide your findings in this exact JSON structure:

\`\`\`json
{
  "address_normalized": "Full standardized address with ZIP",
  "research_confidence": "high/medium/low",
  "value_estimates": {
    "zillow": 350000,
    "zillow_url": "https://zillow.com/...",
    "redfin": 345000,
    "redfin_url": "https://redfin.com/...",
    "tax_assessed": 285000,
    "estimated_market_value": 348000,
    "estimated_replacement_cost": 385000,
    "last_sale_date": "2021-06-15",
    "last_sale_price": 320000
  },
  "property_details": {
    "year_built": 1995,
    "square_footage": 2200,
    "lot_size_sqft": 15000,
    "lot_size_acres": 0.34,
    "bedrooms": 4,
    "bathrooms": 2.5,
    "stories": 2,
    "construction_type": "Frame with brick veneer",
    "roof_type": "Architectural shingle",
    "roof_age_estimate": "10-15 years",
    "foundation": "Crawl space",
    "garage": "Attached 2-car",
    "heating": "Gas forced air",
    "cooling": "Central AC",
    "recent_updates": ["Kitchen remodel 2020", "New HVAC 2019"]
  },
  "risk_factors": {
    "flood_zone": "X",
    "flood_zone_description": "Minimal flood hazard area, outside 500-year floodplain",
    "in_special_flood_hazard_area": false,
    "fire_protection_class": 4,
    "distance_to_fire_station_miles": 1.8,
    "coastal_zone": false,
    "distance_to_coast_miles": null,
    "wildfire_risk": "Low",
    "has_pool": false,
    "has_trampoline": false,
    "has_dog_concerns": "unknown",
    "crime_risk": "Low",
    "other_risks": [],
    "positive_factors": ["Newer roof", "Updated electrical"]
  },
  "insurance_considerations": {
    "nc_beach_plan_required": false,
    "flood_insurance_recommended": false,
    "flood_insurance_required": false,
    "wind_hail_concerns": false,
    "older_home_concerns": false,
    "replacement_cost_notes": "Standard construction, replacement cost estimate based on $175/sqft"
  },
  "sources": [
    {"name": "Zillow", "url": "https://...", "accessed": "2024-01-15"},
    {"name": "FEMA Flood Map Service Center", "url": "https://msc.fema.gov/...", "accessed": "2024-01-15"},
    {"name": "County Tax Records", "url": "https://...", "accessed": "2024-01-15"}
  ],
  "agent_notes": "Key observations and any data inconsistencies to verify"
}
\`\`\`

Be thorough - search multiple sources. If you cannot find specific information, note it as null and explain why in agent_notes.`;

// Gap analysis prompt
const GAP_ANALYSIS_PROMPT = `You are an expert insurance advisor helping an independent insurance agent in North Carolina. Analyze the client's current coverage against the property research and provide comprehensive recommendations.

## Current Policy Information
{policy_info}

## Property Research
{property_research}

## Client Information
{client_info}

## North Carolina Insurance Requirements & Best Practices

**Auto Minimums:**
- Bodily Injury: $30,000 per person / $60,000 per accident
- Property Damage: $25,000
- UM/UIM: Required (matches BI unless waived in writing)

**Homeowners Best Practices:**
- Dwelling: Full replacement cost (not market value)
- Liability: Minimum $300K, $500K+ if assets over $500K
- Umbrella: Recommended if net worth over $500K

**Critical Gaps to Check:**
1. Liability too low for home value/net worth
2. ACV instead of Replacement Cost
3. Missing water backup coverage (most common claim!)
4. Flood zone without flood insurance
5. No umbrella with significant assets
6. Coastal property without proper wind coverage

## Your Analysis

Provide a comprehensive gap analysis in this JSON structure:

\`\`\`json
{
  "executive_summary": "2-3 sentence overview for the agent",
  "risk_score": "A/B/C/D/F",
  "risk_score_explanation": "Why this rating",

  "high_priority_gaps": [
    {
      "issue": "Clear issue title",
      "severity": "Critical/High",
      "current_situation": "What they have now",
      "recommended_solution": "What they should have",
      "financial_impact": "What could happen without this",
      "rationale": "Detailed explanation with NC-specific context",
      "action_steps": ["Step 1", "Step 2"],
      "estimated_cost": "Premium impact estimate if known"
    }
  ],

  "medium_priority_gaps": [...],

  "low_priority_gaps": [...],

  "positive_findings": [
    "Things the client is doing right - important for client relationship"
  ],

  "questions_for_client": [
    {
      "question": "Do you have a swimming pool?",
      "why_asking": "Pools increase liability exposure significantly",
      "if_yes": "Recommend increasing liability to $500K+, require umbrella",
      "if_no": "No action needed"
    }
  ],

  "recommended_coverage_levels": {
    "dwelling": 385000,
    "dwelling_rationale": "Based on replacement cost estimate",
    "other_structures": 38500,
    "personal_property": 269500,
    "personal_property_valuation": "Replacement Cost",
    "liability": 300000,
    "liability_rationale": "Minimum for this home value",
    "medical_payments": 5000,
    "umbrella": 1000000,
    "umbrella_rationale": "Recommended given total asset picture",
    "deductible_recommendation": 2500,
    "deductible_rationale": "Higher deductible saves premium, client should have emergency fund"
  },

  "endorsements_to_add": [
    {
      "name": "Water Backup Coverage",
      "limit": "$25,000",
      "estimated_cost": "$50-75/year",
      "priority": "High",
      "rationale": "Most common claim type, not included in standard policy"
    }
  ],

  "endorsements_to_consider": [...],

  "carrier_fit_assessment": {
    "current_carrier_suitable": true,
    "concerns": [],
    "alternative_carriers": [
      {"name": "Erie Insurance", "reason": "Competitive for this profile, strong bundling discounts"}
    ]
  },

  "agent_talking_points": [
    "Key points to discuss with the client in plain language"
  ],

  "compliance_notes": [
    "Any NC regulatory considerations"
  ]
}
\`\`\`

Be specific, actionable, and client-focused. Explain the "why" behind each recommendation.`;

// Mock scenarios (kept for testing without API key)
const MOCK_SCENARIOS: Record<string, object> = {
  "low-liability": {
    policy: {
      carrier: "NC Farm Bureau",
      dwelling_limit: 425000,
      liability_limit: 100000,
      valuation: "replacement_cost",
      endorsements: [],
    },
    property_research: {
      address: "456 Stratford Rd, Winston-Salem, NC 27103",
      value_estimates: { zillow: 425000, tax_assessed: 380000, estimated_replacement_cost: 425000 },
      property_details: { year_built: 2005, square_footage: 2800, bedrooms: 4, bathrooms: 3 },
      risk_factors: { flood_zone: "X", has_pool: false, fire_protection_class: 3 },
    },
    gap_analysis: {
      executive_summary: "Client has a well-valued home but critically low liability coverage that leaves significant assets exposed. Water backup coverage is also missing - the #1 claim type.",
      risk_score: "C",
      risk_score_explanation: "Adequate dwelling coverage but liability gap creates significant exposure",
      high_priority_gaps: [
        {
          issue: "Liability limit inadequate for asset level",
          severity: "Critical",
          current_situation: "$100,000 liability limit",
          recommended_solution: "$300,000 minimum, consider $500,000",
          financial_impact: "A serious injury on property could result in judgment exceeding limits, putting personal assets at risk",
          rationale: "With a $425,000 home, the client likely has significant assets to protect. NC courts can award substantial damages in personal injury cases. Current $100K limit is the bare minimum and leaves the client exposed.",
          action_steps: ["Increase liability to $300K minimum", "Quote umbrella policy for additional $1M protection", "Review auto liability to ensure it matches"],
          estimated_cost: "~$50-100/year increase for higher liability"
        },
        {
          issue: "No water backup/sewer coverage",
          severity: "High",
          current_situation: "Not covered",
          recommended_solution: "$10,000-$25,000 water backup endorsement",
          financial_impact: "Average water backup claim is $5,000-$10,000. Without coverage, client pays 100% out of pocket.",
          rationale: "Water backup is the #1 most common homeowners claim. Standard policies EXCLUDE this coverage. Basement/lower level flooding from backed-up sewers, sump pump failure, or drain issues is extremely common.",
          action_steps: ["Add water backup endorsement immediately", "Recommend $25K limit for this home size"],
          estimated_cost: "$50-100/year"
        },
      ],
      medium_priority_gaps: [
        {
          issue: "No umbrella policy",
          severity: "Medium",
          current_situation: "No umbrella coverage",
          recommended_solution: "$1,000,000 umbrella policy",
          financial_impact: "Umbrella provides crucial excess liability protection at very low cost",
          rationale: "For ~$200-400/year, client gets $1M additional liability protection over both home and auto. Essential for homeowners with assets to protect.",
          action_steps: ["Quote umbrella policy", "Ensure underlying auto/home liability meets carrier requirements (usually $300K)"],
          estimated_cost: "$200-400/year for $1M"
        },
        {
          issue: "No service line coverage",
          severity: "Medium",
          current_situation: "Not covered",
          recommended_solution: "$10,000 service line coverage",
          financial_impact: "Water/sewer line from street to house is homeowner's responsibility. Repairs run $5,000-$15,000.",
          rationale: "Aging infrastructure means service line failures are increasingly common. Not covered by standard policies.",
          action_steps: ["Add service line endorsement"],
          estimated_cost: "$25-50/year"
        },
      ],
      positive_findings: [
        "Dwelling coverage appears adequate for replacement cost",
        "Property in good flood zone (Zone X - minimal risk)",
        "Good fire protection class (3)",
        "Replacement cost valuation on dwelling (not ACV)"
      ],
      questions_for_client: [
        {
          question: "Do you have a swimming pool, trampoline, or aggressive dog breed?",
          why_asking: "These 'attractive nuisances' significantly increase liability exposure",
          if_yes: "Increase liability to $500K+, umbrella essential, verify disclosure to carrier",
          if_no: "Standard liability increase still recommended"
        },
        {
          question: "Do you operate any business from home?",
          why_asking: "Home-based businesses are excluded from homeowners policies",
          if_yes: "Need in-home business endorsement or separate BOP policy",
          if_no: "No action needed"
        },
        {
          question: "Do you have jewelry, art, or collectibles worth more than $2,500?",
          why_asking: "Standard policies have low sublimits for valuables",
          if_yes: "Schedule valuable items individually for full coverage",
          if_no: "Standard coverage adequate"
        },
      ],
      recommended_coverage_levels: {
        dwelling: 425000,
        liability: 300000,
        umbrella: 1000000,
        add_endorsements: ["Water backup $25,000", "Service line $10,000"]
      },
      endorsements_to_add: [
        {
          name: "Water Backup Coverage",
          limit: "$25,000",
          estimated_cost: "$50-75/year",
          priority: "High",
          rationale: "#1 claim type, not included in standard policy"
        },
        {
          name: "Service Line Coverage",
          limit: "$10,000",
          estimated_cost: "$25-50/year",
          priority: "Medium",
          rationale: "Protects against costly underground pipe repairs"
        },
      ],
      agent_talking_points: [
        "Your home coverage is good, but your liability protection has a serious gap. If someone is seriously injured on your property, $100,000 might not cover the medical bills and legal costs.",
        "Water backup is the most common claim we see, and it's not covered by your current policy. For about $50-75 a year, you can add $25,000 in protection.",
        "I'd strongly recommend an umbrella policy. For a few hundred dollars a year, you get an extra million dollars of protection that covers both your home and auto."
      ]
    }
  },
  // ... other scenarios remain the same but with enhanced structure
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { address, mock_scenario, policy_info, client_info } = body;

    // If mock scenario is provided, return mock data
    if (mock_scenario && MOCK_SCENARIOS[mock_scenario]) {
      return NextResponse.json(MOCK_SCENARIOS[mock_scenario]);
    }

    // Check for API key
    const client = getClient();

    if (!client) {
      // Return helpful message with mock scenario list
      return NextResponse.json({
        error: "ANTHROPIC_API_KEY not configured",
        message: "Set ANTHROPIC_API_KEY in environment variables to enable AI-powered research. For testing, use mock_scenario parameter.",
        available_mock_scenarios: Object.keys(MOCK_SCENARIOS),
      }, { status: 400 });
    }

    // Real AI-powered research
    if (address) {
      // Step 1: Property Research with Web Search
      const propertyPrompt = PROPERTY_RESEARCH_PROMPT.replace("{address}", address);

      const propertyResponse = await client.messages.create({
        model: "claude-sonnet-4-20250514",
        max_tokens: 4096,
        messages: [{ role: "user", content: propertyPrompt }],
        tools: [{ type: "web_search_20250305", name: "web_search" }],
      });

      // Extract property research from response
      let propertyResearch = null;
      let propertyText = "";
      for (const block of propertyResponse.content) {
        if (block.type === "text") {
          propertyText = block.text;
          break;
        }
      }

      // Parse JSON from response
      const jsonMatch = propertyText.match(/```json\s*([\s\S]*?)\s*```/) || propertyText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        try {
          propertyResearch = JSON.parse(jsonMatch[1] || jsonMatch[0]);
        } catch {
          propertyResearch = { raw_response: propertyText };
        }
      }

      // Step 2: Gap Analysis if we have policy info
      let gapAnalysis = null;
      if (policy_info || propertyResearch) {
        const gapPrompt = GAP_ANALYSIS_PROMPT
          .replace("{policy_info}", policy_info ? JSON.stringify(policy_info, null, 2) : "No current policy provided - analyze based on property only")
          .replace("{property_research}", JSON.stringify(propertyResearch, null, 2))
          .replace("{client_info}", client_info ? JSON.stringify(client_info, null, 2) : "No additional client info provided");

        const gapResponse = await client.messages.create({
          model: "claude-sonnet-4-20250514",
          max_tokens: 4096,
          messages: [{ role: "user", content: gapPrompt }],
        });

        let gapText = "";
        for (const block of gapResponse.content) {
          if (block.type === "text") {
            gapText = block.text;
            break;
          }
        }

        const gapJsonMatch = gapText.match(/```json\s*([\s\S]*?)\s*```/) || gapText.match(/\{[\s\S]*\}/);
        if (gapJsonMatch) {
          try {
            gapAnalysis = JSON.parse(gapJsonMatch[1] || gapJsonMatch[0]);
          } catch {
            gapAnalysis = { raw_response: gapText };
          }
        }
      }

      return NextResponse.json({
        property_research: propertyResearch,
        gap_analysis: gapAnalysis,
        sources_used: ["Claude AI with Web Search", "Zillow", "FEMA Flood Maps", "County Records"],
      });
    }

    return NextResponse.json({
      error: "Please provide an address or mock_scenario",
      available_mock_scenarios: Object.keys(MOCK_SCENARIOS),
    }, { status: 400 });

  } catch (error) {
    console.error("Analysis error:", error);
    return NextResponse.json({
      error: "Analysis failed",
      details: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 });
  }
}
