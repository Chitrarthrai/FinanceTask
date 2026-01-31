export interface KPIData {
  label: string;
  value: number;
  currency?: boolean;
  trend?: number; // percentage
  icon:
    | "wallet"
    | "trending-up"
    | "piggy-bank"
    | "alert-circle"
    | "credit-card"
    | "dollar-sign";
  color: string;
}

export interface Transaction {
  id: string;
  title: string;
  category: string;
  receipt_url?: string;
  amount: number;
  date: string;
  type: "expense" | "income";
  icon?: string;
  paymentMethod?: string; // Added
}

export type TaskStatus = "todo" | "in-progress" | "completed";
export type TaskPriority = "low" | "medium" | "high";

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate: string;
  assignee?: string;
  tags?: string[];
  recurring?: boolean;
  category?: string; // Added
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

export interface ExpenseItem {
  id: string;
  name: string;
  amount: number;
}

export interface Category {
  id: string;
  name: string;
  type: "fixed" | "variable" | "pocket" | "income";
  color: string;
  icon?: string;
  budgetLimit?: number;
}

export interface BudgetSettings {
  id?: string; // Added for DB ID
  monthlySalary: number;
  savingsTarget: number; // Calculated amount
  savingsTargetPercent: number; // Added for user input
  fixedExpenses: ExpenseItem[];
  variableExpenses: ExpenseItem[];
  emergencyFund: number; // Simplified to number
}

export interface FinancialMetrics {
  totalIncome: number;
  totalFixedExpenses: number;
  totalVariableExpenses: number;
  totalSavings: number;
  pocketMoneyPool: number;
  dailyLimit: number;
  spentToday: number;
  remainingToday: number;
  daysRemaining: number;
  budgetHealth: "Healthy" | "At Risk" | "Critical";
  savingsTrend?: number; // Month-over-month percentage change
}

// Analytics Types
export interface MonthlyMetrics {
  total_income: number;
  total_expenses: number;
  net_savings: number;
}

export interface CategoryDistribution {
  name: string;
  value: number;
  color: string;
}

export interface SpendingTrend {
  day_label: string;
  amount: number;
}

// Notes Types
export type NoteColor =
  | "default"
  | "red"
  | "orange"
  | "yellow"
  | "green"
  | "blue"
  | "purple";

export interface ExtractedTask {
  title: string;
  priority: TaskPriority;
  dueDate?: string;
  assignee?: string;
}

export interface Note {
  id: string;
  userId?: string;
  taskId?: string; // Optional link to task
  title: string;
  content: string;
  summary?: string; // AI-generated summary
  tags: string[];
  extractedTasks: ExtractedTask[];
  isPinned: boolean;
  color: NoteColor;
  createdAt: string;
  updatedAt: string;
  // Virtual field for linked task info
  linkedTask?: Task;
}
