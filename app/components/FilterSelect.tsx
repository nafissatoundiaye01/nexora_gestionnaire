'use client';

import { useState, useRef, useEffect } from 'react';

interface Option {
  value: string;
  label: string;
  icon?: React.ReactNode;
}

interface FilterSelectProps {
  options: Option[];
  value: string;
  onChange: (value: string) => void;
  icon?: React.ReactNode;
  placeholder?: string;
}

export default function FilterSelect({
  options,
  value,
  onChange,
  icon,
  placeholder = 'Sélectionner...',
}: FilterSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find(opt => opt.value === value);
  const isActive = value !== options[0]?.value;

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
    if (isOpen) {
      const selectedIndex = options.findIndex(opt => opt.value === value);
      if (selectedIndex >= 0) {
        setHighlightedIndex(selectedIndex);
      }
    }
  }, [isOpen, options, value]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
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
    <div ref={dropdownRef} className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        onKeyDown={handleKeyDown}
        className="flex items-center gap-2 px-3 py-2 rounded-lg font-medium transition-all duration-200"
        style={{
          backgroundColor: isActive ? 'var(--primary)' : 'var(--background-white)',
          color: isActive ? 'white' : 'var(--foreground-muted)',
          border: isActive ? '1px solid var(--primary)' : '1px solid var(--border)',
          boxShadow: isOpen ? '0 0 0 3px var(--primary-bg)' : 'none',
        }}
      >
        {icon && (
          <span className="w-5 h-5 flex-shrink-0">
            {icon}
          </span>
        )}
        <span className="truncate max-w-[140px]">
          {selectedOption?.label || placeholder}
        </span>
        <svg
          className={`w-4 h-4 flex-shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div
          className="absolute z-50 mt-2 py-1.5 rounded-xl shadow-xl border overflow-hidden"
          style={{
            backgroundColor: 'var(--background-white)',
            borderColor: 'var(--border-light)',
            minWidth: '180px',
            animation: 'fadeInDown 0.15s ease-out',
          }}
        >
          <div className="max-h-64 overflow-y-auto custom-scrollbar">
            {options.map((option, index) => (
              <button
                key={option.value}
                type="button"
                onClick={() => {
                  onChange(option.value);
                  setIsOpen(false);
                }}
                onMouseEnter={() => setHighlightedIndex(index)}
                className="w-full px-3 py-2.5 text-left flex items-center gap-3 transition-colors duration-150"
                style={{
                  color: option.value === value ? 'var(--primary)' : 'var(--foreground)',
                  backgroundColor: highlightedIndex === index ? 'var(--primary-bg)' : 'transparent',
                  fontWeight: option.value === value ? 500 : 400,
                }}
              >
                {option.icon && (
                  <span className="w-5 h-5 flex-shrink-0" style={{ color: option.value === value ? 'var(--primary)' : 'var(--foreground-muted)' }}>
                    {option.icon}
                  </span>
                )}
                <span className="flex-1">{option.label}</span>
                {option.value === value && (
                  <svg
                    className="w-4 h-4 flex-shrink-0"
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

      <style jsx>{`
        @keyframes fadeInDown {
          from {
            opacity: 0;
            transform: translateY(-8px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}
