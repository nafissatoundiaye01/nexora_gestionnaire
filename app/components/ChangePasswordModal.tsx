'use client';

import { useState } from 'react';

interface ChangePasswordModalProps {
  onChangePassword: (currentPassword: string, newPassword: string) => Promise<{ success: boolean; error?: string }>;
  userEmail: string;
}

export default function ChangePasswordModal({ onChangePassword, userEmail }: ChangePasswordModalProps) {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Password strength validation
  const validatePassword = (password: string): { valid: boolean; errors: string[] } => {
    const errors: string[] = [];

    if (password.length < 8) {
      errors.push('Au moins 8 caracteres');
    }
    if (!/[A-Z]/.test(password)) {
      errors.push('Au moins une majuscule');
    }
    if (!/[a-z]/.test(password)) {
      errors.push('Au moins une minuscule');
    }
    if (!/[0-9]/.test(password)) {
      errors.push('Au moins un chiffre');
    }
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      errors.push('Au moins un caractere special (!@#$%^&*...)');
    }

    return { valid: errors.length === 0, errors };
  };

  const passwordValidation = validatePassword(newPassword);
  const passwordsMatch = newPassword === confirmPassword && confirmPassword !== '';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!passwordValidation.valid) {
      setError('Le mot de passe ne respecte pas les criteres de securite');
      return;
    }

    if (!passwordsMatch) {
      setError('Les mots de passe ne correspondent pas');
      return;
    }

    if (currentPassword === newPassword) {
      setError('Le nouveau mot de passe doit etre different de l\'ancien');
      return;
    }

    setIsLoading(true);
    const result = await onChangePassword(currentPassword, newPassword);
    setIsLoading(false);

    if (!result.success) {
      setError(result.error || 'Erreur lors du changement de mot de passe');
    }
  };

  return (
    <div className="change-password-overlay">
      <div className="change-password-modal">
        {/* Header */}
        <div className="change-password-header">
          <div className="change-password-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h2>Changement de mot de passe requis</h2>
          <p>Pour des raisons de securite, vous devez changer votre mot de passe avant de continuer.</p>
          <div className="change-password-email">{userEmail}</div>
        </div>

        {/* Error */}
        {error && (
          <div className="change-password-error">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="change-password-form">
          {/* Current Password */}
          <div className="change-password-field">
            <label>Mot de passe actuel</label>
            <div className="change-password-input-wrapper">
              <input
                type={showCurrentPassword ? 'text' : 'password'}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Entrez votre mot de passe actuel"
                required
              />
              <button
                type="button"
                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                className="change-password-toggle"
              >
                {showCurrentPassword ? (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                  </svg>
                ) : (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          {/* New Password */}
          <div className="change-password-field">
            <label>Nouveau mot de passe</label>
            <div className="change-password-input-wrapper">
              <input
                type={showNewPassword ? 'text' : 'password'}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Entrez votre nouveau mot de passe"
                required
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="change-password-toggle"
              >
                {showNewPassword ? (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                  </svg>
                ) : (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </button>
            </div>

            {/* Password requirements */}
            {newPassword && (
              <div className="change-password-requirements">
                <div className={`requirement ${newPassword.length >= 8 ? 'valid' : ''}`}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    {newPassword.length >= 8 ? (
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    ) : (
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    )}
                  </svg>
                  <span>Au moins 8 caracteres</span>
                </div>
                <div className={`requirement ${/[A-Z]/.test(newPassword) ? 'valid' : ''}`}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    {/[A-Z]/.test(newPassword) ? (
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    ) : (
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    )}
                  </svg>
                  <span>Au moins une majuscule</span>
                </div>
                <div className={`requirement ${/[a-z]/.test(newPassword) ? 'valid' : ''}`}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    {/[a-z]/.test(newPassword) ? (
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    ) : (
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    )}
                  </svg>
                  <span>Au moins une minuscule</span>
                </div>
                <div className={`requirement ${/[0-9]/.test(newPassword) ? 'valid' : ''}`}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    {/[0-9]/.test(newPassword) ? (
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    ) : (
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    )}
                  </svg>
                  <span>Au moins un chiffre</span>
                </div>
                <div className={`requirement ${/[!@#$%^&*(),.?":{}|<>]/.test(newPassword) ? 'valid' : ''}`}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    {/[!@#$%^&*(),.?":{}|<>]/.test(newPassword) ? (
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    ) : (
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    )}
                  </svg>
                  <span>Au moins un caractere special</span>
                </div>
              </div>
            )}
          </div>

          {/* Confirm Password */}
          <div className="change-password-field">
            <label>Confirmer le nouveau mot de passe</label>
            <div className="change-password-input-wrapper">
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirmez votre nouveau mot de passe"
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="change-password-toggle"
              >
                {showConfirmPassword ? (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                  </svg>
                ) : (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </button>
            </div>
            {confirmPassword && !passwordsMatch && (
              <p className="change-password-mismatch">Les mots de passe ne correspondent pas</p>
            )}
            {passwordsMatch && (
              <p className="change-password-match">Les mots de passe correspondent</p>
            )}
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isLoading || !passwordValidation.valid || !passwordsMatch}
            className="change-password-submit"
          >
            {isLoading ? (
              <span className="change-password-loading">
                <svg viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" fill="none" strokeDasharray="60" strokeDashoffset="20" />
                </svg>
                Changement en cours...
              </span>
            ) : (
              'Changer le mot de passe'
            )}
          </button>
        </form>
      </div>

      <style jsx>{`
        .change-password-overlay {
          position: fixed;
          inset: 0;
          z-index: 9999;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(0, 0, 0, 0.6);
          backdrop-filter: blur(8px);
          padding: 20px;
        }

        .change-password-modal {
          width: 100%;
          max-width: 480px;
          background: var(--background-white);
          border-radius: 24px;
          border: 1px solid var(--border);
          overflow: hidden;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
        }

        .change-password-header {
          padding: 32px 32px 24px;
          text-align: center;
          background: var(--primary-bg);
          border-bottom: 1px solid var(--border);
        }

        .change-password-icon {
          width: 64px;
          height: 64px;
          margin: 0 auto 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
          border-radius: 16px;
        }

        .change-password-icon svg {
          width: 32px;
          height: 32px;
          color: white;
        }

        .change-password-header h2 {
          font-size: 22px;
          font-weight: 700;
          color: var(--foreground);
          margin-bottom: 8px;
        }

        .change-password-header p {
          font-size: 14px;
          color: var(--foreground-muted);
          line-height: 1.5;
        }

        .change-password-email {
          margin-top: 12px;
          padding: 8px 16px;
          background: var(--background-secondary);
          border-radius: 8px;
          font-size: 13px;
          color: var(--primary);
          display: inline-block;
        }

        .change-password-error {
          display: flex;
          align-items: center;
          gap: 12px;
          margin: 16px 24px 0;
          padding: 14px 18px;
          background: var(--danger-bg);
          border: 1px solid var(--danger);
          border-radius: 12px;
        }

        .change-password-error svg {
          width: 20px;
          height: 20px;
          color: var(--danger);
          flex-shrink: 0;
        }

        .change-password-error span {
          font-size: 14px;
          color: var(--danger);
        }

        .change-password-form {
          padding: 24px 32px 32px;
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .change-password-field label {
          display: block;
          font-size: 13px;
          font-weight: 500;
          color: var(--foreground-muted);
          margin-bottom: 8px;
        }

        .change-password-input-wrapper {
          position: relative;
          display: flex;
          align-items: center;
        }

        .change-password-input-wrapper input {
          width: 100%;
          padding: 14px 48px 14px 16px;
          font-size: 15px;
          color: var(--foreground);
          background: var(--background-secondary);
          border: 2px solid var(--border);
          border-radius: 12px;
          outline: none;
          transition: all 0.2s ease;
        }

        .change-password-input-wrapper input::placeholder {
          color: var(--foreground-light);
        }

        .change-password-input-wrapper input:focus {
          border-color: var(--primary);
          background: var(--background-white);
        }

        .change-password-toggle {
          position: absolute;
          right: 12px;
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: transparent;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          color: var(--foreground-muted);
          transition: all 0.2s ease;
        }

        .change-password-toggle:hover {
          color: var(--foreground);
          background: var(--background-secondary);
        }

        .change-password-toggle svg {
          width: 18px;
          height: 18px;
        }

        .change-password-requirements {
          margin-top: 12px;
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 8px;
        }

        .requirement {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 12px;
          color: var(--foreground-light);
          transition: color 0.2s ease;
        }

        .requirement.valid {
          color: var(--success);
        }

        .requirement svg {
          width: 14px;
          height: 14px;
          flex-shrink: 0;
        }

        .change-password-mismatch {
          margin-top: 8px;
          font-size: 13px;
          color: var(--danger);
        }

        .change-password-match {
          margin-top: 8px;
          font-size: 13px;
          color: var(--success);
        }

        .change-password-submit {
          width: 100%;
          padding: 16px 24px;
          margin-top: 8px;
          font-size: 16px;
          font-weight: 600;
          color: white;
          background: var(--primary);
          border: none;
          border-radius: 12px;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .change-password-submit:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 10px 30px -10px rgba(99, 102, 241, 0.5);
        }

        .change-password-submit:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .change-password-loading {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
        }

        .change-password-loading svg {
          width: 20px;
          height: 20px;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
