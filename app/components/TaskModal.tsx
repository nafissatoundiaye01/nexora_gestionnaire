'use client';

import { useState, useEffect } from 'react';
import { Task, TaskStatus, Priority } from '../types';
import CustomSelect from './CustomSelect';
import CustomDatePicker from './CustomDatePicker';

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => void;
  task?: Task | null;
  projectId: string;
}

export default function TaskModal({ isOpen, onClose, onSave, task, projectId }: TaskModalProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<TaskStatus>('todo');
  const [priority, setPriority] = useState<Priority>('medium');
  const [dueDate, setDueDate] = useState('');

  useEffect(() => {
    if (task) {
      setTitle(task.title);
      setDescription(task.description);
      setStatus(task.status);
      setPriority(task.priority);
      setDueDate(task.dueDate || '');
    } else {
      setTitle('');
      setDescription('');
      setStatus('todo');
      setPriority('medium');
      setDueDate('');
    }
  }, [task, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    onSave({
      title,
      description,
      status,
      priority,
      projectId,
      dueDate: dueDate || undefined,
    });
    onClose();
  };

  if (!isOpen) return null;

  const priorityOptions: { value: Priority; label: string; color: string }[] = [
    { value: 'low', label: 'Basse', color: '#94a3b8' },
    { value: 'medium', label: 'Moyenne', color: '#f59e0b' },
    { value: 'high', label: 'Haute', color: '#ef4444' },
  ];

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4 animate-fade-in">
      <div className="rounded-2xl shadow-xl max-w-md w-full animate-slide-in" style={{ backgroundColor: 'var(--background-white)' }}>
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b" style={{ borderColor: 'var(--border)' }}>
          <h2 className="text-xl font-semibold" style={{ color: 'var(--foreground)' }}>
            {task ? 'Modifier la tâche' : 'Nouvelle tâche'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg transition-all"
            style={{ color: 'var(--foreground-muted)' }}
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
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--foreground-muted)' }}>
                Titre
              </label>
              <input
                type="text"
                value={title}
                onChange={e => setTitle(e.target.value)}
                className="input"
                placeholder="Ma tâche"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--foreground-muted)' }}>
                Description
              </label>
              <textarea
                value={description}
                onChange={e => setDescription(e.target.value)}
                className="input resize-none"
                rows={3}
                placeholder="Description de la tâche..."
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <CustomSelect
                label="Statut"
                value={status}
                onChange={(value) => setStatus(value as TaskStatus)}
                options={[
                  { value: 'todo', label: 'A faire', color: '#94a3b8' },
                  { value: 'in_progress', label: 'En cours', color: '#f59e0b' },
                  { value: 'done', label: 'Termine', color: '#10b981' },
                ]}
              />

              <CustomDatePicker
                label="Echeance"
                value={dueDate}
                onChange={setDueDate}
                placeholder="Selectionner"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-3" style={{ color: 'var(--foreground-muted)' }}>
                Priorité
              </label>
              <div className="flex gap-2">
                {priorityOptions.map(opt => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setPriority(opt.value)}
                    className="flex-1 py-2.5 px-4 rounded-lg font-medium text-sm transition-all flex items-center justify-center gap-2"
                    style={{
                      backgroundColor: priority === opt.value ? 'var(--primary-bg)' : 'var(--background-secondary)',
                      border: priority === opt.value ? '2px solid var(--primary)' : '2px solid transparent',
                      color: priority === opt.value ? 'var(--primary)' : 'var(--foreground-muted)',
                    }}
                  >
                    <span
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: opt.color }}
                    />
                    {opt.label}
                  </button>
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
              {task ? 'Enregistrer' : 'Créer la tâche'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
