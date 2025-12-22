'use client';

import { useState, useEffect } from 'react';
import { useProjects } from './hooks/useProjects';
import { useTheme } from './hooks/useTheme';
import { useCorrections } from './hooks/useCorrections';
import { useNotifications } from './hooks/useNotifications';
import { useAuth } from './hooks/useAuth';
import { useMeetings } from './hooks/useMeetings';
import { Project, Task, ProjectWithProgress, TaskStatus, User } from './types';
import Sidebar, { ViewType } from './components/Sidebar';
import ProjectCard from './components/ProjectCard';
import TaskCard from './components/TaskCard';
import ProjectModal from './components/ProjectModal';
import TaskModal from './components/TaskModal';
import CorrectionsList from './components/CorrectionsList';
import CalendarView from './components/CalendarView';
import SettingsModal from './components/SettingsModal';
import NotificationsDropdown from './components/NotificationsDropdown';
import LoginPage from './components/LoginPage';
import ChangePasswordModal from './components/ChangePasswordModal';
import ConfirmModal from './components/ConfirmModal';
import ProjectReportModal from './components/ProjectReportModal';

export default function Home() {
  // Authentication
  const {
    user,
    isAuthenticated,
    isLoading: authLoading,
    mustChangePassword,
    login,
    logout,
    changePassword,
  } = useAuth();

  const {
    tasks,
    isLoaded,
    addProject,
    updateProject,
    deleteProject,
    addTask,
    updateTask,
    deleteTask,
    getProjectsWithProgress,
    refresh,
  } = useProjects();

  const { isDark, toggleTheme, isLoaded: themeLoaded } = useTheme();
  const {
    teamMembers,
    isLoaded: correctionsLoaded,
    addCorrection,
    updateCorrection,
    deleteCorrection,
    getProjectCorrections,
    refresh: refreshCorrections,
  } = useCorrections();

  // Current user ID - from authenticated user
  const currentUserId = user?.id;

  const {
    meetings,
    isLoaded: meetingsLoaded,
    addMeeting,
    updateMeeting,
    deleteMeeting,
    refresh: refreshMeetings,
  } = useMeetings();

  const {
    notifications,
    unreadCount,
    isLoaded: notificationsLoaded,
    notifyAllUsers,
    addNotification,
    markAsRead,
    markAllAsRead,
    deleteNotification: removeNotification,
    refresh: refreshNotifications,
  } = useNotifications(currentUserId);

  const [currentView, setCurrentView] = useState<ViewType>('dashboard');
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [projectTab, setProjectTab] = useState<'tasks' | 'corrections'>('tasks');
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [deleteProjectConfirm, setDeleteProjectConfirm] = useState<{ isOpen: boolean; project: Project | null }>({
    isOpen: false,
    project: null,
  });
  const [editingProject, setEditingProject] = useState<ProjectWithProgress | null>(null);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'completed' | 'on_hold'>('all');
  const [allUsers, setAllUsers] = useState<Omit<User, 'password'>[]>([]);
  const [taskMemberFilter, setTaskMemberFilter] = useState<'all' | 'unassigned' | string>('all');
  const [taskPrioritySort, setTaskPrioritySort] = useState<'none' | 'asc' | 'desc'>('none');
  const [reportProject, setReportProject] = useState<ProjectWithProgress | null>(null);

  // Load all users for task assignment
  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/users');
      if (response.ok) {
        const users = await response.json();
        setAllUsers(users);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchUsers();
    }
  }, [isAuthenticated]);

  // Auto-refresh data every 30 seconds
  useEffect(() => {
    if (!isAuthenticated) return;

    const interval = setInterval(() => {
      refresh();
      refreshCorrections();
      refreshMeetings();
      refreshNotifications();
      fetchUsers();
    }, 30000);

    return () => clearInterval(interval);
  }, [isAuthenticated, refresh, refreshCorrections, refreshMeetings, refreshNotifications]);

  const projectsWithProgress = getProjectsWithProgress();
  const selectedProject = projectsWithProgress.find(p => p.id === selectedProjectId);

  // Priority order for sorting
  const priorityOrder = { low: 1, medium: 2, high: 3 };

  // Filter and sort tasks
  const displayedProjectTasks = selectedProject
    ? selectedProject.tasks
        .filter(t => {
          if (taskMemberFilter === 'all') return true;
          if (taskMemberFilter === 'unassigned') return !t.assignedTo;
          return t.assignedTo === taskMemberFilter;
        })
        .sort((a, b) => {
          if (taskPrioritySort === 'none') return 0;
          const diff = priorityOrder[a.priority] - priorityOrder[b.priority];
          return taskPrioritySort === 'asc' ? diff : -diff;
        })
    : [];

  // Filter projects based on search query and status filter
  const filteredProjects = projectsWithProgress.filter(project => {
    const matchesSearch = project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || project.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const filteredTasks = tasks.filter(task =>
    task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    task.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Get current date
  const today = new Date();
  const dateOptions: Intl.DateTimeFormatOptions = { weekday: 'long', day: 'numeric', month: 'long' };
  const formattedDate = today.toLocaleDateString('fr-FR', dateOptions);

  // Calculate weekly progress data for the chart
  const getWeeklyProgressData = () => {
    const now = new Date();
    const dayOfWeek = now.getDay(); // 0 = Sunday, 1 = Monday, etc.
    const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;

    const weekData = [];
    const daysOfWeek = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];

    for (let i = 0; i < 7; i++) {
      const date = new Date(now);
      date.setDate(now.getDate() + mondayOffset + i);
      date.setHours(0, 0, 0, 0);

      const nextDate = new Date(date);
      nextDate.setDate(date.getDate() + 1);

      // Count tasks completed on this day
      const tasksCompletedOnDay = tasks.filter(task => {
        if (task.status !== 'done' || !task.updatedAt) return false;
        const taskDate = new Date(task.updatedAt);
        return taskDate >= date && taskDate < nextDate;
      }).length;

      weekData.push({
        day: daysOfWeek[i],
        completed: tasksCompletedOnDay,
        isToday: date.toDateString() === now.toDateString(),
      });
    }

    return weekData;
  };

  const weeklyProgressData = getWeeklyProgressData();
  const maxCompleted = Math.max(...weeklyProgressData.map(d => d.completed), 1);

  const handleAddProject = () => {
    setEditingProject(null);
    setIsProjectModalOpen(true);
  };

  const handleEditProject = (project: ProjectWithProgress) => {
    setEditingProject(project);
    setIsProjectModalOpen(true);
  };

  const handleReportProject = (project: ProjectWithProgress) => {
    setReportProject(project);
  };

  const handleSaveProject = async (projectData: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (editingProject) {
      updateProject(editingProject.id, projectData);
    } else {
      const newProject = await addProject(projectData);
      // Send notification to all team members
      if (currentUserId && newProject) {
        await notifyAllUsers(
          'project_created',
          'Nouveau projet créé',
          `Le projet "${projectData.name}" a été créé`,
          currentUserId,
          teamMembers.map(m => m.id),
          { projectId: newProject.id }
        );
      }
    }
  };

  const handleDeleteProject = (id: string) => {
    const project = projectsWithProgress.find(p => p.id === id);
    if (project) {
      setDeleteProjectConfirm({ isOpen: true, project });
    }
  };

  const confirmDeleteProject = () => {
    if (deleteProjectConfirm.project) {
      deleteProject(deleteProjectConfirm.project.id);
      if (selectedProjectId === deleteProjectConfirm.project.id) {
        setSelectedProjectId(null);
      }
    }
    setDeleteProjectConfirm({ isOpen: false, project: null });
  };

  const handleAddTask = () => {
    setEditingTask(null);
    setIsTaskModalOpen(true);
  };

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setIsTaskModalOpen(true);
  };

  const handleSaveTask = async (taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (editingTask) {
      await updateTask(editingTask.id, taskData);
      // Notify if task is assigned to someone new
      if (currentUserId && selectedProject && taskData.assignedTo && taskData.assignedTo !== currentUserId && taskData.assignedTo !== editingTask.assignedTo) {
        await addNotification(
          'task_assigned',
          'Tâche assignée',
          `La tâche "${taskData.title}" vous a été assignée sur le projet "${selectedProject.name}"`,
          taskData.assignedTo,
          { projectId: taskData.projectId, taskId: editingTask.id }
        );
      }
    } else {
      const newTask = await addTask(taskData);
      if (currentUserId && newTask && selectedProject) {
        // Notify assigned user
        if (taskData.assignedTo && taskData.assignedTo !== currentUserId) {
          await addNotification(
            'task_assigned',
            'Tâche assignée',
            `La tâche "${taskData.title}" vous a été assignée sur le projet "${selectedProject.name}"`,
            taskData.assignedTo,
            { projectId: taskData.projectId, taskId: newTask.id }
          );
        }
      }
    }
  };

  const handleDeleteTask = (id: string) => {
    if (confirm('Supprimer cette tâche ?')) {
      deleteTask(id);
    }
  };

  const handleTaskStatusChange = (id: string, status: TaskStatus) => {
    updateTask(id, { status });
  };

  const handleViewChange = (view: ViewType) => {
    setCurrentView(view);
    setSelectedProjectId(null);
  };

  const handleSync = async () => {
    setIsSyncing(true);
    try {
      await Promise.all([
        refresh(),
        refreshCorrections(),
        refreshMeetings(),
        refreshNotifications(),
        fetchUsers(),
      ]);
    } catch (error) {
      console.error('Erreur lors de la synchronisation:', error);
    } finally {
      setTimeout(() => setIsSyncing(false), 500);
    }
  };

  // Show loading while checking auth
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--background)' }}>
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          <p style={{ color: 'var(--foreground-muted)' }}>Verification...</p>
        </div>
      </div>
    );
  }

  // Show login page if not authenticated
  if (!isAuthenticated) {
    return <LoginPage onLogin={login} />;
  }

  // Show change password modal if required
  if (mustChangePassword) {
    return (
      <ChangePasswordModal
        onChangePassword={changePassword}
        userEmail={user?.email || ''}
      />
    );
  }

  // Show loading for data
  if (!isLoaded || !themeLoaded || !correctionsLoaded || !notificationsLoaded || !meetingsLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--background)' }}>
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          <p style={{ color: 'var(--foreground-muted)' }}>Chargement...</p>
        </div>
      </div>
    );
  }

  // Determine which view to show in sidebar
  const getSidebarView = (): ViewType => {
    if (selectedProject) return 'projects';
    return currentView;
  };

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: 'var(--background)' }}>
      {/* Sidebar */}
      <Sidebar
        currentView={getSidebarView()}
        onViewChange={handleViewChange}
        projectCount={projectsWithProgress.length}
        taskCount={tasks.length}
        completedTaskCount={tasks.filter(t => t.status === 'done').length}
        isDark={isDark}
        onToggleTheme={toggleTheme}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onSync={handleSync}
        isSyncing={isSyncing}
      />

      {/* Main content */}
      <main className="flex-1 overflow-y-auto h-screen">
        {/* Header */}
        <header className="sticky top-0 z-10 px-8 py-4 flex items-center justify-between" style={{ background: 'var(--background)' }}>
          {/* Search */}
          <div className="relative">
            <svg className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2" style={{ color: 'var(--foreground-light)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Rechercher projets, tâches..."
              className="search-input"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ background: 'var(--background-white)', color: 'var(--foreground)' }}
            />
          </div>

          {/* Date & Actions */}
          <div className="flex items-center gap-4">
            <span className="date-badge capitalize">{formattedDate}</span>

            <button className="icon-btn" onClick={() => setIsSettingsOpen(true)}>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </button>

            <NotificationsDropdown
              notifications={notifications}
              unreadCount={unreadCount}
              onMarkAsRead={markAsRead}
              onMarkAllAsRead={markAllAsRead}
              onDelete={removeNotification}
              onViewChange={handleViewChange}
              onSelectProject={setSelectedProjectId}
            />

            {/* User Menu */}
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-2 p-1 rounded-xl hover:bg-gray-100 transition-colors"
                style={{ backgroundColor: showUserMenu ? 'var(--background-secondary)' : 'transparent' }}
              >
                <div className="user-avatar">
                  {user?.name?.charAt(0).toUpperCase() || 'U'}
                </div>
                <svg
                  className={`w-4 h-4 transition-transform ${showUserMenu ? 'rotate-180' : ''}`}
                  style={{ color: 'var(--foreground-muted)' }}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {showUserMenu && (
                <div
                  className="absolute right-0 mt-2 w-64 rounded-xl shadow-xl overflow-hidden z-50"
                  style={{ backgroundColor: 'var(--background-white)', border: '1px solid var(--border)' }}
                >
                  <div className="p-4 border-b" style={{ borderColor: 'var(--border)' }}>
                    <p className="font-semibold" style={{ color: 'var(--foreground)' }}>{user?.name}</p>
                    <p className="text-sm" style={{ color: 'var(--foreground-muted)' }}>{user?.email}</p>
                  </div>
                  <div className="p-2">
                    <button
                      onClick={() => {
                        setShowUserMenu(false);
                        setIsSettingsOpen(true);
                      }}
                      className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors hover:bg-gray-100"
                      style={{ color: 'var(--foreground)' }}
                    >
                      <svg className="w-5 h-5" style={{ color: 'var(--foreground-muted)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      Paramètres
                    </button>
                    <button
                      onClick={() => {
                        setShowUserMenu(false);
                        logout();
                      }}
                      className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors hover:bg-red-50"
                      style={{ color: 'var(--danger)' }}
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                      Déconnexion
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        <div className="px-8 pb-8">
          {/* Calendar View */}
          {currentView === 'calendar' && !selectedProject && (
            <CalendarView
              tasks={tasks}
              projects={projectsWithProgress}
              meetings={meetings}
              users={allUsers}
              currentUserId={currentUserId || ''}
              onAddMeeting={addMeeting}
              onUpdateMeeting={updateMeeting}
              onDeleteMeeting={deleteMeeting}
              onNotifyAttendees={async (meeting, attendeeIds) => {
                for (const attendeeId of attendeeIds) {
                  await addNotification(
                    'meeting_scheduled',
                    'Nouvelle réunion',
                    `Vous êtes invité à la réunion "${meeting.title}" le ${new Date(meeting.date).toLocaleDateString('fr-FR')} de ${meeting.startTime} a ${meeting.endTime}`,
                    attendeeId,
                    { meetingId: meeting.id }
                  );
                }
              }}
            />
          )}

          {currentView === 'dashboard' && !selectedProject && searchQuery ? (
            /* Vue Résultats de recherche */
            <>
              <div className="mb-8">
                <h1 className="text-2xl font-bold" style={{ color: 'var(--foreground)' }}>
                  Résultats pour &quot;{searchQuery}&quot;
                </h1>
                <p className="mt-1" style={{ color: 'var(--foreground-muted)' }}>
                  {filteredProjects.length} projet(s) et {filteredTasks.length} tâche(s) trouvé(s)
                </p>
              </div>

              {/* Projets trouvés */}
              {filteredProjects.length > 0 && (
                <div className="mb-8">
                  <h2 className="text-lg font-semibold mb-4" style={{ color: 'var(--foreground)' }}>
                    Projets ({filteredProjects.length})
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredProjects.map(project => (
                      <ProjectCard
                        key={project.id}
                        project={project}
                        onSelect={setSelectedProjectId}
                        onEdit={handleEditProject}
                        onDelete={handleDeleteProject}
                        onReport={handleReportProject}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Tâches trouvées */}
              {filteredTasks.length > 0 && (
                <div className="mb-8">
                  <h2 className="text-lg font-semibold mb-4" style={{ color: 'var(--foreground)' }}>
                    Tâches ({filteredTasks.length})
                  </h2>
                  <div className="space-y-2">
                    {filteredTasks.map(task => {
                      const project = projectsWithProgress.find(p => p.id === task.projectId);
                      return (
                        <div
                          key={task.id}
                          className="card p-4 cursor-pointer hover:shadow-md transition-shadow"
                          onClick={() => {
                            setSelectedProjectId(task.projectId);
                            setSearchQuery('');
                          }}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div
                                className="w-3 h-3 rounded-full"
                                style={{
                                  backgroundColor: task.status === 'done' ? 'var(--success)' :
                                    task.status === 'in_progress' ? 'var(--warning)' : 'var(--foreground-light)'
                                }}
                              />
                              <div>
                                <p className="font-medium" style={{ color: 'var(--foreground)' }}>{task.title}</p>
                                {project && (
                                  <p className="text-sm" style={{ color: 'var(--foreground-muted)' }}>
                                    Projet: {project.name}
                                  </p>
                                )}
                              </div>
                            </div>
                            <span
                              className="px-2 py-1 rounded-full text-xs font-medium"
                              style={{
                                backgroundColor: task.priority === 'high' ? 'var(--danger-bg)' :
                                  task.priority === 'medium' ? 'var(--warning-bg)' : 'var(--success-bg)',
                                color: task.priority === 'high' ? 'var(--danger)' :
                                  task.priority === 'medium' ? 'var(--warning)' : 'var(--success)'
                              }}
                            >
                              {task.priority === 'high' ? 'Haute' : task.priority === 'medium' ? 'Moyenne' : 'Basse'}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Aucun résultat */}
              {filteredProjects.length === 0 && filteredTasks.length === 0 && (
                <div className="card p-16 text-center">
                  <div className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6" style={{ background: 'var(--background-secondary)' }}>
                    <svg className="w-10 h-10" style={{ color: 'var(--foreground-muted)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold mb-2" style={{ color: 'var(--foreground)' }}>Aucun résultat</h3>
                  <p className="mb-6 max-w-sm mx-auto" style={{ color: 'var(--foreground-muted)' }}>
                    Aucun projet ou tâche ne correspond à votre recherche
                  </p>
                  <button onClick={() => setSearchQuery('')} className="btn btn-secondary">
                    Effacer la recherche
                  </button>
                </div>
              )}
            </>
          ) : currentView === 'dashboard' && !selectedProject ? (
            /* Vue Dashboard */
            <>
              {/* Greeting */}
              <div className="mb-8">
                <h1 className="greeting">Bonjour, {user?.name || 'Utilisateur'}! <span className="text-3xl">👋</span></h1>
                <p className="greeting-sub">Voici l&apos;état de vos projets ce mois-ci.</p>
              </div>

              {/* Stats Row */}
              <div className="grid grid-cols-4 gap-5 mb-8">
                <div className="stat-card stat-card-blue">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-medium" style={{ color: 'var(--foreground-muted)' }}>Projets actifs</span>
                    <button className="icon-btn w-8 h-8">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 17L17 7M17 7H7M17 7V17" />
                      </svg>
                    </button>
                  </div>
                  <p className="stat-value">{projectsWithProgress.filter(p => p.status === 'active').length}</p>
                  <p className="stat-label mt-2">
                    <span className="stat-change stat-change-up">
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                      </svg>
                      +2.5%
                    </span>
                    <span className="ml-2 text-xs" style={{ color: 'var(--foreground-light)' }}>ce mois</span>
                  </p>
                </div>

                <div className="stat-card stat-card-purple">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-medium" style={{ color: 'var(--foreground-muted)' }}>Tâches totales</span>
                    <button className="icon-btn w-8 h-8">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 17L17 7M17 7H7M17 7V17" />
                      </svg>
                    </button>
                  </div>
                  <p className="stat-value">{tasks.length}</p>
                  <p className="stat-label mt-2">
                    <span className="stat-change stat-change-up">
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                      </svg>
                      +8.2%
                    </span>
                    <span className="ml-2 text-xs" style={{ color: 'var(--foreground-light)' }}>ce mois</span>
                  </p>
                </div>

                <div className="stat-card stat-card-green">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-medium" style={{ color: 'var(--foreground-muted)' }}>Terminées</span>
                    <button className="icon-btn w-8 h-8">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 17L17 7M17 7H7M17 7V17" />
                      </svg>
                    </button>
                  </div>
                  <p className="stat-value">{tasks.filter(t => t.status === 'done').length}</p>
                  <p className="stat-label mt-2">
                    <span className="stat-change stat-change-up">
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                      </svg>
                      +12.3%
                    </span>
                    <span className="ml-2 text-xs" style={{ color: 'var(--foreground-light)' }}>ce mois</span>
                  </p>
                </div>

                <div className="stat-card stat-card-yellow">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-medium" style={{ color: 'var(--foreground-muted)' }}>En cours</span>
                    <button className="icon-btn w-8 h-8">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 17L17 7M17 7H7M17 7V17" />
                      </svg>
                    </button>
                  </div>
                  <p className="stat-value">{tasks.filter(t => t.status === 'in_progress').length}</p>
                  <p className="stat-label mt-2">
                    <span className="stat-change stat-change-down">
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                      </svg>
                      -3.1%
                    </span>
                    <span className="ml-2 text-xs" style={{ color: 'var(--foreground-light)' }}>ce mois</span>
                  </p>
                </div>
              </div>

              {/* Charts Row */}
              <div className="grid grid-cols-3 gap-6 mb-8">
                {/* Bar Chart - Progression */}
                <div className="col-span-2 chart-container">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h3 className="font-semibold text-lg" style={{ color: 'var(--foreground)' }}>Progression</h3>
                      <p className="text-sm" style={{ color: 'var(--foreground-muted)' }}>Tâches complétées cette semaine</p>
                    </div>
                    <button className="icon-btn">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 17L17 7M17 7H7M17 7V17" />
                      </svg>
                    </button>
                  </div>

                  {/* Simple Bar Chart */}
                  <div className="flex items-end gap-3 px-4" style={{ height: '180px' }}>
                    {weeklyProgressData.map((data, i) => {
                      const heightPercent = maxCompleted > 0 ? (data.completed / maxCompleted) * 100 : 0;
                      const barHeight = data.completed > 0 ? Math.max(heightPercent, 15) : 8;
                      return (
                        <div key={i} className="flex-1 flex flex-col items-center justify-end h-full">
                          <span className="text-xs font-medium mb-1" style={{ color: 'var(--foreground)' }}>
                            {data.completed}
                          </span>
                          <div
                            className="w-full rounded-t-lg transition-all duration-500"
                            style={{
                              height: `${barHeight}%`,
                              minHeight: '12px',
                              background: data.isToday
                                ? 'linear-gradient(180deg, #fbbf24 0%, #f59e0b 100%)'
                                : data.completed > 0
                                  ? 'linear-gradient(180deg, #818cf8 0%, #6366f1 100%)'
                                  : 'var(--border-light)',
                            }}
                          />
                        </div>
                      );
                    })}
                  </div>
                  {/* Days labels */}
                  <div className="flex gap-3 px-4 mt-2">
                    {weeklyProgressData.map((data, i) => (
                      <div key={i} className="flex-1 text-center">
                        <span
                          className="text-xs"
                          style={{
                            color: data.isToday ? 'var(--warning)' : 'var(--foreground-light)',
                            fontWeight: data.isToday ? '600' : '400',
                          }}
                        >
                          {data.day}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Pie Chart - Categories */}
                <div className="chart-container">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h3 className="font-semibold text-lg" style={{ color: 'var(--foreground)' }}>Par statut</h3>
                      <p className="text-sm" style={{ color: 'var(--foreground-muted)' }}>Répartition des tâches</p>
                    </div>
                    <button className="icon-btn">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 17L17 7M17 7H7M17 7V17" />
                      </svg>
                    </button>
                  </div>

                  {/* Donut Chart */}
                  <div className="flex items-center justify-center mb-4">
                    <div className="relative w-36 h-36">
                      <svg className="w-36 h-36 transform -rotate-90" viewBox="0 0 36 36">
                        <circle cx="18" cy="18" r="14" fill="none" stroke="var(--border-light)" strokeWidth="4" />
                        <circle
                          cx="18" cy="18" r="14" fill="none"
                          stroke="#6366f1" strokeWidth="4"
                          strokeDasharray={`${tasks.length > 0 ? (tasks.filter(t => t.status === 'done').length / tasks.length) * 88 : 0} 88`}
                          strokeLinecap="round"
                        />
                        <circle
                          cx="18" cy="18" r="14" fill="none"
                          stroke="#f59e0b" strokeWidth="4"
                          strokeDasharray={`${tasks.length > 0 ? (tasks.filter(t => t.status === 'in_progress').length / tasks.length) * 88 : 0} 88`}
                          strokeDashoffset={`-${tasks.length > 0 ? (tasks.filter(t => t.status === 'done').length / tasks.length) * 88 : 0}`}
                          strokeLinecap="round"
                        />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-2xl font-bold" style={{ color: 'var(--foreground)' }}>
                          {tasks.length > 0 ? Math.round((tasks.filter(t => t.status === 'done').length / tasks.length) * 100) : 0}%
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full" style={{ background: '#6366f1' }} />
                      <span className="text-sm" style={{ color: 'var(--foreground-muted)' }}>Terminées</span>
                      <span className="ml-auto font-semibold" style={{ color: 'var(--foreground)' }}>{tasks.filter(t => t.status === 'done').length}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full" style={{ background: '#f59e0b' }} />
                      <span className="text-sm" style={{ color: 'var(--foreground-muted)' }}>En cours</span>
                      <span className="ml-auto font-semibold" style={{ color: 'var(--foreground)' }}>{tasks.filter(t => t.status === 'in_progress').length}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full" style={{ background: 'var(--border)' }} />
                      <span className="text-sm" style={{ color: 'var(--foreground-muted)' }}>À faire</span>
                      <span className="ml-auto font-semibold" style={{ color: 'var(--foreground)' }}>{tasks.filter(t => t.status === 'todo').length}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Info Cards Row */}
              <div className="grid grid-cols-3 gap-6">
                {/* Projects Card */}
                <div className="info-card">
                  <div className="flex items-start justify-between">
                    <div className="info-card-icon bg-indigo-100">
                      <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <button className="icon-btn w-8 h-8" onClick={() => handleViewChange('projects')}>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </div>
                  <div>
                    <p className="text-3xl font-bold" style={{ color: 'var(--foreground)' }}>{projectsWithProgress.length}</p>
                    <p className="text-sm" style={{ color: 'var(--foreground-muted)' }}>projets</p>
                  </div>
                  <p className="text-sm" style={{ color: 'var(--foreground-light)' }}>
                    {projectsWithProgress.filter(p => p.status === 'active').length} projets actifs
                  </p>
                </div>

                {/* Tasks Card */}
                <div className="info-card">
                  <div className="flex items-start justify-between">
                    <div className="info-card-icon bg-amber-100">
                      <svg className="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <button className="icon-btn w-8 h-8" onClick={() => handleViewChange('calendar')}>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </div>
                  <div>
                    <p className="text-3xl font-bold" style={{ color: 'var(--foreground)' }}>{tasks.filter(t => t.status === 'in_progress').length}</p>
                    <p className="text-sm" style={{ color: 'var(--foreground-muted)' }}>en cours</p>
                  </div>
                  <p className="text-sm" style={{ color: 'var(--foreground-light)' }}>
                    {tasks.filter(t => t.status === 'todo').length} en attente
                  </p>
                </div>

                {/* Completion Card */}
                <div className="info-card">
                  <div className="flex items-start justify-between">
                    <div className="info-card-icon bg-emerald-100">
                      <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <button className="icon-btn w-8 h-8" onClick={() => handleViewChange('projects')}>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </div>
                  <div>
                    <p className="text-3xl font-bold" style={{ color: 'var(--foreground)' }}>
                      {tasks.length > 0 ? Math.round((tasks.filter(t => t.status === 'done').length / tasks.length) * 100) : 0}%
                    </p>
                    <p className="text-sm" style={{ color: 'var(--foreground-muted)' }}>complété</p>
                  </div>
                  <p className="text-sm" style={{ color: 'var(--foreground-light)' }}>
                    {tasks.filter(t => t.status === 'done').length}/{tasks.length} tâches terminées
                  </p>
                </div>
              </div>
            </>
          ) : currentView === 'projects' && !selectedProject ? (
            /* Vue des projets */
            <>
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h1 className="text-2xl font-bold" style={{ color: 'var(--foreground)' }}>Projets</h1>
                  <p className="mt-1" style={{ color: 'var(--foreground-muted)' }}>
                    Gérez vos projets et suivez leur progression
                  </p>
                </div>
                <button onClick={handleAddProject} className="btn btn-primary">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Nouveau projet
                </button>
              </div>

              {/* Filters */}
              <div className="flex items-center gap-3 mb-6">
                <span className="text-sm font-medium" style={{ color: 'var(--foreground-muted)' }}>Filtrer par:</span>
                <div className="flex gap-2">
                  <button
                    onClick={() => setStatusFilter('all')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors`}
                    style={{
                      backgroundColor: statusFilter === 'all' ? 'var(--primary)' : 'var(--background-white)',
                      color: statusFilter === 'all' ? 'white' : 'var(--foreground-muted)',
                      border: statusFilter === 'all' ? 'none' : '1px solid var(--border)'
                    }}
                  >
                    Tous ({projectsWithProgress.length})
                  </button>
                  <button
                    onClick={() => setStatusFilter('active')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors`}
                    style={{
                      backgroundColor: statusFilter === 'active' ? 'var(--success)' : 'var(--background-white)',
                      color: statusFilter === 'active' ? 'white' : 'var(--foreground-muted)',
                      border: statusFilter === 'active' ? 'none' : '1px solid var(--border)'
                    }}
                  >
                    Actifs ({projectsWithProgress.filter(p => p.status === 'active').length})
                  </button>
                  <button
                    onClick={() => setStatusFilter('completed')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors`}
                    style={{
                      backgroundColor: statusFilter === 'completed' ? 'var(--primary)' : 'var(--background-white)',
                      color: statusFilter === 'completed' ? 'white' : 'var(--foreground-muted)',
                      border: statusFilter === 'completed' ? 'none' : '1px solid var(--border)'
                    }}
                  >
                    Terminés ({projectsWithProgress.filter(p => p.status === 'completed').length})
                  </button>
                  <button
                    onClick={() => setStatusFilter('on_hold')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors`}
                    style={{
                      backgroundColor: statusFilter === 'on_hold' ? 'var(--warning)' : 'var(--background-white)',
                      color: statusFilter === 'on_hold' ? 'white' : 'var(--foreground-muted)',
                      border: statusFilter === 'on_hold' ? 'none' : '1px solid var(--border)'
                    }}
                  >
                    En pause ({projectsWithProgress.filter(p => p.status === 'on_hold').length})
                  </button>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-4 gap-4 mb-8">
                <div className="stat-card stat-card-blue">
                  <p className="text-sm font-medium mb-2" style={{ color: 'var(--foreground-muted)' }}>Total projets</p>
                  <p className="stat-value">{projectsWithProgress.length}</p>
                </div>
                <div className="stat-card stat-card-purple">
                  <p className="text-sm font-medium mb-2" style={{ color: 'var(--foreground-muted)' }}>Tâches totales</p>
                  <p className="stat-value">{tasks.length}</p>
                </div>
                <div className="stat-card stat-card-yellow">
                  <p className="text-sm font-medium mb-2" style={{ color: 'var(--foreground-muted)' }}>En cours</p>
                  <p className="stat-value">{tasks.filter(t => t.status === 'in_progress').length}</p>
                </div>
                <div className="stat-card stat-card-green">
                  <p className="text-sm font-medium mb-2" style={{ color: 'var(--foreground-muted)' }}>Terminées</p>
                  <p className="stat-value">{tasks.filter(t => t.status === 'done').length}</p>
                </div>
              </div>

              {/* Projects grid */}
              {projectsWithProgress.length === 0 ? (
                <div className="card p-16 text-center">
                  <div className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6" style={{ background: 'var(--primary-bg)' }}>
                    <svg className="w-10 h-10" style={{ color: 'var(--primary)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold mb-2" style={{ color: 'var(--foreground)' }}>Aucun projet</h3>
                  <p className="mb-6 max-w-sm mx-auto" style={{ color: 'var(--foreground-muted)' }}>
                    Créez votre premier projet pour commencer à organiser vos tâches
                  </p>
                  <button onClick={handleAddProject} className="btn btn-primary">
                    Créer un projet
                  </button>
                </div>
              ) : filteredProjects.length === 0 && (searchQuery || statusFilter !== 'all') ? (
                <div className="card p-16 text-center">
                  <div className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6" style={{ background: 'var(--background-secondary)' }}>
                    <svg className="w-10 h-10" style={{ color: 'var(--foreground-muted)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold mb-2" style={{ color: 'var(--foreground)' }}>Aucun résultat</h3>
                  <p className="mb-6 max-w-sm mx-auto" style={{ color: 'var(--foreground-muted)' }}>
                    {searchQuery && statusFilter !== 'all'
                      ? `Aucun projet "${statusFilter === 'active' ? 'actif' : statusFilter === 'completed' ? 'terminé' : 'en pause'}" ne correspond à "${searchQuery}"`
                      : searchQuery
                        ? `Aucun projet ne correspond à "${searchQuery}"`
                        : `Aucun projet ${statusFilter === 'active' ? 'actif' : statusFilter === 'completed' ? 'terminé' : 'en pause'}`
                    }
                  </p>
                  <button
                    onClick={() => { setSearchQuery(''); setStatusFilter('all'); }}
                    className="btn btn-secondary"
                  >
                    Réinitialiser les filtres
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredProjects.map(project => (
                    <ProjectCard
                      key={project.id}
                      project={project}
                      onSelect={setSelectedProjectId}
                      onEdit={handleEditProject}
                      onDelete={handleDeleteProject}
                      onReport={handleReportProject}
                    />
                  ))}
                </div>
              )}
            </>
          ) : selectedProject ? (
            /* Vue du projet sélectionné */
            <>
              {/* Header */}
              <div className="flex items-center gap-4 mb-8">
                <button
                  onClick={() => setSelectedProjectId(null)}
                  className="icon-btn"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                </button>
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <div
                      className="avatar text-lg"
                      style={{ backgroundColor: selectedProject.color }}
                    >
                      {selectedProject.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h1 className="text-2xl font-bold" style={{ color: 'var(--foreground)' }}>{selectedProject.name}</h1>
                      {selectedProject.description && (
                        <p style={{ color: 'var(--foreground-muted)' }}>{selectedProject.description}</p>
                      )}
                    </div>
                  </div>
                </div>
                <button onClick={handleAddTask} className="btn btn-primary">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Nouvelle tâche
                </button>
              </div>

              {/* Progress card */}
              <div className="card p-6 mb-8">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-lg" style={{ color: 'var(--foreground)' }}>Progression du projet</h3>
                  <span className="text-3xl font-bold" style={{ color: 'var(--foreground)' }}>{selectedProject.progress}%</span>
                </div>
                <div className="progress-bar h-3 mb-6">
                  <div
                    className="progress-bar-fill"
                    style={{
                      width: `${selectedProject.progress}%`,
                      backgroundColor: selectedProject.color,
                    }}
                  />
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center p-4 rounded-xl" style={{ background: 'var(--background-secondary)' }}>
                    <p className="text-2xl font-bold" style={{ color: 'var(--foreground-light)' }}>{selectedProject.tasks.filter(t => t.status === 'todo').length}</p>
                    <p className="text-sm" style={{ color: 'var(--foreground-muted)' }}>À faire</p>
                  </div>
                  <div className="text-center p-4 rounded-xl" style={{ background: 'var(--warning-bg)' }}>
                    <p className="text-2xl font-bold" style={{ color: 'var(--warning)' }}>{selectedProject.tasks.filter(t => t.status === 'in_progress').length}</p>
                    <p className="text-sm" style={{ color: 'var(--foreground-muted)' }}>En cours</p>
                  </div>
                  <div className="text-center p-4 rounded-xl" style={{ background: 'var(--success-bg)' }}>
                    <p className="text-2xl font-bold" style={{ color: 'var(--success)' }}>{selectedProject.completedTasks}</p>
                    <p className="text-sm" style={{ color: 'var(--foreground-muted)' }}>Terminées</p>
                  </div>
                </div>
              </div>

              {/* Tabs */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex gap-4">
                  <button
                    onClick={() => setProjectTab('tasks')}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                      projectTab === 'tasks'
                        ? 'text-white'
                        : ''
                    }`}
                    style={{
                      backgroundColor: projectTab === 'tasks' ? 'var(--primary)' : 'var(--background-white)',
                      color: projectTab === 'tasks' ? 'white' : 'var(--foreground-muted)',
                    }}
                  >
                    <span className="flex items-center gap-2">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                      </svg>
                      Tâches ({selectedProject.tasks.length})
                    </span>
                  </button>
                  <button
                    onClick={() => setProjectTab('corrections')}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors`}
                    style={{
                      backgroundColor: projectTab === 'corrections' ? 'var(--primary)' : 'var(--background-white)',
                      color: projectTab === 'corrections' ? 'white' : 'var(--foreground-muted)',
                    }}
                  >
                    <span className="flex items-center gap-2">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                      Points à rectifier ({getProjectCorrections(selectedProject.id).length})
                    </span>
                  </button>
                </div>

                {/* Filtres des tâches */}
                {projectTab === 'tasks' && (
                  <div className="flex items-center gap-4">
                    {/* Filtre par membre */}
                    <div className="flex items-center gap-2">
                      <svg className="w-5 h-5" style={{ color: 'var(--foreground-muted)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      <select
                        value={taskMemberFilter}
                        onChange={(e) => setTaskMemberFilter(e.target.value)}
                        className="px-3 py-2 rounded-lg font-medium transition-colors"
                        style={{
                          backgroundColor: taskMemberFilter !== 'all' ? 'var(--primary)' : 'var(--background-white)',
                          color: taskMemberFilter !== 'all' ? 'white' : 'var(--foreground-muted)',
                          border: taskMemberFilter !== 'all' ? 'none' : '1px solid var(--border)',
                          cursor: 'pointer',
                        }}
                      >
                        <option value="all" style={{ backgroundColor: 'var(--background-white)', color: 'var(--foreground)' }}>Tous les membres</option>
                        <option value="unassigned" style={{ backgroundColor: 'var(--background-white)', color: 'var(--foreground)' }}>Non assigné</option>
                        <option value={currentUserId} style={{ backgroundColor: 'var(--background-white)', color: 'var(--foreground)' }}>Mes tâches</option>
                        {allUsers.filter(u => u.id !== currentUserId).map(user => (
                          <option key={user.id} value={user.id} style={{ backgroundColor: 'var(--background-white)', color: 'var(--foreground)' }}>
                            {user.name}
                          </option>
                        ))}
                      </select>
                      {taskMemberFilter !== 'all' && (
                        <span className="px-2 py-1 text-xs rounded-full" style={{ backgroundColor: 'var(--primary)', color: 'white' }}>
                          {displayedProjectTasks.length}
                        </span>
                      )}
                    </div>

                    {/* Tri par priorité */}
                    <div className="flex items-center gap-2">
                      <svg className="w-5 h-5" style={{ color: 'var(--foreground-muted)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" />
                      </svg>
                      <select
                        value={taskPrioritySort}
                        onChange={(e) => setTaskPrioritySort(e.target.value as 'none' | 'asc' | 'desc')}
                        className="px-3 py-2 rounded-lg font-medium transition-colors"
                        style={{
                          backgroundColor: taskPrioritySort !== 'none' ? 'var(--primary)' : 'var(--background-white)',
                          color: taskPrioritySort !== 'none' ? 'white' : 'var(--foreground-muted)',
                          border: taskPrioritySort !== 'none' ? 'none' : '1px solid var(--border)',
                          cursor: 'pointer',
                        }}
                      >
                        <option value="none" style={{ backgroundColor: 'var(--background-white)', color: 'var(--foreground)' }}>Priorité: par défaut</option>
                        <option value="asc" style={{ backgroundColor: 'var(--background-white)', color: 'var(--foreground)' }}>Priorité: basse → haute</option>
                        <option value="desc" style={{ backgroundColor: 'var(--background-white)', color: 'var(--foreground)' }}>Priorité: haute → basse</option>
                      </select>
                    </div>
                  </div>
                )}
              </div>

              {/* Tab Content */}
              {projectTab === 'tasks' ? (
                /* Tasks */
                selectedProject.tasks.length === 0 ? (
                  <div className="card p-16 text-center">
                    <div className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6" style={{ background: 'var(--primary-bg)' }}>
                      <svg className="w-10 h-10" style={{ color: 'var(--primary)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                    </div>
                    <h3 className="text-xl font-semibold mb-2" style={{ color: 'var(--foreground)' }}>Aucune tâche</h3>
                    <p className="mb-6" style={{ color: 'var(--foreground-muted)' }}>Ajoutez des tâches pour suivre l&apos;avancement de votre projet</p>
                    <button onClick={handleAddTask} className="btn btn-primary">
                      Ajouter une tâche
                    </button>
                  </div>
                ) : taskMemberFilter !== 'all' && displayedProjectTasks.length === 0 ? (
                  <div className="card p-16 text-center">
                    <div className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6" style={{ background: 'var(--background-secondary)' }}>
                      <svg className="w-10 h-10" style={{ color: 'var(--foreground-muted)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                    <h3 className="text-xl font-semibold mb-2" style={{ color: 'var(--foreground)' }}>
                      {taskMemberFilter === 'unassigned' ? 'Aucune tâche non assignée' : 'Aucune tâche trouvée'}
                    </h3>
                    <p className="mb-6" style={{ color: 'var(--foreground-muted)' }}>
                      {taskMemberFilter === 'unassigned'
                        ? 'Toutes les tâches de ce projet sont assignées'
                        : taskMemberFilter === currentUserId
                          ? 'Vous n\'avez aucune tâche assignée dans ce projet'
                          : 'Ce membre n\'a aucune tâche assignée dans ce projet'}
                    </p>
                    <button onClick={() => setTaskMemberFilter('all')} className="btn btn-secondary">
                      Voir toutes les tâches
                    </button>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {/* À faire */}
                    {displayedProjectTasks.filter(t => t.status === 'todo').length > 0 && (
                      <div>
                        <h3 className="text-sm font-semibold uppercase tracking-wide mb-3 flex items-center gap-2" style={{ color: 'var(--foreground-muted)' }}>
                          <span className="w-2 h-2 rounded-full" style={{ background: 'var(--foreground-light)' }} />
                          À faire ({displayedProjectTasks.filter(t => t.status === 'todo').length})
                        </h3>
                        <div className="space-y-2">
                          {displayedProjectTasks.filter(t => t.status === 'todo').map(task => (
                            <TaskCard
                              key={task.id}
                              task={task}
                              onStatusChange={handleTaskStatusChange}
                              onEdit={handleEditTask}
                              onDelete={handleDeleteTask}
                              users={allUsers}
                              currentUserId={currentUserId}
                            />
                          ))}
                        </div>
                      </div>
                    )}

                    {/* En cours */}
                    {displayedProjectTasks.filter(t => t.status === 'in_progress').length > 0 && (
                      <div>
                        <h3 className="text-sm font-semibold uppercase tracking-wide mb-3 flex items-center gap-2" style={{ color: 'var(--foreground-muted)' }}>
                          <span className="w-2 h-2 rounded-full" style={{ background: 'var(--warning)' }} />
                          En cours ({displayedProjectTasks.filter(t => t.status === 'in_progress').length})
                        </h3>
                        <div className="space-y-2">
                          {displayedProjectTasks.filter(t => t.status === 'in_progress').map(task => (
                            <TaskCard
                              key={task.id}
                              task={task}
                              onStatusChange={handleTaskStatusChange}
                              onEdit={handleEditTask}
                              onDelete={handleDeleteTask}
                              users={allUsers}
                              currentUserId={currentUserId}
                            />
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Terminées */}
                    {displayedProjectTasks.filter(t => t.status === 'done').length > 0 && (
                      <div>
                        <h3 className="text-sm font-semibold uppercase tracking-wide mb-3 flex items-center gap-2" style={{ color: 'var(--foreground-muted)' }}>
                          <span className="w-2 h-2 rounded-full" style={{ background: 'var(--success)' }} />
                          Terminées ({displayedProjectTasks.filter(t => t.status === 'done').length})
                        </h3>
                        <div className="space-y-2">
                          {displayedProjectTasks.filter(t => t.status === 'done').map(task => (
                            <TaskCard
                              key={task.id}
                              task={task}
                              onStatusChange={handleTaskStatusChange}
                              onEdit={handleEditTask}
                              onDelete={handleDeleteTask}
                              users={allUsers}
                              currentUserId={currentUserId}
                            />
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )
              ) : (
                /* Corrections Tab */
                <CorrectionsList
                  corrections={getProjectCorrections(selectedProject.id)}
                  users={allUsers}
                  projectId={selectedProject.id}
                  projectName={selectedProject.name}
                  currentUserId={currentUserId}
                  onAdd={async (correction) => {
                    await addCorrection(correction);
                  }}
                  onUpdate={async (id, updates) => {
                    await updateCorrection(id, updates);
                  }}
                  onDelete={async (id) => {
                    await deleteCorrection(id);
                  }}
                  onNotifyAssignment={async (assignedToId, correctionTitle) => {
                    if (currentUserId && assignedToId !== currentUserId) {
                      await addNotification(
                        'correction_assigned',
                        'Point à rectifier assigné',
                        `Un point à rectifier "${correctionTitle}" vous a été assigné sur le projet "${selectedProject.name}"`,
                        assignedToId,
                        { projectId: selectedProject.id }
                      );
                    }
                  }}
                />
              )}
            </>
          ) : null}
        </div>
      </main>

      {/* Modals */}
      <ProjectModal
        isOpen={isProjectModalOpen}
        onClose={() => setIsProjectModalOpen(false)}
        onSave={handleSaveProject}
        project={editingProject}
      />

      {selectedProject && (
        <TaskModal
          isOpen={isTaskModalOpen}
          onClose={() => setIsTaskModalOpen(false)}
          onSave={handleSaveTask}
          task={editingTask}
          projectId={selectedProject.id}
          users={allUsers}
          currentUserId={currentUserId}
        />
      )}

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        isDark={isDark}
        onToggleTheme={toggleTheme}
      />

      <ConfirmModal
        isOpen={deleteProjectConfirm.isOpen}
        title="Supprimer le projet"
        message={`Êtes-vous sûr de vouloir supprimer le projet "${deleteProjectConfirm.project?.name}" et toutes ses tâches ? Cette action est irréversible.`}
        confirmLabel="Supprimer"
        onConfirm={confirmDeleteProject}
        onCancel={() => setDeleteProjectConfirm({ isOpen: false, project: null })}
      />

      {reportProject && (
        <ProjectReportModal
          isOpen={!!reportProject}
          onClose={() => setReportProject(null)}
          project={reportProject}
          corrections={getProjectCorrections(reportProject.id)}
          meetings={meetings}
          users={allUsers}
        />
      )}
    </div>
  );
}
