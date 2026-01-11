import { useState, useRef, useEffect } from 'react';

export interface CalendarDropdownProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectDate: (date: Date) => void;
  currentDate: Date;
}

export const CalendarDropdown = ({
  isOpen,
  onClose,
  onSelectDate,
  currentDate,
}: CalendarDropdownProps) => {
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [selectedMonth, setSelectedMonth] = useState(currentDate.getMonth());
  const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear());

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () =>
        document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const daysInMonth = new Date(selectedYear, selectedMonth + 1, 0).getDate();
  const firstDayOfMonth = new Date(selectedYear, selectedMonth, 1).getDay();

  const days = [];
  for (let i = 0; i < firstDayOfMonth; i++) {
    days.push(<div key={`empty-${i}`} className="p-2"></div>);
  }

  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(selectedYear, selectedMonth, day);
    const isToday = date.toDateString() === new Date().toDateString();
    const isSelected = date.toDateString() === currentDate.toDateString();

    days.push(
      <button
        key={day}
        onClick={() => {
          onSelectDate(date);
          onClose();
        }}
        className={`p-2 text-sm rounded hover:bg-blue-100 transition-colors ${
          isToday ? 'font-bold text-blue-600' : ''
        } ${isSelected ? 'bg-blue-500 text-white hover:bg-blue-600' : ''}`}
      >
        {day}
      </button>
    );
  }

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

  return (
    <div
      ref={dropdownRef}
      className="absolute right-0 top-full mt-2 bg-white border border-gray-300 rounded-lg shadow-lg p-4 z-50"
      style={{ width: '280px' }}
    >
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => {
            if (selectedMonth === 0) {
              setSelectedMonth(11);
              setSelectedYear(selectedYear - 1);
            } else {
              setSelectedMonth(selectedMonth - 1);
            }
          }}
          className="p-1 hover:bg-gray-100 rounded"
        >
          <span className="material-symbols-outlined text-xl">
            chevron_left
          </span>
        </button>

        <span className="font-semibold">
          {monthNames[selectedMonth]} {selectedYear}
        </span>

        <button
          onClick={() => {
            if (selectedMonth === 11) {
              setSelectedMonth(0);
              setSelectedYear(selectedYear + 1);
            } else {
              setSelectedMonth(selectedMonth + 1);
            }
          }}
          className="p-1 hover:bg-gray-100 rounded"
        >
          <span className="material-symbols-outlined text-xl">
            chevron_right
          </span>
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1 mb-2">
        {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((day) => (
          <div
            key={day}
            className="text-xs text-gray-500 text-center font-medium p-2"
          >
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">{days}</div>
    </div>
  );
};
