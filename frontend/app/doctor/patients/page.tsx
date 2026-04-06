'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import Navbar from '@/components/Navbar';
import Sidebar from '@/components/Sidebar';
import Toast, { ToastType } from '@/components/Toast';
import { doctorsAPI } from '@/services/api';
import { Users, User, Mail, Phone, Search } from 'lucide-react';

interface Patient {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth?: string;
  gender?: string;
  bloodGroup?: string;
}

export default function DoctorPatientsPage() {
  const { user } = useAuth();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [filteredPatients, setFilteredPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [showModal, setShowModal] = useState(false);

  const fetchPatients = useCallback(async () => {
    try {
      setLoading(true);
      const response = await doctorsAPI.getPatients(user?.id || '');
      setPatients(response.data.data);
      setFilteredPatients(response.data.data);
    } catch (error) {
      console.error('Failed to fetch patients:', error);
      setToast({ message: 'Failed to load patients', type: 'error' });
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    if (user?.id) {
      fetchPatients();
    }
  }, [user?.id, fetchPatients]);

  useEffect(() => {
    // Filter patients based on search query
    if (searchQuery.trim() === '') {
      setFilteredPatients(patients);
    } else {
      const query = searchQuery.toLowerCase();
      const filtered = patients.filter((patent) =>
        patent.firstName.toLowerCase().includes(query) ||
        patent.lastName.toLowerCase().includes(query) ||
        patent.email.toLowerCase().includes(query) ||
        patent.phone.includes(query)
      );
      setFilteredPatients(filtered);
    }
  }, [searchQuery, patients]);

  const calculateAge = (dateOfBirth?: string) => {
    if (!dateOfBirth) return 'N/A';
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  return (
    <ProtectedRoute allowedRoles={['doctor']}>
      <div className="min-h-screen bg-gray-50">
        <Navbar user={user} />
        <Sidebar role="doctor" />

        <div className="ml-0 md:ml-64 pt-20 p-4 md:p-8">
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-4xl font-bold text-gray-900 mb-2">My Patients</h1>
              <p className="text-gray-600">
                Total Patients: {patients.length}
              </p>
            </div>

            {/* Search Bar */}
            <div className="bg-white rounded-lg shadow-md p-4 mb-6">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by name, email, or phone..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Patients Grid */}
            {loading ? (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                <p className="mt-4 text-gray-600">Loading patients...</p>
              </div>
            ) : filteredPatients.length === 0 ? (
              <div className="bg-white rounded-lg shadow-md p-12 text-center">
                <Users className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-600 text-lg">
                  {searchQuery ? 'No patients match your search' : 'No patients found'}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredPatients.map((patient) => (
                  <div
                    key={patient._id}
                    onClick={() => {
                      setSelectedPatient(patient);
                      setShowModal(true);
                    }}
                    className="bg-white rounded-lg shadow-md hover:shadow-lg transition cursor-pointer p-6"
                  >
                    <div className="flex items-start">
                      <div className="flex items-center justify-center h-12 w-12 rounded-full bg-blue-100">
                        <User className="h-6 w-6 text-blue-600" />
                      </div>
                      <div className="ml-4 flex-1">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {patient.firstName} {patient.lastName}
                        </h3>
                        <p className="text-sm text-gray-600">Age: {calculateAge(patient.dateOfBirth)} years</p>
                      </div>
                    </div>

                    <div className="mt-4 space-y-2">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Mail className="h-4 w-4" />
                        <a href={`mailto:${patient.email}`} className="hover:text-blue-600">
                          {patient.email}
                        </a>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Phone className="h-4 w-4" />
                        <a href={`tel:${patient.phone}`} className="hover:text-blue-600">
                          {patient.phone}
                        </a>
                      </div>
                      {patient.gender && (
                        <p className="text-sm text-gray-600">Gender: <span className="capitalize">{patient.gender}</span></p>
                      )}
                      {patient.bloodGroup && (
                        <p className="text-sm text-gray-600">Blood Group: <span className="font-semibold">{patient.bloodGroup}</span></p>
                      )}
                    </div>

                    <button className="mt-4 w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-lg transition">
                      View Details
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Patient Details Modal */}
        {showModal && selectedPatient && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg max-w-2xl w-full p-6 max-h-96 overflow-y-auto">
              <div className="flex justify-between items-start">
                <h2 className="text-2xl font-bold text-gray-900">
                  {selectedPatient.firstName} {selectedPatient.lastName}
                </h2>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-500 hover:text-gray-700 text-2xl"
                >
                  ×
                </button>
              </div>

              <div className="mt-4 space-y-3">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Email</p>
                    <p className="font-semibold text-gray-900">{selectedPatient.email}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Phone</p>
                    <p className="font-semibold text-gray-900">{selectedPatient.phone}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Date of Birth</p>
                    <p className="font-semibold text-gray-900">
                      {selectedPatient.dateOfBirth
                        ? new Date(selectedPatient.dateOfBirth).toLocaleDateString()
                        : 'N/A'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Age</p>
                    <p className="font-semibold text-gray-900">{calculateAge(selectedPatient.dateOfBirth)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Gender</p>
                    <p className="font-semibold text-gray-900 capitalize">{selectedPatient.gender || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Blood Group</p>
                    <p className="font-semibold text-gray-900">{selectedPatient.bloodGroup || 'N/A'}</p>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex gap-3">
                <button
                  onClick={() => setShowModal(false)}
                  className="flex-1 bg-gray-600 hover:bg-gray-700 text-white font-semibold py-2 rounded-lg transition"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {toast && (
          <Toast
            message={toast.message}
            type={toast.type}
            onClose={() => setToast(null)}
          />
        )}
      </div>
    </ProtectedRoute>
  );
}
