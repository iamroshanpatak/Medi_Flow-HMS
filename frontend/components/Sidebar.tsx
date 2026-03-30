'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  Calendar,
  Users,
  Clock,
  FileText,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  X,
  Stethoscope,
  Activity,
  ClipboardList,
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';

interface SidebarProps {
  role: 'patient' | 'doctor' | 'admin' | 'staff';
}

const menuItems = {
  patient: [
    { icon: LayoutDashboard, label: 'Dashboard', href: '/patient/dashboard', gradient: 'from-blue-500 to-cyan-500' },
    { icon: Calendar, label: 'Appointments', href: '/patient/appointments', gradient: 'from-purple-500 to-pink-500' },
    { icon: Calendar, label: 'Book Appointment', href: '/patient/book-appointment', gradient: 'from-green-500 to-emerald-500' },
    { icon: Clock, label: 'Queue Status', href: '/patient/queue', gradient: 'from-orange-500 to-red-500' },
    { icon: FileText, label: 'Medical Records', href: '/patient/records', gradient: 'from-indigo-500 to-purple-500' },
    { icon: Stethoscope, label: 'Doctors', href: '/patient/doctors', gradient: 'from-teal-500 to-cyan-500' },
  ],
  doctor: [
    { icon: LayoutDashboard, label: 'Dashboard', href: '/doctor/dashboard', gradient: 'from-emerald-500 to-teal-500' },
    { icon: Calendar, label: 'Appointments', href: '/doctor/appointments', gradient: 'from-blue-500 to-cyan-500' },
    { icon: Clock, label: 'My Schedule', href: '/doctor/schedule', gradient: 'from-cyan-500 to-blue-500' },
    { icon: Clock, label: 'Queue Management', href: '/doctor/queue', gradient: 'from-orange-500 to-amber-500' },
    { icon: Users, label: 'Patients', href: '/doctor/patients', gradient: 'from-purple-500 to-pink-500' },
    { icon: FileText, label: 'Medical Records', href: '/doctor/medical-records', gradient: 'from-indigo-500 to-blue-500' },
    { icon: Activity, label: 'Analytics', href: '/doctor/analytics', gradient: 'from-green-500 to-emerald-500' },
  ],
  admin: [
    { icon: LayoutDashboard, label: 'Dashboard', href: '/admin/dashboard', gradient: 'from-violet-500 to-purple-500' },
    { icon: Users, label: 'Users', href: '/admin/users', gradient: 'from-blue-500 to-indigo-500' },
    { icon: Calendar, label: 'Appointments', href: '/admin/appointments', gradient: 'from-pink-500 to-rose-500' },
    { icon: Clock, label: 'Queue Monitor', href: '/admin/queue', gradient: 'from-orange-500 to-red-500' },
    { icon: ClipboardList, label: 'Walk-in', href: '/admin/walk-in', gradient: 'from-green-500 to-teal-500' },
    { icon: FileText, label: 'Reports', href: '/admin/reports', gradient: 'from-indigo-500 to-purple-500' },
  ],
  staff: [
    { icon: LayoutDashboard, label: 'Dashboard', href: '/staff/dashboard', gradient: 'from-blue-500 to-cyan-500' },
    { icon: Users, label: 'Patients', href: '/staff/patients', gradient: 'from-purple-500 to-pink-500' },
    { icon: Calendar, label: 'Appointments', href: '/staff/appointments', gradient: 'from-green-500 to-emerald-500' },
    { icon: Clock, label: 'Queue', href: '/staff/queue', gradient: 'from-orange-500 to-amber-500' },
    { icon: Settings, label: 'Settings', href: '/staff/settings', gradient: 'from-gray-500 to-slate-500' },
  ],
};

