'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import Navbar from '@/components/Navbar';
import Sidebar from '@/components/Sidebar';
import Toast, { ToastType } from '@/components/Toast';
import { queueAPI, appointmentsAPI } from '@/services/api';
import { Clock, User, Calendar, CheckCircle, AlertCircle, Users } from 'lucide-react';
import io from 'socket.io-client';

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
  status: string;
}

interface QueueStatus {
  _id: string;
  tokenNumber: number;
  position: number;
  estimatedWaitTime: number;
  status: string;
  checkInTime: string;
  doctor: {
    firstName: string;
    lastName: string;
    specialization: string;
  };
}

export default function QueueStatusPage() {
  const { user } = useAuth();
  const [todayAppointments, setTodayAppointments] = useState<Appointment[]>([]);
  const [queueStatus, setQueueStatus] = useState<QueueStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [checkingIn, setCheckingIn] = useState(false);
  const [checkedInAppointmentId, setCheckedInAppointmentId] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null);

  useEffect(() => {
    fetchTodayAppointments();
    fetchQueueStatus();

    // Setup Socket.IO
    const newSocket = io(process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:5000');

    if (user?.id) {
      newSocket.emit('joinPatientRoom', user.id);

      newSocket.on('patientCalled', () => {
        setToast({ message: 'You are being called! Please proceed to the consultation room.', type: 'success' });
        fetchQueueStatus();
      });
    }

    return () => {
      newSocket.close();
    };
  }, [user]);

  const fetchTodayAppointments = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const response = await appointmentsAPI.getAll({ date: today, status: 'scheduled' });
      setTodayAppointments(response.data.data);
    } catch (error) {
      console.error('Failed to fetch appointments:', error);
    }
  };

  const fetchQueueStatus = async () => {
    setLoading(true);
    try {
      const response = await queueAPI.getPatientStatus();
      setQueueStatus(response.data.data);
    } catch (error) {
      console.error('Failed to fetch queue status:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCheckIn = async (appointmentId: string) => {
    setCheckingIn(true);
    try {
      console.log('Checking in for appointment:', appointmentId);
      const response = await queueAPI.checkIn(appointmentId);
      console.log('Check-in response:', response.data);
      setCheckedInAppointmentId(appointmentId);
      setQueueStatus(response.data.data);
      setToast({ message: 'Checked in successfully! Your queue position is: ' + response.data.data.position, type: 'success' });
    } catch (error: unknown) {
      console.error('Check-in error:', error);
      const err = error as { response?: { data?: { message?: string } } };
      setToast({
        message: err.response?.data?.message || 'Failed to check in',
        type: 'error',
      });
    } finally {
      setCheckingIn(false);
    }
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <Navbar user={user} />
        <div className="flex">
          <Sidebar role={user?.role || 'patient'} />
          <main className="flex-1 p-8">
            <div className="max-w-4xl mx-auto">
              {/* Header */}
              <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Queue Status</h1>
                <p className="text-gray-600 mt-2">Check in for your appointment and track your position</p>
              </div>

              {/* Current Queue Status */}
              {queueStatus ? (
                <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl shadow-xl p-8 text-white mb-8">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h2 className="text-2xl font-bold mb-2">You&apos;re in the queue!</h2>
                      <p className="text-blue-100">
                        Dr. {queueStatus.doctor?.firstName || 'N/A'} {queueStatus.doctor?.lastName || ''}
                      </p>
                    </div>
                    <div className="text-center">
                      <div className="text-5xl font-bold mb-1">{queueStatus.tokenNumber}</div>
                      <div className="text-sm text-blue-100">Token Number</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm">
                      <div className="flex items-center space-x-3">
                        <Users className="w-8 h-8" />
                        <div>
                          <div className="text-3xl font-bold">{queueStatus.position}</div>
                          <div className="text-sm text-blue-100">Position in Queue</div>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm">
                      <div className="flex items-center space-x-3">
                        <Clock className="w-8 h-8" />
                        <div>
                          <div className="text-3xl font-bold">{queueStatus.estimatedWaitTime}</div>
                          <div className="text-sm text-blue-100">Minutes (Est.)</div>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm">
                      <div className="flex items-center space-x-3">
                        {queueStatus.status === 'waiting' ? (
                          <Clock className="w-8 h-8" />
                        ) : (
                          <CheckCircle className="w-8 h-8" />
                        )}
                        <div>
                          <div className="text-xl font-semibold capitalize">{queueStatus.status}</div>
                          <div className="text-sm text-blue-100">Current Status</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {queueStatus.status === 'in-progress' && (
                    <div className="mt-6 bg-green-500/20 border border-green-300 rounded-lg p-4">
                      <div className="flex items-center space-x-3">
                        <AlertCircle className="w-6 h-6 text-green-100" />
                        <p className="font-semibold">Please proceed to the consultation room!</p>
                      </div>
                    </div>
                  )}

                  <div className="mt-4 text-sm text-blue-100">
                    Checked in at {new Date(queueStatus.checkInTime).toLocaleTimeString()}
                  </div>
                </div>
              ) : (
                <div className="bg-white rounded-lg shadow-md p-8 text-center mb-8">
                  <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Not in Queue</h3>
                  <p className="text-gray-600">Check in for your appointment to join the queue</p>
                </div>
              )}

              {/* Today's Appointments */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Today&apos;s Appointments</h3>

                {loading ? (
                  <div className="flex justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  </div>
                ) : todayAppointments.length === 0 ? (
                  <div className="text-center py-8">
                    <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-600">No appointments scheduled for today</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {todayAppointments.map((appointment) => (
                      <div
                        key={appointment._id}
                        className="border border-gray-200 rounded-lg p-4 flex items-center justify-between hover:shadow-md transition"
                      >
                        <div className="flex items-center space-x-4">
                          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                            <User className="w-6 h-6 text-blue-600" />
                          </div>
                          <div>
                            <h4 className="font-semibold text-gray-900">
                              Dr. {appointment.doctor?.firstName || 'N/A'} {appointment.doctor?.lastName || ''}
                            </h4>
                            <p className="text-sm text-gray-600">{appointment.doctor?.specialization || 'Not assigned'}</p>
                            <div className="flex items-center space-x-4 mt-1 text-sm text-gray-500">
                              <span className="flex items-center">
                                <Clock className="w-4 h-4 mr-1" />
                                {appointment.startTime}
                              </span>
                              <span
                                className={`px-2 py-1 rounded-full text-xs font-semibold ${
                                  appointment.status === 'scheduled'
                                    ? 'bg-blue-100 text-blue-800'
                                    : 'bg-green-100 text-green-800'
                                }`}
                              >
                                {appointment.status}
                              </span>
                            </div>
                          </div>
                        </div>

                        {appointment.status === 'scheduled' && checkedInAppointmentId !== appointment._id && (
                          <button
                            onClick={() => handleCheckIn(appointment._id)}
                            disabled={checkingIn}
                            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {checkingIn ? 'Checking in...' : 'Check In'}
                          </button>
                        )}

                        {checkedInAppointmentId === appointment._id && queueStatus && (
                          <div className="text-center">
                            <span className="px-4 py-2 bg-green-100 text-green-800 rounded-lg font-semibold block mb-2">
                              Checked In
                            </span>
                            <span className="text-sm font-bold text-blue-600">Position: #{queueStatus.position}</span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </main>
        </div>
      </div>
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </ProtectedRoute>
  );
}
