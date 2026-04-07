'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { recommendationsAPI, aiAPI, doctorsAPI, appointmentsAPI } from '@/services/api';
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
  healthLevel?: 'critical' | 'high' | 'moderate' | 'low';
}

interface Doctor {
  _id: string;
  firstName: string;
  lastName: string;
  specialization: string;
}

const HEALTH_TREND_DATA: HealthTrend[] = [
  { date: 'Day 1', score: 60, fitness: 50, nutrition: 65, mental: 65 },
  { date: 'Day 7', score: 62, fitness: 52, nutrition: 68, mental: 67 },
  { date: 'Day 14', score: 65, fitness: 55, nutrition: 70, mental: 70 },
  { date: 'Day 21', score: 68, fitness: 58, nutrition: 72, mental: 72 },
  { date: 'Day 28', score: 72, fitness: 62, nutrition: 75, mental: 75 },
];

// Role-based initial recommendations
const getRoleBasedRecommendations = (role?: string): RecommendationsData => {
  if (role === 'doctor') {
    return {
      recommendations: [
        {
          recommendation: 'Review pending appointment requests from patients',
          priority: 'high',
          reason: 'Multiple patients waiting for doctor availability',
          actionSteps: ['Check appointment requests', 'Confirm availability', 'Update schedule'],
          estimatedImpact: 'Improve patient satisfaction by 25%'
        },
        {
          recommendation: 'Analyze patient wait times for optimization',
          priority: 'medium',
          reason: 'Current average wait time is 15 minutes higher than target',
          actionSteps: ['Review daily schedule', 'Identify bottlenecks', 'Adjust time slots'],
          estimatedImpact: 'Reduce wait time by 20%'
        },
        {
          recommendation: 'Update patient medical records',
          priority: 'medium',
          reason: 'Several patient records need follow-up updates',
          actionSteps: ['Review recent appointments', 'Update medications', 'Add clinical notes'],
          estimatedImpact: 'Ensure medical records accuracy'
        }
      ],
      healthScore: 85,
      riskFactors: ['High patient load', 'Schedule conflicts'],
      priority: 'Optimize daily workflow and patient care',
      generatedAt: new Date().toISOString(),
      nextReviewDate: new Date(Date.now() + 86400000).toISOString(),
      actionPlan: [
        {
          goal: 'Reduce appointment wait time',
          timeline: '1 week',
          steps: ['Review current schedule', 'Adjust consultation duration', 'Monitor results']
        }
      ]
    };
  } else if (role === 'admin') {
    return {
      recommendations: [
        {
          recommendation: 'Review system health and performance metrics',
          priority: 'high',
          reason: 'Weekly system audit scheduled',
          actionSteps: ['Check database performance', 'Review API response times', 'Check error logs'],
          estimatedImpact: 'Ensure system reliability'
        },
        {
          recommendation: 'Manage user access and permissions',
          priority: 'medium',
          reason: 'New staff members need system access',
          actionSteps: ['Review access requests', 'Assign appropriate roles', 'Update security groups'],
          estimatedImpact: 'Improve security posture'
        },
        {
          recommendation: 'Generate monthly analytics report',
          priority: 'medium',
          reason: 'Monthly reporting deadline approaching',
          actionSteps: ['Compile usage statistics', 'Analyze trends', 'Create visualization'],
          estimatedImpact: 'Identify improvement areas'
        }
      ],
      healthScore: 92,
      riskFactors: ['Storage usage', 'Active user growth'],
      priority: 'Maintain system stability and security',
      generatedAt: new Date().toISOString(),
      nextReviewDate: new Date(Date.now() + 604800000).toISOString(),
      actionPlan: [
        {
          goal: 'Optimize database performance',
          timeline: '2 weeks',
          steps: ['Run performance tests', 'Index optimization', 'Cache configuration']
        }
      ]
    };
  }
  // Default patient recommendations
  return {
    recommendations: [
      {
        recommendation: 'Increase daily exercise to 30 minutes',
        priority: 'high',
        reason: 'Low fitness score detected from recent health assessment',
        actionSteps: ['Start with brisk walking', 'Gradually increase intensity', 'Track progress daily'],
        estimatedImpact: 'Improve fitness score by 15-20%'
      },
      {
        recommendation: 'Improve sleep quality and consistency',
        priority: 'high',
        reason: 'Sleep patterns show inconsistency',
        actionSteps: ['Set fixed sleep schedule', 'Reduce screen time', 'Create relaxing bedtime routine'],
        estimatedImpact: 'Increase sleep quality score by 25%'
      },
      {
        recommendation: 'Schedule preventive health checkup',
        priority: 'medium',
        reason: 'Annual checkup not performed in the last 6 months',
        actionSteps: ['Book appointment', 'Prepare medical history', 'Complete lab work'],
        estimatedImpact: 'Detect early health issues'
      }
    ],
    healthScore: 72,
    riskFactors: ['Low physical activity', 'Irregular sleep patterns', 'Stress levels'],
    priority: 'Improve overall wellness',
    generatedAt: new Date().toISOString(),
    nextReviewDate: new Date(Date.now() + 604800000).toISOString(),
    actionPlan: [
      {
        goal: 'Achieve health score of 85+',
        timeline: 'Next 30 days',
        steps: ['Daily exercise 30 mins', 'Sleep 8 hours', 'Weekly health check']
      }
    ]
  };
};

