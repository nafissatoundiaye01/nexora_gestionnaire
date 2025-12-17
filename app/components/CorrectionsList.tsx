'use client';

import { useState } from 'react';
import { Correction, TeamMember, CorrectionStatus, Priority } from '../types';
import CustomSelect from './CustomSelect';
import CustomDatePicker from './CustomDatePicker';

interface CorrectionsListProps {
  corrections: Correction[];
  teamMembers: TeamMember[];
  projectId: string;
  projectName?: string;
  currentUserId?: string;
  onAdd: (correction: Omit<Correction, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  onUpdate: (id: string, updates: Partial<Correction>) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  onNotifyAssignment?: (assignedToId: string, correctionTitle: string) => Promise<void>;
}

type FilterType = 'all' | 'mine';

export default function CorrectionsList({
  corrections,
  teamMembers,
  projectId,
  projectName,
  currentUserId,
  onAdd,
  onUpdate,
  onDelete,
  onNotifyAssignment,
}: CorrectionsListProps) {
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [filter, setFilter] = useState<FilterType>('all');
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'medium' as Priority,
    assignedTo: '',
    dueDate: '',
  });

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      priority: 'medium',
      assignedTo: '',
      dueDate: '',
    });
    setShowForm(false);
    setEditingId(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) return;

    if (editingId) {
      const existingCorrection = corrections.find(c => c.id === editingId);
      const assignmentChanged = existingCorrection?.assignedTo !== formData.assignedTo;

      await onUpdate(editingId, {
        title: formData.title,
        description: formData.description,
        priority: formData.priority,
        assignedTo: formData.assignedTo || undefined,
        dueDate: formData.dueDate || undefined,
      });

      // Notify if assigned to someone new
      if (assignmentChanged && formData.assignedTo && onNotifyAssignment) {
        await onNotifyAssignment(formData.assignedTo, formData.title);
      }
    } else {
      await onAdd({
        projectId,
        title: formData.title,
        description: formData.description,
        status: 'pending',
        priority: formData.priority,
        assignedTo: formData.assignedTo || undefined,
        createdBy: currentUserId || 'current-user',
        dueDate: formData.dueDate || undefined,
      });

      // Notify if assigned to someone
      if (formData.assignedTo && onNotifyAssignment) {
        await onNotifyAssignment(formData.assignedTo, formData.title);
      }
    }
    resetForm();
  };

  const startEdit = (correction: Correction) => {
    setFormData({
      title: correction.title,
      description: correction.description,
      priority: correction.priority,
      assignedTo: correction.assignedTo || '',
      dueDate: correction.dueDate || '',
    });
    setEditingId(correction.id);
    setShowForm(true);
  };

  const getStatusColor = (status: CorrectionStatus) => {
    switch (status) {
      case 'pending': return '#f59e0b';
      case 'in_progress': return '#3b82f6';
      case 'resolved': return '#10b981';
    }
  };

  const getStatusLabel = (status: CorrectionStatus) => {
    switch (status) {
      case 'pending': return 'En attente';
      case 'in_progress': return 'En cours';
      case 'resolved': return 'Resolu';
    }
  };

  const getPriorityColor = (priority: Priority) => {
    switch (priority) {
      case 'low': return '#10b981';
      case 'medium': return '#f59e0b';
      case 'high': return '#ef4444';
    }
  };

  const getMemberName = (memberId?: string) => {
    if (!memberId) return 'Non assigne';
    const member = teamMembers.find(m => m.id === memberId);
    return member?.name || 'Inconnu';
  };

  // Apply filter
  const filterCorrections = (list: Correction[]) => {
    if (filter === 'mine' && currentUserId) {
      return list.filter(c => c.assignedTo === currentUserId);
    }
    return list;
  };

  const pendingCorrections = filterCorrections(corrections.filter(c => c.status !== 'resolved'));
  const resolvedCorrections = filterCorrections(corrections.filter(c => c.status === 'resolved'));

  const totalPending = corrections.filter(c => c.status !== 'resolved').length;
  const myPendingCount = currentUserId
    ? corrections.filter(c => c.status !== 'resolved' && c.assignedTo === currentUserId).length
    : 0;

  return (
    <div className="corrections-list">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <h3 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
            Points a rectifier ({pendingCorrections.length})
          </h3>

          {/* Filter buttons */}
          <div className="flex items-center gap-1 p-1 rounded-lg" style={{ backgroundColor: 'var(--background-secondary)' }}>
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                filter === 'all' ? 'text-white shadow-sm' : ''
              }`}
              style={{
                backgroundColor: filter === 'all' ? 'var(--primary)' : 'transparent',
                color: filter === 'all' ? 'white' : 'var(--foreground-muted)',
              }}
            >
              Tous ({totalPending})
            </button>
            {currentUserId && (
              <button
                onClick={() => setFilter('mine')}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  filter === 'mine' ? 'text-white shadow-sm' : ''
                }`}
                style={{
                  backgroundColor: filter === 'mine' ? 'var(--primary)' : 'transparent',
                  color: filter === 'mine' ? 'white' : 'var(--foreground-muted)',
                }}
              >
                Mes points ({myPendingCount})
              </button>
            )}
          </div>
        </div>

        <button
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 rounded-lg text-white text-sm font-medium transition-colors"
          style={{ backgroundColor: 'var(--primary)' }}
        >
          {showForm ? 'Annuler' : '+ Ajouter'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="card p-4 mb-6" style={{ backgroundColor: 'var(--background-white)' }}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>
                Titre *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border"
                style={{
                  backgroundColor: 'var(--background)',
                  borderColor: 'var(--border-color)',
                  color: 'var(--text-primary)'
                }}
                placeholder="Decrire le point a corriger..."
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border resize-none"
                style={{
                  backgroundColor: 'var(--background)',
                  borderColor: 'var(--border-color)',
                  color: 'var(--text-primary)'
                }}
                rows={3}
                placeholder="Details supplementaires..."
              />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <CustomSelect
                label="Priorite"
                value={formData.priority}
                onChange={(value) => setFormData({ ...formData, priority: value as Priority })}
                options={[
                  { value: 'low', label: 'Basse', color: '#10b981' },
                  { value: 'medium', label: 'Moyenne', color: '#f59e0b' },
                  { value: 'high', label: 'Haute', color: '#ef4444' },
                ]}
              />
              <CustomSelect
                label="Assigner a"
                value={formData.assignedTo}
                onChange={(value) => setFormData({ ...formData, assignedTo: value })}
                placeholder="Non assigne"
                options={[
                  { value: '', label: 'Non assigne' },
                  ...teamMembers.map(member => ({
                    value: member.id,
                    label: member.name,
                  })),
                ]}
              />
              <CustomDatePicker
                label="Echeance"
                value={formData.dueDate}
                onChange={(value) => setFormData({ ...formData, dueDate: value })}
                placeholder="Selectionner"
              />
            </div>
            <div className="flex gap-2 justify-end">
              <button
                type="button"
                onClick={resetForm}
                className="px-4 py-2 rounded-lg text-sm font-medium"
                style={{
                  backgroundColor: 'var(--background)',
                  color: 'var(--text-secondary)'
                }}
              >
                Annuler
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-lg text-white text-sm font-medium"
                style={{ backgroundColor: 'var(--primary)' }}
              >
                {editingId ? 'Modifier' : 'Ajouter'}
              </button>
            </div>
          </div>
        </form>
      )}

      <div className="space-y-3">
        {pendingCorrections.map(correction => (
          <div
            key={correction.id}
            className="card p-4 border-l-4"
            style={{
              backgroundColor: 'var(--background-white)',
              borderLeftColor: getPriorityColor(correction.priority)
            }}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h4 className="font-medium" style={{ color: 'var(--text-primary)' }}>
                    {correction.title}
                  </h4>
                  <span
                    className="px-2 py-0.5 rounded-full text-xs font-medium text-white"
                    style={{ backgroundColor: getStatusColor(correction.status) }}
                  >
                    {getStatusLabel(correction.status)}
                  </span>
                </div>
                {correction.description && (
                  <p className="text-sm mb-2" style={{ color: 'var(--text-secondary)' }}>
                    {correction.description}
                  </p>
                )}
                <div className="flex items-center gap-4 text-xs" style={{ color: 'var(--text-tertiary)' }}>
                  <span className="flex items-center gap-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    {getMemberName(correction.assignedTo)}
                  </span>
                  {correction.dueDate && (
                    <span className="flex items-center gap-1">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      {new Date(correction.dueDate).toLocaleDateString('fr-FR')}
                    </span>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2 ml-4">
                {correction.status === 'pending' && (
                  <button
                    onClick={() => onUpdate(correction.id, { status: 'in_progress' })}
                    className="p-1.5 rounded-lg hover:bg-blue-100 transition-colors"
                    title="Marquer en cours"
                  >
                    <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </button>
                )}
                {correction.status !== 'resolved' && (
                  <button
                    onClick={() => onUpdate(correction.id, { status: 'resolved' })}
                    className="p-1.5 rounded-lg hover:bg-green-100 transition-colors"
                    title="Marquer comme resolu"
                  >
                    <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </button>
                )}
                <button
                  onClick={() => startEdit(correction)}
                  className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
                  title="Modifier"
                >
                  <svg className="w-5 h-5" style={{ color: 'var(--text-tertiary)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </button>
                <button
                  onClick={() => onDelete(correction.id)}
                  className="p-1.5 rounded-lg hover:bg-red-100 transition-colors"
                  title="Supprimer"
                >
                  <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        ))}

        {pendingCorrections.length === 0 && (
          <div
            className="text-center py-8 rounded-lg"
            style={{ backgroundColor: 'var(--background)', color: 'var(--text-tertiary)' }}
          >
            <svg className="w-12 h-12 mx-auto mb-3 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p>{filter === 'mine' ? 'Aucun point vous est assigne' : 'Aucun point a rectifier'}</p>
          </div>
        )}
      </div>

      {resolvedCorrections.length > 0 && (
        <div className="mt-8">
          <h4 className="text-sm font-medium mb-3" style={{ color: 'var(--text-tertiary)' }}>
            Resolus ({resolvedCorrections.length})
          </h4>
          <div className="space-y-2">
            {resolvedCorrections.map(correction => (
              <div
                key={correction.id}
                className="card p-3 opacity-60"
                style={{ backgroundColor: 'var(--background)' }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="line-through" style={{ color: 'var(--text-secondary)' }}>
                      {correction.title}
                    </span>
                  </div>
                  <span className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
                    {correction.resolvedAt && new Date(correction.resolvedAt).toLocaleDateString('fr-FR')}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
