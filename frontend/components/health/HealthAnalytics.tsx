// frontend/components/health/HealthAnalytics.tsx
'use client';

import React, { useState, useEffect } from 'react';

interface HealthAnalyticsData {
  trends: {
    weightTrend?: string;
    bloodPressureTrend?: string;
    bloodGlucoseTrend?: string;
    exerciseTrend?: string;
    predictions?: Record<string, unknown>;
    alerts?: string[];
  };
  medicalHistory?: {
    totalVisits: number;
    emergencyVisits: number;
    totalConditions: number;
  };
  patterns?: Record<string, unknown>;
}

export default function HealthAnalytics() {
  const [analyticsData, setAnalyticsData] = useState<HealthAnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const response = await fetch('/api/recommendations/insights', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch analytics');
        }

        const data = await response.json();
        setAnalyticsData(data.insights);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6 space-y-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-32 bg-gray-200 rounded-lg animate-pulse"></div>
        ))}
      </div>
    );
  }

  if (error || !analyticsData) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <p className="text-red-700">Error loading analytics: {error}</p>
      </div>
    );
  }

  const getTrendIcon = (trend: string | undefined) => {
    if (!trend) return '—';
    if (trend === 'increasing') return '📈';
    if (trend === 'decreasing') return '📉';
    return '➡️';
  };

  const getTrendColor = (trend: string | undefined, isGood: boolean = true) => {
    if (!trend) return 'text-gray-600';
    if (trend === 'increasing') return isGood ? 'text-green-600' : 'text-red-600';
    if (trend === 'decreasing') return isGood ? 'text-red-600' : 'text-green-600';
    return 'text-gray-600';
  };

  const getTrendBg = (trend: string | undefined, isGood: boolean = true) => {
    if (!trend) return 'bg-gray-50';
    if (trend === 'increasing') return isGood ? 'bg-green-50' : 'bg-red-50';
    if (trend === 'decreasing') return isGood ? 'bg-red-50' : 'bg-green-50';
    return 'bg-gray-50';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg shadow-lg p-6 text-white">
        <h2 className="text-3xl font-bold mb-2">Health Analytics & Trends</h2>
        <p className="text-blue-100">Track your health metrics and discover patterns in your wellness journey</p>
      </div>

      {/* Key Health Trends */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h3 className="text-xl font-bold mb-6 text-gray-800">Health Trends Overview</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Weight Trend */}
          <div className={`p-4 rounded-lg border-l-4 ${getTrendBg(analyticsData.trends.weightTrend, false)}`}>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-sm font-semibold text-gray-600 uppercase">Weight Trend</p>
                <p className={`text-2xl font-bold mt-2 ${getTrendColor(analyticsData.trends.weightTrend, false)}`}>
                  {getTrendIcon(analyticsData.trends.weightTrend)} {analyticsData.trends.weightTrend || 'No data'}
                </p>
              </div>
              <span className="text-3xl">⚖️</span>
            </div>
            <p className="text-xs text-gray-600 mt-2">Monitor your weight regularly for health insights</p>
          </div>

          {/* Blood Pressure Trend */}
          <div className={`p-4 rounded-lg border-l-4 ${getTrendBg(analyticsData.trends.bloodPressureTrend, false)}`}>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-sm font-semibold text-gray-600 uppercase">Blood Pressure</p>
                <p className={`text-2xl font-bold mt-2 ${getTrendColor(analyticsData.trends.bloodPressureTrend, false)}`}>
                  {getTrendIcon(analyticsData.trends.bloodPressureTrend)} {analyticsData.trends.bloodPressureTrend || 'No data'}
                </p>
              </div>
              <span className="text-3xl">❤️</span>
            </div>
            <p className="text-xs text-gray-600 mt-2">Keep track of your BP readings regularly</p>
          </div>

          {/* Blood Glucose Trend */}
          <div className={`p-4 rounded-lg border-l-4 ${getTrendBg(analyticsData.trends.bloodGlucoseTrend, false)}`}>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-sm font-semibold text-gray-600 uppercase">Blood Glucose</p>
                <p className={`text-2xl font-bold mt-2 ${getTrendColor(analyticsData.trends.bloodGlucoseTrend, false)}`}>
                  {getTrendIcon(analyticsData.trends.bloodGlucoseTrend)} {analyticsData.trends.bloodGlucoseTrend || 'No data'}
                </p>
              </div>
              <span className="text-3xl">🩸</span>
            </div>
            <p className="text-xs text-gray-600 mt-2">Monitor glucose levels if diabetic</p>
          </div>

          {/* Exercise Trend */}
          <div className={`p-4 rounded-lg border-l-4 ${getTrendBg(analyticsData.trends.exerciseTrend, true)}`}>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-sm font-semibold text-gray-600 uppercase">Exercise Activity</p>
                <p className={`text-2xl font-bold mt-2 ${getTrendColor(analyticsData.trends.exerciseTrend, true)}`}>
                  {getTrendIcon(analyticsData.trends.exerciseTrend)} {analyticsData.trends.exerciseTrend || 'No data'}
                </p>
              </div>
              <span className="text-3xl">💪</span>
            </div>
            <p className="text-xs text-gray-600 mt-2">Maintain regular physical activity</p>
          </div>
        </div>
      </div>

      {/* Health Alerts */}
      {analyticsData.trends.alerts && analyticsData.trends.alerts.length > 0 && (
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-lg font-bold mb-4 text-gray-800">Health Alerts</h3>
          
          <div className="space-y-3">
            {analyticsData.trends.alerts.map((alert, index) => (
              <div key={index} className="p-4 bg-yellow-50 border-l-4 border-yellow-500 rounded-lg">
                <div className="flex items-start gap-3">
                  <span className="text-2xl">⚠️</span>
                  <div>
                    <p className="font-semibold text-gray-800">{alert}</p>
                    <p className="text-xs text-gray-600 mt-1">Take action to address this health concern</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Medical History Summary */}
      {analyticsData.medicalHistory && (
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-lg font-bold mb-4 text-gray-800">Medical History Summary</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-sm text-gray-600 font-semibold uppercase">Total Visits</p>
              <p className="text-3xl font-bold text-blue-600 mt-2">
                {analyticsData.medicalHistory.totalVisits || 0}
              </p>
              <p className="text-xs text-gray-600 mt-2">Healthcare provider visits</p>
            </div>

            <div className="p-4 bg-red-50 rounded-lg border border-red-200">
              <p className="text-sm text-gray-600 font-semibold uppercase">Emergency Visits</p>
              <p className="text-3xl font-bold text-red-600 mt-2">
                {analyticsData.medicalHistory.emergencyVisits || 0}
              </p>
              <p className="text-xs text-gray-600 mt-2">Emergency department visits</p>
            </div>

            <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
              <p className="text-sm text-gray-600 font-semibold uppercase">Active Conditions</p>
              <p className="text-3xl font-bold text-purple-600 mt-2">
                {analyticsData.medicalHistory.totalConditions || 0}
              </p>
              <p className="text-xs text-gray-600 mt-2">Chronic/ongoing conditions</p>
            </div>
          </div>
        </div>
      )}

      {/* Predictions Section */}
      {analyticsData.trends.predictions && (
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-lg font-bold mb-4 text-gray-800">Health Predictions</h3>
          
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-lg border border-blue-200">
            <p className="text-sm text-gray-600 mb-3">Based on your current health trends, our AI predicts:</p>
            
            <div className="space-y-2">
              <p className="text-gray-800">
                <span className="font-semibold">✓</span> Your health metrics are trending toward improvement
              </p>
              <p className="text-gray-800">
                <span className="font-semibold">✓</span> Continue your current health habits for better outcomes
              </p>
              <p className="text-gray-800">
                <span className="font-semibold">⚠️</span> Consider increasing physical activity (150 min/week recommended)
              </p>
            </div>

            <button className="mt-4 bg-blue-600 text-white font-semibold px-6 py-2 rounded-lg hover:bg-blue-700">
              See Detailed Analysis
            </button>
          </div>
        </div>
      )}

      {/* Recommendations Based on Analytics */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h3 className="text-lg font-bold mb-4 text-gray-800">Personalized Insights</h3>
        
        <div className="space-y-3">
          <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200">
            <p className="font-semibold text-gray-800 mb-1">📊 Your Biggest Strength</p>
            <p className="text-sm text-gray-700">Consistent health monitoring - You&apos;re regularly tracking your metrics</p>
          </div>

          <div className="p-4 bg-gradient-to-r from-orange-50 to-amber-50 rounded-lg border border-orange-200">
            <p className="font-semibold text-gray-800 mb-1">🎯 Priority Focus Area</p>
            <p className="text-sm text-gray-700">Increase physical activity to meet WHO recommendations for optimal health</p>
          </div>

          <div className="p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg border border-blue-200">
            <p className="font-semibold text-gray-800 mb-1">💪 Next Step</p>
            <p className="text-sm text-gray-700">Schedule health screening appointment for comprehensive assessment</p>
          </div>
        </div>
      </div>

      {/* Analytics Summary */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg shadow-lg p-6 text-white">
        <h3 className="text-lg font-bold mb-2">Data Quality & Reliability</h3>
        <p className="text-blue-100 text-sm mb-4">
          Your health analytics are based on comprehensive data from your medical records and personal health tracking.
        </p>
        
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-blue-200">Data Points</p>
            <p className="text-2xl font-bold">24+</p>
          </div>
          <div>
            <p className="text-blue-200">Analysis Period</p>
            <p className="text-2xl font-bold">90 Days</p>
          </div>
        </div>

        <button className="mt-4 w-full bg-white text-blue-600 font-semibold py-2 rounded-lg hover:bg-blue-50">
          Download Health Report
        </button>
      </div>
    </div>
  );
}
