// MediFlow Nepal — AI Service (Frontend)
// frontend/services/aiService.ts
// This file handles all API calls to the AI backend endpoints.

const RAW_API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001/api";
const API_BASE = RAW_API_URL.endsWith("/api") ? RAW_API_URL : `${RAW_API_URL}/api`;

// ─── Types ────────────────────────────────────────────────────────────────────

export interface TriageResult {
  department: string;
  label: string;
  nepali: string;
  color: string;
  confidence: "high" | "medium" | "low";
  confidencePercent: number;
  agreement: boolean;
  allProbabilities: Record<string, number>;
  matchedSymptoms: string[];
  message: string;
  recommendations?: string[];
  urgency?: string;
}

export interface WaitTimeResult {
  estimatedMinutes: number;
  estimatedTime: string;
  category: "short" | "medium" | "long";
  message: string;
  breakdown: {
    baseWait: number;
    peakMultiplier: number;
    dayMultiplier: number;
    avgConsultTime: number;
  };
}

export interface FaqResult {
  answer: string;
  matched: boolean;
  confidence: "high" | "medium" | "none";
}

// ─── API Functions ─────────────────────────────────────────────────────────────

export async function getTriage(symptoms: string[]): Promise<{ success: boolean; result: TriageResult }> {
  const res = await fetch(`${API_BASE}/ai/triage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ symptoms }),
  });
  if (!res.ok) throw new Error("Triage service failed");
  return res.json();
}

export async function getWaitTime(
  department: string,
  queuePosition: number,
  activeConsultations?: number
): Promise<{ success: boolean; result: WaitTimeResult }> {
  const res = await fetch(`${API_BASE}/ai/waittime`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ department, queuePosition, activeConsultations }),
  });
  if (!res.ok) throw new Error("Wait time service failed");
  return res.json();
}

export async function getFaqAnswer(message: string): Promise<{ success: boolean; result: FaqResult }> {
  const res = await fetch(`${API_BASE}/ai/faq`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message }),
  });
  if (!res.ok) throw new Error("FAQ service failed");
  return res.json();
}
