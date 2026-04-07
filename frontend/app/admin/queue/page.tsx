'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import Navbar from '@/components/Navbar';
import Sidebar from '@/components/Sidebar';
import Toast, { ToastType } from '@/components/Toast';
import { Clock, Users, AlertCircle, CheckCircle, BarChart3, Search, Filter } from 'lucide-react';
import { queueAPI, doctorsAPI } from '@/services/api';
import io from 'socket.io-client';

interface QueueEntry {
  _id: string;
  patient: {
    firstName: string;
    lastName: string;
    phone: string;
    email: string;
  };
  doctor: {
    _id: string;
    firstName: string;
    lastName: string;
    specialization: string;
  };
  tokenNumber: number;
  position: number;
  status: 'waiting' | 'in-progress' | 'completed' | 'cancelled' | 'no-show';
  type: 'appointment' | 'walk-in' | 'emergency';
  priority: 'normal' | 'high' | 'emergency';
  checkInTime: string;
  estimatedWaitTime: number;
  consultationStartTime?: string;
  consultationEndTime?: string;
}

interface DoctorQueue {
  doctorId: string;
  doctorName: string;
  specialization: string;
  totalPatients: number;
  waiting: number;
  inProgress: number;
  completed: number;
  avgWaitTime: number;
  queue: QueueEntry[];
}

