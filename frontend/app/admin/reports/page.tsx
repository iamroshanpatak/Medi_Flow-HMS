'use client';

import Navbar from '@/components/Navbar';
import Sidebar from '@/components/Sidebar';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useAuth } from '@/contexts/AuthContext';
import { useState, useEffect } from 'react';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import {
  TrendingUp,
  TrendingDown,
  Users,
  Activity,
  Clock,
  CheckCircle,
  AlertCircle,
} from 'lucide-react';

interface ReportMetrics {
  totalPatients: number;
  totalAppointments: number;
  totalDoctors: number;
  avgWaitTime: number;
  appointmentCompletionRate: number;
  appointmentNoShowRate: number;
  patientGrowth: number;
  queueUtilization: number;
}

interface ChartData {
  month: string;
  appointments: number;
  completed: number;
  noshow: number;
  revenue?: number;
}

interface DoctorStats {
  name: string;
  appointments: number;
  patients: number;
  avgRating: number;
  completionRate: number;
}

interface MetricCardProps {
  title: string;
  value: number | string;
  unit?: string;
  icon: React.ComponentType<{ size: number; className: string }>;
  trend?: 'up' | 'down';
  trendValue?: number;
  color: string;
}

const MetricCard = ({
  title,
  value,
  unit,
  icon: Icon,
  trend,
  trendValue,
  color,
}: MetricCardProps) => (
  <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow">
    <div className="flex items-start justify-between">
      <div>
        <p className="text-gray-600 text-sm font-medium">{title}</p>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-3xl font-bold text-gray-900">{value}</span>
          {unit && <span className="text-gray-500 text-sm">{unit}</span>}
        </div>
        {trendValue !== undefined && (
          <div
            className={`mt-2 flex items-center gap-1 text-sm font-semibold ${
              trend === 'up' ? 'text-green-600' : 'text-red-600'
            }`}
          >
            {trend === 'up' ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
            {trendValue}% vs last month
          </div>
        )}
      </div>
      <div className={`${color} p-3 rounded-lg`}>
        <Icon size={24} className="text-white" />
      </div>
    </div>
  </div>
);

interface ProgressBarProps {
  value: number;
}

const ProgressBar = ({ value }: ProgressBarProps) => (
  <div className="w-full bg-gray-200 rounded-full h-2 max-w-xs overflow-hidden">
    <div
      className="bg-green-500 h-2 rounded-full transition-all duration-500"
      style={{ width: `${value}%` }}
    />
  </div>
);

export default function AdminReports() {
  const { user } = useAuth();
  const [metrics, setMetrics] = useState<ReportMetrics>({
    totalPatients: 0,
    totalAppointments: 0,
    totalDoctors: 0,
    avgWaitTime: 0,
    appointmentCompletionRate: 0,
    appointmentNoShowRate: 0,
    patientGrowth: 0,
    queueUtilization: 0,
  });

  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [doctorStats, setDoctorStats] = useState<DoctorStats[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReportData = async () => {
      try {
        // Simulate data fetching - replace with actual API calls
        await new Promise((resolve) => setTimeout(resolve, 800));

        // Mock metrics
        const mockMetrics: ReportMetrics = {
          totalPatients: 1243,
          totalAppointments: 5847,
          totalDoctors: 28,
          avgWaitTime: 15,
          appointmentCompletionRate: 94.2,
          appointmentNoShowRate: 5.8,
          patientGrowth: 12.5,
          queueUtilization: 78,
        };

        // Mock chart data
        const mockChartData: ChartData[] = [
          { month: 'Jan', appointments: 456, completed: 428, noshow: 28, revenue: 45600 },
          { month: 'Feb', appointments: 512, completed: 489, noshow: 23, revenue: 51200 },
          { month: 'Mar', appointments: 478, completed: 451, noshow: 27, revenue: 47800 },
          { month: 'Apr', appointments: 534, completed: 510, noshow: 24, revenue: 53400 },
          { month: 'May', appointments: 601, completed: 576, noshow: 25, revenue: 60100 },
          { month: 'Jun', appointments: 589, completed: 557, noshow: 32, revenue: 58900 },
        ];

        // Mock doctor stats
        const mockDoctorStats: DoctorStats[] = [
          { name: 'Dr. Sharma', appointments: 342, patients: 127, avgRating: 4.8, completionRate: 96.2 },
          { name: 'Dr. Patel', appointments: 298, patients: 115, avgRating: 4.6, completionRate: 94.1 },
          { name: 'Dr. Singh', appointments: 267, patients: 98, avgRating: 4.7, completionRate: 95.8 },
          { name: 'Dr. Kumar', appointments: 245, patients: 89, avgRating: 4.5, completionRate: 93.2 },
          { name: 'Dr. Verma', appointments: 218, patients: 76, avgRating: 4.9, completionRate: 97.5 },
        ];

        setMetrics(mockMetrics);
        setChartData(mockChartData);
        setDoctorStats(mockDoctorStats);
        setLoading(false);
      } catch (error) {
        console.error('Failed to fetch report data:', error);
        setLoading(false);
      }
    };

    fetchReportData();
  }, []);

  if (loading) {
    return (
      <ProtectedRoute allowedRoles={['admin']}>
        <div className="min-h-screen bg-gradient-to-br from-violet-50 via-white to-indigo-50">
          <Navbar user={user} />
          <div className="flex">
            <Sidebar role="admin" />
            <main className="flex-1 p-4 sm:p-6 lg:p-8 pb-24 md:pb-8">
              <div className="flex items-center justify-center h-96">
                <div className="text-center">
                  <div className="inline-block animate-spin">
                    <Activity className="text-violet-600" size={48} />
                  </div>
                  <p className="mt-4 text-gray-600 font-medium">Loading reports...</p>
                </div>
              </div>
            </main>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute allowedRoles={['admin']}>
      <div className="min-h-screen bg-gradient-to-br from-violet-50 via-white to-indigo-50">
        <Navbar user={user} />
        <div className="flex">
          <Sidebar role="admin" />
          <main className="flex-1 p-4 sm:p-6 lg:p-8 pb-24 md:pb-8">
            <div className="max-w-7xl mx-auto">
              {/* Header */}
              <div className="mb-8 relative">
                <div className="absolute inset-0 bg-gradient-to-r from-violet-600 to-indigo-600 rounded-3xl blur-3xl opacity-10"></div>
                <div className="relative">
                  <h1 className="text-3xl sm:text-4xl font-extrabold bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent">
                    Reports & Analytics 📊
                  </h1>
                  <p className="text-base sm:text-lg text-gray-600 mt-3 font-medium">
                    Hospital performance metrics and data analysis
                  </p>
                </div>
              </div>

              {/* Key Metrics Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
                <MetricCard
                  title="Total Patients"
                  value={metrics.totalPatients}
                  icon={Users}
                  trend="up"
                  trendValue={metrics.patientGrowth}
                  color="bg-blue-500"
                />
                <MetricCard
                  title="Total Appointments"
                  value={metrics.totalAppointments}
                  icon={CheckCircle}
                  trend="up"
                  trendValue={8.3}
                  color="bg-green-500"
                />
                <MetricCard
                  title="Active Doctors"
                  value={metrics.totalDoctors}
                  icon={Activity}
                  trend="up"
                  trendValue={3.2}
                  color="bg-purple-500"
                />
                <MetricCard
                  title="Avg Wait Time"
                  value={metrics.avgWaitTime}
                  unit="mins"
                  icon={Clock}
                  trend="down"
                  trendValue={12.1}
                  color="bg-orange-500"
                />
              </div>

              {/* Performance Metrics */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-8">
                <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-gray-600 text-sm font-medium">Completion Rate</p>
                      <p className="text-3xl font-bold text-gray-900 mt-2">
                        {metrics.appointmentCompletionRate}%
                      </p>
                      <p className="text-green-600 text-sm font-semibold mt-2">
                        ↑ 2.1% improvement
                      </p>
                    </div>
                    <div className="w-20 h-20 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center">
                      <span className="text-white font-bold text-lg">
                        {Math.round(metrics.appointmentCompletionRate)}%
                      </span>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-gray-600 text-sm font-medium">No-Show Rate</p>
                      <p className="text-3xl font-bold text-gray-900 mt-2">
                        {metrics.appointmentNoShowRate}%
                      </p>
                      <p className="text-red-600 text-sm font-semibold mt-2">
                        ↑ 0.8% increase
                      </p>
                    </div>
                    <div className="w-20 h-20 bg-gradient-to-br from-red-400 to-red-600 rounded-full flex items-center justify-center">
                      <span className="text-white font-bold text-lg">
                        {metrics.appointmentNoShowRate}%
                      </span>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-gray-600 text-sm font-medium">Queue Utilization</p>
                      <p className="text-3xl font-bold text-gray-900 mt-2">
                        {metrics.queueUtilization}%
                      </p>
                      <p className="text-blue-600 text-sm font-semibold mt-2">
                        ↑ 5.3% utilization
                      </p>
                    </div>
                    <div className="w-20 h-20 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center">
                      <span className="text-white font-bold text-lg">
                        {metrics.queueUtilization}%
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Charts Section */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                {/* Appointments Chart */}
                <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
                  <h2 className="text-lg font-bold text-gray-900 mb-4">Appointments Trend</h2>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                      <XAxis dataKey="month" stroke="#6b7280" />
                      <YAxis stroke="#6b7280" />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#fff',
                          border: '1px solid #e5e7eb',
                          borderRadius: '8px',
                        }}
                      />
                      <Legend wrapperStyle={{ paddingTop: '20px' }} />
                      <Line
                        type="monotone"
                        dataKey="appointments"
                        stroke="#7c3aed"
                        strokeWidth={2}
                        dot={{ fill: '#7c3aed', r: 4 }}
                        activeDot={{ r: 6 }}
                      />
                      <Line
                        type="monotone"
                        dataKey="completed"
                        stroke="#10b981"
                        strokeWidth={2}
                        dot={{ fill: '#10b981', r: 4 }}
                        activeDot={{ r: 6 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>

                {/* No-Show Distribution */}
                <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
                  <h2 className="text-lg font-bold text-gray-900 mb-4">Appointment Status</h2>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={[
                          { name: 'Completed', value: 94.2 },
                          { name: 'No-Show', value: 5.8 },
                        ]}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, value }) => `${name}: ${value}%`}
                        outerRadius={70}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        <Cell fill="#10b981" />
                        <Cell fill="#ef4444" />
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                {/* Monthly Revenue */}
                <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
                  <h2 className="text-lg font-bold text-gray-900 mb-4">Monthly Revenue</h2>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                      <XAxis dataKey="month" stroke="#6b7280" />
                      <YAxis stroke="#6b7280" />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#fff',
                          border: '1px solid #e5e7eb',
                          borderRadius: '8px',
                        }}
                      />
                      <Bar dataKey="revenue" fill="#6366f1" radius={[8, 8, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                {/* Doctor Performance */}
                <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
                  <h2 className="text-lg font-bold text-gray-900 mb-4">Doctor Appointments</h2>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={doctorStats}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                      <XAxis dataKey="name" stroke="#6b7280" angle={-45} textAnchor="end" height={80} />
                      <YAxis stroke="#6b7280" />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#fff',
                          border: '1px solid #e5e7eb',
                          borderRadius: '8px',
                        }}
                      />
                      <Bar dataKey="appointments" fill="#8b5cf6" radius={[8, 8, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Top Doctors Table */}
              <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
                <h2 className="text-lg font-bold text-gray-900 mb-6">Top Performing Doctors</h2>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-3 px-4 font-semibold text-gray-700">Doctor Name</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-700">Appointments</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-700">Patients</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-700">Avg Rating</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-700">Completion Rate</th>
                      </tr>
                    </thead>
                    <tbody>
                      {doctorStats.map((doctor, index) => (
                        <tr key={index} className="border-b border-gray-100 hover:bg-gray-50 transition">
                          <td className="py-3 px-4 text-gray-900 font-medium">{doctor.name}</td>
                          <td className="py-3 px-4 text-gray-600">{doctor.appointments}</td>
                          <td className="py-3 px-4 text-gray-600">{doctor.patients}</td>
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-gray-900">{doctor.avgRating}</span>
                              <span className="text-yellow-400">★</span>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2">
                              <ProgressBar value={doctor.completionRate} />
                              <span className="text-sm font-medium text-gray-600 whitespace-nowrap">
                                {doctor.completionRate}%
                              </span>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Summary Alert */}
              <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6 flex items-start gap-4">
                <AlertCircle className="text-blue-600 flex-shrink-0 mt-1" size={24} />
                <div>
                  <h3 className="font-semibold text-blue-900 mb-2">Report Summary</h3>
                  <p className="text-blue-800 text-sm">
                    Overall system performance is excellent with {metrics.appointmentCompletionRate}% appointment
                    completion rate and an average wait time of {metrics.avgWaitTime} minutes. Queue utilization
                    stands at {metrics.queueUtilization}% indicating healthy patient flow management.
                  </p>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    </ProtectedRoute>
  );
}
