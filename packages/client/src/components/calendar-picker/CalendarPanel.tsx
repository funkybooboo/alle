import { useState } from 'react';
import { PanelModal } from '../shared/PanelModal';

export interface CalendarPanelProps {
  currentDate: Date;
  onSelectDate: (date: Date) => void;
  onClose: () => void;
}

export const CalendarPanel = ({
  currentDate,
  onSelectDate,
  onClose,
}: CalendarPanelProps) => {
  const [selectedMonth, setSelectedMonth] = useState(currentDate.getMonth());
  const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear());

  const daysInMonth = new Date(selectedYear, selectedMonth + 1, 0).getDate();
  const firstDayOfMonth = new Date(selectedYear, selectedMonth, 1).getDay();

  const monthNames = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ];

  const daysElements = [];
  for (let i = 0; i < firstDayOfMonth; i++) {
    daysElements.push(
      <div key={`empty-${i}`} className="p-3" aria-hidden="true"></div>
    );
  }

  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(selectedYear, selectedMonth, day);
    const isToday = date.toDateString() === new Date().toDateString();
    const isSelected = date.toDateString() === currentDate.toDateString();
    const label = date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    daysElements.push(
      <button
        key={day}
        onClick={() => {
          onSelectDate(date);
          onClose();
        }}
        className={`p-3 text-base rounded hover:bg-blue-100 transition-colors ${
          isToday ? 'font-bold text-blue-600 ring-2 ring-blue-400' : ''
        } ${isSelected ? 'bg-blue-500 text-white hover:bg-blue-600' : ''}`}
        aria-label={isToday ? `Today, ${label}` : label}
        aria-pressed={isSelected}
      >
        {day}
      </button>
    );
  }

  const handlePrevMonth = () => {
    if (selectedMonth === 0) {
      setSelectedMonth(11);
      setSelectedYear(selectedYear - 1);
    } else {
      setSelectedMonth(selectedMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (selectedMonth === 11) {
      setSelectedMonth(0);
      setSelectedYear(selectedYear + 1);
    } else {
      setSelectedMonth(selectedMonth + 1);
    }
  };

  const handleToday = () => {
    const today = new Date();
    onSelectDate(today);
    onClose();
  };

  return (
    <PanelModal
      title="Select Date"
      onClose={onClose}
      footer={
        <div className="flex justify-end">
          <button
            onClick={handleToday}
            className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium"
          >
            Today
          </button>
        </div>
      }
    >
      <div className="h-full flex flex-col items-center justify-center p-8 overflow-y-auto">
        <div className="w-full max-w-2xl">
          {/* Month navigation */}
          <div className="flex items-center justify-between mb-8">
            <button
              onClick={handlePrevMonth}
              className="p-3 hover:bg-gray-100 rounded-full transition-colors"
              aria-label="Previous month"
            >
              <span
                className="material-symbols-outlined text-3xl"
                aria-hidden="true"
              >
                chevron_left
              </span>
            </button>

            <h3 className="text-3xl font-bold" aria-live="polite">
              {monthNames[selectedMonth]} {selectedYear}
            </h3>

            <button
              onClick={handleNextMonth}
              className="p-3 hover:bg-gray-100 rounded-full transition-colors"
              aria-label="Next month"
            >
              <span
                className="material-symbols-outlined text-3xl"
                aria-hidden="true"
              >
                chevron_right
              </span>
            </button>
          </div>

          {/* Day labels */}
          <div className="grid grid-cols-7 gap-4 mb-4" aria-hidden="true">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
              <div
                key={day}
                className="text-center text-base font-semibold text-gray-600 p-3"
              >
                {day}
              </div>
            ))}
          </div>

          {/* Calendar grid */}
          <div className="grid grid-cols-7 gap-4">{daysElements}</div>
        </div>
      </div>
    </PanelModal>
  );
};
