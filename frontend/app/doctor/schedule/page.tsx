'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import Navbar from '@/components/Navbar';
import Sidebar from '@/components/Sidebar';
import ProtectedRoute from '@/components/ProtectedRoute';
import { doctorsAPI } from '@/services/api';
import { Calendar, Clock, Plus, Trash2, Save, AlertCircle } from 'lucide-react';
import Toast from '@/components/Toast';

interface TimeSlot {
  startTime: string;
  endTime: string;
  isAvailable: boolean;
}

interface DayAvailability {
  day: string;
  slots: TimeSlot[];
}

const DAYS_OF_WEEK = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export default function DoctorSchedulePage() {
  const { user } = useAuth();
  const [availability, setAvailability] = useState<DayAvailability[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState({ message: '', type: '' as 'success' | 'error' });

  const fetchAvailability = async () => {
    try {
      setLoading(true);
      
      // Initialize with empty slots for all days as default
      const defaultAvailability = DAYS_OF_WEEK.map(day => ({
        day,
        slots: []
      }));
      
      if (!user?.id) {
        // User not ready yet, just use default
        setAvailability(defaultAvailability);
        return;
      }
      
      const response = await doctorsAPI.getById(user.id);
      const doctorAvailability = response.data.data?.availability || [];
      
      // Initialize all days if not present
      const allDaysAvailability = DAYS_OF_WEEK.map(day => {
        const existingDay = doctorAvailability.find((d: DayAvailability) => d.day === day);
        return existingDay || { day, slots: [] };
      });
      
      setAvailability(allDaysAvailability);
    } catch (error: any) {
      // 404 is expected for new doctor profiles - log as debug only
      if (error.response?.status !== 404) {
        console.error('Failed to fetch availability:', error);
      }
      
      // Initialize with empty slots for all days if fetch fails
      const defaultAvailability = DAYS_OF_WEEK.map(day => ({
        day,
        slots: []
      }));
      setAvailability(defaultAvailability);
      
      // Show info if 404 (expected), warning for other issues
      if (error.response?.status === 404) {
        setToast({ message: 'Doctor profile not found. You can set up your schedule below.', type: 'success' });
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user && user.role === 'doctor') {
      fetchAvailability();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const handleAddSlot = (dayIndex: number) => {
    const newAvailability = [...availability];
    newAvailability[dayIndex].slots.push({
      startTime: '09:00',
      endTime: '09:30',
      isAvailable: true,
    });
    setAvailability(newAvailability);
  };

  const handleRemoveSlot = (dayIndex: number, slotIndex: number) => {
    const newAvailability = [...availability];
    newAvailability[dayIndex].slots.splice(slotIndex, 1);
    setAvailability(newAvailability);
  };

  const handleSlotChange = (
    dayIndex: number,
    slotIndex: number,
    field: 'startTime' | 'endTime' | 'isAvailable',
    value: string | boolean
  ) => {
    const newAvailability = [...availability];
    newAvailability[dayIndex].slots[slotIndex][field] = value as never;
    setAvailability(newAvailability);
  };

  const handleCopyToAllDays = (dayIndex: number) => {
    const sourceDaySlots = availability[dayIndex].slots;
    const newAvailability = availability.map((day, index) => {
      if (index === dayIndex) return day;
      return {
        ...day,
        slots: sourceDaySlots.map(slot => ({ ...slot })),
      };
    });
    setAvailability(newAvailability);
    setToast({ message: 'Schedule copied to all days', type: 'success' });
  };

  const handleSaveSchedule = async () => {
    setSaving(true);
    try {
      if (!user?.id) {
        setToast({ message: 'User ID not available. Please refresh the page.', type: 'error' });
        setSaving(false);
        return;
      }
      
      // Filter out days with no slots
      const filteredAvailability = availability.filter(day => day.slots.length > 0);
      
      if (filteredAvailability.length === 0) {
        setToast({ message: 'Please add at least one time slot before saving', type: 'error' });
        setSaving(false);
        return;
      }
      
      await doctorsAPI.updateAvailability(user.id, filteredAvailability);
      setToast({ message: 'Schedule saved successfully!', type: 'success' });
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      console.error('Schedule save error:', error);
      setToast({
        message: err.response?.data?.message || 'Failed to save schedule',
        type: 'error',
      });
    } finally {
      setSaving(false);
    }
  };

  const generateTimeSlots = () => {
    const times: string[] = [];
    for (let hour = 0; hour < 24; hour++) {
      for (let min = 0; min < 60; min += 30) {
        const h = hour.toString().padStart(2, '0');
        const m = min.toString().padStart(2, '0');
        times.push(`${h}:${m}`);
      }
    }
    return times;
  };

  const timeOptions = generateTimeSlots();

  if (loading) {
    return (
      <ProtectedRoute allowedRoles={['doctor']}>
        <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50">
          <Navbar />
          <div className="flex">
            <Sidebar role="doctor" />
            <main className="flex-1 p-8">
              <div className="flex items-center justify-center h-96">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-emerald-500 border-t-transparent"></div>
              </div>
            </main>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute allowedRoles={['doctor']}>
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50">
        <Navbar />
        <div className="flex">
          <Sidebar role="doctor" />
          <main className="flex-1 p-8">
            {/* Header */}
            <div className="mb-8">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                    <Calendar className="w-8 h-8 mr-3 text-emerald-600" />
                    Manage Schedule
                  </h1>
                  <p className="text-gray-600 mt-2">
                    Set your availability and working hours for appointments
                  </p>
                </div>
                <button
                  onClick={handleSaveSchedule}
                  disabled={saving}
                  className="px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl hover:from-emerald-700 hover:to-teal-700 transition shadow-lg hover:shadow-xl flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Save className="w-5 h-5 mr-2" />
                  {saving ? 'Saving...' : 'Save Schedule'}
                </button>
              </div>
</div>

{/* Information Box */}
<div className="mb-6 bg-blue-50 border-l-4 border-blue-600 p-4 rounded-lg flex">
  <AlertCircle className="w-5 h-5 text-blue-600 mr-3 mt-0.5 flex-shrink-0" />
  <div className="text-sm text-blue-800">
    <p className="font-semibold mb-1">How to setup your schedule:</p>
    <ul className="list-disc list-inside space-y-1 text-blue-700">
      <li>Add time slots for each day when you&apos;re available</li>
      <li>Time slots are 30-minute intervals by default</li>
      <li>You can copy a day&apos;s schedule to all other days</li>
      <li>Don&apos;t forget to save your changes!</li>
    </ul>
  </div>
</div>

{/* Schedule Grid */}
            <div className="space-y-6">
              {availability.map((dayData, dayIndex) => (
                <div
                  key={dayData.day}
                  className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden"
                >
                  {/* Day Header */}
                  <div className="bg-gradient-to-r from-emerald-500 to-teal-500 px-6 py-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xl font-bold text-white flex items-center">
                        <Clock className="w-5 h-5 mr-2" />
                        {dayData.day}
                      </h3>
                      <div className="flex items-center space-x-2">
                        <span className="text-white text-sm font-medium">
                          {dayData.slots.length} {dayData.slots.length === 1 ? 'slot' : 'slots'}
                        </span>
                        <button
                          onClick={() => handleAddSlot(dayIndex)}
                          className="px-4 py-2 bg-white text-emerald-600 rounded-lg hover:bg-emerald-50 transition flex items-center text-sm font-medium"
                          title="Add Time Slot"
                        >
                          <Plus className="w-4 h-4 mr-1" />
                          Add Slot
                        </button>
                        {dayData.slots.length > 0 && (
                          <button
                            onClick={() => handleCopyToAllDays(dayIndex)}
                            className="px-4 py-2 bg-white text-teal-600 rounded-lg hover:bg-teal-50 transition text-sm font-medium"
                            title="Copy to All Days"
                          >
                            Copy to All
                          </button>
                        )}
                      </div>
  </div>
</div>

  {/* Time Slots */}
                  <div className="p-6">
                    {dayData.slots.length === 0 ? (
                      <div className="text-center py-12 text-gray-500">
                        <Clock className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                        <p className="font-medium">No time slots added for this day</p>
                        <p className="text-sm">Click &quot;Add Slot&quot; to add your availability</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {dayData.slots.map((slot, slotIndex) => (
                          <div key={slotIndex} className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                            {/* Start Time */}
                            <div>
                              <label htmlFor={`start-${dayIndex}-${slotIndex}`} className="block text-xs font-medium text-gray-700 mb-1">
                                Start Time
                              </label>
                              <select
                                id={`start-${dayIndex}-${slotIndex}`}
                                title="Start Time"
                                value={slot.startTime}
                                onChange={(e) =>
                                  handleSlotChange(dayIndex, slotIndex, 'startTime', e.target.value)
                                }
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm text-gray-900 font-medium"
                              >
                                {timeOptions.map((time) => (
                                  <option key={time} value={time}>
                                    {time}
                                  </option>
                                ))}
                              </select>
                            </div>

                            {/* End Time */}
                            <div className="mt-3">
                              <label htmlFor={`end-${dayIndex}-${slotIndex}`} className="block text-xs font-medium text-gray-700 mb-1">
                                End Time
                              </label>
                              <select
                                id={`end-${dayIndex}-${slotIndex}`}
                                title="End Time"
                                value={slot.endTime}
                                onChange={(e) =>
                                  handleSlotChange(dayIndex, slotIndex, 'endTime', e.target.value)
                                }
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm text-gray-900 font-medium"
                              >
                                {timeOptions.map((time) => (
                                  <option key={time} value={time}>
                                    {time}
                                  </option>
                                ))}
                              </select>
                            </div>

                            {/* Available Toggle */}
                            <div className="mt-3 flex items-center justify-between">
                              <label className="flex items-center cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={slot.isAvailable}
                                  onChange={(e) =>
                                    handleSlotChange(
                                      dayIndex,
                                      slotIndex,
                                      'isAvailable',
                                      e.target.checked
                                    )
                                  }
                                  className="w-4 h-4 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500"
                                />
                                <span className="ml-2 text-sm font-medium text-gray-700">
                                  Available
                                </span>
                              </label>
                              <button
                                onClick={() => handleRemoveSlot(dayIndex, slotIndex)}
                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                                title="Remove Slot"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Bottom Save Button */}
            <div className="mt-8 flex justify-center">
              <button
                onClick={handleSaveSchedule}
                disabled={saving}
                className="px-8 py-4 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl hover:from-emerald-700 hover:to-teal-700 transition shadow-lg hover:shadow-xl flex items-center text-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Save className="w-6 h-6 mr-2" />
                {saving ? 'Saving...' : 'Save Schedule'}
              </button>
            </div>
          </main>
        </div>

        {/* Toast Notification */}
        {toast.message && (
          <Toast
            message={toast.message}
            type={toast.type}
            onClose={() => setToast({ message: '', type: '' as 'success' | 'error' })}
          />
        )}
      </div>
    </ProtectedRoute>
  );
}