export default function AdminQueueMonitorPage() {
  const { user } = useAuth();
  const [allQueueEntries, setAllQueueEntries] = useState<QueueEntry[]>([]);
  const [doctorQueues, setDoctorQueues] = useState<DoctorQueue[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDoctor, setSelectedDoctor] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null);
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    fetchAllQueues();

    // Setup Socket.IO
    const newSocket = io(process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:5000');
    setSocket(newSocket);

    newSocket.on('queueUpdate', () => {
      fetchAllQueues();
    });

    return () => {
      newSocket.close();
    };
  }, []);

  const fetchAllQueues = async () => {
    try {
      setLoading(true);
      const response = await queueAPI.getAll();
      const entries = response.data.data || [];
      setAllQueueEntries(entries);
      
      // Organize by doctor
      const doctorMap = new Map<string, any>();
      
      entries.forEach((entry: QueueEntry) => {
        const doctorId = entry.doctor._id;
        if (!doctorMap.has(doctorId)) {
          doctorMap.set(doctorId, {
            doctorId,
            doctorName: `Dr. ${entry.doctor.firstName} ${entry.doctor.lastName}`,
            specialization: entry.doctor.specialization,
            totalPatients: 0,
            waiting: 0,
            inProgress: 0,
            completed: 0,
            avgWaitTime: 0,
            queue: [],
          });
        }
        
        const doc = doctorMap.get(doctorId);
        doc.queue.push(entry);
        doc.totalPatients++;
        
        if (entry.status === 'waiting') doc.waiting++;
        if (entry.status === 'in-progress') doc.inProgress++;
        if (entry.status === 'completed') doc.completed++;
      });

      // Calculate average wait times
      const queues = Array.from(doctorMap.values()).map((doc) => {
        const waitingPatients = doc.queue.filter((q: QueueEntry) => q.status === 'waiting');
        const avgWaitTime = waitingPatients.length > 0
          ? waitingPatients.reduce((sum: number, q: QueueEntry) => sum + (q.estimatedWaitTime || 0), 0) / waitingPatients.length
          : 0;
        
        return {
          ...doc,
          avgWaitTime: Math.round(avgWaitTime),
        };
      });

      setDoctorQueues(queues.sort((a, b) => b.waiting - a.waiting));
    } catch (error) {
      console.error('Failed to fetch queues:', error);
      setToast({ message: 'Failed to fetch queue data', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const getFilteredQueue = () => {
    let filtered = allQueueEntries;

    // Filter by doctor
    if (selectedDoctor !== 'all') {
      filtered = filtered.filter((q) => q.doctor._id === selectedDoctor);
    }

    // Filter by status
    if (statusFilter !== 'all') {
      filtered = filtered.filter((q) => q.status === statusFilter);
    }

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (q) =>
          q.patient.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          q.patient.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          q.patient.phone.includes(searchTerm) ||
          q.doctor.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          q.doctor.lastName.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    return filtered;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'waiting':
        return 'bg-blue-100 text-blue-800';
      case 'in-progress':
        return 'bg-yellow-100 text-yellow-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'no-show':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'emergency':
        return 'bg-red-100 text-red-800 border-l-4 border-red-500';
      case 'high':
        return 'bg-orange-100 text-orange-800 border-l-4 border-orange-500';
      default:
        return 'bg-white border-l-4 border-gray-300';
    }
  };

  const filteredQueue = getFilteredQueue();

  const totalStats = {
    total: allQueueEntries.length,
    waiting: allQueueEntries.filter((q) => q.status === 'waiting').length,
    inProgress: allQueueEntries.filter((q) => q.status === 'in-progress').length,
    completed: allQueueEntries.filter((q) => q.status === 'completed').length,
    emergency: allQueueEntries.filter((q) => q.priority === 'emergency').length,
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
                  <Clock className="w-8 h-8 mr-3 text-orange-600" />
                  Queue Monitor
                </h1>
                <p className="text-gray-600 mt-2">Real-time monitoring of all doctor queues</p>
              </div>

              {/* Overview Stats */}
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
                <div className="bg-white p-6 rounded-lg shadow-md">
                  <p className="text-sm text-gray-600 mb-1">Total Patients</p>
                  <p className="text-3xl font-bold text-gray-900">{totalStats.total}</p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-blue-500">
                  <p className="text-sm text-gray-600 mb-1">Waiting</p>
                  <p className="text-3xl font-bold text-blue-600">{totalStats.waiting}</p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-yellow-500">
                  <p className="text-sm text-gray-600 mb-1">In Progress</p>
                  <p className="text-3xl font-bold text-yellow-600">{totalStats.inProgress}</p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-green-500">
                  <p className="text-sm text-gray-600 mb-1">Completed</p>
                  <p className="text-3xl font-bold text-green-600">{totalStats.completed}</p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-red-500">
                  <p className="text-sm text-gray-600 mb-1">Emergency</p>
                  <p className="text-3xl font-bold text-red-600">{totalStats.emergency}</p>
                </div>
              </div>

              {/* Doctor Queues Overview */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                {doctorQueues.map((docQueue) => (
                  <div
                    key={docQueue.doctorId}
                    className="bg-white rounded-lg shadow-md p-6 border-l-4 border-orange-500"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-lg font-bold text-gray-900">{docQueue.doctorName}</h3>
                        <p className="text-sm text-gray-600">{docQueue.specialization}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-orange-600">{docQueue.waiting}</p>
                        <p className="text-xs text-gray-500">Waiting</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                      <div className="bg-blue-50 p-3 rounded">
                        <p className="text-xs text-gray-600 mb-1">Total</p>
                        <p className="text-2xl font-bold text-blue-600">{docQueue.totalPatients}</p>
                      </div>
                      <div className="bg-yellow-50 p-3 rounded">
                        <p className="text-xs text-gray-600 mb-1">Active</p>
                        <p className="text-2xl font-bold text-yellow-600">{docQueue.inProgress}</p>
                      </div>
                      <div className="bg-green-50 p-3 rounded">
                        <p className="text-xs text-gray-600 mb-1">Avg Wait</p>
                        <p className="text-2xl font-bold text-green-600">{docQueue.avgWaitTime}m</p>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="mt-4">
                      <div className="flex text-xs text-gray-600 mb-2">
                        <span className="flex-1">Queue Progress</span>
                        <span>{docQueue.completed}/{docQueue.totalPatients} completed</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-green-500 h-2 rounded-full transition-all duration-500"
                          style={{
                            width: `${docQueue.totalPatients > 0 ? (docQueue.completed / docQueue.totalPatients) * 100 : 0}%`,
                          }}
                        ></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Filters and Search */}
              <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="text"
                      placeholder="Search patient or doctor..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    />
                  </div>
                  <div className="relative">
                    <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <select
                      value={selectedDoctor}
                      onChange={(e) => setSelectedDoctor(e.target.value)}
                      title="Filter by doctor"
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent appearance-none"
                    >
                      <option value="all">All Doctors</option>
                      {doctorQueues.map((doc) => (
                        <option key={doc.doctorId} value={doc.doctorId}>
                          {doc.doctorName}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="relative">
                    <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      title="Filter by status"
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent appearance-none"
                    >
                      <option value="all">All Status</option>
                      <option value="waiting">Waiting</option>
                      <option value="in-progress">In Progress</option>
                      <option value="completed">Completed</option>
                      <option value="cancelled">Cancelled</option>
                      <option value="no-show">No Show</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Queue List */}
              <div className="bg-white rounded-lg shadow-md overflow-hidden">
                {loading ? (
                  <div className="p-8 text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto"></div>
                    <p className="text-gray-600 mt-4">Loading queue data...</p>
                  </div>
                ) : filteredQueue.length === 0 ? (
                  <div className="p-8 text-center text-gray-600">
                    <Clock className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                    <p>No queue entries found</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50 border-b">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Token
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Patient
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Doctor
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Position
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Type
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Est. Wait
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Status
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {filteredQueue.map((entry) => (
                          <tr key={entry._id} className={`hover:bg-gray-50 ${getPriorityColor(entry.priority)}`}>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center justify-center w-10 h-10 bg-orange-100 text-orange-600 rounded-full font-bold text-sm">
                                {entry.tokenNumber}
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div>
                                <div className="text-sm font-medium text-gray-900">
                                  {entry.patient.firstName} {entry.patient.lastName}
                                </div>
                                <div className="text-sm text-gray-500">{entry.patient.phone}</div>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div>
                                <div className="text-sm font-medium text-gray-900">
                                  Dr. {entry.doctor.firstName} {entry.doctor.lastName}
                                </div>
                                <div className="text-sm text-gray-500">{entry.doctor.specialization}</div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-bold text-gray-900">#{entry.position}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className="px-2 py-1 text-xs font-semibold rounded bg-gray-100 text-gray-800 capitalize">
                                {entry.type}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">{entry.estimatedWaitTime}m</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span
                                className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full capitalize ${getStatusColor(
                                  entry.status
                                )}`}
                              >
                                {entry.status === 'in-progress' ? 'In Progress' : entry.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* Legend */}
              <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-semibold text-sm text-blue-900 mb-2">Legend</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <div className={`w-4 h-4 bg-white border-l-4 border-red-500 rounded`}></div>
                    <span className="text-gray-700">Emergency Priority</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className={`w-4 h-4 bg-white border-l-4 border-orange-500 rounded`}></div>
                    <span className="text-gray-700">High Priority</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className={`w-4 h-4 bg-white border-l-4 border-gray-300 rounded`}></div>
                    <span className="text-gray-700">Normal Priority</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-1 text-gray-700">
                      <RefreshIcon /> Real-time updates enabled
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </ProtectedRoute>
  );
}

function RefreshIcon() {
  return (
    <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
      <path
        fillRule="evenodd"
        d="M4 2a1 1 0 011 1v2.101a7 7 0 015.946 11.859l1.414-1.415A9 9 0 003.02 4.03V3a1 1 0 011-1z"
        clipRule="evenodd"
      />
      <path
        fillRule="evenodd"
        d="M16 18a1 1 0 01-1-1v-2.101a7 7 0 01-5.946-11.859l-1.414 1.415A9 9 0 0116.98 15.97V17a1 1 0 011 1z"
        clipRule="evenodd"
      />
    </svg>
  );
}
