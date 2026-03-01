'use client';

import Navbar from '@/components/Navbar';
import Sidebar from '@/components/Sidebar';
import { StatCard, InfoCard } from '@/components/Card';
import { Calendar, Clock, FileText, Activity } from 'lucide-react';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useAuth } from '@/contexts/AuthContext';

export default function PatientDashboard() {
  const { user } = useAuth();

  return (
    <ProtectedRoute allowedRoles={['patient']}>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <Navbar user={user} />
        <div className="flex">
          <Sidebar role="patient" />
          <main className="flex-1 p-4 sm:p-6 lg:p-8 pb-24 md:pb-8">
            <div className="max-w-7xl mx-auto">
              {/* Header */}
              <div className="mb-8 relative">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl blur-3xl opacity-10"></div>
                <div className="relative">
                  <h1 className="text-3xl sm:text-4xl font-extrabold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    Welcome back, {user?.firstName}! 👋
                  </h1>
                  <p className="text-base sm:text-lg text-gray-600 mt-3 font-medium">Here&apos;s your health dashboard overview</p>
                </div>
              </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
              <StatCard
                title="Upcoming Appointments"
                value="3"
                icon={Calendar}
                trend={{ value: '2 this week', isPositive: true }}
              />
              <StatCard
                title="Queue Position"
                value="#5"
                icon={Clock}
                trend={{ value: '~15 min wait', isPositive: false }}
              />
              <StatCard
                title="Medical Records"
                value="12"
                icon={FileText}
              />
              <StatCard
                title="Health Score"
                value="95%"
                icon={Activity}
                trend={{ value: '+5% from last month', isPositive: true }}
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
              {/* Upcoming Appointments */}
              <InfoCard
                title="Upcoming Appointments"
                action={
                  <button className="text-sm text-primary-600 hover:text-primary-700 font-medium">
                    View All
                  </button>
                }
              >
                <div className="space-y-4">
                  <AppointmentItem
                    doctor="Dr. Sarah Johnson"
                    specialty="Cardiologist"
                    date="Dec 22, 2025"
                    time="10:00 AM"
                  />
                  <AppointmentItem
                    doctor="Dr. Michael Chen"
                    specialty="General Physician"
                    date="Dec 25, 2025"
                    time="2:30 PM"
                  />
                  <AppointmentItem
                    doctor="Dr. Emily Brown"
                    specialty="Dermatologist"
                    date="Dec 28, 2025"
                    time="11:15 AM"
                  />
                </div>
              </InfoCard>

              {/* Recent Activity */}
              <InfoCard title="Recent Activity">
                <div className="space-y-4">
                  <ActivityItem
                    action="Appointment Confirmed"
                    description="Your appointment with Dr. Sarah Johnson has been confirmed"
                    time="2 hours ago"
                  />
                  <ActivityItem
                    action="Prescription Updated"
                    description="New prescription added by Dr. Michael Chen"
                    time="1 day ago"
                  />
                  <ActivityItem
                    action="Test Results Available"
                    description="Blood test results are now available"
                    time="2 days ago"
                  />
                </div>
              </InfoCard>
            </div>

            {/* Quick Actions */}
            <div className="mt-8 bg-gradient-to-br from-white to-blue-50/30 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-100 p-6 hover:shadow-2xl transition-shadow duration-300">
              <h3 className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-6">Quick Actions</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <QuickActionButton icon={Calendar} label="Book Appointment" />
                <QuickActionButton icon={Clock} label="Check Queue" />
                <QuickActionButton icon={FileText} label="View Records" />
                <QuickActionButton icon={Activity} label="Health Reports" />
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  </ProtectedRoute>
  );
}

function AppointmentItem({ doctor, specialty, date, time }: any) {
  return (
    <div className="group relative flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl hover:shadow-lg transition-all duration-300 hover:-translate-y-1 cursor-pointer border border-blue-100">
      <div className="flex items-center space-x-4">
        <div className="relative w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
          <span className="text-white font-bold text-lg">{doctor.charAt(0)}</span>
          <div className="absolute inset-0 bg-blue-400 rounded-xl blur-lg opacity-40 group-hover:opacity-60 transition-opacity"></div>
        </div>
        <div>
          <p className="font-bold text-gray-900">{doctor}</p>
          <p className="text-sm text-gray-600 flex items-center gap-1">
            <span className="w-1.5 h-1.5 bg-blue-500 rounded-full"></span>
            {specialty}
          </p>
        </div>
      </div>
      <div className="text-right">
        <p className="text-sm font-bold text-gray-900">{date}</p>
        <p className="text-sm text-blue-600 font-medium">{time}</p>
      </div>
    </div>
  );
}

function ActivityItem({ action, description, time }: any) {
  return (
    <div className="group flex items-start space-x-4 p-3 rounded-lg hover:bg-blue-50/50 transition-colors duration-200">
      <div className="relative flex-shrink-0 w-8 h-8 mt-1">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full"></div>
        <div className="absolute inset-1 bg-white rounded-full"></div>
        <div className="absolute inset-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full group-hover:scale-110 transition-transform"></div>
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-bold text-gray-900">{action}</p>
        <p className="text-sm text-gray-600 mt-1">{description}</p>
        <p className="text-xs text-gray-500 mt-2 font-medium">{time}</p>
      </div>
    </div>
  );
}

function QuickActionButton({ icon: Icon, label }: any) {
  return (
    <button className="group relative flex flex-col items-center p-5 bg-gradient-to-br from-white to-blue-50 hover:from-blue-500 hover:to-purple-600 rounded-2xl transition-all duration-300 hover:shadow-xl hover:-translate-y-2 border border-blue-100 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-blue-400/0 via-purple-400/0 to-blue-400/0 group-hover:from-blue-400/20 group-hover:via-purple-400/20 group-hover:to-blue-400/20 transition-all duration-500"></div>
      <div className="relative p-3 bg-gradient-to-br from-blue-100 to-purple-100 group-hover:from-white/20 group-hover:to-white/20 rounded-xl mb-3 group-hover:scale-110 transition-transform duration-300">
        <Icon className="h-6 w-6 text-blue-600 group-hover:text-white transition-colors" />
      </div>
      <span className="relative text-sm font-bold text-gray-900 group-hover:text-white transition-colors text-center">{label}</span>
    </button>
  );
}