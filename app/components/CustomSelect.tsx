'use client';

import { useState, useRef, useEffect } from 'react';

interface Option {
  value: string;
  label: string;
  color?: string;
}

interface CustomSelectProps {
  options: Option[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  label?: string;
  required?: boolean;
  disabled?: boolean;
}

export default function CustomSelect({
  options,
  value,
  onChange,
  placeholder = 'Selectionner...',
  label,
  required,
  disabled,
}: CustomSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const optionsRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find(opt => opt.value === value);

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
    if (isOpen && optionsRef.current) {
      const selectedIndex = options.findIndex(opt => opt.value === value);
      if (selectedIndex >= 0) {
        setHighlightedIndex(selectedIndex);
      }
    }
  }, [isOpen, options, value]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (disabled) return;

    switch (e.key) {
      case 'Enter':
      case ' ':
        e.preventDefault();
        if (isOpen && highlightedIndex >= 0) {
          onChange(options[highlightedIndex].value);
          setIsOpen(false);
        } else {
          setIsOpen(true);
        }
        break;
      case 'ArrowDown':
        e.preventDefault();
        if (!isOpen) {
          setIsOpen(true);
        } else {
          setHighlightedIndex(prev =>
            prev < options.length - 1 ? prev + 1 : 0
          );
        }
        break;
      case 'ArrowUp':
        e.preventDefault();
        if (isOpen) {
          setHighlightedIndex(prev =>
            prev > 0 ? prev - 1 : options.length - 1
          );
        }
        break;
      case 'Escape':
        setIsOpen(false);
        break;
    }
  };

  return (
    <div className="custom-select-wrapper">
      {label && (
        <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--foreground-muted)' }}>
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      <div
        ref={dropdownRef}
        className="relative"
      >
        <button
          type="button"
          onClick={() => !disabled && setIsOpen(!isOpen)}
          onKeyDown={handleKeyDown}
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
            color: selectedOption ? 'var(--foreground)' : 'var(--foreground-light)',
          }}
        >
          <span className="flex items-center gap-2 truncate">
            {selectedOption?.color && (
              <span
                className="w-3 h-3 rounded-full flex-shrink-0"
                style={{ backgroundColor: selectedOption.color }}
              />
            )}
            {selectedOption?.label || placeholder}
          </span>
          <svg
            className={`w-5 h-5 flex-shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
            style={{ color: 'var(--foreground-light)' }}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {isOpen && (
          <div
            ref={optionsRef}
            className="absolute z-50 w-full mt-2 py-2 rounded-xl shadow-xl border overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200"
            style={{
              backgroundColor: 'var(--background-white)',
              borderColor: 'var(--border-light)',
            }}
          >
            <div className="max-h-60 overflow-y-auto custom-scrollbar">
              {options.map((option, index) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => {
                    onChange(option.value);
                    setIsOpen(false);
                  }}
                  onMouseEnter={() => setHighlightedIndex(index)}
                  className={`
                    w-full px-4 py-2.5 text-left flex items-center gap-3
                    transition-colors duration-150
                    ${highlightedIndex === index ? 'bg-indigo-50' : ''}
                    ${option.value === value ? 'font-medium' : ''}
                  `}
                  style={{
                    color: option.value === value ? 'var(--primary)' : 'var(--foreground)',
                    backgroundColor: highlightedIndex === index ? 'var(--primary-bg)' : 'transparent',
                  }}
                >
                  {option.color && (
                    <span
                      className="w-3 h-3 rounded-full flex-shrink-0"
                      style={{ backgroundColor: option.color }}
                    />
                  )}
                  <span className="flex-1">{option.label}</span>
                  {option.value === value && (
                    <svg
                      className="w-5 h-5 flex-shrink-0"
                      style={{ color: 'var(--primary)' }}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
