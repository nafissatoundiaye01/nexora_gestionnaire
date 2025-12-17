'use client';

import { useState } from 'react';
import CustomSelect from './CustomSelect';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  isDark: boolean;
  onToggleTheme: () => void;
}

export default function SettingsModal({ isOpen, onClose, isDark, onToggleTheme }: SettingsModalProps) {
  const [activeTab, setActiveTab] = useState<'general' | 'appearance' | 'account'>('general');
  const [language, setLanguage] = useState('fr');
  const [timezone, setTimezone] = useState('Europe/Paris');
  const [dateFormat, setDateFormat] = useState('dd/mm/yyyy');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  if (!isOpen) return null;

  const tabs = [
    { id: 'general', label: 'Général', icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    )},
    { id: 'appearance', label: 'Apparence', icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
      </svg>
    )},
    { id: 'account', label: 'Compte', icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
      </svg>
    )},
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div
        className="relative w-full max-w-3xl mx-4 rounded-2xl shadow-2xl overflow-hidden"
        style={{ backgroundColor: 'var(--background-white)' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b" style={{ borderColor: 'var(--border)' }}>
          <h2 className="text-xl font-bold" style={{ color: 'var(--foreground)' }}>Paramètres</h2>
          <button onClick={onClose} className="icon-btn">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex" style={{ minHeight: '400px' }}>
          {/* Sidebar */}
          <div className="w-48 p-4 border-r" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--background-secondary)' }}>
            <nav className="space-y-1">
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as typeof activeTab)}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${
                    activeTab === tab.id ? 'font-medium' : ''
                  }`}
                  style={{
                    backgroundColor: activeTab === tab.id ? 'var(--primary-bg)' : 'transparent',
                    color: activeTab === tab.id ? 'var(--primary)' : 'var(--foreground-muted)',
                  }}
                >
                  {tab.icon}
                  <span className="text-sm">{tab.label}</span>
                </button>
              ))}
            </nav>
          </div>

          {/* Content */}
          <div className="flex-1 p-6 overflow-y-auto">
            {activeTab === 'general' && (
              <div className="space-y-6">
                <CustomSelect
                  label="Langue"
                  value={language}
                  onChange={setLanguage}
                  options={[
                    { value: 'fr', label: 'Francais' },
                    { value: 'en', label: 'English' },
                    { value: 'es', label: 'Espanol' },
                  ]}
                />

                <CustomSelect
                  label="Fuseau horaire"
                  value={timezone}
                  onChange={setTimezone}
                  options={[
                    { value: 'Europe/Paris', label: 'Europe/Paris (GMT+1)' },
                    { value: 'Africa/Dakar', label: 'Africa/Dakar (GMT+0)' },
                    { value: 'America/New_York', label: 'America/New_York (GMT-5)' },
                  ]}
                />

                <CustomSelect
                  label="Format de date"
                  value={dateFormat}
                  onChange={setDateFormat}
                  options={[
                    { value: 'dd/mm/yyyy', label: 'DD/MM/YYYY' },
                    { value: 'mm/dd/yyyy', label: 'MM/DD/YYYY' },
                    { value: 'yyyy-mm-dd', label: 'YYYY-MM-DD' },
                  ]}
                />
              </div>
            )}

            {activeTab === 'appearance' && (
              <div className="space-y-6">
                <div>
                  <h3 className="font-semibold mb-4" style={{ color: 'var(--foreground)' }}>Thème</h3>
                  <div className="flex gap-4">
                    <button
                      onClick={() => isDark && onToggleTheme()}
                      className={`flex-1 p-4 rounded-xl border-2 transition-colors ${
                        !isDark ? 'border-indigo-500' : ''
                      }`}
                      style={{
                        backgroundColor: '#ffffff',
                        borderColor: !isDark ? undefined : '#e5e7eb',
                      }}
                    >
                      <div className="flex items-center gap-3 mb-3">
                        <svg className="w-6 h-6 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                        </svg>
                        <span className="font-medium text-gray-900">Clair</span>
                      </div>
                      <div className="space-y-2">
                        <div className="h-2 rounded bg-gray-200" />
                        <div className="h-2 rounded bg-gray-100 w-3/4" />
                      </div>
                    </button>

                    <button
                      onClick={() => !isDark && onToggleTheme()}
                      className={`flex-1 p-4 rounded-xl border-2 transition-colors ${
                        isDark ? 'border-indigo-500' : ''
                      }`}
                      style={{
                        backgroundColor: '#1f2937',
                        borderColor: isDark ? undefined : '#374151',
                      }}
                    >
                      <div className="flex items-center gap-3 mb-3">
                        <svg className="w-6 h-6 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                        </svg>
                        <span className="font-medium text-white">Sombre</span>
                      </div>
                      <div className="space-y-2">
                        <div className="h-2 rounded bg-gray-600" />
                        <div className="h-2 rounded bg-gray-700 w-3/4" />
                      </div>
                    </button>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold mb-4" style={{ color: 'var(--foreground)' }}>Couleur d&apos;accent</h3>
                  <div className="flex gap-3">
                    {['#6366f1', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#3b82f6'].map(color => (
                      <button
                        key={color}
                        className="w-10 h-10 rounded-xl transition-transform hover:scale-110"
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'account' && (
              <div className="space-y-6">
                <div>
                  <h3 className="font-semibold mb-4" style={{ color: 'var(--foreground)' }}>Changer le mot de passe</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-1" style={{ color: 'var(--foreground-muted)' }}>
                        Mot de passe actuel
                      </label>
                      <input
                        type="password"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        placeholder="Entrez votre mot de passe actuel"
                        className="w-full px-4 py-2 rounded-lg"
                        style={{
                          backgroundColor: 'var(--background-secondary)',
                          color: 'var(--foreground)',
                          border: '1px solid var(--border)',
                        }}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1" style={{ color: 'var(--foreground-muted)' }}>
                        Nouveau mot de passe
                      </label>
                      <input
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="Entrez votre nouveau mot de passe"
                        className="w-full px-4 py-2 rounded-lg"
                        style={{
                          backgroundColor: 'var(--background-secondary)',
                          color: 'var(--foreground)',
                          border: '1px solid var(--border)',
                        }}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1" style={{ color: 'var(--foreground-muted)' }}>
                        Confirmer le nouveau mot de passe
                      </label>
                      <input
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Confirmez votre nouveau mot de passe"
                        className="w-full px-4 py-2 rounded-lg"
                        style={{
                          backgroundColor: 'var(--background-secondary)',
                          color: 'var(--foreground)',
                          border: '1px solid var(--border)',
                        }}
                      />
                    </div>
                    {newPassword && confirmPassword && newPassword !== confirmPassword && (
                      <p className="text-sm text-red-500">Les mots de passe ne correspondent pas</p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t" style={{ borderColor: 'var(--border)' }}>
          <button onClick={onClose} className="btn btn-secondary">
            Annuler
          </button>
          <button onClick={onClose} className="btn btn-primary">
            Enregistrer
          </button>
        </div>
      </div>
    </div>
  );
}
