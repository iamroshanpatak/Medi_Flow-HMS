'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import Navbar from '@/components/Navbar';
import Sidebar from '@/components/Sidebar';
import Toast, { ToastType } from '@/components/Toast';
import { doctorsAPI } from '@/services/api';
import { useTranslation } from '@/hooks/useTranslation';
import { Calendar, Clock, PhoneIcon, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

interface Appointment {
  _id: string;
  patient: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    dateOfBirth: string;
    gender: string;
  };
  appointmentDate: string;
  startTime: string;
  endTime: string;
  reason: string;
  status: 'scheduled' | 'confirmed' | 'in-progress' | 'completed' | 'cancelled' | 'no-show' | 'rescheduled';
  type: string;
  notes?: string;
}

export default function DoctorAppointmentsPage() {
  const { user } = useAuth();
  const { t } = useTranslation();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterDate, setFilterDate] = useState('');

  const fetchAppointments = useCallback(async () => {
    try {
      setLoading(true);
      const params: Record<string, string> = {};
      if (filterStatus !== 'all') params.status = filterStatus;
      if (filterDate) params.date = filterDate;

      const response = await doctorsAPI.getAppointments(user?.id || '', params);
      setAppointments(response.data.data);
    } catch (error) {
      console.error('Failed to fetch appointments:', error);
      setToast({ message: 'Failed to load appointments', type: 'error' });
    } finally {
      setLoading(false);
    }
  }, [user?.id, filterStatus, filterDate]);

  useEffect(() => {
    if (user?.id) {
      fetchAppointments();
    }
  }, [user?.id, filterStatus, filterDate, fetchAppointments]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'scheduled':
      case 'confirmed':
        return 'bg-blue-100 text-blue-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'no-show':
        return 'bg-orange-100 text-orange-800';
      case 'in-progress':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4" />;
      case 'cancelled':
      case 'no-show':
        return <XCircle className="h-4 w-4" />;
      default:
        return <AlertCircle className="h-4 w-4" />;
    }
  };

  const handleStatusFilter = (status: string) => {
    setFilterStatus(status);
  };

  return (
    <ProtectedRoute allowedRoles={['doctor']}>
      <div className="min-h-screen bg-gray-50">
        <Navbar user={user} />
        <Sidebar role="doctor" />

        <div className="ml-0 md:ml-64 pt-8 p-2 md:p-4">
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="mb-1">
              <h1 className="text-2xl font-bold text-gray-900 mb-1">{t('nav.appointments')}</h1>
              <p className="text-xs text-gray-600">
                {t('common.total')}: {appointments.length} {t('nav.appointments')}
              </p>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-lg shadow-md p-3 mb-2">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="statusFilter" className="block text-sm font-medium text-gray-900 mb-2 font-semibold">
                    Status Filter
                  </label>
                  <select
                    id="statusFilter"
                    value={filterStatus}
                    onChange={(e) => handleStatusFilter(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 font-medium"
                  >
                    <option value="all">All Statuses</option>
                    <option value="scheduled">Scheduled</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="in-progress">In Progress</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                    <option value="no-show">No Show</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="filterDate" className="block text-sm font-medium text-gray-900 mb-2 font-semibold">
                    Filter by Date
                  </label>
                  <input
                    id="filterDate"
                    type="date"
                    value={filterDate}
                    onChange={(e) => setFilterDate(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 font-medium"
                  />
                </div>
              </div>
            </div>

            {/* Appointments List */}
            {loading ? (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                <p className="mt-4 text-gray-600">Loading appointments...</p>
              </div>
            ) : appointments.length === 0 ? (
              <div className="bg-white rounded-lg shadow-md p-12 text-center">
                <Calendar className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-600 text-lg">No appointments found</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {appointments.map((apt) => (
                  <div key={apt._id} className="bg-white rounded-lg shadow-md hover:shadow-lg transition p-6">
                    {/* Status and Header at Top */}
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4 pb-4 border-b border-gray-200">
                      <div>
                        <p className="text-lg font-bold text-gray-900">
                          {apt.patient.firstName} {apt.patient.lastName}
                        </p>
                        <div className="flex items-center gap-1 text-sm text-gray-600 mt-1">
                          <PhoneIcon className="h-4 w-4" />
                          {apt.patient.phone}
                        </div>
                      </div>
                      <div className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold ${getStatusColor(apt.status)}`}>
                        {getStatusIcon(apt.status)}
                        <span className="capitalize">{apt.status.replace('-', ' ')}</span>
                      </div>
                    </div>

                    {/* Details Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {/* Date & Time */}
                      <div>
                        <p className="text-sm font-semibold text-gray-900 mb-1">Date & Time</p>
                        <div className="flex items-center gap-2 text-gray-700 font-medium">
                          <Calendar className="h-4 w-4 text-blue-600" />
                          {new Date(apt.appointmentDate).toLocaleDateString()}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600 mt-2">
                          <Clock className="h-4 w-4" />
                          {apt.startTime} - {apt.endTime}
                        </div>
                      </div>

                      {/* Reason */}
                      <div>
                        <p className="text-sm font-semibold text-gray-900 mb-1">Reason</p>
                        <p className="text-gray-700 font-medium">{apt.reason}</p>
                        <p className="text-xs text-gray-600 mt-2">Type: {apt.type}</p>
                      </div>

                      {/* Notes */}
                      <div>
                        <p className="text-sm font-semibold text-gray-900 mb-1">Notes</p>
                        {apt.notes ? (
                          <p className="text-gray-700 text-sm">{apt.notes}</p>
                        ) : (
                          <p className="text-gray-500 text-sm italic">No notes</p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
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
