'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import Navbar from '@/components/Navbar';
import Sidebar from '@/components/Sidebar';
import Toast, { ToastType } from '@/components/Toast';
import AppointmentCalendar from '@/components/AppointmentCalendar';
import { appointmentsAPI, doctorsAPI } from '@/services/api';
import { Calendar, Clock, User, FileText, X, AlertCircle, RefreshCw, List, CalendarDays } from 'lucide-react';
import Link from 'next/link';

interface Appointment {
  _id: string;
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
  status: string;
  createdAt: string;
}

interface TimeSlot {
  startTime: string;
  endTime: string;
  isAvailable: boolean;
}

export default function AppointmentsPage() {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [rescheduleModal, setRescheduleModal] = useState<{
    show: boolean;
    appointment: Appointment | null;
  }>({
    show: false,
    appointment: null,
  });
  const [rescheduleDate, setRescheduleDate] = useState('');
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [rescheduleReason, setRescheduleReason] = useState('');
  const [rescheduling, setRescheduling] = useState(false);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null);
  const [cancelModal, setCancelModal] = useState<{ show: boolean; appointmentId: string | null }>({
    show: false,
    appointmentId: null,
  });
  const [cancelReason, setCancelReason] = useState('');
  const [cancelling, setCancelling] = useState(false);
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');

  useEffect(() => {
    fetchAppointments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);

  const fetchAppointments = async () => {
    setLoading(true);
    try {
      const params = filter !== 'all' ? { status: filter } : {};
      const response = await appointmentsAPI.getAll(params);
      setAppointments(response.data.data);
    } catch (error) {
      console.error('Failed to fetch appointments:', error);
      setToast({ message: 'Failed to load appointments', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleCancelAppointment = async () => {
    if (!cancelModal.appointmentId || !cancelReason.trim()) {
      setToast({ message: 'Please provide a reason for cancellation', type: 'error' });
      return;
    }

    setCancelling(true);
    try {
      await appointmentsAPI.cancel(cancelModal.appointmentId, cancelReason);
      setToast({ message: 'Appointment cancelled successfully', type: 'success' });
      setCancelModal({ show: false, appointmentId: null });
      setCancelReason('');
      fetchAppointments();
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      setToast({
        message: err.response?.data?.message || 'Failed to cancel appointment',
        type: 'error',
      });
    } finally {
      setCancelling(false);
    }
  };

  const handleRescheduleClick = (appointment: Appointment) => {
    setRescheduleModal({ show: true, appointment });
    // Set minimum date to tomorrow
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    setRescheduleDate(tomorrow.toISOString().split('T')[0]);
  };

  const fetchAvailability = async (doctorId: string, date: string) => {
    setLoadingSlots(true);
    try {
      const response = await doctorsAPI.getAvailability(doctorId, date);
      setAvailableSlots(response.data.data.availableSlots || []);
    } catch (error) {
      console.error('Failed to fetch availability:', error);
      setAvailableSlots([]);
    } finally {
      setLoadingSlots(false);
    }
  };

  const handleDateChange = (date: string) => {
    setRescheduleDate(date);
    setSelectedSlot(null);
    if (rescheduleModal.appointment) {
      fetchAvailability(rescheduleModal.appointment.doctor._id, date);
    }
  };

  const handleRescheduleAppointment = async () => {
    if (!rescheduleModal.appointment || !rescheduleDate || !selectedSlot || !rescheduleReason.trim()) {
      setToast({ message: 'Please fill all required fields', type: 'error' });
      return;
    }

    setRescheduling(true);
    try {
      await appointmentsAPI.reschedule(rescheduleModal.appointment._id, {
        appointmentDate: rescheduleDate,
        startTime: selectedSlot.startTime,
        endTime: selectedSlot.endTime,
        reason: rescheduleReason,
      });

      setToast({ message: 'Appointment rescheduled successfully', type: 'success' });
      setRescheduleModal({ show: false, appointment: null });
      setRescheduleDate('');
      setSelectedSlot(null);
      setRescheduleReason('');
      setAvailableSlots([]);
      fetchAppointments();
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      setToast({
        message: err.response?.data?.message || 'Failed to reschedule appointment',
        type: 'error',
      });
    } finally {
      setRescheduling(false);
    }
  };

  const closeRescheduleModal = () => {
    setRescheduleModal({ show: false, appointment: null });
    setRescheduleDate('');
    setSelectedSlot(null);
    setRescheduleReason('');
    setAvailableSlots([]);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled':
        return 'bg-blue-100 text-blue-800';
      case 'confirmed':
        return 'bg-green-100 text-green-800';
      case 'completed':
        return 'bg-gray-100 text-gray-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'rescheduled':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const canModify = (appointment: Appointment) => {
    return ['scheduled', 'confirmed'].includes(appointment.status);
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <Navbar user={user} />
        <div className="flex">
          <Sidebar role={user?.role || 'patient'} />
          <main className="flex-1 p-8">
            <div className="max-w-6xl mx-auto">
              {/* Header */}
              <div className="flex justify-between items-center mb-8">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">My Appointments</h1>
                  <p className="text-gray-600 mt-2">View and manage your appointments</p>
                </div>
                <Link
                  href="/patient/book-appointment"
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold"
                >
                  Book New Appointment
                </Link>
              </div>

              {/* Filters */}
              <div className="bg-white rounded-lg shadow-md p-4 mb-6">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-3 md:space-y-0">
                  <div className="flex flex-wrap gap-3">
                    {['all', 'scheduled', 'confirmed', 'completed', 'cancelled'].map((status) => (
                      <button
                        key={status}
                        onClick={() => setFilter(status)}
                        className={`px-4 py-2 rounded-lg font-medium transition capitalize ${
                          filter === status
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {status}
                      </button>
                    ))}
                  </div>

                  {/* View Toggle */}
                  <div className="flex items-center space-x-2 bg-gray-100 rounded-lg p-1">
                    <button
                      onClick={() => setViewMode('list')}
                      className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition ${
                        viewMode === 'list'
                          ? 'bg-white text-blue-600 shadow-sm'
                          : 'text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      <List className="w-4 h-4" />
                      <span>List</span>
                    </button>
                    <button
                      onClick={() => setViewMode('calendar')}
                      className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition ${
                        viewMode === 'calendar'
                          ? 'bg-white text-blue-600 shadow-sm'
                          : 'text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      <CalendarDays className="w-4 h-4" />
                      <span>Calendar</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Appointments List or Calendar */}
              {loading ? (
                <div className="flex justify-center items-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                </div>
              ) : appointments.length === 0 ? (
                <div className="bg-white rounded-lg shadow-md p-12 text-center">
                  <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">No appointments found</h3>
                  <p className="text-gray-600 mb-6">
                    {filter === 'all'
                      ? "You haven't booked any appointments yet"
                      : `No ${filter} appointments`}
                  </p>
                  <Link
                    href="/patient/book-appointment"
                    className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold"
                  >
                    Book Your First Appointment
                  </Link>
                </div>
              ) : viewMode === 'calendar' ? (
                <AppointmentCalendar
                  appointments={appointments}
                  onAppointmentClick={(appointment) => {
                    // Show appointment details or open actions
                    console.log('Clicked appointment:', appointment);
                  }}
                />
              ) : (
                <div className="space-y-4">
                  {appointments.map((appointment) => (
                    <div
                      key={appointment._id}
                      className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition"
                    >
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-3">
                            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                              <User className="w-6 h-6 text-blue-600" />
                            </div>
                            <div>
                              <h3 className="text-lg font-semibold text-gray-900">
                                Dr. {appointment.doctor.firstName} {appointment.doctor.lastName}
                              </h3>
                              <p className="text-sm text-gray-600">{appointment.doctor.specialization}</p>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                            <div className="flex items-center">
                              <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                              {new Date(appointment.appointmentDate).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric',
                              })}
                            </div>
                            <div className="flex items-center">
                              <Clock className="w-4 h-4 mr-2 text-gray-400" />
                              {appointment.startTime} - {appointment.endTime}
                            </div>
                            <div>
                              <span
                                className={`px-3 py-1 rounded-full text-xs font-semibold capitalize ${getStatusColor(
                                  appointment.status
                                )}`}
                              >
                                {appointment.status}
                              </span>
                            </div>
                          </div>

                          {appointment.reason && (
                            <div className="mt-3 flex items-start">
                              <FileText className="w-4 h-4 mr-2 text-gray-400 mt-0.5" />
                              <p className="text-sm text-gray-600">{appointment.reason}</p>
                            </div>
                          )}
                        </div>

                        <div className="mt-4 md:mt-0 md:ml-6 flex flex-col space-y-2">
                          {canModify(appointment) && (
                            <>
                              <button
                                onClick={() => handleRescheduleClick(appointment)}
                                className="px-4 py-2 border border-blue-300 text-blue-600 rounded-lg hover:bg-blue-50 transition font-medium text-sm flex items-center justify-center"
                              >
                                <RefreshCw className="w-4 h-4 mr-2" />
                                Reschedule
                              </button>
                              <button
                                onClick={() =>
                                  setCancelModal({ show: true, appointmentId: appointment._id })
                                }
                                className="px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition font-medium text-sm"
                              >
                                Cancel
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </main>
        </div>
      </div>

      {/* Cancel Modal */}
      {cancelModal.show && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="bg-red-100 p-2 rounded-lg">
                  <AlertCircle className="w-6 h-6 text-red-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900">Cancel Appointment</h3>
              </div>
              <button
                onClick={() => {
                  setCancelModal({ show: false, appointmentId: null });
                  setCancelReason('');
                }}
                title="Close"
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <p className="text-gray-600 mb-4">
              Please provide a reason for cancelling this appointment:
            </p>

            <textarea
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              placeholder="Enter cancellation reason..."
              rows={4}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent mb-4 text-gray-900 font-medium placeholder-gray-400"
            />

            <div className="flex space-x-3">
              <button
                onClick={() => {
                  setCancelModal({ show: false, appointmentId: null });
                  setCancelReason('');
                }}
                className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium"
              >
                Keep Appointment
              </button>
              <button
                onClick={handleCancelAppointment}
                disabled={cancelling || !cancelReason.trim()}
                className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {cancelling ? 'Cancelling...' : 'Yes, Cancel'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reschedule Modal */}
      {rescheduleModal.show && rescheduleModal.appointment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full p-6 my-8">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <div className="bg-blue-100 p-2 rounded-lg">
                  <RefreshCw className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900">Reschedule Appointment</h3>
              </div>
              <button
                onClick={closeRescheduleModal}
                title="Close"
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Current Appointment Info */}
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <h4 className="font-semibold text-gray-900 mb-2">Current Appointment</h4>
              <p className="text-sm text-gray-600">
                Dr. {rescheduleModal.appointment.doctor.firstName}{' '}
                {rescheduleModal.appointment.doctor.lastName}
              </p>
              <p className="text-sm text-gray-600">
                {new Date(rescheduleModal.appointment.appointmentDate).toLocaleDateString()} at{' '}
                {rescheduleModal.appointment.startTime}
              </p>
            </div>

            {/* New Date Selection */}
            <div className="mb-6">
              <label htmlFor="reschedule-date-input" className="block text-sm font-medium text-gray-700 mb-2">
                Select New Date <span className="text-red-500">*</span>
              </label>
              <input
                id="reschedule-date-input"
                type="date"
                value={rescheduleDate}
                onChange={(e) => handleDateChange(e.target.value)}
                min={new Date(Date.now() + 86400000).toISOString().split('T')[0]}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 font-medium"
              />
            </div>

            {/* Time Slots */}
            {rescheduleDate && (
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Time Slot <span className="text-red-500">*</span>
                </label>
                {loadingSlots ? (
                  <div className="flex justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  </div>
                ) : availableSlots.length === 0 ? (
                  <p className="text-gray-600 text-center py-4">No available slots for this date</p>
                ) : (
                  <div className="grid grid-cols-3 md:grid-cols-4 gap-3 max-h-48 overflow-y-auto">
                    {availableSlots.map((slot, index) => (
                      <button
                        key={index}
                        onClick={() => setSelectedSlot(slot)}
                        disabled={!slot.isAvailable}
                        className={`px-4 py-3 rounded-lg text-sm font-medium transition ${
                          selectedSlot?.startTime === slot.startTime
                            ? 'bg-blue-600 text-white'
                            : slot.isAvailable
                            ? 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                            : 'bg-gray-50 text-gray-400 cursor-not-allowed'
                        }`}
                      >
                        {slot.startTime}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Reason */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Reason for Rescheduling <span className="text-red-500">*</span>
              </label>
              <textarea
                value={rescheduleReason}
                onChange={(e) => setRescheduleReason(e.target.value)}
                placeholder="Please provide a reason for rescheduling..."
                rows={3}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 font-medium placeholder-gray-400"
              />
            </div>

            {/* Actions */}
            <div className="flex space-x-3">
              <button
                onClick={closeRescheduleModal}
                className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleRescheduleAppointment}
                disabled={
                  rescheduling ||
                  !rescheduleDate ||
                  !selectedSlot ||
                  !rescheduleReason.trim()
                }
                className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {rescheduling ? 'Rescheduling...' : 'Confirm Reschedule'}
              </button>
            </div>
          </div>
        </div>
      )}

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </ProtectedRoute>
  );
}
