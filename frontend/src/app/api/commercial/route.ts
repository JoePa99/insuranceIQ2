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

// Comprehensive commercial research prompt
const COMMERCIAL_RESEARCH_PROMPT = `You are an expert commercial insurance researcher helping an independent insurance agent in North Carolina. Research this business thoroughly to support commercial insurance placement.

Company: {company_name}
Location: {city_state}

## Research Tasks

Search the web comprehensively and gather ALL available information:

### 1. Company Identity & Legal Status
- Search NC Secretary of State for business registration
- Find the exact legal name and entity type (LLC, Corp, etc.)
- Formation/incorporation date
- Registered agent
- Current status (Active, Dissolved, etc.)
- Any name changes or DBAs

### 2. Business Operations
- Search the company website for services/products offered
- Determine primary operations and business model
- Identify any secondary operations or services
- Look for certifications, licenses (contractor license, professional license)
- Geographic service area

### 3. Company Size & Financials
- Search LinkedIn for employee count
- Estimate revenue range based on:
  - Company size indicators
  - Industry benchmarks
  - Any public information
- Number of locations/offices
- Fleet size if applicable (look for vehicle info)

### 4. Industry Classification
- Determine the most accurate NAICS code
- Identify SIC code
- Industry-specific considerations

### 5. Risk Intelligence
- Search for any lawsuits, claims, or legal issues
- Look for news articles about the company
- Check Google/Yelp reviews for operational insights
- Identify any safety incidents or regulatory issues
- BBB rating if available

### 6. Ownership & Management
- Identify owners/principals if possible
- Key management team
- Professional credentials

## Output Format

Provide your findings in this exact JSON structure:

\`\`\`json
{
  "research_confidence": "high/medium/low",
  "company_profile": {
    "name": "Business Name",
    "legal_name": "BUSINESS NAME, LLC",
    "entity_type": "Limited Liability Company",
    "dba_names": [],
    "address": "Full business address",
    "mailing_address": "If different",
    "phone": "If found",
    "website": "https://...",
    "email": "If found",
    "description": "Comprehensive description of what the business does",
    "formation_date": "2015-03-15",
    "state_of_formation": "NC",
    "status": "Active",
    "registered_agent": "Name and address",
    "nc_sos_url": "Link to SOS record"
  },

  "industry_classification": {
    "naics_code": "238220",
    "naics_description": "Plumbing, Heating, and Air-Conditioning Contractors",
    "sic_code": "1711",
    "sic_description": "Plumbing, Heating and Air-Conditioning",
    "industry_group": "Construction - Specialty Trade Contractors",
    "iso_class_code": "If known"
  },

  "business_operations": {
    "primary_services": ["List of main services"],
    "secondary_services": ["Any additional services"],
    "service_area": "Geographic coverage",
    "business_model": "B2B, B2C, or both",
    "customer_types": ["Residential", "Commercial", etc.],
    "certifications": ["Any professional certifications"],
    "licenses": ["Contractor license #", etc.],
    "equipment": ["Major equipment used in operations"],
    "subcontractor_use": "Yes/No/Unknown with details"
  },

  "company_size": {
    "employee_count_estimate": "5-10",
    "employee_count_source": "LinkedIn/Website/Estimate",
    "full_time_employees": "Estimate",
    "part_time_employees": "Estimate",
    "revenue_estimate": "$500,000 - $1,000,000",
    "revenue_source": "Industry benchmark/Public info",
    "years_in_business": 8,
    "number_of_locations": 1,
    "owns_real_estate": "Yes/No/Unknown",
    "fleet_vehicles": "Estimate number and types",
    "annual_payroll_estimate": "$200,000 - $400,000"
  },

  "ownership_management": {
    "owners": [
      {"name": "John Smith", "title": "Owner/Member", "ownership_percentage": "100%"}
    ],
    "key_personnel": [
      {"name": "Jane Doe", "title": "Operations Manager"}
    ],
    "professional_designations": ["Master Plumber License"]
  },

  "risk_profile": {
    "risk_level": "Low/Medium/High",
    "key_exposures": [
      {
        "exposure": "Completed Operations",
        "severity": "High",
        "description": "Risk of property damage claims after work is completed"
      }
    ],
    "loss_history_indicators": "Any news/reviews suggesting claims history",
    "regulatory_concerns": "Any compliance issues found",
    "litigation_history": "Any lawsuits found",
    "safety_record": "Any OSHA issues or safety concerns",
    "bbb_rating": "If found",
    "google_rating": "4.5/5 (123 reviews)",
    "online_reputation_summary": "Summary of review sentiment"
  },

  "coverage_recommendations": {
    "required_coverages": [
      {
        "coverage": "General Liability",
        "recommended_limits": "$1,000,000 occurrence / $2,000,000 aggregate",
        "rationale": "Standard for contractor operations",
        "nc_requirement": "Not required but industry standard"
      },
      {
        "coverage": "Workers Compensation",
        "recommended_limits": "Statutory NC limits",
        "rationale": "Required in NC for 3+ employees",
        "nc_requirement": "Required if 3+ employees"
      }
    ],
    "recommended_coverages": [
      {
        "coverage": "Commercial Auto",
        "recommended_limits": "$1,000,000 CSL",
        "rationale": "Service vehicles on the road daily create exposure",
        "priority": "High"
      }
    ],
    "optional_coverages": [
      {
        "coverage": "Cyber Liability",
        "recommended_limits": "$100,000",
        "rationale": "Customer data protection",
        "priority": "Low"
      }
    ],
    "special_considerations": [
      "Ensure completed operations coverage is included",
      "Consider tools & equipment floater for contractor equipment"
    ]
  },

  "carrier_recommendations": [
    {
      "carrier": "Travelers",
      "appetite": "High",
      "rationale": "Strong contractor program, good completed ops coverage",
      "strengths": ["Package policies", "Risk engineering support"],
      "considerations": ["May require loss control visit"]
    }
  ],

  "submission_checklist": [
    "ACORD 125 - Commercial Insurance Application",
    "ACORD 126 - Commercial General Liability",
    "3 years loss runs",
    "Copy of contractor license",
    "Equipment list with values"
  ],

  "premium_estimate_range": {
    "gl_estimate": "$2,000 - $4,000",
    "wc_estimate": "$3,000 - $6,000",
    "auto_estimate": "$2,000 - $4,000 per vehicle",
    "package_estimate": "$8,000 - $15,000 total",
    "basis": "Based on estimated payroll, revenue, and vehicle count"
  },

  "sources": [
    {"name": "NC Secretary of State", "url": "https://www.sosnc.gov/...", "data_found": "Business registration info"},
    {"name": "Company Website", "url": "https://...", "data_found": "Services, contact info"},
    {"name": "LinkedIn", "url": "https://linkedin.com/company/...", "data_found": "Employee count"},
    {"name": "Google Business Profile", "data_found": "Reviews, hours, photos"}
  ],

  "agent_notes": "Key observations, data gaps, and recommendations for follow-up",

  "questions_for_prospect": [
    "What is your annual gross revenue?",
    "How many W-2 employees do you have?",
    "Do you use subcontractors? If so, do you obtain certificates of insurance?",
    "What is your largest single job/contract value?"
  ]
}
\`\`\`

Be extremely thorough. Search multiple sources. Cross-reference information. Note any discrepancies or data gaps.`;

