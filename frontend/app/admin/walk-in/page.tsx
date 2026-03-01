'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import Navbar from '@/components/Navbar';
import Sidebar from '@/components/Sidebar';
import Toast, { ToastType } from '@/components/Toast';
import { queueAPI, doctorsAPI, usersAPI } from '@/services/api';
import { UserPlus, Search, Users, AlertCircle, CheckCircle } from 'lucide-react';

interface Doctor {
  _id: string;
  firstName: string;
  lastName: string;
  specialization: string;
  department: string;
}

interface Patient {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
}

export default function WalkInCheckInPage() {
  const { user } = useAuth();
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [selectedDoctor, setSelectedDoctor] = useState('');
  const [selectedPatient, setSelectedPatient] = useState('');
  const [searchPatient, setSearchPatient] = useState('');
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null);

  useEffect(() => {
    fetchDoctors();
    fetchPatients();
  }, []);

  const fetchDoctors = async () => {
    try {
      const response = await doctorsAPI.getAll();
      setDoctors(response.data.data);
    } catch (error) {
      console.error('Failed to fetch doctors:', error);
      setToast({ message: 'Failed to load doctors', type: 'error' });
    }
  };

  const fetchPatients = async () => {
    try {
      const response = await usersAPI.getPatients();
      setPatients(response.data.data);
    } catch (error) {
      console.error('Failed to fetch patients:', error);
    }
  };

  const handleCheckIn = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedDoctor || !selectedPatient) {
      setToast({ message: 'Please select both doctor and patient', type: 'error' });
      return;
    }

    setLoading(true);
    try {
      await queueAPI.walkIn({
        patientId: selectedPatient,
        doctorId: selectedDoctor,
        reason: reason || 'Walk-in consultation',
      });

      setToast({ message: 'Patient checked in successfully!', type: 'success' });
      
      // Reset form
      setSelectedDoctor('');
      setSelectedPatient('');
      setReason('');
      setSearchPatient('');
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      setToast({
        message: err.response?.data?.message || 'Failed to check in patient',
        type: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredPatients = patients.filter(
    (patient) =>
      patient.firstName.toLowerCase().includes(searchPatient.toLowerCase()) ||
      patient.lastName.toLowerCase().includes(searchPatient.toLowerCase()) ||
      patient.phone.includes(searchPatient)
  );

  return (
    <ProtectedRoute allowedRoles={['admin', 'staff']}>
      <div className="min-h-screen bg-gray-50">
        <Navbar user={user} />
        <div className="flex">
          <Sidebar role={user?.role || 'admin'} />
          <main className="flex-1 p-4 sm:p-6 lg:p-8 pb-24 md:pb-8">
            <div className="max-w-4xl mx-auto">
              {/* Header */}
              <div className="mb-6 sm:mb-8">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <UserPlus className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Walk-In Check In</h1>
                    <p className="text-sm sm:text-base text-gray-600 mt-1">
                      Register walk-in patients to doctor queues
                    </p>
                  </div>
                </div>
              </div>

              {/* Info Alert */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 flex items-start space-x-3">
                <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-blue-800">
                  <p className="font-medium mb-1">Walk-In Patient Registration</p>
                  <p className="text-blue-700">
                    Select the doctor and patient, then add them to the queue. The patient will receive a token
                    number and their position in the queue.
                  </p>
                </div>
              </div>

              {/* Check-In Form */}
              <div className="bg-white rounded-xl shadow-sm border p-6 sm:p-8">
                <form onSubmit={handleCheckIn} className="space-y-6">
                  {/* Doctor Selection */}
                  <div>
                    <label htmlFor="doctor" className="block text-sm font-medium text-gray-700 mb-2">
                      Select Doctor *
                    </label>
                    <select
                      id="doctor"
                      value={selectedDoctor}
                      onChange={(e) => setSelectedDoctor(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    >
                      <option value="">Choose a doctor...</option>
                      {doctors.map((doctor) => (
                        <option key={doctor._id} value={doctor._id}>
                          Dr. {doctor.firstName} {doctor.lastName} - {doctor.specialization}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Patient Search */}
                  <div>
                    <label htmlFor="patient-search" className="block text-sm font-medium text-gray-700 mb-2">
                      Search Patient *
                    </label>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input
                        id="patient-search"
                        type="text"
                        placeholder="Search by name or phone..."
                        value={searchPatient}
                        onChange={(e) => setSearchPatient(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  </div>

                  {/* Patient List */}
                  {searchPatient && (
                    <div className="border border-gray-200 rounded-lg max-h-64 overflow-y-auto">
                      {filteredPatients.length > 0 ? (
                        <div className="divide-y divide-gray-200">
                          {filteredPatients.map((patient) => (
                            <button
                              key={patient._id}
                              type="button"
                              onClick={() => {
                                setSelectedPatient(patient._id);
                                setSearchPatient(`${patient.firstName} ${patient.lastName}`);
                              }}
                              className={`w-full text-left px-4 py-3 hover:bg-gray-50 transition ${
                                selectedPatient === patient._id ? 'bg-blue-50 border-l-4 border-blue-600' : ''
                              }`}
                            >
                              <div className="flex items-center justify-between">
                                <div>
                                  <p className="font-medium text-gray-900">
                                    {patient.firstName} {patient.lastName}
                                  </p>
                                  <p className="text-sm text-gray-600">{patient.phone}</p>
                                </div>
                                {selectedPatient === patient._id && (
                                  <CheckCircle className="w-5 h-5 text-blue-600" />
                                )}
                              </div>
                            </button>
                          ))}
                        </div>
                      ) : (
                        <div className="p-8 text-center text-gray-500">
                          <Users className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                          <p>No patients found</p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Reason */}
                  <div>
                    <label htmlFor="reason" className="block text-sm font-medium text-gray-700 mb-2">
                      Reason for Visit (Optional)
                    </label>
                    <textarea
                      id="reason"
                      rows={3}
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                      placeholder="e.g., Fever and cough, Follow-up consultation..."
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 font-medium placeholder-gray-400"
                    />
                  </div>

                  {/* Submit Button */}
                  <div className="flex flex-col sm:flex-row gap-3 pt-4">
                    <button
                      type="submit"
                      disabled={loading || !selectedDoctor || !selectedPatient}
                      className={`flex-1 flex items-center justify-center space-x-2 px-6 py-3 rounded-lg font-medium transition ${
                        loading || !selectedDoctor || !selectedPatient
                          ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                          : 'bg-blue-600 text-white hover:bg-blue-700'
                      }`}
                    >
                      {loading ? (
                        <>
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                          <span>Checking in...</span>
                        </>
                      ) : (
                        <>
                          <UserPlus className="w-5 h-5" />
                          <span>Check In Patient</span>
                        </>
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedDoctor('');
                        setSelectedPatient('');
                        setReason('');
                        setSearchPatient('');
                      }}
                      className="sm:w-32 px-6 py-3 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition"
                    >
                      Reset
                    </button>
                  </div>
                </form>
              </div>

              {/* Quick Stats */}
              <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-white rounded-lg shadow-sm border p-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Users className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Available Doctors</p>
                      <p className="text-2xl font-bold text-gray-900">{doctors.length}</p>
                    </div>
                  </div>
                </div>
                <div className="bg-white rounded-lg shadow-sm border p-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                      <Users className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Registered Patients</p>
                      <p className="text-2xl font-bold text-gray-900">{patients.length}</p>
                    </div>
                  </div>
                </div>
                <div className="bg-white rounded-lg shadow-sm border p-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                      <CheckCircle className="w-5 h-5 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Status</p>
                      <p className="text-lg font-semibold text-gray-900">Active</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </main>
        </div>
        {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      </div>
    </ProtectedRoute>
  );
}
