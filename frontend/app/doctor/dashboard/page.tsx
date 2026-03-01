'use client';

import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Sidebar from '@/components/Sidebar';
import { StatCard, InfoCard } from '@/components/Card';
import Toast, { ToastType } from '@/components/Toast';
import { appointmentsAPI } from '@/services/api';
import { Calendar, Users, Activity, CheckCircle } from 'lucide-react';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';

interface Appointment {
  _id: string;
  patient: {
    firstName: string;
    lastName: string;
    phone: string;
  };
  appointmentDate: string;
  startTime: string;
  endTime: string;
  reason: string;
  status: string;
  type: string;
}

interface ScheduleItemProps {
  appointment: Appointment;
  onComplete: (id: string) => void;
}

interface QueueItemProps {
  tokenNumber: string;
  patient: string;
  waitTime: string;
  status: string;
}

export default function DoctorDashboard() {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [stats, setStats] = useState({
    total: 0,
    completed: 0,
    pending: 0,
    cancelled: 0,
  });
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null);

  useEffect(() => {
    fetchTodaysAppointments();
  }, []);

  const fetchTodaysAppointments = async () => {
    try {
      setLoading(true);
      const today = new Date().toISOString().split('T')[0];
      const response = await appointmentsAPI.getAll({ date: today });
      const allAppointments = response.data.data;
      
      setAppointments(allAppointments);

      // Calculate stats
      const newStats = {
        total: allAppointments.length,
        completed: allAppointments.filter((a: Appointment) => a.status === 'completed').length,
        pending: allAppointments.filter((a: Appointment) =>
          ['scheduled', 'confirmed'].includes(a.status)
        ).length,
        cancelled: allAppointments.filter((a: Appointment) => a.status === 'cancelled').length,
      };
      setStats(newStats);
    } catch (error) {
      console.error('Failed to fetch appointments:', error);
      setToast({ message: 'Failed to load appointments', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteAppointment = async (id: string) => {
    try {
      await appointmentsAPI.complete(id, {});
      setToast({ message: 'Appointment marked as completed', type: 'success' });
      fetchTodaysAppointments();
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      setToast({
        message: err.response?.data?.message || 'Failed to complete appointment',
        type: 'error',
      });
    }
  };

  const upcomingAppointments = appointments
    .filter(apt => ['scheduled', 'confirmed'].includes(apt.status))
    .slice(0, 4);

  return (
    <ProtectedRoute allowedRoles={['doctor']}>
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50">
        <Navbar user={user} />
        <div className="flex">
          <Sidebar role="doctor" />
          <main className="flex-1 p-4 sm:p-6 lg:p-8 pb-24 md:pb-8">
            <div className="max-w-7xl mx-auto">
              {/* Header */}
              <div className="mb-8 relative">
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-600 to-teal-600 rounded-3xl blur-3xl opacity-10"></div>
                <div className="relative">
                  <h1 className="text-3xl sm:text-4xl font-extrabold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                    Good morning, Dr. {user?.firstName} {user?.lastName}! 👨‍⚕️
                  </h1>
                  <p className="text-base sm:text-lg text-gray-600 mt-3 font-medium">
                    Here&apos;s your schedule for today
                  </p>
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
                <StatCard
                  title="Today's Appointments"
                  value={stats.total.toString()}
                  icon={Calendar}
                  trend={{ value: `${stats.pending} pending`, isPositive: true }}
                />
                <StatCard
                  title="Completed"
                  value={stats.completed.toString()}
                  icon={CheckCircle}
                  trend={{ value: `${stats.cancelled} cancelled`, isPositive: false }}
                />
                <StatCard
                  title="Patients This Month"
                  value="145"
                  icon={Users}
                  trend={{ value: '+12 this week', isPositive: true }}
                />
                <StatCard
                  title="Avg Consultation"
                  value="18 min"
                  icon={Activity}
                />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                {/* Today's Schedule */}
                <InfoCard
                  title="Today's Schedule"
                  action={
                    <Link
                      href="/doctor/appointments"
                      className="text-sm text-primary-600 hover:text-primary-700 font-medium"
                    >
                      View All
                    </Link>
                  }
                >
                  {loading ? (
                    <div className="flex justify-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    </div>
                  ) : upcomingAppointments.length === 0 ? (
                    <p className="text-gray-500 text-center py-8">No upcoming appointments today</p>
                  ) : (
                    <div className="space-y-4">
                      {upcomingAppointments.map((appointment) => (
                        <ScheduleItem
                          key={appointment._id}
                          appointment={appointment}
                          onComplete={handleCompleteAppointment}
                        />
                      ))}
                    </div>
                  )}
                </InfoCard>

                {/* Current Queue */}
                <InfoCard
                  title="Current Queue"
                  action={
                    <Link
                      href="/doctor/queue"
                      className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 text-sm font-medium"
                    >
                      Manage Queue
                    </Link>
                  }
                >
                  <div className="space-y-4">
                    <QueueItem
                      tokenNumber="T-001"
                      patient="Alice Johnson"
                      waitTime="5 min"
                      status="Next"
                    />
                    <QueueItem
                      tokenNumber="T-002"
                      patient="Bob Wilson"
                      waitTime="15 min"
                      status="Waiting"
                    />
                    <QueueItem
                      tokenNumber="T-003"
                      patient="Carol Davis"
                      waitTime="25 min"
                      status="Waiting"
                    />
                  </div>
                </InfoCard>
              </div>

              {/* Quick Stats */}
              <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="group relative bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl shadow-lg border border-green-100 p-6 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300">
                  <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-emerald-500/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <h4 className="relative text-sm font-bold text-gray-600 mb-2 uppercase tracking-wide">Completed Today</h4>
                  <p className="relative text-4xl font-extrabold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">{stats.completed}</p>
                  <p className="relative text-sm text-gray-600 mt-2 font-medium">Out of {stats.total} appointments</p>
                </div>
                <div className="group relative bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl shadow-lg border border-blue-100 p-6 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300">
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-cyan-500/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <h4 className="relative text-sm font-bold text-gray-600 mb-2 uppercase tracking-wide">Pending</h4>
                  <p className="relative text-4xl font-extrabold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">{stats.pending}</p>
                  <p className="relative text-sm text-gray-600 mt-2 font-medium">Remaining today</p>
                </div>
                <div className="group relative bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl shadow-lg border border-purple-100 p-6 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300">
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-pink-500/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <h4 className="relative text-sm font-bold text-gray-600 mb-2 uppercase tracking-wide">Patient Satisfaction</h4>
                  <p className="relative text-4xl font-extrabold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">4.8</p>
                  <p className="relative text-sm text-gray-600 mt-2 font-medium">Based on 142 reviews</p>
                </div>
              </div>
            </div>
          </main>
        </div>
        {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      </div>
    </ProtectedRoute>
  );
}

function ScheduleItem({ appointment, onComplete }: ScheduleItemProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800 ring-1 ring-green-200';
      case 'confirmed':
        return 'bg-blue-100 text-blue-800 ring-1 ring-blue-200';
      case 'scheduled':
        return 'bg-gray-100 text-gray-800 ring-1 ring-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 ring-1 ring-gray-200';
    }
  };

  return (
    <div className="group relative flex items-center justify-between p-4 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl hover:shadow-lg transition-all duration-300 hover:-translate-y-1 cursor-pointer border border-emerald-100">
      <div className="flex items-center space-x-4 flex-1">
        <div className="relative w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
          <span className="text-white font-bold text-lg">
            {appointment.patient.firstName.charAt(0)}
          </span>
          <div className="absolute inset-0 bg-emerald-400 rounded-xl blur-lg opacity-40 group-hover:opacity-60 transition-opacity"></div>
        </div>
        <div>
          <p className="font-bold text-gray-900">
            {appointment.patient.firstName} {appointment.patient.lastName}
          </p>
          <p className="text-sm text-gray-600 capitalize flex items-center gap-1">
            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span>
            {appointment.type}
          </p>
        </div>
      </div>
      <div className="text-right flex items-center space-x-3">
        <div>
          <p className="text-sm font-bold text-gray-900">{appointment.startTime}</p>
          <span
            className={`text-xs px-3 py-1 rounded-full capitalize font-semibold ${getStatusColor(
              appointment.status
            )}`}
          >
            {appointment.status}
          </span>
        </div>
        {appointment.status !== 'completed' && (
          <button
            onClick={() => onComplete(appointment._id)}
            className="p-2 text-green-600 hover:bg-green-100 rounded-xl transition-all duration-200 hover:scale-110"
            title="Mark as completed"
          >
            <CheckCircle className="w-5 h-5" />
          </button>
        )}
      </div>
    </div>
  );
}

function QueueItem({ tokenNumber, patient, waitTime, status }: QueueItemProps) {
  return (
    <div className="group relative flex items-center justify-between p-4 border-l-4 border-gradient-to-b from-emerald-500 to-teal-600 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl hover:shadow-lg transition-all duration-300 hover:-translate-x-1">
      <div>
        <p className="font-extrabold text-lg bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">{tokenNumber}</p>
        <p className="font-bold text-gray-900 mt-1">{patient}</p>
        <p className="text-sm text-gray-600 font-medium mt-1">⏱️ Wait: {waitTime}</p>
      </div>
      <span
        className={`px-4 py-2 rounded-xl text-sm font-bold shadow-md ${
          status === 'Next' 
            ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white ring-2 ring-green-200' 
            : 'bg-gradient-to-r from-gray-100 to-gray-200 text-gray-800 ring-1 ring-gray-300'
        }`}
      >
        {status}
      </span>
    </div>
  );
}
