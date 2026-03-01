'use client';

import { useState, useEffect } from 'react';
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react';

interface NepaliDatePickerProps {
  onDateSelect: (year: string, month: string, day: string) => void;
  selectedYear?: string;
  selectedMonth?: string;
  selectedDay?: string;
}

// Nepali month names
const nepaliMonths = [
  { value: '1', name: 'Baisakh', days: 31 },
  { value: '2', name: 'Jestha', days: 32 },
  { value: '3', name: 'Ashadh', days: 31 },
  { value: '4', name: 'Shrawan', days: 32 },
  { value: '5', name: 'Bhadra', days: 31 },
  { value: '6', name: 'Ashwin', days: 30 },
  { value: '7', name: 'Kartik', days: 30 },
  { value: '8', name: 'Mangsir', days: 30 },
  { value: '9', name: 'Poush', days: 29 },
  { value: '10', name: 'Magh', days: 30 },
  { value: '11', name: 'Falgun', days: 30 },
  { value: '12', name: 'Chaitra', days: 30 },
];

export default function NepaliDatePicker({
  onDateSelect,
  selectedYear = '',
  selectedMonth = '',
  selectedDay = '',
}: NepaliDatePickerProps) {
  const [showCalendar, setShowCalendar] = useState(false);
  const [currentYear, setCurrentYear] = useState(selectedYear || '2081');
  const [currentMonth, setCurrentMonth] = useState(selectedMonth || '1');

  // Get current BS date (approximate)
  const getCurrentBSYear = () => {
    const currentADYear = new Date().getFullYear();
    return (currentADYear + 57).toString(); // Approximate BS year
  };

  useEffect(() => {
    if (!selectedYear) {
      setCurrentYear(getCurrentBSYear());
    }
  }, [selectedYear]);

  const handleYearChange = (increment: number) => {
    const newYear = parseInt(currentYear) + increment;
    if (newYear >= 2000 && newYear <= 2082) {
      setCurrentYear(newYear.toString());
    }
  };

  const handleMonthChange = (increment: number) => {
    let newMonth = parseInt(currentMonth) + increment;
    let newYear = parseInt(currentYear);

    if (newMonth > 12) {
      newMonth = 1;
      newYear++;
    } else if (newMonth < 1) {
      newMonth = 12;
      newYear--;
    }

    if (newYear >= 2000 && newYear <= 2082) {
      setCurrentYear(newYear.toString());
      setCurrentMonth(newMonth.toString());
    }
  };

  const getDaysInMonth = (month: string) => {
    const monthData = nepaliMonths.find((m) => m.value === month);
    return monthData ? monthData.days : 30;
  };

  const handleDayClick = (day: number) => {
    const dayStr = day.toString();
    onDateSelect(currentYear, currentMonth, dayStr);
    setShowCalendar(false);
  };

  const getMonthName = (month: string) => {
    const monthData = nepaliMonths.find((m) => m.value === month);
    return monthData ? monthData.name : '';
  };

  const renderCalendarDays = () => {
    const daysInMonth = getDaysInMonth(currentMonth);
    const days = [];

    for (let i = 1; i <= daysInMonth; i++) {
      const isSelected =
        selectedDay === i.toString() &&
        selectedMonth === currentMonth &&
        selectedYear === currentYear;

      days.push(
        <button
          key={i}
          type="button"
          onClick={() => handleDayClick(i)}
          className={`p-1.5 text-xs font-medium rounded-md hover:bg-blue-50 transition-all ${
            isSelected
              ? 'bg-gradient-to-br from-blue-600 to-purple-600 text-white shadow-md hover:from-blue-700 hover:to-purple-700'
              : 'text-gray-700 hover:text-blue-600 hover:scale-105'
          }`}
        >
          {i}
        </button>
      );
    }

    return days;
  };

  return (
    <div className="relative">
      {/* Display Field */}
      <button
        type="button"
        onClick={() => setShowCalendar(!showCalendar)}
        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition text-left bg-white flex items-center justify-between text-gray-900 font-medium"
      >
        <div className="flex items-center space-x-2">
          <Calendar className="w-5 h-5 text-gray-400" />
          <span>
            {selectedYear && selectedMonth && selectedDay
              ? `${selectedYear}-${selectedMonth.padStart(2, '0')}-${selectedDay.padStart(2, '0')} (${getMonthName(selectedMonth)} ${selectedDay}, ${selectedYear})`
              : 'Select BS Date'}
          </span>
        </div>
        <ChevronRight
          className={`w-5 h-5 text-gray-400 transition-transform ${
            showCalendar ? 'rotate-90' : ''
          }`}
        />
      </button>

      {/* Calendar Popup */}
      {showCalendar && (
        <div className="absolute z-50 mt-2 w-full max-w-sm bg-white border border-gray-200 rounded-xl shadow-2xl p-3">
          {/* Year Navigation */}
          <div className="flex items-center justify-between mb-3">
            <button
              type="button"
              onClick={() => handleYearChange(-1)}
              className="p-1.5 hover:bg-blue-50 rounded-lg transition"
              disabled={parseInt(currentYear) <= 2000}
              aria-label="Previous year"
              title="Previous year"
            >
              <ChevronLeft className="w-4 h-4 text-gray-600" />
            </button>
            <div className="text-center">
              <div className="font-bold text-base text-gray-900">{currentYear}</div>
              <div className="text-xs text-blue-600 font-medium">{getMonthName(currentMonth)}</div>
            </div>
            <button
              type="button"
              onClick={() => handleYearChange(1)}
              className="p-1.5 hover:bg-blue-50 rounded-lg transition"
              disabled={parseInt(currentYear) >= 2082}
              aria-label="Next year"
              title="Next year"
            >
              <ChevronRight className="w-4 h-4 text-gray-600" />
            </button>
          </div>

          {/* Month Selector */}
          <div className="flex items-center justify-between mb-3 gap-2">
            <button
              type="button"
              onClick={() => handleMonthChange(-1)}
              className="p-1 hover:bg-blue-50 rounded transition flex-shrink-0"
              aria-label="Previous month"
              title="Previous month"
            >
              <ChevronLeft className="w-3.5 h-3.5 text-gray-600" />
            </button>
            <select
              value={currentMonth}
              onChange={(e) => setCurrentMonth(e.target.value)}
              className="flex-1 px-2 py-1.5 border border-gray-200 rounded-lg text-xs font-semibold text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gradient-to-r from-blue-50 to-purple-50"
              aria-label="Select month"
              title="Select month"
            >
              {nepaliMonths.map((month) => (
                <option key={month.value} value={month.value}>
                  {month.name}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={() => handleMonthChange(1)}
              className="p-1 hover:bg-blue-50 rounded transition flex-shrink-0"
              aria-label="Next month"
              title="Next month"
            >
              <ChevronRight className="w-3.5 h-3.5 text-gray-600" />
            </button>
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7 gap-0.5 mb-2">
            {renderCalendarDays()}
          </div>

          {/* Close Button */}
          <button
            type="button"
            onClick={() => setShowCalendar(false)}
            className="w-full px-3 py-1.5 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 rounded-lg text-xs font-semibold text-white transition shadow-sm"
          >
            Close
          </button>
        </div>
      )}
    </div>
  );
}
