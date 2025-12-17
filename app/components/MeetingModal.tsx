'use client';

import { useState, useEffect } from 'react';
import { Meeting, User } from '../types';

interface MeetingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (meeting: Omit<Meeting, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  meeting?: Meeting | null;
  users: Omit<User, 'password'>[];
  currentUserId: string;
  selectedDate?: string;
}

export default function MeetingModal({
  isOpen,
  onClose,
  onSave,
  meeting,
  users,
  currentUserId,
  selectedDate,
}: MeetingModalProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('');
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('10:00');
  const [location, setLocation] = useState('');
  const [attendees, setAttendees] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (meeting) {
      setTitle(meeting.title);
      setDescription(meeting.description);
      setDate(meeting.date);
      setStartTime(meeting.startTime);
      setEndTime(meeting.endTime);
      setLocation(meeting.location || '');
      setAttendees(meeting.attendees);
    } else {
      setTitle('');
      setDescription('');
      setDate(selectedDate || new Date().toISOString().split('T')[0]);
      setStartTime('09:00');
      setEndTime('10:00');
      setLocation('');
      setAttendees([currentUserId]); // Include creator by default
    }
  }, [meeting, isOpen, selectedDate, currentUserId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !date) return;

    setIsSubmitting(true);
    try {
      await onSave({
        title,
        description,
        date,
        startTime,
        endTime,
        location: location || undefined,
        createdBy: currentUserId,
        attendees,
      });
      onClose();
    } catch (error) {
      console.error('Error saving meeting:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleAttendee = (userId: string) => {
    setAttendees(prev =>
      prev.includes(userId)
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4 animate-fade-in">
      <div
        className="rounded-2xl shadow-xl max-w-lg w-full animate-slide-in max-h-[90vh] overflow-y-auto"
        style={{ backgroundColor: 'var(--background-white)' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b" style={{ borderColor: 'var(--border)' }}>
          <h2 className="text-xl font-semibold" style={{ color: 'var(--foreground)' }}>
            {meeting ? 'Modifier la reunion' : 'Nouvelle reunion'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg transition-all"
            style={{ color: 'var(--foreground-muted)' }}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-5">
            {/* Title */}
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--foreground-muted)' }}>
                Titre *
              </label>
              <input
                type="text"
                value={title}
                onChange={e => setTitle(e.target.value)}
                className="input"
                placeholder="Titre de la reunion"
                required
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--foreground-muted)' }}>
                Description
              </label>
              <textarea
                value={description}
                onChange={e => setDescription(e.target.value)}
                className="input resize-none"
                rows={3}
                placeholder="Description de la reunion..."
              />
            </div>

            {/* Date */}
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--foreground-muted)' }}>
                Date *
              </label>
              <input
                type="date"
                value={date}
                onChange={e => setDate(e.target.value)}
                className="input"
                required
              />
            </div>

            {/* Time */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--foreground-muted)' }}>
                  Heure de debut *
                </label>
                <input
                  type="time"
                  value={startTime}
                  onChange={e => setStartTime(e.target.value)}
                  className="input"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--foreground-muted)' }}>
                  Heure de fin *
                </label>
                <input
                  type="time"
                  value={endTime}
                  onChange={e => setEndTime(e.target.value)}
                  className="input"
                  required
                />
              </div>
            </div>

            {/* Location */}
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--foreground-muted)' }}>
                Lieu
              </label>
              <input
                type="text"
                value={location}
                onChange={e => setLocation(e.target.value)}
                className="input"
                placeholder="Salle de reunion, lien visio..."
              />
            </div>

            {/* Attendees */}
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--foreground-muted)' }}>
                Participants ({attendees.length} selectionnes)
              </label>
              <div
                className="border rounded-lg p-3 max-h-48 overflow-y-auto"
                style={{ borderColor: 'var(--border)', backgroundColor: 'var(--background-secondary)' }}
              >
                {users.map(user => (
                  <label
                    key={user.id}
                    className="flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-colors hover:bg-opacity-50"
                    style={{ backgroundColor: attendees.includes(user.id) ? 'var(--primary-bg)' : 'transparent' }}
                  >
                    <input
                      type="checkbox"
                      checked={attendees.includes(user.id)}
                      onChange={() => toggleAttendee(user.id)}
                      className="w-4 h-4 rounded"
                    />
                    <div className="flex items-center gap-2">
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-medium"
                        style={{ backgroundColor: 'var(--primary)' }}
                      >
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm font-medium" style={{ color: 'var(--foreground)' }}>
                          {user.name} {user.id === currentUserId && '(Moi)'}
                        </p>
                        <p className="text-xs" style={{ color: 'var(--foreground-muted)' }}>
                          {user.email}
                        </p>
                      </div>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex gap-3 mt-8">
            <button
              type="button"
              onClick={onClose}
              className="btn btn-secondary flex-1"
              disabled={isSubmitting}
            >
              Annuler
            </button>
            <button
              type="submit"
              className="btn btn-primary flex-1"
              disabled={isSubmitting || !title.trim() || !date || attendees.length === 0}
            >
              {isSubmitting ? 'Enregistrement...' : meeting ? 'Enregistrer' : 'Creer la reunion'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
