import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
  useMemo,
  useRef,
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
  UndoItem,
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
  currencySymbol: string;
  setCurrencySymbol: (symbol: string) => void;
  undoItem: UndoItem | null;
  categoryWarnings: { category: string; limit: number; spent: number; percent: number; level: "warning" | "critical" }[];
  undoLastDelete: () => void;
  addTransaction: (transaction: Transaction) => Promise<void>;
  updateTransaction: (transaction: Transaction) => Promise<void>;
  addTask: (task: Task) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  updateTaskStatus: (
    id: string,
    status: TaskStatus,
    reasonNotDone?: string,
  ) => Promise<void>;

  updateBudgetSettings: (settings: Partial<BudgetSettings>) => Promise<void>;
  addCategory: (category: Category) => Promise<void>;
  updateCategory: (category: Category) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;
  addRecurringRule: (rule: any) => Promise<void>;
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
  const [undoItem, setUndoItem] = useState<UndoItem | null>(null);
  const undoTimeoutRef = useRef<any>(null);

  const [currencySymbol, setCurrencySymbolState] = useState<string>(() => {
    return localStorage.getItem("currency_symbol") || "$";
  });

  const setCurrencySymbol = (symbol: string) => {
    setCurrencySymbolState(symbol);
    localStorage.setItem("currency_symbol", symbol);
    if (user && budgetSettings.id) {
      updateBudgetSettings({ currencySymbol: symbol });
    }
  };

  const categoryWarnings = useMemo(() => {
    const warnings: {
      category: string;
      limit: number;
      spent: number;
      percent: number;
      level: "warning" | "critical";
    }[] = [];
    const expenseTrans = transactions.filter((t) => t.type === "expense");

    categories.forEach((cat) => {
      if (cat.budgetLimit && cat.budgetLimit > 0) {
        const spent = expenseTrans
          .filter((t) => t.category === cat.name)
          .reduce((sum, t) => sum + t.amount, 0);
        const percent = Math.round((spent / cat.budgetLimit) * 100);
        if (percent >= 100) {
          warnings.push({
            category: cat.name,
            limit: cat.budgetLimit,
            spent,
            percent,
            level: "critical",
          });
        } else if (percent >= 80) {
          warnings.push({
            category: cat.name,
            limit: cat.budgetLimit,
            spent,
            percent,
            level: "warning",
          });
        }
      }
    });
    return warnings;
  }, [transactions, categories]);

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
        if (budgetData.currency_symbol) {
          setCurrencySymbolState(budgetData.currency_symbol);
          localStorage.setItem("currency_symbol", budgetData.currency_symbol);
        }
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
      }

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
            date: new Date(t.date).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            }),
            paymentMethod: t.payment_method,
          })),
        );
      }

      const { data: taskData } = await supabase
        .from("tasks")
        .select("*")
        .eq("user_id", user.id)
        .order("due_date", { ascending: true });

      if (taskData) {
        setTasks(
          taskData.map((t) => ({
            id: t.id,
            title: t.title,
            description: t.description || "",
            status: t.status as any,
            priority: t.priority as any,
            dueDate: t.due_date
              ? new Date(t.due_date).toLocaleString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                  hour: "numeric",
                  minute: "2-digit",
                })
              : "",
            recurring: t.recurring,
            tags: t.tags || [],
            category: t.category || "Personal",
          })),
        );
      }

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
            title: n.title,
            content: n.content,
            summary: n.summary,
            tags: n.tags || [],
            extractedTasks: n.extracted_tasks || [],
            isPinned: n.is_pinned,
            color: n.color || "default",
            createdAt: n.created_at,
            updatedAt: n.updated_at,
          })),
        );
      }

      const dateForMetrics = new Date();
      const monthStr = `${dateForMetrics.getFullYear()}-${String(
        dateForMetrics.getMonth() + 1,
      ).padStart(2, "0")}-01`;

      const { data: metricsData } = await supabase.rpc("get_monthly_metrics", {
        month_str: monthStr,
      });

      if (metricsData && metricsData.length > 0) {
        setMetrics(metricsData[0]);
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

  useEffect(() => {
    const today = new Date();
    const daysInMonth = new Date(
      today.getFullYear(),
      today.getMonth() + 1,
      0,
    ).getDate();
    const daysRemaining = Math.max(1, daysInMonth - today.getDate());

    const totalIncome = budgetSettings.monthlySalary;

    const totalFixedExpenses = budgetSettings.fixedExpenses.reduce(
      (acc, curr) => acc + curr.amount,
      0,
    );

    const currentMonthExpenses = transactions
      .filter((t) => {
        const d = new Date(t.date);
        return (
          d.getMonth() === today.getMonth() &&
          d.getFullYear() === today.getFullYear() &&
          t.type === "expense"
        );
      })
      .reduce((acc, curr) => acc + curr.amount, 0);

    const totalVariableExpenses = currentMonthExpenses;

    const totalSavings =
      totalIncome - totalFixedExpenses - totalVariableExpenses;

    const prevMonthDate = new Date();
    prevMonthDate.setMonth(prevMonthDate.getMonth() - 1);

    const prevMonthVariableExpenses = transactions
      .filter((t) => {
        const d = new Date(t.date);
        return (
          d.getMonth() === prevMonthDate.getMonth() &&
          d.getFullYear() === prevMonthDate.getFullYear() &&
          t.type === "expense"
        );
      })
      .reduce((acc, curr) => acc + curr.amount, 0);

    const prevMonthSavings =
      totalIncome - totalFixedExpenses - prevMonthVariableExpenses;

    let savingsTrend = 0;
    if (prevMonthSavings !== 0) {
      savingsTrend =
        ((totalSavings - prevMonthSavings) / Math.abs(prevMonthSavings)) * 100;
    } else if (totalSavings > 0) {
      savingsTrend = 100;
    }

    const pocketMoneyPool = Math.max(
      0,
      totalIncome - totalFixedExpenses - totalVariableExpenses - totalSavings,
    );

    const todayStr = today.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });

    const spentToday = transactions
      .filter((t) => t.type === "expense" && t.date === todayStr)
      .reduce((acc, curr) => acc + curr.amount, 0);

    const currentMonthStr = today.toLocaleString("default", { month: "short" });
    const spentMonthTotal = transactions
      .filter((t) => t.type === "expense" && t.date.includes(currentMonthStr))
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
      savingsTrend,
    });
  }, [budgetSettings, transactions]);

  const addTransaction = async (transaction: Transaction) => {
    setTransactions((prev) => [transaction, ...prev]);
    if (!user) return;
    try {

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
    const target = transactions.find((t) => t.id === id);
    if (!target) return;

    setTransactions((prev) => prev.filter((t) => t.id !== id));

    if (undoTimeoutRef.current) clearTimeout(undoTimeoutRef.current);
    const item: UndoItem = {
      id,
      type: "transaction",
      data: target,
      expiryTime: Date.now() + 10000,
    };
    setUndoItem(item);

    undoTimeoutRef.current = setTimeout(async () => {
      await supabase.from("transactions").delete().eq("id", id);
      setUndoItem(null);
    }, 10000);
  };

  const addTask = async (task: Task) => {
    setTasks((prev) => [...prev, task]);
    if (!user) return;

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
    const target = tasks.find((t) => t.id === id);
    if (!target) return;

    setTasks((prev) => prev.filter((t) => t.id !== id));

    if (undoTimeoutRef.current) clearTimeout(undoTimeoutRef.current);
    const item: UndoItem = {
      id,
      type: "task",
      data: target,
      expiryTime: Date.now() + 10000,
    };
    setUndoItem(item);

    undoTimeoutRef.current = setTimeout(async () => {
      await supabase.from("tasks").delete().eq("id", id);
      setUndoItem(null);
    }, 10000);
  };

  const undoLastDelete = () => {
    if (!undoItem) return;
    if (undoTimeoutRef.current) clearTimeout(undoTimeoutRef.current);
    if (undoItem.type === "transaction") {
      setTransactions((prev) => [...prev, undoItem.data as Transaction]);
    } else if (undoItem.type === "task") {
      setTasks((prev) => [...prev, undoItem.data as Task]);
    }
    setUndoItem(null);
  };

  const updateTaskStatus = async (
    id: string,
    status: TaskStatus,
    reasonNotDone?: string,
  ) => {
    if (!user) return;
    const completionTime = status === "completed" ? new Date().toISOString() : undefined;
    setTasks((prev) =>
      prev.map((t) =>
        t.id === id
          ? {
              ...t,
              status,
              reasonNotDone: reasonNotDone || t.reasonNotDone,
              completionTime: completionTime || t.completionTime,
            }
          : t,
      ),
    );
    await supabase
      .from("tasks")
      .update({
        status,
        reason_not_done: reasonNotDone || null,
        completion_time: completionTime || null,
      })
      .eq("id", id);
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

  const addCategory = async (category: Category) => {
    if (!user) return;
    const tempId = Math.random().toString();
    setCategories((prev) => [...prev, { ...category, id: tempId }]);

    const { data } = await supabase
      .from("categories")
      .insert({
        user_id: user.id,
        name: category.name,
        type: category.type,
        color: category.color,
        icon: category.icon,
        budget_limit: category.budgetLimit || null,
      })
      .select()
      .single();

    if (data) {
      setCategories((prev) =>
        prev.map((c) => (c.id === tempId ? { ...c, id: data.id } : c)),
      );
    }
  };

  const updateCategory = async (category: Category) => {
    if (!user) return;
    setCategories((prev) =>
      prev.map((c) => (c.id === category.id ? category : c)),
    );
    await supabase
      .from("categories")
      .update({
        name: category.name,
        type: category.type,
        color: category.color,
        icon: category.icon,
        budget_limit: category.budgetLimit || null,
      })
      .eq("id", category.id);
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

  const addNote = async (noteData: Partial<Note>) => {
    const newNote: Note = {
      id: noteData.id || crypto.randomUUID(),
      userId: user?.id || "guest",
      taskId: noteData.taskId,
      title: noteData.title || "Untitled Note",
      content: noteData.content || "",
      summary: noteData.summary,
      tags: noteData.tags || [],
      extractedTasks: noteData.extractedTasks || [],
      isPinned: noteData.isPinned || false,
      color: noteData.color || "default",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setNotes((prev) => [newNote, ...prev]);
    if (!user) return;

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

  const updateNote = async (noteData: Partial<Note>) => {
    if (!user || !noteData.id) return;

    setNotes((prev) =>
      prev.map((n) =>
        n.id === noteData.id
          ? { ...n, ...noteData, updatedAt: new Date().toISOString() }
          : n,
      ),
    );

    await supabase
      .from("notes")
      .update({
        task_id: noteData.taskId,
        title: noteData.title,
        content: noteData.content,
        summary: noteData.summary,
        tags: noteData.tags,
        extracted_tasks: noteData.extractedTasks,
        is_pinned: noteData.isPinned,
        color: noteData.color,
      })
      .eq("id", noteData.id);
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
        currencySymbol,
        setCurrencySymbol,
        undoItem,
        categoryWarnings,
        undoLastDelete,
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

          if (error) {
            console.error("Error fetching insights:", error);
            return [];
          }

          return data?.insights || [];
        },
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
