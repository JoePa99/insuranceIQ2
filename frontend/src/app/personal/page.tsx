"use client";

import { useState } from "react";

interface Gap {
  issue: string;
  current: string;
  recommended: string;
  rationale: string;
  action: string;
}

interface Consideration {
  question: string;
  why_it_matters: string;
  if_yes: string;
}

interface AnalysisResult {
  property_research?: {
    address: string;
    value_estimates: {
      zillow?: number;
      redfin?: number;
      tax_assessed?: number;
    };
    details: {
      year_built?: number;
      square_footage?: number;
      bedrooms?: number;
      bathrooms?: number;
    };
    risk_factors: {
      flood_zone?: string;
      flood_zone_description?: string;
      has_pool?: boolean;
      coastal_zone?: boolean;
    };
  };
  gap_analysis?: {
    high_priority_gaps: Gap[];
    medium_priority_gaps: Gap[];
    considerations: Consideration[];
    recommended_coverages: {
      dwelling?: number;
      liability?: number;
      umbrella?: number;
      add_endorsements?: string[];
    };
    agent_summary: string;
  };
  policy?: {
    carrier?: string;
    dwelling_limit?: number;
    liability_limit?: number;
    valuation?: string;
  };
}

export default function PersonalLinesPage() {
  const [address, setAddress] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [activeTab, setActiveTab] = useState<"input" | "results">("input");
  const [mockScenario, setMockScenario] = useState("");

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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Personal Lines Analysis</h1>
          <p className="text-gray-600 mt-1">Research properties and analyze coverage gaps</p>
        </div>
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
            Results
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
                  AI will research Zillow, FEMA flood maps, and public records
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
                  Analyzing...
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
          {/* Property Research Results */}
          {result.property_research && (
            <div className="card">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Property Research</h2>
              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Estimated Value</h3>
                  <div className="mt-1 space-y-1">
                    {result.property_research.value_estimates.zillow && (
                      <p className="text-lg font-semibold">${result.property_research.value_estimates.zillow.toLocaleString()} <span className="text-sm text-gray-500">Zillow</span></p>
                    )}
                    {result.property_research.value_estimates.tax_assessed && (
                      <p className="text-sm text-gray-600">${result.property_research.value_estimates.tax_assessed.toLocaleString()} tax assessed</p>
                    )}
                  </div>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Property Details</h3>
                  <div className="mt-1 space-y-1 text-sm">
                    {result.property_research.details.year_built && (
                      <p>Built: {result.property_research.details.year_built}</p>
                    )}
                    {result.property_research.details.square_footage && (
                      <p>{result.property_research.details.square_footage.toLocaleString()} sq ft</p>
                    )}
                    {result.property_research.details.bedrooms && (
                      <p>{result.property_research.details.bedrooms} bed / {result.property_research.details.bathrooms} bath</p>
                    )}
                  </div>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Risk Factors</h3>
                  <div className="mt-1 space-y-1">
                    {result.property_research.risk_factors.flood_zone && (
                      <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${
                        ["A", "AE", "V", "VE"].includes(result.property_research.risk_factors.flood_zone)
                          ? "bg-red-100 text-red-800"
                          : "bg-green-100 text-green-800"
                      }`}>
                        Flood Zone: {result.property_research.risk_factors.flood_zone}
                      </span>
                    )}
                    {result.property_research.risk_factors.has_pool && (
                      <span className="badge-yellow ml-2">Pool</span>
                    )}
                    {result.property_research.risk_factors.coastal_zone && (
                      <span className="badge-yellow ml-2">Coastal</span>
                    )}
                  </div>
                </div>
              </div>
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
                  <p className="text-lg font-semibold">${result.policy.dwelling_limit?.toLocaleString()}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Liability</h3>
                  <p className="text-lg font-semibold">${result.policy.liability_limit?.toLocaleString()}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Valuation</h3>
                  <p className="text-lg font-semibold capitalize">{result.policy.valuation?.replace("_", " ")}</p>
                </div>
              </div>
            </div>
          )}

          {/* Gap Analysis */}
          {result.gap_analysis && (
            <>
              {/* High Priority Gaps */}
              {result.gap_analysis.high_priority_gaps.length > 0 && (
                <div className="card border-red-200">
                  <h2 className="text-lg font-semibold text-red-800 mb-4 flex items-center">
                    <span className="w-3 h-3 bg-red-500 rounded-full mr-2"></span>
                    High Priority Gaps
                  </h2>
                  <div className="space-y-4">
                    {result.gap_analysis.high_priority_gaps.map((gap, i) => (
                      <div key={i} className="gap-card gap-card-high">
                        <h3 className="font-semibold text-gray-900">{gap.issue}</h3>
                        <div className="mt-2 grid md:grid-cols-2 gap-2 text-sm">
                          <div>
                            <span className="text-gray-500">Current:</span> {gap.current}
                          </div>
                          <div>
                            <span className="text-gray-500">Recommended:</span> <span className="text-green-700 font-medium">{gap.recommended}</span>
                          </div>
                        </div>
                        <p className="mt-2 text-sm text-gray-600">{gap.rationale}</p>
                        <p className="mt-2 text-sm font-medium text-blue-700">Action: {gap.action}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Medium Priority Gaps */}
              {result.gap_analysis.medium_priority_gaps.length > 0 && (
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
                            <span className="text-gray-500">Current:</span> {gap.current}
                          </div>
                          <div>
                            <span className="text-gray-500">Recommended:</span> <span className="text-green-700 font-medium">{gap.recommended}</span>
                          </div>
                        </div>
                        <p className="mt-2 text-sm font-medium text-blue-700">Action: {gap.action}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Considerations */}
              {result.gap_analysis.considerations.length > 0 && (
                <div className="card">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <span className="w-3 h-3 bg-blue-500 rounded-full mr-2"></span>
                    Questions for Client
                  </h2>
                  <div className="space-y-4">
                    {result.gap_analysis.considerations.map((c, i) => (
                      <div key={i} className="gap-card gap-card-low">
                        <h3 className="font-semibold text-gray-900">{c.question}</h3>
                        <p className="mt-1 text-sm text-gray-600">{c.why_it_matters}</p>
                        <p className="mt-2 text-sm"><span className="font-medium">If yes:</span> {c.if_yes}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Recommended Coverages */}
              {result.gap_analysis.recommended_coverages && (
                <div className="card bg-green-50 border-green-200">
                  <h2 className="text-lg font-semibold text-green-900 mb-4">Recommended Coverage Levels</h2>
                  <div className="grid md:grid-cols-4 gap-4">
                    {result.gap_analysis.recommended_coverages.dwelling && (
                      <div>
                        <h3 className="text-sm font-medium text-green-700">Dwelling</h3>
                        <p className="text-xl font-bold text-green-900">${result.gap_analysis.recommended_coverages.dwelling.toLocaleString()}</p>
                      </div>
                    )}
                    {result.gap_analysis.recommended_coverages.liability && (
                      <div>
                        <h3 className="text-sm font-medium text-green-700">Liability</h3>
                        <p className="text-xl font-bold text-green-900">${result.gap_analysis.recommended_coverages.liability.toLocaleString()}</p>
                      </div>
                    )}
                    {result.gap_analysis.recommended_coverages.umbrella && (
                      <div>
                        <h3 className="text-sm font-medium text-green-700">Umbrella</h3>
                        <p className="text-xl font-bold text-green-900">${result.gap_analysis.recommended_coverages.umbrella.toLocaleString()}</p>
                      </div>
                    )}
                    {result.gap_analysis.recommended_coverages.add_endorsements && (
                      <div className="md:col-span-4">
                        <h3 className="text-sm font-medium text-green-700">Add Endorsements</h3>
                        <div className="flex flex-wrap gap-2 mt-1">
                          {result.gap_analysis.recommended_coverages.add_endorsements.map((e, i) => (
                            <span key={i} className="badge-green">{e}</span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </>
          )}

          {/* New Analysis Button */}
          <button
            onClick={() => {
              setResult(null);
              setActiveTab("input");
              setAddress("");
              setMockScenario("");
            }}
            className="btn-secondary"
          >
            New Analysis
          </button>
        </div>
      )}
    </div>
  );
}
