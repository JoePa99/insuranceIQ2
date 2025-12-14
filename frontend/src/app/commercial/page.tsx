"use client";

import { useState } from "react";

interface Source {
  name: string;
  url?: string;
}

interface CarrierSuggestion {
  name: string;
  appetite: string;
  notes?: string;
  reason?: string;
}

interface CommercialResult {
  company_profile: {
    name: string;
    legal_name?: string;
    address?: string;
    website?: string;
    description?: string;
    industry?: string;
    naics_code?: string;
    naics_description?: string;
    formation_date?: string;
    status?: string;
    ownership_type?: string;
    primary_sic?: string;
  };
  business_details: {
    employee_count_estimate?: string;
    revenue_estimate?: string;
    years_in_business?: number;
    business_type?: string;
    operations_description?: string;
    annual_payroll?: string;
    locations?: number;
    vehicles_owned?: number;
    professional_licenses?: string[];
    certifications?: string[];
  };
  risk_assessment: {
    risk_level?: string;
    key_exposures: string[];
    risk_factors: string[];
    loss_drivers?: string[];
    positive_factors?: string[];
  };
  coverage_recommendations: {
    required: string[];
    recommended: string[];
    optional: string[];
    notes: string[];
    estimated_premium_range?: {
      low: number;
      high: number;
    };
  };
  carrier_suggestions: CarrierSuggestion[];
  carrier_recommendations?: CarrierSuggestion[];
  sources: Source[];
  research_summary?: string;
  agent_notes?: string;
  submission_checklist?: string[];
}

