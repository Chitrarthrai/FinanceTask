import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
} from "react";
import {
  Transaction,
  Task,
  TaskStatus,
  BudgetSettings,
  Category,
  FinancialMetrics,
  MonthlyMetrics,
  CategoryDistribution,
  SpendingTrend,
  Note,
} from "../types";
import { supabase } from "../lib/supabase";
import { useAuth } from "./AuthContext";
import { User } from "@supabase/supabase-js";

interface DataContextType {
  transactions: Transaction[];
  tasks: Task[];
  notes: Note[];
  budgetSettings: BudgetSettings;
  categories: Category[];
  metrics: FinancialMetrics;
  addTransaction: (transaction: Transaction) => Promise<void>;
  updateTransaction: (transaction: Transaction) => Promise<void>;
  addTask: (task: Task) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  updateTaskStatus: (id: string, status: TaskStatus) => Promise<void>;
  updateBudgetSettings: (settings: Partial<BudgetSettings>) => Promise<void>;
  addCategory: (
    name: string,
    type: "income" | "expense",
    color: string,
  ) => Promise<void>;
  updateCategory: (id: string, name: string) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;
  addRecurringRule: (rule: any) => Promise<void>;
  // Notes operations
  addNote: (note: Partial<Note>) => Promise<void>;
  updateNote: (note: Partial<Note>) => Promise<void>;
  deleteNote: (id: string) => Promise<void>;
  pinNote: (id: string, isPinned: boolean) => Promise<void>;
  refreshData: () => Promise<void>;
  getAnalyticsData: (month: string) => Promise<{
    metrics: MonthlyMetrics | null;
    distribution: CategoryDistribution[];
    trend: SpendingTrend[];
  }>;
  getSmartInsights: (month: string) => Promise<any[]>;
  user: User | null;
  navPosition: "bottom" | "top" | "left" | "right";
  setNavPosition: (position: "bottom" | "top" | "left" | "right") => void;
  isNavHidden: boolean;
  setIsNavHidden: (hidden: boolean) => void;
  isNavCollapsed: boolean;
  setIsNavCollapsed: (collapsed: boolean) => void;
}

