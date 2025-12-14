"use client";

import { useState } from "react";

interface Source {
  name: string;
  url?: string;
  accessed?: string;
}

interface Gap {
  issue: string;
  severity?: string;
  current?: string;
  current_situation?: string;
  recommended?: string;
  recommended_solution?: string;
  financial_impact?: string;
  rationale: string;
  action?: string;
  action_steps?: string[];
  estimated_cost?: string;
}

interface Consideration {
  question: string;
  why_asking?: string;
  why_it_matters?: string;
  if_yes: string;
  if_no?: string;
}

interface Endorsement {
  name: string;
  limit?: string;
  estimated_cost?: string;
  priority?: string;
  rationale: string;
}

interface AnalysisResult {
  property_research?: {
    address?: string;
    address_normalized?: string;
    research_confidence?: string;
    value_estimates?: {
      zillow?: number;
      zillow_url?: string;
      redfin?: number;
      redfin_url?: string;
      tax_assessed?: number;
      estimated_market_value?: number;
      estimated_replacement_cost?: number;
      last_sale_date?: string;
      last_sale_price?: number;
    };
    property_details?: {
      year_built?: number;
      square_footage?: number;
      lot_size_acres?: number;
      bedrooms?: number;
      bathrooms?: number;
      stories?: number;
      construction_type?: string;
      roof_type?: string;
      roof_age_estimate?: string;
      foundation?: string;
      garage?: string;
      heating?: string;
      cooling?: string;
      recent_updates?: string[];
    };
    risk_factors?: {
      flood_zone?: string;
      flood_zone_description?: string;
      in_special_flood_hazard_area?: boolean;
      fire_protection_class?: number;
      distance_to_fire_station_miles?: number;
      coastal_zone?: boolean;
      distance_to_coast_miles?: number;
      wildfire_risk?: string;
      has_pool?: boolean;
      crime_risk?: string;
      other_risks?: string[];
      positive_factors?: string[];
    };
    insurance_considerations?: {
      nc_beach_plan_required?: boolean;
      flood_insurance_recommended?: boolean;
      flood_insurance_required?: boolean;
      wind_hail_concerns?: boolean;
      older_home_concerns?: boolean;
      replacement_cost_notes?: string;
    };
    sources?: Source[];
    agent_notes?: string;
  };
  gap_analysis?: {
    executive_summary?: string;
    risk_score?: string;
    risk_score_explanation?: string;
    high_priority_gaps: Gap[];
    medium_priority_gaps: Gap[];
    low_priority_gaps?: Gap[];
    positive_findings?: string[];
    considerations?: Consideration[];
    questions_for_client?: Consideration[];
    recommended_coverages?: {
      dwelling?: number;
      dwelling_rationale?: string;
      other_structures?: number;
      personal_property?: number;
      personal_property_valuation?: string;
      liability?: number;
      liability_rationale?: string;
      umbrella?: number;
      umbrella_rationale?: string;
      deductible_recommendation?: number;
      add_endorsements?: string[];
    };
    recommended_coverage_levels?: {
      dwelling?: number;
      dwelling_rationale?: string;
      liability?: number;
      liability_rationale?: string;
      umbrella?: number;
      umbrella_rationale?: string;
      add_endorsements?: string[];
    };
    endorsements_to_add?: Endorsement[];
    endorsements_to_consider?: Endorsement[];
    carrier_fit_assessment?: {
      current_carrier_suitable?: boolean;
      concerns?: string[];
      alternative_carriers?: { name: string; reason: string }[];
    };
    agent_talking_points?: string[];
    agent_summary?: string;
    compliance_notes?: string[];
  };
  policy?: {
    carrier?: string;
    dwelling_limit?: number;
    liability_limit?: number;
    valuation?: string;
    endorsements?: string[];
  };
  sources_used?: string[];
}

