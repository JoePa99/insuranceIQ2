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

// Report generation prompt
const REPORT_GENERATION_PROMPT = `You are an expert insurance advisor creating a professional report for an independent insurance agent. Generate a comprehensive, client-ready insurance analysis report.

## Analysis Data
{analysis_data}

## Report Type
{report_type}

## Instructions

Create a professional, detailed report that the agent can:
1. Use internally for their records
2. Share with the client (client-facing sections)
3. Use for carrier submissions

The report should be formatted in clean Markdown with clear sections.

## Required Sections for Personal Lines Report:

# Insurance Coverage Analysis Report

**Prepared for:** [Client Name]
**Property Address:** [Address]
**Prepared by:** [Agent can fill in]
**Date:** [Current Date]

---

## Executive Summary
[2-3 paragraph overview of findings, key concerns, and recommendations]

## Property Profile
[Detailed property information from research]
- Estimated Value
- Property Details (year built, sqft, etc.)
- Risk Factors Identified
- Sources Consulted

## Current Coverage Analysis
[Analysis of existing coverage if provided]
- Coverage A (Dwelling): [Amount] - [Assessment]
- Coverage B (Other Structures): [Amount]
- Coverage C (Personal Property): [Amount] - [Valuation method]
- Coverage D (Loss of Use): [Amount]
- Coverage E (Liability): [Amount] - [Assessment]
- Coverage F (Medical Payments): [Amount]
- Deductibles: [Details]
- Current Endorsements: [List]

## Coverage Gap Analysis

### Critical Issues Requiring Immediate Attention
[Red flags that need to be addressed ASAP]

### Recommended Improvements
[Medium priority items]

### Considerations for Discussion
[Questions and optional enhancements]

## Recommendations Summary

### Recommended Coverage Levels
| Coverage | Current | Recommended | Rationale |
|----------|---------|-------------|-----------|
| Dwelling | $X | $Y | [Reason] |
| Liability | $X | $Y | [Reason] |
| ... | ... | ... | ... |

### Endorsements to Add
- [ ] Water Backup Coverage ($XX/year) - [Why needed]
- [ ] Service Line Coverage ($XX/year) - [Why needed]
- [ ] [Other recommendations]

### Estimated Premium Impact
[Rough estimate of premium changes]

## Agent Notes
[Internal notes for the agent - not for client distribution]
- Follow-up items
- Underwriting concerns
- Carrier considerations

## Next Steps
1. [First action item]
2. [Second action item]
3. [Third action item]

---

## Appendix: Research Sources
[List all sources used with URLs where applicable]

---

*This analysis is provided as a professional recommendation and does not constitute a guarantee of coverage. Final coverage and rates are subject to carrier underwriting.*

---

For Commercial Lines, adjust sections to include:
- Business Profile (instead of Property Profile)
- Operations Summary
- NAICS Classification
- Employee/Payroll Information
- Coverage by Line (GL, WC, Auto, Property, etc.)
- Carrier Recommendations with Appetite
- ACORD Form Requirements
- Submission Checklist

Generate the complete report now based on the analysis data provided.`;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { analysis_data, report_type = "personal" } = body;

    if (!analysis_data) {
      return NextResponse.json({
        error: "Analysis data is required to generate a report"
      }, { status: 400 });
    }

    const client = getClient();

    if (client) {
      // Use Claude to generate professional report
      const prompt = REPORT_GENERATION_PROMPT
        .replace("{analysis_data}", JSON.stringify(analysis_data, null, 2))
        .replace("{report_type}", report_type);

      const response = await client.messages.create({
        model: "claude-sonnet-4-20250514",
        max_tokens: 8192,
        messages: [{ role: "user", content: prompt }],
      });

      let reportContent = "";
      for (const block of response.content) {
        if (block.type === "text") {
          reportContent = block.text;
          break;
        }
      }

      return NextResponse.json({
        report: reportContent,
        format: "markdown",
        generated_at: new Date().toISOString(),
        report_type,
      });
    }

    // Generate a basic report without AI
    const basicReport = generateBasicReport(analysis_data, report_type);
    return NextResponse.json({
      report: basicReport,
      format: "markdown",
      generated_at: new Date().toISOString(),
      report_type,
      ai_powered: false,
      message: "Set ANTHROPIC_API_KEY for AI-enhanced report generation",
    });

  } catch (error) {
    console.error("Report generation error:", error);
    return NextResponse.json({
      error: "Report generation failed",
      details: error instanceof Error ? error.message : "Unknown error",
    }, { status: 500 });
  }
}