// Fallback classification if AI is not available
const FALLBACK_CLASSIFICATIONS: Record<string, {
  naics_code: string;
  naics_description: string;
  risk_level: string;
  key_exposures: string[];
  required_coverage: string[];
  recommended_coverage: string[];
  carrier_suggestions: { name: string; appetite: string; notes?: string }[];
}> = {
  plumber: {
    naics_code: "238220",
    naics_description: "Plumbing, Heating, and Air-Conditioning Contractors",
    risk_level: "Medium-High",
    key_exposures: ["Completed operations liability", "Water damage", "Employee injuries", "Vehicle accidents"],
    required_coverage: ["General Liability", "Commercial Auto", "Workers Compensation"],
    recommended_coverage: ["Inland Marine", "Umbrella", "E&O"],
    carrier_suggestions: [
      { name: "Travelers", appetite: "High", notes: "Strong contractor program" },
      { name: "Hartford", appetite: "High", notes: "Good workers comp" },
      { name: "Berkshire Hathaway GUARD", appetite: "High" },
    ],
  },
  accounting: {
    naics_code: "541211",
    naics_description: "Offices of Certified Public Accountants",
    risk_level: "Low-Medium",
    key_exposures: ["Professional liability", "Cyber/data breach", "Client financial losses"],
    required_coverage: ["Professional Liability", "General Liability", "Cyber"],
    recommended_coverage: ["Business Property", "EPLI", "D&O"],
    carrier_suggestions: [
      { name: "Hartford", appetite: "High" },
      { name: "CNA", appetite: "High", notes: "Accountant specialty" },
      { name: "Hiscox", appetite: "High", notes: "Good for small firms" },
    ],
  },
  restaurant: {
    naics_code: "722511",
    naics_description: "Full-Service Restaurants",
    risk_level: "High",
    key_exposures: ["Liquor liability", "Foodborne illness", "Slip and fall", "Fire", "Employee injuries"],
    required_coverage: ["General Liability", "Property", "Workers Comp", "Liquor Liability"],
    recommended_coverage: ["Business Interruption", "Equipment Breakdown", "Umbrella", "EPLI"],
    carrier_suggestions: [
      { name: "Society Insurance", appetite: "High", notes: "Restaurant specialty" },
      { name: "Markel", appetite: "High", notes: "Good for difficult risks" },
    ],
  },
  tech: {
    naics_code: "541512",
    naics_description: "Computer Systems Design Services",
    risk_level: "Low-Medium",
    key_exposures: ["Technology E&O", "Cyber/data breach", "IP infringement"],
    required_coverage: ["Technology E&O", "Cyber Liability", "General Liability"],
    recommended_coverage: ["Business Property", "EPLI", "D&O"],
    carrier_suggestions: [
      { name: "Hartford", appetite: "High", notes: "Tech focus" },
      { name: "Hiscox", appetite: "High", notes: "Great for startups" },
      { name: "Coalition", appetite: "High", notes: "Cyber-first" },
    ],
  },
};

