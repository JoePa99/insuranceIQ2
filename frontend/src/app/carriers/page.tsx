"use client";

import { useState } from "react";

interface Carrier {
  name: string;
  type: "personal" | "commercial" | "both";
  lines: string[];
  appetite: {
    category: string;
    level: "High" | "Medium" | "Low" | "No";
    notes?: string;
  }[];
  strengths: string[];
  considerations: string[];
  contact?: string;
  am_best_rating?: string;
}

const NC_CARRIERS: Carrier[] = [
  {
    name: "NC Farm Bureau",
    type: "both",
    lines: ["Homeowners", "Auto", "Farm", "Commercial"],
    appetite: [
      { category: "Standard Homeowners", level: "High", notes: "Dominant in rural NC" },
      { category: "Coastal Property", level: "Low", notes: "Limited coastal appetite" },
      { category: "Auto", level: "High" },
      { category: "Farm/Ranch", level: "High" },
      { category: "Small Commercial", level: "Medium" },
    ],
    strengths: ["Competitive rates in rural areas", "Local agents throughout NC", "Strong farm program"],
    considerations: ["Membership required", "Less competitive in urban areas"],
    am_best_rating: "A",
  },
  {
    name: "State Farm",
    type: "both",
    lines: ["Homeowners", "Auto", "Life", "Commercial"],
    appetite: [
      { category: "Standard Homeowners", level: "High" },
      { category: "Coastal Property", level: "Medium", notes: "Selective in high-wind areas" },
      { category: "Auto", level: "High" },
      { category: "New Drivers", level: "Medium" },
      { category: "Small Commercial", level: "Medium" },
    ],
    strengths: ["Brand recognition", "Full product suite", "Claims service"],
    considerations: ["Captive agents only", "Can be pricey"],
    am_best_rating: "A++",
  },
  {
    name: "Travelers",
    type: "both",
    lines: ["Homeowners", "Auto", "Commercial", "Specialty"],
    appetite: [
      { category: "Standard Homeowners", level: "High" },
      { category: "High-Value Homes", level: "High" },
      { category: "Coastal Property", level: "Medium" },
      { category: "Small Commercial", level: "High" },
      { category: "Contractors", level: "High" },
      { category: "Professional Liability", level: "High" },
    ],
    strengths: ["Broad commercial appetite", "Package policies", "Risk engineering"],
    considerations: ["Pricing can be high", "Underwriting standards strict"],
    am_best_rating: "A++",
  },
  {
    name: "Erie Insurance",
    type: "both",
    lines: ["Homeowners", "Auto", "Commercial"],
    appetite: [
      { category: "Standard Homeowners", level: "High" },
      { category: "Auto", level: "High" },
      { category: "Multi-Policy", level: "High", notes: "Best rates with bundling" },
      { category: "Small Commercial", level: "High" },
    ],
    strengths: ["Excellent rates for bundled policies", "Strong claims service", "Rate stability"],
    considerations: ["Limited to certain states", "Requires auto for best home rates"],
    am_best_rating: "A+",
  },
  {
    name: "NC Beach Plan (NCJUA)",
    type: "personal",
    lines: ["Wind/Hail Only"],
    appetite: [
      { category: "Coastal Wind Coverage", level: "High", notes: "Market of last resort" },
      { category: "Beach Properties", level: "High" },
    ],
    strengths: ["Covers wind where others won't", "Required for many coastal mortgages"],
    considerations: ["Wind/hail only - need separate policy for other perils", "Higher rates", "High deductibles"],
    am_best_rating: "N/A",
  },
  {
    name: "Hartford",
    type: "both",
    lines: ["Homeowners", "Auto", "Commercial", "Workers Comp"],
    appetite: [
      { category: "Standard Homeowners", level: "High" },
      { category: "Small Commercial", level: "High" },
      { category: "AARP Members", level: "High", notes: "Exclusive AARP partner" },
      { category: "Workers Compensation", level: "High" },
    ],
    strengths: ["Strong commercial programs", "AARP partnership for 50+", "Workers comp expertise"],
    considerations: ["Personal lines focused on AARP market"],
    am_best_rating: "A+",
  },
  {
    name: "Progressive",
    type: "personal",
    lines: ["Auto", "Homeowners", "Motorcycle", "RV"],
    appetite: [
      { category: "Auto", level: "High" },
      { category: "Non-Standard Auto", level: "High", notes: "Good for drivers with violations" },
      { category: "Motorcycle/RV", level: "High" },
      { category: "Homeowners", level: "Medium" },
    ],
    strengths: ["Competitive auto rates", "Good for non-standard risks", "Easy online quoting"],
    considerations: ["Home rates often not competitive", "Bundle savings limited"],
    am_best_rating: "A+",
  },
  {
    name: "Nationwide",
    type: "both",
    lines: ["Homeowners", "Auto", "Commercial", "Farm"],
    appetite: [
      { category: "Standard Homeowners", level: "High" },
      { category: "Auto", level: "High" },
      { category: "Small Commercial", level: "High" },
      { category: "Farm/Agribusiness", level: "High" },
    ],
    strengths: ["Broad product portfolio", "Strong farm program", "Multi-policy discounts"],
    considerations: ["Rates vary significantly by region"],
    am_best_rating: "A+",
  },
  {
    name: "Markel",
    type: "commercial",
    lines: ["Specialty Commercial", "Professional Liability", "Excess"],
    appetite: [
      { category: "Hard-to-Place Commercial", level: "High" },
      { category: "Professional Liability", level: "High" },
      { category: "Contractors", level: "High" },
      { category: "Restaurants", level: "Medium" },
    ],
    strengths: ["Specialty market expertise", "Flexible underwriting", "Good for difficult classes"],
    considerations: ["Surplus lines - not admitted in all cases"],
    am_best_rating: "A",
  },
  {
    name: "Berkshire Hathaway GUARD",
    type: "commercial",
    lines: ["Small Commercial", "BOP", "Workers Comp"],
    appetite: [
      { category: "Small Commercial BOP", level: "High" },
      { category: "Contractors", level: "High" },
      { category: "Professional Services", level: "High" },
      { category: "Workers Comp", level: "High" },
    ],
    strengths: ["Competitive small commercial rates", "Easy submission process", "Broad appetite"],
    considerations: ["Online-focused, less agent support"],
    am_best_rating: "A++",
  },
];

