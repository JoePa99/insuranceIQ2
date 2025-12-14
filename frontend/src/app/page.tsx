"use client";

import Link from "next/link";

export default function HomePage() {
  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="text-center py-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          AI-Powered Insurance Research
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Research clients, identify coverage gaps, and match carriers — all powered by AI.
          Built for independent agents in North Carolina.
        </p>
      </div>

      {/* Quick Actions */}
      <div className="grid md:grid-cols-2 gap-6">
        <Link href="/personal" className="card hover:shadow-lg transition-shadow cursor-pointer">
          <div className="flex items-start space-x-4">
            <div className="bg-blue-100 p-3 rounded-lg">
              <svg className="h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Personal Lines</h2>
              <p className="text-gray-600 mt-1">
                Analyze homeowners and auto policies. Research properties, identify coverage gaps,
                and generate recommendations.
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                <span className="badge-blue">Property Research</span>
                <span className="badge-blue">Dec Page Analysis</span>
                <span className="badge-blue">Gap Analysis</span>
              </div>
            </div>
          </div>
        </Link>

        <Link href="/commercial" className="card hover:shadow-lg transition-shadow cursor-pointer">
          <div className="flex items-start space-x-4">
            <div className="bg-green-100 p-3 rounded-lg">
              <svg className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Commercial Lines</h2>
              <p className="text-gray-600 mt-1">
                Research businesses, determine NAICS codes, estimate employee counts,
                and recommend coverage types.
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                <span className="badge-green">Business Research</span>
                <span className="badge-green">Risk Assessment</span>
                <span className="badge-green">Coverage Recommendations</span>
              </div>
            </div>
          </div>
        </Link>
      </div>

      {/* Features */}
      <div className="grid md:grid-cols-3 gap-6 mt-12">
        <div className="card">
          <svg className="h-10 w-10 text-blue-600 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
          <h3 className="text-lg font-semibold text-gray-900">Coverage Gap Analysis</h3>
          <p className="text-gray-600 mt-2">
            AI identifies liability gaps, missing endorsements, and underinsured risks
            based on property values and client profiles.
          </p>
        </div>

        <div className="card">
          <svg className="h-10 w-10 text-green-600 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
          </svg>
          <h3 className="text-lg font-semibold text-gray-900">Carrier Matching</h3>
          <p className="text-gray-600 mt-2">
            Match clients to carriers with appetite for their specific risk profile.
            Know which markets to approach first.
          </p>
        </div>

        <div className="card">
          <svg className="h-10 w-10 text-purple-600 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <h3 className="text-lg font-semibold text-gray-900">Business Intelligence</h3>
          <p className="text-gray-600 mt-2">
            Research companies instantly — employee counts, revenue estimates,
            operations details, and recommended coverage types.
          </p>
        </div>
      </div>

      {/* NC Focus */}
      <div className="bg-blue-50 rounded-lg p-6 mt-8 border border-blue-200">
        <h3 className="text-lg font-semibold text-blue-900">Built for North Carolina</h3>
        <p className="text-blue-800 mt-2">
          InsuranceIQ includes NC-specific knowledge: state minimums (30/60/25 auto),
          Beach Plan requirements, flood zone awareness, and carrier appetite for NC risks.
        </p>
      </div>
    </div>
  );
}
