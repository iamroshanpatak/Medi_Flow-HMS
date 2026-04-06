"use client";

import { useEffect, useState, useRef } from "react";
import { getWaitTime, WaitTimeResult } from "@/services";
import styles from "./WaitTimeCard.module.css";

interface Props {
  department: string;
  queuePosition: number;
  activeConsultations?: number;
}

const CATEGORY_STYLES = {
  short: { bar: "bg-green-500", text: "text-gray-900", bg: "bg-green-50", label: "Short wait" },
  medium: { bar: "bg-yellow-500", text: "text-gray-900", bg: "bg-yellow-50", label: "Moderate wait" },
  long: { bar: "bg-red-500", text: "text-gray-900", bg: "bg-red-50", label: "Long wait" },
};

export default function WaitTimeCard({ department, queuePosition, activeConsultations = 1 }: Props) {
  const [data, setData] = useState<WaitTimeResult | null>(null);
  const [loading, setLoading] = useState(true);
  const progressRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    getWaitTime(department, queuePosition, activeConsultations)
      .then(res => setData(res.result))
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, [department, queuePosition, activeConsultations]);

  const progressWidth = data ? Math.min((60 / Math.max(data.estimatedMinutes, 1)) * 100, 100) : 0;

  useEffect(() => {
    if (progressRef.current) {
      progressRef.current.style.setProperty("--progress-width", `${progressWidth}%`);
    }
  }, [progressWidth]);

  if (loading) return (
    <div className="bg-white rounded-xl border border-gray-100 p-4 animate-pulse">
      <div className="h-4 bg-gray-200 rounded w-1/2 mb-2" />
      <div className="h-8 bg-gray-200 rounded w-1/3" />
    </div>
  );

  if (!data) return null;

  const style = CATEGORY_STYLES[data.category];

  return (
    <div className={`rounded-xl border p-4 ${style.bg}`}>
      <div className="flex items-center justify-between mb-2">
        <p className="text-sm font-medium text-gray-900">Estimated Wait Time</p>
        <span className={`text-xs font-medium px-2 py-0.5 rounded-full bg-white ${style.text}`}>
          {style.label}
        </span>
      </div>

      <div className="flex items-end gap-2 mb-3">
        <span className={`text-4xl font-bold ${style.text}`}>{data.estimatedMinutes}</span>
        <span className={`text-sm pb-1 ${style.text}`}>minutes</span>
        <span className="text-xs text-gray-900 pb-1 ml-auto">~{data.estimatedTime}</span>
      </div>

      {/* Progress bar */}
      <div className={styles.progressBar}>
        <div
          ref={progressRef}
          className={`${styles.progressFill} ${style.bar}`}
        />
      </div>

      <p className="text-xs text-gray-900">{data.message}</p>

      {/* Queue position badge */}
      <div className="mt-3 flex items-center gap-2">
        <span className="text-xs text-gray-900">Queue position:</span>
        <span className="text-xs font-semibold text-gray-900 bg-white px-2 py-0.5 rounded-full border">
          #{queuePosition}
        </span>
      </div>
    </div>
  );
}