export default function CommercialLinesPage() {
  const [companyName, setCompanyName] = useState("");
  const [cityState, setCityState] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<CommercialResult | null>(null);
  const [activeTab, setActiveTab] = useState<"input" | "results" | "report">("input");
  const [report, setReport] = useState<string>("");
  const [reportLoading, setReportLoading] = useState(false);

  const exampleBusinesses = [
    { name: "ABC Plumbing", location: "Greensboro, NC", type: "Contractor" },
    { name: "Smith & Associates CPA", location: "Charlotte, NC", type: "Accounting" },
    { name: "Main Street Bistro", location: "Raleigh, NC", type: "Restaurant" },
    { name: "TechStart Solutions", location: "Durham, NC", type: "Tech Startup" },
  ];

  const runResearch = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/commercial", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          company_name: companyName,
          city_state: cityState,
        }),
      });
      const data = await response.json();
      setResult(data);
      setActiveTab("results");
    } catch (error) {
      console.error("Research failed:", error);
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
          report_type: "commercial",
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
    a.download = `commercial-analysis-${companyName.replace(/\s+/g, "-").toLowerCase()}-${new Date().toISOString().split("T")[0]}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const getRiskLevelColor = (level?: string) => {
    switch (level?.toLowerCase()) {
      case "low": return "bg-green-100 text-green-800 border-green-300";
      case "moderate":
      case "medium": return "bg-yellow-100 text-yellow-800 border-yellow-300";
      case "high": return "bg-orange-100 text-orange-800 border-orange-300";
      case "very high": return "bg-red-100 text-red-800 border-red-300";
      default: return "bg-gray-100 text-gray-800 border-gray-300";
    }
  };

  const getAppetiteColor = (appetite: string) => {
    switch (appetite.toLowerCase()) {
      case "high":
      case "strong": return "badge-green";
      case "medium":
      case "moderate": return "badge-yellow";
      case "low":
      case "limited": return "badge-red";
      default: return "badge-blue";
    }
  };

  const carriers = result?.carrier_suggestions || result?.carrier_recommendations || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Commercial Lines Research</h1>
          <p className="text-gray-600 mt-1">AI-powered business research and coverage recommendations</p>
        </div>
        {result && (
          <button
            onClick={generateReport}
            disabled={reportLoading}
            className="btn-primary flex items-center gap-2 bg-green-600 hover:bg-green-700"
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
                ? "border-green-500 text-green-600"
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
                ? "border-green-500 text-green-600"
                : "border-transparent text-gray-500 hover:text-gray-700 disabled:opacity-50"
            }`}
          >
            Research Results
          </button>
          <button
            onClick={() => setActiveTab("report")}
            disabled={!report}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === "report"
                ? "border-green-500 text-green-600"
                : "border-transparent text-gray-500 hover:text-gray-700 disabled:opacity-50"
            }`}
          >
            Report
          </button>
        </nav>
      </div>

      {activeTab === "input" && (
        <div className="grid md:grid-cols-2 gap-6">
          {/* Business Input */}
          <div className="card">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Business Information</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Company Name
                </label>
                <input
                  type="text"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="ABC Plumbing"
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  City, State
                </label>
                <input
                  type="text"
                  value={cityState}
                  onChange={(e) => setCityState(e.target.value)}
                  placeholder="Greensboro, NC"
                  className="input-field"
                />
              </div>
              <p className="text-xs text-gray-500">
                Claude AI will research the company website, NC Secretary of State, LinkedIn, reviews, and news
              </p>
            </div>
          </div>

          {/* Example Businesses */}
          <div className="card">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Example Businesses</h2>
            <p className="text-sm text-gray-600 mb-4">
              Click to try a sample business type
            </p>
            <div className="space-y-2">
              {exampleBusinesses.map((biz, i) => (
                <button
                  key={i}
                  onClick={() => {
                    setCompanyName(biz.name);
                    setCityState(biz.location);
                  }}
                  className="w-full p-3 text-left rounded-lg border border-gray-200 hover:border-green-300 hover:bg-green-50 transition-colors"
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="font-medium text-sm">{biz.name}</div>
                      <div className="text-xs text-gray-500">{biz.location}</div>
                    </div>
                    <span className="badge-green">{biz.type}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Run Research */}
          <div className="md:col-span-2">
            <button
              onClick={runResearch}
              disabled={loading || !companyName || !cityState}
              className="btn-primary w-full py-3 text-lg bg-green-600 hover:bg-green-700"
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Researching with Claude AI...
                </span>
              ) : (
                "Research Business"
              )}
            </button>
          </div>
        </div>
      )}

      {activeTab === "results" && result && (
        <div className="space-y-6">
          {/* Research Summary */}
          {result.research_summary && (
            <div className="card bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h2 className="text-lg font-semibold text-gray-900 mb-2">Research Summary</h2>
                  <p className="text-gray-700">{result.research_summary}</p>
                </div>
                {result.risk_assessment.risk_level && (
                  <div className={`ml-4 px-4 py-2 rounded-lg border-2 text-center ${getRiskLevelColor(result.risk_assessment.risk_level)}`}>
                    <div className="text-lg font-bold">{result.risk_assessment.risk_level}</div>
                    <div className="text-xs font-medium">Risk Level</div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Company Profile */}
          <div className="card">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Company Profile</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">{result.company_profile.name}</h3>
                  {result.company_profile.legal_name && result.company_profile.legal_name !== result.company_profile.name && (
                    <p className="text-sm text-gray-500">Legal: {result.company_profile.legal_name}</p>
                  )}
                </div>
                {result.company_profile.address && (
                  <p className="text-gray-600">{result.company_profile.address}</p>
                )}
                {result.company_profile.website && (
                  <a href={result.company_profile.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline text-sm inline-flex items-center gap-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                    {result.company_profile.website}
                  </a>
                )}
                {result.company_profile.description && (
                  <p className="text-gray-700">{result.company_profile.description}</p>
                )}
              </div>
              <div className="space-y-3">
                {result.company_profile.naics_code && (
                  <div className="bg-blue-50 p-3 rounded-lg">
                    <span className="text-sm font-medium text-blue-700">NAICS Code:</span>
                    <p className="font-semibold text-blue-900">{result.company_profile.naics_code}</p>
                    {result.company_profile.naics_description && (
                      <p className="text-sm text-blue-800 mt-1">{result.company_profile.naics_description}</p>
                    )}
                  </div>
                )}
                {result.company_profile.formation_date && (
                  <div>
                    <span className="text-sm font-medium text-gray-500">Formed:</span>
                    <p>{result.company_profile.formation_date}</p>
                  </div>
                )}
                {result.company_profile.ownership_type && (
                  <div>
                    <span className="text-sm font-medium text-gray-500">Entity Type:</span>
                    <p>{result.company_profile.ownership_type}</p>
                  </div>
                )}
                {result.company_profile.status && (
                  <div>
                    <span className="text-sm font-medium text-gray-500">Status:</span>
                    <span className={`ml-2 ${result.company_profile.status === "Active" ? "badge-green" : "badge-yellow"}`}>
                      {result.company_profile.status}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Business Details */}
          <div className="card">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Business Details</h2>
            <div className="grid md:grid-cols-4 gap-4">
              {result.business_details.employee_count_estimate && (
                <div className="bg-gray-50 p-4 rounded-lg text-center">
                  <h3 className="text-sm font-medium text-gray-500">Employees</h3>
                  <p className="text-2xl font-bold text-gray-900">{result.business_details.employee_count_estimate}</p>
                </div>
              )}
              {result.business_details.revenue_estimate && (
                <div className="bg-gray-50 p-4 rounded-lg text-center">
                  <h3 className="text-sm font-medium text-gray-500">Revenue</h3>
                  <p className="text-2xl font-bold text-gray-900">{result.business_details.revenue_estimate}</p>
                </div>
              )}
              {result.business_details.years_in_business !== undefined && (
                <div className="bg-gray-50 p-4 rounded-lg text-center">
                  <h3 className="text-sm font-medium text-gray-500">Years in Business</h3>
                  <p className="text-2xl font-bold text-gray-900">{result.business_details.years_in_business}</p>
                </div>
              )}
              {result.business_details.business_type && (
                <div className="bg-gray-50 p-4 rounded-lg text-center">
                  <h3 className="text-sm font-medium text-gray-500">Business Type</h3>
                  <p className="text-xl font-bold text-gray-900">{result.business_details.business_type}</p>
                </div>
              )}
            </div>

            <div className="grid md:grid-cols-3 gap-4 mt-4">
              {result.business_details.annual_payroll && (
                <div>
                  <span className="text-sm font-medium text-gray-500">Annual Payroll:</span>
                  <p className="font-semibold">{result.business_details.annual_payroll}</p>
                </div>
              )}
              {result.business_details.locations && (
                <div>
                  <span className="text-sm font-medium text-gray-500">Locations:</span>
                  <p className="font-semibold">{result.business_details.locations}</p>
                </div>
              )}
              {result.business_details.vehicles_owned && (
                <div>
                  <span className="text-sm font-medium text-gray-500">Vehicles:</span>
                  <p className="font-semibold">{result.business_details.vehicles_owned}</p>
                </div>
              )}
            </div>

            {result.business_details.operations_description && (
              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <h3 className="text-sm font-medium text-gray-500 mb-1">Operations</h3>
                <p className="text-gray-700">{result.business_details.operations_description}</p>
              </div>
            )}

            {result.business_details.professional_licenses && result.business_details.professional_licenses.length > 0 && (
              <div className="mt-4">
                <h3 className="text-sm font-medium text-gray-500 mb-2">Professional Licenses</h3>
                <div className="flex flex-wrap gap-2">
                  {result.business_details.professional_licenses.map((lic, i) => (
                    <span key={i} className="badge-blue">{lic}</span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Risk Assessment */}
          <div className="card">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Risk Assessment</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-2">Key Exposures</h3>
                <div className="space-y-2">
                  {result.risk_assessment.key_exposures.map((exp, i) => (
                    <div key={i} className="flex items-start">
                      <span className="w-2 h-2 bg-red-500 rounded-full mr-2 mt-2 flex-shrink-0"></span>
                      <span className="text-gray-700">{exp}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-2">Risk Factors</h3>
                <div className="space-y-2">
                  {result.risk_assessment.risk_factors.map((rf, i) => (
                    <div key={i} className="flex items-start">
                      <span className="w-2 h-2 bg-yellow-500 rounded-full mr-2 mt-2 flex-shrink-0"></span>
                      <span className="text-gray-700">{rf}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {result.risk_assessment.loss_drivers && result.risk_assessment.loss_drivers.length > 0 && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <h3 className="text-sm font-semibold text-red-800 mb-2">Primary Loss Drivers</h3>
                <ul className="list-disc list-inside text-sm text-red-900 space-y-1">
                  {result.risk_assessment.loss_drivers.map((driver, i) => (
                    <li key={i}>{driver}</li>
                  ))}
                </ul>
              </div>
            )}

            {result.risk_assessment.positive_factors && result.risk_assessment.positive_factors.length > 0 && (
              <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                <h3 className="text-sm font-semibold text-green-800 mb-2">Positive Factors</h3>
                <div className="flex flex-wrap gap-2">
                  {result.risk_assessment.positive_factors.map((factor, i) => (
                    <span key={i} className="badge-green">{factor}</span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Coverage Recommendations */}
          <div className="card bg-green-50 border-green-200">
            <h2 className="text-lg font-semibold text-green-900 mb-4">Coverage Recommendations</h2>
            <div className="grid md:grid-cols-3 gap-6">
              <div>
                <h3 className="text-sm font-medium text-green-700 mb-2">Required Coverage</h3>
                <div className="space-y-1">
                  {result.coverage_recommendations.required.map((cov, i) => (
                    <div key={i} className="flex items-center">
                      <span className="w-2 h-2 bg-red-500 rounded-full mr-2"></span>
                      <span className="text-sm font-medium text-gray-900">{cov}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <h3 className="text-sm font-medium text-green-700 mb-2">Recommended</h3>
                <div className="space-y-1">
                  {result.coverage_recommendations.recommended.map((cov, i) => (
                    <div key={i} className="flex items-center">
                      <span className="w-2 h-2 bg-yellow-500 rounded-full mr-2"></span>
                      <span className="text-sm text-gray-900">{cov}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <h3 className="text-sm font-medium text-green-700 mb-2">Consider</h3>
                <div className="space-y-1">
                  {result.coverage_recommendations.optional.map((cov, i) => (
                    <div key={i} className="flex items-center">
                      <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                      <span className="text-sm text-gray-700">{cov}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {result.coverage_recommendations.estimated_premium_range && (
              <div className="mt-4 p-3 bg-white rounded-lg border border-green-200">
                <h3 className="text-sm font-medium text-green-700 mb-1">Estimated Premium Range</h3>
                <p className="text-xl font-bold text-green-900">
                  ${result.coverage_recommendations.estimated_premium_range.low.toLocaleString()} - ${result.coverage_recommendations.estimated_premium_range.high.toLocaleString()} / year
                </p>
              </div>
            )}

            {result.coverage_recommendations.notes.length > 0 && (
              <div className="mt-4 pt-4 border-t border-green-200">
                <h3 className="text-sm font-medium text-green-700 mb-2">Notes</h3>
                <ul className="list-disc list-inside text-sm text-green-800 space-y-1">
                  {result.coverage_recommendations.notes.map((note, i) => (
                    <li key={i}>{note}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Carrier Suggestions */}
          {carriers.length > 0 && (
            <div className="card">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Carrier Recommendations</h2>
              <div className="space-y-3">
                {carriers.map((carrier, i) => (
                  <div key={i} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <span className="font-semibold text-gray-900">{carrier.name}</span>
                      {(carrier.notes || carrier.reason) && (
                        <p className="text-sm text-gray-600 mt-1">{carrier.notes || carrier.reason}</p>
                      )}
                    </div>
                    <span className={getAppetiteColor(carrier.appetite)}>
                      {carrier.appetite} Appetite
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Submission Checklist */}
          {result.submission_checklist && result.submission_checklist.length > 0 && (
            <div className="card border-purple-200 bg-purple-50">
              <h2 className="text-lg font-semibold text-purple-900 mb-4">Submission Checklist</h2>
              <div className="space-y-2">
                {result.submission_checklist.map((item, i) => (
                  <label key={i} className="flex items-start gap-3 p-2 bg-white rounded border border-purple-200 cursor-pointer hover:bg-purple-50">
                    <input type="checkbox" className="mt-1 rounded border-purple-300 text-purple-600 focus:ring-purple-500" />
                    <span className="text-sm text-gray-700">{item}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Agent Notes */}
          {result.agent_notes && (
            <div className="card bg-amber-50 border-amber-200">
              <h2 className="text-lg font-semibold text-amber-900 mb-2 flex items-center">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
                Agent Notes
              </h2>
              <p className="text-amber-900">{result.agent_notes}</p>
            </div>
          )}

          {/* Sources */}
          {result.sources && result.sources.length > 0 && (
            <div className="card">
              <h2 className="text-sm font-medium text-gray-500 mb-2">Research Sources</h2>
              <div className="flex flex-wrap gap-2">
                {result.sources.map((src, i) => (
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

          {/* Action Buttons */}
          <div className="flex gap-4">
            <button
              onClick={generateReport}
              disabled={reportLoading}
              className="btn-primary flex items-center gap-2 bg-green-600 hover:bg-green-700"
            >
              {reportLoading ? "Generating..." : "Generate Professional Report"}
            </button>
            <button
              onClick={() => {
                setResult(null);
                setReport("");
                setActiveTab("input");
                setCompanyName("");
                setCityState("");
              }}
              className="btn-secondary"
            >
              New Research
            </button>
          </div>
        </div>
      )}

      {activeTab === "report" && report && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Commercial Analysis Report</h2>
            <button
              onClick={downloadReport}
              className="btn-primary flex items-center gap-2 bg-green-600 hover:bg-green-700"
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
