"use client";

import { useState } from "react";
import { getTriage, TriageResult } from "@/services";
import TriageForm from "./TriageForm";
import TriageResultDisplay from "./TriageResult";

export default function TriagePage() {
  const [result, setResult] = useState<TriageResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (symptoms: string[]) => {
    setError("");
    setLoading(true);
    try {
      const data = await getTriage(symptoms);
      setResult(data.result);
    } catch (err: unknown) {
      // Error caught - continue with error messaging
      void err; // Acknowledge error without using it
      setError("Triage service is currently unavailable. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setResult(null);
    setError("");
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-semibold text-gray-800">AI Triage Assistant</h1>
          <p className="text-gray-500 mt-2 text-sm">Select your symptoms and we will guide you to the right department</p>
        </div>

        {!result ? (
          <TriageForm
            onSubmit={handleSubmit}
            loading={loading}
            error={error}
          />
        ) : (
          <TriageResultDisplay
            result={result}
            onReset={handleReset}
          />
        )}
      </div>
    </div>
  );
}
