'use client';

import { useEffect, useState } from 'react';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info';
  message: string;
}

interface ToastProps {
  toasts: ToastMessage[];
  onRemove: (id: string) => void;
}

export default function Toast({ toasts, onRemove }: ToastProps) {
  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onRemove={onRemove} />
      ))}
    </div>
  );
}

function ToastItem({ toast, onRemove }: { toast: ToastMessage; onRemove: (id: string) => void }) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Animate in
    setTimeout(() => setIsVisible(true), 10);

    // Auto remove after 5 seconds
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(() => onRemove(toast.id), 300);
    }, 5000);

    return () => clearTimeout(timer);
  }, [toast.id, onRemove]);

  const icons = {
    success: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
      </svg>
    ),
    error: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
      </svg>
    ),
    info: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  };

  const colors = {
    success: {
      bg: '#10b981',
      icon: '#ffffff',
    },
    error: {
      bg: '#ef4444',
      icon: '#ffffff',
    },
    info: {
      bg: '#6366f1',
      icon: '#ffffff',
    },
  };

  return (
    <div
      className="flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg transition-all duration-300"
      style={{
        backgroundColor: 'var(--background-white)',
        border: '1px solid var(--border)',
        transform: isVisible ? 'translateX(0)' : 'translateX(120%)',
        opacity: isVisible ? 1 : 0,
        minWidth: '300px',
        maxWidth: '400px',
      }}
    >
      <div
        className="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center"
        style={{ backgroundColor: colors[toast.type].bg, color: colors[toast.type].icon }}
      >
        {icons[toast.type]}
      </div>
      <p className="flex-1 text-sm font-medium" style={{ color: 'var(--foreground)' }}>
        {toast.message}
      </p>
      <button
        onClick={() => {
          setIsVisible(false);
          setTimeout(() => onRemove(toast.id), 300);
        }}
        className="flex-shrink-0 p-1 rounded-lg hover:bg-gray-100 transition-colors"
        style={{ color: 'var(--foreground-muted)' }}
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
}
