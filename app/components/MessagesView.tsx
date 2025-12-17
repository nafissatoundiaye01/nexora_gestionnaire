'use client';

import { useState } from 'react';
import { TeamMember } from '../types';

interface Message {
  id: string;
  senderId: string;
  content: string;
  timestamp: Date;
  read: boolean;
}

interface Conversation {
  id: string;
  participants: string[];
  lastMessage: Message;
  unreadCount: number;
}

interface MessagesViewProps {
  teamMembers: TeamMember[];
}

export default function MessagesView({ teamMembers }: MessagesViewProps) {
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // Sample conversations for demo
  const [conversations] = useState<Conversation[]>([
    {
      id: '1',
      participants: ['user', teamMembers[0]?.id || '1'],
      lastMessage: {
        id: 'm1',
        senderId: teamMembers[0]?.id || '1',
        content: 'Salut! Comment avance le projet?',
        timestamp: new Date(Date.now() - 1000 * 60 * 5),
        read: false,
      },
      unreadCount: 2,
    },
    {
      id: '2',
      participants: ['user', teamMembers[1]?.id || '2'],
      lastMessage: {
        id: 'm2',
        senderId: 'user',
        content: 'J\'ai terminé la tâche de design',
        timestamp: new Date(Date.now() - 1000 * 60 * 60),
        read: true,
      },
      unreadCount: 0,
    },
  ]);

  const [messages] = useState<Record<string, Message[]>>({
    '1': [
      {
        id: 'm1-1',
        senderId: teamMembers[0]?.id || '1',
        content: 'Bonjour!',
        timestamp: new Date(Date.now() - 1000 * 60 * 30),
        read: true,
      },
      {
        id: 'm1-2',
        senderId: 'user',
        content: 'Salut! Tout va bien?',
        timestamp: new Date(Date.now() - 1000 * 60 * 25),
        read: true,
      },
      {
        id: 'm1-3',
        senderId: teamMembers[0]?.id || '1',
        content: 'Oui, je travaille sur le nouveau module.',
        timestamp: new Date(Date.now() - 1000 * 60 * 10),
        read: true,
      },
      {
        id: 'm1-4',
        senderId: teamMembers[0]?.id || '1',
        content: 'Salut! Comment avance le projet?',
        timestamp: new Date(Date.now() - 1000 * 60 * 5),
        read: false,
      },
    ],
    '2': [
      {
        id: 'm2-1',
        senderId: teamMembers[1]?.id || '2',
        content: 'Tu peux me donner un update sur le design?',
        timestamp: new Date(Date.now() - 1000 * 60 * 120),
        read: true,
      },
      {
        id: 'm2-2',
        senderId: 'user',
        content: 'J\'ai terminé la tâche de design',
        timestamp: new Date(Date.now() - 1000 * 60 * 60),
        read: true,
      },
    ],
  });

  const getMemberById = (id: string) => {
    return teamMembers.find(m => m.id === id);
  };

  const getOtherParticipant = (conversation: Conversation) => {
    const otherId = conversation.participants.find(p => p !== 'user');
    return getMemberById(otherId || '');
  };

  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 1) return 'À l\'instant';
    if (minutes < 60) return `${minutes}m`;
    if (hours < 24) return `${hours}h`;
    if (days < 7) return `${days}j`;
    return date.toLocaleDateString('fr-FR');
  };

  const handleSendMessage = () => {
    if (!newMessage.trim() || !selectedConversation) return;
    // In a real app, this would send the message to the server
    setNewMessage('');
  };

  const filteredConversations = conversations.filter(conv => {
    const member = getOtherParticipant(conv);
    return member?.name.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const totalUnread = conversations.reduce((acc, conv) => acc + conv.unreadCount, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--foreground)' }}>Messages</h1>
          <p className="mt-1" style={{ color: 'var(--foreground-muted)' }}>
            Communiquez avec votre équipe
          </p>
        </div>
        {totalUnread > 0 && (
          <span className="px-3 py-1 rounded-full text-sm font-medium bg-indigo-100 text-indigo-700">
            {totalUnread} non lu{totalUnread > 1 ? 's' : ''}
          </span>
        )}
      </div>

      <div className="card overflow-hidden" style={{ height: 'calc(100vh - 220px)' }}>
        <div className="flex h-full">
          {/* Conversations List */}
          <div className="w-80 border-r flex flex-col" style={{ borderColor: 'var(--border)' }}>
            {/* Search */}
            <div className="p-4 border-b" style={{ borderColor: 'var(--border)' }}>
              <div className="relative">
                <svg
                  className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2"
                  style={{ color: 'var(--foreground-light)' }}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  placeholder="Rechercher..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 rounded-lg"
                  style={{
                    backgroundColor: 'var(--background-secondary)',
                    color: 'var(--foreground)',
                    border: '1px solid var(--border)',
                  }}
                />
              </div>
            </div>

            {/* Conversations */}
            <div className="flex-1 overflow-y-auto">
              {filteredConversations.length === 0 ? (
                <div className="p-4 text-center">
                  <p style={{ color: 'var(--foreground-muted)' }}>Aucune conversation</p>
                </div>
              ) : (
                filteredConversations.map(conv => {
                  const member = getOtherParticipant(conv);
                  const isSelected = selectedConversation === conv.id;

                  return (
                    <div
                      key={conv.id}
                      onClick={() => setSelectedConversation(conv.id)}
                      className={`p-4 cursor-pointer transition-colors border-b ${
                        isSelected ? '' : 'hover:bg-opacity-50'
                      }`}
                      style={{
                        backgroundColor: isSelected ? 'var(--primary-bg)' : 'transparent',
                        borderColor: 'var(--border-light)',
                      }}
                    >
                      <div className="flex items-start gap-3">
                        <div
                          className="w-10 h-10 rounded-full flex items-center justify-center text-white font-medium flex-shrink-0"
                          style={{ backgroundColor: member?.avatar || '#6366f1' }}
                        >
                          {member?.name.charAt(0).toUpperCase() || '?'}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <span className="font-medium truncate" style={{ color: 'var(--foreground)' }}>
                              {member?.name || 'Utilisateur'}
                            </span>
                            <span className="text-xs" style={{ color: 'var(--foreground-light)' }}>
                              {formatTime(conv.lastMessage.timestamp)}
                            </span>
                          </div>
                          <div className="flex items-center justify-between mt-1">
                            <p
                              className="text-sm truncate"
                              style={{
                                color: conv.unreadCount > 0 ? 'var(--foreground)' : 'var(--foreground-muted)',
                                fontWeight: conv.unreadCount > 0 ? 500 : 400,
                              }}
                            >
                              {conv.lastMessage.senderId === 'user' ? 'Vous: ' : ''}
                              {conv.lastMessage.content}
                            </p>
                            {conv.unreadCount > 0 && (
                              <span className="w-5 h-5 rounded-full bg-indigo-500 text-white text-xs flex items-center justify-center flex-shrink-0">
                                {conv.unreadCount}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Chat Area */}
          <div className="flex-1 flex flex-col">
            {selectedConversation ? (
              <>
                {/* Chat Header */}
                <div className="p-4 border-b flex items-center gap-3" style={{ borderColor: 'var(--border)' }}>
                  {(() => {
                    const conv = conversations.find(c => c.id === selectedConversation);
                    const member = conv ? getOtherParticipant(conv) : null;
                    return (
                      <>
                        <div
                          className="w-10 h-10 rounded-full flex items-center justify-center text-white font-medium"
                          style={{ backgroundColor: member?.avatar || '#6366f1' }}
                        >
                          {member?.name.charAt(0).toUpperCase() || '?'}
                        </div>
                        <div>
                          <h3 className="font-medium" style={{ color: 'var(--foreground)' }}>
                            {member?.name || 'Utilisateur'}
                          </h3>
                          <p className="text-xs" style={{ color: 'var(--foreground-muted)' }}>
                            {member?.role || 'Membre'}
                          </p>
                        </div>
                      </>
                    );
                  })()}
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {messages[selectedConversation]?.map(msg => {
                    const isOwn = msg.senderId === 'user';
                    return (
                      <div
                        key={msg.id}
                        className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl ${
                            isOwn ? 'rounded-br-md' : 'rounded-bl-md'
                          }`}
                          style={{
                            backgroundColor: isOwn ? 'var(--primary)' : 'var(--background-secondary)',
                            color: isOwn ? 'white' : 'var(--foreground)',
                          }}
                        >
                          <p>{msg.content}</p>
                          <p
                            className={`text-xs mt-1 ${isOwn ? 'text-white/70' : ''}`}
                            style={{ color: isOwn ? undefined : 'var(--foreground-light)' }}
                          >
                            {formatTime(msg.timestamp)}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Message Input */}
                <div className="p-4 border-t" style={{ borderColor: 'var(--border)' }}>
                  <div className="flex items-center gap-3">
                    <button className="icon-btn">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                      </svg>
                    </button>
                    <input
                      type="text"
                      placeholder="Écrivez votre message..."
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                      className="flex-1 px-4 py-2 rounded-lg"
                      style={{
                        backgroundColor: 'var(--background-secondary)',
                        color: 'var(--foreground)',
                        border: '1px solid var(--border)',
                      }}
                    />
                    <button
                      onClick={handleSendMessage}
                      disabled={!newMessage.trim()}
                      className="btn btn-primary !px-4"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                      </svg>
                    </button>
                  </div>
                </div>
              </>
            ) : (
              /* No conversation selected */
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                  <div className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6" style={{ background: 'var(--primary-bg)' }}>
                    <svg className="w-10 h-10" style={{ color: 'var(--primary)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold mb-2" style={{ color: 'var(--foreground)' }}>
                    Vos messages
                  </h3>
                  <p style={{ color: 'var(--foreground-muted)' }}>
                    Sélectionnez une conversation pour commencer
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
