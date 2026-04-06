'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Hospital, Menu, X, Bell, User, Settings, LogOut, UserCircle, Edit, Mail, Phone, Calendar, CheckCircle } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useTranslation } from '@/hooks/useTranslation';
import Toast from './Toast';
import LanguageSelector from './LanguageSelector';

interface NavbarProps {
  user?: {
    id?: string;
    firstName?: string;
    lastName?: string;
    name?: string;
    email?: string;
    phone?: string;
    dateOfBirth?: string;
    gender?: string;
    role: string;
  } | null;
}

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  read: boolean;
  createdAt: string;
}

export default function Navbar({ user }: NavbarProps) {
  const { t } = useTranslation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>(() => [
    {
      id: '1',
      title: 'Appointment Reminder',
      message: 'You have an appointment tomorrow at 10:00 AM',
      type: 'info' as const,
      read: false,
      createdAt: new Date().toISOString()
    },
    {
      id: '2',
      title: 'Test Results Ready',
      message: 'Your recent test results are now available',
      type: 'success' as const,
      read: false,
      createdAt: new Date(Date.now() - 3600000).toISOString()
    },
    {
      id: '3',
      title: 'Payment Due',
      message: 'Payment for last visit is due in 3 days',
      type: 'warning' as const,
      read: true,
      createdAt: new Date(Date.now() - 86400000).toISOString()
    }
  ]);
  const [editForm, setEditForm] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    phone: user?.phone || '',
    dateOfBirth: user?.dateOfBirth || '',
    gender: user?.gender || ''
  });
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' as 'success' | 'error' });
  
  const router = useRouter();
  const { logout, updateProfile } = useAuth();
  const notificationRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);
  
  const displayName = user?.firstName && user?.lastName 
    ? `${user.firstName} ${user.lastName}` 
    : user?.name || 'User';

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleMarkAsRead = (id: string) => {
    setNotifications(notifications.map(n => 
      n.id === id ? { ...n, read: true } : n
    ));
  };

  const handleLogout = () => {
    logout();
    setShowUserMenu(false);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateProfile(editForm);
      setToast({ show: true, message: 'Profile updated successfully!', type: 'success' });
      setShowEditModal(false);
    } catch (err) {
      console.error('Profile update error:', err);
      setToast({ show: true, message: 'Failed to update profile', type: 'error' });
    }
  };

  const getRoleGradient = () => {
    switch (user?.role) {
      case 'patient':
        return 'from-blue-600 via-purple-600 to-indigo-600';
      case 'doctor':
        return 'from-emerald-600 via-teal-600 to-cyan-600';
      case 'admin':
        return 'from-violet-600 via-purple-600 to-fuchsia-600';
      default:
        return 'from-blue-600 to-purple-600';
    }
  };

  return (
    <>
      <nav className={`bg-gradient-to-r ${getRoleGradient()} shadow-lg sticky top-0 z-50 backdrop-blur-lg bg-opacity-95`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center space-x-3 group">
              <div className="relative">
                <div className="absolute inset-0 bg-white rounded-lg blur-lg opacity-50 group-hover:opacity-75 transition"></div>
                <div className="relative bg-white p-2 rounded-lg shadow-xl">
                  <Hospital className="h-6 w-6 text-blue-600" />
                </div>
              </div>
              <span className="text-2xl font-bold text-white drop-shadow-lg">MediFlow</span>
            </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {!user && (
              <>
                <Link
                  href="/"
                  className="text-white/90 hover:text-white font-medium transition"
                >
                  {t('nav.home')}
                </Link>
                <Link
                  href="/about"
                  className="text-white/90 hover:text-white font-medium transition"
                >
                  {t('nav.about')}
                </Link>
                <Link
                  href="/services"
                  className="text-white/90 hover:text-white font-medium transition"
                >
                  {t('nav.services')}
                </Link>
                <Link
                  href="/contact"
                  className="text-white/90 hover:text-white font-medium transition"
                >
                  {t('nav.contact')}
                </Link>
              </>
            )}
          </div>

          {/* Right side */}
          <div className="hidden md:flex items-center space-x-4">
            {user ? (
              <>
                {/* Notification Bell */}
                <div className="relative" ref={notificationRef}>
                  <button 
                    onClick={() => setShowNotifications(!showNotifications)}
                    className="relative p-2.5 text-white hover:bg-white/20 rounded-xl transition-all duration-300 group"
                    aria-label="Notifications"
                  >
                    <Bell className="h-5 w-5" />
                    {unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center animate-pulse">
                        {unreadCount}
                      </span>
                    )}
                  </button>

                  {/* Notifications Dropdown */}
                  {showNotifications && (
                    <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-50 animate-slide-in">
                      <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-4 py-3">
                        <h3 className="text-white font-semibold">{t('nav.notifications')}</h3>
                      </div>
                      <div className="max-h-96 overflow-y-auto">
                        {notifications.length > 0 ? (
                          notifications.map((notification) => (
                            <div
                              key={notification.id}
                              onClick={() => handleMarkAsRead(notification.id)}
                              className={`px-4 py-3 border-b border-gray-100 cursor-pointer transition-all duration-200 ${
                                notification.read ? 'bg-white hover:bg-gray-50' : 'bg-blue-50 hover:bg-blue-100'
                              }`}
                            >
                              <div className="flex items-start space-x-3">
                                <div className={`p-2 rounded-lg ${
                                  notification.type === 'success' ? 'bg-green-100 text-green-600' :
                                  notification.type === 'warning' ? 'bg-yellow-100 text-yellow-600' :
                                  notification.type === 'error' ? 'bg-red-100 text-red-600' :
                                  'bg-blue-100 text-blue-600'
                                }`}>
                                  <Bell className="h-4 w-4" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-semibold text-gray-900">{notification.title}</p>
                                  <p className="text-xs text-gray-600 mt-1">{notification.message}</p>
                                  <p className="text-xs text-gray-400 mt-1">
                                    {new Date(notification.createdAt).toLocaleTimeString()}
                                  </p>
                                </div>
                                {!notification.read && (
                                  <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                                )}
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="px-4 py-8 text-center text-gray-500">
                            <Bell className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                            <p>No notifications</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Language Selector */}
                <LanguageSelector />

                {/* User Profile Dropdown */}
                <div className="relative" ref={userMenuRef}>
                  <button
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="flex items-center space-x-3 px-4 py-2 bg-white/20 hover:bg-white/30 rounded-xl backdrop-blur-sm transition-all duration-300 group"
                  >
                    <div className="relative">
                      <div className="h-9 w-9 bg-gradient-to-br from-white to-blue-100 rounded-full flex items-center justify-center shadow-lg">
                        <User className="h-5 w-5 text-blue-600" />
                      </div>
                      <div className="absolute -bottom-0.5 -right-0.5 h-3 w-3 bg-green-400 border-2 border-white rounded-full"></div>
                    </div>
                    <div className="text-left">
                      <p className="text-sm font-semibold text-white">{displayName}</p>
                      <p className="text-xs text-white/80 capitalize">{user.role}</p>
                    </div>
                  </button>

                  {/* User Menu Dropdown */}
                  {showUserMenu && (
                    <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-50 animate-slide-in">
                      {/* User Info Header */}
                      <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-4 py-4">
                        <div className="flex items-center space-x-3">
                          <div className="h-12 w-12 bg-white rounded-full flex items-center justify-center shadow-lg">
                            <User className="h-6 w-6 text-blue-600" />
                          </div>
                          <div>
                            <p className="text-white font-semibold">{displayName}</p>
                            <p className="text-white/80 text-xs capitalize">{user.role}</p>
                          </div>
                        </div>
                      </div>

                      {/* User Details */}
                      <div className="px-4 py-3 border-b border-gray-100 bg-gray-50">
                        <div className="space-y-2 text-xs">
                          {user.email && (
                            <div className="flex items-center space-x-2 text-gray-600">
                              <Mail className="h-3.5 w-3.5" />
                              <span>{user.email}</span>
                            </div>
                          )}
                          {user.phone && (
                            <div className="flex items-center space-x-2 text-gray-600">
                              <Phone className="h-3.5 w-3.5" />
                              <span>{user.phone}</span>
                            </div>
                          )}
                          {user.dateOfBirth && (
                            <div className="flex items-center space-x-2 text-gray-600">
                              <Calendar className="h-3.5 w-3.5" />
                              <span>{new Date(user.dateOfBirth).toLocaleDateString()}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Menu Items */}
                      <div className="py-2">
                        <button
                          onClick={() => {
                            if (user) {
                              setEditForm({
                                firstName: user.firstName || '',
                                lastName: user.lastName || '',
                                phone: user.phone || '',
                                dateOfBirth: user.dateOfBirth || '',
                                gender: user.gender || ''
                              });
                            }
                            setShowEditModal(true);
                            setShowUserMenu(false);
                          }}
                          className="w-full px-4 py-2.5 text-left text-gray-700 hover:bg-blue-50 transition-colors flex items-center space-x-3 group"
                        >
                          <Edit className="h-4 w-4 text-gray-500 group-hover:text-blue-600" />
                          <span className="text-sm font-medium">Edit Profile</span>
                        </button>
                        <button
                          onClick={() => router.push('/profile')}
                          className="w-full px-4 py-2.5 text-left text-gray-700 hover:bg-blue-50 transition-colors flex items-center space-x-3 group"
                        >
                          <UserCircle className="h-4 w-4 text-gray-500 group-hover:text-blue-600" />
                          <span className="text-sm font-medium">View Profile</span>
                        </button>
                        <button
                          onClick={() => router.push(`/${user.role}/dashboard`)}
                          className="w-full px-4 py-2.5 text-left text-gray-700 hover:bg-blue-50 transition-colors flex items-center space-x-3 group"
                        >
                          <Settings className="h-4 w-4 text-gray-500 group-hover:text-blue-600" />
                          <span className="text-sm font-medium">{t('nav.dashboard')}</span>
                        </button>
                      </div>

                      {/* Logout */}
                      <div className="border-t border-gray-100 py-2">
                        <button
                          onClick={handleLogout}
                          className="w-full px-4 py-2.5 text-left text-red-600 hover:bg-red-50 transition-colors flex items-center space-x-3 group"
                        >
                          <LogOut className="h-4 w-4" />
                          <span className="text-sm font-medium">{t('nav.logout')}</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="px-4 py-2 text-white/90 hover:text-white font-medium transition"
                >
                  Login
                </Link>
                <Link
                  href="/register"
                  className="px-6 py-2.5 bg-white text-blue-600 font-semibold rounded-xl hover:bg-white/90 transition-all duration-300 shadow-lg hover:shadow-xl"
                >
                  Register
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 text-white hover:bg-white/20 rounded-lg transition"
          >
            {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white/95 backdrop-blur-lg border-t animate-slide-in">
          <div className="px-4 pt-2 pb-4 space-y-2">
            {user ? (
              <>
                <div className="px-3 py-3 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg mb-3">
                  <div className="flex items-center space-x-3">
                    <div className="h-10 w-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
                      <User className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{displayName}</p>
                      <p className="text-xs text-gray-600 capitalize">{user.role}</p>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setShowNotifications(true);
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full text-left px-3 py-2 rounded-md text-gray-700 hover:bg-gray-100 flex items-center space-x-2"
                >
                  <Bell className="h-5 w-5" />
                  <span>{t('nav.notifications')}</span>
                  {unreadCount > 0 && (
                    <span className="ml-auto bg-red-500 text-white text-xs rounded-full px-2 py-0.5">
                      {unreadCount}
                    </span>
                  )}
                </button>
                <button
                  onClick={() => {
                    if (user) {
                      setEditForm({
                        firstName: user.firstName || '',
                        lastName: user.lastName || '',
                        phone: user.phone || '',
                        dateOfBirth: user.dateOfBirth || '',
                        gender: user.gender || ''
                      });
                    }
                    setShowEditModal(true);
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full text-left px-3 py-2 rounded-md text-gray-700 hover:bg-gray-100 flex items-center space-x-2"
                >
                  <Edit className="h-5 w-5" />
                  <span>{t('nav.edit_profile')}</span>
                </button>
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-3 py-2 rounded-md text-red-600 hover:bg-red-50 flex items-center space-x-2"
                >
                  <LogOut className="h-5 w-5" />
                  <span>{t('nav.logout')}</span>
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/"
                  className="block px-3 py-2 rounded-md text-gray-700 hover:bg-gray-100"
                >
                  {t('nav.home')}
                </Link>
                <Link
                  href="/about"
                  className="block px-3 py-2 rounded-md text-gray-700 hover:bg-gray-100"
                >
                  {t('nav.about')}
                </Link>
                <Link
                  href="/services"
                  className="block px-3 py-2 rounded-md text-gray-700 hover:bg-gray-100"
                >
                  {t('nav.services')}
                </Link>
                <Link
                  href="/contact"
                  className="block px-3 py-2 rounded-md text-gray-700 hover:bg-gray-100"
                >
                  {t('nav.contact')}
                </Link>
                <Link
                  href="/login"
                  className="block px-3 py-2 rounded-md text-gray-700 hover:bg-gray-100"
                >
                  {t('nav.login')}
                </Link>
                <Link
                  href="/register"
                  className="block px-3 py-2 rounded-md bg-blue-600 text-white text-center hover:bg-blue-700"
                >
                  {t('nav.register')}
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>

    {/* Edit Profile Modal */}
    {showEditModal && (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
        <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto animate-slide-in">
          {/* Modal Header */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-4 flex justify-between items-center sticky top-0 z-10">
            <h2 className="text-xl font-bold text-white flex items-center space-x-2">
              <Edit className="h-5 w-5" />
              <span>Edit Profile</span>
            </h2>
            <button
              onClick={() => setShowEditModal(false)}
              className="text-white hover:bg-white/20 p-1.5 rounded-lg transition"
              aria-label="Close modal"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Modal Body */}
          <form onSubmit={handleEditSubmit} className="p-6 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  First Name
                </label>
                <input
                  type="text"
                  title="First Name"
                  value={editForm.firstName}
                  onChange={(e) => setEditForm({ ...editForm, firstName: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Last Name
                </label>
                <input
                  type="text"
                  title="Last Name"
                  value={editForm.lastName}
                  onChange={(e) => setEditForm({ ...editForm, lastName: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phone Number
              </label>
              <input
                type="tel"
                value={editForm.phone}
                onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                placeholder="+1 (555) 000-0000"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date of Birth
              </label>
              <input
                type="date"
                title="Date of Birth"
                value={editForm.dateOfBirth}
                onChange={(e) => setEditForm({ ...editForm, dateOfBirth: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Gender
              </label>
              <select
                title="Gender"
                value={editForm.gender}
                onChange={(e) => setEditForm({ ...editForm, gender: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
              >
                <option value="">Select Gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>

            {/* Confirmation Message */}
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-start space-x-3">
              <CheckCircle className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-blue-800">
                <p className="font-semibold">Confirm Changes</p>
                <p className="text-blue-700 mt-1">
                  Please review your information before saving. Changes will update your profile immediately.
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-3 pt-4">
              <button
                type="button"
                onClick={() => setShowEditModal(false)}
                className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-purple-700 transition shadow-lg hover:shadow-xl"
              >
                Save Changes
              </button>
            </div>
          </form>
        </div>
      </div>
    )}

    {/* Toast Notification */}
    {toast.show && (
      <Toast
        message={toast.message}
        type={toast.type}
        onClose={() => setToast({ ...toast, show: false })}
      />
    )}
  </>
  );
}
