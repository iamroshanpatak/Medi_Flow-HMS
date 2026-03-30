// frontend/components/health/HealthScoreCard.tsx
'use client';

import React, { useState, useEffect } from 'react';

interface HealthScoreData {
  score: number;
  bmi: number;
  riskLevel: string;
  trend?: string;
  scoreChange?: number;
  healthMetrics: {
    lifestyle: number;
    medical: number;
    preventive: number;
  };
}

export default function HealthScoreCard() {
  const [scoreData, setScoreData] = useState<HealthScoreData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchHealthScore = async () => {
      try {
        const response = await fetch('/api/recommendations/health-score', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch health score');
        }

        const data = await response.json();
        setScoreData(data.healthMetrics);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchHealthScore();
  }, []);

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6 animate-pulse">
        <div className="h-40 bg-gray-200 rounded-full mx-auto mb-4"></div>
        <div className="h-4 bg-gray-200 rounded w-3/4 mx-auto mb-2"></div>
        <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto"></div>
      </div>
    );
  }

  if (error || !scoreData) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <p className="text-red-700">Error loading health score: {error}</p>
      </div>
    );
  }

  const getScoreColor = (score: number) => {
    if (score >= 70) return '#10B981'; // Green
    if (score >= 50) return '#F59E0B'; // Amber
    return '#EF4444'; // Red
  };

  const getRiskLevelColor = (level: string) => {
    switch (level.toLowerCase()) {
      case 'low': return 'text-green-600';
      case 'moderate': return 'text-amber-600';
      case 'high': return 'text-red-600';
      case 'critical': return 'text-red-700';
      default: return 'text-gray-600';
    }
  };

  const getRiskLevelBg = (level: string) => {
    switch (level.toLowerCase()) {
      case 'low': return 'bg-green-50';
      case 'moderate': return 'bg-amber-50';
      case 'high': return 'bg-red-50';
      case 'critical': return 'bg-red-100';
      default: return 'bg-gray-50';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Your Health Score</h2>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Circular Progress */}
        <div className="flex-shrink-0 w-40 h-40 mx-auto lg:mx-0 relative flex items-center justify-center">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
            <circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              stroke="#E5E7EB"
              strokeWidth="4"
            />
            {/* eslint-disable-next-line react/style-prop-object */}
            <circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              stroke={getScoreColor(scoreData.score)}
              strokeWidth="4"
              strokeDasharray={`${2 * Math.PI * 45}`}
              strokeDashoffset={`${2 * Math.PI * 45 * (1 - scoreData.score / 100)}`}
              strokeLinecap="round"
              style={{ transition: 'stroke-dashoffset 0.5s ease' }}
            />
          </svg>
          <div className="absolute text-center">
            {/* eslint-disable-next-line react/style-prop-object */}
            <p className="text-4xl font-bold" style={{ color: getScoreColor(scoreData.score) }}>
              {scoreData.score}
            </p>
            <p className="text-xs text-gray-500">out of 100</p>
          </div>
        </div>

        {/* Metrics and Info */}
        <div className="flex-1">
          {/* Score Interpretation */}
          <div className="mb-6">
            <p className="text-gray-600 text-sm mb-2">Overall Score</p>
            <p className="text-gray-800 text-lg mb-4">
              Your health is in <span className="font-semibold">good condition</span>
            </p>

            {/* Risk Level Badge */}
            <div className={`inline-block ${getRiskLevelBg(scoreData.riskLevel)} px-4 py-2 rounded-lg mb-4`}>
              <p className={`font-semibold ${getRiskLevelColor(scoreData.riskLevel)}`}>
                Risk Level: {scoreData.riskLevel.charAt(0).toUpperCase() + scoreData.riskLevel.slice(1)}
              </p>
            </div>
          </div>

          {/* Trend */}
          {scoreData.trend && (
            <div className="mb-6 p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-gray-600">Health Trend</p>
              <p className={`text-lg font-semibold ${scoreData.trend === 'improving' ? 'text-green-600' : 'text-orange-600'}`}>
                {scoreData.trend === 'improving' ? '📈 Improving' : '📉 Declining'}
              </p>
              {scoreData.scoreChange && (
                <p className="text-sm text-gray-600 mt-1">
                  {scoreData.scoreChange > 0 ? '+' : ''}{scoreData.scoreChange} points
                </p>
              )}
            </div>
          )}

          {/* BMI */}
          {scoreData.bmi && (
            <div className="p-4 bg-purple-50 rounded-lg">
              <p className="text-sm text-gray-600">Body Mass Index</p>
              <p className="text-2xl font-bold text-purple-600">{scoreData.bmi}</p>
              <p className="text-xs text-gray-500 mt-1">According to WHO standards</p>
            </div>
          )}
        </div>
      </div>

      {/* Component Scores */}
      <div className="mt-8 grid grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg">
          <p className="text-xs text-gray-600 font-semibold uppercase">Lifestyle</p>
          <p className="text-2xl font-bold text-blue-600 mt-1">
            {scoreData.healthMetrics.lifestyle}%
          </p>
          <div className="w-full bg-blue-200 rounded-full h-2 mt-3 overflow-hidden">
            {/* eslint-disable-next-line react/style-prop-object */}
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-500"
              style={{
                width: `${scoreData.healthMetrics.lifestyle}%`
              }}
            ></div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-lg">
          <p className="text-xs text-gray-600 font-semibold uppercase">Medical</p>
          <p className="text-2xl font-bold text-green-600 mt-1">
            {scoreData.healthMetrics.medical}%
          </p>
          <div className="w-full bg-green-200 rounded-full h-2 mt-3 overflow-hidden">
            {/* eslint-disable-next-line react/style-prop-object */}
            <div
              className="bg-green-600 h-2 rounded-full transition-all duration-500"
              style={{
                width: `${scoreData.healthMetrics.medical}%`
              }}
            ></div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-4 rounded-lg">
          <p className="text-xs text-gray-600 font-semibold uppercase">Preventive</p>
          <p className="text-2xl font-bold text-orange-600 mt-1">
            {scoreData.healthMetrics.preventive}%
          </p>
          <div className="w-full bg-orange-200 rounded-full h-2 mt-3 overflow-hidden">
            {/* eslint-disable-next-line react/style-prop-object */}
            <div
              className="bg-orange-600 h-2 rounded-full transition-all duration-500"
              style={{
                width: `${scoreData.healthMetrics.preventive}%`
              }}
            ></div>
          </div>
        </div>
      </div>

      {/* Action Button */}
      <button className="mt-6 w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold py-3 rounded-lg hover:shadow-lg transition-shadow">
        Get Personalized Recommendations
      </button>

      <p className="text-xs text-gray-500 text-center mt-4">
        Last updated: {new Date().toLocaleDateString()}
      </p>
    </div>
  );
}
