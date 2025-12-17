'use client';

import { Task, TaskStatus, Priority } from '../types';

interface TaskCardProps {
  task: Task;
  onStatusChange: (id: string, status: TaskStatus) => void;
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
}

export default function TaskCard({ task, onStatusChange, onEdit, onDelete }: TaskCardProps) {
  const statusConfig: Record<TaskStatus, { label: string; badgeClass: string }> = {
    todo: { label: 'À faire', badgeClass: 'badge-gray' },
    in_progress: { label: 'En cours', badgeClass: 'badge-primary' },
    done: { label: 'Terminé', badgeClass: 'badge-success' },
  };

  const priorityConfig: Record<Priority, { label: string; color: string }> = {
    low: { label: 'Basse', color: '#94a3b8' },
    medium: { label: 'Moyenne', color: '#f59e0b' },
    high: { label: 'Haute', color: '#ef4444' },
  };

  const nextStatus: Record<TaskStatus, TaskStatus> = {
    todo: 'in_progress',
    in_progress: 'done',
    done: 'todo',
  };

  const status = statusConfig[task.status];
  const priority = priorityConfig[task.priority];
  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'done';

  return (
    <div className={`rounded-xl p-4 animate-fade-in transition-all group ${task.status === 'done' ? 'opacity-60' : ''}`} style={{ background: 'var(--background-white)', border: '1px solid var(--border)' }}>
      <div className="flex items-start gap-4">
        {/* Checkbox */}
        <button
          onClick={() => onStatusChange(task.id, nextStatus[task.status])}
          className={`checkbox mt-0.5 flex-shrink-0 ${task.status === 'done' ? 'checked' : ''}`}
        >
          {task.status === 'done' && (
            <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          )}
        </button>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <h4 className={`font-medium ${task.status === 'done' ? 'line-through' : ''}`} style={{ color: task.status === 'done' ? 'var(--foreground-light)' : 'var(--foreground)' }}>
              {task.title}
            </h4>
            <span className={`badge ${status.badgeClass}`}>
              {status.label}
            </span>
          </div>

          {task.description && (
            <p className="text-sm mb-2 line-clamp-2" style={{ color: 'var(--foreground-muted)' }}>{task.description}</p>
          )}

          <div className="flex items-center gap-4 text-sm">
            {/* Priority */}
            <div className="flex items-center gap-1.5">
              <span
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: priority.color }}
              />
              <span style={{ color: 'var(--foreground-muted)' }}>{priority.label}</span>
            </div>

            {/* Due date */}
            {task.dueDate && (
              <div className="flex items-center gap-1.5" style={{ color: isOverdue ? 'var(--danger)' : 'var(--foreground-muted)' }}>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span>{new Date(task.dueDate).toLocaleDateString('fr-FR')}</span>
                {isOverdue && <span className="text-xs font-medium">(En retard)</span>}
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => onEdit(task)}
            className="p-2 text-gray-400 hover:text-violet-600 hover:bg-violet-50 rounded-lg transition-all"
            title="Modifier"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </button>
          <button
            onClick={() => onDelete(task.id)}
            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
            title="Supprimer"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
