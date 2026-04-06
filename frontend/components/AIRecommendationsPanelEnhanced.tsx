'use client';

import { useState, useEffect } from 'react';
import { recommendationsAPI, aiAPI } from '@/services/api';
import { AlertCircle, CheckCircle, RefreshCw, Zap, Target, Heart, TrendingUp, Activity, Apple, Brain, AlertTriangle, Calendar, Download } from 'lucide-react';
import Toast, { ToastType } from './Toast';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import styles from './AIRecommendationsPanelEnhanced.module.css';

interface Recommendation {
  recommendation: string;
  priority: 'high' | 'medium' | 'low';
  reason: string;
  actionSteps?: string[];
  estimatedImpact?: string;
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
  trend?: 'improving' | 'stable' | 'declining';
}

interface HealthTrend {
  date: string;
  score: number;
  fitness: number;
  nutrition: number;
  mental: number;
}

interface RecommendationsData {
  recommendations: Recommendation[];
  healthScore: number;
  riskFactors: string[];
  priority: string;
  generatedAt: string;
  nextReviewDate: string;
  actionPlan?: {
    goal: string;
    timeline: string;
    steps: string[];
  }[];
}

interface TriageResult {
  department: string;
  label: string;
  confidence: string;
  message: string;
  matchedSymptoms?: string[];
}

const HEALTH_TREND_DATA: HealthTrend[] = [
  { date: 'Day 1', score: 60, fitness: 50, nutrition: 65, mental: 65 },
  { date: 'Day 7', score: 62, fitness: 52, nutrition: 68, mental: 67 },
  { date: 'Day 14', score: 65, fitness: 55, nutrition: 70, mental: 70 },
  { date: 'Day 21', score: 68, fitness: 58, nutrition: 72, mental: 72 },
  { date: 'Day 28', score: 72, fitness: 62, nutrition: 75, mental: 75 },
];

