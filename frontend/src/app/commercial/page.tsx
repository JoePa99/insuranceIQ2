"use client";

import { useState } from "react";

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
  };
  business_details: {
    employee_count_estimate?: string;
    revenue_estimate?: string;
    years_in_business?: number;
    business_type?: string;
    operations_description?: string;
  };
  risk_assessment: {
    risk_level?: string;
    key_exposures: string[];
    risk_factors: string[];
  };
  coverage_recommendations: {
    required: string[];
    recommended: string[];
    optional: string[];
    notes: string[];
  };
  carrier_suggestions: {
    name: string;
    appetite: string;
    notes?: string;
  }[];
  sources: {
    name: string;
    url?: string;
  }[];
}

export default function CommercialLinesPage() {
  const [companyName, setCompanyName] = useState("");
  const [cityState, setCityState] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<CommercialResult | null>(null);
  const [activeTab, setActiveTab] = useState<"input" | "results">("input");

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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Commercial Lines Research</h1>
          <p className="text-gray-600 mt-1">Research businesses and recommend coverage</p>
        </div>
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
            Results
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
                AI will research the company website, NC Secretary of State, LinkedIn, reviews, and news
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
                  Researching...
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
                  <a href={result.company_profile.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline text-sm">
                    {result.company_profile.website}
                  </a>
                )}
                {result.company_profile.description && (
                  <p className="text-gray-700">{result.company_profile.description}</p>
                )}
              </div>
              <div className="space-y-3">
                {result.company_profile.naics_code && (
                  <div>
                    <span className="text-sm font-medium text-gray-500">NAICS Code:</span>
                    <p className="font-semibold">{result.company_profile.naics_code} - {result.company_profile.naics_description}</p>
                  </div>
                )}
                {result.company_profile.formation_date && (
                  <div>
                    <span className="text-sm font-medium text-gray-500">Formed:</span>
                    <p>{result.company_profile.formation_date}</p>
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
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Employees</h3>
                  <p className="text-xl font-bold">{result.business_details.employee_count_estimate}</p>
                </div>
              )}
              {result.business_details.revenue_estimate && (
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Revenue</h3>
                  <p className="text-xl font-bold">{result.business_details.revenue_estimate}</p>
                </div>
              )}
              {result.business_details.years_in_business && (
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Years in Business</h3>
                  <p className="text-xl font-bold">{result.business_details.years_in_business}</p>
                </div>
              )}
              {result.business_details.business_type && (
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Type</h3>
                  <p className="text-xl font-bold">{result.business_details.business_type}</p>
                </div>
              )}
            </div>
            {result.business_details.operations_description && (
              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <h3 className="text-sm font-medium text-gray-500 mb-1">Operations</h3>
                <p className="text-gray-700">{result.business_details.operations_description}</p>
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
                    <div key={i} className="flex items-center">
                      <span className="w-2 h-2 bg-red-500 rounded-full mr-2"></span>
                      <span>{exp}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-2">Risk Factors</h3>
                <div className="space-y-2">
                  {result.risk_assessment.risk_factors.map((rf, i) => (
                    <div key={i} className="flex items-center">
                      <span className="w-2 h-2 bg-yellow-500 rounded-full mr-2"></span>
                      <span>{rf}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Coverage Recommendations */}
          <div className="card bg-green-50 border-green-200">
            <h2 className="text-lg font-semibold text-green-900 mb-4">Coverage Recommendations</h2>
            <div className="grid md:grid-cols-3 gap-6">
              <div>
                <h3 className="text-sm font-medium text-green-700 mb-2">Required</h3>
                <div className="space-y-1">
                  {result.coverage_recommendations.required.map((cov, i) => (
                    <div key={i} className="badge-red mr-1 mb-1">{cov}</div>
                  ))}
                </div>
              </div>
              <div>
                <h3 className="text-sm font-medium text-green-700 mb-2">Recommended</h3>
                <div className="space-y-1">
                  {result.coverage_recommendations.recommended.map((cov, i) => (
                    <div key={i} className="badge-yellow mr-1 mb-1">{cov}</div>
                  ))}
                </div>
              </div>
              <div>
                <h3 className="text-sm font-medium text-green-700 mb-2">Consider</h3>
                <div className="space-y-1">
                  {result.coverage_recommendations.optional.map((cov, i) => (
                    <div key={i} className="badge-blue mr-1 mb-1">{cov}</div>
                  ))}
                </div>
              </div>
            </div>
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
          {result.carrier_suggestions.length > 0 && (
            <div className="card">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Carrier Suggestions</h2>
              <div className="space-y-3">
                {result.carrier_suggestions.map((carrier, i) => (
                  <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <span className="font-medium">{carrier.name}</span>
                      {carrier.notes && <span className="text-sm text-gray-500 ml-2">- {carrier.notes}</span>}
                    </div>
                    <span className={`badge-${carrier.appetite === "High" ? "green" : carrier.appetite === "Medium" ? "yellow" : "red"}`}>
                      {carrier.appetite} Appetite
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Sources */}
          {result.sources.length > 0 && (
            <div className="card">
              <h2 className="text-sm font-medium text-gray-500 mb-2">Sources</h2>
              <div className="flex flex-wrap gap-2">
                {result.sources.map((src, i) => (
                  <span key={i} className="text-xs text-gray-600 bg-gray-100 px-2 py-1 rounded">
                    {src.name}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* New Research Button */}
          <button
            onClick={() => {
              setResult(null);
              setActiveTab("input");
              setCompanyName("");
              setCityState("");
            }}
            className="btn-secondary"
          >
            New Research
          </button>
        </div>
      )}
    </div>
  );
}
