'use client';

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  secondaryLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
  onSecondary?: () => void;
  danger?: boolean;
}

export default function ConfirmModal({
  isOpen,
  title,
  message,
  confirmLabel = 'Confirmer',
  cancelLabel = 'Annuler',
  secondaryLabel,
  onConfirm,
  onCancel,
  onSecondary,
  danger = true,
}: ConfirmModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-[60] p-4 animate-fade-in">
      <div
        className="rounded-2xl shadow-xl max-w-sm w-full animate-slide-in"
        style={{ backgroundColor: 'var(--background-white)' }}
      >
        {/* Header */}
        <div className="p-6 pb-4">
          <div className="flex items-center gap-3 mb-3">
            {danger && (
              <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)' }}>
                <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
            )}
            <h3 className="text-lg font-semibold" style={{ color: 'var(--foreground)' }}>
              {title}
            </h3>
          </div>
          <p className="text-sm" style={{ color: 'var(--foreground-muted)' }}>
            {message}
          </p>
        </div>

        {/* Actions */}
        <div className="flex gap-3 p-6 pt-2">
          <button
            onClick={onCancel}
            className="flex-1 px-4 py-2.5 rounded-lg font-medium text-sm transition-all"
            style={{
              backgroundColor: 'var(--background-secondary)',
              color: 'var(--foreground)'
            }}
          >
            {cancelLabel}
          </button>
          {secondaryLabel && onSecondary && (
            <button
              onClick={onSecondary}
              className="flex-1 px-4 py-2.5 rounded-lg font-medium text-sm transition-all"
              style={{
                backgroundColor: 'var(--background-secondary)',
                color: 'var(--foreground)'
              }}
            >
              {secondaryLabel}
            </button>
          )}
          <button
            onClick={onConfirm}
            className={`flex-1 px-4 py-2.5 rounded-lg font-medium text-sm text-white transition-all ${
              danger ? 'bg-red-500 hover:bg-red-600' : ''
            }`}
            style={!danger ? { backgroundColor: 'var(--primary)' } : undefined}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
