'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { medicalRecordsAPI } from '@/services/api';
import ProtectedRoute from '@/components/ProtectedRoute';
import Navbar from '@/components/Navbar';
import Sidebar from '@/components/Sidebar';

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

export default function PatientMedicalRecordsPage() {
  const { user } = useAuth();
  const [records, setRecords] = useState<MedicalRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedType, setSelectedType] = useState('all');
  const [selectedRecord, setSelectedRecord] = useState<MedicalRecord | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  const fetchRecords = useCallback(async () => {
    try {
      setLoading(true);
      const params: Record<string, unknown> = {};
      if (selectedType !== 'all') params.recordType = selectedType;

      const response = await medicalRecordsAPI.getAll(params);
      setRecords(response.data.data || []);
    } catch (error) {
      console.error('Error fetching medical records:', error);
    } finally {
      setLoading(false);
    }
  }, [selectedType]);

  useEffect(() => {
    fetchRecords();
  }, [selectedType, fetchRecords]);

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
    <ProtectedRoute allowedRoles={['patient']}>
      <div className="min-h-screen bg-gray-50">
        <Navbar user={user} />
        <Sidebar role="patient" />

        <div className="ml-0 md:ml-64 pt-6 p-4 md:p-8">
          <div className="max-w-7xl mx-auto">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900">My Medical Records</h1>
              <p className="mt-2 text-gray-600">
                View your health records and medical history
              </p>
            </div>

            {/* Filters */}
            <div className="bg-white p-6 rounded-lg shadow-md mb-6">
              <div className="w-full md:w-64">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Record Type
                </label>
                <select
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black"
                  title="Filter by Record Type"
                >
                  <option value="all">All Types</option>
                  <option value="laboratory">Laboratory</option>
                  <option value="general">General</option>
                </select>
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
                  Your medical records will appear here once created by your doctor
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
                          Medical Record
                        </h3>
                        <p className="text-gray-600 text-sm">
                          Dr. {record.doctor.firstName} {record.doctor.lastName} ({record.doctor.specialization})
                        </p>
                        <p className="text-gray-500 text-sm mt-1">
                          Blood Group: {record.patient.bloodGroup || 'N/A'}
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
                  <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6 flex justify-between items-center">
                    <h2 className="text-2xl font-bold">
                      Medical Record Details
                    </h2>
                    <button
                      onClick={() => setShowDetailModal(false)}
                      className="bg-blue-500 hover:bg-blue-600 px-4 py-2 rounded-lg text-white font-semibold transition"
                    >
                      ← Back
                    </button>
                  </div>

                  <div className="p-6 space-y-6">
                    {/* Patient Info */}
                    <div className="pb-6 border-b">
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
                          {selectedRecord.vitalSigns.temperature && (
                            <div className="bg-gray-50 p-3 rounded">
                              <p className="text-sm text-gray-600">Temperature</p>
                              <p className="text-lg font-semibold">{selectedRecord.vitalSigns.temperature}°C</p>
                            </div>
                          )}
                          {selectedRecord.vitalSigns.weight && (
                            <div className="bg-gray-50 p-3 rounded">
                              <p className="text-sm text-gray-600">Weight</p>
                              <p className="text-lg font-semibold">{selectedRecord.vitalSigns.weight} kg</p>
                            </div>
                          )}
                          {selectedRecord.vitalSigns.height && (
                            <div className="bg-gray-50 p-3 rounded">
                              <p className="text-sm text-gray-600">Height</p>
                              <p className="text-lg font-semibold">{selectedRecord.vitalSigns.height} cm</p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Diagnosis */}
                    {selectedRecord.diagnosis && (
                      <div className="mb-6 pb-6 border-b">
                        <h3 className="text-lg font-semibold mb-3">Diagnosis</h3>
                        <div>
                          <p className="text-sm text-gray-600">Primary Diagnosis</p>
                          <p className="font-medium text-gray-900">{selectedRecord.diagnosis.primary}</p>
                          {selectedRecord.diagnosis.secondary && selectedRecord.diagnosis.secondary.length > 0 && (
                            <div className="mt-3">
                              <p className="text-sm text-gray-600 mb-2">Secondary Diagnoses</p>
                              <ul className="list-disc list-inside space-y-1">
                                {selectedRecord.diagnosis.secondary.map((diag, idx) => (
                                  <li key={idx} className="text-sm text-gray-700">{diag}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Prescription */}
                    {selectedRecord.prescription && selectedRecord.prescription.length > 0 && (
                      <div className="mb-6 pb-6 border-b">
                        <h3 className="text-lg font-semibold mb-3">Prescription</h3>
                        <div className="space-y-3">
                          {selectedRecord.prescription.map((med, idx) => (
                            <div key={idx} className="bg-blue-50 p-3 rounded">
                              <p className="font-medium text-gray-900">{med.medication}</p>
                              <p className="text-sm text-gray-600">Dosage: {med.dosage}</p>
                              <p className="text-sm text-gray-600">Frequency: {med.frequency}</p>
                            </div>
                          ))}
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

                  {/* Footer */}
                  <div className="border-t p-6 bg-gray-50">
                    <button
                      onClick={() => setShowDetailModal(false)}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-lg transition"
                    >
                      Close
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
