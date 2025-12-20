'use client';

import { useRef } from 'react';
import { ProjectWithProgress, Task, Correction, Meeting, User } from '../types';

interface ProjectReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: ProjectWithProgress;
  corrections: Correction[];
  meetings: Meeting[];
  users: Omit<User, 'password'>[];
}

export default function ProjectReportModal({
  isOpen,
  onClose,
  project,
  corrections,
  meetings,
  users,
}: ProjectReportModalProps) {
  const reportRef = useRef<HTMLDivElement>(null);

  if (!isOpen) return null;

  // Filtrer les corrections et réunions liées au projet
  const projectCorrections = corrections.filter(c => c.projectId === project.id);
  const projectMeetings = meetings.filter(m => m.projectId === project.id);

  // Statistiques des tâches
  const tasksByStatus = {
    todo: project.tasks.filter(t => t.status === 'todo').length,
    in_progress: project.tasks.filter(t => t.status === 'in_progress').length,
    done: project.tasks.filter(t => t.status === 'done').length,
  };

  const tasksByPriority = {
    high: project.tasks.filter(t => t.priority === 'high').length,
    medium: project.tasks.filter(t => t.priority === 'medium').length,
    low: project.tasks.filter(t => t.priority === 'low').length,
  };

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const overdueTasks = project.tasks.filter(t => {
    if (!t.dueDate || t.status === 'done') return false;
    return new Date(t.dueDate) < today;
  });

  // Statistiques des corrections
  const correctionsByStatus = {
    pending: projectCorrections.filter(c => c.status === 'pending').length,
    in_progress: projectCorrections.filter(c => c.status === 'in_progress').length,
    resolved: projectCorrections.filter(c => c.status === 'resolved').length,
  };

  // Membres impliqués (assignés aux tâches ou corrections)
  const involvedUserIds = new Set<string>();
  project.tasks.forEach(t => t.assignedTo && involvedUserIds.add(t.assignedTo));
  projectCorrections.forEach(c => {
    if (c.assignedTo) involvedUserIds.add(c.assignedTo);
    involvedUserIds.add(c.createdBy);
  });
  projectMeetings.forEach(m => {
    involvedUserIds.add(m.createdBy);
    m.attendees.forEach(a => involvedUserIds.add(a));
  });

  const involvedUsers = users.filter(u => involvedUserIds.has(u.id));

  // Tâches par utilisateur
  const tasksByUser: Record<string, number> = {};
  project.tasks.forEach(t => {
    if (t.assignedTo) {
      tasksByUser[t.assignedTo] = (tasksByUser[t.assignedTo] || 0) + 1;
    }
  });

  const getUserName = (userId: string) => {
    const user = users.find(u => u.id === userId);
    return user?.name || 'Inconnu';
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      todo: 'À faire',
      in_progress: 'En cours',
      done: 'Terminée',
      active: 'Actif',
      completed: 'Terminé',
      on_hold: 'En pause',
      pending: 'En attente',
      resolved: 'Résolue',
    };
    return labels[status] || status;
  };

  const getPriorityLabel = (priority: string) => {
    const labels: Record<string, string> = {
      high: 'Haute',
      medium: 'Moyenne',
      low: 'Basse',
    };
    return labels[priority] || priority;
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  const handlePrint = () => {
    const printContent = reportRef.current;
    if (!printContent) return;

    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Rapport - ${project.name}</title>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 40px; color: #1f2937; line-height: 1.6; }
            .header { text-align: center; margin-bottom: 40px; border-bottom: 3px solid ${project.color}; padding-bottom: 20px; }
            .header h1 { font-size: 28px; color: ${project.color}; margin-bottom: 8px; }
            .header .date { color: #6b7280; font-size: 14px; }
            .section { margin-bottom: 30px; }
            .section-title { font-size: 18px; font-weight: 600; color: #374151; margin-bottom: 15px; padding-bottom: 8px; border-bottom: 2px solid #e5e7eb; }
            .info-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px; }
            .info-item { background: #f9fafb; padding: 12px 16px; border-radius: 8px; }
            .info-label { font-size: 12px; color: #6b7280; text-transform: uppercase; letter-spacing: 0.5px; }
            .info-value { font-size: 16px; font-weight: 500; color: #1f2937; margin-top: 4px; }
            .stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 15px; }
            .stat-card { background: #f9fafb; padding: 16px; border-radius: 8px; text-align: center; }
            .stat-value { font-size: 28px; font-weight: 700; color: ${project.color}; }
            .stat-label { font-size: 12px; color: #6b7280; margin-top: 4px; }
            .progress-bar { height: 12px; background: #e5e7eb; border-radius: 6px; overflow: hidden; margin-top: 10px; }
            .progress-fill { height: 100%; background: ${project.color}; border-radius: 6px; }
            table { width: 100%; border-collapse: collapse; margin-top: 10px; }
            th, td { padding: 10px 12px; text-align: left; border-bottom: 1px solid #e5e7eb; }
            th { background: #f9fafb; font-weight: 600; font-size: 12px; text-transform: uppercase; color: #6b7280; }
            td { font-size: 14px; }
            .badge { display: inline-block; padding: 4px 10px; border-radius: 12px; font-size: 11px; font-weight: 500; }
            .badge-high { background: #fef2f2; color: #dc2626; }
            .badge-medium { background: #fffbeb; color: #d97706; }
            .badge-low { background: #f0fdf4; color: #16a34a; }
            .badge-todo { background: #f3f4f6; color: #6b7280; }
            .badge-in_progress { background: #dbeafe; color: #2563eb; }
            .badge-done { background: #dcfce7; color: #16a34a; }
            .badge-pending { background: #fef3c7; color: #d97706; }
            .badge-resolved { background: #dcfce7; color: #16a34a; }
            .user-list { display: flex; flex-wrap: wrap; gap: 10px; }
            .user-chip { background: #f3f4f6; padding: 6px 12px; border-radius: 16px; font-size: 13px; }
            .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e7eb; text-align: center; color: #9ca3af; font-size: 12px; }
            .empty-message { color: #9ca3af; font-style: italic; padding: 20px; text-align: center; }
            @media print { body { padding: 20px; } }
          </style>
        </head>
        <body>
          ${printContent.innerHTML}
        </body>
      </html>
    `);

    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 250);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div
        className="rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col"
        style={{ backgroundColor: 'var(--background-white)' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b" style={{ borderColor: 'var(--border)' }}>
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: project.color }}
            >
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div>
              <h2 className="text-xl font-bold" style={{ color: 'var(--foreground)' }}>
                Rapport de Projet
              </h2>
              <p className="text-sm" style={{ color: 'var(--foreground-muted)' }}>
                {project.name}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors"
              style={{ backgroundColor: project.color, color: 'white' }}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Télécharger PDF
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: 'var(--foreground-muted)' }}>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <div ref={reportRef}>
            {/* En-tête du rapport */}
            <div className="header" style={{ textAlign: 'center', marginBottom: '30px', paddingBottom: '20px', borderBottom: `3px solid ${project.color}` }}>
              <h1 style={{ fontSize: '24px', color: project.color, marginBottom: '8px' }}>
                {project.name}
              </h1>
              <p className="date" style={{ color: '#6b7280', fontSize: '14px' }}>
                Rapport généré le {formatDate(new Date().toISOString())}
              </p>
            </div>

            {/* Informations générales */}
            <div className="section" style={{ marginBottom: '30px' }}>
              <h3 className="section-title" style={{ fontSize: '16px', fontWeight: 600, marginBottom: '15px', paddingBottom: '8px', borderBottom: '2px solid #e5e7eb', color: 'var(--foreground)' }}>
                Informations Générales
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '15px' }}>
                <div style={{ background: 'var(--background-secondary)', padding: '12px 16px', borderRadius: '8px' }}>
                  <p style={{ fontSize: '12px', color: 'var(--foreground-muted)', textTransform: 'uppercase' }}>Statut</p>
                  <p style={{ fontSize: '16px', fontWeight: 500, color: 'var(--foreground)', marginTop: '4px' }}>
                    {getStatusLabel(project.status)}
                  </p>
                </div>
                <div style={{ background: 'var(--background-secondary)', padding: '12px 16px', borderRadius: '8px' }}>
                  <p style={{ fontSize: '12px', color: 'var(--foreground-muted)', textTransform: 'uppercase' }}>Date de création</p>
                  <p style={{ fontSize: '16px', fontWeight: 500, color: 'var(--foreground)', marginTop: '4px' }}>
                    {formatDate(project.createdAt)}
                  </p>
                </div>
                <div style={{ background: 'var(--background-secondary)', padding: '12px 16px', borderRadius: '8px', gridColumn: 'span 2' }}>
                  <p style={{ fontSize: '12px', color: 'var(--foreground-muted)', textTransform: 'uppercase' }}>Description</p>
                  <p style={{ fontSize: '14px', color: 'var(--foreground)', marginTop: '4px' }}>
                    {project.description || 'Aucune description'}
                  </p>
                </div>
              </div>
            </div>

            {/* Statistiques globales */}
            <div className="section" style={{ marginBottom: '30px' }}>
              <h3 className="section-title" style={{ fontSize: '16px', fontWeight: 600, marginBottom: '15px', paddingBottom: '8px', borderBottom: '2px solid #e5e7eb', color: 'var(--foreground)' }}>
                Vue d'ensemble
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '15px' }}>
                <div style={{ background: 'var(--background-secondary)', padding: '16px', borderRadius: '8px', textAlign: 'center' }}>
                  <p style={{ fontSize: '28px', fontWeight: 700, color: project.color }}>{project.progress}%</p>
                  <p style={{ fontSize: '12px', color: 'var(--foreground-muted)', marginTop: '4px' }}>Progression</p>
                </div>
                <div style={{ background: 'var(--background-secondary)', padding: '16px', borderRadius: '8px', textAlign: 'center' }}>
                  <p style={{ fontSize: '28px', fontWeight: 700, color: project.color }}>{project.totalTasks}</p>
                  <p style={{ fontSize: '12px', color: 'var(--foreground-muted)', marginTop: '4px' }}>Tâches totales</p>
                </div>
                <div style={{ background: 'var(--background-secondary)', padding: '16px', borderRadius: '8px', textAlign: 'center' }}>
                  <p style={{ fontSize: '28px', fontWeight: 700, color: '#dc2626' }}>{overdueTasks.length}</p>
                  <p style={{ fontSize: '12px', color: 'var(--foreground-muted)', marginTop: '4px' }}>En retard</p>
                </div>
                <div style={{ background: 'var(--background-secondary)', padding: '16px', borderRadius: '8px', textAlign: 'center' }}>
                  <p style={{ fontSize: '28px', fontWeight: 700, color: project.color }}>{projectCorrections.length}</p>
                  <p style={{ fontSize: '12px', color: 'var(--foreground-muted)', marginTop: '4px' }}>Corrections</p>
                </div>
              </div>

              {/* Barre de progression */}
              <div style={{ marginTop: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ fontSize: '14px', color: 'var(--foreground)' }}>Progression globale</span>
                  <span style={{ fontSize: '14px', fontWeight: 600, color: project.color }}>{project.progress}%</span>
                </div>
                <div style={{ height: '12px', background: '#e5e7eb', borderRadius: '6px', overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${project.progress}%`, background: project.color, borderRadius: '6px' }} />
                </div>
              </div>
            </div>

            {/* Répartition des tâches */}
            <div className="section" style={{ marginBottom: '30px' }}>
              <h3 className="section-title" style={{ fontSize: '16px', fontWeight: 600, marginBottom: '15px', paddingBottom: '8px', borderBottom: '2px solid #e5e7eb', color: 'var(--foreground)' }}>
                Répartition des Tâches
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px' }}>
                {/* Par statut */}
                <div>
                  <h4 style={{ fontSize: '14px', fontWeight: 500, marginBottom: '10px', color: 'var(--foreground)' }}>Par statut</h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', background: 'var(--background-secondary)', borderRadius: '6px' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#9ca3af' }} />
                        <span style={{ fontSize: '14px', color: 'var(--foreground)' }}>À faire</span>
                      </span>
                      <span style={{ fontWeight: 600, color: 'var(--foreground)' }}>{tasksByStatus.todo}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', background: 'var(--background-secondary)', borderRadius: '6px' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#3b82f6' }} />
                        <span style={{ fontSize: '14px', color: 'var(--foreground)' }}>En cours</span>
                      </span>
                      <span style={{ fontWeight: 600, color: 'var(--foreground)' }}>{tasksByStatus.in_progress}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', background: 'var(--background-secondary)', borderRadius: '6px' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#22c55e' }} />
                        <span style={{ fontSize: '14px', color: 'var(--foreground)' }}>Terminées</span>
                      </span>
                      <span style={{ fontWeight: 600, color: 'var(--foreground)' }}>{tasksByStatus.done}</span>
                    </div>
                  </div>
                </div>

                {/* Par priorité */}
                <div>
                  <h4 style={{ fontSize: '14px', fontWeight: 500, marginBottom: '10px', color: 'var(--foreground)' }}>Par priorité</h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', background: 'var(--background-secondary)', borderRadius: '6px' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#dc2626' }} />
                        <span style={{ fontSize: '14px', color: 'var(--foreground)' }}>Haute</span>
                      </span>
                      <span style={{ fontWeight: 600, color: 'var(--foreground)' }}>{tasksByPriority.high}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', background: 'var(--background-secondary)', borderRadius: '6px' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#f59e0b' }} />
                        <span style={{ fontSize: '14px', color: 'var(--foreground)' }}>Moyenne</span>
                      </span>
                      <span style={{ fontWeight: 600, color: 'var(--foreground)' }}>{tasksByPriority.medium}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', background: 'var(--background-secondary)', borderRadius: '6px' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#22c55e' }} />
                        <span style={{ fontSize: '14px', color: 'var(--foreground)' }}>Basse</span>
                      </span>
                      <span style={{ fontWeight: 600, color: 'var(--foreground)' }}>{tasksByPriority.low}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Liste des tâches */}
            <div className="section" style={{ marginBottom: '30px' }}>
              <h3 className="section-title" style={{ fontSize: '16px', fontWeight: 600, marginBottom: '15px', paddingBottom: '8px', borderBottom: '2px solid #e5e7eb', color: 'var(--foreground)' }}>
                Liste des Tâches ({project.tasks.length})
              </h3>
              {project.tasks.length === 0 ? (
                <p style={{ color: 'var(--foreground-muted)', fontStyle: 'italic', textAlign: 'center', padding: '20px' }}>
                  Aucune tâche dans ce projet
                </p>
              ) : (
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ background: 'var(--background-secondary)' }}>
                      <th style={{ padding: '10px 12px', textAlign: 'left', fontSize: '12px', textTransform: 'uppercase', color: 'var(--foreground-muted)' }}>Tâche</th>
                      <th style={{ padding: '10px 12px', textAlign: 'left', fontSize: '12px', textTransform: 'uppercase', color: 'var(--foreground-muted)' }}>Statut</th>
                      <th style={{ padding: '10px 12px', textAlign: 'left', fontSize: '12px', textTransform: 'uppercase', color: 'var(--foreground-muted)' }}>Priorité</th>
                      <th style={{ padding: '10px 12px', textAlign: 'left', fontSize: '12px', textTransform: 'uppercase', color: 'var(--foreground-muted)' }}>Assigné à</th>
                      <th style={{ padding: '10px 12px', textAlign: 'left', fontSize: '12px', textTransform: 'uppercase', color: 'var(--foreground-muted)' }}>Échéance</th>
                    </tr>
                  </thead>
                  <tbody>
                    {project.tasks.map(task => (
                      <tr key={task.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                        <td style={{ padding: '10px 12px', fontSize: '14px', color: 'var(--foreground)' }}>{task.title}</td>
                        <td style={{ padding: '10px 12px' }}>
                          <span style={{
                            display: 'inline-block',
                            padding: '4px 10px',
                            borderRadius: '12px',
                            fontSize: '11px',
                            fontWeight: 500,
                            background: task.status === 'done' ? '#dcfce7' : task.status === 'in_progress' ? '#dbeafe' : '#f3f4f6',
                            color: task.status === 'done' ? '#16a34a' : task.status === 'in_progress' ? '#2563eb' : '#6b7280',
                          }}>
                            {getStatusLabel(task.status)}
                          </span>
                        </td>
                        <td style={{ padding: '10px 12px' }}>
                          <span style={{
                            display: 'inline-block',
                            padding: '4px 10px',
                            borderRadius: '12px',
                            fontSize: '11px',
                            fontWeight: 500,
                            background: task.priority === 'high' ? '#fef2f2' : task.priority === 'medium' ? '#fffbeb' : '#f0fdf4',
                            color: task.priority === 'high' ? '#dc2626' : task.priority === 'medium' ? '#d97706' : '#16a34a',
                          }}>
                            {getPriorityLabel(task.priority)}
                          </span>
                        </td>
                        <td style={{ padding: '10px 12px', fontSize: '14px', color: 'var(--foreground)' }}>
                          {task.assignedTo ? getUserName(task.assignedTo) : '-'}
                        </td>
                        <td style={{ padding: '10px 12px', fontSize: '14px', color: task.dueDate && new Date(task.dueDate) < today && task.status !== 'done' ? '#dc2626' : 'var(--foreground)' }}>
                          {task.dueDate ? formatDate(task.dueDate) : '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            {/* Corrections */}
            <div className="section" style={{ marginBottom: '30px' }}>
              <h3 className="section-title" style={{ fontSize: '16px', fontWeight: 600, marginBottom: '15px', paddingBottom: '8px', borderBottom: '2px solid #e5e7eb', color: 'var(--foreground)' }}>
                Corrections ({projectCorrections.length})
              </h3>
              {projectCorrections.length === 0 ? (
                <p style={{ color: 'var(--foreground-muted)', fontStyle: 'italic', textAlign: 'center', padding: '20px' }}>
                  Aucune correction pour ce projet
                </p>
              ) : (
                <>
                  <div style={{ display: 'flex', gap: '15px', marginBottom: '15px' }}>
                    <div style={{ flex: 1, background: '#fef3c7', padding: '12px', borderRadius: '8px', textAlign: 'center' }}>
                      <p style={{ fontSize: '20px', fontWeight: 700, color: '#d97706' }}>{correctionsByStatus.pending}</p>
                      <p style={{ fontSize: '12px', color: '#92400e' }}>En attente</p>
                    </div>
                    <div style={{ flex: 1, background: '#dbeafe', padding: '12px', borderRadius: '8px', textAlign: 'center' }}>
                      <p style={{ fontSize: '20px', fontWeight: 700, color: '#2563eb' }}>{correctionsByStatus.in_progress}</p>
                      <p style={{ fontSize: '12px', color: '#1e40af' }}>En cours</p>
                    </div>
                    <div style={{ flex: 1, background: '#dcfce7', padding: '12px', borderRadius: '8px', textAlign: 'center' }}>
                      <p style={{ fontSize: '20px', fontWeight: 700, color: '#16a34a' }}>{correctionsByStatus.resolved}</p>
                      <p style={{ fontSize: '12px', color: '#166534' }}>Résolues</p>
                    </div>
                  </div>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ background: 'var(--background-secondary)' }}>
                        <th style={{ padding: '10px 12px', textAlign: 'left', fontSize: '12px', textTransform: 'uppercase', color: 'var(--foreground-muted)' }}>Correction</th>
                        <th style={{ padding: '10px 12px', textAlign: 'left', fontSize: '12px', textTransform: 'uppercase', color: 'var(--foreground-muted)' }}>Statut</th>
                        <th style={{ padding: '10px 12px', textAlign: 'left', fontSize: '12px', textTransform: 'uppercase', color: 'var(--foreground-muted)' }}>Priorité</th>
                        <th style={{ padding: '10px 12px', textAlign: 'left', fontSize: '12px', textTransform: 'uppercase', color: 'var(--foreground-muted)' }}>Assigné à</th>
                      </tr>
                    </thead>
                    <tbody>
                      {projectCorrections.map(correction => (
                        <tr key={correction.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                          <td style={{ padding: '10px 12px', fontSize: '14px', color: 'var(--foreground)' }}>{correction.title}</td>
                          <td style={{ padding: '10px 12px' }}>
                            <span style={{
                              display: 'inline-block',
                              padding: '4px 10px',
                              borderRadius: '12px',
                              fontSize: '11px',
                              fontWeight: 500,
                              background: correction.status === 'resolved' ? '#dcfce7' : correction.status === 'in_progress' ? '#dbeafe' : '#fef3c7',
                              color: correction.status === 'resolved' ? '#16a34a' : correction.status === 'in_progress' ? '#2563eb' : '#d97706',
                            }}>
                              {getStatusLabel(correction.status)}
                            </span>
                          </td>
                          <td style={{ padding: '10px 12px' }}>
                            <span style={{
                              display: 'inline-block',
                              padding: '4px 10px',
                              borderRadius: '12px',
                              fontSize: '11px',
                              fontWeight: 500,
                              background: correction.priority === 'high' ? '#fef2f2' : correction.priority === 'medium' ? '#fffbeb' : '#f0fdf4',
                              color: correction.priority === 'high' ? '#dc2626' : correction.priority === 'medium' ? '#d97706' : '#16a34a',
                            }}>
                              {getPriorityLabel(correction.priority)}
                            </span>
                          </td>
                          <td style={{ padding: '10px 12px', fontSize: '14px', color: 'var(--foreground)' }}>
                            {correction.assignedTo ? getUserName(correction.assignedTo) : '-'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </>
              )}
            </div>

            {/* Réunions */}
            <div className="section" style={{ marginBottom: '30px' }}>
              <h3 className="section-title" style={{ fontSize: '16px', fontWeight: 600, marginBottom: '15px', paddingBottom: '8px', borderBottom: '2px solid #e5e7eb', color: 'var(--foreground)' }}>
                Réunions ({projectMeetings.length})
              </h3>
              {projectMeetings.length === 0 ? (
                <p style={{ color: 'var(--foreground-muted)', fontStyle: 'italic', textAlign: 'center', padding: '20px' }}>
                  Aucune réunion planifiée pour ce projet
                </p>
              ) : (
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ background: 'var(--background-secondary)' }}>
                      <th style={{ padding: '10px 12px', textAlign: 'left', fontSize: '12px', textTransform: 'uppercase', color: 'var(--foreground-muted)' }}>Réunion</th>
                      <th style={{ padding: '10px 12px', textAlign: 'left', fontSize: '12px', textTransform: 'uppercase', color: 'var(--foreground-muted)' }}>Date</th>
                      <th style={{ padding: '10px 12px', textAlign: 'left', fontSize: '12px', textTransform: 'uppercase', color: 'var(--foreground-muted)' }}>Horaire</th>
                      <th style={{ padding: '10px 12px', textAlign: 'left', fontSize: '12px', textTransform: 'uppercase', color: 'var(--foreground-muted)' }}>Participants</th>
                    </tr>
                  </thead>
                  <tbody>
                    {projectMeetings.map(meeting => (
                      <tr key={meeting.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                        <td style={{ padding: '10px 12px', fontSize: '14px', color: 'var(--foreground)' }}>{meeting.title}</td>
                        <td style={{ padding: '10px 12px', fontSize: '14px', color: 'var(--foreground)' }}>{formatDate(meeting.date)}</td>
                        <td style={{ padding: '10px 12px', fontSize: '14px', color: 'var(--foreground)' }}>{meeting.startTime} - {meeting.endTime}</td>
                        <td style={{ padding: '10px 12px', fontSize: '14px', color: 'var(--foreground)' }}>{meeting.attendees.length} participant(s)</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            {/* Équipe */}
            <div className="section" style={{ marginBottom: '30px' }}>
              <h3 className="section-title" style={{ fontSize: '16px', fontWeight: 600, marginBottom: '15px', paddingBottom: '8px', borderBottom: '2px solid #e5e7eb', color: 'var(--foreground)' }}>
                Équipe Impliquée ({involvedUsers.length})
              </h3>
              {involvedUsers.length === 0 ? (
                <p style={{ color: 'var(--foreground-muted)', fontStyle: 'italic', textAlign: 'center', padding: '20px' }}>
                  Aucun membre assigné
                </p>
              ) : (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                  {involvedUsers.map(user => (
                    <div key={user.id} style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'var(--background-secondary)', padding: '8px 14px', borderRadius: '20px' }}>
                      <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: project.color, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '12px', fontWeight: 600 }}>
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p style={{ fontSize: '14px', fontWeight: 500, color: 'var(--foreground)' }}>{user.name}</p>
                        <p style={{ fontSize: '11px', color: 'var(--foreground-muted)' }}>
                          {tasksByUser[user.id] || 0} tâche(s) assignée(s)
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Pied de page */}
            <div className="footer" style={{ marginTop: '40px', paddingTop: '20px', borderTop: '1px solid #e5e7eb', textAlign: 'center', color: '#9ca3af', fontSize: '12px' }}>
              <p>Nexora Agenda - Rapport de Projet</p>
              <p>Généré automatiquement le {formatDate(new Date().toISOString())}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
