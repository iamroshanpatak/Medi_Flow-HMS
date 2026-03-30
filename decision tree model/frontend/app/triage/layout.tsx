import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "AI Triage Assistant | MediFlow",
  description: "Get AI-powered patient triage recommendations",
};

export default function TriageLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
