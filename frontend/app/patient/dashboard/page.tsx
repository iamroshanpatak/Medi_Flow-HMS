'use client';

import Navbar from '@/components/Navbar';
import Sidebar from '@/components/Sidebar';
import { StatCard, InfoCard } from '@/components/Card';
import { Calendar, Clock, FileText, Activity, ArrowRight, ChevronRight } from 'lucide-react';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function PatientDashboard() {
  const { user } = useAuth();
  const router = useRouter();
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);

  return (
    <ProtectedRoute allowedRoles={['patient']}>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <Navbar user={user} />
        <div className="flex">
          <Sidebar role="patient" />
          <main className="flex-1 p-4 sm:p-6 lg:p-8 pb-24 md:pb-8">
            <div className="max-w-7xl mx-auto">
              {/* Header */}
              <div className="mb-8 relative animate-slide-in">
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
              <div onClick={() => router.push('/patient/appointments')} className="cursor-pointer">
                <StatCard
                  title="Upcoming Appointments"
                  value="3"
                  icon={Calendar}
                  trend={{ value: '2 this week', isPositive: true }}
                />
              </div>
              <div onClick={() => router.push('/patient/queue')} className="cursor-pointer">
                <StatCard
                  title="Queue Position"
                  value="#5"
                  icon={Clock}
                  trend={{ value: '~15 min wait', isPositive: false }}
                />
              </div>
              <div onClick={() => router.push('/patient/records')} className="cursor-pointer">
                <StatCard
                  title="Medical Records"
                  value="12"
                  icon={FileText}
                />
              </div>
              <div className="cursor-pointer">
                <StatCard
                  title="Health Score"
                  value="95%"
                  icon={Activity}
                  trend={{ value: '+5% from last month', isPositive: true }}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
              {/* Upcoming Appointments */}
              <InfoCard
                title="Upcoming Appointments"
                action={
                  <button 
                    onClick={() => router.push('/patient/appointments')}
                    className="flex items-center space-x-1 text-sm text-blue-600 hover:text-blue-700 font-semibold transition-all hover:space-x-2 group"
                  >
                    <span>View All</span>
                    <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </button>
                }
              >
                <div className="space-y-4">
                  <AppointmentItem
                    doctor="Dr. Sarah Johnson"
                    specialty="Cardiologist"
                    date="Dec 22, 2025"
                    time="10:00 AM"
                    onClick={() => router.push('/patient/appointments')}
                  />
                  <AppointmentItem
                    doctor="Dr. Michael Chen"
                    specialty="General Physician"
                    date="Dec 25, 2025"
                    time="2:30 PM"
                    onClick={() => router.push('/patient/appointments')}
                  />
                  <AppointmentItem
                    doctor="Dr. Emily Brown"
                    specialty="Dermatologist"
                    date="Dec 28, 2025"
                    time="11:15 AM"
                    onClick={() => router.push('/patient/appointments')}
                  />
                </div>
              </InfoCard>

              {/* Recent Activity */}
              <InfoCard 
                title="Recent Activity"
                action={
                  <button 
                    onClick={() => router.push('/patient/dashboard')}
                    className="flex items-center space-x-1 text-sm text-purple-600 hover:text-purple-700 font-semibold transition-all hover:space-x-2 group"
                  >
                    <span>View All</span>
                    <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </button>
                }
              >
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
            <div className="mt-8 bg-gradient-to-br from-white to-blue-50/30 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-100 p-6 hover:shadow-2xl transition-all duration-300 animate-slide-up">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">Quick Actions</h3>
                <span className="text-xs font-medium text-gray-500 bg-gray-100 px-3 py-1 rounded-full">Fast Access</span>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <QuickActionButton 
                  icon={Calendar} 
                  label="Book Appointment" 
                  onClick={() => router.push('/patient/book-appointment')}
                  gradient="from-blue-500 to-cyan-500"
                />
                <QuickActionButton 
                  icon={Clock} 
                  label="Check Queue" 
                  onClick={() => router.push('/patient/queue')}
                  gradient="from-orange-500 to-red-500"
                />
                <QuickActionButton 
                  icon={FileText} 
                  label="View Records" 
                  onClick={() => router.push('/patient/records')}
                  gradient="from-purple-500 to-pink-500"
                />
                <QuickActionButton 
                  icon={Activity} 
                  label="Health Reports" 
                  onClick={() => router.push('/patient/records')}
                  gradient="from-green-500 to-emerald-500"
                />
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  </ProtectedRoute>
  );
}

