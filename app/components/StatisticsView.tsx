'use client';

import { Task, ProjectWithProgress } from '../types';

interface StatisticsViewProps {
  tasks: Task[];
  projects: ProjectWithProgress[];
}

export default function StatisticsView({ tasks, projects }: StatisticsViewProps) {
  // Calculate statistics
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.status === 'done').length;
  const inProgressTasks = tasks.filter(t => t.status === 'in_progress').length;
  const todoTasks = tasks.filter(t => t.status === 'todo').length;

  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  // Tasks by priority
  const highPriorityTasks = tasks.filter(t => t.priority === 'high').length;
  const mediumPriorityTasks = tasks.filter(t => t.priority === 'medium').length;
  const lowPriorityTasks = tasks.filter(t => t.priority === 'low').length;

  // Overdue tasks
  const today = new Date();
  const overdueTasks = tasks.filter(task => {
    if (!task.dueDate || task.status === 'done') return false;
    return new Date(task.dueDate) < today;
  }).length;

  // Tasks completed this week
  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);
  const tasksCompletedThisWeek = tasks.filter(task => {
    if (task.status !== 'done' || !task.updatedAt) return false;
    return new Date(task.updatedAt) >= weekAgo;
  }).length;

  // Project statistics
  const activeProjects = projects.filter(p => p.status === 'active').length;
  const completedProjects = projects.filter(p => p.status === 'completed').length;
  const averageProgress = projects.length > 0
    ? Math.round(projects.reduce((acc, p) => acc + p.progress, 0) / projects.length)
    : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold" style={{ color: 'var(--foreground)' }}>Statistiques</h1>
        <p className="mt-1" style={{ color: 'var(--foreground-muted)' }}>
          Analysez vos performances et votre productivité
        </p>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-4 gap-5">
        <div className="stat-card stat-card-blue">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium" style={{ color: 'var(--foreground-muted)' }}>Taux de complétion</span>
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: 'rgba(99, 102, 241, 0.2)' }}>
              <svg className="w-5 h-5 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <p className="stat-value">{completionRate}%</p>
          <p className="stat-label mt-2">
            <span className="text-xs" style={{ color: 'var(--foreground-light)' }}>{completedTasks}/{totalTasks} tâches</span>
          </p>
        </div>

        <div className="stat-card stat-card-green">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium" style={{ color: 'var(--foreground-muted)' }}>Complétées cette semaine</span>
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: 'rgba(34, 197, 94, 0.2)' }}>
              <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
          </div>
          <p className="stat-value">{tasksCompletedThisWeek}</p>
          <p className="stat-label mt-2">
            <span className="text-xs" style={{ color: 'var(--foreground-light)' }}>tâches terminées</span>
          </p>
        </div>

        <div className="stat-card stat-card-yellow">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium" style={{ color: 'var(--foreground-muted)' }}>En retard</span>
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: 'rgba(245, 158, 11, 0.2)' }}>
              <svg className="w-5 h-5 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <p className="stat-value">{overdueTasks}</p>
          <p className="stat-label mt-2">
            <span className="text-xs" style={{ color: 'var(--foreground-light)' }}>tâches en retard</span>
          </p>
        </div>

        <div className="stat-card stat-card-purple">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium" style={{ color: 'var(--foreground-muted)' }}>Progression moyenne</span>
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: 'rgba(168, 85, 247, 0.2)' }}>
              <svg className="w-5 h-5 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
          </div>
          <p className="stat-value">{averageProgress}%</p>
          <p className="stat-label mt-2">
            <span className="text-xs" style={{ color: 'var(--foreground-light)' }}>des projets</span>
          </p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Task Distribution */}
        <div className="chart-container">
          <h3 className="font-semibold text-lg mb-6" style={{ color: 'var(--foreground)' }}>
            Distribution des tâches
          </h3>

          {/* Donut Chart */}
          <div className="flex items-center justify-center mb-6">
            <div className="relative w-40 h-40">
              <svg className="w-40 h-40 transform -rotate-90" viewBox="0 0 36 36">
                <circle cx="18" cy="18" r="14" fill="none" stroke="var(--border-light)" strokeWidth="4" />
                <circle
                  cx="18" cy="18" r="14" fill="none"
                  stroke="#22c55e" strokeWidth="4"
                  strokeDasharray={`${totalTasks > 0 ? (completedTasks / totalTasks) * 88 : 0} 88`}
                  strokeLinecap="round"
                />
                <circle
                  cx="18" cy="18" r="14" fill="none"
                  stroke="#f59e0b" strokeWidth="4"
                  strokeDasharray={`${totalTasks > 0 ? (inProgressTasks / totalTasks) * 88 : 0} 88`}
                  strokeDashoffset={`-${totalTasks > 0 ? (completedTasks / totalTasks) * 88 : 0}`}
                  strokeLinecap="round"
                />
                <circle
                  cx="18" cy="18" r="14" fill="none"
                  stroke="#6b7280" strokeWidth="4"
                  strokeDasharray={`${totalTasks > 0 ? (todoTasks / totalTasks) * 88 : 0} 88`}
                  strokeDashoffset={`-${totalTasks > 0 ? ((completedTasks + inProgressTasks) / totalTasks) * 88 : 0}`}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center flex-col">
                <span className="text-2xl font-bold" style={{ color: 'var(--foreground)' }}>{totalTasks}</span>
                <span className="text-xs" style={{ color: 'var(--foreground-muted)' }}>tâches</span>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-green-500" />
                <span className="text-sm" style={{ color: 'var(--foreground-muted)' }}>Terminées</span>
              </div>
              <span className="font-semibold" style={{ color: 'var(--foreground)' }}>{completedTasks}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-amber-500" />
                <span className="text-sm" style={{ color: 'var(--foreground-muted)' }}>En cours</span>
              </div>
              <span className="font-semibold" style={{ color: 'var(--foreground)' }}>{inProgressTasks}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-gray-500" />
                <span className="text-sm" style={{ color: 'var(--foreground-muted)' }}>À faire</span>
              </div>
              <span className="font-semibold" style={{ color: 'var(--foreground)' }}>{todoTasks}</span>
            </div>
          </div>
        </div>

        {/* Priority Distribution */}
        <div className="chart-container">
          <h3 className="font-semibold text-lg mb-6" style={{ color: 'var(--foreground)' }}>
            Par priorité
          </h3>

          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm" style={{ color: 'var(--foreground-muted)' }}>Haute</span>
                <span className="font-semibold" style={{ color: 'var(--foreground)' }}>{highPriorityTasks}</span>
              </div>
              <div className="progress-bar h-3">
                <div
                  className="progress-bar-fill"
                  style={{
                    width: `${totalTasks > 0 ? (highPriorityTasks / totalTasks) * 100 : 0}%`,
                    backgroundColor: '#ef4444',
                  }}
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm" style={{ color: 'var(--foreground-muted)' }}>Moyenne</span>
                <span className="font-semibold" style={{ color: 'var(--foreground)' }}>{mediumPriorityTasks}</span>
              </div>
              <div className="progress-bar h-3">
                <div
                  className="progress-bar-fill"
                  style={{
                    width: `${totalTasks > 0 ? (mediumPriorityTasks / totalTasks) * 100 : 0}%`,
                    backgroundColor: '#f59e0b',
                  }}
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm" style={{ color: 'var(--foreground-muted)' }}>Basse</span>
                <span className="font-semibold" style={{ color: 'var(--foreground)' }}>{lowPriorityTasks}</span>
              </div>
              <div className="progress-bar h-3">
                <div
                  className="progress-bar-fill"
                  style={{
                    width: `${totalTasks > 0 ? (lowPriorityTasks / totalTasks) * 100 : 0}%`,
                    backgroundColor: '#22c55e',
                  }}
                />
              </div>
            </div>
          </div>

          {/* Project stats */}
          <div className="mt-8 pt-6 border-t" style={{ borderColor: 'var(--border)' }}>
            <h4 className="font-medium mb-4" style={{ color: 'var(--foreground)' }}>Projets</h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-3 rounded-xl" style={{ background: 'var(--background-secondary)' }}>
                <p className="text-2xl font-bold" style={{ color: 'var(--primary)' }}>{activeProjects}</p>
                <p className="text-xs" style={{ color: 'var(--foreground-muted)' }}>Actifs</p>
              </div>
              <div className="text-center p-3 rounded-xl" style={{ background: 'var(--background-secondary)' }}>
                <p className="text-2xl font-bold" style={{ color: 'var(--success)' }}>{completedProjects}</p>
                <p className="text-xs" style={{ color: 'var(--foreground-muted)' }}>Terminés</p>
              </div>
            </div>
          </div>
        </div>

        {/* Projects Progress */}
        <div className="chart-container">
          <h3 className="font-semibold text-lg mb-6" style={{ color: 'var(--foreground)' }}>
            Progression des projets
          </h3>

          {projects.length === 0 ? (
            <div className="text-center py-8">
              <p style={{ color: 'var(--foreground-muted)' }}>Aucun projet</p>
            </div>
          ) : (
            <div className="space-y-4">
              {projects.map(project => (
                <div key={project.id}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: project.color }}
                      />
                      <span className="text-sm font-medium truncate" style={{ color: 'var(--foreground)' }}>
                        {project.name}
                      </span>
                    </div>
                    <span className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>
                      {project.progress}%
                    </span>
                  </div>
                  <div className="progress-bar h-2">
                    <div
                      className="progress-bar-fill"
                      style={{
                        width: `${project.progress}%`,
                        backgroundColor: project.color,
                      }}
                    />
                  </div>
                  <div className="flex justify-between mt-1">
                    <span className="text-xs" style={{ color: 'var(--foreground-light)' }}>
                      {project.completedTasks}/{project.totalTasks} tâches
                    </span>
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full ${
                        project.status === 'active' ? 'bg-blue-100 text-blue-700' :
                        project.status === 'completed' ? 'bg-green-100 text-green-700' :
                        'bg-gray-100 text-gray-700'
                      }`}
                    >
                      {project.status === 'active' ? 'Actif' : project.status === 'completed' ? 'Terminé' : 'En pause'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
