'use client';

import { useState, useRef, useEffect } from 'react';
import { Notification } from '../types';

interface NotificationsDropdownProps {
  notifications: Notification[];
  unreadCount: number;
  onMarkAsRead: (id: string) => void;
  onMarkAllAsRead: () => void;
  onDelete: (id: string) => void;
  onViewChange?: (view: 'projects' | 'calendar') => void;
  onSelectProject?: (projectId: string) => void;
}

export default function NotificationsDropdown({
  notifications,
  unreadCount,
  onMarkAsRead,
  onMarkAllAsRead,
  onDelete,
  onViewChange,
  onSelectProject,
}: NotificationsDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 1) return 'À l\'instant';
    if (minutes < 60) return `Il y a ${minutes}m`;
    if (hours < 24) return `Il y a ${hours}h`;
    if (days < 7) return `Il y a ${days}j`;
    return date.toLocaleDateString('fr-FR');
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'project_created':
        return (
          <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center">
            <svg className="w-4 h-4 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
            </svg>
          </div>
        );
      case 'task_created':
      case 'task_assigned':
        return (
          <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center">
            <svg className="w-4 h-4 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
            </svg>
          </div>
        );
      case 'correction_assigned':
        return (
          <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center">
            <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
        );
      default:
        return (
          <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
            <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
          </div>
        );
    }
  };

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.read) {
      onMarkAsRead(notification.id);
    }

    if (notification.projectId && onSelectProject) {
      onSelectProject(notification.projectId);
      if (onViewChange) {
        onViewChange('projects');
      }
    }

    setIsOpen(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="icon-btn relative"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-medium">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div
          className="absolute right-0 mt-2 w-96 rounded-xl shadow-2xl overflow-hidden z-50"
          style={{ backgroundColor: 'var(--background-white)' }}
        >
          {/* Header */}
          <div className="px-4 py-3 border-b flex items-center justify-between" style={{ borderColor: 'var(--border)' }}>
            <h3 className="font-semibold" style={{ color: 'var(--foreground)' }}>
              Notifications
            </h3>
            {unreadCount > 0 && (
              <button
                onClick={onMarkAllAsRead}
                className="text-sm font-medium hover:underline"
                style={{ color: 'var(--primary)' }}
              >
                Tout marquer comme lu
              </button>
            )}
          </div>

          {/* Notifications List */}
          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="px-4 py-8 text-center">
                <svg className="w-12 h-12 mx-auto mb-3 opacity-30" style={{ color: 'var(--foreground-muted)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                <p style={{ color: 'var(--foreground-muted)' }}>Aucune notification</p>
              </div>
            ) : (
              notifications.slice(0, 10).map(notification => (
                <div
                  key={notification.id}
                  onClick={() => handleNotificationClick(notification)}
                  className={`px-4 py-3 border-b cursor-pointer transition-colors hover:bg-opacity-50 ${
                    !notification.read ? 'bg-indigo-50/50' : ''
                  }`}
                  style={{
                    borderColor: 'var(--border-light)',
                    backgroundColor: !notification.read ? 'rgba(99, 102, 241, 0.05)' : undefined,
                  }}
                >
                  <div className="flex gap-3">
                    {getNotificationIcon(notification.type)}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <p
                          className={`text-sm ${!notification.read ? 'font-semibold' : 'font-medium'}`}
                          style={{ color: 'var(--foreground)' }}
                        >
                          {notification.title}
                        </p>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onDelete(notification.id);
                          }}
                          className="ml-2 p-1 rounded hover:bg-gray-100 transition-colors"
                        >
                          <svg className="w-4 h-4" style={{ color: 'var(--foreground-light)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                      <p className="text-sm mt-0.5 line-clamp-2" style={{ color: 'var(--foreground-muted)' }}>
                        {notification.message}
                      </p>
                      <p className="text-xs mt-1" style={{ color: 'var(--foreground-light)' }}>
                        {formatTime(notification.createdAt)}
                      </p>
                    </div>
                    {!notification.read && (
                      <span className="w-2 h-2 bg-indigo-500 rounded-full flex-shrink-0 mt-2" />
                    )}
                  </div>
                </div>
              ))
            )}
          </div>

          {notifications.length > 10 && (
            <div className="px-4 py-3 border-t text-center" style={{ borderColor: 'var(--border)' }}>
              <button
                className="text-sm font-medium"
                style={{ color: 'var(--primary)' }}
              >
                Voir toutes les notifications
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