function AppointmentItem({ doctor, specialty, date, time, onClick }: any) {
  return (
    <div 
      onClick={onClick}
      className="group relative flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl hover:shadow-lg transition-all duration-300 hover:-translate-y-1 cursor-pointer border border-blue-100 hover:border-blue-300"
    >
      <div className="flex items-center space-x-4">
        <div className="relative w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
          <span className="text-white font-bold text-lg">{doctor.charAt(0)}</span>
          <div className="absolute inset-0 bg-blue-400 rounded-xl blur-lg opacity-40 group-hover:opacity-60 transition-opacity"></div>
        </div>
        <div>
          <p className="font-bold text-gray-900 group-hover:text-blue-600 transition-colors">{doctor}</p>
          <p className="text-sm text-gray-600 flex items-center gap-1">
            <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse"></span>
            {specialty}
          </p>
        </div>
      </div>
      <div className="text-right">
        <p className="text-sm font-bold text-gray-900">{date}</p>
        <p className="text-sm text-blue-600 font-medium">{time}</p>
        <ChevronRight className="h-4 w-4 ml-auto mt-1 text-gray-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
      </div>
    </div>
  );
}

function ActivityItem({ action, description, time }: any) {
  return (
    <div className="group flex items-start space-x-4 p-3 rounded-xl hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 transition-all duration-200 cursor-pointer hover:shadow-md border border-transparent hover:border-blue-100">
      <div className="relative flex-shrink-0 w-8 h-8 mt-1">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full opacity-20 group-hover:opacity-30 transition-opacity"></div>
        <div className="absolute inset-1 bg-white rounded-full"></div>
        <div className="absolute inset-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full group-hover:scale-110 transition-transform"></div>
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-bold text-gray-900 group-hover:text-blue-600 transition-colors">{action}</p>
        <p className="text-sm text-gray-600 mt-1 line-clamp-2">{description}</p>
        <p className="text-xs text-gray-500 mt-2 font-medium flex items-center">
          <Clock className="h-3 w-3 mr-1" />
          {time}
        </p>
      </div>
      <ChevronRight className="h-4 w-4 text-gray-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all flex-shrink-0 mt-1" />
    </div>
  );
}

function QuickActionButton({ icon: Icon, label, onClick, gradient }: any) {
  return (
    <button 
      onClick={onClick}
      className={`group relative flex flex-col items-center p-5 bg-gradient-to-br from-white to-blue-50 hover:from-blue-500 hover:to-purple-600 rounded-2xl transition-all duration-300 hover:shadow-xl hover:-translate-y-2 border border-blue-100 overflow-hidden`}
    >
      <div className={`absolute inset-0 bg-gradient-to-r ${gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}></div>
      <div className="relative p-3 bg-gradient-to-br from-blue-100 to-purple-100 group-hover:from-white/20 group-hover:to-white/20 rounded-xl mb-3 group-hover:scale-110 transition-all duration-300 group-hover:rotate-12">
        <Icon className="h-6 w-6 text-blue-600 group-hover:text-white transition-colors" />
      </div>
      <span className="relative text-sm font-bold text-gray-900 group-hover:text-white transition-colors text-center">{label}</span>
      <ArrowRight className="h-4 w-4 text-transparent group-hover:text-white mt-2 group-hover:translate-x-1 transition-all" />
    </button>
  );
}