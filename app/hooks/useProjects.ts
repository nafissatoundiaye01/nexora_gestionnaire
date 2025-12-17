'use client';

import { useState, useEffect, useCallback } from 'react';
import { Project, Task, ProjectWithProgress } from '../types';

export function useProjects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Charger les données depuis l'API
  const fetchData = useCallback(async () => {
    try {
      const [projectsRes, tasksRes] = await Promise.all([
        fetch('/api/projects'),
        fetch('/api/tasks'),
      ]);
      const projectsData = await projectsRes.json();
      const tasksData = await tasksRes.json();
      setProjects(projectsData);
      setTasks(tasksData);
    } catch (error) {
      console.error('Erreur lors du chargement des données:', error);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // CRUD Projets
  const addProject = useCallback(async (project: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const res = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(project),
      });
      const newProject = await res.json();
      setProjects(prev => [...prev, newProject]);
      return newProject;
    } catch (error) {
      console.error('Erreur lors de la création du projet:', error);
      throw error;
    }
  }, []);

  const updateProject = useCallback(async (id: string, updates: Partial<Omit<Project, 'id' | 'createdAt'>>) => {
    try {
      const res = await fetch(`/api/projects/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      const updatedProject = await res.json();
      setProjects(prev => prev.map(p => p.id === id ? updatedProject : p));
      return updatedProject;
    } catch (error) {
      console.error('Erreur lors de la mise à jour du projet:', error);
      throw error;
    }
  }, []);

  const deleteProject = useCallback(async (id: string) => {
    try {
      await fetch(`/api/projects/${id}`, { method: 'DELETE' });
      setProjects(prev => prev.filter(p => p.id !== id));
      setTasks(prev => prev.filter(t => t.projectId !== id));
    } catch (error) {
      console.error('Erreur lors de la suppression du projet:', error);
      throw error;
    }
  }, []);

  // CRUD Tâches
  const addTask = useCallback(async (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const res = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(task),
      });
      const newTask = await res.json();
      setTasks(prev => [...prev, newTask]);
      return newTask;
    } catch (error) {
      console.error('Erreur lors de la création de la tâche:', error);
      throw error;
    }
  }, []);

  const updateTask = useCallback(async (id: string, updates: Partial<Omit<Task, 'id' | 'createdAt'>>) => {
    try {
      const res = await fetch(`/api/tasks/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      const updatedTask = await res.json();
      setTasks(prev => prev.map(t => t.id === id ? updatedTask : t));
      return updatedTask;
    } catch (error) {
      console.error('Erreur lors de la mise à jour de la tâche:', error);
      throw error;
    }
  }, []);

  const deleteTask = useCallback(async (id: string) => {
    try {
      await fetch(`/api/tasks/${id}`, { method: 'DELETE' });
      setTasks(prev => prev.filter(t => t.id !== id));
    } catch (error) {
      console.error('Erreur lors de la suppression de la tâche:', error);
      throw error;
    }
  }, []);

  // Rafraîchir les données
  const refresh = useCallback(() => {
    fetchData();
  }, [fetchData]);

  // Obtenir les tâches d'un projet
  const getProjectTasks = useCallback((projectId: string) => {
    return tasks.filter(t => t.projectId === projectId);
  }, [tasks]);

  // Calculer le progrès d'un projet
  const getProjectProgress = useCallback((projectId: string): number => {
    const projectTasks = getProjectTasks(projectId);
    if (projectTasks.length === 0) return 0;
    const completedTasks = projectTasks.filter(t => t.status === 'done').length;
    return Math.round((completedTasks / projectTasks.length) * 100);
  }, [getProjectTasks]);

  // Obtenir les projets avec leur progression
  const getProjectsWithProgress = useCallback((): ProjectWithProgress[] => {
    return projects.map(project => {
      const projectTasks = getProjectTasks(project.id);
      const completedTasks = projectTasks.filter(t => t.status === 'done').length;
      return {
        ...project,
        tasks: projectTasks,
        progress: projectTasks.length > 0 ? Math.round((completedTasks / projectTasks.length) * 100) : 0,
        totalTasks: projectTasks.length,
        completedTasks,
      };
    });
  }, [projects, getProjectTasks]);

  return {
    projects,
    tasks,
    isLoaded,
    addProject,
    updateProject,
    deleteProject,
    addTask,
    updateTask,
    deleteTask,
    getProjectTasks,
    getProjectProgress,
    getProjectsWithProgress,
    refresh,
  };
}
