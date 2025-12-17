'use client';

import { useState, useEffect, useCallback } from 'react';
import { Correction, TeamMember } from '../types';

export function useCorrections() {
  const [corrections, setCorrections] = useState<Correction[]>([]);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const [correctionsRes, membersRes] = await Promise.all([
        fetch('/api/corrections'),
        fetch('/api/team-members'),
      ]);
      const correctionsData = await correctionsRes.json();
      const membersData = await membersRes.json();
      setCorrections(correctionsData);
      setTeamMembers(membersData);
    } catch (error) {
      console.error('Erreur lors du chargement des corrections:', error);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const addCorrection = useCallback(async (correction: Omit<Correction, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const res = await fetch('/api/corrections', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(correction),
      });
      const newCorrection = await res.json();
      setCorrections(prev => [...prev, newCorrection]);
      return newCorrection;
    } catch (error) {
      console.error('Erreur lors de la creation de la correction:', error);
      throw error;
    }
  }, []);

  const updateCorrection = useCallback(async (id: string, updates: Partial<Omit<Correction, 'id' | 'createdAt'>>) => {
    try {
      const res = await fetch(`/api/corrections/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      const updatedCorrection = await res.json();
      setCorrections(prev => prev.map(c => c.id === id ? updatedCorrection : c));
      return updatedCorrection;
    } catch (error) {
      console.error('Erreur lors de la mise a jour de la correction:', error);
      throw error;
    }
  }, []);

  const deleteCorrection = useCallback(async (id: string) => {
    try {
      await fetch(`/api/corrections/${id}`, { method: 'DELETE' });
      setCorrections(prev => prev.filter(c => c.id !== id));
    } catch (error) {
      console.error('Erreur lors de la suppression de la correction:', error);
      throw error;
    }
  }, []);

  const getProjectCorrections = useCallback((projectId: string) => {
    return corrections.filter(c => c.projectId === projectId);
  }, [corrections]);

  const getMemberById = useCallback((memberId: string) => {
    return teamMembers.find(m => m.id === memberId);
  }, [teamMembers]);

  const refresh = useCallback(() => {
    fetchData();
  }, [fetchData]);

  return {
    corrections,
    teamMembers,
    isLoaded,
    addCorrection,
    updateCorrection,
    deleteCorrection,
    getProjectCorrections,
    getMemberById,
    refresh,
  };
}
