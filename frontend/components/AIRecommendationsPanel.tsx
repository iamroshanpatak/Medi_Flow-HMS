'use client';

import { useState, useEffect } from 'react';
import { recommendationsAPI, aiAPI } from '@/services/api';
import { AlertCircle, CheckCircle, RefreshCw, Zap, Target, Heart } from 'lucide-react';
import Toast, { ToastType } from './Toast';

interface Recommendation {
  recommendation: string;
  priority: 'high' | 'medium' | 'low';
  reason: string;
}

interface HealthScore {
  score: number;
  status: string;
  scoreBreakdown?: {
    fitness?: number;
    nutrition?: number;
    mentalHealth?: number;
    preventiveCare?: number;
  };
}

interface RecommendationsData {
  recommendations: Recommendation[];
  healthScore: number;
  riskFactors: string[];
  priority: string;
  generatedAt: string;
  nextReviewDate: string;
}

interface TriageResult {
  department: string;
  label: string;
  confidence: string;
  message: string;
  matchedSymptoms?: string[];
}

export default function AIRecommendationsPanel() {
  const [recommendations, setRecommendations] = useState<RecommendationsData | null>(null);
  const [healthScore, setHealthScore] = useState<HealthScore | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'triage'>('overview');
  const [symptoms, setSymptoms] = useState('');
  const [triageResult, setTriageResult] = useState<TriageResult | null>(null);
  const [triageLoading, setTriageLoading] = useState(false);

  // Load recommendations on component mount
  useEffect(() => {
    loadRecommendations();
  }, []);

  const loadRecommendations = async () => {
    setLoading(true);
    setError(null);
    try {
      // Fetch health score
      const scoreResponse = await recommendationsAPI.getHealthScore();
      setHealthScore(scoreResponse.data);

      // Fetch recommendations
      const recsResponse = await recommendationsAPI.generateRecommendations({
        includeHistory: true,
      });
      setRecommendations(recsResponse.data);

      setToast({ message: 'AI recommendations loaded successfully', type: 'success' });
    } catch (err) {
      const error = err as { response?: { data?: { error?: string } }; message?: string };
      const errorMsg = error.response?.data?.error || error.message || 'Failed to load recommendations';
      setError(errorMsg);
      setToast({ message: errorMsg, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleTriage = async () => {
    if (!symptoms.trim()) {
      setToast({ message: 'Please enter at least one symptom', type: 'warning' });
      return;
    }

    setTriageLoading(true);
    try {
      const symptomsArray = symptoms
        .split(',')
        .map((s) => s.trim())
        .filter((s) => s.length > 0);

      const response = await aiAPI.triage(symptomsArray);
      setTriageResult(response.data.result);
      setToast({ message: 'Triage analysis complete', type: 'success' });
    } catch (err) {
      const error = err as { response?: { data?: { error?: string } }; message?: string };
      const errorMsg = error.response?.data?.error || error.message || 'Triage analysis failed';
      setToast({ message: errorMsg, type: 'error' });
    } finally {
      setTriageLoading(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-blue-600';
    if (score >= 40) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBgColor = (score: number) => {
    if (score >= 80) return 'bg-green-50';
    if (score >= 60) return 'bg-blue-50';
    if (score >= 40) return 'bg-yellow-50';
    return 'bg-red-50';
  };

  if (loading) {
    return (
      <div className="p-6 bg-white rounded-lg shadow">
        <div className="flex items-center justify-center gap-3">
          <RefreshCw className="animate-spin text-blue-600" size={24} />
          <p className="text-gray-600">Loading AI recommendations...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <Zap className="text-amber-500" size={28} />
          AI Health Recommendations
        </h2>
        <button
          onClick={loadRecommendations}
          disabled={loading}
          className="p-2 hover:bg-gray-100 rounded-lg transition"
          title="Refresh recommendations"
        >
          <RefreshCw size={20} className={loading ? 'animate-spin text-gray-400' : 'text-gray-600'} />
        </button>
      </div>

      {error && (
        <div className="p-4 bg-red-50 text-red-700 rounded-lg flex items-start gap-3">
          <AlertCircle size={20} className="flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-medium">Error Loading Recommendations</p>
            <p className="text-sm">{error}</p>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-200">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-4 py-2 font-medium transition ${
            activeTab === 'overview'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          Overview
        </button>
        <button
          onClick={() => setActiveTab('triage')}
          className={`px-4 py-2 font-medium transition ${
            activeTab === 'triage'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          Symptom Analysis
        </button>
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="space-y-4">
          {/* Health Score Card */}
          {healthScore && (
            <div className={`p-6 rounded-lg border-2 ${getScoreBgColor(healthScore.score)} border-gray-200`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Your Health Score</p>
                  <p className={`text-4xl font-bold ${getScoreColor(healthScore.score)}`}>
                    {healthScore.score}
                    <span className="text-lg text-gray-500">/100</span>
                  </p>
                  <p className="text-sm text-gray-600 mt-2">
                    Status: <span className="font-semibold">{healthScore.status}</span>
                  </p>
                </div>
                <Heart className={`${getScoreColor(healthScore.score)}`} size={48} />
              </div>

              {/* Score Breakdown */}
              {healthScore?.scoreBreakdown && (
                <div className="grid grid-cols-4 gap-3 mt-4">
                  <div className="bg-white rounded p-2">
                    <p className="text-xs text-gray-600">Fitness</p>
                    <p className="text-lg font-bold text-gray-800">{healthScore.scoreBreakdown.fitness || '-'}</p>
                  </div>
                  <div className="bg-white rounded p-2">
                    <p className="text-xs text-gray-600">Nutrition</p>
                    <p className="text-lg font-bold text-gray-800">{healthScore.scoreBreakdown.nutrition || '-'}</p>
                  </div>
                  <div className="bg-white rounded p-2">
                    <p className="text-xs text-gray-600">Mental Health</p>
                    <p className="text-lg font-bold text-gray-800">{healthScore.scoreBreakdown.mentalHealth || '-'}</p>
                  </div>
                  <div className="bg-white rounded p-2">
                    <p className="text-xs text-gray-600">Preventive</p>
                    <p className="text-lg font-bold text-gray-800">{healthScore.scoreBreakdown.preventiveCare || '-'}</p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Recommendations List */}
          {recommendations && (
            <>
              <div className="space-y-3">
                <h3 className="font-semibold text-lg flex items-center gap-2">
                  <Target size={20} className="text-blue-600" />
                  Personalized Recommendations
                </h3>
                {recommendations?.recommendations && recommendations.recommendations.length > 0 ? (
                  recommendations.recommendations.map((rec, idx) => (
                    <div
                      key={idx}
                      className={`p-4 rounded-lg border-l-4 ${
                        rec.priority === 'high'
                          ? 'bg-red-50 border-red-400'
                          : rec.priority === 'medium'
                            ? 'bg-yellow-50 border-yellow-400'
                            : 'bg-green-50 border-green-400'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        {rec.priority === 'high' ? (
                          <AlertCircle className="text-red-600 flex-shrink-0 mt-1" size={20} />
                        ) : (
                          <CheckCircle className="text-green-600 flex-shrink-0 mt-1" size={20} />
                        )}
                        <div className="flex-1">
                          <div className="flex items-start justify-between">
                            <div>
                              <p className="font-semibold text-gray-900">{rec.recommendation}</p>
                              <p className="text-sm text-gray-600 mt-1">{rec.reason}</p>
                            </div>
                            <span
                              className={`text-xs font-semibold px-2 py-1 rounded whitespace-nowrap ml-2 ${
                                rec.priority === 'high'
                                  ? 'bg-red-200 text-red-800'
                                  : rec.priority === 'medium'
                                    ? 'bg-yellow-200 text-yellow-800'
                                    : 'bg-green-200 text-green-800'
                              }`}
                            >
                              {rec.priority.toUpperCase()}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 italic">No recommendations at this time</p>
                )}
              </div>

              {/* Risk Factors */}
              {recommendations?.riskFactors && recommendations.riskFactors.length > 0 && (
                <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
                  <h4 className="font-semibold text-orange-900 mb-2 flex items-center gap-2">
                    <AlertCircle size={18} />
                    Identified Risk Factors
                  </h4>
                  <ul className="space-y-1">
                    {recommendations.riskFactors.map((risk, idx) => (
                      <li key={idx} className="text-sm text-orange-800">
                        • {risk}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Next Review Date */}
              {recommendations?.generatedAt && recommendations?.nextReviewDate && (
                <div className="text-xs text-gray-500 text-center p-3 bg-gray-50 rounded">
                  <p>Last generated: {new Date(recommendations.generatedAt).toLocaleString()}</p>
                  <p>Next review: {new Date(recommendations.nextReviewDate).toLocaleDateString()}</p>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* Symptom Analysis Tab */}
      {activeTab === 'triage' && (
        <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
          <h3 className="font-semibold text-lg">AI Symptom Analysis</h3>
          <p className="text-sm text-gray-600">
            Enter your symptoms (comma-separated) to get AI-powered department recommendation.
          </p>

          <textarea
            value={symptoms}
            onChange={(e) => setSymptoms(e.target.value)}
            placeholder="e.g., fever, cough, sore throat"
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            rows={3}
          />

          <button
            onClick={handleTriage}
            disabled={triageLoading || !symptoms.trim()}
            className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition font-medium"
          >
            {triageLoading ? (
              <span className="flex items-center justify-center gap-2">
                <RefreshCw size={18} className="animate-spin" />
                Analyzing Symptoms...
              </span>
            ) : (
              'Get Triage Recommendation'
            )}
          </button>

          {triageResult && (
            <div className="p-4 bg-blue-50 rounded-lg border-l-4 border-blue-500">
              <h4 className="font-semibold text-blue-900 mb-3">Analysis Result</h4>

              <div className="space-y-3">
                <div>
                  <p className="text-xs text-blue-700 font-semibold">Recommended Department</p>
                  <p className="text-xl font-bold text-blue-600">{triageResult.department}</p>
                </div>

                <div>
                  <p className="text-xs text-blue-700 font-semibold">Condition</p>
                  <p className="text-gray-800">{triageResult.label}</p>
                </div>

                <div>
                  <p className="text-xs text-blue-700 font-semibold">Confidence Level</p>
                  <p className="text-gray-800 capitalize">{triageResult.confidence}</p>
                </div>

                <div className="p-3 bg-white rounded border border-blue-200">
                  <p className="text-sm text-gray-700">{triageResult.message}</p>
                </div>

                {triageResult.matchedSymptoms && triageResult.matchedSymptoms.length > 0 && (
                  <div>
                    <p className="text-xs text-blue-700 font-semibold mb-2">Matched Symptoms</p>
                    <div className="flex flex-wrap gap-2">
                      {triageResult.matchedSymptoms.map((symptom: string, idx: number) => (
                        <span key={idx} className="bg-blue-200 text-blue-800 text-xs px-3 py-1 rounded-full">
                          {symptom}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
