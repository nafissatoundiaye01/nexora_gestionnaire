import { supabase } from './supabase';
import { Project, Task, Correction, TeamMember, Notification, User, AuthToken } from '@/app/types';

// ============ Helper functions ============

// Convert snake_case to camelCase
function toCamelCase<T>(obj: Record<string, unknown>): T {
  const result: Record<string, unknown> = {};
  for (const key in obj) {
    const camelKey = key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
    result[camelKey] = obj[key];
  }
  return result as T;
}

// Convert camelCase to snake_case
function toSnakeCase(obj: Record<string, unknown>): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  for (const key in obj) {
    const snakeKey = key.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
    result[snakeKey] = obj[key];
  }
  return result;
}

// Password hashing
export function hashPassword(password: string): string {
  let hash = 0;
  for (let i = 0; i < password.length; i++) {
    const char = password.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  const salt = 'nexora_salt_2024';
  let saltedHash = hash;
  for (let i = 0; i < salt.length; i++) {
    saltedHash = ((saltedHash << 5) - saltedHash) + salt.charCodeAt(i);
    saltedHash = saltedHash & saltedHash;
  }
  return Math.abs(saltedHash).toString(16).padStart(8, '0') +
         Math.abs(hash).toString(16).padStart(8, '0');
}

export function verifyPassword(password: string, hashedPassword: string): boolean {
  return hashPassword(password) === hashedPassword;
}

// ============ Projects ============

export async function getProjects(): Promise<Project[]> {
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching projects:', error);
    return [];
  }

  return (data || []).map(p => toCamelCase<Project>(p));
}

export async function getProject(id: string): Promise<Project | undefined> {
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error fetching project:', error);
    return undefined;
  }

  return data ? toCamelCase<Project>(data) : undefined;
}

export async function createProject(project: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>): Promise<Project> {
  const { data, error } = await supabase
    .from('projects')
    .insert({
      name: project.name,
      description: project.description,
      status: project.status,
      color: project.color,
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating project:', error);
    throw error;
  }

  return toCamelCase<Project>(data);
}

export async function updateProject(id: string, updates: Partial<Omit<Project, 'id' | 'createdAt'>>): Promise<Project | null> {
  const snakeUpdates = toSnakeCase(updates as Record<string, unknown>);
  snakeUpdates.updated_at = new Date().toISOString();

  const { data, error } = await supabase
    .from('projects')
    .update(snakeUpdates)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating project:', error);
    return null;
  }

  return data ? toCamelCase<Project>(data) : null;
}

export async function deleteProject(id: string): Promise<boolean> {
  const { error } = await supabase
    .from('projects')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting project:', error);
    return false;
  }

  return true;
}

// ============ Tasks ============

export async function getTasks(projectId?: string): Promise<Task[]> {
  let query = supabase
    .from('tasks')
    .select('*')
    .order('created_at', { ascending: false });

  if (projectId) {
    query = query.eq('project_id', projectId);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching tasks:', error);
    return [];
  }

  return (data || []).map(t => toCamelCase<Task>(t));
}

export async function getTask(id: string): Promise<Task | undefined> {
  const { data, error } = await supabase
    .from('tasks')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error fetching task:', error);
    return undefined;
  }

  return data ? toCamelCase<Task>(data) : undefined;
}

export async function createTask(task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>): Promise<Task> {
  const { data, error } = await supabase
    .from('tasks')
    .insert({
      title: task.title,
      description: task.description,
      status: task.status,
      priority: task.priority,
      project_id: task.projectId,
      due_date: task.dueDate,
      assigned_to: task.assignedTo,
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating task:', error);
    throw error;
  }

  return toCamelCase<Task>(data);
}

export async function updateTask(id: string, updates: Partial<Omit<Task, 'id' | 'createdAt'>>): Promise<Task | null> {
  const snakeUpdates = toSnakeCase(updates as Record<string, unknown>);
  snakeUpdates.updated_at = new Date().toISOString();

  const { data, error } = await supabase
    .from('tasks')
    .update(snakeUpdates)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating task:', error);
    return null;
  }

  return data ? toCamelCase<Task>(data) : null;
}

export async function deleteTask(id: string): Promise<boolean> {
  const { error } = await supabase
    .from('tasks')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting task:', error);
    return false;
  }

  return true;
}

// ============ Team Members ============

export async function getTeamMembers(): Promise<TeamMember[]> {
  const { data, error } = await supabase
    .from('team_members')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching team members:', error);
    return [];
  }

  return (data || []).map(m => toCamelCase<TeamMember>(m));
}

export async function getTeamMember(id: string): Promise<TeamMember | undefined> {
  const { data, error } = await supabase
    .from('team_members')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error fetching team member:', error);
    return undefined;
  }

  return data ? toCamelCase<TeamMember>(data) : undefined;
}

