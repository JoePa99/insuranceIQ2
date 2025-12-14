import { NextRequest, NextResponse } from "next/server";

// Mock data for scenarios - matches Python backend
const MOCK_SCENARIOS: Record<string, {
  policy: {
    carrier: string;
    dwelling_limit: number;
    liability_limit: number;
    valuation: string;
    endorsements: string[];
  };
  gap_analysis: {
    high_priority_gaps: Array<{
      issue: string;
      current: string;
      recommended: string;
      rationale: string;
      action: string;
    }>;
    medium_priority_gaps: Array<{
      issue: string;
      current: string;
      recommended: string;
      rationale: string;
      action: string;
    }>;
    considerations: Array<{
      question: string;
      why_it_matters: string;
      if_yes: string;
    }>;
    recommended_coverages: {
      dwelling?: number;
      liability?: number;
      umbrella?: number;
      add_endorsements?: string[];
    };
    agent_summary: string;
  };
}> = {
  "low-liability": {
    policy: {
      carrier: "NC Farm Bureau",
      dwelling_limit: 425000,
      liability_limit: 100000,
      valuation: "replacement_cost",
      endorsements: [],
    },
    gap_analysis: {
      high_priority_gaps: [
        {
          issue: "Liability limit inadequate for asset level",
          current: "$100,000",
          recommended: "$300,000+",
          rationale: "With property valued at $425,000+, current $100,000 liability leaves significant exposure. A serious injury claim could exceed your limits.",
          action: "Increase liability to $300,000. Consider umbrella policy for additional protection.",
        },
        {
          issue: "No water backup/sewer coverage",
          current: "Not covered",
          recommended: "$10,000-$25,000 water backup coverage",
          rationale: "Water backup from sewers/drains is one of the most common claims and is NOT covered by standard homeowners policies. Average claim is $5,000-$10,000.",
          action: "Add water backup endorsement. Typically $50-100/year for $10K-$25K coverage.",
        },
      ],
      medium_priority_gaps: [
        {
          issue: "No service line coverage",
          current: "Not covered",
          recommended: "$10,000+ service line coverage",
          rationale: "Homeowner is responsible for water/sewer lines from street to house. Replacement can cost $5,000-$15,000.",
          action: "Add service line endorsement. Usually $25-50/year.",
        },
      ],
      considerations: [
        {
          question: "Does the client have a swimming pool, trampoline, or aggressive dog breed?",
          why_it_matters: "These 'attractive nuisances' significantly increase liability exposure and may require additional coverage or carrier restrictions.",
          if_yes: "Increase liability to $500K+, strongly recommend umbrella. Verify disclosure to carrier.",
        },
        {
          question: "Does the client operate any business from home?",
          why_it_matters: "Home-based businesses are generally excluded from homeowners policies. Business equipment, inventory, and liability need separate coverage.",
          if_yes: "Need in-home business endorsement or separate BOP policy.",
        },
      ],
      recommended_coverages: {
        liability: 300000,
        add_endorsements: ["Water backup/sewer endorsement", "Service line coverage"],
      },
      agent_summary: "Client has adequate dwelling coverage but critically low liability for their asset level.",
    },
  },
  "acv-dwelling": {
    policy: {
      carrier: "State Farm",
      dwelling_limit: 275000,
      liability_limit: 100000,
      valuation: "actual_cash_value",
      endorsements: [],
    },
    gap_analysis: {
      high_priority_gaps: [
        {
          issue: "Dwelling valued at Actual Cash Value instead of Replacement Cost",
          current: "Actual Cash Value (ACV)",
          recommended: "Replacement Cost",
          rationale: "ACV deducts depreciation from claims, leaving you significantly undercompensated for losses. On an older home, ACV could pay 50% or less of repair costs.",
          action: "Switch to Replacement Cost valuation immediately. This is critical.",
        },
        {
          issue: "Liability limit inadequate for asset level",
          current: "$100,000",
          recommended: "$300,000+",
          rationale: "Current liability leaves significant exposure for a homeowner.",
          action: "Increase liability to minimum $300,000.",
        },
        {
          issue: "No water backup/sewer coverage",
          current: "Not covered",
          recommended: "$10,000-$25,000 water backup coverage",
          rationale: "Water backup is one of the most common claims and is NOT covered by standard policies.",
          action: "Add water backup endorsement.",
        },
      ],
      medium_priority_gaps: [
        {
          issue: "Personal property at Actual Cash Value",
          current: "ACV on contents",
          recommended: "Replacement Cost on contents",
          rationale: "ACV on personal property means you get depreciated value. A 5-year old TV might only pay $100 on an ACV policy vs $500 replacement.",
          action: "Upgrade to replacement cost on personal property.",
        },
      ],
      considerations: [
        {
          question: "Does the client have jewelry, art, collections, or other high-value items?",
          why_it_matters: "Standard policies have sublimits ($1,500-$2,500 typical for jewelry). Items over sublimits need scheduling.",
          if_yes: "Schedule valuable items individually for full coverage.",
        },
      ],
      recommended_coverages: {
        liability: 300000,
        add_endorsements: ["Water backup/sewer endorsement", "Service line coverage"],
      },
      agent_summary: "CRITICAL: Client has ACV valuation on dwelling - must switch to replacement cost immediately.",
    },
  },
  "no-water-backup": {
    policy: {
      carrier: "Travelers",
      dwelling_limit: 385000,
      liability_limit: 300000,
      valuation: "replacement_cost",
      endorsements: ["Scheduled Personal Property - Jewelry $15,000", "Identity Theft Protection"],
    },
    gap_analysis: {
      high_priority_gaps: [
        {
          issue: "No water backup/sewer coverage",
          current: "Not covered",
          recommended: "$10,000-$25,000 water backup coverage",
          rationale: "Water backup from sewers/drains is one of the most common claims and is NOT covered by standard homeowners policies.",
          action: "Add water backup endorsement. Typically $50-100/year for $10K-$25K coverage.",
        },
      ],
      medium_priority_gaps: [
        {
          issue: "No umbrella policy for additional liability protection",
          current: "No umbrella",
          recommended: "$1,000,000 umbrella",
          rationale: "An umbrella policy provides additional liability coverage above your home and auto limits. It's inexpensive ($200-400/year for $1M) relative to the protection provided.",
          action: "Quote umbrella policy. Most carriers require $300K underlying liability.",
        },
        {
          issue: "No service line coverage",
          current: "Not covered",
          recommended: "$10,000+ service line coverage",
          rationale: "Homeowner is responsible for water/sewer lines from street to house.",
          action: "Add service line endorsement. Usually $25-50/year.",
        },
      ],
      considerations: [
        {
          question: "Does the client rent out any portion of the home (including Airbnb)?",
          why_it_matters: "Standard homeowners excludes rental activities. Short-term rentals (Airbnb) have specific exclusions and liability exposure.",
          if_yes: "Need landlord policy or short-term rental endorsement.",
        },
      ],
      recommended_coverages: {
        umbrella: 1000000,
        add_endorsements: ["Water backup/sewer endorsement", "Service line coverage"],
      },
      agent_summary: "Well-structured policy overall but missing common water backup coverage.",
    },
  },
  "flood-zone": {
    policy: {
      carrier: "NC Beach Plan + Citizens",
      dwelling_limit: 525000,
      liability_limit: 300000,
      valuation: "replacement_cost",
      endorsements: ["Water Backup - $10,000"],
    },
    gap_analysis: {
      high_priority_gaps: [
        {
          issue: "Property in flood zone without flood insurance",
          current: "No flood coverage",
          recommended: "NFIP or private flood policy",
          rationale: "Property is in a coastal flood zone. Standard homeowners does NOT cover flood damage. This is a critical gap.",
          action: "Obtain flood insurance immediately. NFIP or private flood options available. If mortgaged, lender will likely require this.",
        },
      ],
      medium_priority_gaps: [
        {
          issue: "No umbrella policy for additional liability protection",
          current: "No umbrella",
          recommended: "$1,000,000 umbrella",
          rationale: "High-value coastal property suggests significant assets that need protection.",
          action: "Quote umbrella policy.",
        },
        {
          issue: "High wind/hail deductible",
          current: "2% of dwelling ($10,500)",
          recommended: "Awareness - this is common in coastal NC",
          rationale: "Percentage-based wind deductibles are standard in coastal areas. Ensure client has emergency fund.",
          action: "Ensure client understands this. Consider emergency fund for deductible.",
        },
      ],
      considerations: [
        {
          question: "Is this a primary residence or vacation home?",
          why_it_matters: "Vacation homes have different coverage needs and carrier restrictions.",
          if_yes: "May need secondary/seasonal dwelling form.",
        },
      ],
      recommended_coverages: {
        umbrella: 1000000,
        add_endorsements: ["Flood insurance (separate policy)", "Service line coverage"],
      },
      agent_summary: "CRITICAL: Coastal property needs flood insurance immediately. Beach Plan covers wind only.",
    },
  },
  "no-umbrella": {
    policy: {
      carrier: "Erie Insurance",
      dwelling_limit: 625000,
      liability_limit: 300000,
      valuation: "replacement_cost",
      endorsements: ["Water Backup - $25,000", "Service Line Coverage - $10,000", "Scheduled Personal Property - Art $50,000", "Extended Replacement Cost 125%"],
    },
    gap_analysis: {
      high_priority_gaps: [],
      medium_priority_gaps: [
        {
          issue: "No umbrella policy for additional liability protection",
          current: "No umbrella",
          recommended: "$1,000,000+ umbrella",
          rationale: "With a $625K home and scheduled art/jewelry totaling $85K+, an umbrella policy is strongly recommended. It's inexpensive ($200-400/year for $1M) relative to the protection.",
          action: "Quote umbrella policy. Client already has $300K underlying liability which meets most carrier requirements.",
        },
      ],
      considerations: [
        {
          question: "What is the client's approximate net worth?",
          why_it_matters: "Umbrella coverage should generally match or exceed net worth.",
          if_yes: "If net worth exceeds $1M, consider $2M umbrella.",
        },
        {
          question: "Does the client have teenage drivers?",
          why_it_matters: "Young drivers significantly increase auto liability exposure, making umbrella even more important.",
          if_yes: "Umbrella is essential. Consider $2M minimum.",
        },
      ],
      recommended_coverages: {
        umbrella: 1000000,
        add_endorsements: [],
      },
      agent_summary: "Excellent coverage overall - HO-5 form, extended replacement cost, good endorsements. Only gap is lack of umbrella for this high-value client.",
    },
  },
  "well-covered": {
    policy: {
      carrier: "Nationwide",
      dwelling_limit: 475000,
      liability_limit: 500000,
      valuation: "replacement_cost",
      endorsements: ["Water Backup - $25,000", "Service Line Coverage - $10,000", "Identity Theft - $25,000", "Extended Replacement Cost 125%", "Scheduled Personal Property - Jewelry $20,000", "Equipment Breakdown"],
    },
    gap_analysis: {
      high_priority_gaps: [],
      medium_priority_gaps: [
        {
          issue: "Consider umbrella policy",
          current: "No umbrella (but $500K liability is good)",
          recommended: "$1,000,000 umbrella for complete protection",
          rationale: "While $500K liability is above average, an umbrella adds another layer of protection at minimal cost.",
          action: "Quote umbrella policy - likely $200-300/year for $1M.",
        },
      ],
      considerations: [
        {
          question: "Has the client recently renovated the home?",
          why_it_matters: "Major renovations may increase replacement cost beyond current coverage.",
          if_yes: "Request updated replacement cost estimate.",
        },
      ],
      recommended_coverages: {
        umbrella: 1000000,
        add_endorsements: [],
      },
      agent_summary: "This is an example of a well-structured policy. HO-5 form, high liability, comprehensive endorsements. Only suggestion is adding umbrella.",
    },
  },
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { address, mock_scenario } = body;

    // If mock scenario is provided, return mock data
    if (mock_scenario && MOCK_SCENARIOS[mock_scenario]) {
      const scenario = MOCK_SCENARIOS[mock_scenario];
      return NextResponse.json({
        policy: scenario.policy,
        gap_analysis: scenario.gap_analysis,
      });
    }

    // If address is provided, we would call the Python backend
    // For now, return a message that API key is needed
    if (address) {
      // In production, this would call the Python backend API
      // For demo, we'll return a sample response
      return NextResponse.json({
        message: "Property research requires ANTHROPIC_API_KEY. Use mock scenarios for testing.",
        property_research: {
          address: address,
          value_estimates: {
            zillow: 350000,
            redfin: 345000,
            tax_assessed: 285000,
          },
          details: {
            year_built: 1995,
            square_footage: 2200,
            bedrooms: 4,
            bathrooms: 2.5,
          },
          risk_factors: {
            flood_zone: "X",
            flood_zone_description: "Minimal flood hazard",
            has_pool: false,
            coastal_zone: false,
          },
        },
      });
    }

    return NextResponse.json({ error: "Please provide an address or mock scenario" }, { status: 400 });
  } catch (error) {
    console.error("Analysis error:", error);
    return NextResponse.json({ error: "Analysis failed" }, { status: 500 });
  }
}