export default function CarriersPage() {
  const [filterType, setFilterType] = useState<"all" | "personal" | "commercial">("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCarrier, setSelectedCarrier] = useState<Carrier | null>(null);

  const filteredCarriers = NC_CARRIERS.filter((carrier) => {
    const matchesType = filterType === "all" || carrier.type === filterType || carrier.type === "both";
    const matchesSearch = carrier.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      carrier.lines.some(line => line.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesType && matchesSearch;
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">NC Carrier Appetite Guide</h1>
        <p className="text-gray-600 mt-1">Know which carriers to approach for different risk types</p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 items-center">
        <div className="flex rounded-lg overflow-hidden border border-gray-300">
          <button
            onClick={() => setFilterType("all")}
            className={`px-4 py-2 text-sm font-medium ${
              filterType === "all" ? "bg-blue-600 text-white" : "bg-white text-gray-700 hover:bg-gray-50"
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFilterType("personal")}
            className={`px-4 py-2 text-sm font-medium border-l ${
              filterType === "personal" ? "bg-blue-600 text-white" : "bg-white text-gray-700 hover:bg-gray-50"
            }`}
          >
            Personal Lines
          </button>
          <button
            onClick={() => setFilterType("commercial")}
            className={`px-4 py-2 text-sm font-medium border-l ${
              filterType === "commercial" ? "bg-green-600 text-white" : "bg-white text-gray-700 hover:bg-gray-50"
            }`}
          >
            Commercial
          </button>
        </div>
        <input
          type="text"
          placeholder="Search carriers or lines..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="input-field max-w-xs"
        />
      </div>

      {/* Carrier Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredCarriers.map((carrier) => (
          <div
            key={carrier.name}
            onClick={() => setSelectedCarrier(carrier)}
            className="card hover:shadow-lg transition-shadow cursor-pointer"
          >
            <div className="flex justify-between items-start mb-3">
              <h3 className="text-lg font-semibold text-gray-900">{carrier.name}</h3>
              {carrier.am_best_rating && (
                <span className="badge-green">{carrier.am_best_rating}</span>
              )}
            </div>
            <div className="flex flex-wrap gap-1 mb-3">
              {carrier.lines.slice(0, 3).map((line, i) => (
                <span key={i} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">
                  {line}
                </span>
              ))}
              {carrier.lines.length > 3 && (
                <span className="text-xs text-gray-400">+{carrier.lines.length - 3} more</span>
              )}
            </div>
            <div className="space-y-1">
              {carrier.appetite.slice(0, 3).map((apt, i) => (
                <div key={i} className="flex justify-between items-center text-sm">
                  <span className="text-gray-600">{apt.category}</span>
                  <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                    apt.level === "High" ? "bg-green-100 text-green-800" :
                    apt.level === "Medium" ? "bg-yellow-100 text-yellow-800" :
                    apt.level === "Low" ? "bg-red-100 text-red-800" :
                    "bg-gray-100 text-gray-800"
                  }`}>
                    {apt.level}
                  </span>
                </div>
              ))}
            </div>
            <p className="text-xs text-blue-600 mt-3">Click for details →</p>
          </div>
        ))}
      </div>

      {/* Carrier Detail Modal */}
      {selectedCarrier && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">{selectedCarrier.name}</h2>
                  <div className="flex gap-2 mt-2">
                    {selectedCarrier.am_best_rating && (
                      <span className="badge-green">AM Best: {selectedCarrier.am_best_rating}</span>
                    )}
                    <span className={`badge-${selectedCarrier.type === "personal" ? "blue" : selectedCarrier.type === "commercial" ? "green" : "yellow"}`}>
                      {selectedCarrier.type === "both" ? "Personal & Commercial" : selectedCarrier.type === "personal" ? "Personal Lines" : "Commercial"}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedCarrier(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Lines of Business */}
              <div className="mb-6">
                <h3 className="text-sm font-medium text-gray-500 mb-2">Lines of Business</h3>
                <div className="flex flex-wrap gap-2">
                  {selectedCarrier.lines.map((line, i) => (
                    <span key={i} className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm">
                      {line}
                    </span>
                  ))}
                </div>
              </div>

              {/* Appetite Details */}
              <div className="mb-6">
                <h3 className="text-sm font-medium text-gray-500 mb-2">Appetite by Category</h3>
                <div className="space-y-2">
                  {selectedCarrier.appetite.map((apt, i) => (
                    <div key={i} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                      <div>
                        <span className="font-medium">{apt.category}</span>
                        {apt.notes && <span className="text-sm text-gray-500 ml-2">- {apt.notes}</span>}
                      </div>
                      <span className={`px-3 py-1 rounded text-sm font-medium ${
                        apt.level === "High" ? "bg-green-100 text-green-800" :
                        apt.level === "Medium" ? "bg-yellow-100 text-yellow-800" :
                        apt.level === "Low" ? "bg-red-100 text-red-800" :
                        "bg-gray-200 text-gray-800"
                      }`}>
                        {apt.level}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Strengths */}
              <div className="mb-6">
                <h3 className="text-sm font-medium text-gray-500 mb-2">Strengths</h3>
                <ul className="list-disc list-inside space-y-1 text-gray-700">
                  {selectedCarrier.strengths.map((strength, i) => (
                    <li key={i}>{strength}</li>
                  ))}
                </ul>
              </div>

              {/* Considerations */}
              <div className="mb-6">
                <h3 className="text-sm font-medium text-gray-500 mb-2">Considerations</h3>
                <ul className="list-disc list-inside space-y-1 text-gray-700">
                  {selectedCarrier.considerations.map((consideration, i) => (
                    <li key={i}>{consideration}</li>
                  ))}
                </ul>
              </div>

              <button
                onClick={() => setSelectedCarrier(null)}
                className="btn-secondary w-full"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
