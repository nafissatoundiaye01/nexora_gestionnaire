'use client';

import { useState, useEffect, useCallback } from 'react';
import { Notification, NotificationType } from '../types';

export function useNotifications(currentUserId?: string) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  const fetchNotifications = useCallback(async () => {
    try {
      const url = currentUserId
        ? `/api/notifications?userId=${currentUserId}`
        : '/api/notifications';
      const res = await fetch(url);
      const data = await res.json();
      setNotifications(data);
    } catch (error) {
      console.error('Erreur lors du chargement des notifications:', error);
    } finally {
      setIsLoaded(true);
    }
  }, [currentUserId]);

  useEffect(() => {
    fetchNotifications();
    // Poll for new notifications every 30 seconds
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  const addNotification = useCallback(async (
    type: NotificationType,
    title: string,
    message: string,
    userId: string,
    options?: {
      projectId?: string;
      taskId?: string;
      correctionId?: string;
      meetingId?: string;
      link?: string;
    }
  ) => {
    try {
      const res = await fetch('/api/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type,
          title,
          message,
          userId,
          read: false,
          ...options,
        }),
      });
      const newNotification = await res.json();

      // Only add to local state if it's for the current user
      if (currentUserId && userId === currentUserId) {
        setNotifications(prev => [newNotification, ...prev]);
      }

      return newNotification;
    } catch (error) {
      console.error('Erreur lors de la création de la notification:', error);
      throw error;
    }
  }, [currentUserId]);

  const notifyAllUsers = useCallback(async (
    type: NotificationType,
    title: string,
    message: string,
    excludeUserId: string,
    teamMemberIds: string[],
    options?: {
      projectId?: string;
      taskId?: string;
      correctionId?: string;
      meetingId?: string;
      link?: string;
    }
  ) => {
    const usersToNotify = teamMemberIds.filter(id => id !== excludeUserId);

    const promises = usersToNotify.map(userId =>
      addNotification(type, title, message, userId, options)
    );

    await Promise.all(promises);
  }, [addNotification]);

  const markAsRead = useCallback(async (id: string) => {
    try {
      await fetch(`/api/notifications/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ read: true }),
      });
      setNotifications(prev =>
        prev.map(n => n.id === id ? { ...n, read: true } : n)
      );
    } catch (error) {
      console.error('Erreur lors de la mise à jour de la notification:', error);
    }
  }, []);

  const markAllAsRead = useCallback(async () => {
    if (!currentUserId) return;

    try {
      await fetch(`/api/notifications?userId=${currentUserId}`, {
        method: 'PUT',
      });
      setNotifications(prev =>
        prev.map(n => ({ ...n, read: true }))
      );
    } catch (error) {
      console.error('Erreur lors de la mise à jour des notifications:', error);
    }
  }, [currentUserId]);

  const deleteNotification = useCallback(async (id: string) => {
    try {
      await fetch(`/api/notifications/${id}`, { method: 'DELETE' });
      setNotifications(prev => prev.filter(n => n.id !== id));
    } catch (error) {
      console.error('Erreur lors de la suppression de la notification:', error);
    }
  }, []);

  const unreadCount = notifications.filter(n => !n.read).length;

  return {
    notifications,
    unreadCount,
    isLoaded,
    addNotification,
    notifyAllUsers,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    refresh: fetchNotifications,
  };
}
