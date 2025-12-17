'use client';

import { useState } from 'react';
import { Task, ProjectWithProgress } from '../types';

interface CalendarViewProps {
  tasks: Task[];
  projects: ProjectWithProgress[];
  onTaskClick?: (task: Task) => void;
}

export default function CalendarView({ tasks, projects, onTaskClick }: CalendarViewProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<'month' | 'week'>('month');

  const monthNames = [
    'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
    'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
  ];

  const dayNames = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDay = firstDay.getDay();

    const days: (Date | null)[] = [];

    // Add empty slots for days before the first day of the month
    for (let i = 0; i < startingDay; i++) {
      days.push(null);
    }

    // Add all days of the month
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i));
    }

    return days;
  };

  const getTasksForDate = (date: Date | null) => {
    if (!date) return [];
    const dateStr = date.toISOString().split('T')[0];
    return tasks.filter(task => {
      if (!task.dueDate) return false;
      const taskDate = new Date(task.dueDate).toISOString().split('T')[0];
      return taskDate === dateStr;
    });
  };

  const getProjectColor = (projectId: string) => {
    const project = projects.find(p => p.id === projectId);
    return project?.color || '#6366f1';
  };

  const navigateMonth = (direction: number) => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + direction, 1));
  };

  const isToday = (date: Date | null) => {
    if (!date) return false;
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const days = getDaysInMonth(currentDate);

  // Get upcoming tasks (next 7 days)
  const today = new Date();
  const nextWeek = new Date(today);
  nextWeek.setDate(nextWeek.getDate() + 7);

  const upcomingTasks = tasks
    .filter(task => {
      if (!task.dueDate) return false;
      const dueDate = new Date(task.dueDate);
      return dueDate >= today && dueDate <= nextWeek;
    })
    .sort((a, b) => new Date(a.dueDate!).getTime() - new Date(b.dueDate!).getTime());

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--foreground)' }}>Calendrier</h1>
          <p className="mt-1" style={{ color: 'var(--foreground-muted)' }}>
            Visualisez vos tâches et échéances
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setViewMode('month')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors`}
            style={{
              backgroundColor: viewMode === 'month' ? 'var(--primary)' : 'var(--background-white)',
              color: viewMode === 'month' ? 'white' : 'var(--foreground-muted)',
            }}
          >
            Mois
          </button>
          <button
            onClick={() => setViewMode('week')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors`}
            style={{
              backgroundColor: viewMode === 'week' ? 'var(--primary)' : 'var(--background-white)',
              color: viewMode === 'week' ? 'white' : 'var(--foreground-muted)',
            }}
          >
            Semaine
          </button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Calendar */}
        <div className="col-span-2 card p-6">
          {/* Month navigation */}
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={() => navigateMonth(-1)}
              className="icon-btn"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <h2 className="text-xl font-semibold" style={{ color: 'var(--foreground)' }}>
              {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
            </h2>
            <button
              onClick={() => navigateMonth(1)}
              className="icon-btn"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>

          {/* Day names */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {dayNames.map(day => (
              <div
                key={day}
                className="text-center text-sm font-medium py-2"
                style={{ color: 'var(--foreground-muted)' }}
              >
                {day}
              </div>
            ))}
          </div>

          {/* Calendar grid */}
          <div className="grid grid-cols-7 gap-1">
            {days.map((date, index) => {
              const dayTasks = getTasksForDate(date);
              return (
                <div
                  key={index}
                  className={`min-h-24 p-2 rounded-lg transition-colors ${
                    date ? 'hover:bg-opacity-50 cursor-pointer' : ''
                  } ${isToday(date) ? 'ring-2 ring-indigo-500' : ''}`}
                  style={{
                    backgroundColor: date ? 'var(--background-secondary)' : 'transparent',
                  }}
                >
                  {date && (
                    <>
                      <span
                        className={`text-sm font-medium ${isToday(date) ? 'text-indigo-500' : ''}`}
                        style={{ color: isToday(date) ? undefined : 'var(--foreground)' }}
                      >
                        {date.getDate()}
                      </span>
                      <div className="mt-1 space-y-1">
                        {dayTasks.slice(0, 2).map(task => (
                          <div
                            key={task.id}
                            onClick={() => onTaskClick?.(task)}
                            className="text-xs px-1.5 py-0.5 rounded truncate cursor-pointer hover:opacity-80"
                            style={{
                              backgroundColor: getProjectColor(task.projectId),
                              color: 'white',
                            }}
                            title={task.title}
                          >
                            {task.title}
                          </div>
                        ))}
                        {dayTasks.length > 2 && (
                          <span className="text-xs" style={{ color: 'var(--foreground-muted)' }}>
                            +{dayTasks.length - 2} autres
                          </span>
                        )}
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Sidebar - Upcoming tasks */}
        <div className="card p-6">
          <h3 className="font-semibold text-lg mb-4" style={{ color: 'var(--foreground)' }}>
            Prochaines échéances
          </h3>

          {upcomingTasks.length === 0 ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ background: 'var(--primary-bg)' }}>
                <svg className="w-8 h-8" style={{ color: 'var(--primary)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <p style={{ color: 'var(--foreground-muted)' }}>Aucune échéance proche</p>
            </div>
          ) : (
            <div className="space-y-3">
              {upcomingTasks.map(task => {
                const dueDate = new Date(task.dueDate!);
                const isOverdue = dueDate < today;
                const project = projects.find(p => p.id === task.projectId);

                return (
                  <div
                    key={task.id}
                    onClick={() => onTaskClick?.(task)}
                    className="p-3 rounded-lg cursor-pointer transition-colors hover:opacity-80"
                    style={{ backgroundColor: 'var(--background-secondary)' }}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className="w-3 h-3 rounded-full mt-1.5 flex-shrink-0"
                        style={{ backgroundColor: getProjectColor(task.projectId) }}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate" style={{ color: 'var(--foreground)' }}>
                          {task.title}
                        </p>
                        <p className="text-sm truncate" style={{ color: 'var(--foreground-muted)' }}>
                          {project?.name}
                        </p>
                        <p
                          className={`text-xs mt-1 ${isOverdue ? 'text-red-500' : ''}`}
                          style={{ color: isOverdue ? undefined : 'var(--foreground-light)' }}
                        >
                          {dueDate.toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' })}
                        </p>
                      </div>
                      <span
                        className={`text-xs px-2 py-1 rounded-full ${
                          task.status === 'done' ? 'bg-green-100 text-green-700' :
                          task.status === 'in_progress' ? 'bg-amber-100 text-amber-700' :
                          'bg-gray-100 text-gray-700'
                        }`}
                      >
                        {task.status === 'done' ? 'Fait' : task.status === 'in_progress' ? 'En cours' : 'À faire'}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Legend */}
          <div className="mt-6 pt-4 border-t" style={{ borderColor: 'var(--border)' }}>
            <h4 className="text-sm font-medium mb-3" style={{ color: 'var(--foreground-muted)' }}>
              Projets
            </h4>
            <div className="space-y-2">
              {projects.map(project => (
                <div key={project.id} className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: project.color }}
                  />
                  <span className="text-sm truncate" style={{ color: 'var(--foreground)' }}>
                    {project.name}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