export async function createTeamMember(member: Omit<TeamMember, 'id' | 'createdAt'>): Promise<TeamMember> {
  const { data, error } = await supabase
    .from('team_members')
    .insert({
      name: member.name,
      email: member.email,
      avatar: member.avatar,
      role: member.role,
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating team member:', error);
    throw error;
  }

  return toCamelCase<TeamMember>(data);
}

export async function updateTeamMember(id: string, updates: Partial<Omit<TeamMember, 'id' | 'createdAt'>>): Promise<TeamMember | null> {
  const snakeUpdates = toSnakeCase(updates as Record<string, unknown>);

  const { data, error } = await supabase
    .from('team_members')
    .update(snakeUpdates)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating team member:', error);
    return null;
  }

  return data ? toCamelCase<TeamMember>(data) : null;
}

export async function deleteTeamMember(id: string): Promise<boolean> {
  const { error } = await supabase
    .from('team_members')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting team member:', error);
    return false;
  }

  return true;
}

// ============ Corrections ============

export async function getCorrections(projectId?: string): Promise<Correction[]> {
  let query = supabase
    .from('corrections')
    .select('*')
    .order('created_at', { ascending: false });

  if (projectId) {
    query = query.eq('project_id', projectId);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching corrections:', error);
    return [];
  }

  return (data || []).map(c => toCamelCase<Correction>(c));
}

export async function getCorrection(id: string): Promise<Correction | undefined> {
  const { data, error } = await supabase
    .from('corrections')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error fetching correction:', error);
    return undefined;
  }

  return data ? toCamelCase<Correction>(data) : undefined;
}

export async function createCorrection(correction: Omit<Correction, 'id' | 'createdAt' | 'updatedAt'>): Promise<Correction> {
  const { data, error } = await supabase
    .from('corrections')
    .insert({
      project_id: correction.projectId,
      title: correction.title,
      description: correction.description,
      status: correction.status,
      priority: correction.priority,
      assigned_to: correction.assignedTo || null,
      created_by: correction.createdBy || null,
      due_date: correction.dueDate || null,
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating correction:', error);
    throw error;
  }

  return toCamelCase<Correction>(data);
}

export async function updateCorrection(id: string, updates: Partial<Omit<Correction, 'id' | 'createdAt'>>): Promise<Correction | null> {
  const snakeUpdates = toSnakeCase(updates as Record<string, unknown>);
  snakeUpdates.updated_at = new Date().toISOString();

  const { data, error } = await supabase
    .from('corrections')
    .update(snakeUpdates)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating correction:', error);
    return null;
  }

  return data ? toCamelCase<Correction>(data) : null;
}

export async function deleteCorrection(id: string): Promise<boolean> {
  const { error } = await supabase
    .from('corrections')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting correction:', error);
    return false;
  }

  return true;
}

// ============ Notifications ============

export async function getNotifications(userId?: string): Promise<Notification[]> {
  let query = supabase
    .from('notifications')
    .select('*')
    .order('created_at', { ascending: false });

  if (userId) {
    query = query.eq('user_id', userId);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching notifications:', error);
    return [];
  }

  return (data || []).map(n => toCamelCase<Notification>(n));
}

export async function getNotification(id: string): Promise<Notification | undefined> {
  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error fetching notification:', error);
    return undefined;
  }

  return data ? toCamelCase<Notification>(data) : undefined;
}

export async function createNotification(notification: Omit<Notification, 'id' | 'createdAt'>): Promise<Notification> {
  const { data, error } = await supabase
    .from('notifications')
    .insert({
      user_id: notification.userId,
      title: notification.title,
      message: notification.message,
      type: notification.type,
      read: notification.read,
      link: notification.link,
      project_id: notification.projectId,
      task_id: notification.taskId,
      correction_id: notification.correctionId,
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating notification:', error);
    throw error;
  }

  return toCamelCase<Notification>(data);
}

export async function updateNotification(id: string, updates: Partial<Omit<Notification, 'id' | 'createdAt'>>): Promise<Notification | null> {
  const snakeUpdates = toSnakeCase(updates as Record<string, unknown>);

  const { data, error } = await supabase
    .from('notifications')
    .update(snakeUpdates)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating notification:', error);
    return null;
  }

  return data ? toCamelCase<Notification>(data) : null;
}

export async function markAllNotificationsAsRead(userId: string): Promise<void> {
  const { error } = await supabase
    .from('notifications')
    .update({ read: true })
    .eq('user_id', userId);

  if (error) {
    console.error('Error marking notifications as read:', error);
  }
}

export async function deleteNotification(id: string): Promise<boolean> {
  const { error } = await supabase
    .from('notifications')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting notification:', error);
    return false;
  }

  return true;
}

// ============ Users ============

export async function getUsers(): Promise<User[]> {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching users:', error);
    return [];
  }

  return (data || []).map(u => toCamelCase<User>(u));
}