export default function PersonalLinesPage() {
  const [address, setAddress] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [activeTab, setActiveTab] = useState<"input" | "results" | "report">("input");
  const [mockScenario, setMockScenario] = useState("");
  const [report, setReport] = useState<string>("");
  const [reportLoading, setReportLoading] = useState(false);

  const mockScenarios = [
    { id: "low-liability", name: "Low Liability", desc: "$450K home with $100K liability" },
    { id: "acv-dwelling", name: "ACV Dwelling", desc: "Older home with ACV valuation" },
    { id: "no-water-backup", name: "No Water Backup", desc: "Missing water backup coverage" },
    { id: "flood-zone", name: "Flood Zone", desc: "Coastal property without flood" },
    { id: "no-umbrella", name: "No Umbrella", desc: "High-value home, no umbrella" },
    { id: "well-covered", name: "Well Covered", desc: "Example of proper coverage" },
  ];

  const runAnalysis = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          address: address || undefined,
          mock_scenario: mockScenario || undefined,
        }),
      });
      const data = await response.json();
      setResult(data);
      setActiveTab("results");
    } catch (error) {
      console.error("Analysis failed:", error);
    } finally {
      setLoading(false);
    }
  };

  const generateReport = async () => {
    if (!result) return;
    setReportLoading(true);
    try {
      const response = await fetch("/api/report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          analysis_data: result,
          report_type: "personal",
        }),
      });
      const data = await response.json();
      setReport(data.report || "Report generation failed");
      setActiveTab("report");
    } catch (error) {
      console.error("Report generation failed:", error);
      setReport("Error generating report. Please try again.");
    } finally {
      setReportLoading(false);
    }
  };

  const downloadReport = () => {
    const blob = new Blob([report], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `insurance-analysis-${new Date().toISOString().split("T")[0]}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const getRiskScoreColor = (score?: string) => {
    switch (score) {
      case "A": return "bg-green-100 text-green-800 border-green-300";
      case "B": return "bg-blue-100 text-blue-800 border-blue-300";
      case "C": return "bg-yellow-100 text-yellow-800 border-yellow-300";
      case "D": return "bg-orange-100 text-orange-800 border-orange-300";
      case "F": return "bg-red-100 text-red-800 border-red-300";
      default: return "bg-gray-100 text-gray-800 border-gray-300";
    }
  };

  const formatCurrency = (value?: number) => {
    if (!value) return "N/A";
    return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(value);
  };

  const recommendedCoverages = result?.gap_analysis?.recommended_coverages || result?.gap_analysis?.recommended_coverage_levels;
  const questions = result?.gap_analysis?.questions_for_client || result?.gap_analysis?.considerations || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Personal Lines Analysis</h1>
          <p className="text-gray-600 mt-1">AI-powered property research and coverage gap analysis</p>
        </div>
        {result && (
          <button
            onClick={generateReport}
            disabled={reportLoading}
            className="btn-primary flex items-center gap-2"
          >
            {reportLoading ? (
              <>
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Generating...
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Generate Report
              </>
            )}
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab("input")}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === "input"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            Input
          </button>
          <button
            onClick={() => setActiveTab("results")}
            disabled={!result}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === "results"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700 disabled:opacity-50"
            }`}
          >
            Analysis Results
          </button>
          <button
            onClick={() => setActiveTab("report")}
            disabled={!report}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === "report"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700 disabled:opacity-50"
            }`}
          >
            Report
          </button>
        </nav>
      </div>

      {activeTab === "input" && (
        <div className="grid md:grid-cols-2 gap-6">
          {/* Property Research */}
          <div className="card">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Property Research</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Property Address
                </label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="123 Main St, Winston-Salem, NC"
                  className="input-field"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Claude AI will search Zillow, FEMA flood maps, county records, and more
                </p>
              </div>
            </div>
          </div>

          {/* Mock Scenarios for Testing */}
          <div className="card">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Test Scenarios</h2>
            <p className="text-sm text-gray-600 mb-4">
              Use mock data to test the analysis without API calls
            </p>
            <div className="grid grid-cols-2 gap-2">
              {mockScenarios.map((scenario) => (
                <button
                  key={scenario.id}
                  onClick={() => setMockScenario(scenario.id)}
                  className={`p-3 text-left rounded-lg border transition-colors ${
                    mockScenario === scenario.id
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <div className="font-medium text-sm">{scenario.name}</div>
                  <div className="text-xs text-gray-500">{scenario.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Run Analysis */}
          <div className="md:col-span-2">
            <button
              onClick={runAnalysis}
              disabled={loading || (!address && !mockScenario)}
              className="btn-primary w-full py-3 text-lg"
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Analyzing with Claude AI...
                </span>
              ) : (
                "Run Analysis"
              )}
            </button>
          </div>
        </div>
      )}

      {activeTab === "results" && result && (
        <div className="space-y-6">
          {/* Executive Summary & Risk Score */}
          {result.gap_analysis?.executive_summary && (
            <div className="card bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h2 className="text-lg font-semibold text-gray-900 mb-2">Executive Summary</h2>
                  <p className="text-gray-700">{result.gap_analysis.executive_summary}</p>
                </div>
                {result.gap_analysis.risk_score && (
                  <div className={`ml-4 px-4 py-2 rounded-lg border-2 text-center ${getRiskScoreColor(result.gap_analysis.risk_score)}`}>
                    <div className="text-2xl font-bold">{result.gap_analysis.risk_score}</div>
                    <div className="text-xs font-medium">Risk Score</div>
                  </div>
                )}
              </div>
              {result.gap_analysis.risk_score_explanation && (
                <p className="mt-3 text-sm text-gray-600 italic">{result.gap_analysis.risk_score_explanation}</p>
              )}
            </div>
          )}

          {/* Property Research Results */}
          {result.property_research && (
            <div className="card">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">Property Research</h2>
                {result.property_research.research_confidence && (
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    result.property_research.research_confidence === "high" ? "bg-green-100 text-green-800" :
                    result.property_research.research_confidence === "medium" ? "bg-yellow-100 text-yellow-800" :
                    "bg-red-100 text-red-800"
                  }`}>
                    {result.property_research.research_confidence} confidence
                  </span>
                )}
              </div>

              <div className="grid md:grid-cols-3 gap-6">
                {/* Value Estimates */}
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-2">Estimated Values</h3>
                  <div className="space-y-2">
                    {result.property_research.value_estimates?.zillow && (
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Zillow:</span>
                        <span className="font-semibold">{formatCurrency(result.property_research.value_estimates.zillow)}</span>
                      </div>
                    )}
                    {result.property_research.value_estimates?.redfin && (
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Redfin:</span>
                        <span className="font-semibold">{formatCurrency(result.property_research.value_estimates.redfin)}</span>
                      </div>
                    )}
                    {result.property_research.value_estimates?.tax_assessed && (
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Tax Assessed:</span>
                        <span className="font-semibold">{formatCurrency(result.property_research.value_estimates.tax_assessed)}</span>
                      </div>
                    )}
                    {result.property_research.value_estimates?.estimated_replacement_cost && (
                      <div className="flex justify-between items-center pt-2 border-t">
                        <span className="text-sm font-medium text-blue-700">Est. Replacement:</span>
                        <span className="font-bold text-blue-700">{formatCurrency(result.property_research.value_estimates.estimated_replacement_cost)}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Property Details */}
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-2">Property Details</h3>
                  <div className="space-y-1 text-sm">
                    {result.property_research.property_details?.year_built && (
                      <p><span className="text-gray-500">Built:</span> {result.property_research.property_details.year_built}</p>
                    )}
                    {result.property_research.property_details?.square_footage && (
                      <p><span className="text-gray-500">Size:</span> {result.property_research.property_details.square_footage.toLocaleString()} sq ft</p>
                    )}
                    {result.property_research.property_details?.bedrooms && (
                      <p><span className="text-gray-500">Bed/Bath:</span> {result.property_research.property_details.bedrooms} / {result.property_research.property_details.bathrooms}</p>
                    )}
                    {result.property_research.property_details?.construction_type && (
                      <p><span className="text-gray-500">Construction:</span> {result.property_research.property_details.construction_type}</p>
                    )}
                    {result.property_research.property_details?.roof_type && (
                      <p><span className="text-gray-500">Roof:</span> {result.property_research.property_details.roof_type}</p>
                    )}
                  </div>
                </div>

                {/* Risk Factors */}
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-2">Risk Assessment</h3>
                  <div className="space-y-2">
                    {result.property_research.risk_factors?.flood_zone && (
                      <div>
                        <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${
                          ["A", "AE", "V", "VE", "AO"].includes(result.property_research.risk_factors.flood_zone)
                            ? "bg-red-100 text-red-800"
                            : "bg-green-100 text-green-800"
                        }`}>
                          Flood Zone: {result.property_research.risk_factors.flood_zone}
                        </span>
                        {result.property_research.risk_factors.flood_zone_description && (
                          <p className="text-xs text-gray-500 mt-1">{result.property_research.risk_factors.flood_zone_description}</p>
                        )}
                      </div>
                    )}
                    <div className="flex flex-wrap gap-1">
                      {result.property_research.risk_factors?.has_pool && <span className="badge-yellow">Pool</span>}
                      {result.property_research.risk_factors?.coastal_zone && <span className="badge-yellow">Coastal</span>}
                      {result.property_research.risk_factors?.fire_protection_class && (
                        <span className="badge-blue">FPC: {result.property_research.risk_factors.fire_protection_class}</span>
                      )}
                      {result.property_research.risk_factors?.wildfire_risk && result.property_research.risk_factors.wildfire_risk !== "Low" && (
                        <span className="badge-red">Wildfire: {result.property_research.risk_factors.wildfire_risk}</span>
                      )}
                    </div>
                    {result.property_research.risk_factors?.positive_factors && result.property_research.risk_factors.positive_factors.length > 0 && (
                      <div className="mt-2">
                        <span className="text-xs text-gray-500">Positive factors:</span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {result.property_research.risk_factors.positive_factors.map((factor, i) => (
                            <span key={i} className="badge-green text-xs">{factor}</span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Insurance Considerations */}
              {result.property_research.insurance_considerations && (
                <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                  <h3 className="text-sm font-semibold text-amber-800 mb-2">Insurance Considerations</h3>
                  <div className="text-sm text-amber-900 space-y-1">
                    {result.property_research.insurance_considerations.nc_beach_plan_required && (
                      <p>• NC Beach Plan may be required for wind coverage</p>
                    )}
                    {result.property_research.insurance_considerations.flood_insurance_required && (
                      <p>• Flood insurance REQUIRED (Special Flood Hazard Area)</p>
                    )}
                    {result.property_research.insurance_considerations.flood_insurance_recommended && !result.property_research.insurance_considerations.flood_insurance_required && (
                      <p>• Flood insurance recommended</p>
                    )}
                    {result.property_research.insurance_considerations.wind_hail_concerns && (
                      <p>• Wind/hail deductible may apply in this area</p>
                    )}
                    {result.property_research.insurance_considerations.older_home_concerns && (
                      <p>• Older home - verify plumbing, electrical, roof age</p>
                    )}
                    {result.property_research.insurance_considerations.replacement_cost_notes && (
                      <p>• {result.property_research.insurance_considerations.replacement_cost_notes}</p>
                    )}
                  </div>
                </div>
              )}

              {/* Agent Notes */}
              {result.property_research.agent_notes && (
                <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                  <h3 className="text-sm font-medium text-gray-700 mb-1">Agent Notes</h3>
                  <p className="text-sm text-gray-600">{result.property_research.agent_notes}</p>
                </div>
              )}

              {/* Sources */}
              {result.property_research.sources && result.property_research.sources.length > 0 && (
                <div className="mt-4 pt-3 border-t">
                  <h3 className="text-xs font-medium text-gray-500 mb-2">Research Sources</h3>
                  <div className="flex flex-wrap gap-2">
                    {result.property_research.sources.map((src, i) => (
                      src.url ? (
                        <a key={i} href={src.url} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:underline bg-blue-50 px-2 py-1 rounded">
                          {src.name}
                        </a>
                      ) : (
                        <span key={i} className="text-xs text-gray-600 bg-gray-100 px-2 py-1 rounded">
                          {src.name}
                        </span>
                      )
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Policy Summary */}
          {result.policy && (
            <div className="card">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Current Policy</h2>
              <div className="grid md:grid-cols-4 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Carrier</h3>
                  <p className="text-lg font-semibold">{result.policy.carrier}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Dwelling</h3>
                  <p className="text-lg font-semibold">{formatCurrency(result.policy.dwelling_limit)}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Liability</h3>
                  <p className="text-lg font-semibold">{formatCurrency(result.policy.liability_limit)}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Valuation</h3>
                  <p className="text-lg font-semibold capitalize">{result.policy.valuation?.replace("_", " ")}</p>
                </div>
              </div>
              {result.policy.endorsements && result.policy.endorsements.length > 0 && (
                <div className="mt-4">
                  <h3 className="text-sm font-medium text-gray-500 mb-2">Current Endorsements</h3>
                  <div className="flex flex-wrap gap-2">
                    {result.policy.endorsements.map((e, i) => (
                      <span key={i} className="badge-blue">{e}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Positive Findings */}
          {result.gap_analysis?.positive_findings && result.gap_analysis.positive_findings.length > 0 && (
            <div className="card bg-green-50 border-green-200">
              <h2 className="text-lg font-semibold text-green-800 mb-3 flex items-center">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                What&apos;s Working Well
              </h2>
              <ul className="space-y-2">
                {result.gap_analysis.positive_findings.map((finding, i) => (
                  <li key={i} className="flex items-start">
                    <span className="text-green-500 mr-2">✓</span>
                    <span className="text-green-900">{finding}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* High Priority Gaps */}
          {result.gap_analysis && result.gap_analysis.high_priority_gaps.length > 0 && (
            <div className="card border-red-200">
              <h2 className="text-lg font-semibold text-red-800 mb-4 flex items-center">
                <span className="w-3 h-3 bg-red-500 rounded-full mr-2"></span>
                High Priority Gaps
              </h2>
              <div className="space-y-4">
                {result.gap_analysis.high_priority_gaps.map((gap, i) => (
                  <div key={i} className="gap-card gap-card-high">
                    <div className="flex items-start justify-between">
                      <h3 className="font-semibold text-gray-900">{gap.issue}</h3>
                      {gap.severity && (
                        <span className="badge-red text-xs">{gap.severity}</span>
                      )}
                    </div>
                    <div className="mt-2 grid md:grid-cols-2 gap-2 text-sm">
                      <div>
                        <span className="text-gray-500">Current:</span> {gap.current_situation || gap.current}
                      </div>
                      <div>
                        <span className="text-gray-500">Recommended:</span>{" "}
                        <span className="text-green-700 font-medium">{gap.recommended_solution || gap.recommended}</span>
                      </div>
                    </div>
                    {gap.financial_impact && (
                      <p className="mt-2 text-sm text-red-700 bg-red-50 p-2 rounded">
                        <strong>Risk:</strong> {gap.financial_impact}
                      </p>
                    )}
                    <p className="mt-2 text-sm text-gray-600">{gap.rationale}</p>
                    {gap.action_steps && gap.action_steps.length > 0 && (
                      <div className="mt-2">
                        <span className="text-sm font-medium text-blue-700">Action Steps:</span>
                        <ul className="mt-1 list-disc list-inside text-sm text-blue-800">
                          {gap.action_steps.map((step, j) => (
                            <li key={j}>{step}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {gap.estimated_cost && (
                      <p className="mt-2 text-sm text-gray-500">Est. cost: {gap.estimated_cost}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Medium Priority Gaps */}
          {result.gap_analysis && result.gap_analysis.medium_priority_gaps.length > 0 && (
            <div className="card border-yellow-200">
              <h2 className="text-lg font-semibold text-yellow-800 mb-4 flex items-center">
                <span className="w-3 h-3 bg-yellow-500 rounded-full mr-2"></span>
                Recommendations
              </h2>
              <div className="space-y-4">
                {result.gap_analysis.medium_priority_gaps.map((gap, i) => (
                  <div key={i} className="gap-card gap-card-medium">
                    <h3 className="font-semibold text-gray-900">{gap.issue}</h3>
                    <div className="mt-2 grid md:grid-cols-2 gap-2 text-sm">
                      <div>
                        <span className="text-gray-500">Current:</span> {gap.current_situation || gap.current}
                      </div>
                      <div>
                        <span className="text-gray-500">Recommended:</span>{" "}
                        <span className="text-green-700 font-medium">{gap.recommended_solution || gap.recommended}</span>
                      </div>
                    </div>
                    <p className="mt-2 text-sm text-gray-600">{gap.rationale}</p>
                    {gap.estimated_cost && (
                      <p className="mt-2 text-sm text-gray-500">Est. cost: {gap.estimated_cost}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Endorsements to Add */}
          {result.gap_analysis?.endorsements_to_add && result.gap_analysis.endorsements_to_add.length > 0 && (
            <div className="card border-purple-200 bg-purple-50">
              <h2 className="text-lg font-semibold text-purple-900 mb-4">Endorsements to Add</h2>
              <div className="grid md:grid-cols-2 gap-4">
                {result.gap_analysis.endorsements_to_add.map((endorsement, i) => (
                  <div key={i} className="bg-white p-4 rounded-lg border border-purple-200">
                    <div className="flex justify-between items-start">
                      <h3 className="font-semibold text-gray-900">{endorsement.name}</h3>
                      {endorsement.priority && (
                        <span className={`text-xs px-2 py-1 rounded ${
                          endorsement.priority === "High" ? "bg-red-100 text-red-800" : "bg-yellow-100 text-yellow-800"
                        }`}>{endorsement.priority}</span>
                      )}
                    </div>
                    {endorsement.limit && <p className="text-sm text-gray-600 mt-1">Limit: {endorsement.limit}</p>}
                    {endorsement.estimated_cost && <p className="text-sm text-green-700 mt-1">Est. cost: {endorsement.estimated_cost}</p>}
                    <p className="text-sm text-gray-600 mt-2">{endorsement.rationale}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Questions for Client */}
          {questions.length > 0 && (
            <div className="card">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <span className="w-3 h-3 bg-blue-500 rounded-full mr-2"></span>
                Questions for Client
              </h2>
              <div className="space-y-4">
                {questions.map((c, i) => (
                  <div key={i} className="gap-card gap-card-low">
                    <h3 className="font-semibold text-gray-900">{c.question}</h3>
                    <p className="mt-1 text-sm text-gray-600">{c.why_asking || c.why_it_matters}</p>
                    <div className="mt-2 grid md:grid-cols-2 gap-2 text-sm">
                      <div className="bg-green-50 p-2 rounded">
                        <span className="font-medium text-green-700">If yes:</span> {c.if_yes}
                      </div>
                      {c.if_no && (
                        <div className="bg-gray-50 p-2 rounded">
                          <span className="font-medium text-gray-700">If no:</span> {c.if_no}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Recommended Coverage Levels */}
          {recommendedCoverages && (
            <div className="card bg-green-50 border-green-200">
              <h2 className="text-lg font-semibold text-green-900 mb-4">Recommended Coverage Levels</h2>
              <div className="grid md:grid-cols-4 gap-4">
                {recommendedCoverages.dwelling && (
                  <div>
                    <h3 className="text-sm font-medium text-green-700">Dwelling</h3>
                    <p className="text-xl font-bold text-green-900">{formatCurrency(recommendedCoverages.dwelling)}</p>
                    {recommendedCoverages.dwelling_rationale && (
                      <p className="text-xs text-green-700 mt-1">{recommendedCoverages.dwelling_rationale}</p>
                    )}
                  </div>
                )}
                {recommendedCoverages.liability && (
                  <div>
                    <h3 className="text-sm font-medium text-green-700">Liability</h3>
                    <p className="text-xl font-bold text-green-900">{formatCurrency(recommendedCoverages.liability)}</p>
                    {recommendedCoverages.liability_rationale && (
                      <p className="text-xs text-green-700 mt-1">{recommendedCoverages.liability_rationale}</p>
                    )}
                  </div>
                )}
                {recommendedCoverages.umbrella && (
                  <div>
                    <h3 className="text-sm font-medium text-green-700">Umbrella</h3>
                    <p className="text-xl font-bold text-green-900">{formatCurrency(recommendedCoverages.umbrella)}</p>
                    {recommendedCoverages.umbrella_rationale && (
                      <p className="text-xs text-green-700 mt-1">{recommendedCoverages.umbrella_rationale}</p>
                    )}
                  </div>
                )}
                {recommendedCoverages.add_endorsements && (
                  <div className="md:col-span-4">
                    <h3 className="text-sm font-medium text-green-700">Add Endorsements</h3>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {recommendedCoverages.add_endorsements.map((e, i) => (
                        <span key={i} className="badge-green">{e}</span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Agent Talking Points */}
          {result.gap_analysis?.agent_talking_points && result.gap_analysis.agent_talking_points.length > 0 && (
            <div className="card bg-indigo-50 border-indigo-200">
              <h2 className="text-lg font-semibold text-indigo-900 mb-4 flex items-center">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                Agent Talking Points
              </h2>
              <ul className="space-y-3">
                {result.gap_analysis.agent_talking_points.map((point, i) => (
                  <li key={i} className="flex items-start bg-white p-3 rounded-lg">
                    <span className="flex-shrink-0 w-6 h-6 flex items-center justify-center bg-indigo-600 text-white rounded-full text-sm font-medium mr-3">
                      {i + 1}
                    </span>
                    <span className="text-gray-800">{point}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Sources Used */}
          {result.sources_used && result.sources_used.length > 0 && (
            <div className="text-sm text-gray-500 flex items-center gap-2">
              <span>Sources:</span>
              {result.sources_used.map((src, i) => (
                <span key={i} className="bg-gray-100 px-2 py-1 rounded">{src}</span>
              ))}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-4">
            <button
              onClick={generateReport}
              disabled={reportLoading}
              className="btn-primary flex items-center gap-2"
            >
              {reportLoading ? "Generating..." : "Generate Professional Report"}
            </button>
            <button
              onClick={() => {
                setResult(null);
                setReport("");
                setActiveTab("input");
                setAddress("");
                setMockScenario("");
              }}
              className="btn-secondary"
            >
              New Analysis
            </button>
          </div>
        </div>
      )}

      {activeTab === "report" && report && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Professional Report</h2>
            <button
              onClick={downloadReport}
              className="btn-primary flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Download Markdown
            </button>
          </div>
          <div className="card">
            <div className="prose prose-sm max-w-none">
              <pre className="whitespace-pre-wrap text-sm text-gray-700 bg-gray-50 p-4 rounded-lg overflow-x-auto">
                {report}
              </pre>
            </div>
          </div>
          <button
            onClick={() => setActiveTab("results")}
            className="btn-secondary"
          >
            Back to Results
          </button>
        </div>
      )}
    </div>
  );
}
