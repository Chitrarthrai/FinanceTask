export interface KPIData {
  label: string;
  value: number;
  currency?: boolean;
  trend?: number; // percentage
  icon: 'wallet' | 'trending-up' | 'piggy-bank' | 'alert-circle' | 'credit-card' | 'dollar-sign';
  color: string;
}

export interface Transaction {
  id: string;
  title: string;
  category: string;
  amount: number;
  date: string;
  type: 'expense' | 'income';
  icon?: string;
}

export type TaskStatus = 'todo' | 'in-progress' | 'completed';
export type TaskPriority = 'low' | 'medium' | 'high';

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate: string;
  assignee?: string;
  tags?: string[];
}

export interface ChartData {
  name: string;
  value: number;
  secondary?: number;
  amt?: number;
}

export interface UserProfile {
  name: string;
  email: string;
  avatar: string;
  role: string;
}

export interface BudgetSettings {
  monthlyLimit: number;
  alertThreshold: number; // percentage
  categories: { name: string; limit: number }[];
}