export async function getUser(id: string): Promise<User | undefined> {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error fetching user:', error);
    return undefined;
  }

  return data ? toCamelCase<User>(data) : undefined;
}

export async function getUserByEmail(email: string): Promise<User | undefined> {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .ilike('email', email)
    .single();

  if (error) {
    console.error('Error fetching user by email:', error);
    return undefined;
  }

  return data ? toCamelCase<User>(data) : undefined;
}

export async function createUser(user: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): Promise<User> {
  const { data, error } = await supabase
    .from('users')
    .insert({
      email: user.email,
      password: user.password,
      name: user.name,
      avatar: user.avatar,
      role: user.role,
      must_change_password: user.mustChangePassword,
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating user:', error);
    throw error;
  }

  return toCamelCase<User>(data);
}

export async function updateUser(id: string, updates: Partial<Omit<User, 'id' | 'createdAt'>>): Promise<User | null> {
  const snakeUpdates = toSnakeCase(updates as Record<string, unknown>);
  snakeUpdates.updated_at = new Date().toISOString();

  const { data, error } = await supabase
    .from('users')
    .update(snakeUpdates)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating user:', error);
    return null;
  }

  return data ? toCamelCase<User>(data) : null;
}

export async function deleteUser(id: string): Promise<boolean> {
  const { error } = await supabase
    .from('users')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting user:', error);
    return false;
  }

  return true;
}

// ============ Auth Tokens ============

export async function createAuthToken(userId: string): Promise<AuthToken> {
  // Clean up old tokens for this user
  await supabase
    .from('auth_tokens')
    .delete()
    .eq('user_id', userId);

  const now = new Date();
  const expiresAt = new Date(now.getTime() + 30 * 60 * 1000); // 30 minutes
  const refreshExpiresAt = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000); // 7 days

  const token = Date.now().toString(36) + Math.random().toString(36).substr(2);
  const refreshToken = Date.now().toString(36) + Math.random().toString(36).substr(2);

  const { data, error } = await supabase
    .from('auth_tokens')
    .insert({
      user_id: userId,
      token,
      refresh_token: refreshToken,
      expires_at: expiresAt.toISOString(),
      refresh_expires_at: refreshExpiresAt.toISOString(),
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating auth token:', error);
    throw error;
  }

  return toCamelCase<AuthToken>(data);
}

export async function getAuthTokenByToken(token: string): Promise<AuthToken | undefined> {
  const { data, error } = await supabase
    .from('auth_tokens')
    .select('*')
    .eq('token', token)
    .single();

  if (error) {
    console.error('Error fetching auth token:', error);
    return undefined;
  }

  return data ? toCamelCase<AuthToken>(data) : undefined;
}

export async function getAuthTokenByRefreshToken(refreshToken: string): Promise<AuthToken | undefined> {
  const { data, error } = await supabase
    .from('auth_tokens')
    .select('*')
    .eq('refresh_token', refreshToken)
    .single();

  if (error) {
    console.error('Error fetching auth token by refresh token:', error);
    return undefined;
  }

  return data ? toCamelCase<AuthToken>(data) : undefined;
}

export async function getAuthTokenByUserId(userId: string): Promise<AuthToken | undefined> {
  const { data, error } = await supabase
    .from('auth_tokens')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (error) {
    console.error('Error fetching auth token by user id:', error);
    return undefined;
  }

  return data ? toCamelCase<AuthToken>(data) : undefined;
}

export async function refreshAuthToken(refreshToken: string): Promise<AuthToken | null> {
  const existingToken = await getAuthTokenByRefreshToken(refreshToken);

  if (!existingToken) {
    return null;
  }

  if (new Date(existingToken.refreshExpiresAt) < new Date()) {
    await deleteAuthToken(existingToken.userId);
    return null;
  }

  // Create new token
  return createAuthToken(existingToken.userId);
}

export async function validateToken(token: string): Promise<{ valid: boolean; userId?: string; expired?: boolean }> {
  const authToken = await getAuthTokenByToken(token);

  if (!authToken) {
    return { valid: false };
  }

  if (new Date(authToken.expiresAt) < new Date()) {
    return { valid: false, userId: authToken.userId, expired: true };
  }

  return { valid: true, userId: authToken.userId };
}

export async function deleteAuthToken(userId: string): Promise<boolean> {
  const { error } = await supabase
    .from('auth_tokens')
    .delete()
    .eq('user_id', userId);

  if (error) {
    console.error('Error deleting auth token:', error);
    return false;
  }

  return true;
}

export async function cleanExpiredTokens(): Promise<void> {
  const { error } = await supabase
    .from('auth_tokens')
    .delete()
    .lt('refresh_expires_at', new Date().toISOString());

  if (error) {
    console.error('Error cleaning expired tokens:', error);
  }
}
