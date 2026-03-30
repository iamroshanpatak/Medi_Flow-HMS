"use client";

import { TriageResult } from "@/services";

const COLOR_MAP: Record<string, string> = {
  red: "bg-red-50 border-red-300 text-red-800",
  orange: "bg-orange-50 border-orange-300 text-orange-800",
  green: "bg-green-50 border-green-300 text-green-800",
  blue: "bg-blue-50 border-blue-300 text-blue-800",
  purple: "bg-purple-50 border-purple-300 text-purple-800",
  yellow: "bg-yellow-50 border-yellow-300 text-yellow-800",
  pink: "bg-pink-50 border-pink-300 text-pink-800",
  teal: "bg-teal-50 border-teal-300 text-teal-800",
};

const CONFIDENCE_COLORS: Record<string, string> = {
  high: "bg-green-100 text-green-700",
  medium: "bg-yellow-100 text-yellow-700",
  low: "bg-red-100 text-red-700",
};

interface TriageResultProps {
  result: TriageResult;
  onReset: () => void;
}

export default function TriageResultDisplay({ result, onReset }: TriageResultProps) {
  const confidenceKey = (result.confidence || "medium").toLowerCase();
  const confidenceClass = CONFIDENCE_COLORS[confidenceKey] || CONFIDENCE_COLORS.medium;
  const urgencyLabel = result.urgency || (result.confidence === "high" ? "High" : "Moderate");
  const fallbackRecommendations = [
    result.message,
    result.matchedSymptoms?.length
      ? `Matched symptoms: ${result.matchedSymptoms.join(", ")}`
      : "If symptoms worsen, seek immediate medical attention.",
  ];
  const recommendations =
    result.recommendations && result.recommendations.length > 0
      ? result.recommendations
      : fallbackRecommendations;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
      <div
        className={`rounded-xl border-2 p-5 mb-5 ${
          COLOR_MAP[result.color] || "bg-gray-50 border-gray-200 text-gray-800"
        }`}
      >
        <div className="flex items-center justify-between mb-1">
          <h2 className="text-xl font-semibold">{result.label}</h2>
          <span className={`text-xs font-bold px-3 py-1 rounded-full ${confidenceClass}`}>
            {result.confidence} Confidence
          </span>
        </div>
        <p className="text-sm opacity-90">{result.department}</p>
      </div>

      <div className="mb-6 p-4 bg-blue-50 rounded-xl border border-blue-200">
        <h3 className="font-semibold text-blue-900 mb-2 text-sm">Recommended Department:</h3>
        <p className="text-lg font-bold text-blue-700">{result.department}</p>
        <p className="text-xs text-blue-600 mt-1">Urgency Level: <span className="font-semibold">{urgencyLabel}</span></p>
      </div>

      <div className="mb-6">
        <h3 className="font-semibold text-gray-700 mb-3 text-sm">Recommendations:</h3>
        <ul className="space-y-2">
          {recommendations.map((rec: string, i: number) => (
            <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
              <span className="mt-1 text-blue-500">✓</span>
              <span>{rec}</span>
            </li>
          ))}
        </ul>
      </div>

      <button
        onClick={onReset}
        className="w-full bg-gray-100 text-gray-700 px-6 py-3 rounded-xl font-medium hover:bg-gray-200 transition"
      >
        Start Over
      </button>
    </div>
  );
}
