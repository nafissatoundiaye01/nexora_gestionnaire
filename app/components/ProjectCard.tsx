'use client';

import { ProjectWithProgress } from '../types';

interface ProjectCardProps {
  project: ProjectWithProgress;
  onSelect: (id: string) => void;
  onEdit: (project: ProjectWithProgress) => void;
  onDelete: (id: string) => void;
}

export default function ProjectCard({ project, onSelect, onEdit, onDelete }: ProjectCardProps) {
  const statusConfig = {
    active: { label: 'Actif', class: 'badge-success' },
    completed: { label: 'Terminé', class: 'badge-primary' },
    on_hold: { label: 'En pause', class: 'badge-warning' },
  };

  const status = statusConfig[project.status];

  return (
    <div
      className="card p-5 cursor-pointer animate-fade-in group"
      onClick={() => onSelect(project.id)}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div
            className="avatar text-base"
            style={{ backgroundColor: project.color }}
          >
            {project.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <h3 className="font-semibold group-hover:text-violet-600 transition-colors" style={{ color: 'var(--foreground)' }}>
              {project.name}
            </h3>
            <p className="text-sm" style={{ color: 'var(--foreground-muted)' }}>
              {project.totalTasks} tâche{project.totalTasks > 1 ? 's' : ''}
            </p>
          </div>
        </div>
        <span className={`badge ${status.class}`}>
          {status.label}
        </span>
      </div>

      <p className="text-sm mb-4 line-clamp-2 min-h-[40px]" style={{ color: 'var(--foreground-muted)' }}>
        {project.description || 'Aucune description'}
      </p>

      {/* Progress */}
      <div className="mb-4">
        <div className="flex justify-between text-sm mb-2">
          <span style={{ color: 'var(--foreground-muted)' }}>Progression</span>
          <span className="font-semibold" style={{ color: 'var(--foreground)' }}>{project.progress}%</span>
        </div>
        <div className="progress-bar">
          <div
            className="progress-bar-fill"
            style={{
              width: `${project.progress}%`,
              backgroundColor: project.color,
            }}
          />
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-3" style={{ borderTop: '1px solid var(--border)' }}>
        <div className="flex items-center gap-2 text-sm" style={{ color: 'var(--foreground-muted)' }}>
          <svg className="w-4 h-4" style={{ color: 'var(--success)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          <span>
            <span className="font-medium" style={{ color: 'var(--foreground)' }}>{project.completedTasks}</span>
            /{project.totalTasks} terminées
          </span>
        </div>
        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity" onClick={e => e.stopPropagation()}>
          <button
            onClick={() => onEdit(project)}
            className="p-2 text-gray-400 hover:text-violet-600 hover:bg-violet-50 rounded-lg transition-all"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </button>
          <button
            onClick={() => onDelete(project.id)}
            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
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
