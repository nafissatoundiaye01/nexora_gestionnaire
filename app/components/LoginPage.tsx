'use client';

import { useState } from 'react';
import { LoginCredentials } from '../types';

interface LoginPageProps {
  onLogin: (credentials: LoginCredentials) => Promise<{ success: boolean; error?: string }>;
}

export default function LoginPage({ onLogin }: LoginPageProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    const result = await onLogin({ email, password });

    setIsLoading(false);

    if (!result.success) {
      setError(result.error || 'Erreur de connexion');
    }
  };

  return (
    <div className="login-page">
      {/* Animated background */}
      <div className="login-bg">
        <div className="login-bg-gradient" />
        <div className="login-bg-pattern" />
        <div className="login-bg-orb login-bg-orb-1" />
        <div className="login-bg-orb login-bg-orb-2" />
        <div className="login-bg-orb login-bg-orb-3" />
      </div>

      {/* Main content */}
      <div className="login-container">
        {/* Left side - Branding */}
        <div className="login-branding">
          <div className="login-branding-content">
            {/* Logo */}
            <div className="login-logo">
              <div className="login-logo-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 14l2 2 4-4" />
                </svg>
              </div>
              <div className="login-logo-rings">
                <div className="login-logo-ring login-logo-ring-1" />
                <div className="login-logo-ring login-logo-ring-2" />
              </div>
            </div>

            {/* Title */}
            <h1 className="login-title">
              <span className="login-title-nexora">Nexora</span>
              <span className="login-title-agenda">Agenda</span>
            </h1>

            {/* Tagline */}
            <p className="login-tagline">
              Gerez vos projets et taches<br />avec simplicite et efficacite
            </p>

            {/* Features */}
            <div className="login-features">
              <div className="login-feature">
                <div className="login-feature-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <div>
                  <div className="login-feature-title">Rapide</div>
                  <div className="login-feature-desc">Performance optimale</div>
                </div>
              </div>
              <div className="login-feature">
                <div className="login-feature-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <div>
                  <div className="login-feature-title">Securise</div>
                  <div className="login-feature-desc">Vos donnees protegees</div>
                </div>
              </div>
              <div className="login-feature">
                <div className="login-feature-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <div>
                  <div className="login-feature-title">Collaboratif</div>
                  <div className="login-feature-desc">Travaillez en equipe</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right side - Form */}
        <div className="login-form-section">
          <div className="login-form-wrapper">
            {/* Mobile logo */}
            <div className="login-mobile-logo">
              <div className="login-mobile-logo-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                </svg>
              </div>
              <span className="login-mobile-logo-text">Nexora Agenda</span>
            </div>

            {/* Welcome */}
            <div className="login-welcome">
              <h2 className="login-welcome-title">Bienvenue</h2>
              <p className="login-welcome-subtitle">Connectez-vous pour continuer</p>
            </div>

            {/* Error */}
            {error && (
              <div className="login-error">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>{error}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleLogin} className="login-form">
              {/* Email field */}
              <div className={`login-field ${focusedField === 'email' ? 'login-field-focused' : ''} ${email ? 'login-field-filled' : ''}`}>
                <label className="login-field-label">Adresse email</label>
                <div className="login-field-input-wrapper">
                  <div className="login-field-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onFocus={() => setFocusedField('email')}
                    onBlur={() => setFocusedField(null)}
                    placeholder="votre@email.com"
                    required
                    autoComplete="email"
                    className="login-field-input"
                  />
                </div>
              </div>

              {/* Password field */}
              <div className={`login-field ${focusedField === 'password' ? 'login-field-focused' : ''} ${password ? 'login-field-filled' : ''}`}>
                <label className="login-field-label">Mot de passe</label>
                <div className="login-field-input-wrapper">
                  <div className="login-field-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onFocus={() => setFocusedField('password')}
                    onBlur={() => setFocusedField(null)}
                    placeholder="Votre mot de passe"
                    required
                    autoComplete="current-password"
                    className="login-field-input"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="login-field-toggle"
                  >
                    {showPassword ? (
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

              {/* Submit button */}
              <button
                type="submit"
                disabled={isLoading}
                className="login-submit"
              >
                {isLoading ? (
                  <span className="login-submit-loading">
                    <svg className="login-submit-spinner" viewBox="0 0 24 24">
                      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" fill="none" strokeDasharray="60" strokeDashoffset="20" />
                    </svg>
                    Connexion en cours...
                  </span>
                ) : (
                  <span className="login-submit-content">
                    Se connecter
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </span>
                )}
              </button>
            </form>

            {/* Footer */}
            <div className="login-footer">
              <p>&copy; 2024 Nexora Agenda. Tous droits reserves.</p>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .login-page {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          overflow: hidden;
          background: #0a0a0f;
        }

        .login-bg {
          position: absolute;
          inset: 0;
          z-index: 0;
        }

        .login-bg-gradient {
          position: absolute;
          inset: 0;
          background: radial-gradient(ellipse at 30% 20%, rgba(99, 102, 241, 0.15) 0%, transparent 50%),
                      radial-gradient(ellipse at 70% 80%, rgba(139, 92, 246, 0.1) 0%, transparent 50%);
        }

        .login-bg-pattern {
          position: absolute;
          inset: 0;
          background-image: radial-gradient(rgba(255, 255, 255, 0.03) 1px, transparent 1px);
          background-size: 40px 40px;
        }

        .login-bg-orb {
          position: absolute;
          border-radius: 50%;
          filter: blur(80px);
          animation: float 20s ease-in-out infinite;
        }

        .login-bg-orb-1 {
          width: 600px;
          height: 600px;
          background: rgba(99, 102, 241, 0.2);
          top: -200px;
          left: -200px;
          animation-delay: 0s;
        }

        .login-bg-orb-2 {
          width: 400px;
          height: 400px;
          background: rgba(139, 92, 246, 0.15);
          bottom: -100px;
          right: -100px;
          animation-delay: -7s;
        }

        .login-bg-orb-3 {
          width: 300px;
          height: 300px;
          background: rgba(168, 85, 247, 0.1);
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          animation-delay: -14s;
        }

        @keyframes float {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(30px, -30px) scale(1.05); }
          66% { transform: translate(-20px, 20px) scale(0.95); }
        }

        .login-container {
          position: relative;
          z-index: 1;
          display: flex;
          width: 100%;
          max-width: 1200px;
          min-height: 700px;
          margin: 20px;
          border-radius: 24px;
          overflow: hidden;
          background: rgba(255, 255, 255, 0.02);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.05);
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
        }

        .login-branding {
          flex: 1;
          display: none;
          padding: 60px;
          background: linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(139, 92, 246, 0.05) 100%);
          border-right: 1px solid rgba(255, 255, 255, 0.05);
        }

        @media (min-width: 1024px) {
          .login-branding {
            display: flex;
            align-items: center;
            justify-content: center;
          }
        }

        .login-branding-content {
          text-align: center;
        }

        .login-logo {
          position: relative;
          width: 100px;
          height: 100px;
          margin: 0 auto 40px;
        }

        .login-logo-icon {
          position: relative;
          z-index: 2;
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
          border-radius: 24px;
          box-shadow: 0 20px 40px -10px rgba(99, 102, 241, 0.5);
        }

        .login-logo-icon svg {
          width: 50px;
          height: 50px;
          color: white;
        }

        .login-logo-rings {
          position: absolute;
          inset: -20px;
          pointer-events: none;
        }

        .login-logo-ring {
          position: absolute;
          inset: 0;
          border: 2px solid rgba(99, 102, 241, 0.2);
          border-radius: 32px;
          animation: pulse 3s ease-in-out infinite;
        }

        .login-logo-ring-1 {
          animation-delay: 0s;
        }

        .login-logo-ring-2 {
          inset: -10px;
          animation-delay: 1.5s;
        }

        @keyframes pulse {
          0%, 100% { opacity: 0; transform: scale(0.8); }
          50% { opacity: 1; transform: scale(1); }
        }

        .login-title {
          font-size: 42px;
          font-weight: 800;
          line-height: 1.1;
          margin-bottom: 16px;
        }

        .login-title-nexora {
          display: block;
          background: linear-gradient(135deg, #fff 0%, rgba(255, 255, 255, 0.8) 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .login-title-agenda {
          display: block;
          background: linear-gradient(135deg, #6366f1 0%, #a855f7 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .login-tagline {
          font-size: 16px;
          color: rgba(255, 255, 255, 0.5);
          line-height: 1.6;
          margin-bottom: 48px;
        }

        .login-features {
          display: flex;
          flex-direction: column;
          gap: 20px;
          text-align: left;
        }

        .login-feature {
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 16px 20px;
          background: rgba(255, 255, 255, 0.03);
          border-radius: 16px;
          border: 1px solid rgba(255, 255, 255, 0.05);
          transition: all 0.3s ease;
        }

        .login-feature:hover {
          background: rgba(255, 255, 255, 0.05);
          border-color: rgba(99, 102, 241, 0.3);
          transform: translateX(5px);
        }

        .login-feature-icon {
          width: 44px;
          height: 44px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, rgba(99, 102, 241, 0.2) 0%, rgba(139, 92, 246, 0.2) 100%);
          border-radius: 12px;
          flex-shrink: 0;
        }

        .login-feature-icon svg {
          width: 22px;
          height: 22px;
          color: #a5b4fc;
        }

        .login-feature-title {
          font-size: 15px;
          font-weight: 600;
          color: rgba(255, 255, 255, 0.9);
        }

        .login-feature-desc {
          font-size: 13px;
          color: rgba(255, 255, 255, 0.4);
        }

        .login-form-section {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 40px;
        }

        .login-form-wrapper {
          width: 100%;
          max-width: 400px;
        }

        .login-mobile-logo {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
          margin-bottom: 40px;
        }

        @media (min-width: 1024px) {
          .login-mobile-logo {
            display: none;
          }
        }

        .login-mobile-logo-icon {
          width: 48px;
          height: 48px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
          border-radius: 14px;
        }

        .login-mobile-logo-icon svg {
          width: 26px;
          height: 26px;
          color: white;
        }

        .login-mobile-logo-text {
          font-size: 22px;
          font-weight: 700;
          color: white;
        }

        .login-welcome {
          text-align: center;
          margin-bottom: 32px;
        }

        .login-welcome-title {
          font-size: 32px;
          font-weight: 700;
          color: white;
          margin-bottom: 8px;
        }

        .login-welcome-subtitle {
          font-size: 15px;
          color: rgba(255, 255, 255, 0.5);
        }

        .login-error {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 14px 18px;
          background: rgba(239, 68, 68, 0.1);
          border: 1px solid rgba(239, 68, 68, 0.2);
          border-radius: 14px;
          margin-bottom: 24px;
        }

        .login-error svg {
          width: 20px;
          height: 20px;
          color: #f87171;
          flex-shrink: 0;
        }

        .login-error span {
          font-size: 14px;
          color: #fca5a5;
        }

        .login-form {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .login-field {
          position: relative;
        }

        .login-field-label {
          display: block;
          font-size: 13px;
          font-weight: 500;
          color: rgba(255, 255, 255, 0.6);
          margin-bottom: 8px;
          transition: color 0.2s ease;
        }

        .login-field-focused .login-field-label {
          color: #a5b4fc;
        }

        .login-field-input-wrapper {
          position: relative;
          display: flex;
          align-items: center;
        }

        .login-field-icon {
          position: absolute;
          left: 16px;
          width: 20px;
          height: 20px;
          color: rgba(255, 255, 255, 0.3);
          pointer-events: none;
          transition: color 0.2s ease;
        }

        .login-field-focused .login-field-icon {
          color: #a5b4fc;
        }

        .login-field-input {
          width: 100%;
          padding: 16px 16px 16px 52px;
          font-size: 15px;
          color: white;
          background: rgba(255, 255, 255, 0.03);
          border: 2px solid rgba(255, 255, 255, 0.08);
          border-radius: 14px;
          outline: none;
          transition: all 0.2s ease;
        }

        .login-field-input::placeholder {
          color: rgba(255, 255, 255, 0.25);
        }

        .login-field-input:focus {
          background: rgba(255, 255, 255, 0.05);
          border-color: rgba(99, 102, 241, 0.5);
          box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.1);
        }

        .login-field-toggle {
          position: absolute;
          right: 14px;
          width: 36px;
          height: 36px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: rgba(255, 255, 255, 0.4);
          background: transparent;
          border: none;
          border-radius: 10px;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .login-field-toggle:hover {
          color: rgba(255, 255, 255, 0.7);
          background: rgba(255, 255, 255, 0.05);
        }

        .login-field-toggle svg {
          width: 20px;
          height: 20px;
        }

        .login-submit {
          position: relative;
          width: 100%;
          padding: 18px 24px;
          margin-top: 8px;
          font-size: 16px;
          font-weight: 600;
          color: white;
          background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
          border: none;
          border-radius: 14px;
          cursor: pointer;
          overflow: hidden;
          transition: all 0.3s ease;
        }

        .login-submit:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 20px 40px -10px rgba(99, 102, 241, 0.5);
        }

        .login-submit:active:not(:disabled) {
          transform: translateY(0);
        }

        .login-submit:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }

        .login-submit::before {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, rgba(255, 255, 255, 0.2) 0%, transparent 100%);
          opacity: 0;
          transition: opacity 0.3s ease;
        }

        .login-submit:hover::before {
          opacity: 1;
        }

        .login-submit-content {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
        }

        .login-submit-content svg {
          width: 20px;
          height: 20px;
          transition: transform 0.3s ease;
        }

        .login-submit:hover .login-submit-content svg {
          transform: translateX(4px);
        }

        .login-submit-loading {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
        }

        .login-submit-spinner {
          width: 22px;
          height: 22px;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        .login-footer {
          margin-top: 48px;
          text-align: center;
        }

        .login-footer p {
          font-size: 13px;
          color: rgba(255, 255, 255, 0.3);
        }
      `}</style>
    </div>
  );
}