export default function AIRecommendationsPanel() {
  const { user } = useAuth();
  const [recommendations, setRecommendations] = useState<RecommendationsData | null>(null);
  const [healthScore, setHealthScore] = useState<HealthScore | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'ai-health' | 'health-graph' | 'action-plan'>('overview');
  const [symptoms, setSymptoms] = useState('');
  const [triageResult, setTriageResult] = useState<TriageResult | null>(null);
  const [triageLoading, setTriageLoading] = useState(false);
  const [expandedRecs, setExpandedRecs] = useState<Set<number>>(new Set());
  const [bookingDoctor, setBookingDoctor] = useState(false);
  const [appointmentBooked, setAppointmentBooked] = useState(false);
  const [bookedAppointment, setBookedAppointment] = useState<{
    doctorId: string;
    doctorName: string;
    date: string;
    time: string;
  } | null>(null);
  const [symptomTrendData, setSymptomTrendData] = useState<HealthTrend[]>(HEALTH_TREND_DATA);

  useEffect(() => {
    // Use role-based recommendations if user is doctor or admin
    if (user?.role === 'doctor' || user?.role === 'admin') {
      setRecommendations(getRoleBasedRecommendations(user?.role));
      setHealthScore({
        score: getRoleBasedRecommendations(user?.role).healthScore,
        status: 'Healthy',
        trend: 'improving'
      });
      setLoading(false);
    } else {
      // For patients, load from API
      loadAllData();
    }
  }, [user?.role]);

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
      const result = response.data.result;
      
      // Determine health severity level
      const healthLevel = result.confidence === 'high' ? 'critical' : result.confidence === 'medium' ? 'high' : 'moderate';
      setTriageResult({ ...result, healthLevel });
      
      // Update trend based on symptoms
      updateSymptomTrend(result.label, healthLevel);
      
      setToast({ message: '🏥 AI Health analysis complete - Ready to book doctor', type: 'success' });
    } catch (err) {
      const error = err as { response?: { data?: { error?: string } }; message?: string };
      const errorMsg = error.response?.data?.error || error.message || 'Analysis failed';
      setToast({ message: errorMsg, type: 'error' });
    } finally {
      setTriageLoading(false);
    }
  };

  // Update health graph based on symptoms and condition
  const updateSymptomTrend = (condition: string, healthLevel: string) => {
    const impactMap: { [key: string]: number } = {
      critical: -15,
      high: -10,
      moderate: -5,
      low: 0,
    };

    const newTrendData = HEALTH_TREND_DATA.map((data) => ({
      ...data,
      score: Math.max(30, data.score + impactMap[healthLevel]),
      fitness: Math.max(20, data.fitness + impactMap[healthLevel] / 2),
      nutrition: Math.max(20, data.nutrition + impactMap[healthLevel] / 3),
      mental: Math.max(20, data.mental + impactMap[healthLevel] / 2),
    }));

    setSymptomTrendData(newTrendData);
  };

  // Automatically book doctor based on triage results
  // Map triage department codes to database department names
  const mapDepartmentName = (triageDepartment: string): string => {
    const departmentMap: { [key: string]: string } = {
      'GENERAL_OPD': 'General Medicine',
      'GENERAL': 'General Medicine',
      'CARDIOLOGY': 'Cardiology',
      'PEDIATRICS': 'Pediatrics',
      'ORTHOPEDICS': 'Orthopedics',
      'DERMATOLOGY': 'Dermatology',
      'NEUROLOGY': 'Neurology',
      'PSYCHIATRY': 'Psychiatry',
      'ENT': 'ENT',
      'OPHTHALMOLOGY': 'Ophthalmology',
    };
    return departmentMap[triageDepartment?.toUpperCase()] || triageDepartment || 'General Medicine';
  };

  const handleAutoBookDoctor = async () => {
    if (!triageResult) {
      setToast({ message: 'Please complete AI Health analysis first', type: 'warning' });
      return;
    }

    setBookingDoctor(true);
    try {
      // Map triage department to database department name
      const mappedDepartment = mapDepartmentName(triageResult.department);
      const isEmergency = triageResult.healthLevel === 'critical' || triageResult.healthLevel === 'high';
      
      // Try to find doctors in the specific department first
      let doctorsResponse = await doctorsAPI.getAll({ department: mappedDepartment });
      let availableDoctors = doctorsResponse.data.data || [];

      // If no doctors found in department AND it's emergency/critical, get any available doctor
      if (availableDoctors.length === 0 && isEmergency) {
        console.warn(`⚠️ No doctors in ${mappedDepartment}, finding any available doctor for emergency`);
        doctorsResponse = await doctorsAPI.getAll();
        availableDoctors = doctorsResponse.data.data || [];
      }

      if (availableDoctors.length === 0) {
        setToast({ message: `No doctors available in ${mappedDepartment}. Please try again later.`, type: 'error' });
        setBookingDoctor(false);
        return;
      }

      // Pick first available doctor
      const selectedDoctor = availableDoctors[0] as Doctor;

      if (!selectedDoctor._id) {
        setToast({ message: 'Invalid doctor data. Please try again.', type: 'error' });
        setBookingDoctor(false);
        return;
      }

      // Get available slots for tomorrow (default)
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const appointmentDate = tomorrow.toISOString().split('T')[0];

      // Validate date is in the future
      if (new Date(appointmentDate) < new Date()) {
        setToast({ message: 'Appointment date must be in the future', type: 'error' });
        setBookingDoctor(false);
        return;
      }

      // For emergency/critical cases, prioritize early morning slots
      const startTime = isEmergency ? '08:00' : (triageResult.healthLevel === 'moderate' ? '10:00' : '11:00');
      const endTime = isEmergency ? '09:00' : (triageResult.healthLevel === 'moderate' ? '11:00' : '12:00');

      const appointmentData = {
        doctor: selectedDoctor._id,
        department: mappedDepartment,
        appointmentDate,
        startTime,
        endTime,
        reason: `AI Health Analysis (${triageResult.healthLevel?.toUpperCase()}): ${triageResult.label} - ${symptoms}`.substring(0, 500), // Limit reason length
        type: isEmergency ? 'emergency' : 'consultation',
      };

      console.log('📅 Booking appointment with data:', appointmentData);

      // Book appointment
      const bookingResponse = await appointmentsAPI.create(appointmentData);
      console.log('✅ Appointment booked successfully:', bookingResponse.data);

      // Set appointment as booked
      setBookedAppointment({
        doctorId: selectedDoctor._id,
        doctorName: `${selectedDoctor.firstName} ${selectedDoctor.lastName}`,
        date: appointmentDate,
        time: startTime,
      });

      setAppointmentBooked(true);
      const urgencyLabel = isEmergency ? '🚨 URGENT' : '✅';
      setToast({
        message: `${urgencyLabel} Appointment booked with Dr. ${selectedDoctor.firstName} ${selectedDoctor.lastName} at ${startTime}`,
        type: 'success',
      });

      // Auto-redirect to action plan after 2 seconds
      setTimeout(() => {
        setActiveTab('action-plan');
      }, 2000);
    } catch (err) {
      console.error('❌ Doctor Booking Error:', err);
      
      // Extract error details with better handling
      const error = err as { 
        response?: { 
          status?: number;
          data?: { 
            message?: string;
            success?: boolean;
          } 
        }; 
        message?: string;
        code?: string;
      };

      let errorMsg = 'Failed to book appointment';
      
      if (error.response?.data?.message) {
        errorMsg = error.response.data.message;
      } else if (error.response?.status === 400) {
        errorMsg = 'Invalid appointment data or time slot already booked. Please try a different time.';
      } else if (error.response?.status === 404) {
        errorMsg = 'Selected doctor not found. Please try again.';
      } else if (error.response?.status === 403) {
        errorMsg = 'You are not authorized to book this appointment.';
      } else if (error.message) {
        errorMsg = error.message;
      }

      console.error('Error Details:', { 
        status: error.response?.status,
        message: error.response?.data?.message,
        fullError: error 
      });
      
      setToast({ message: `❌ ${errorMsg}`, type: 'error' });
    } finally {
      setBookingDoctor(false);
    }
  };

  // Reset the AI Health form
  const handleReset = () => {
    setSymptoms('');
    setTriageResult(null);
    setAppointmentBooked(false);
    setBookedAppointment(null);
    setSymptomTrendData(HEALTH_TREND_DATA);
    setToast({ message: 'AI Health section reset', type: 'info' });
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
        {(['overview', 'ai-health', 'health-graph', 'action-plan'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 font-medium transition rounded capitalize ${
              activeTab === tab
                ? 'text-blue-600 bg-blue-50'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            {tab === 'action-plan' ? '📋 Action Plan' : tab === 'health-graph' ? '📈 Health Graph' : tab === 'ai-health' ? '🏥 AI Health' : '👁️ Overview'}
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
                <h3 className="font-semibold text-lg text-gray-900 flex items-center gap-2">
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

      {/* AI Health Tab */}
      {activeTab === 'ai-health' && (
        <div className="space-y-4 p-4 bg-white rounded-lg">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="font-semibold text-lg text-gray-900 flex items-center gap-2">
                <AlertCircle size={20} className="text-blue-600" />
                AI Health Analysis
              </h3>
              <p className="text-sm text-gray-900 mt-1">Describe symptoms to get AI analysis & automatic doctor booking</p>
            </div>
            {appointmentBooked && (
              <button
                onClick={handleReset}
                className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition"
              >
                <RefreshCw size={16} />
                Reset
              </button>
            )}
          </div>

          {!appointmentBooked ? (
            <>
              <textarea
                value={symptoms}
                onChange={(e) => setSymptoms(e.target.value)}
                placeholder="e.g., fever, cough, sore throat, body ache, fatigue"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-black placeholder-gray-500"
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
                  '🔍 Analyze Symptoms'
                )}
              </button>
            </>
          ) : null}

          {triageResult && (
            <>
              <div className={`p-4 rounded-lg border space-y-4 ${
                triageResult.healthLevel === 'critical' ? 'bg-red-50 border-red-200' :
                triageResult.healthLevel === 'high' ? 'bg-orange-50 border-orange-200' :
                triageResult.healthLevel === 'moderate' ? 'bg-yellow-50 border-yellow-200' :
                'bg-green-50 border-green-200'
              }`}>
                <div className="flex items-start justify-between">
                  <h4 className="font-semibold text-lg text-gray-900">Analysis: {triageResult.label}</h4>
                  <span className={`text-xs font-bold px-3 py-1 rounded text-white ${
                    triageResult.healthLevel === 'critical' ? 'bg-red-600' :
                    triageResult.healthLevel === 'high' ? 'bg-orange-600' :
                    triageResult.healthLevel === 'moderate' ? 'bg-yellow-600' : 'bg-green-600'
                  }`}>
                    {triageResult.healthLevel?.toUpperCase()}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-white p-3 rounded border">
                    <p className="text-xs font-semibold text-gray-900">Department</p>
                    <p className="text-lg font-bold text-gray-900">{triageResult.department}</p>
                  </div>
                  <div className="bg-white p-3 rounded border">
                    <p className="text-xs font-semibold text-gray-900">Confidence</p>
                    <p className="text-lg font-bold text-gray-900">{triageResult.confidence}</p>
                  </div>
                </div>

                <div className="p-3 bg-white rounded border text-sm text-gray-900">
                  {triageResult.message}
                </div>

                {triageResult.matchedSymptoms && triageResult.matchedSymptoms.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold text-gray-900 mb-2">✓ Matched Symptoms</p>
                    <div className="flex flex-wrap gap-2">
                      {triageResult.matchedSymptoms.map((symptom, idx) => (
                        <span key={idx} className="bg-blue-200 text-blue-800 text-xs px-3 py-1 rounded-full font-medium">
                          {symptom}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {!appointmentBooked && (
                  <button
                    onClick={handleAutoBookDoctor}
                    disabled={bookingDoctor}
                    className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 disabled:bg-gray-400 transition font-semibold flex items-center justify-center gap-2"
                  >
                    {bookingDoctor ? (
                      <>
                        <RefreshCw size={18} className="animate-spin" />
                        Booking Doctor...
                      </>
                    ) : (
                      <>
                        <Calendar size={18} />
                        Book Doctor Automatically
                      </>
                    )}
                  </button>
                )}
              </div>

              {appointmentBooked && bookedAppointment && (
                <div className="p-4 bg-green-50 rounded-lg border-2 border-green-400 space-y-3">
                  <h4 className="font-semibold text-green-900 flex items-center gap-2">
                    <CheckCircle size={20} className="text-green-600" />
                    ✅ Doctor Booked Successfully!
                  </h4>
                  <div className="space-y-2 text-sm text-gray-900">
                    <p><strong>Doctor:</strong> Dr. {bookedAppointment.doctorName}</p>
                    <p><strong>Date:</strong> {bookedAppointment.date}</p>
                    <p><strong>Time:</strong> {bookedAppointment.time}</p>
                  </div>
                  <button
                    onClick={() => setActiveTab('action-plan')}
                    className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition font-semibold"
                  >
                    View Action Plan →
                  </button>
                  <button
                    onClick={handleReset}
                    className="w-full bg-gray-100 text-gray-700 py-2 rounded-lg hover:bg-gray-200 transition font-semibold"
                  >
                    Start New Analysis
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* Health Graph Tab */}
      {activeTab === 'health-graph' && (
        <div className="space-y-4 bg-white rounded-lg p-4">
          <h3 className="font-semibold text-lg text-gray-900 flex items-center gap-2">
            <TrendingUp size={20} className="text-green-600" />
            Health Graph {triageResult && ` - Based on: ${triageResult.label}`}
          </h3>

          {triageResult ? (
            <div className="space-y-4">
              <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-sm text-gray-900">
                  <span className="font-semibold">Current Condition:</span> {triageResult.label} ({triageResult.healthLevel?.toUpperCase()})
                </p>
                <p className="text-sm text-gray-900 mt-1">Health graph adjusted based on your symptoms and severity</p>
              </div>

              <ResponsiveContainer width="100%" height={350}>
                <LineChart data={symptomTrendData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis domain={[0, 100]} />
                  <Tooltip formatter={(value) => `${value}/100`} />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="score"
                    stroke="#3b82f6"
                    strokeWidth={3}
                    name="Overall Health"
                    dot={{ r: 5 }}
                  />
                  <Line type="monotone" dataKey="fitness" stroke="#8b5cf6" strokeWidth={2} name="Fitness" opacity={0.7} />
                  <Line type="monotone" dataKey="nutrition" stroke="#ec4899" strokeWidth={2} name="Nutrition" opacity={0.7} />
                  <Line type="monotone" dataKey="mental" stroke="#f59e0b" strokeWidth={2} name="Mental Health" opacity={0.7} />
                </LineChart>
              </ResponsiveContainer>

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-red-50 p-3 rounded border border-red-200">
                  <p className="text-xs text-gray-900">Health Impact</p>
                  <p className="text-2xl font-bold text-red-600">
                    {triageResult.healthLevel === 'critical' ? '-15' : triageResult.healthLevel === 'high' ? '-10' : '-5'}
                  </p>
                  <p className="text-xs text-gray-900 mt-1">points</p>
                </div>
                <div className="bg-green-50 p-3 rounded border border-green-200">
                  <p className="text-xs text-gray-900">Recovery Trend</p>
                  <p className="text-2xl font-bold text-green-600">📈</p>
                  <p className="text-xs text-gray-900 mt-1">Improving with treatment</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-6 text-center bg-gray-50 rounded-lg">
              <AlertCircle size={32} className="text-gray-400 mx-auto mb-2" />
              <p className="text-gray-600">Complete AI Health analysis to see personalized health graph</p>
              <button
                onClick={() => setActiveTab('ai-health')}
                className="mt-3 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                Go to AI Health Analysis
              </button>
            </div>
          )}
        </div>
      )}

      {/* Action Plan Tab */}
      {activeTab === 'action-plan' && (
        <div className="space-y-4 bg-white rounded-lg p-4">
          <div className="flex justify-between items-center">
            <h3 className="font-semibold text-lg text-gray-900 flex items-center gap-2">
              <Calendar size={20} className="text-purple-600" />
              Action Plan {appointmentBooked && '& Doctor Instructions'}
            </h3>
            {appointmentBooked && (
              <div className="flex items-center gap-2 text-green-600 text-sm font-semibold">
                <CheckCircle size={16} />
                Doctor Appointment Confirmed
              </div>
            )}
          </div>

          {appointmentBooked && bookedAppointment && (
            <div className="p-4 bg-green-50 rounded-lg border-l-4 border-green-500 space-y-3">
              <h4 className="font-semibold text-gray-900">Doctor Appointment Details</h4>
              <div className="grid grid-cols-3 gap-3 text-sm">
                <div>
                  <p className="text-xs text-gray-900">Assigned Doctor</p>
                  <p className="font-bold text-gray-900">Dr. {bookedAppointment.doctorName.split(' ').pop()}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-900">Date & Time</p>
                  <p className="font-bold text-gray-900">{bookedAppointment.date} @ {bookedAppointment.time}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-900">Condition</p>
                  <p className="font-bold text-gray-900">{triageResult?.label || 'Consultation'}</p>
                </div>
              </div>
            </div>
          )}

          {recommendations?.actionPlan && recommendations.actionPlan.length > 0 ? (
            <div className="space-y-3">
              {recommendations.actionPlan.map((plan, idx) => (
                <div key={idx} className="border-2 border-gray-200 rounded-lg p-4 hover:shadow-md transition">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="font-semibold text-gray-900 text-lg">{plan.goal}</p>
                      <p className="text-sm text-gray-900">Timeline: {plan.timeline}</p>
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
                        <p className="text-sm text-gray-900 pt-0.5">{step}</p>
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
      <div className="text-xs text-gray-700 text-center p-3 bg-gray-50 rounded border border-gray-200">
        <p>🔄 Last updated: {recommendations?.generatedAt ? new Date(recommendations.generatedAt).toLocaleString() : 'Never'}</p>
        <p>📅 Next review: {recommendations?.nextReviewDate ? new Date(recommendations.nextReviewDate).toLocaleDateString() : 'Pending'}</p>
      </div>
    </div>
  );
}
