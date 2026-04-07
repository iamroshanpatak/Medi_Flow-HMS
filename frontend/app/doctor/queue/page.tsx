'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import Navbar from '@/components/Navbar';
import Sidebar from '@/components/Sidebar';
import Toast, { ToastType } from '@/components/Toast';
import { queueAPI } from '@/services/api';
import { Users, Clock, CheckCircle, User, Phone, Play } from 'lucide-react';
import io from 'socket.io-client';

interface QueueEntry {
  _id: string;
  patient: {
    firstName: string;
    lastName: string;
    phone: string;
  };
  tokenNumber: number;
  position: number;
  status: string;
  type: string;
  checkInTime: string;
  estimatedWaitTime: number;
}

export default function DoctorQueuePage() {
  const { user } = useAuth();
  const [queue, setQueue] = useState<QueueEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null);
  const [processing, setProcessing] = useState<string | null>(null);

  useEffect(() => {
    fetchQueue();

    // Setup Socket.IO
    const newSocket = io(process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:5001');

    if (user?.id) {
      newSocket.emit('joinDoctorQueue', user.id);

      newSocket.on('queueUpdate', () => {
        fetchQueue();
      });
    }

    return () => {
      newSocket.close();
    };
  }, [user]);

  const fetchQueue = async () => {
    setLoading(true);
    try {
      const response = await queueAPI.getAll({ status: 'waiting,in-progress' });
      setQueue(response.data.data);
    } catch (error) {
      console.error('Failed to fetch queue:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCallNext = async (queueId: string) => {
    setProcessing(queueId);
    try {
      await queueAPI.callNext(queueId);
      setToast({ message: 'Patient called successfully', type: 'success' });
      fetchQueue();
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      setToast({
        message: err.response?.data?.message || 'Failed to call patient',
        type: 'error',
      });
    } finally {
      setProcessing(null);
    }
  };

  const handleComplete = async (queueId: string) => {
    setProcessing(queueId);
    try {
      await queueAPI.complete(queueId);
      setToast({ message: 'Consultation completed', type: 'success' });
      fetchQueue();
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      setToast({
        message: err.response?.data?.message || 'Failed to complete consultation',
        type: 'error',
      });
    } finally {
      setProcessing(null);
    }
  };

  const handleCompleteAndNext = async (currentQueueId: string) => {
    setProcessing(currentQueueId);
    try {
      // Complete current patient
      await queueAPI.complete(currentQueueId);
      
      // Get updated queue
      const response = await queueAPI.getAll({ status: 'waiting,in-progress' });
      const updatedQueue = response.data.data;
      setQueue(updatedQueue);
      
      // Call next waiting patient if any
      const nextWaiting = updatedQueue.find((q: QueueEntry) => q.status === 'waiting');
      if (nextWaiting) {
        await queueAPI.callNext(nextWaiting._id);
        setToast({ message: 'Patient consultation completed. Next patient called!', type: 'success' });
      } else {
        setToast({ message: 'Patient consultation completed. No more patients waiting.', type: 'success' });
      }
      
      fetchQueue();
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      setToast({
        message: err.response?.data?.message || 'Failed to process action',
        type: 'error',
      });
    } finally {
      setProcessing(null);
    }
  };

  const waitingPatients = queue.filter((q) => q.status === 'waiting');
  const currentPatient = queue.find((q) => q.status === 'in-progress');

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <Navbar user={user} />
        <div className="flex">
          <Sidebar role={user?.role || 'doctor'} />
          <main className="flex-1 p-8">
            <div className="max-w-6xl mx-auto">
              {/* Header */}
              <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Queue Management</h1>
                <p className="text-gray-600 mt-2">Manage your patient queue efficiently</p>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white rounded-lg shadow-md p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Waiting Patients</p>
                      <p className="text-3xl font-bold text-blue-600">{waitingPatients.length}</p>
                    </div>
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                      <Users className="w-6 h-6 text-blue-600" />
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow-md p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Current Patient</p>
                      <p className="text-3xl font-bold text-green-600">
                        {currentPatient ? '1' : '0'}
                      </p>
                    </div>
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                      <User className="w-6 h-6 text-green-600" />
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow-md p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Avg. Wait Time</p>
                      <p className="text-3xl font-bold text-purple-600">
                        {waitingPatients.length > 0
                          ? Math.round(
                              waitingPatients.reduce((acc, p) => acc + p.estimatedWaitTime, 0) /
                                waitingPatients.length
                            )
                          : 0}
                        m
                      </p>
                    </div>
                    <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                      <Clock className="w-6 h-6 text-purple-600" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Current Patient */}
              {currentPatient && (
                <div className="bg-gradient-to-r from-green-600 to-teal-600 rounded-lg shadow-xl p-6 text-white mb-8">
                  <h3 className="text-xl font-semibold mb-4">Current Patient</h3>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                        <div className="text-2xl font-bold">{currentPatient.tokenNumber}</div>
                      </div>
                      <div>
                        <h4 className="text-2xl font-bold">
                          {currentPatient.patient.firstName} {currentPatient.patient.lastName}
                        </h4>
                        <p className="text-green-100 flex items-center mt-1">
                          <Phone className="w-4 h-4 mr-2" />
                          {currentPatient.patient.phone}
                        </p>
                        <p className="text-sm text-green-100 mt-1">
                          Type: {currentPatient.type === 'appointment' ? 'Appointment' : 'Walk-in'}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleCompleteAndNext(currentPatient._id)}
                      disabled={processing === currentPatient._id}
                      className="flex items-center space-x-2 px-6 py-3 bg-white text-green-600 rounded-lg hover:bg-green-50 transition font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <CheckCircle className="w-5 h-5" />
                      <span>{processing === currentPatient._id ? 'Processing...' : 'Complete & Call Next'}</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Waiting Queue */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Waiting Queue</h3>

                {loading ? (
                  <div className="flex justify-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                  </div>
                ) : waitingPatients.length === 0 ? (
                  <div className="text-center py-12">
                    <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h4 className="text-lg font-semibold text-gray-900 mb-2">No patients waiting</h4>
                    <p className="text-gray-600">The queue is empty</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {waitingPatients.map((entry, index) => (
                      <div
                        key={entry._id}
                        className={`border rounded-lg p-4 transition ${
                          index === 0 ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:shadow-md'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <div
                              className={`w-12 h-12 rounded-full flex items-center justify-center font-bold ${
                                index === 0
                                  ? 'bg-blue-600 text-white'
                                  : 'bg-gray-100 text-gray-700'
                              }`}
                            >
                              {entry.tokenNumber}
                            </div>
                            <div>
                              <h4 className="font-semibold text-gray-900">
                                {entry.patient.firstName} {entry.patient.lastName}
                              </h4>
                              <div className="flex items-center space-x-4 text-sm text-gray-600 mt-1">
                                <span className="flex items-center">
                                  <Phone className="w-4 h-4 mr-1" />
                                  {entry.patient.phone}
                                </span>
                                <span className="flex items-center">
                                  <Clock className="w-4 h-4 mr-1" />
                                  Wait: {entry.estimatedWaitTime}m
                                </span>
                                <span
                                  className={`px-2 py-1 rounded-full text-xs font-semibold ${
                                    entry.type === 'appointment'
                                      ? 'bg-blue-100 text-blue-800'
                                      : 'bg-purple-100 text-purple-800'
                                  }`}
                                >
                                  {entry.type === 'appointment' ? 'Appointment' : 'Walk-in'}
                                </span>
                              </div>
                            </div>
                          </div>

                          {index === 0 && !currentPatient && (
                            <button
                              onClick={() => handleCallNext(entry._id)}
                              disabled={processing === entry._id}
                              className="flex items-center space-x-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              <Play className="w-4 h-4" />
                              <span>{processing === entry._id ? 'Calling...' : 'Call Next'}</span>
                            </button>
                          )}

                          {index === 0 && currentPatient && (
                            <span className="px-4 py-2 bg-yellow-100 text-yellow-800 rounded-lg font-semibold text-sm">
                              Next in Line
                            </span>
                          )}

                          {index > 0 && (
                            <span className="text-gray-500 font-medium">Position: {entry.position}</span>
                          )}
                        </div>
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
