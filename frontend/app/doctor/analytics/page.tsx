'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import Navbar from '@/components/Navbar';
import Sidebar from '@/components/Sidebar';
import Toast, { ToastType } from '@/components/Toast';
import { doctorsAPI } from '@/services/api';
import { BarChart3, Users, Clock, TrendingUp, CheckCircle, Calendar } from 'lucide-react';

interface Analytics {
  allTime: {
    totalAppointments: number;
    completedAppointments: number;
    completionRate: string | number;
    uniquePatients: number;
    averageRating: number;
    noShowRate: string | number;
  };
  thisMonth: {
    appointments: number;
    completed: number;
    cancelled: number;
    completionRate: string | number;
  };
  today: {
    completed: number;
    waiting: number;
    totalToday: number;
  };
  performance: {
    averageConsultationMinutes: number;
    averageRating: number;
    noShowRate: string | number;
  };
}

interface StatCard {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  subtext?: string;
  color: string;
}

export default function DoctorAnalyticsPage() {
  const { user } = useAuth();
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null);

  const fetchAnalytics = useCallback(async () => {
    try {
      setLoading(true);
      const response = await doctorsAPI.getAnalytics(user?.id || '');
      setAnalytics(response.data.data);
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
      setToast({ message: 'Failed to load analytics', type: 'error' });
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    if (user?.id) {
      fetchAnalytics();
    }
  }, [user?.id, fetchAnalytics]);

  const renderStatCard = ({ icon, label, value, subtext, color }: StatCard) => (
    <div className={`bg-white rounded-lg shadow-md p-6 border-l-4 ${color}`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-gray-600 mb-1">{label}</p>
          <p className="text-3xl font-bold text-gray-900">{value}</p>
          {subtext && <p className="text-xs text-gray-600 mt-2">{subtext}</p>}
        </div>
        <div className={`${color.replace('border-l-4', 'bg-').replace('700', '100')} p-3 rounded-lg`}>
          {icon}
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <ProtectedRoute allowedRoles={['doctor']}>
        <div className="min-h-screen bg-gray-50">
          <Navbar user={user} />
          <Sidebar role="doctor" />
          <div className="ml-0 md:ml-64 pt-20 p-4 md:p-8">
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              <p className="mt-4 text-gray-600">Loading analytics...</p>
            </div>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  if (!analytics) {
    return (
      <ProtectedRoute allowedRoles={['doctor']}>
        <div className="min-h-screen bg-gray-50">
          <Navbar user={user} />
          <Sidebar role="doctor" />
          <div className="ml-0 md:ml-64 pt-20 p-4 md:p-8">
            <div className="bg-white rounded-lg shadow-md p-12 text-center">
              <p className="text-gray-600 text-lg">Failed to load analytics</p>
            </div>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute allowedRoles={['doctor']}>
      <div className="min-h-screen bg-gray-50">
        <Navbar user={user} />
        <Sidebar role="doctor" />

        <div className="ml-0 md:ml-64 pt-20 p-4 md:p-8">
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-4xl font-bold text-gray-900 mb-2">Performance Analytics</h1>
              <p className="text-gray-600">Track your professional statistics and performance metrics</p>
            </div>

            {/* All-Time Statistics */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">All-Time Statistics</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {renderStatCard({
                  icon: <CheckCircle className="h-6 w-6 text-blue-600" />,
                  label: 'Total Appointments',
                  value: analytics.allTime.totalAppointments,
                  color: 'border-l-4 border-blue-700',
                })}
                {renderStatCard({
                  icon: <TrendingUp className="h-6 w-6 text-green-600" />,
                  label: 'Completed Appointments',
                  value: analytics.allTime.completedAppointments,
                  subtext: `${analytics.allTime.completionRate}% completion rate`,
                  color: 'border-l-4 border-green-700',
                })}
                {renderStatCard({
                  icon: <Users className="h-6 w-6 text-purple-600" />,
                  label: 'Unique Patients',
                  value: analytics.allTime.uniquePatients,
                  color: 'border-l-4 border-purple-700',
                })}
                {renderStatCard({
                  icon: <BarChart3 className="h-6 w-6 text-yellow-600" />,
                  label: 'Average Rating',
                  value: analytics.allTime.averageRating.toFixed(2),
                  subtext: 'Out of 5 stars',
                  color: 'border-l-4 border-yellow-700',
                })}
                {renderStatCard({
                  icon: <Calendar className="h-6 w-6 text-red-600" />,
                  label: 'No-Show Rate',
                  value: `${analytics.allTime.noShowRate}%`,
                  subtext: 'Patients who missed appointments',
                  color: 'border-l-4 border-red-700',
                })}
              </div>
            </div>

            {/* This Month Statistics */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">This Month</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {renderStatCard({
                  icon: <CheckCircle className="h-6 w-6 text-blue-600" />,
                  label: 'Appointments',
                  value: analytics.thisMonth.appointments,
                  color: 'border-l-4 border-blue-700',
                })}
                {renderStatCard({
                  icon: <TrendingUp className="h-6 w-6 text-green-600" />,
                  label: 'Completed',
                  value: analytics.thisMonth.completed,
                  subtext: `${analytics.thisMonth.completionRate}% completion`,
                  color: 'border-l-4 border-green-700',
                })}
                {renderStatCard({
                  icon: <Calendar className="h-6 w-6 text-orange-600" />,
                  label: 'Cancelled',
                  value: analytics.thisMonth.cancelled,
                  color: 'border-l-4 border-orange-700',
                })}
              </div>
            </div>

            {/* Today Statistics */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Today</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {renderStatCard({
                  icon: <CheckCircle className="h-6 w-6 text-green-600" />,
                  label: 'Completed Consultations',
                  value: analytics.today.completed,
                  color: 'border-l-4 border-green-700',
                })}
                {renderStatCard({
                  icon: <Clock className="h-6 w-6 text-orange-600" />,
                  label: 'Waiting',
                  value: analytics.today.waiting,
                  color: 'border-l-4 border-orange-700',
                })}
                {renderStatCard({
                  icon: <Users className="h-6 w-6 text-blue-600" />,
                  label: 'Total Patients',
                  value: analytics.today.totalToday,
                  color: 'border-l-4 border-blue-700',
                })}
              </div>
            </div>

            {/* Performance Metrics */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Performance Metrics</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="border border-gray-200 rounded-lg p-4">
                  <p className="text-sm text-gray-600 mb-2">Average Consultation Duration</p>
                  <p className="text-3xl font-bold text-gray-900">
                    {analytics.performance.averageConsultationMinutes}
                  </p>
                  <p className="text-xs text-gray-600 mt-2">minutes per consultation</p>
                </div>
                <div className="border border-gray-200 rounded-lg p-4">
                  <p className="text-sm text-gray-600 mb-2">Average Rating</p>
                  <p className="text-3xl font-bold text-gray-900">
                    {analytics.performance.averageRating.toFixed(2)}
                  </p>
                  <p className="text-xs text-gray-600 mt-2">out of 5 stars from {analytics.allTime.totalAppointments} appointments</p>
                </div>
                <div className="border border-gray-200 rounded-lg p-4">
                  <p className="text-sm text-gray-600 mb-2">No-Show Rate</p>
                  <p className="text-3xl font-bold text-gray-900">
                    {analytics.performance.noShowRate}%
                  </p>
                  <p className="text-xs text-gray-600 mt-2">patients who missed scheduled appointments</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {toast && (
          <Toast
            message={toast.message}
            type={toast.type}
            onClose={() => setToast(null)}
          />
        )}
      </div>
    </ProtectedRoute>
  );
}
