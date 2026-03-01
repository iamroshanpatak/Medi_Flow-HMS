'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { medicalRecordsAPI, usersAPI } from '@/services/api';
import { useRouter } from 'next/navigation';

interface MedicalRecord {
  _id: string;
  patient: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    dateOfBirth: string;
    gender: string;
    bloodGroup: string;
  };
  doctor: {
    firstName: string;
    lastName: string;
    specialization: string;
  };
  recordType: string;
  recordDate: string;
  vitalSigns?: {
    bloodPressure: {
      systolic: number;
      diastolic: number;
    };
    heartRate: number;
    temperature: number;
    weight: number;
    height: number;
    bmi: number;
  };
  riskAssessment?: {
    overallHealthScore: number;
    recommendations: string[];
  };
  diagnosis?: {
    primary: string;
    secondary: string[];
  };
  prescription?: Array<{
    medication: string;
    dosage: string;
    frequency: string;
  }>;
  notes?: string;
}

interface Patient {
  _id: string;
  firstName: string;
  lastName: string;
}

export default function MedicalRecordsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [records, setRecords] = useState<MedicalRecord[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPatient, setSelectedPatient] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedRecord, setSelectedRecord] = useState<MedicalRecord | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  useEffect(() => {
    if (user?.role === 'doctor' || user?.role === 'admin') {
      fetchRecords();
      if (user.role === 'doctor') {
        fetchPatients();
      }
    } else {
      router.push('/patient/medical-records');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, selectedPatient, selectedType]);

  const fetchRecords = async () => {
    try {
      setLoading(true);
      const params: Record<string, unknown> = {};
      if (selectedPatient) params.patientId = selectedPatient;
      if (selectedType !== 'all') params.recordType = selectedType;

      const response = await medicalRecordsAPI.getAll(params);
      setRecords(response.data.data);
    } catch (error) {
      console.error('Error fetching medical records:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPatients = async () => {
    try {
      const response = await usersAPI.getPatients();
      setPatients(response.data.data || []);
    } catch (error) {
      console.error('Error fetching patients:', error);
    }
  };

  const getHealthScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    if (score >= 40) return 'text-orange-600';
    return 'text-red-600';
  };

  const viewRecordDetails = (record: MedicalRecord) => {
    setSelectedRecord(record);
    setShowDetailModal(true);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Medical Records</h1>
          <p className="mt-2 text-gray-600">
            View and manage patient health records and analytics
          </p>
        </div>

        {/* Filters */}
        <div className="bg-white p-6 rounded-lg shadow-md mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {user?.role === 'doctor' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Filter by Patient
                </label>
                <select
                  value={selectedPatient}
                  onChange={(e) => setSelectedPatient(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  title="Filter by Patient"
                >
                  <option value="">All Patients</option>
                  {patients.map((patient) => (
                    <option key={patient._id} value={patient._id}>
                      {patient.firstName} {patient.lastName}
                    </option>
                  ))}
                </select>
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Record Type
              </label>
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                title="Filter by Record Type"
              >
                <option value="all">All Types</option>
                <option value="laboratory">Laboratory</option>
                <option value="general">General</option>
              </select>
            </div>
          </div>
        </div>

        {/* Records List */}
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : records.length === 0 ? (
          <div className="bg-white p-12 rounded-lg shadow-md text-center">
            <p className="text-gray-500 text-lg">No medical records found</p>
            <p className="text-gray-400 mt-2">
              Records will appear here once they are created
            </p>
          </div>
        ) : (
          <div className="grid gap-6">
            {records.map((record) => (
              <div
                key={record._id}
                className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow"
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900">
                      {record.patient.firstName} {record.patient.lastName}
                    </h3>
                    <p className="text-gray-600 text-sm">
                      {record.patient.gender} • {record.patient.bloodGroup || 'N/A'} • {record.patient.email}
                    </p>
                    <p className="text-gray-500 text-sm mt-1">
                      Dr. {record.doctor.firstName} {record.doctor.lastName} ({record.doctor.specialization})
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="inline-block px-3 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded-full">
                      {record.recordType}
                    </span>
                    <p className="text-gray-500 text-sm mt-2">
                      {new Date(record.recordDate).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                {record.riskAssessment && (
                  <div className="border-t pt-4 mt-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-4">
                        {record.riskAssessment.overallHealthScore && (
                          <div>
                            <p className="text-sm text-gray-600">Health Score</p>
                            <p
                              className={`text-2xl font-bold mt-1 ${getHealthScoreColor(
                                record.riskAssessment.overallHealthScore
                              )}`}
                            >
                              {record.riskAssessment.overallHealthScore}/100
                            </p>
                          </div>
                        )}
                      </div>
                      <button
                        onClick={() => viewRecordDetails(record)}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        View Details
                      </button>
                    </div>
                    {record.riskAssessment.recommendations && (
                      <div className="mt-3">
                        <p className="text-sm font-medium text-gray-700 mb-2">
                          Recommendations:
                        </p>
                        <ul className="list-disc list-inside space-y-1">
                          {record.riskAssessment.recommendations.map((rec, idx) => (
                            <li key={idx} className="text-sm text-gray-600">
                              {rec}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Detail Modal */}
        {showDetailModal && selectedRecord && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-start mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">
                    Medical Record Details
                  </h2>
                  <button
                    onClick={() => setShowDetailModal(false)}
                    className="text-gray-400 hover:text-gray-600"
                    title="Close modal"
                    aria-label="Close modal"
                  >
                    <svg
                      className="w-6 h-6"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>

                {/* Patient Info */}
                <div className="mb-6 pb-6 border-b">
                  <h3 className="text-lg font-semibold mb-3">Patient Information</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Name</p>
                      <p className="font-medium">
                        {selectedRecord.patient.firstName} {selectedRecord.patient.lastName}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Blood Group</p>
                      <p className="font-medium">{selectedRecord.patient.bloodGroup || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Gender</p>
                      <p className="font-medium">{selectedRecord.patient.gender}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Date of Birth</p>
                      <p className="font-medium">
                        {selectedRecord.patient.dateOfBirth
                          ? new Date(selectedRecord.patient.dateOfBirth).toLocaleDateString()
                          : 'N/A'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Vital Signs */}
                {selectedRecord.vitalSigns && (
                  <div className="mb-6 pb-6 border-b">
                    <h3 className="text-lg font-semibold mb-3">Vital Signs</h3>
                    <div className="grid grid-cols-3 gap-4">
                      {selectedRecord.vitalSigns.bloodPressure && (
                        <div className="bg-gray-50 p-3 rounded">
                          <p className="text-sm text-gray-600">Blood Pressure</p>
                          <p className="text-lg font-semibold">
                            {selectedRecord.vitalSigns.bloodPressure.systolic}/
                            {selectedRecord.vitalSigns.bloodPressure.diastolic}
                          </p>
                        </div>
                      )}
                      {selectedRecord.vitalSigns.heartRate && (
                        <div className="bg-gray-50 p-3 rounded">
                          <p className="text-sm text-gray-600">Heart Rate</p>
                          <p className="text-lg font-semibold">
                            {selectedRecord.vitalSigns.heartRate} bpm
                          </p>
                        </div>
                      )}
                      {selectedRecord.vitalSigns.bmi && (
                        <div className="bg-gray-50 p-3 rounded">
                          <p className="text-sm text-gray-600">BMI</p>
                          <p className="text-lg font-semibold">{selectedRecord.vitalSigns.bmi}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Notes */}
                {selectedRecord.notes && (
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold mb-3">Notes</h3>
                    <p className="text-gray-700 bg-gray-50 p-4 rounded">{selectedRecord.notes}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
