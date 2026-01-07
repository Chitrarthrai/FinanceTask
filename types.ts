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

export interface Task {
  id: string;
  title: string;
  status: 'todo' | 'in-progress' | 'completed';
  priority: 'low' | 'medium' | 'high';
  dueDate: string;
}

export interface ChartData {
  name: string;
  value: number;
  secondary?: number;
}