const defaultBudgetSettings: BudgetSettings = {
  id: "",
  monthlySalary: 0,
  savingsTarget: 0,
  savingsTargetPercent: 20,
  fixedExpenses: [],
  variableExpenses: [],
  emergencyFund: 0,
};

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [budgetSettings, setBudgetSettings] = useState<BudgetSettings>(
    defaultBudgetSettings,
  );
  const [categories, setCategories] = useState<Category[]>([]);
  const [navPosition, setNavPosition] = useState<
    "bottom" | "top" | "left" | "right"
  >("bottom");
  const [isNavHidden, setIsNavHidden] = useState(false);
  const [isNavCollapsed, setIsNavCollapsed] = useState(false);

  // Derived Metrics State
  const [metrics, setMetrics] = useState<FinancialMetrics>({
    totalIncome: 0,
    totalFixedExpenses: 0,
    totalVariableExpenses: 0,
    totalSavings: 0,
    pocketMoneyPool: 0,
    dailyLimit: 0,
    spentToday: 0,
    remainingToday: 0,
    daysRemaining: 0,
    budgetHealth: "Healthy",
  });

  const fetchData = async () => {
    if (!user) return;

    try {
      // 1. Fetch Budget Settings
      const { data: budgetData } = await supabase
        .from("budget_settings")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      if (budgetData) {
        setBudgetSettings({
          id: budgetData.id,
          monthlySalary: Number(budgetData.monthly_salary),
          savingsTarget: 0,
          savingsTargetPercent: Number(budgetData.savings_target_percent),
          fixedExpenses: budgetData.fixed_expenses || [],
          variableExpenses: budgetData.variable_expenses || [],
          emergencyFund: Number(budgetData.emergency_fund_amount),
        });
      } else {
        const { data: newBudget } = await supabase
          .from("budget_settings")
          .insert({
            user_id: user.id,
            monthly_salary: 0,
            fixed_expenses: [],
            variable_expenses: [],
          })
          .select()
          .single();

        if (newBudget) {
          setBudgetSettings({
            id: newBudget.id,
            monthlySalary: 0,
            savingsTarget: 0,
            savingsTargetPercent: 20,
            fixedExpenses: [],
            variableExpenses: [],
            emergencyFund: 0,
          });
        }
      }

      // 2. Fetch Categories
      const { data: catData } = await supabase
        .from("categories")
        .select("*")
        .eq("user_id", user.id);

      if (catData && catData.length > 0) {
        setCategories(
          catData.map((c) => ({
            id: c.id,
            name: c.name,
            type: c.type as any,
            color: c.color,
            icon: c.icon,
            budgetedAmount: 0,
          })),
        );
      } else {
        const defaults = [
          {
            name: "Food",
            type: "variable",
            color: "var(--chart-4)",
            icon: "Coffee",
          },
          {
            name: "Transport",
            type: "variable",
            color: "var(--chart-1)",
            icon: "Car",
          },
          {
            name: "Housing",
            type: "fixed",
            color: "var(--chart-2)",
            icon: "Home",
          },
          {
            name: "Income",
            type: "income",
            color: "var(--chart-5)",
            icon: "DollarSign",
          },
        ];
        // In mobile we might want to ensure these exist too, but for now we skip auto-create to safe bandwidth
      }

      // 3. Fetch Transactions
      const { data: transData } = await supabase
        .from("transactions")
        .select("*")
        .eq("user_id", user.id)
        .order("date", { ascending: false });

      if (transData) {
        setTransactions(
          transData.map((t) => ({
            id: t.id,
            title: t.title,
            amount: Number(t.amount),
            type: t.type as any,
            category: t.category,
            date: t.date, // Pass raw date string
            paymentMethod: t.payment_method,
            receipt_url: t.receipt_url,
          })),
        );
      }

      // 4. Fetch Tasks
      const { data: taskData } = await supabase
        .from("tasks")
        .select("*")
        .eq("user_id", user.id)
        .order("due_date", { ascending: true });

      if (taskData) {
        // Helper to normalize status
        const normalizeStatus = (s: string): TaskStatus => {
          const lower = s.toLowerCase();
          if (lower === "in_progress" || lower === "in progress")
            return "in-progress";
          return lower as TaskStatus;
        };

        setTasks(
          taskData.map((t) => ({
            id: t.id,
            title: t.title,
            description: t.description || "",
            status: normalizeStatus(t.status),
            priority: t.priority as any,
            dueDate: t.due_date || "", // Pass raw date string
            recurring: t.recurring,
            tags: t.tags || [],
            category: t.category || "Personal",
          })),
        );
      }

      // 5. Fetch Global Metrics for Sidebar (Current Month)
      const dateForMetrics = new Date();
      const monthStr = `${dateForMetrics.getFullYear()}-${String(
        dateForMetrics.getMonth() + 1,
      ).padStart(2, "0")}-01`;

      const { data: metricsData } = await supabase.rpc("get_monthly_metrics", {
        month_str: monthStr,
      });

      if (metricsData && metricsData.length > 0) {
        // We could merge this with calculated metrics if needed, but for now we use local calculation overriding
        // actually local calculation is better for instant updates on transaction add
      }

      // 6. Fetch Notes
      const { data: notesData } = await supabase
        .from("notes")
        .select("*")
        .eq("user_id", user.id)
        .order("is_pinned", { ascending: false })
        .order("updated_at", { ascending: false });

      if (notesData) {
        setNotes(
          notesData.map((n) => ({
            id: n.id,
            userId: n.user_id,
            taskId: n.task_id,
            title: n.title || "",
            content: n.content || "",
            summary: n.summary,
            tags: n.tags || [],
            extractedTasks: n.extracted_tasks || [],
            isPinned: n.is_pinned || false,
            color: n.color || "default",
            createdAt: n.created_at,
            updatedAt: n.updated_at,
          })),
        );
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const checkRecurringTransactions = async () => {
    try {
      if (!user) return;
      const { error } = await supabase.rpc("process_recurring_transactions", {
        p_user_id: user.id,
      });
      if (error) console.error("Error processing recurring:", error);
    } catch (err) {
      console.error("Error checking recurring:", err);
    }
  };

  useEffect(() => {
    if (user) {
      fetchData();
      checkRecurringTransactions();
    }
  }, [user]);

  // Calculate Metrics
  useEffect(() => {
    const today = new Date();
    const daysInMonth = new Date(
      today.getFullYear(),
      today.getMonth() + 1,
      0,
    ).getDate();
    const daysRemaining = Math.max(1, daysInMonth - today.getDate());

    // Calculate actuals for current month to fallback if budget not set
    const actualIncome = transactions
      .filter((t) => {
        if (t.type !== "income") return false;
        const tDate = new Date(t.date);
        return (
          tDate.getMonth() === today.getMonth() &&
          tDate.getFullYear() === today.getFullYear()
        );
      })
      .reduce((acc, curr) => acc + curr.amount, 0);

    const actualFixedExpenses = transactions
      .filter((t) => {
        if (t.type !== "expense") return false;
        const cat = categories.find((c) => c.name === t.category);
        const tDate = new Date(t.date);
        return (
          cat?.type === "fixed" &&
          tDate.getMonth() === today.getMonth() &&
          tDate.getFullYear() === today.getFullYear()
        );
      })
      .reduce((acc, curr) => acc + curr.amount, 0);

    // Use Budget Settings if set, otherwise use Actuals
    const totalIncome =
      budgetSettings.monthlySalary > 0
        ? budgetSettings.monthlySalary
        : actualIncome;

    const plannedFixed = budgetSettings.fixedExpenses.reduce(
      (acc, curr) => acc + curr.amount,
      0,
    );
    const totalFixedExpenses =
      plannedFixed > 0 ? plannedFixed : actualFixedExpenses;

    const totalVariableExpenses = budgetSettings.variableExpenses.reduce(
      (acc, curr) => acc + curr.amount,
      0,
    );

    const totalSavings =
      (totalIncome * (budgetSettings.savingsTargetPercent || 20)) / 100;

    const pocketMoneyPool = Math.max(
      0,
      totalIncome - totalFixedExpenses - totalVariableExpenses - totalSavings,
    );

    const todayStr = today.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });

    // Calculate spent today
    const spentToday = transactions
      .filter((t) => {
        if (t.type !== "expense") return false;
        const tDate = new Date(t.date);
        return (
          tDate.getDate() === today.getDate() &&
          tDate.getMonth() === today.getMonth() &&
          tDate.getFullYear() === today.getFullYear()
        );
      })
      .reduce((acc, curr) => acc + curr.amount, 0);

    // Calculate spent this month
    const spentMonthTotal = transactions
      .filter((t) => {
        if (t.type !== "expense") return false;
        const tDate = new Date(t.date);
        return (
          tDate.getMonth() === today.getMonth() &&
          tDate.getFullYear() === today.getFullYear()
        );
      })
      .reduce((acc, curr) => acc + curr.amount, 0);

    const remainingPocketMoney = Math.max(0, pocketMoneyPool - spentMonthTotal);

    const dailyLimit = remainingPocketMoney / daysRemaining;
    const remainingToday = dailyLimit - spentToday;

    let budgetHealth: "Healthy" | "At Risk" | "Critical" = "Healthy";
    if (remainingPocketMoney < pocketMoneyPool * 0.2) budgetHealth = "Critical";
    else if (remainingPocketMoney < pocketMoneyPool * 0.5)
      budgetHealth = "At Risk";

    setMetrics({
      totalIncome,
      totalFixedExpenses,
      totalVariableExpenses,
      totalSavings,
      pocketMoneyPool,
      dailyLimit,
      spentToday,
      remainingToday,
      daysRemaining,
      budgetHealth,
    });
  }, [budgetSettings, transactions, categories]);

  // Actions
  const addTransaction = async (transaction: Transaction) => {
    if (!user) return;
    try {
      setTransactions((prev) => [transaction, ...prev]);

      const dateObj = new Date(transaction.date);
      const isoDate = !isNaN(dateObj.getTime())
        ? dateObj.toISOString()
        : new Date().toISOString();

      await supabase.from("transactions").insert({
        id: transaction.id,
        user_id: user.id,
        title: transaction.title,
        amount: transaction.amount,
        type: transaction.type,
        category: transaction.category,
        receipt_url: transaction.receipt_url,
        date: isoDate,
        payment_method: transaction.paymentMethod,
      });
    } catch (e) {
      console.error("Add Transaction Error", e);
    }
  };

  const updateTransaction = async (transaction: Transaction) => {
    if (!user) return;
    try {
      setTransactions((prev) =>
        prev.map((t) => (t.id === transaction.id ? transaction : t)),
      );

      const dateObj = new Date(transaction.date);
      const isoDate = !isNaN(dateObj.getTime())
        ? dateObj.toISOString()
        : new Date().toISOString();

      await supabase
        .from("transactions")
        .update({
          title: transaction.title,
          amount: transaction.amount,
          type: transaction.type,
          category: transaction.category,
          receipt_url: transaction.receipt_url,
          date: isoDate,
          payment_method: transaction.paymentMethod,
        })
        .eq("id", transaction.id);
    } catch (e) {
      console.error("Update Transaction Error", e);
    }
  };

  const deleteTransaction = async (id: string) => {
    if (!user) return;
    setTransactions((prev) => prev.filter((t) => t.id !== id));
    await supabase.from("transactions").delete().eq("id", id);
  };

  const addTask = async (task: Task) => {
    if (!user) return;
    setTasks((prev) => [...prev, task]);

    let isoDate = new Date().toISOString();
    if (task.dueDate) {
      const d = new Date(task.dueDate);
      if (!isNaN(d.getTime())) isoDate = d.toISOString();
    }

    await supabase.from("tasks").insert({
      id: task.id,
      user_id: user.id,
      title: task.title,
      description: task.description,
      status: task.status,
      priority: task.priority,
      recurring: task.recurring,
      due_date: isoDate,
      tags: task.tags,
      category: task.category || "Personal",
    });
  };

  const deleteTask = async (id: string) => {
    if (!user) return;
    setTasks((prev) => prev.filter((t) => t.id !== id));
    await supabase.from("tasks").delete().eq("id", id);
  };

  const updateTaskStatus = async (id: string, status: TaskStatus) => {
    if (!user) return;
    // Helper to normalize status
    const normalizeStatus = (s: string): TaskStatus => {
      const lower = s.toLowerCase();
      if (lower === "in_progress" || lower === "in progress")
        return "in-progress";
      return lower as TaskStatus;
    };
    const normalized = normalizeStatus(status);

    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, status: normalized } : t)),
    );
    await supabase.from("tasks").update({ status: normalized }).eq("id", id);
  };

  const updateBudgetSettings = async (settings: Partial<BudgetSettings>) => {
    if (!user) return;
    setBudgetSettings((prev) => {
      const updated = { ...prev, ...settings };
      if (updated.id) {
        supabase
          .from("budget_settings")
          .update({
            monthly_salary: updated.monthlySalary,
            savings_target_percent: updated.savingsTargetPercent,
            emergency_fund_amount: updated.emergencyFund,
            fixed_expenses: updated.fixedExpenses,
            variable_expenses: updated.variableExpenses,
          })
          .eq("id", updated.id)
          .then(({ error }) => {
            if (error) console.error("Update budget error", error);
          });
      }
      return updated;
    });
  };

  const addCategory = async (
    name: string,
    type: "income" | "expense",
    color: string,
  ) => {
    if (!user) return;
    const tempId = Math.random().toString();
    const newCat: Category = { id: tempId, name, type: type as any, color };
    setCategories((prev) => [...prev, newCat]);

    const { data } = await supabase
      .from("categories")
      .insert({
        user_id: user.id,
        name,
        type,
        color,
      })
      .select()
      .single();

    if (data) {
      setCategories((prev) =>
        prev.map((c) => (c.id === tempId ? { ...c, id: data.id } : c)),
      );
    }
  };

  const updateCategory = async (id: string, name: string) => {
    // Implement if needed
  };

  const deleteCategory = async (id: string) => {
    if (!user) return;
    setCategories((prev) => prev.filter((c) => c.id !== id));
    await supabase.from("categories").delete().eq("id", id);
  };

  const addRecurringRule = async (rule: any) => {
    try {
      if (!user) return;
      const { error } = await supabase.from("recurring_rules").insert({
        ...rule,
        user_id: user.id,
        next_due_date: rule.start_date,
      });
      if (error) throw error;
    } catch (err) {
      console.error("Error adding recurring rule:", err);
      throw err;
    }
  };

  // Notes Operations
  const addNote = async (note: Partial<Note>) => {
    if (!user) return;
    const newNote: Note = {
      id: note.id || crypto.randomUUID(),
      userId: user.id,
      taskId: note.taskId,
      title: note.title || "Untitled Note",
      content: note.content || "",
      summary: note.summary,
      tags: note.tags || [],
      extractedTasks: note.extractedTasks || [],
      isPinned: note.isPinned || false,
      color: note.color || "default",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setNotes((prev) => [newNote, ...prev]);

    await supabase.from("notes").insert({
      id: newNote.id,
      user_id: user.id,
      task_id: newNote.taskId,
      title: newNote.title,
      content: newNote.content,
      summary: newNote.summary,
      tags: newNote.tags,
      extracted_tasks: newNote.extractedTasks,
      is_pinned: newNote.isPinned,
      color: newNote.color,
    });
  };

  const updateNote = async (note: Partial<Note>) => {
    if (!user || !note.id) return;

    setNotes((prev) =>
      prev.map((n) =>
        n.id === note.id
          ? { ...n, ...note, updatedAt: new Date().toISOString() }
          : n,
      ),
    );

    await supabase
      .from("notes")
      .update({
        task_id: note.taskId,
        title: note.title,
        content: note.content,
        summary: note.summary,
        tags: note.tags,
        extracted_tasks: note.extractedTasks,
        is_pinned: note.isPinned,
        color: note.color,
      })
      .eq("id", note.id);
  };

  const deleteNote = async (id: string) => {
    if (!user) return;
    setNotes((prev) => prev.filter((n) => n.id !== id));
    await supabase.from("notes").delete().eq("id", id);
  };

  const pinNote = async (id: string, isPinned: boolean) => {
    if (!user) return;
    setNotes((prev) => prev.map((n) => (n.id === id ? { ...n, isPinned } : n)));
    await supabase.from("notes").update({ is_pinned: isPinned }).eq("id", id);
  };

  return (
    <DataContext.Provider
      value={{
        transactions,
        user,
        tasks,
        notes,
        budgetSettings,
        categories,
        metrics,
        addTransaction,
        updateTransaction,
        addTask,
        deleteTransaction,
        deleteTask,
        updateTaskStatus,
        updateBudgetSettings,
        addCategory,
        updateCategory,
        deleteCategory,
        addRecurringRule,
        addNote,
        updateNote,
        deleteNote,
        pinNote,
        refreshData: fetchData,
        getAnalyticsData: async (monthStr: string) => {
          if (!user) return { metrics: null, distribution: [], trend: [] };
          const [metricsRes, distRes, trendRes] = await Promise.all([
            supabase.rpc("get_monthly_metrics", { month_str: monthStr }),
            supabase.rpc("get_category_distribution", { month_str: monthStr }),
            supabase.rpc("get_spending_trend", { month_str: monthStr }),
          ]);
          return {
            metrics: metricsRes.data || null,
            distribution: distRes.data || [],
            trend: trendRes.data || [],
          };
        },
        getSmartInsights: async (monthStr: string) => {
          if (!user) return [];
          const { data, error } = await supabase.rpc("get_smart_insights", {
            month_str: monthStr,
          });
          if (error) return [];
          return data?.insights || [];
        },
        navPosition,
        setNavPosition,
        isNavHidden,
        setIsNavHidden,
        isNavCollapsed,
        setIsNavCollapsed,
      }}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error("useData must be used within a DataProvider");
  }
  return context;
};