export default function AIRecommendationsPanel() {
  const [recommendations, setRecommendations] = useState<RecommendationsData | null>(null);
  const [healthScore, setHealthScore] = useState<HealthScore | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'triage' | 'trends' | 'action-plan'>('overview');
  const [symptoms, setSymptoms] = useState('');
  const [triageResult, setTriageResult] = useState<TriageResult | null>(null);
  const [triageLoading, setTriageLoading] = useState(false);
  const [expandedRecs, setExpandedRecs] = useState<Set<number>>(new Set());

  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
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

      setToast({ message: '✨ AI analysis complete', type: 'success' });
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
      setToast({ message: '🏥 Triage analysis complete', type: 'success' });
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

  const toggleRecExpanded = (idx: number) => {
    const newSet = new Set(expandedRecs);
    if (newSet.has(idx)) {
      newSet.delete(idx);
    } else {
      newSet.add(idx);
    }
    setExpandedRecs(newSet);
  };

  const downloadReport = () => {
    const report = `
MediFlow Health Report
Generated: ${new Date().toLocaleString()}

HEALTH SCORE: ${healthScore?.score}/100
Status: ${healthScore?.status}

RECOMMENDATIONS:
${recommendations?.recommendations
  .map(
    (r) => `
- ${r.recommendation} [${r.priority.toUpperCase()}]
  Reason: ${r.reason}
  ${r.actionSteps ? `Steps:\n${r.actionSteps.map((s) => `  • ${s}`).join('\n')}` : ''}
`
  )
  .join('\n')}

RISK FACTORS:
${recommendations?.riskFactors?.map((r) => `- ${r}`).join('\n')}

Next Review: ${recommendations?.nextReviewDate}
    `;

    const blob = new Blob([report], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `health-report-${new Date().toISOString().split('T')[0]}.txt`;
    a.click();
  };

  if (loading) {
    return (
      <div className="p-6 bg-white rounded-lg shadow">
        <div className="flex items-center justify-center gap-3">
          <RefreshCw className="animate-spin text-blue-600" size={24} />
          <p className="text-gray-600">Analyzing your health data...</p>
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
          AI Health Intelligence
        </h2>
        <div className="flex gap-2">
          <button
            onClick={downloadReport}
            className="p-2 hover:bg-gray-100 rounded-lg transition"
            title="Download health report"
          >
            <Download size={20} className="text-gray-600" />
          </button>
          <button
            onClick={loadAllData}
            disabled={loading}
            className="p-2 hover:bg-gray-100 rounded-lg transition"
            title="Refresh analysis"
          >
            <RefreshCw size={20} className={loading ? 'animate-spin text-gray-400' : 'text-gray-600'} />
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 text-red-700 rounded-lg flex items-start gap-3">
          <AlertCircle size={20} className="flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-medium">Error Loading Analysis</p>
            <p className="text-sm">{error}</p>
          </div>
        </div>
      )}

      {/* Tab Navigation */}
      <div className="flex gap-2 border-b border-gray-200 bg-white rounded-lg p-1">
        {(['overview', 'triage', 'trends', 'action-plan'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 font-medium transition rounded capitalize ${
              activeTab === tab
                ? 'text-blue-600 bg-blue-50'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            {tab === 'action-plan' ? '📋 Action Plan' : tab === 'trends' ? '📈 Trends' : tab === 'triage' ? '🏥 Triage' : '👁️ Overview'}
          </button>
        ))}
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="space-y-4">
          {/* Health Score Card with Status */}
          {healthScore && (
            <div className={`p-6 rounded-lg border-2 ${getScoreBgColor(healthScore.score)} border-gray-200`}>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Overall Health Score</p>
                  <p className={`text-5xl font-bold ${getScoreColor(healthScore.score)}`}>
                    {healthScore.score}
                    <span className="text-lg text-gray-500">/100</span>
                  </p>
                  <p className="text-sm text-gray-600 mt-2">
                    Status: <span className="font-semibold">{healthScore.status}</span>
                    {healthScore.trend && (
                      <span className="ml-2">
                        {healthScore.trend === 'improving' && '📈 Improving'}
                        {healthScore.trend === 'stable' && '➡️ Stable'}
                        {healthScore.trend === 'declining' && '📉 Declining'}
                      </span>
                    )}
                  </p>
                </div>
                <Heart className={`${getScoreColor(healthScore.score)}`} size={64} />
              </div>

              {/* Score Breakdown with Progress Bars */}
              {healthScore?.scoreBreakdown && (
                <div className="space-y-3 mt-6">
                  <h4 className="font-semibold text-gray-900">Health Components</h4>
                  {[
                    { label: 'Fitness', value: healthScore.scoreBreakdown.fitness, colorClass: 'text-blue-600', bgClass: 'bg-blue-600' },
                    { label: 'Nutrition', value: healthScore.scoreBreakdown.nutrition, colorClass: 'text-purple-600', bgClass: 'bg-purple-600' },
                    { label: 'Mental Health', value: healthScore.scoreBreakdown.mentalHealth, colorClass: 'text-pink-600', bgClass: 'bg-pink-600' },
                    { label: 'Preventive Care', value: healthScore.scoreBreakdown.preventiveCare, colorClass: 'text-teal-600', bgClass: 'bg-teal-600' },
                  ].map((item) => (
                    <div key={item.label}>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm font-medium text-gray-700">{item.label}</span>
                        <span className={`text-sm font-bold ${item.colorClass}`}>
                          {item.value || 0}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className={`${styles.progressBar} ${styles[`progressBar_${Math.round((item.value || 0) / 5) * 5}`]} ${item.bgClass}`}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="bg-blue-50 p-4 rounded-lg">
              <Activity size={20} className="text-blue-600 mb-2" />
              <p className="text-xs text-gray-600">Fitness Level</p>
              <p className="text-2xl font-bold text-blue-600">{healthScore?.scoreBreakdown?.fitness || 0}%</p>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg">
              <Apple size={20} className="text-purple-600 mb-2" />
              <p className="text-xs text-gray-600">Nutrition</p>
              <p className="text-2xl font-bold text-purple-600">{healthScore?.scoreBreakdown?.nutrition || 0}%</p>
            </div>
            <div className="bg-pink-50 p-4 rounded-lg">
              <Brain size={20} className="text-pink-600 mb-2" />
              <p className="text-xs text-gray-600">Mental Health</p>
              <p className="text-2xl font-bold text-pink-600">{healthScore?.scoreBreakdown?.mentalHealth || 0}%</p>
            </div>
            <div className="bg-teal-50 p-4 rounded-lg">
              <CheckCircle size={20} className="text-teal-600 mb-2" />
              <p className="text-xs text-gray-600">Preventive Care</p>
              <p className="text-2xl font-bold text-teal-600">{healthScore?.scoreBreakdown?.preventiveCare || 0}%</p>
            </div>
          </div>

          {/* Personalized Recommendations with Action Steps */}
          {recommendations && (
            <>
              <div className="space-y-3">
                <h3 className="font-semibold text-lg flex items-center gap-2">
                  <Target size={20} className="text-blue-600" />
                  AI-Powered Recommendations ({recommendations.recommendations.length})
                </h3>
                {recommendations?.recommendations && recommendations.recommendations.length > 0 ? (
                  recommendations.recommendations.map((rec, idx) => (
                    <div
                      key={idx}
                      className={`p-4 rounded-lg border-l-4 cursor-pointer transition hover:shadow-md ${
                        rec.priority === 'high'
                          ? 'bg-red-50 border-red-400'
                          : rec.priority === 'medium'
                            ? 'bg-yellow-50 border-yellow-400'
                            : 'bg-green-50 border-green-400'
                      }`}
                      onClick={() => toggleRecExpanded(idx)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3 flex-1">
                          {rec.priority === 'high' ? (
                            <AlertTriangle className="text-red-600 flex-shrink-0 mt-1" size={20} />
                          ) : (
                            <CheckCircle className="text-green-600 flex-shrink-0 mt-1" size={20} />
                          )}
                          <div className="flex-1">
                            <p className="font-semibold text-gray-900">{rec.recommendation}</p>
                            <p className="text-sm text-gray-600 mt-1">{rec.reason}</p>
                            {rec.estimatedImpact && (
                              <p className="text-xs text-gray-500 mt-1">
                                Expected impact: <span className="font-medium">{rec.estimatedImpact}</span>
                              </p>
                            )}

                            {/* Action Steps - Expanded View */}
                            {expandedRecs.has(idx) && rec.actionSteps && (
                              <div className="mt-3 p-3 bg-white rounded border border-gray-200">
                                <p className="font-medium text-sm text-gray-900 mb-2">Action Steps:</p>
                                <ol className="space-y-1">
                                  {rec.actionSteps.map((step, stepIdx) => (
                                    <li key={stepIdx} className="text-sm text-gray-700">
                                      <span className="font-semibold text-gray-600">{stepIdx + 1}.</span> {step}
                                    </li>
                                  ))}
                                </ol>
                              </div>
                            )}
                          </div>
                        </div>
                        <span
                          className={`text-xs font-semibold px-3 py-1 rounded whitespace-nowrap flex-shrink-0 ${
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
                  ))
                ) : (
                  <p className="text-gray-500 italic">No recommendations at this time</p>
                )}
              </div>

              {/* Risk Alert Section */}
              {recommendations?.riskFactors && recommendations.riskFactors.length > 0 && (
                <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
                  <h4 className="font-semibold text-orange-900 mb-3 flex items-center gap-2">
                    <AlertTriangle size={18} />
                    ⚠️ Identified Health Risks
                  </h4>
                  <ul className="space-y-2">
                    {recommendations.riskFactors.map((risk, idx) => (
                      <li key={idx} className="text-sm text-orange-800 flex items-start gap-2">
                        <span className="font-bold">•</span> {risk}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* Trends Tab */}
      {activeTab === 'trends' && (
        <div className="space-y-4 bg-white rounded-lg p-4">
          <h3 className="font-semibold text-lg flex items-center gap-2">
            <TrendingUp size={20} className="text-green-600" />
            Health Score Trend (Last 28 Days)
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={HEALTH_TREND_DATA}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="score" stroke="#3b82f6" strokeWidth={2} name="Overall Score" />
              <Line type="monotone" dataKey="fitness" stroke="#3b82f6" strokeWidth={1} opacity={0.6} />
              <Line type="monotone" dataKey="nutrition" stroke="#8b5cf6" strokeWidth={1} opacity={0.6} />
              <Line type="monotone" dataKey="mental" stroke="#ec4899" strokeWidth={1} opacity={0.6} />
            </LineChart>
          </ResponsiveContainer>

          <div className="grid grid-cols-2 gap-3 mt-4">
            <div className="bg-blue-50 p-3 rounded">
              <p className="text-xs text-gray-600">28-Day Improvement</p>
              <p className="text-2xl font-bold text-blue-600">+12 pts</p>
            </div>
            <div className="bg-green-50 p-3 rounded">
              <p className="text-xs text-gray-600">Current Trend</p>
              <p className="text-2xl font-bold text-green-600">📈 Improving</p>
            </div>
          </div>
        </div>
      )}

      {/* Triage Tab */}
      {activeTab === 'triage' && (
        <div className="space-y-4 p-4 bg-white rounded-lg">
          <h3 className="font-semibold text-lg flex items-center gap-2">
            <AlertCircle size={20} className="text-blue-600" />
            Smart Symptom Analyzer
          </h3>
          <p className="text-sm text-gray-600">
            Describe your symptoms to get AI-powered department recommendations and guidance.
          </p>

          <textarea
            value={symptoms}
            onChange={(e) => setSymptoms(e.target.value)}
            placeholder="e.g., fever, cough, sore throat, fatigue"
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            rows={4}
          />

          <button
            onClick={handleTriage}
            disabled={triageLoading || !symptoms.trim()}
            className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition font-medium"
          >
            {triageLoading ? (
              <span className="flex items-center justify-center gap-2">
                <RefreshCw size={18} className="animate-spin" />
                Analyzing...
              </span>
            ) : (
              'Analyze Symptoms'
            )}
          </button>

          {triageResult && (
            <div className="p-4 bg-blue-50 rounded-lg border-l-4 border-blue-500 space-y-3">
              <h4 className="font-semibold text-blue-900">Analysis Result</h4>

              <div className="space-y-3">
                <div>
                  <p className="text-xs text-blue-700 font-semibold">🏥 Recommended Department</p>
                  <p className="text-2xl font-bold text-blue-600">{triageResult.department}</p>
                </div>

                <div>
                  <p className="text-xs text-blue-700 font-semibold">📋 Likely Condition</p>
                  <p className="text-lg text-gray-800 font-medium">{triageResult.label}</p>
                </div>

                <div>
                  <p className="text-xs text-blue-700 font-semibold">🎯 Confidence Level</p>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full bg-blue-600 ${
                          triageResult.confidence === 'high'
                            ? 'w-11/12'
                            : triageResult.confidence === 'medium'
                              ? 'w-7/12'
                              : 'w-6/12'
                        }`}
                      />
                    </div>
                    <span className="text-sm font-semibold text-gray-700 capitalize">{triageResult.confidence}</span>
                  </div>
                </div>

                <div className="p-3 bg-white rounded border border-blue-200">
                  <p className="text-sm text-gray-700">{triageResult.message}</p>
                </div>

                {triageResult.matchedSymptoms && triageResult.matchedSymptoms.length > 0 && (
                  <div>
                    <p className="text-xs text-blue-700 font-semibold mb-2">✓ Matched Symptoms</p>
                    <div className="flex flex-wrap gap-2">
                      {triageResult.matchedSymptoms.map((symptom, idx) => (
                        <span key={idx} className="bg-blue-200 text-blue-800 text-xs px-3 py-1 rounded-full font-medium">
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

      {/* Action Plan Tab */}
      {activeTab === 'action-plan' && (
        <div className="space-y-4 bg-white rounded-lg p-4">
          <h3 className="font-semibold text-lg flex items-center gap-2">
            <Calendar size={20} className="text-purple-600" />
            Personalized Health Action Plan
          </h3>

          {recommendations?.actionPlan && recommendations.actionPlan.length > 0 ? (
            <div className="space-y-3">
              {recommendations.actionPlan.map((plan, idx) => (
                <div key={idx} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="font-semibold text-gray-900">{plan.goal}</p>
                      <p className="text-sm text-gray-600">Timeline: {plan.timeline}</p>
                    </div>
                    <span className="bg-purple-100 text-purple-800 text-xs font-semibold px-3 py-1 rounded-full">
                      Goal {idx + 1}
                    </span>
                  </div>
                  <div className="space-y-2">
                    {plan.steps?.map((step, stepIdx) => (
                      <div key={stepIdx} className="flex items-start gap-3 ml-4">
                        <div className="w-6 h-6 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center text-sm font-bold flex-shrink-0">
                          {stepIdx + 1}
                        </div>
                        <p className="text-sm text-gray-700 pt-0.5">{step}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 italic">Action plan will be generated based on your recommendations</p>
          )}
        </div>
      )}

      {/* Footer */}
      <div className="text-xs text-gray-500 text-center p-3 bg-gray-50 rounded border border-gray-200">
        <p>🔄 Last updated: {recommendations?.generatedAt ? new Date(recommendations.generatedAt).toLocaleString() : 'Never'}</p>
        <p>📅 Next review: {recommendations?.nextReviewDate ? new Date(recommendations.nextReviewDate).toLocaleDateString() : 'Pending'}</p>
      </div>
    </div>
  );
}
