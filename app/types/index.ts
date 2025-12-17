export type TaskStatus = 'todo' | 'in_progress' | 'done';
export type ProjectStatus = 'active' | 'completed' | 'on_hold';
export type Priority = 'low' | 'medium' | 'high';
export type CorrectionStatus = 'pending' | 'in_progress' | 'resolved';

export interface Task {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: Priority;
  projectId: string;
  createdAt: string;
  updatedAt: string;
  dueDate?: string;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  status: ProjectStatus;
  color: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProjectWithProgress extends Project {
  tasks: Task[];
  progress: number;
  totalTasks: number;
  completedTasks: number;
}

export interface TeamMember {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: string;
  createdAt: string;
}

export interface Correction {
  id: string;
  projectId: string;
  title: string;
  description: string;
  status: CorrectionStatus;
  priority: Priority;
  assignedTo?: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  dueDate?: string;
  resolvedAt?: string;
}

export type NotificationType = 'project_created' | 'task_created' | 'correction_assigned' | 'task_assigned';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  userId: string;
  read: boolean;
  createdAt: string;
  link?: string;
  projectId?: string;
  taskId?: string;
  correctionId?: string;
}

// Authentication types
export interface User {
  id: string;
  email: string;
  password: string; // hashed
  name: string;
  avatar?: string;
  role: 'admin' | 'user';
  mustChangePassword: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AuthToken {
  id: string;
  userId: string;
  token: string;
  refreshToken: string;
  expiresAt: string; // 30 minutes from creation
  refreshExpiresAt: string; // 7 days from creation
  createdAt: string;
}

export interface AuthResponse {
  user: Omit<User, 'password'>;
  token: string;
  refreshToken: string;
  expiresAt: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  name: string;
}
