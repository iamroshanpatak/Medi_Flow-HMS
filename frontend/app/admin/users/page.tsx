'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import Navbar from '@/components/Navbar';
import Sidebar from '@/components/Sidebar';
import Toast, { ToastType } from '@/components/Toast';
import { Users, Search, Plus, Edit, Trash2, Filter, Mail, Phone } from 'lucide-react';
import api from '@/services/api';

interface UserData {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  role: 'patient' | 'doctor' | 'admin' | 'staff';
  createdAt: string;
}

export default function AdminUsersPage() {
  const { user } = useAuth();
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      // This endpoint needs to be created in the backend
      const response = await api.get('/api/users');
      setUsers(response.data.users || []);
    } catch (err) {
      console.error('Failed to fetch users:', err);
      // For now, use mock data
      setUsers([
        {
          _id: '1',
          firstName: 'John',
          lastName: 'Doe',
          email: 'john@example.com',
          phone: '1234567890',
          role: 'patient',
          createdAt: '2024-01-15',
        },
        {
          _id: '2',
          firstName: 'Sarah',
          lastName: 'Johnson',
          email: 'sarah@example.com',
          phone: '9876543210',
          role: 'doctor',
          createdAt: '2024-01-10',
        },
        {
          _id: '3',
          firstName: 'Admin',
          lastName: 'User',
          email: 'admin@example.com',
          phone: '5555555555',
          role: 'admin',
          createdAt: '2024-01-01',
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('Are you sure you want to delete this user?')) return;

    try {
      await api.delete(`/api/users/${userId}`);
      setUsers(users.filter(u => u._id !== userId));
      setToast({ message: 'User deleted successfully', type: 'success' });
    } catch {
      setToast({ message: 'Failed to delete user', type: 'error' });
    }
  };

  const filteredUsers = users.filter(u => {
    const matchesSearch = 
      u.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'all' || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-purple-100 text-purple-800';
      case 'doctor': return 'bg-blue-100 text-blue-800';
      case 'staff': return 'bg-green-100 text-green-800';
      case 'patient': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
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
              <div className="mb-8 flex justify-between items-center">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                    <Users className="w-8 h-8 mr-3 text-blue-600" />
                    User Management
                  </h1>
                  <p className="text-gray-600 mt-2">Manage all system users and their roles</p>
                </div>
                <button
                  onClick={() => setToast({ message: 'Add user feature coming soon!', type: 'info' })}
                  className="flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold"
                >
                  <Plus className="w-5 h-5" />
                  <span>Add User</span>
                </button>
              </div>

              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <div className="bg-white p-6 rounded-lg shadow-md">
                  <p className="text-sm text-gray-600 mb-1">Total Users</p>
                  <p className="text-3xl font-bold text-gray-900">{users.length}</p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-md">
                  <p className="text-sm text-gray-600 mb-1">Patients</p>
                  <p className="text-3xl font-bold text-blue-600">
                    {users.filter(u => u.role === 'patient').length}
                  </p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-md">
                  <p className="text-sm text-gray-600 mb-1">Doctors</p>
                  <p className="text-3xl font-bold text-green-600">
                    {users.filter(u => u.role === 'doctor').length}
                  </p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-md">
                  <p className="text-sm text-gray-600 mb-1">Staff</p>
                  <p className="text-3xl font-bold text-purple-600">
                    {users.filter(u => u.role === 'staff' || u.role === 'admin').length}
                  </p>
                </div>
              </div>

              {/* Search and Filters */}
              <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="text"
                      placeholder="Search users by name or email..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
                    />
                  </div>
                  <div className="relative">
                    <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <select
                      value={roleFilter}
                      onChange={(e) => setRoleFilter(e.target.value)}
                      title="Filter by role"
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none text-black"
                    >
                      <option value="all">All Roles</option>
                      <option value="patient">Patients</option>
                      <option value="doctor">Doctors</option>
                      <option value="staff">Staff</option>
                      <option value="admin">Admins</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Users Table */}
              <div className="bg-white rounded-lg shadow-md overflow-hidden">
                {loading ? (
                  <div className="p-8 text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="text-gray-600 mt-4">Loading users...</p>
                  </div>
                ) : filteredUsers.length === 0 ? (
                  <div className="p-8 text-center text-gray-600">
                    <Users className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                    <p>No users found</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50 border-b">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            User
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Contact
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Role
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Joined
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {filteredUsers.map((userData) => (
                          <tr key={userData._id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-semibold">
                                  {userData.firstName[0]}{userData.lastName[0]}
                                </div>
                                <div className="ml-4">
                                  <div className="text-sm font-medium text-gray-900">
                                    {userData.firstName} {userData.lastName}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900 flex items-center">
                                <Mail className="w-4 h-4 mr-2 text-gray-400" />
                                {userData.email}
                              </div>
                              {userData.phone && (
                                <div className="text-sm text-gray-500 flex items-center mt-1">
                                  <Phone className="w-4 h-4 mr-2 text-gray-400" />
                                  {userData.phone}
                                </div>
                              )}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full capitalize ${getRoleBadgeColor(userData.role)}`}>
                                {userData.role}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {new Date(userData.createdAt).toLocaleDateString()}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              <button 
                                title="Edit user"
                                className="text-blue-600 hover:text-blue-900 mr-4"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteUser(userData._id)}
                                title="Delete user"
                                className="text-red-600 hover:text-red-900"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
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
