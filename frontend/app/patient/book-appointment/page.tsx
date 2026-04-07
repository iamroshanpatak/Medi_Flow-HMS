'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import Navbar from '@/components/Navbar';
import Sidebar from '@/components/Sidebar';
import Toast, { ToastType } from '@/components/Toast';
import { doctorsAPI, appointmentsAPI } from '@/services/api';
import { Calendar, Clock, User as UserIcon, Search, ChevronLeft } from 'lucide-react';

interface Doctor {
  _id: string;
  firstName: string;
  lastName: string;
  specialization: string;
  consultationFee: number;
  experience: number;
}

interface TimeSlot {
  startTime: string;
  endTime: string;
  isAvailable: boolean;
}

export default function BookAppointmentPage() {
  const { user } = useAuth();
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [selectedDate, setSelectedDate] = useState('');
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [step, setStep] = useState(1);

  useEffect(() => {
    fetchDoctors();
  }, []);

  const fetchDoctors = async () => {
    try {
      const response = await doctorsAPI.getAll();
      setDoctors(response.data.data);
    } catch (error) {
      console.error('Failed to fetch doctors:', error);
    }
  };

  const fetchAvailability = async (doctorId: string, date: string) => {
    setLoadingSlots(true);
    try {
      const response = await doctorsAPI.getAvailability(doctorId, date);
      setAvailableSlots(response.data.data.availableSlots || []);
    } catch (error) {
      console.error('Failed to fetch availability:', error);
      setAvailableSlots([]);
    } finally {
      setLoadingSlots(false);
    }
  };

  const handleDoctorSelect = (doctor: Doctor) => {
    setSelectedDoctor(doctor);
    setStep(2);
    setSelectedDate('');
    setSelectedSlot(null);
  };

  const handleDateChange = (date: string) => {
    setSelectedDate(date);
    setSelectedSlot(null);
    if (selectedDoctor) {
      fetchAvailability(selectedDoctor._id, date);
    }
  };

  const handleBookAppointment = async () => {
    if (!selectedDoctor || !selectedDate || !selectedSlot || !reason.trim()) {
      setToast({ message: 'Please fill all required fields', type: 'error' });
      return;
    }

    setLoading(true);
    try {
      await appointmentsAPI.create({
        doctor: selectedDoctor._id,
        appointmentDate: selectedDate,
        startTime: selectedSlot.startTime,
        endTime: selectedSlot.endTime,
        reason,
        type: 'consultation',
      });

      setToast({ message: 'Appointment booked successfully!', type: 'success' });
      setTimeout(() => {
        window.location.href = '/patient/appointments';
      }, 2000);
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      setToast({
        message: err.response?.data?.message || 'Failed to book appointment',
        type: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredDoctors = doctors.filter(
    (doctor) =>
      `${doctor.firstName} ${doctor.lastName}`
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      doctor.specialization?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const today = new Date().toISOString().split('T')[0];

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <Navbar user={user} />
        <div className="flex">
          <Sidebar role={user?.role || 'patient'} />
          <main className="flex-1 p-8">
            <div className="max-w-6xl mx-auto">
              {/* Header */}
              <div className="mb-10 relative">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl blur-3xl opacity-10"></div>
                <div className="relative">
                  <h1 className="text-4xl font-extrabold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Book Appointment 📅</h1>
                  <p className="text-lg text-gray-600 mt-3 font-medium">Schedule your consultation with our expert doctors</p>
                </div>
              </div>

              {/* Progress Steps */}
              <div className="flex items-center justify-center mb-10">
                <div className="flex items-center space-x-3">
                  <div className={`flex items-center ${step >= 1 ? 'text-blue-600' : 'text-gray-400'}`}>
                    <div className={`relative w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-lg shadow-lg transition-all duration-300 ${
                      step >= 1 
                        ? 'bg-gradient-to-br from-blue-500 to-purple-600 text-white scale-110' 
                        : 'bg-gray-200 text-gray-500'
                    }`}>
                      {step > 1 ? '✓' : '1'}
                      {step >= 1 && <div className="absolute inset-0 bg-blue-400 rounded-2xl blur-xl opacity-50"></div>}
                    </div>
                    <span className="ml-3 font-bold text-sm">Select Doctor</span>
                  </div>
                  <div className={`w-20 h-1 rounded-full transition-all duration-300 ${
                    step >= 2 ? 'bg-gradient-to-r from-blue-500 to-purple-600' : 'bg-gray-300'
                  }`}></div>
                  <div className={`flex items-center ${step >= 2 ? 'text-blue-600' : 'text-gray-400'}`}>
                    <div className={`relative w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-lg shadow-lg transition-all duration-300 ${
                      step >= 2 
                        ? 'bg-gradient-to-br from-blue-500 to-purple-600 text-white scale-110' 
                        : 'bg-gray-200 text-gray-500'
                    }`}>
                      {step > 2 ? '✓' : '2'}
                      {step >= 2 && <div className="absolute inset-0 bg-blue-400 rounded-2xl blur-xl opacity-50"></div>}
                    </div>
                    <span className="ml-3 font-bold text-sm">Date & Time</span>
                  </div>
                  <div className={`w-20 h-1 rounded-full transition-all duration-300 ${
                    step >= 3 ? 'bg-gradient-to-r from-blue-500 to-purple-600' : 'bg-gray-300'
                  }`}></div>
                  <div className={`flex items-center ${step >= 3 ? 'text-blue-600' : 'text-gray-400'}`}>
                    <div className={`relative w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-lg shadow-lg transition-all duration-300 ${
                      step >= 3 
                        ? 'bg-gradient-to-br from-blue-500 to-purple-600 text-white scale-110' 
                        : 'bg-gray-200 text-gray-500'
                    }`}>
                      3
                      {step >= 3 && <div className="absolute inset-0 bg-blue-400 rounded-2xl blur-xl opacity-50"></div>}
                    </div>
                    <span className="ml-3 font-bold text-sm">Confirm</span>
                  </div>
                </div>
              </div>

              {/* Step 1: Select Doctor */}
              {step === 1 && (
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-2xl border border-gray-100 p-8">
                  <div className="mb-8">
                    <div className="relative">
                      <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-6 h-6" />
                      <input
                        type="text"
                        placeholder="Search by doctor name or specialization..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-14 pr-6 py-4 border-2 border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-gray-900 font-medium placeholder-gray-400"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredDoctors.map((doctor) => (
                      <div
                        key={doctor._id}
                        className="group relative border-2 border-gray-200 rounded-2xl p-6 hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 cursor-pointer bg-gradient-to-br from-white to-blue-50/30 hover:border-blue-300"
                        onClick={() => handleDoctorSelect(doctor)}
                      >
                        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/0 to-purple-500/0 group-hover:from-blue-500/5 group-hover:to-purple-500/5 rounded-2xl transition-all duration-300"></div>
                        <div className="relative flex items-center space-x-4 mb-4">
                          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                            <UserIcon className="w-8 h-8 text-white" />
                            <div className="absolute inset-0 bg-blue-400 rounded-2xl blur-xl opacity-40 group-hover:opacity-60 transition-opacity"></div>
                          </div>
                          <div>
                            <h3 className="font-bold text-lg text-gray-900">
                              Dr. {doctor.firstName} {doctor.lastName}
                            </h3>
                            <p className="text-sm text-gray-600 flex items-center gap-1">
                              <span className="w-1.5 h-1.5 bg-blue-500 rounded-full"></span>
                              {doctor.specialization}
                            </p>
                          </div>
                        </div>
                        <div className="relative space-y-2 text-sm text-gray-600 font-medium">
                          <p>🎓 Experience: {doctor.experience} years</p>
                          <p className="font-bold text-blue-600 text-base">💵 Fee: ${doctor.consultationFee}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Step 2: Choose Date & Time */}
              {step === 2 && selectedDoctor && (
                <div className="space-y-6">
                  <button
                    onClick={() => setStep(1)}
                    className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-2xl hover:shadow-xl hover:-translate-x-1 transition-all duration-300 font-bold"
                  >
                    <ChevronLeft className="w-5 h-5" />
                    Back to Doctors
                  </button>

                  <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-2xl border border-gray-100 p-8">
                    <div className="mb-8 pb-6 border-b-2 border-gray-100">
                      <h3 className="text-2xl font-extrabold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
                        Dr. {selectedDoctor.firstName} {selectedDoctor.lastName}
                      </h3>
                      <p className="text-gray-600 text-lg font-medium">{selectedDoctor.specialization}</p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-8">
                      {/* Date Selection */}
                      <div>
                        <label className="flex items-center gap-2 text-base font-bold text-gray-700 mb-4">
                          <Calendar className="w-6 h-6 text-blue-600" />
                          Select Date
                        </label>
                        <input
                          type="date"
                          min={today}
                          value={selectedDate}
                          onChange={(e) => handleDateChange(e.target.value)}
                          title="Select appointment date"
                          className="w-full px-5 py-4 border-2 border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 font-bold text-lg transition-all duration-200"
                        />
                      </div>

                      {/* Time Slots */}
                      <div>
                        <label className="flex items-center gap-2 text-base font-bold text-gray-700 mb-4">
                          <Clock className="w-6 h-6 text-purple-600" />
                          Available Time Slots
                        </label>
                        {!selectedDate ? (
                          <p className="text-gray-500 font-medium">Please select a date first</p>
                        ) : loadingSlots ? (
                          <p className="text-gray-500 font-medium">Loading slots...</p>
                        ) : availableSlots.length === 0 ? (
                          <p className="text-gray-500 font-medium">No available slots for this date</p>
                        ) : (
                          <div className="grid grid-cols-2 gap-3 max-h-64 overflow-y-auto pr-2 custom-scrollbar">
                            {availableSlots.map((slot, index) => (
                              <button
                                key={index}
                                onClick={() => {
                                  setSelectedSlot(slot);
                                  setStep(3);
                                }}
                                className={`px-4 py-3 border-2 rounded-xl text-sm font-bold transition-all duration-200 hover:scale-105 ${
                                  selectedSlot?.startTime === slot.startTime
                                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white border-transparent shadow-lg'
                                    : 'border-gray-200 hover:border-blue-500 hover:bg-blue-50 text-black'
                                }`}
                              >
                                {slot.startTime} - {slot.endTime}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 3: Confirm */}
              {step === 3 && selectedDoctor && selectedDate && selectedSlot && (
                <div className="space-y-6">
                  <button
                    onClick={() => setStep(2)}
                    className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-2xl hover:shadow-xl hover:-translate-x-1 transition-all duration-300 font-bold"
                  >
                    <ChevronLeft className="w-5 h-5" />
                    Back
                  </button>

                  <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-2xl border border-gray-100 p-8">
                    <h3 className="text-2xl font-extrabold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-8">Confirm Appointment</h3>

                    {/* Appointment Summary */}
                    <div className="relative bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl p-8 mb-8 border-2 border-blue-100 shadow-lg">
                      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 rounded-2xl"></div>
                      <div className="relative space-y-4">
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600 font-medium">👨‍⚕️ Doctor:</span>
                          <span className="font-bold text-gray-900">
                            Dr. {selectedDoctor.firstName} {selectedDoctor.lastName}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600 font-medium">🏛️ Specialization:</span>
                          <span className="font-bold text-gray-900">{selectedDoctor.specialization}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600 font-medium">📅 Date:</span>
                          <span className="font-bold text-gray-900">
                            {new Date(selectedDate).toLocaleDateString('en-US', {
                              weekday: 'long',
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                            })}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600 font-medium">⏰ Time:</span>
                          <span className="font-bold text-gray-900">
                            {selectedSlot.startTime} - {selectedSlot.endTime}
                          </span>
                        </div>
                        <div className="flex justify-between items-center pt-4 border-t-2 border-blue-200">
                          <span className="text-gray-600 font-bold text-lg">💵 Consultation Fee:</span>
                          <span className="font-extrabold text-blue-600 text-2xl">
                            ${selectedDoctor.consultationFee}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Reason for Visit */}
                    <div className="mb-8">
                      <label className="block text-base font-bold text-gray-700 mb-3">
                        Reason for Visit *
                      </label>
                      <textarea
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                        placeholder="Please describe your symptoms or reason for consultation..."
                        rows={4}
                        className="w-full px-5 py-4 border-2 border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 font-medium placeholder-gray-400 transition-all duration-200"
                        required
                      />
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-4">
                      <button
                        onClick={() => setStep(2)}
                        className="flex-1 px-8 py-4 border-2 border-gray-300 text-gray-700 rounded-2xl hover:bg-gray-100 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 font-bold text-lg"
                      >
                        Back
                      </button>
                      <button
                        onClick={handleBookAppointment}
                        disabled={loading || !reason.trim()}
                        className="flex-1 px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-2xl hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 font-bold text-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                      >
                        {loading ? 'Booking...' : 'Confirm Booking ✅'}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </main>
        </div>
      </div>
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </ProtectedRoute>
  );
}
