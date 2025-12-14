import { NextRequest, NextResponse } from "next/server";

// Business type classifications and their typical coverage needs
const BUSINESS_CLASSIFICATIONS: Record<string, {
  naics_code: string;
  naics_description: string;
  risk_level: string;
  key_exposures: string[];
  required_coverage: string[];
  recommended_coverage: string[];
  optional_coverage: string[];
  carrier_suggestions: { name: string; appetite: string; notes?: string }[];
}> = {
  plumber: {
    naics_code: "238220",
    naics_description: "Plumbing, Heating, and Air-Conditioning Contractors",
    risk_level: "Medium-High",
    key_exposures: ["Completed operations liability", "Water damage to customer property", "Employee injuries", "Vehicle accidents"],
    required_coverage: ["General Liability", "Commercial Auto", "Workers Compensation"],
    recommended_coverage: ["Inland Marine (tools/equipment)", "Umbrella/Excess Liability", "Errors & Omissions"],
    optional_coverage: ["Cyber Liability", "Employment Practices Liability"],
    carrier_suggestions: [
      { name: "Travelers", appetite: "High", notes: "Strong contractor program" },
      { name: "Hartford", appetite: "High", notes: "Good workers comp rates" },
      { name: "Berkshire Hathaway GUARD", appetite: "High", notes: "Easy online submission" },
      { name: "Nationwide", appetite: "Medium" },
    ],
  },
  accounting: {
    naics_code: "541211",
    naics_description: "Offices of Certified Public Accountants",
    risk_level: "Low-Medium",
    key_exposures: ["Professional liability (E&O)", "Cyber/data breach", "Client financial losses"],
    required_coverage: ["Professional Liability (E&O)", "General Liability"],
    recommended_coverage: ["Cyber Liability", "Business Property", "Employment Practices Liability"],
    optional_coverage: ["Workers Compensation", "Commercial Auto", "Umbrella"],
    carrier_suggestions: [
      { name: "Hartford", appetite: "High", notes: "Strong professional services program" },
      { name: "Travelers", appetite: "High" },
      { name: "CNA", appetite: "High", notes: "Accountant specialty program" },
      { name: "Hiscox", appetite: "High", notes: "Good for small firms" },
    ],
  },
  restaurant: {
    naics_code: "722511",
    naics_description: "Full-Service Restaurants",
    risk_level: "High",
    key_exposures: ["Liquor liability (if applicable)", "Foodborne illness", "Slip and fall", "Kitchen fire", "Employee injuries"],
    required_coverage: ["General Liability", "Property", "Workers Compensation", "Liquor Liability (if serving alcohol)"],
    recommended_coverage: ["Business Interruption", "Equipment Breakdown", "Umbrella/Excess Liability", "Employment Practices Liability"],
    optional_coverage: ["Cyber Liability", "Spoilage Coverage"],
    carrier_suggestions: [
      { name: "Society Insurance", appetite: "High", notes: "Restaurant specialty" },
      { name: "Travelers", appetite: "Medium", notes: "Selective on class" },
      { name: "Hartford", appetite: "Medium" },
      { name: "Markel", appetite: "High", notes: "Good for difficult risks" },
    ],
  },
  tech: {
    naics_code: "541512",
    naics_description: "Computer Systems Design Services",
    risk_level: "Low-Medium",
    key_exposures: ["Technology E&O", "Cyber/data breach", "IP infringement", "Service outages"],
    required_coverage: ["Technology E&O", "Cyber Liability", "General Liability"],
    recommended_coverage: ["Business Property", "Employment Practices Liability", "Directors & Officers"],
    optional_coverage: ["Workers Compensation", "Commercial Auto", "Key Person Insurance"],
    carrier_suggestions: [
      { name: "Hartford", appetite: "High", notes: "Tech industry focus" },
      { name: "Hiscox", appetite: "High", notes: "Great for startups" },
      { name: "Travelers", appetite: "High" },
      { name: "Coalition", appetite: "High", notes: "Cyber-first approach" },
    ],
  },
};

