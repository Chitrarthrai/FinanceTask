import { KPIData, Transaction, Task, ChartData } from "./types";

export const KPI_MOCK_DATA: KPIData[] = [
  {
    label: "Monthly Salary",
    value: 5400,
    currency: true,
    trend: 2.5,
    icon: "wallet",
    color: "emerald",
  },
  {
    label: "Total Expenses",
    value: 3240,
    currency: true,
    trend: -12.4,
    icon: "credit-card",
    color: "rose",
  },
  {
    label: "Total Savings",
    value: 1250,
    currency: true,
    trend: 8.1,
    icon: "piggy-bank",
    color: "blue",
  },
  {
    label: "Daily Pocket Money",
    value: 45,
    currency: true,
    trend: 0,
    icon: "dollar-sign",
    color: "brand",
  },
  {
    label: "Emergency Fund",
    value: 12000,
    currency: true,
    trend: 5.0,
    icon: "alert-circle",
    color: "amber",
  },
  {
    label: "Investments",
    value: 8500,
    currency: true,
    trend: 15.3,
    icon: "trending-up",
    color: "indigo",
  },
];

export const RECENT_TRANSACTIONS: Transaction[] = [
  {
    id: "1",
    title: "Grocery Shopping",
    category: "Food",
    amount: 124.5,
    date: "Today, 10:30 AM",
    type: "expense",
  },
  {
    id: "2",
    title: "Freelance Project",
    category: "Income",
    amount: 850.0,
    date: "Yesterday, 2:15 PM",
    type: "income",
  },
  {
    id: "3",
    title: "Netflix Subscription",
    category: "Entertainment",
    amount: 15.99,
    date: "Aug 24, 2024",
    type: "expense",
  },
  {
    id: "4",
    title: "Gas Station",
    category: "Transport",
    amount: 45.0,
    date: "Aug 23, 2024",
    type: "expense",
  },
];

export const UPCOMING_TASKS: Task[] = [
  {
    id: "1",
    title: "Review Monthly Budget",
    status: "todo",
    priority: "high",
    dueDate: "Today",
  },
  {
    id: "2",
    title: "Pay Electricity Bill",
    status: "in-progress",
    priority: "medium",
    dueDate: "Tomorrow",
  },
  {
    id: "3",
    title: "Call Insurance Agent",
    status: "todo",
    priority: "low",
    dueDate: "Aug 28",
  },
];

export const ALL_TASKS: Task[] = [
  {
    id: "t1",
    title: "Review Monthly Budget",
    description: "Analyze spending patterns for the last month.",
    status: "todo",
    priority: "high",
    dueDate: "Today",
    tags: ["Finance"],
  },
  {
    id: "t2",
    title: "Pay Electricity Bill",
    description: "Utility bill for August.",
    status: "in-progress",
    priority: "medium",
    dueDate: "Tomorrow",
    tags: ["Utilities"],
  },
  {
    id: "t3",
    title: "Call Insurance Agent",
    description: "Discuss renewal options for car insurance.",
    status: "todo",
    priority: "low",
    dueDate: "Aug 28",
    tags: ["Personal"],
  },
  {
    id: "t4",
    title: "Update Portfolio",
    description: "Rebalance stock investments.",
    status: "completed",
    priority: "high",
    dueDate: "Aug 20",
    tags: ["Investments"],
  },
  {
    id: "t5",
    title: "Cancel Gym Membership",
    description: "Not using it enough.",
    status: "todo",
    priority: "low",
    dueDate: "Sep 1",
    tags: ["Health"],
  },
  {
    id: "t6",
    title: "File Taxes",
    description: "Quarterly filing due.",
    status: "in-progress",
    priority: "high",
    dueDate: "Sep 15",
    tags: ["Finance", "Legal"],
  },
];

export const SPENDING_DATA: ChartData[] = [
  { name: "Mon", value: 120, secondary: 150 },
  { name: "Tue", value: 200, secondary: 180 },
  { name: "Wed", value: 150, secondary: 160 },
  { name: "Thu", value: 80, secondary: 140 },
  { name: "Fri", value: 250, secondary: 200 },
  { name: "Sat", value: 300, secondary: 250 },
  { name: "Sun", value: 180, secondary: 190 },
];

export const EXPENSE_CATEGORIES_DATA: ChartData[] = [
  { name: "Housing", value: 35 },
  { name: "Food", value: 25 },
  { name: "Transport", value: 15 },
  { name: "Ent.", value: 10 },
  { name: "Others", value: 15 },
];

export const MONTHLY_COMPARISON_DATA: ChartData[] = [
  { name: "Jan", value: 4000, secondary: 2400 },
  { name: "Feb", value: 3000, secondary: 1398 },
  { name: "Mar", value: 2000, secondary: 9800 },
  { name: "Apr", value: 2780, secondary: 3908 },
  { name: "May", value: 1890, secondary: 4800 },
  { name: "Jun", value: 2390, secondary: 3800 },
  { name: "Jul", value: 3490, secondary: 4300 },
  { name: "Aug", value: 4200, secondary: 2400 },
];

export const COLORS = ["#f97316", "#14b8a6", "#3b82f6", "#f43f5e", "#8b5cf6"];
