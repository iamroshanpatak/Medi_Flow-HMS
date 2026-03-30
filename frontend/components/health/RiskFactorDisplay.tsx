// frontend/components/health/RiskFactorDisplay.tsx
'use client';

import React, { useState, useEffect } from 'react';

interface RiskFactor {
  type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  score?: number;
  recommendations?: string[];
}

interface RiskAssessment {
  cardiovascular?: { riskScore: number; category: string; recommendations: string[] };
  metabolic?: { hasMetabolicSyndrome: boolean; score: number; category: string; components: string[] };
  mentalHealth?: { score: number; category: string; needsProfessionalHelp: boolean };
  overallRiskScore?: string;
  alerts?: RiskFactor[];
  priorities?: Array<{ type: string; score: number }>;
}

export default function RiskFactorDisplay() {
  const [riskData, setRiskData] = useState<RiskAssessment | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedRisk, setExpandedRisk] = useState<string | null>(null);

  useEffect(() => {
    const fetchRiskAssessment = async () => {
      try {
        const response = await fetch('/api/recommendations/risk-assessment', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch risk assessment');
        }

        const data = await response.json();
        setRiskData(data.riskAssessment);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchRiskAssessment();
  }, []);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-50 border-l-4 border-red-600';
      case 'high': return 'bg-orange-50 border-l-4 border-orange-600';
      case 'medium': return 'bg-yellow-50 border-l-4 border-yellow-600';
      case 'low': return 'bg-blue-50 border-l-4 border-blue-600';
      default: return 'bg-gray-50 border-l-4 border-gray-600';
    }
  };

  const getSeverityBadgeColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-200 text-red-800';
      case 'high': return 'bg-orange-200 text-orange-800';
      case 'medium': return 'bg-yellow-200 text-yellow-800';
      case 'low': return 'bg-blue-200 text-blue-800';
      default: return 'bg-gray-200 text-gray-800';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical': return '🚨';
      case 'high': return '⚠️';
      case 'medium': return '⚡';
      case 'low': return 'ℹ️';
      default: return '📋';
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6 space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-24 bg-gray-200 rounded-lg animate-pulse"></div>
        ))}
      </div>
    );
  }

  if (error || !riskData) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <p className="text-red-700">Error loading risk assessment: {error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Overall Risk Score */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold mb-6 text-gray-800">Health Risk Assessment</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {/* Cardiovascular Risk */}
          {riskData.cardiovascular && (
            <div className="p-4 bg-gradient-to-br from-red-50 to-red-100 rounded-lg border border-red-200">
              <p className="text-sm font-semibold text-gray-600 uppercase">Cardiovascular Risk</p>
              <p className="text-3xl font-bold text-red-600 mt-2">{riskData.cardiovascular.riskScore}</p>
              <p className="text-xs text-gray-600 mt-2">
                Category: <span className="font-semibold capitalize">{riskData.cardiovascular.category}</span>
              </p>
              <button
                onClick={() => setExpandedRisk(expandedRisk === 'cardio' ? null : 'cardio')}
                className="text-xs text-red-600 font-semibold mt-2 hover:underline"
              >
                {expandedRisk === 'cardio' ? 'Hide' : 'View'} Details →
              </button>
            </div>
          )}

          {/* Metabolic Risk */}
          {riskData.metabolic && (
            <div className="p-4 bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg border border-orange-200">
              <p className="text-sm font-semibold text-gray-600 uppercase">Metabolic Health</p>
              <p className="text-3xl font-bold text-orange-600 mt-2">
                {riskData.metabolic.score.toFixed(0)}
              </p>
              <p className="text-xs text-gray-600 mt-2">
                {riskData.metabolic.hasMetabolicSyndrome ? (
                  <span className="text-orange-700 font-semibold">⚠️ Syndrome Detected</span>
                ) : (
                  <span>No metabolic syndrome</span>
                )}
              </p>
              <button
                onClick={() => setExpandedRisk(expandedRisk === 'metabolic' ? null : 'metabolic')}
                className="text-xs text-orange-600 font-semibold mt-2 hover:underline"
              >
                {expandedRisk === 'metabolic' ? 'Hide' : 'View'} Details →
              </button>
            </div>
          )}

          {/* Mental Health Risk */}
          {riskData.mentalHealth && (
            <div className="p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg border border-purple-200">
              <p className="text-sm font-semibold text-gray-600 uppercase">Mental Health</p>
              <p className="text-3xl font-bold text-purple-600 mt-2">
                {riskData.mentalHealth.score.toFixed(0)}
              </p>
              <p className="text-xs text-gray-600 mt-2">
                {riskData.mentalHealth.needsProfessionalHelp ? (
                  <span className="text-purple-700 font-semibold">⚠️ Needs Support</span>
                ) : (
                  <span>Good mental health status</span>
                )}
              </p>
              <button
                onClick={() => setExpandedRisk(expandedRisk === 'mental' ? null : 'mental')}
                className="text-xs text-purple-600 font-semibold mt-2 hover:underline"
              >
                {expandedRisk === 'mental' ? 'Hide' : 'View'} Details →
              </button>
            </div>
          )}
        </div>

        {/* Overall Risk Score */}
        {riskData.overallRiskScore && (
          <div className="p-4 bg-gradient-to-r from-gray-100 to-gray-200 rounded-lg border border-gray-300">
            <p className="text-sm font-semibold text-gray-600 uppercase">Overall Risk Score</p>
            <p className="text-4xl font-bold text-gray-800 mt-2">{riskData.overallRiskScore}/100</p>
          </div>
        )}
      </div>

      {/* Expanded Risk Details */}
      {expandedRisk === 'cardio' && riskData.cardiovascular && (
        <div className={`rounded-lg shadow-lg p-6 ${getSeverityColor('high')}`}>
          <h3 className="text-lg font-bold text-gray-800 mb-4">Cardiovascular Risk Details</h3>
          
          <div className="mb-4 p-3 bg-white rounded">
            <p className="text-sm text-gray-600 mb-2">Risk Category</p>
            <p className="font-semibold text-gray-800 capitalize">{riskData.cardiovascular.category}</p>
          </div>

          {riskData.cardiovascular.recommendations && (
            <div className="mb-4">
              <p className="text-sm font-semibold text-gray-700 mb-2">Recommendations</p>
              <ul className="space-y-2">
                {riskData.cardiovascular.recommendations.map((rec, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-sm text-gray-700">
                    <span className="text-orange-600 mt-1">▸</span>
                    <span>{rec}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <button className="w-full bg-orange-600 text-white font-semibold py-2 rounded-lg hover:bg-orange-700">
            Schedule Cardiology Consultation
          </button>
        </div>
      )}

      {expandedRisk === 'metabolic' && riskData.metabolic && (
        <div className={`rounded-lg shadow-lg p-6 ${getSeverityColor('medium')}`}>
          <h3 className="text-lg font-bold text-gray-800 mb-4">Metabolic Health Details</h3>
          
          {riskData.metabolic.hasMetabolicSyndrome && (
            <div className="mb-4 p-3 bg-white rounded border border-orange-200">
              <p className="text-sm font-semibold text-orange-700">⚠️ Metabolic Syndrome Detected</p>
              <p className="text-xs text-gray-600 mt-1">
                You have multiple metabolic risk factors. Lifestyle modifications are essential.
              </p>
            </div>
          )}

          {riskData.metabolic.components && (
            <div className="mb-4">
              <p className="text-sm font-semibold text-gray-700 mb-2">Components</p>
              <div className="space-y-2">
                {riskData.metabolic.components.map((comp, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-sm text-gray-700">
                    <span className="w-2 h-2 bg-orange-500 rounded-full"></span>
                    <span>{comp}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <button className="w-full bg-orange-600 text-white font-semibold py-2 rounded-lg hover:bg-orange-700">
            Get Lifestyle Recommendations
          </button>
        </div>
      )}

      {/* Alerts Section */}
      {riskData.alerts && riskData.alerts.length > 0 && (
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-4">Health Alerts</h3>
          
          <div className="space-y-3">
            {riskData.alerts.map((alert, index) => (
              <div key={index} className={`p-4 rounded-lg ${getSeverityColor(alert.severity)}`}>
                <div className="flex items-start gap-3">
                  <span className="text-2xl">{getSeverityIcon(alert.severity)}</span>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-semibold text-gray-800">{alert.type}</h4>
                      <span className={`px-2 py-1 text-xs font-bold rounded ${getSeverityBadgeColor(alert.severity)}`}>
                        {alert.severity.toUpperCase()}
                      </span>
                    </div>
                    <p className="text-sm text-gray-700 mb-2">{alert.message}</p>
                    {alert.recommendations && alert.recommendations.length > 0 && (
                      <ul className="text-xs text-gray-600 space-y-1">
                        {alert.recommendations.map((rec, idx) => (
                          <li key={idx} className="flex items-center gap-2">
                            <span>•</span> {rec}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Priority Actions */}
      {riskData.priorities && riskData.priorities.length > 0 && (
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-4">Priority Focus Areas</h3>
          
          <div className="space-y-3">
            {riskData.priorities.map((priority, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                <div>
                  <p className="font-semibold text-gray-800">{priority.type}</p>
                  <p className="text-xs text-gray-600">Risk Score: {priority.score.toFixed(0)}</p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-blue-600">#{index + 1}</p>
                  <p className="text-xs text-gray-600">Priority</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
