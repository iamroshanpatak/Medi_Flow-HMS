"use client";

import { useState } from "react";

const COMMON_SYMPTOMS = [
  "Fever", "Headache", "Cough", "Chest pain", "Stomach pain",
  "Nausea", "Vomiting", "Joint pain", "Back pain", "Rash",
  "Sore throat", "Dizziness", "Fatigue", "Difficulty breathing", "Ear pain"
];

interface TriageFormProps {
  onSubmit: (symptoms: string[]) => void;
  loading: boolean;
  error: string;
}

export default function TriageForm({ onSubmit, loading, error }: TriageFormProps) {
  const [selected, setSelected] = useState<string[]>([]);
  const [custom, setCustom] = useState("");

  const toggleSymptom = (symptom: string) => {
    setSelected((prev) =>
      prev.includes(symptom) ? prev.filter((s) => s !== symptom) : [...prev, symptom]
    );
  };

  const addCustom = () => {
    const trimmed = custom.trim();
    if (trimmed && !selected.includes(trimmed)) {
      setSelected((prev) => [...prev, trimmed]);
      setCustom("");
    }
  };

  const handleSubmit = () => {
    if (selected.length === 0) {
      return;
    }
    onSubmit(selected.map(s => s.toLowerCase()));
  };

  const removeSymptom = (symptom: string) => {
    setSelected((prev) => prev.filter((s) => s !== symptom));
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
      <p className="text-sm font-medium text-gray-700 mb-3">Select your symptoms:</p>
      
      <div className="flex flex-wrap gap-2 mb-5">
        {COMMON_SYMPTOMS.map((symptom) => (
          <button
            key={symptom}
            onClick={() => toggleSymptom(symptom)}
            className={`px-3 py-1.5 rounded-full text-sm border transition-all ${
              selected.includes(symptom)
                ? "bg-blue-600 text-white border-blue-600"
                : "bg-white text-gray-600 border-gray-200 hover:border-blue-300"
            }`}
          >
            {symptom}
          </button>
        ))}
      </div>

      <div className="flex gap-2 mb-5">
        <input
          type="text"
          value={custom}
          onChange={(e) => setCustom(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && addCustom()}
          placeholder="Add custom symptom..."
          className="flex-1 px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          onClick={addCustom}
          className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm hover:bg-gray-200 transition"
        >
          Add
        </button>
      </div>

      {selected.length > 0 && (
        <div className="mb-5 p-3 bg-blue-50 rounded-lg">
          <p className="text-xs text-blue-600 font-medium mb-2">Selected symptoms:</p>
          <div className="flex flex-wrap gap-1">
            {selected.map((s) => (
              <span
                key={s}
                className="inline-flex items-center gap-1 bg-blue-100 text-gray-900 px-2 py-0.5 rounded-full text-xs"
              >
                {s}
                <button
                  onClick={() => removeSymptom(s)}
                  className="ml-0.5 text-blue-400 hover:text-blue-700"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        </div>
      )}

      {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

      <button
        onClick={handleSubmit}
        disabled={loading || selected.length === 0}
        className="w-full bg-blue-600 text-white py-3 rounded-xl font-medium hover:bg-blue-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed"
      >
        {loading ? "Analyzing..." : "Get Triage Recommendation"}
      </button>
    </div>
  );
}
