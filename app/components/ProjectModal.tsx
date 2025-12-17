'use client';

import { useState, useEffect } from 'react';
import { Project, ProjectStatus } from '../types';
import CustomSelect from './CustomSelect';

interface ProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (project: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>) => void;
  project?: Project | null;
}

const COLORS = [
  '#3b82f6', '#6366f1', '#8b5cf6', '#ec4899', '#ef4444',
  '#f97316', '#f59e0b', '#22c55e', '#14b8a6', '#06b6d4',
];

export default function ProjectModal({ isOpen, onClose, onSave, project }: ProjectModalProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<ProjectStatus>('active');
  const [color, setColor] = useState(COLORS[0]);

  useEffect(() => {
    if (project) {
      setName(project.name);
      setDescription(project.description);
      setStatus(project.status);
      setColor(project.color);
    } else {
      setName('');
      setDescription('');
      setStatus('active');
      setColor(COLORS[0]);
    }
  }, [project, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    onSave({ name, description, status, color });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4 animate-fade-in">
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full animate-slide-in">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h2 className="text-xl font-semibold text-gray-900">
            {project ? 'Modifier le projet' : 'Nouveau projet'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-all"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nom du projet
              </label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                className="input"
                placeholder="Mon projet"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                value={description}
                onChange={e => setDescription(e.target.value)}
                className="input resize-none"
                rows={3}
                placeholder="Description du projet..."
              />
            </div>

            <CustomSelect
              label="Statut"
              value={status}
              onChange={(value) => setStatus(value as ProjectStatus)}
              options={[
                { value: 'active', label: 'Actif', color: '#10b981' },
                { value: 'on_hold', label: 'En pause', color: '#f59e0b' },
                { value: 'completed', label: 'Termine', color: '#6366f1' },
              ]}
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Couleur
              </label>
              <div className="flex gap-2 flex-wrap">
                {COLORS.map(c => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setColor(c)}
                    className={`w-9 h-9 rounded-lg transition-all ${
                      color === c
                        ? 'ring-2 ring-offset-2 ring-blue-500 scale-110'
                        : 'hover:scale-105'
                    }`}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex gap-3 mt-8">
            <button
              type="button"
              onClick={onClose}
              className="btn btn-secondary flex-1"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="btn btn-primary flex-1"
            >
              {project ? 'Enregistrer' : 'Créer le projet'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
