'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import Navbar from '@/components/Navbar';
import Sidebar from '@/components/Sidebar';
import Toast, { ToastType } from '@/components/Toast';
import { Calendar, Search, Filter, Trash2, X } from 'lucide-react';
import { appointmentsAPI } from '@/services/api';

interface Appointment {
  _id: string;
  patient: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
  };
  doctor: {
    _id: string;
    firstName: string;
    lastName: string;
    specialization: string;
  };
  appointmentDate: string;
  startTime: string;
  endTime: string;
  reason: string;
  status: 'scheduled' | 'confirmed' | 'in-progress' | 'completed' | 'cancelled' | 'no-show';
  appointmentType: string;
  createdAt: string;
}

export default function AdminAppointmentsPage() {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [filteredAppointments, setFilteredAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<string>('all');
  const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [selectedAppt, setSelectedAppt] = useState<Appointment | null>(null);
  const [cancelReason, setCancelReason] = useState('');

  useEffect(() => {
    fetchAppointments();
  }, []);

  useEffect(() => {
    filterAppointments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [appointments, searchTerm, statusFilter, dateFilter]);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const response = await appointmentsAPI.getAll();
      setAppointments(response.data.data || []);
    } catch (error) {
      console.error('Failed to fetch appointments:', error);
      setToast({ message: 'Failed to fetch appointments', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const filterAppointments = () => {
    let filtered = [...appointments];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (a) =>
          a.patient.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          a.patient.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          a.doctor.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          a.doctor.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          a.patient.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter((a) => a.status === statusFilter);
    }

    // Date filter
    if (dateFilter !== 'all') {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      filtered = filtered.filter((a) => {
        const apptDate = new Date(a.appointmentDate);
        apptDate.setHours(0, 0, 0, 0);

        if (dateFilter === 'today') {
          return apptDate.getTime() === today.getTime();
        } else if (dateFilter === 'upcoming') {
          return apptDate.getTime() >= today.getTime();
        } else if (dateFilter === 'past') {
          return apptDate.getTime() < today.getTime();
        }
        return true;
      });
    }

    setFilteredAppointments(filtered);
  };

  const handleCancelAppointment = async (appointment: Appointment) => {
    setSelectedAppt(appointment);
    setShowCancelModal(true);
  };

  const confirmCancel = async () => {
    if (!selectedAppt) return;

    try {
      await appointmentsAPI.cancel(selectedAppt._id, cancelReason || 'Cancelled by admin');
      setAppointments(appointments.filter((a) => a._id !== selectedAppt._id));
      setToast({ message: 'Appointment cancelled successfully', type: 'success' });
      setShowCancelModal(false);
      setCancelReason('');
      setSelectedAppt(null);
    } catch (error) {
      console.error('Failed to cancel appointment:', error);
      setToast({ message: 'Failed to cancel appointment', type: 'error' });
    }
  };

  const handleDeleteAppointment = async (appointmentId: string) => {
    if (!confirm('Are you sure you want to permanently delete this appointment?')) return;

    try {
      // Using delete endpoint (admin only)
      await appointmentsAPI.cancel(appointmentId, 'Deleted by admin');
      setAppointments(appointments.filter((a) => a._id !== appointmentId));
      setToast({ message: 'Appointment deleted successfully', type: 'success' });
    } catch (error) {
      console.error('Failed to delete appointment:', error);
      setToast({ message: 'Failed to delete appointment', type: 'error' });
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'scheduled':
        return 'bg-blue-100 text-blue-800';
      case 'confirmed':
        return 'bg-green-100 text-green-800';
      case 'in-progress':
        return 'bg-yellow-100 text-yellow-800';
      case 'completed':
        return 'bg-purple-100 text-purple-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'no-show':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const stats = {
    total: appointments.length,
    today: appointments.filter((a) => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const apptDate = new Date(a.appointmentDate);
      apptDate.setHours(0, 0, 0, 0);
      return apptDate.getTime() === today.getTime();
    }).length,
    completed: appointments.filter((a) => a.status === 'completed').length,
    cancelled: appointments.filter((a) => a.status === 'cancelled').length,
  };

  return (
    <ProtectedRoute allowedRoles={['admin']}>
      <div className="min-h-screen bg-gray-50">
        <Navbar user={user} />
        <div className="flex">
          <Sidebar role="admin" />
          <main className="flex-1 p-8">
            <div className="max-w-7xl mx-auto">
              {/* Header */}
              <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                  <Calendar className="w-8 h-8 mr-3 text-pink-600" />
                  Appointment Management
                </h1>
                <p className="text-gray-600 mt-2">Manage all system appointments</p>
              </div>

              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <div className="bg-white p-6 rounded-lg shadow-md">
                  <p className="text-sm text-gray-600 mb-1">Total Appointments</p>
                  <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-md">
                  <p className="text-sm text-gray-600 mb-1">Today - Appointments</p>
                  <p className="text-3xl font-bold text-blue-600">{stats.today}</p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-md">
                  <p className="text-sm text-gray-600 mb-1">Completed</p>
                  <p className="text-3xl font-bold text-green-600">{stats.completed}</p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-md">
                  <p className="text-sm text-gray-600 mb-1">Cancelled</p>
                  <p className="text-3xl font-bold text-red-600">{stats.cancelled}</p>
                </div>
              </div>

              {/* Search and Filters */}
              <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="text"
                      placeholder="Search by patient, doctor, or email..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent text-black"
                    />
                  </div>
                  <div className="relative">
                    <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      title="Filter by status"
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent appearance-none text-black"
                    >
                      <option value="all">All Status</option>
                      <option value="scheduled">Scheduled</option>
                      <option value="confirmed">Confirmed</option>
                      <option value="in-progress">In Progress</option>
                      <option value="completed">Completed</option>
                      <option value="cancelled">Cancelled</option>
                      <option value="no-show">No Show</option>
                    </select>
                  </div>
                  <div className="relative">
                    <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <select
                      value={dateFilter}
                      onChange={(e) => setDateFilter(e.target.value)}
                      title="Filter by date"
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent appearance-none text-black"
                    >
                      <option value="all">All Dates</option>
                      <option value="today">Today</option>
                      <option value="upcoming">Upcoming</option>
                      <option value="past">Past</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Appointments Table */}
              <div className="bg-white rounded-lg shadow-md overflow-hidden">
                {loading ? (
                  <div className="p-8 text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600 mx-auto"></div>
                    <p className="text-gray-600 mt-4">Loading appointments...</p>
                  </div>
                ) : filteredAppointments.length === 0 ? (
                  <div className="p-8 text-center text-gray-600">
                    <Calendar className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                    <p>No appointments found</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50 border-b">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Patient
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Doctor
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Date & Time
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Reason
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Status
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {filteredAppointments.map((appointment) => (
                          <tr key={appointment._id} className="hover:bg-gray-50">
                            <td className="px-6 py-4">
                              <div>
                                <div className="text-sm font-medium text-gray-900">
                                  {appointment.patient.firstName} {appointment.patient.lastName}
                                </div>
                                <div className="text-sm text-gray-500">{appointment.patient.email}</div>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div>
                                <div className="text-sm font-medium text-gray-900">
                                  Dr. {appointment.doctor.firstName} {appointment.doctor.lastName}
                                </div>
                                <div className="text-sm text-gray-500">{appointment.doctor.specialization}</div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">
                                {new Date(appointment.appointmentDate).toLocaleDateString()}
                              </div>
                              <div className="text-sm text-gray-500">
                                {appointment.startTime} - {appointment.endTime}
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="text-sm text-gray-900">{appointment.reason}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span
                                className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full capitalize ${getStatusBadgeColor(
                                  appointment.status
                                )}`}
                              >
                                {appointment.status}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              {appointment.status !== 'cancelled' && appointment.status !== 'completed' && (
                                <button
                                  onClick={() => handleCancelAppointment(appointment)}
                                  title="Cancel appointment"
                                  className="text-orange-600 hover:text-orange-900 mr-4"
                                >
                                  <X className="w-4 h-4" />
                                </button>
                              )}
                              <button
                                onClick={() => handleDeleteAppointment(appointment._id)}
                                title="Delete appointment"
                                className="text-red-600 hover:text-red-900"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </main>
        </div>
      </div>

      {/* Cancel Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Cancel Appointment</h3>
            <p className="text-gray-600 mb-4">
              Are you sure you want to cancel this appointment for{' '}
              <strong>
                {selectedAppt?.patient.firstName} {selectedAppt?.patient.lastName}
              </strong>
              ?
            </p>
            <textarea
              placeholder="Reason for cancellation (optional)"
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent mb-4"
              rows={3}
            />
            <div className="flex gap-4">
              <button
                onClick={() => {
                  setShowCancelModal(false);
                  setCancelReason('');
                }}
                className="flex-1 px-4 py-2 bg-gray-300 text-gray-900 rounded-lg hover:bg-gray-400 font-semibold"
              >
                Keep Appointment
              </button>
              <button
                onClick={confirmCancel}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-semibold"
              >
                Cancel Appointment
              </button>
            </div>
          </div>
        </div>
      )}

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </ProtectedRoute>
  );
}