// Determine business type from name
function classifyBusiness(companyName: string): string {
  const name = companyName.toLowerCase();
  if (name.includes("plumb") || name.includes("hvac") || name.includes("heating") || name.includes("electric")) {
    return "plumber";
  }
  if (name.includes("cpa") || name.includes("account") || name.includes("tax") || name.includes("bookkeep")) {
    return "accounting";
  }
  if (name.includes("restaurant") || name.includes("bistro") || name.includes("cafe") || name.includes("grill") || name.includes("kitchen")) {
    return "restaurant";
  }
  if (name.includes("tech") || name.includes("software") || name.includes("digital") || name.includes("solutions") || name.includes("systems")) {
    return "tech";
  }
  return "tech"; // Default
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { company_name, city_state } = body;

    if (!company_name || !city_state) {
      return NextResponse.json({ error: "Company name and city/state are required" }, { status: 400 });
    }

    // Classify the business type
    const businessType = classifyBusiness(company_name);
    const classification = BUSINESS_CLASSIFICATIONS[businessType];

    // Generate mock research data
    const yearsInBusiness = Math.floor(Math.random() * 20) + 1;
    const employeeCount = businessType === "accounting" ? `${Math.floor(Math.random() * 20) + 2}` :
                         businessType === "restaurant" ? `${Math.floor(Math.random() * 30) + 5}` :
                         businessType === "tech" ? `${Math.floor(Math.random() * 50) + 3}` :
                         `${Math.floor(Math.random() * 15) + 2}`;

    const revenueRanges: Record<string, string> = {
      plumber: "$500K - $2M",
      accounting: "$250K - $1.5M",
      restaurant: "$500K - $3M",
      tech: "$200K - $5M",
    };

    const operationsDescriptions: Record<string, string> = {
      plumber: "Provides residential and commercial plumbing services including installation, repair, and maintenance. Likely operates service vehicles and employs licensed plumbers.",
      accounting: "Provides accounting, tax preparation, and financial advisory services to individuals and small businesses. Office-based operations with client meetings.",
      restaurant: "Full-service dining establishment. Operations include food preparation, serving, and potentially alcohol service. High customer traffic and employee activity.",
      tech: "Technology services company providing software development, IT consulting, or digital solutions. Primarily office-based with potential remote work.",
    };

    const result = {
      company_profile: {
        name: company_name,
        legal_name: company_name.toUpperCase() + ", LLC",
        address: city_state,
        website: `www.${company_name.toLowerCase().replace(/[^a-z0-9]/g, "")}.com`,
        description: `${company_name} is a ${classification.naics_description.toLowerCase()} serving the ${city_state} area.`,
        industry: classification.naics_description,
        naics_code: classification.naics_code,
        naics_description: classification.naics_description,
        formation_date: `${2024 - yearsInBusiness}`,
        status: "Active",
      },
      business_details: {
        employee_count_estimate: employeeCount,
        revenue_estimate: revenueRanges[businessType],
        years_in_business: yearsInBusiness,
        business_type: businessType.charAt(0).toUpperCase() + businessType.slice(1),
        operations_description: operationsDescriptions[businessType],
      },
      risk_assessment: {
        risk_level: classification.risk_level,
        key_exposures: classification.key_exposures,
        risk_factors: [
          `${employeeCount} employees creates workers comp exposure`,
          `${yearsInBusiness} years in business indicates established operations`,
          `Located in ${city_state} - NC regulatory requirements apply`,
        ],
      },
      coverage_recommendations: {
        required: classification.required_coverage,
        recommended: classification.recommended_coverage,
        optional: classification.optional_coverage,
        notes: [
          "GL limits should be minimum $1M occurrence / $2M aggregate",
          "Workers Comp required in NC for 3+ employees",
          businessType === "restaurant" ? "Liquor liability required if serving alcohol" : "",
          businessType === "plumber" ? "Contractors license bond may be required" : "",
        ].filter(Boolean),
      },
      carrier_suggestions: classification.carrier_suggestions,
      sources: [
        { name: "NC Secretary of State", url: "https://www.sosnc.gov" },
        { name: "Company Website", url: `https://www.${company_name.toLowerCase().replace(/[^a-z0-9]/g, "")}.com` },
        { name: "Google Business Profile" },
        { name: "LinkedIn" },
      ],
    };

    return NextResponse.json(result);
  } catch (error) {
    console.error("Commercial research error:", error);
    return NextResponse.json({ error: "Research failed" }, { status: 500 });
  }
}