function classifyBusinessFallback(companyName: string): string {
  const name = companyName.toLowerCase();
  if (name.includes("plumb") || name.includes("hvac") || name.includes("heating") || name.includes("electric") || name.includes("contractor")) {
    return "plumber";
  }
  if (name.includes("cpa") || name.includes("account") || name.includes("tax") || name.includes("bookkeep")) {
    return "accounting";
  }
  if (name.includes("restaurant") || name.includes("bistro") || name.includes("cafe") || name.includes("grill") || name.includes("kitchen") || name.includes("bar")) {
    return "restaurant";
  }
  return "tech";
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { company_name, city_state } = body;

    if (!company_name || !city_state) {
      return NextResponse.json({ error: "Company name and city/state are required" }, { status: 400 });
    }

    // Check for API key
    const client = getClient();

    if (client) {
      // Use Claude with web search for comprehensive research
      const prompt = COMMERCIAL_RESEARCH_PROMPT
        .replace("{company_name}", company_name)
        .replace("{city_state}", city_state);

      const response = await client.messages.create({
        model: "claude-sonnet-4-20250514",
        max_tokens: 8192,
        messages: [{ role: "user", content: prompt }],
        tools: [{ type: "web_search_20250305", name: "web_search" }],
      });

      // Extract response
      let responseText = "";
      for (const block of response.content) {
        if (block.type === "text") {
          responseText = block.text;
          break;
        }
      }

      // Parse JSON
      const jsonMatch = responseText.match(/```json\s*([\s\S]*?)\s*```/) || responseText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        try {
          const result = JSON.parse(jsonMatch[1] || jsonMatch[0]);
          return NextResponse.json({
            ...result,
            ai_powered: true,
          });
        } catch {
          // Return raw response if JSON parsing fails
          return NextResponse.json({
            raw_response: responseText,
            ai_powered: true,
            parse_error: true,
          });
        }
      }
    }

    // Fallback to classification-based response
    const businessType = classifyBusinessFallback(company_name);
    const classification = FALLBACK_CLASSIFICATIONS[businessType];

    const fallbackResult = {
      ai_powered: false,
      message: "Set ANTHROPIC_API_KEY for AI-powered research with real business data",
      company_profile: {
        name: company_name,
        legal_name: company_name.toUpperCase() + ", LLC",
        address: city_state,
        description: `${company_name} is a ${classification.naics_description.toLowerCase()} in ${city_state}.`,
        status: "Active (assumed)",
      },
      industry_classification: {
        naics_code: classification.naics_code,
        naics_description: classification.naics_description,
      },
      business_operations: {
        primary_services: ["Based on business name classification"],
        service_area: city_state,
      },
      company_size: {
        employee_count_estimate: "Unknown - requires research",
        revenue_estimate: "Unknown - requires research",
        years_in_business: "Unknown",
      },
      risk_profile: {
        risk_level: classification.risk_level,
        key_exposures: classification.key_exposures.map(exp => ({
          exposure: exp,
          severity: "Medium",
          description: exp,
        })),
      },
      coverage_recommendations: {
        required_coverages: classification.required_coverage.map(cov => ({
          coverage: cov,
          recommended_limits: "Standard limits",
          rationale: "Industry standard for this business type",
        })),
        recommended_coverages: classification.recommended_coverage.map(cov => ({
          coverage: cov,
          priority: "Medium",
        })),
      },
      carrier_recommendations: classification.carrier_suggestions.map(s => ({
        carrier: s.name,
        appetite: s.appetite,
        rationale: s.notes || "Good fit for this class",
      })),
      questions_for_prospect: [
        "What is your annual gross revenue?",
        "How many employees do you have?",
        "Do you use subcontractors?",
        "What is your largest contract value?",
      ],
      sources: [
        { name: "Business name classification", data_found: "Industry type estimate" },
      ],
    };

    return NextResponse.json(fallbackResult);

  } catch (error) {
    console.error("Commercial research error:", error);
    return NextResponse.json({
      error: "Research failed",
      details: error instanceof Error ? error.message : "Unknown error",
    }, { status: 500 });
  }
}
