'use client';

import { useState, useEffect, useCallback } from 'react';
import { Meeting } from '../types';

export function useMeetings(userId?: string) {
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  const fetchMeetings = useCallback(async () => {
    try {
      const url = userId ? `/api/meetings?userId=${userId}` : '/api/meetings';
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setMeetings(data);
      }
    } catch (error) {
      console.error('Error fetching meetings:', error);
    } finally {
      setIsLoaded(true);
    }
  }, [userId]);

  useEffect(() => {
    fetchMeetings();
  }, [fetchMeetings]);

  const addMeeting = useCallback(async (meeting: Omit<Meeting, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const res = await fetch('/api/meetings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(meeting),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Erreur lors de la creation de la reunion');
      }

      const newMeeting = await res.json();
      setMeetings(prev => [...prev, newMeeting].sort((a, b) =>
        new Date(a.date).getTime() - new Date(b.date).getTime()
      ));
      return newMeeting;
    } catch (error) {
      console.error('Error creating meeting:', error);
      throw error;
    }
  }, []);

  const updateMeeting = useCallback(async (id: string, updates: Partial<Meeting>) => {
    try {
      const res = await fetch(`/api/meetings/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Erreur lors de la mise a jour de la reunion');
      }

      const updatedMeeting = await res.json();
      setMeetings(prev => prev.map(m => m.id === id ? updatedMeeting : m));
      return updatedMeeting;
    } catch (error) {
      console.error('Error updating meeting:', error);
      throw error;
    }
  }, []);

  const deleteMeeting = useCallback(async (id: string) => {
    try {
      const res = await fetch(`/api/meetings/${id}`, {
        method: 'DELETE',
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Erreur lors de la suppression de la reunion');
      }

      setMeetings(prev => prev.filter(m => m.id !== id));
      return true;
    } catch (error) {
      console.error('Error deleting meeting:', error);
      throw error;
    }
  }, []);

  const getMeetingsByDate = useCallback((date: string) => {
    return meetings.filter(m => m.date === date);
  }, [meetings]);

  const refresh = useCallback(() => {
    fetchMeetings();
  }, [fetchMeetings]);

  return {
    meetings,
    isLoaded,
    addMeeting,
    updateMeeting,
    deleteMeeting,
    getMeetingsByDate,
    refresh,
  };
}