function generateBasicReport(data: Record<string, unknown>, reportType: string): string {
  const now = new Date().toLocaleDateString();

  if (reportType === "personal") {
    const policy = data.policy as Record<string, unknown> || {};
    const gapAnalysis = data.gap_analysis as Record<string, unknown> || {};
    const propertyResearch = data.property_research as Record<string, unknown> || {};

    return `# Insurance Coverage Analysis Report

**Date:** ${now}
**Report Type:** Personal Lines Analysis

---

## Executive Summary

This report analyzes the current insurance coverage and identifies potential gaps that should be addressed to ensure adequate protection.

## Property Information

${propertyResearch ? `
- **Address:** ${(propertyResearch.address as string) || 'Not provided'}
- **Estimated Value:** ${formatCurrency((propertyResearch.value_estimates as Record<string, number>)?.zillow) || 'Research required'}
` : 'Property research data not available'}

## Current Coverage

${policy ? `
- **Carrier:** ${policy.carrier || 'Not provided'}
- **Dwelling Coverage:** ${formatCurrency(policy.dwelling_limit as number)}
- **Liability:** ${formatCurrency(policy.liability_limit as number)}
- **Valuation:** ${policy.valuation || 'Not specified'}
` : 'Policy information not provided'}

## Coverage Gap Analysis

${gapAnalysis.high_priority_gaps ? `
### High Priority Issues

${((gapAnalysis.high_priority_gaps as Array<Record<string, string>>)).map((gap: Record<string, string>) => `
#### ${gap.issue}
- **Current:** ${gap.current_situation || gap.current}
- **Recommended:** ${gap.recommended_solution || gap.recommended}
- **Action:** ${gap.action_steps ? (gap.action_steps as unknown as string[]).join(', ') : gap.action}
`).join('\n')}
` : ''}

${gapAnalysis.medium_priority_gaps ? `
### Recommendations

${((gapAnalysis.medium_priority_gaps as Array<Record<string, string>>)).map((gap: Record<string, string>) => `
#### ${gap.issue}
- **Current:** ${gap.current_situation || gap.current}
- **Recommended:** ${gap.recommended_solution || gap.recommended}
`).join('\n')}
` : ''}

## Recommended Actions

${gapAnalysis.agent_talking_points ? `
${((gapAnalysis.agent_talking_points as string[])).map((point: string, i: number) => `${i + 1}. ${point}`).join('\n')}
` : '1. Review coverage gaps with client\n2. Obtain updated quotes\n3. Implement recommended changes'}

---

*This analysis is provided as a professional recommendation. Final coverage and rates are subject to carrier underwriting.*
`;
  }

  // Commercial report
  return `# Commercial Insurance Analysis Report

**Date:** ${now}
**Report Type:** Commercial Lines Analysis

---

## Business Profile

${JSON.stringify(data.company_profile || {}, null, 2)}

## Coverage Recommendations

${JSON.stringify(data.coverage_recommendations || {}, null, 2)}

## Carrier Recommendations

${JSON.stringify(data.carrier_recommendations || data.carrier_suggestions || [], null, 2)}

---

*Set ANTHROPIC_API_KEY for comprehensive AI-generated reports.*
`;
}

function formatCurrency(value: number | undefined): string {
  if (!value) return 'N/A';
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(value);
}
