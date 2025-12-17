'use client';

import { useState, useRef, useEffect } from 'react';

interface CustomDatePickerProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  minDate?: string;
  maxDate?: string;
}

const DAYS_FR = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
const MONTHS_FR = [
  'Janvier', 'Fevrier', 'Mars', 'Avril', 'Mai', 'Juin',
  'Juillet', 'Aout', 'Septembre', 'Octobre', 'Novembre', 'Decembre'
];

export default function CustomDatePicker({
  value,
  onChange,
  label,
  placeholder = 'Selectionner une date',
  required,
  disabled,
  minDate,
  maxDate,
}: CustomDatePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [viewDate, setViewDate] = useState(() => {
    if (value) return new Date(value);
    return new Date();
  });
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (value) {
      setViewDate(new Date(value));
    }
  }, [value]);

  const formatDisplayDate = (dateStr: string) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (year: number, month: number) => {
    const day = new Date(year, month, 1).getDay();
    return day === 0 ? 6 : day - 1; // Convert to Monday-based
  };

  const handlePrevMonth = () => {
    setViewDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setViewDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  const handleSelectDate = (day: number) => {
    const selected = new Date(viewDate.getFullYear(), viewDate.getMonth(), day);
    const dateStr = selected.toISOString().split('T')[0];
    onChange(dateStr);
    setIsOpen(false);
  };

  const isDateDisabled = (day: number) => {
    const date = new Date(viewDate.getFullYear(), viewDate.getMonth(), day);
    const dateStr = date.toISOString().split('T')[0];
    if (minDate && dateStr < minDate) return true;
    if (maxDate && dateStr > maxDate) return true;
    return false;
  };

  const isToday = (day: number) => {
    const today = new Date();
    return (
      day === today.getDate() &&
      viewDate.getMonth() === today.getMonth() &&
      viewDate.getFullYear() === today.getFullYear()
    );
  };

  const isSelected = (day: number) => {
    if (!value) return false;
    const selected = new Date(value);
    return (
      day === selected.getDate() &&
      viewDate.getMonth() === selected.getMonth() &&
      viewDate.getFullYear() === selected.getFullYear()
    );
  };

  const renderCalendar = () => {
    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();
    const daysInMonth = getDaysInMonth(year, month);
    const firstDay = getFirstDayOfMonth(year, month);
    const days = [];

    // Empty cells for days before the first day of month
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="w-9 h-9" />);
    }

    // Days of month
    for (let day = 1; day <= daysInMonth; day++) {
      const disabled = isDateDisabled(day);
      const today = isToday(day);
      const selected = isSelected(day);

      days.push(
        <button
          key={day}
          type="button"
          onClick={() => !disabled && handleSelectDate(day)}
          disabled={disabled}
          className={`
            w-9 h-9 rounded-lg text-sm font-medium
            transition-all duration-150
            flex items-center justify-center
            ${disabled ? 'opacity-30 cursor-not-allowed' : 'cursor-pointer'}
            ${today && !selected ? 'ring-2 ring-inset' : ''}
          `}
          style={{
  color: selected ? 'white' : disabled ? 'var(--foreground-light)' : 'var(--foreground)',
  backgroundColor: selected ? 'var(--primary)' : 'transparent',
  outline: today && !selected ? '2px solid var(--primary)' : 'none',
}}

          onMouseEnter={(e) => !disabled && !selected && (e.currentTarget.style.backgroundColor = 'var(--primary-bg)')}
          onMouseLeave={(e) => !disabled && !selected && (e.currentTarget.style.backgroundColor = 'transparent')}
        >
          {day}
        </button>
      );
    }

    return days;
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange('');
  };

  return (
    <div className="custom-datepicker-wrapper">
      {label && (
        <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--foreground-muted)' }}>
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      <div ref={dropdownRef} className="relative">
        <button
          type="button"
          onClick={() => !disabled && setIsOpen(!isOpen)}
          disabled={disabled}
          className={`
            w-full px-4 py-2.5 rounded-xl border-2 text-left
            flex items-center justify-between gap-2
            transition-all duration-200 ease-out
            ${isOpen ? 'border-indigo-500 ring-4 ring-indigo-500/10' : 'border-transparent'}
            ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:border-indigo-300'}
          `}
          style={{
            backgroundColor: 'var(--background-secondary)',
            color: value ? 'var(--foreground)' : 'var(--foreground-light)',
          }}
        >
          <span className="flex items-center gap-2 truncate">
            <svg
              className="w-5 h-5 flex-shrink-0"
              style={{ color: 'var(--foreground-light)' }}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            {value ? formatDisplayDate(value) : placeholder}
          </span>
          <div className="flex items-center gap-1">
            {value && (
              <span
                onClick={handleClear}
                className="p-1 rounded-full transition-colors"
                style={{ cursor: 'pointer' }}
              >
                <svg
                  className="w-4 h-4"
                  style={{ color: 'var(--foreground-light)' }}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </span>
            )}
            <svg
              className={`w-5 h-5 flex-shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
              style={{ color: 'var(--foreground-light)' }}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </button>

        {isOpen && (
          <div
            className="absolute z-50 mt-2 p-4 rounded-xl shadow-xl border animate-in fade-in slide-in-from-top-2 duration-200"
            style={{
              backgroundColor: 'var(--background-white)',
              borderColor: 'var(--border-light)',
            }}
          >
            {/* Header with navigation */}
            <div className="flex items-center justify-between mb-4">
              <button
                type="button"
                onClick={handlePrevMonth}
                className="p-2 rounded-lg transition-colors"
                style={{ backgroundColor: 'transparent' }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--background-secondary)'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
              >
                <svg
                  className="w-5 h-5"
                  style={{ color: 'var(--foreground-muted)' }}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <span className="font-semibold" style={{ color: 'var(--foreground)' }}>
                {MONTHS_FR[viewDate.getMonth()]} {viewDate.getFullYear()}
              </span>
              <button
                type="button"
                onClick={handleNextMonth}
                className="p-2 rounded-lg transition-colors"
                style={{ backgroundColor: 'transparent' }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--background-secondary)'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
              >
                <svg
                  className="w-5 h-5"
                  style={{ color: 'var(--foreground-muted)' }}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>

            {/* Day headers */}
            <div className="grid grid-cols-7 gap-1 mb-2">
              {DAYS_FR.map(day => (
                <div
                  key={day}
                  className="w-9 h-9 flex items-center justify-center text-xs font-medium"
                  style={{ color: 'var(--foreground-light)' }}
                >
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar grid */}
            <div className="grid grid-cols-7 gap-1">
              {renderCalendar()}
            </div>

            {/* Today button */}
            <div className="mt-4 pt-4 border-t flex justify-center" style={{ borderColor: 'var(--border-light)' }}>
              <button
                type="button"
                onClick={() => {
                  const today = new Date().toISOString().split('T')[0];
                  onChange(today);
                  setIsOpen(false);
                }}
                className="px-4 py-2 text-sm font-medium rounded-lg transition-colors"
                style={{ color: 'var(--primary)' }}
              >
                Aujourd&apos;hui
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
