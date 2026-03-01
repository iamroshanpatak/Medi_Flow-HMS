'use client';

import { useState } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Clock, User } from 'lucide-react';

interface Appointment {
  _id: string;
  doctor: {
    firstName: string;
    lastName: string;
    specialization: string;
  };
  appointmentDate: string;
  startTime: string;
  endTime: string;
  reason: string;
  status: string;
}

interface AppointmentCalendarProps {
  appointments: Appointment[];
  onAppointmentClick?: (appointment: Appointment) => void;
}

export default function AppointmentCalendar({ appointments, onAppointmentClick }: AppointmentCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startDayOfWeek = firstDay.getDay();

    const days = [];

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startDayOfWeek; i++) {
      days.push(null);
    }

    // Add days of the month
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(i);
    }

    return days;
  };

  const getAppointmentsForDate = (day: number | null) => {
    if (!day) return [];
    
    const dateToCheck = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      day
    );

    return appointments.filter(apt => {
      const aptDate = new Date(apt.appointmentDate);
      return (
        aptDate.getFullYear() === dateToCheck.getFullYear() &&
        aptDate.getMonth() === dateToCheck.getMonth() &&
        aptDate.getDate() === dateToCheck.getDate()
      );
    });
  };

  const isToday = (day: number | null) => {
    if (!day) return false;
    const today = new Date();
    return (
      day === today.getDate() &&
      currentDate.getMonth() === today.getMonth() &&
      currentDate.getFullYear() === today.getFullYear()
    );
  };

  const isPastDate = (day: number | null) => {
    if (!day) return false;
    const dateToCheck = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      day
    );
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return dateToCheck < today;
  };

  const previousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled':
        return 'bg-gradient-to-r from-blue-500 to-blue-600 shadow-blue-200';
      case 'confirmed':
        return 'bg-gradient-to-r from-green-500 to-emerald-600 shadow-green-200';
      case 'completed':
        return 'bg-gradient-to-r from-gray-400 to-gray-500 shadow-gray-200';
      case 'cancelled':
        return 'bg-gradient-to-r from-red-500 to-rose-600 shadow-red-200';
      case 'rescheduled':
        return 'bg-gradient-to-r from-purple-500 to-purple-600 shadow-purple-200';
      default:
        return 'bg-gradient-to-r from-gray-400 to-gray-500 shadow-gray-200';
    }
  };

  const days = getDaysInMonth(currentDate);

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-2xl overflow-hidden border border-gray-100">
      {/* Calendar Header */}
      <div className="relative bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 p-8 text-white overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-gradient-to-br from-white/20 to-transparent"></div>
        <div className="relative flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-white/20 backdrop-blur-sm rounded-2xl shadow-lg">
              <CalendarIcon className="w-8 h-8" />
            </div>
            <h2 className="text-3xl font-extrabold">
              {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
            </h2>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={previousMonth}
              className="p-3 rounded-xl hover:bg-white/20 backdrop-blur-sm transition-all duration-200 hover:scale-110"
              aria-label="Previous month"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <button
              onClick={goToToday}
              className="px-5 py-3 bg-white/20 backdrop-blur-sm rounded-xl hover:bg-white/30 transition-all duration-200 font-bold text-sm hover:scale-105 shadow-lg"
            >
              Today
            </button>
            <button
              onClick={nextMonth}
              className="p-3 rounded-xl hover:bg-white/20 backdrop-blur-sm transition-all duration-200 hover:scale-110"
              aria-label="Next month"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Legend */}
        <div className="relative flex flex-wrap gap-4 text-sm">
          <div className="flex items-center space-x-2 bg-white/10 backdrop-blur-sm px-3 py-2 rounded-lg">
            <div className="w-3 h-3 bg-blue-400 rounded-full shadow-lg"></div>
            <span className="font-semibold">Scheduled</span>
          </div>
          <div className="flex items-center space-x-2 bg-white/10 backdrop-blur-sm px-3 py-2 rounded-lg">
            <div className="w-3 h-3 bg-green-400 rounded-full shadow-lg"></div>
            <span className="font-semibold">Confirmed</span>
          </div>
          <div className="flex items-center space-x-2 bg-white/10 backdrop-blur-sm px-3 py-2 rounded-lg">
            <div className="w-3 h-3 bg-purple-400 rounded-full shadow-lg"></div>
            <span className="font-semibold">Rescheduled</span>
          </div>
          <div className="flex items-center space-x-2 bg-white/10 backdrop-blur-sm px-3 py-2 rounded-lg">
            <div className="w-3 h-3 bg-gray-300 rounded-full shadow-lg"></div>
            <span className="font-semibold">Completed</span>
          </div>
        </div>
      </div>

      {/* Days of Week */}
      <div className="grid grid-cols-7 bg-gradient-to-r from-gray-50 to-blue-50 border-b-2 border-gray-200">
        {daysOfWeek.map(day => (
          <div
            key={day}
            className="p-4 text-center font-bold text-gray-700 text-sm border-r last:border-r-0 border-gray-200"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 bg-gradient-to-br from-white to-blue-50/20">
        {days.map((day, index) => {
          const dayAppointments = getAppointmentsForDate(day);
          const isCurrentDay = isToday(day);
          const isPast = isPastDate(day);

          return (
            <div
              key={index}
              className={`min-h-[120px] p-3 border-r border-b last:border-r-0 border-gray-200 transition-all duration-200 ${
                !day ? 'bg-gray-100/50' : isPast ? 'bg-gray-50/80' : 'bg-white hover:bg-blue-50/30'
              } ${isCurrentDay ? 'ring-2 ring-blue-500 ring-inset bg-blue-50' : ''}`}
            >
              {day && (
                <>
                  <div
                    className={`text-sm font-bold mb-2 ${
                      isCurrentDay
                        ? 'w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 text-white rounded-xl flex items-center justify-center shadow-lg'
                        : isPast
                        ? 'text-gray-400'
                        : 'text-gray-900'
                    }`}
                  >
                    {day}
                  </div>

                  <div className="space-y-1.5">
                    {dayAppointments.slice(0, 2).map(apt => (
                      <button
                        key={apt._id}
                        onClick={() => onAppointmentClick?.(apt)}
                        className={`w-full text-left p-2 rounded-lg text-xs ${getStatusColor(
                          apt.status
                        )} text-white hover:shadow-lg hover:scale-105 transition-all duration-200 group`}
                      >
                        <div className="flex items-center space-x-1 mb-1">
                          <Clock className="w-3 h-3" />
                          <span className="font-bold">{apt.startTime}</span>
                        </div>
                        <div className="flex items-center space-x-1 truncate">
                          <User className="w-3 h-3 flex-shrink-0" />
                          <span className="truncate font-medium">
                            Dr. {apt.doctor.lastName}
                          </span>
                        </div>
                      </button>
                    ))}
                    {dayAppointments.length > 2 && (
                      <div className="text-xs text-blue-600 font-bold pl-2 bg-blue-50 rounded-lg py-1">
                        +{dayAppointments.length - 2} more
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