export default function Sidebar({ role }: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { logout } = useAuth();
  const items = menuItems[role] || menuItems.patient;

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const getRoleGradient = () => {
    switch (role) {
      case 'patient':
        return 'from-blue-600 to-purple-600';
      case 'doctor':
        return 'from-emerald-600 to-teal-600';
      case 'admin':
        return 'from-violet-600 to-purple-600';
      default:
        return 'from-blue-600 to-indigo-600';
    }
  };

  // Close mobile menu on route change
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsMobileOpen(false);
    }, 0);
    return () => clearTimeout(timer);
  }, [pathname]);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMobileOpen]);

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsMobileOpen(true)}
        className={`md:hidden fixed bottom-6 right-6 z-40 bg-gradient-to-r ${getRoleGradient()} text-white p-4 rounded-2xl shadow-2xl hover:shadow-3xl transition-all duration-300 hover:scale-110 animate-float`}
        aria-label="Open menu"
      >
        <LayoutDashboard className="h-6 w-6" />
      </button>

      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm z-40 transition-opacity animate-fade-in"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Mobile Sidebar */}
      <aside
        className={`md:hidden fixed top-0 left-0 h-full w-72 bg-gradient-to-b from-white via-gray-50 to-white z-50 transform transition-transform duration-300 shadow-2xl ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Mobile Header */}
          <div className={`flex items-center justify-between p-6 bg-gradient-to-r ${getRoleGradient()}`}>
            <h2 className="text-xl font-bold text-white flex items-center space-x-2">
              <LayoutDashboard className="h-6 w-6" />
              <span>Menu</span>
            </h2>
            <button
              onClick={() => setIsMobileOpen(false)}
              className="p-2 hover:bg-white/20 rounded-lg transition"
              aria-label="Close menu"
            >
              <X className="h-5 w-5 text-white" />
            </button>
          </div>

          {/* Menu items */}
          <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
            {items.map((item, index) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`group relative flex items-center space-x-3 px-4 py-3.5 rounded-xl transition-all duration-300 overflow-hidden ${
                    isActive
                      ? 'bg-gradient-to-r ' + item.gradient + ' text-white shadow-lg scale-105'
                      : 'text-gray-700 hover:bg-gradient-to-r hover:' + item.gradient + ' hover:text-white hover:shadow-md hover:scale-105'
                  } animate-slide-in`}
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div className={`relative z-10 p-2 rounded-lg ${isActive ? 'bg-white/20' : 'bg-gray-100 group-hover:bg-white/20'} transition-colors`}>
                    <Icon className="h-5 w-5 flex-shrink-0" />
                  </div>
                  <span className="relative z-10 font-semibold">{item.label}</span>
                  {isActive && (
                    <div className="absolute right-3 w-2 h-2 bg-white rounded-full animate-pulse"></div>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Logout button */}
          <div className="p-4 border-t border-gray-200">
            <button 
              onClick={handleLogout}
              className="flex items-center space-x-3 px-4 py-3.5 w-full rounded-xl text-red-600 hover:bg-gradient-to-r hover:from-red-500 hover:to-pink-500 hover:text-white transition-all duration-300 group hover:shadow-lg"
            >
              <div className="p-2 bg-red-100 group-hover:bg-white/20 rounded-lg transition-colors">
                <LogOut className="h-5 w-5 flex-shrink-0" />
              </div>
              <span className="font-semibold">Logout</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Desktop Sidebar */}
      <aside
        className={`${
          isCollapsed ? 'w-20' : 'w-72'
        } bg-gradient-to-b from-white via-gray-50 to-white border-r border-gray-200 h-screen sticky top-16 transition-all duration-300 hidden md:block shadow-lg`}
      >
        <div className="flex flex-col h-full">
          {/* Collapse button */}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className={`absolute -right-3 top-8 bg-gradient-to-r ${getRoleGradient()} text-white rounded-full p-1.5 hover:scale-110 transition-all duration-300 shadow-lg z-10`}
            aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {isCollapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
          </button>

          {/* Menu items */}
          <nav className="flex-1 px-4 py-6 space-y-2">
            {items.map((item, index) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`group relative flex items-center ${isCollapsed ? 'justify-center' : 'space-x-3'} px-4 py-3.5 rounded-xl transition-all duration-300 overflow-hidden ${
                    isActive
                      ? 'bg-gradient-to-r ' + item.gradient + ' text-white shadow-lg scale-105'
                      : 'text-gray-700 hover:bg-gradient-to-r hover:' + item.gradient + ' hover:text-white hover:shadow-md hover:scale-105'
                  } animate-slide-in`}
                  style={{ animationDelay: `${index * 50}ms` }}
                  title={isCollapsed ? item.label : ''}
                >
                  <div className={`relative z-10 p-2 rounded-lg ${isActive ? 'bg-white/20' : 'bg-gray-100 group-hover:bg-white/20'} transition-colors`}>
                    <Icon className="h-5 w-5 flex-shrink-0" />
                  </div>
                  {!isCollapsed && (
                    <>
                      <span className="relative z-10 font-semibold">{item.label}</span>
                      {isActive && (
                        <div className="absolute right-3 w-2 h-2 bg-white rounded-full animate-pulse"></div>
                      )}
                    </>
                  )}
                  {isCollapsed && isActive && (
                    <div className="absolute top-1/2 right-1 w-1.5 h-6 bg-white rounded-full transform -translate-y-1/2"></div>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Logout button */}
          <div className="p-4 border-t border-gray-200">
            <button
              onClick={handleLogout}
              className={`flex items-center ${isCollapsed ? 'justify-center' : 'space-x-3'} px-4 py-3.5 w-full rounded-xl text-red-600 hover:bg-gradient-to-r hover:from-red-500 hover:to-pink-500 hover:text-white transition-all duration-300 group hover:shadow-lg`}
              title={isCollapsed ? 'Logout' : ''}
            >
              <div className="p-2 bg-red-100 group-hover:bg-white/20 rounded-lg transition-colors">
                <LogOut className="h-5 w-5 flex-shrink-0" />
              </div>
              {!isCollapsed && <span className="font-semibold">Logout</span>}
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
