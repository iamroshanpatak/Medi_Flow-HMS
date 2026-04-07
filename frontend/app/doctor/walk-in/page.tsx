'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import Navbar from '@/components/Navbar';
import Sidebar from '@/components/Sidebar';
import Toast, { ToastType } from '@/components/Toast';
import { queueAPI, usersAPI } from '@/services/api';
import { UserPlus, Search, AlertCircle, CheckCircle, Phone, Mail } from 'lucide-react';

interface Patient {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
}

export default function DoctorWalkInPage() {
  const { user } = useAuth();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [filteredPatients, setFilteredPatients] = useState<Patient[]>([]);
  const [selectedPatient, setSelectedPatient] = useState('');
  const [searchPatient, setSearchPatient] = useState('');
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    fetchPatients();
  }, []);

  useEffect(() => {
    // Filter patients based on search
    if (searchPatient.trim() === '') {
      setFilteredPatients(patients);
    } else {
      const query = searchPatient.toLowerCase();
      const filtered = patients.filter(
        (patient) =>
          patient.firstName.toLowerCase().includes(query) ||
          patient.lastName.toLowerCase().includes(query) ||
          patient.email.toLowerCase().includes(query) ||
          patient.phone.includes(query)
      );
      setFilteredPatients(filtered);
    }
  }, [searchPatient, patients]);

  const fetchPatients = async () => {
    try {
      const response = await usersAPI.getPatients();
      setPatients(response.data.data);
      setFilteredPatients(response.data.data);
    } catch (error) {
      console.error('Failed to fetch patients:', error);
      setToast({ message: 'Failed to load patients', type: 'error' });
    } finally {
      setPageLoading(false);
    }
  };

  const handleCheckIn = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedPatient) {
      setToast({ message: 'Please select a patient', type: 'error' });
      return;
    }

    setLoading(true);
    try {
      await queueAPI.walkIn({
        patientId: selectedPatient,
        doctorId: user?.id || '',
        reason: reason || 'Walk-in consultation',
      });

      setToast({ message: 'Patient checked in successfully!', type: 'success' });
      setSelectedPatient('');
      setReason('');
      setSubmitted(true);
      
      setTimeout(() => setSubmitted(false), 3000);
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

  return (
    <ProtectedRoute allowedRoles={['doctor']}>
      <div className="min-h-screen bg-gray-50">
        <Navbar user={user} />
        <Sidebar role="doctor" />

        <div className="ml-0 md:ml-64 pt-20 p-4 md:p-8">
          <div className="max-w-2xl mx-auto">
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-4xl font-bold text-gray-900 mb-2 flex items-center">
                <UserPlus className="w-8 h-8 mr-3 text-blue-600" />
                Check-in Walk-in Patient
              </h1>
              <p className="text-gray-600">Register and check in a patient who arrived without an appointment</p>
            </div>

            {/* Info Box */}
            <div className="bg-blue-50 border-l-4 border-blue-600 p-4 rounded-lg mb-8 flex">
              <AlertCircle className="w-5 h-5 text-blue-600 mr-3 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-blue-800">
                <p className="font-semibold mb-1">Walk-in Check-in</p>
                <p>Select a registered patient from the list or create a new patient. Provide a reason for the visit if applicable.</p>
              </div>
            </div>

            {pageLoading ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              </div>
            ) : (
              <form onSubmit={handleCheckIn} className="space-y-6">
                {/* Patient Search */}
                <div className="bg-white rounded-lg shadow-md p-6">
                  <label className="block text-lg font-semibold text-gray-900 mb-4">
                    Select Patient
                  </label>

                  {/* Search Input */}
                  <div className="mb-4">
                    <div className="relative">
                      <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Search by name, email, or phone..."
                        value={searchPatient}
                        onChange={(e) => setSearchPatient(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <p className="text-sm text-gray-600 mt-2">
                      Found {filteredPatients.length} patient{filteredPatients.length !== 1 ? 's' : ''}
                    </p>
                  </div>

                  {/* Patient List */}
                  <div className="space-y-2 max-h-64 overflow-y-auto border border-gray-200 rounded-lg p-2">
                    {filteredPatients.length === 0 ? (
                      <div className="text-center py-8">
                        <p className="text-gray-600">No patients found</p>
                      </div>
                    ) : (
                      filteredPatients.map((patient) => (
                        <button
                          key={patient._id}
                          type="button"
                          onClick={() => setSelectedPatient(patient._id)}
                          className={`w-full text-left p-3 rounded-lg transition ${
                            selectedPatient === patient._id
                              ? 'bg-blue-100 border-2 border-blue-600'
                              : 'bg-gray-50 border-2 border-gray-200 hover:border-blue-400'
                          }`}
                        >
                          <div className="font-semibold text-gray-900">
                            {patient.firstName} {patient.lastName}
                          </div>
                          <div className="flex gap-4 mt-2 text-sm text-gray-600">
                            <span className="flex items-center">
                              <Mail className="w-3 h-3 mr-1" />
                              {patient.email}
                            </span>
                            <span className="flex items-center">
                              <Phone className="w-3 h-3 mr-1" />
                              {patient.phone}
                            </span>
                          </div>
                        </button>
                      ))
                    )}
                  </div>
                </div>

                {/* Reason for Visit */}
                <div className="bg-white rounded-lg shadow-md p-6">
                  <label htmlFor="reason" className="block text-lg font-semibold text-gray-900 mb-4">
                    Reason for Visit (Optional)
                  </label>
                  <textarea
                    id="reason"
                    placeholder="e.g., General checkup, Follow-up consultation, Emergency..."
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  />
                </div>

                {/* Submit Button */}
                <div className="flex gap-3">
                  <button
                    type="submit"
                    disabled={loading || !selectedPatient}
                    className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Checking in...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="w-5 h-5 mr-2" />
                        Check in Patient
                      </>
                    )}
                  </button>
                </div>

                {/* Success Message */}
                {submitted && (
                  <div className="bg-green-50 border-l-4 border-green-600 p-4 rounded-lg flex">
                    <CheckCircle className="w-5 h-5 text-green-600 mr-3 mt-0.5 flex-shrink-0" />
                    <div className="text-sm text-green-800">
                      <p className="font-semibold">Patient checked in successfully!</p>
                      <p>The patient has been added to your queue.</p>
                    </div>
                  </div>
                )}
              </form>
            )}
          </div>
        </div>

        {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      </div>
    </ProtectedRoute>
  );
}
