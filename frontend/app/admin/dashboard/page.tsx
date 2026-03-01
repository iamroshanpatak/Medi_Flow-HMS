'use client';

import Navbar from '@/components/Navbar';
import Sidebar from '@/components/Sidebar';
import { StatCard, InfoCard } from '@/components/Card';
import { Users, Calendar, Clock, Activity } from 'lucide-react';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useAuth } from '@/contexts/AuthContext';

interface DepartmentItemProps {
  name: string;
  doctors: number;
  patients: number;
  queueLength: number;
}

interface AlertProps {
  type: 'warning' | 'info' | 'success' | 'error';
  message: string;
  time: string;
}

export default function AdminDashboard() {
  const { user } = useAuth();

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
                  System Overview 🏛️
                </h1>
                <p className="text-base sm:text-lg text-gray-600 mt-3 font-medium">Monitor and manage hospital operations</p>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
              <StatCard
                title="Total Patients"
                value="1,234"
                icon={Users}
                trend={{ value: '+12% this month', isPositive: true }}
              />
              <StatCard
                title="Active Doctors"
                value="45"
                icon={Activity}
                trend={{ value: '3 new this week', isPositive: true }}
              />
              <StatCard
                title="Today's Appointments"
                value="156"
                icon={Calendar}
                trend={{ value: '89% completed', isPositive: true }}
              />
              <StatCard
                title="Avg Wait Time"
                value="14 min"
                icon={Clock}
                trend={{ value: '-2 min', isPositive: true }}
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-6">
              {/* Department Overview */}
              <InfoCard title="Department Overview">
                <div className="space-y-4">
                  <DepartmentItem
                    name="Cardiology"
                    doctors={8}
                    patients={45}
                    queueLength={12}
                  />
                  <DepartmentItem
                    name="Orthopedics"
                    doctors={6}
                    patients={38}
                    queueLength={8}
                  />
                  <DepartmentItem
                    name="Pediatrics"
                    doctors={10}
                    patients={52}
                    queueLength={15}
                  />
                  <DepartmentItem
                    name="General Medicine"
                    doctors={12}
                    patients={78}
                    queueLength={20}
                  />
                </div>
              </InfoCard>

              {/* System Alerts */}
              <InfoCard title="System Alerts">
                <div className="space-y-4">
                  <Alert
                    type="warning"
                    message="Queue length high in Cardiology department"
                    time="5 min ago"
                  />
                  <Alert
                    type="info"
                    message="New doctor registration pending approval"
                    time="1 hour ago"
                  />
                  <Alert
                    type="success"
                    message="System backup completed successfully"
                    time="2 hours ago"
                  />
                  <Alert
                    type="info"
                    message="Monthly report generation scheduled"
                    time="3 hours ago"
                  />
                </div>
              </InfoCard>
            </div>

            {/* Performance Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="group relative bg-gradient-to-br from-purple-50 to-indigo-50 rounded-2xl shadow-lg border border-purple-100 p-6 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-indigo-500/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <h4 className="relative text-sm font-bold text-gray-600 mb-4 uppercase tracking-wide">Appointment Utilization</h4>
                <div className="relative flex items-end space-x-2 mt-4">
                  <div className="flex-1 bg-gradient-to-t from-purple-400 to-purple-300 h-20 rounded-lg shadow-md group-hover:scale-105 transition-transform"></div>
                  <div className="flex-1 bg-gradient-to-t from-purple-500 to-purple-400 h-32 rounded-lg shadow-md group-hover:scale-105 transition-transform"></div>
                  <div className="flex-1 bg-gradient-to-t from-purple-600 to-purple-500 h-24 rounded-lg shadow-md group-hover:scale-105 transition-transform"></div>
                  <div className="flex-1 bg-gradient-to-t from-indigo-500 to-indigo-400 h-28 rounded-lg shadow-md group-hover:scale-105 transition-transform"></div>
                  <div className="flex-1 bg-gradient-to-t from-indigo-600 to-indigo-500 h-36 rounded-lg shadow-md group-hover:scale-105 transition-transform"></div>
                </div>
                <p className="relative text-sm text-gray-600 mt-4 font-medium">Last 5 days</p>
              </div>

              <div className="group relative bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl shadow-lg border border-green-100 p-6 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300">
                <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-emerald-500/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <h4 className="relative text-sm font-bold text-gray-600 mb-4 uppercase tracking-wide">Patient Satisfaction</h4>
                <div className="relative flex items-center justify-center h-32">
                  <div className="text-center">
                    <p className="text-6xl font-extrabold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent group-hover:scale-110 transition-transform">92%</p>
                    <p className="text-sm text-gray-600 mt-3 font-medium">Overall Rating</p>
                  </div>
                </div>
                <p className="relative text-sm text-gray-600 mt-4 font-medium">Based on 450 reviews</p>
              </div>

              <div className="group relative bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl shadow-lg border border-blue-100 p-6 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-cyan-500/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <h4 className="relative text-sm font-bold text-gray-600 mb-4 uppercase tracking-wide">Revenue This Month</h4>
                <div className="relative flex items-center justify-center h-32">
                  <div className="text-center">
                    <p className="text-6xl font-extrabold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent group-hover:scale-110 transition-transform">$45K</p>
                    <p className="text-sm text-green-600 mt-3 font-semibold flex items-center justify-center gap-1">
                      <span className="text-base">↑</span> +18% from last month
                    </p>
                  </div>
                </div>
                <p className="relative text-sm text-gray-600 mt-4 font-medium">Updated today</p>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
    </ProtectedRoute>
  );
}

function DepartmentItem({ name, doctors, patients, queueLength }: DepartmentItemProps) {
  return (
    <div className="group relative flex items-center justify-between p-4 bg-gradient-to-r from-violet-50 to-indigo-50 rounded-xl hover:shadow-lg transition-all duration-300 hover:-translate-y-1 cursor-pointer border border-violet-100">
      <div className="flex-1">
        <h4 className="font-bold text-gray-900 flex items-center gap-2">
          <span className="w-2 h-2 bg-gradient-to-r from-violet-500 to-indigo-500 rounded-full"></span>
          {name}
        </h4>
        <div className="flex space-x-4 text-sm text-gray-600 mt-2 font-medium">
          <span className="flex items-center gap-1">
            <span className="text-violet-500">👨‍⚕️</span> {doctors} Doctors
          </span>
          <span>•</span>
          <span className="flex items-center gap-1">
            <span className="text-indigo-500">🫀</span> {patients} Patients Today
          </span>
        </div>
      </div>
      <span className="px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-500 text-white text-sm font-bold rounded-xl shadow-lg group-hover:scale-110 transition-transform">
        Queue: {queueLength}
      </span>
    </div>
  );
}

function Alert({ type, message, time }: AlertProps) {
  const colors = {
    warning: 'border-yellow-400 bg-gradient-to-r from-yellow-50 to-amber-50 text-yellow-800 shadow-yellow-200',
    info: 'border-blue-400 bg-gradient-to-r from-blue-50 to-cyan-50 text-blue-800 shadow-blue-200',
    success: 'border-green-400 bg-gradient-to-r from-green-50 to-emerald-50 text-green-800 shadow-green-200',
    error: 'border-red-400 bg-gradient-to-r from-red-50 to-rose-50 text-red-800 shadow-red-200',
  };

  const icons = {
    warning: '⚠️',
    info: 'ℹ️',
    success: '✅',
    error: '❌',
  };

  return (
    <div className={`group p-4 border-l-4 rounded-xl hover:shadow-lg transition-all duration-300 hover:-translate-x-1 ${colors[type]}`}>
      <p className="font-bold flex items-center gap-2">
        <span className="text-lg">{icons[type]}</span>
        {message}
      </p>
      <p className="text-xs mt-2 opacity-75 font-medium">{time}</p>
    </div>
  );
}
