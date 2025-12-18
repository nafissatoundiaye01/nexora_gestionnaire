'use client';

import { useState } from 'react';
import { Task, ProjectWithProgress, Meeting, User } from '../types';
import MeetingModal from './MeetingModal';
import ConfirmModal from './ConfirmModal';

interface CalendarViewProps {
  tasks: Task[];
  projects: ProjectWithProgress[];
  meetings: Meeting[];
  users: Omit<User, 'password'>[];
  currentUserId: string;
  onTaskClick?: (task: Task) => void;
  onAddMeeting: (meeting: Omit<Meeting, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Meeting>;
  onUpdateMeeting: (id: string, updates: Partial<Meeting>) => Promise<Meeting>;
  onDeleteMeeting: (id: string) => Promise<boolean>;
  onNotifyAttendees?: (meeting: Meeting, attendees: string[]) => Promise<void>;
}

export default function CalendarView({
  tasks,
  projects,
  meetings,
  users,
  currentUserId,
  onTaskClick,
  onAddMeeting,
  onUpdateMeeting,
  onDeleteMeeting,
  onNotifyAttendees,
}: CalendarViewProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<'month' | 'week'>('month');
  const [isMeetingModalOpen, setIsMeetingModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [editingMeeting, setEditingMeeting] = useState<Meeting | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{ isOpen: boolean; meeting: Meeting | null }>({
    isOpen: false,
    meeting: null,
  });

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

  const getMeetingsForDate = (date: Date | null) => {
    if (!date) return [];
    const dateStr = date.toISOString().split('T')[0];
    return meetings.filter(meeting => meeting.date === dateStr);
  };

  const handleDateClick = (date: Date) => {
    setSelectedDate(date.toISOString().split('T')[0]);
    setEditingMeeting(null);
    setIsMeetingModalOpen(true);
  };

  const handleMeetingClick = (meeting: Meeting, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingMeeting(meeting);
    setSelectedDate(meeting.date);
    setIsMeetingModalOpen(true);
  };

  const handleSaveMeeting = async (meetingData: Omit<Meeting, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (editingMeeting) {
      await onUpdateMeeting(editingMeeting.id, meetingData);
    } else {
      const newMeeting = await onAddMeeting(meetingData);
      // Notify attendees (excluding creator)
      if (onNotifyAttendees) {
        const otherAttendees = meetingData.attendees.filter(id => id !== currentUserId);
        if (otherAttendees.length > 0) {
          await onNotifyAttendees(newMeeting, otherAttendees);
        }
      }
    }
    setIsMeetingModalOpen(false);
    setEditingMeeting(null);
    setSelectedDate(null);
  };

  const handleDeleteMeeting = async () => {
    if (deleteConfirm.meeting) {
      await onDeleteMeeting(deleteConfirm.meeting.id);
      setDeleteConfirm({ isOpen: false, meeting: null });
    }
  };

  const getUserName = (userId: string) => {
    const user = users.find(u => u.id === userId);
    return user?.name || 'Inconnu';
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

  // Get upcoming meetings (next 7 days)
  const todayStr = today.toISOString().split('T')[0];
  const nextWeekStr = nextWeek.toISOString().split('T')[0];
  const upcomingMeetings = meetings
    .filter(meeting => meeting.date >= todayStr && meeting.date <= nextWeekStr)
    .sort((a, b) => {
      const dateCompare = a.date.localeCompare(b.date);
      if (dateCompare !== 0) return dateCompare;
      return a.startTime.localeCompare(b.startTime);
    });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--foreground)' }}>Calendrier</h1>
          <p className="mt-1" style={{ color: 'var(--foreground-muted)' }}>
            Visualisez vos tâches, échéances et réunions
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              setSelectedDate(new Date().toISOString().split('T')[0]);
              setEditingMeeting(null);
              setIsMeetingModalOpen(true);
            }}
            className="btn btn-primary flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Nouvelle réunion
          </button>
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
              const dayMeetings = getMeetingsForDate(date);
              const totalItems = dayTasks.length + dayMeetings.length;
              return (
                <div
                  key={index}
                  onClick={() => date && handleDateClick(date)}
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
                        {/* Meetings */}
                        {dayMeetings.slice(0, 1).map(meeting => (
                          <div
                            key={meeting.id}
                            onClick={(e) => handleMeetingClick(meeting, e)}
                            className="text-xs px-1.5 py-0.5 rounded truncate cursor-pointer hover:opacity-80 flex items-center gap-1"
                            style={{
                              backgroundColor: '#8b5cf6',
                              color: 'white',
                            }}
                            title={`${meeting.startTime} - ${meeting.title}`}
                          >
                            <svg className="w-3 h-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            <span className="truncate">{meeting.title}</span>
                          </div>
                        ))}
                        {/* Tasks */}
                        {dayTasks.slice(0, dayMeetings.length > 0 ? 1 : 2).map(task => (
                          <div
                            key={task.id}
                            onClick={(e) => {
                              e.stopPropagation();
                              onTaskClick?.(task);
                            }}
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
                        {totalItems > 2 && (
                          <span className="text-xs" style={{ color: 'var(--foreground-muted)' }}>
                            +{totalItems - 2} autres
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

        {/* Sidebar */}
        <div className="card p-6 space-y-6">
          {/* Upcoming Meetings */}
          <div>
            <h3 className="font-semibold text-lg mb-4" style={{ color: 'var(--foreground)' }}>
              Prochaines réunions
            </h3>
            {upcomingMeetings.length === 0 ? (
              <div className="text-center py-4">
                <p className="text-sm" style={{ color: 'var(--foreground-muted)' }}>Aucune réunion prévue</p>
              </div>
            ) : (
              <div className="space-y-3">
                {upcomingMeetings.slice(0, 3).map(meeting => (
                  <div
                    key={meeting.id}
                    className="p-3 rounded-lg cursor-pointer transition-colors hover:opacity-80"
                    style={{ backgroundColor: 'var(--background-secondary)' }}
                    onClick={() => {
                      setEditingMeeting(meeting);
                      setSelectedDate(meeting.date);
                      setIsMeetingModalOpen(true);
                    }}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className="w-3 h-3 rounded-full mt-1.5 flex-shrink-0"
                        style={{ backgroundColor: '#8b5cf6' }}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate" style={{ color: 'var(--foreground)' }}>
                          {meeting.title}
                        </p>
                        <p className="text-sm" style={{ color: 'var(--foreground-muted)' }}>
                          {meeting.startTime} - {meeting.endTime}
                        </p>
                        <p className="text-xs mt-1" style={{ color: 'var(--foreground-light)' }}>
                          {new Date(meeting.date).toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' })}
                        </p>
                        <p className="text-xs mt-1" style={{ color: 'var(--foreground-muted)' }}>
                          {meeting.attendees.length} participant{meeting.attendees.length > 1 ? 's' : ''}
                        </p>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setDeleteConfirm({ isOpen: true, meeting });
                        }}
                        className="p-1 rounded hover:bg-red-100 transition-colors"
                        title="Supprimer"
                      >
                        <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Upcoming Tasks */}
          <div className="pt-4 border-t" style={{ borderColor: 'var(--border)' }}>
            <h3 className="font-semibold text-lg mb-4" style={{ color: 'var(--foreground)' }}>
              Prochaines échéances
            </h3>

            {upcomingTasks.length === 0 ? (
              <div className="text-center py-4">
                <p className="text-sm" style={{ color: 'var(--foreground-muted)' }}>Aucune échéance proche</p>
              </div>
            ) : (
              <div className="space-y-3">
                {upcomingTasks.slice(0, 3).map(task => {
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
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Legend */}
          <div className="pt-4 border-t" style={{ borderColor: 'var(--border)' }}>
            <h4 className="text-sm font-medium mb-3" style={{ color: 'var(--foreground-muted)' }}>
              Legende
            </h4>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#8b5cf6' }} />
                <span className="text-sm" style={{ color: 'var(--foreground)' }}>Réunion</span>
              </div>
              {projects.slice(0, 4).map(project => (
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

      {/* Meeting Modal */}
      <MeetingModal
        isOpen={isMeetingModalOpen}
        onClose={() => {
          setIsMeetingModalOpen(false);
          setEditingMeeting(null);
          setSelectedDate(null);
        }}
        onSave={handleSaveMeeting}
        meeting={editingMeeting}
        users={users}
        currentUserId={currentUserId}
        selectedDate={selectedDate || undefined}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={deleteConfirm.isOpen}
        title="Supprimer la réunion"
        message={`Êtes-vous sûr de vouloir supprimer la réunion "${deleteConfirm.meeting?.title}" ? Cette action est irréversible.`}
        confirmLabel="Supprimer"
        onConfirm={handleDeleteMeeting}
        onCancel={() => setDeleteConfirm({ isOpen: false, meeting: null })}
      />
    </div>
  );
}
