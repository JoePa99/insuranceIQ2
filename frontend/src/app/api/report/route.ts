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

  try {
    if (reportType === "personal") {
      const policy = (data.policy || {}) as Record<string, unknown>;
      const gapAnalysis = (data.gap_analysis || {}) as Record<string, unknown>;
      const propertyResearch = (data.property_research || {}) as Record<string, unknown>;
      const valueEstimates = (propertyResearch.value_estimates || {}) as Record<string, number>;
      const highPriorityGaps = (gapAnalysis.high_priority_gaps || []) as Array<Record<string, unknown>>;
      const mediumPriorityGaps = (gapAnalysis.medium_priority_gaps || []) as Array<Record<string, unknown>>;
      const talkingPoints = (gapAnalysis.agent_talking_points || []) as string[];
      const recommendedCoverages = (gapAnalysis.recommended_coverages || gapAnalysis.recommended_coverage_levels || {}) as Record<string, unknown>;

      let report = `# Insurance Coverage Analysis Report

**Date:** ${now}
**Report Type:** Personal Lines Analysis

---

## Executive Summary

${gapAnalysis.executive_summary || 'This report analyzes the current insurance coverage and identifies potential gaps that should be addressed to ensure adequate protection.'}

${gapAnalysis.risk_score ? `**Risk Score: ${gapAnalysis.risk_score}** - ${gapAnalysis.risk_score_explanation || ''}` : ''}

## Property Information

- **Address:** ${propertyResearch.address || propertyResearch.address_normalized || 'Not provided'}
- **Estimated Value (Zillow):** ${formatCurrency(valueEstimates.zillow)}
- **Tax Assessed Value:** ${formatCurrency(valueEstimates.tax_assessed)}
- **Estimated Replacement Cost:** ${formatCurrency(valueEstimates.estimated_replacement_cost)}

## Current Coverage

- **Carrier:** ${policy.carrier || 'Not provided'}
- **Dwelling Coverage:** ${formatCurrency(policy.dwelling_limit as number)}
- **Liability:** ${formatCurrency(policy.liability_limit as number)}
- **Valuation:** ${policy.valuation || 'Not specified'}
`;

      if (highPriorityGaps.length > 0) {
        report += `\n## High Priority Issues\n\n`;
        highPriorityGaps.forEach((gap) => {
          report += `### ${gap.issue}\n`;
          report += `- **Current:** ${gap.current_situation || gap.current || 'N/A'}\n`;
          report += `- **Recommended:** ${gap.recommended_solution || gap.recommended || 'N/A'}\n`;
          if (gap.financial_impact) report += `- **Risk:** ${gap.financial_impact}\n`;
          report += `- **Rationale:** ${gap.rationale || 'N/A'}\n\n`;
        });
      }

      if (mediumPriorityGaps.length > 0) {
        report += `\n## Recommendations\n\n`;
        mediumPriorityGaps.forEach((gap) => {
          report += `### ${gap.issue}\n`;
          report += `- **Current:** ${gap.current_situation || gap.current || 'N/A'}\n`;
          report += `- **Recommended:** ${gap.recommended_solution || gap.recommended || 'N/A'}\n\n`;
        });
      }

      report += `\n## Recommended Coverage Levels\n\n`;
      report += `| Coverage | Recommended |\n|----------|-------------|\n`;
      if (recommendedCoverages.dwelling) report += `| Dwelling | ${formatCurrency(recommendedCoverages.dwelling as number)} |\n`;
      if (recommendedCoverages.liability) report += `| Liability | ${formatCurrency(recommendedCoverages.liability as number)} |\n`;
      if (recommendedCoverages.umbrella) report += `| Umbrella | ${formatCurrency(recommendedCoverages.umbrella as number)} |\n`;

      if (talkingPoints.length > 0) {
        report += `\n## Agent Talking Points\n\n`;
        talkingPoints.forEach((point, i) => {
          report += `${i + 1}. ${point}\n`;
        });
      }

      report += `\n---\n\n*This analysis is provided as a professional recommendation. Final coverage and rates are subject to carrier underwriting.*\n`;

      return report;
    }

    // Commercial report
    const companyProfile = (data.company_profile || {}) as Record<string, unknown>;
    const coverageRecs = (data.coverage_recommendations || {}) as Record<string, unknown>;
    const carriers = (data.carrier_suggestions || data.carrier_recommendations || []) as Array<Record<string, unknown>>;
    const riskAssessment = (data.risk_assessment || {}) as Record<string, unknown>;

    let report = `# Commercial Insurance Analysis Report

**Date:** ${now}
**Business:** ${companyProfile.name || 'Unknown'}

---

## Business Profile

- **Legal Name:** ${companyProfile.legal_name || companyProfile.name || 'N/A'}
- **NAICS Code:** ${companyProfile.naics_code || 'N/A'} - ${companyProfile.naics_description || ''}
- **Status:** ${companyProfile.status || 'N/A'}

## Risk Assessment

**Risk Level:** ${riskAssessment.risk_level || 'Not assessed'}

### Key Exposures
${((riskAssessment.key_exposures || []) as string[]).map(e => `- ${e}`).join('\n') || '- None identified'}

### Risk Factors
${((riskAssessment.risk_factors || []) as string[]).map(r => `- ${r}`).join('\n') || '- None identified'}

## Coverage Recommendations

### Required
${((coverageRecs.required || []) as string[]).map(c => `- ${c}`).join('\n') || '- General Liability\n- Workers Compensation'}

### Recommended
${((coverageRecs.recommended || []) as string[]).map(c => `- ${c}`).join('\n') || '- None specified'}

### Consider
${((coverageRecs.optional || []) as string[]).map(c => `- ${c}`).join('\n') || '- None specified'}

## Carrier Recommendations

`;
    carriers.forEach((carrier) => {
      report += `- **${carrier.name}** - ${carrier.appetite} appetite${carrier.notes ? ` (${carrier.notes})` : ''}\n`;
    });

    report += `\n---\n\n*Set ANTHROPIC_API_KEY in Vercel for AI-enhanced reports.*\n`;

    return report;

  } catch (err) {
    console.error("Error generating basic report:", err);
    return `# Insurance Analysis Report

**Date:** ${now}

---

## Report Generation

Unable to generate detailed report. Please ensure ANTHROPIC_API_KEY is configured in your Vercel environment variables for full AI-powered report generation.

## Raw Data

\`\`\`json
${JSON.stringify(data, null, 2)}
\`\`\`

---

*Add ANTHROPIC_API_KEY to Vercel → Settings → Environment Variables*
`;
  }
}

function formatCurrency(value: number | undefined): string {
  if (!value) return 'N/A';
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(value);
}
