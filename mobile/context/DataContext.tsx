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
import AsyncStorage from "@react-native-async-storage/async-storage";
import { cancelScheduledAlarm } from "../services/notifications";
import { Platform, NativeModules } from "react-native";

interface DataContextType {
  transactions: Transaction[];
  tasks: Task[];
  notes: Note[];
  budgetSettings: BudgetSettings;
  categories: Category[];
  metrics: FinancialMetrics;
  isDataLoaded: boolean;
  undoItem: UndoItem | null;

  undoLastDelete: () => void;
  categoryWarnings: { category: string; limit: number; spent: number; percent: number; level: "warning" | "critical" }[];
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
  isSearching: boolean;
  setIsSearching: (searching: boolean) => void;
  searchText: string;
  setSearchText: (text: string) => void;
  searchScope: "transactions" | "tasks";
  setSearchScope: (scope: "transactions" | "tasks") => void;
  isGlobalAddTransactionOpen: boolean;
  setIsGlobalAddTransactionOpen: (val: boolean) => void;
  isGlobalAddTaskOpen: boolean;
  setIsGlobalAddTaskOpen: (val: boolean) => void;
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
  const [isDataLoaded, setIsDataLoaded] = useState(false);
  const [undoItem, setUndoItem] = useState<UndoItem | null>(null);

  const undoTimeoutRef = useRef<any>(null);

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

  const [navPosition, setNavPosition] = useState<
    "bottom" | "top" | "left" | "right"
  >("bottom");
  const [isNavHidden, setIsNavHidden] = useState(false);
  const [isNavCollapsed, setIsNavCollapsed] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [searchScope, setSearchScope] = useState<"transactions" | "tasks">("transactions");
  const [isGlobalAddTransactionOpen, setIsGlobalAddTransactionOpen] = useState(false);
  const [isGlobalAddTaskOpen, setIsGlobalAddTaskOpen] = useState(false);

  // Derived Metrics State computed synchronously via useMemo
  const metrics = useMemo<FinancialMetrics>(() => {
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

    return {
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
    };
  }, [budgetSettings, transactions, categories]);

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
      }

      // 2. Fetch Categories
      const { data: catData } = await supabase
        .from("categories")
        .select("*")
        .eq("user_id", user.id);

      if (catData && Array.isArray(catData) && catData.length > 0) {
        setCategories(
          catData.map((c) => ({
            id: c.id,
            name: c.name,
            type: c.type as any,
            color: c.color,
            icon: c.icon,
            budgetLimit: c.budget_limit ? Number(c.budget_limit) : undefined,
            budgetedAmount: 0,
          })),
        );
      }

      // 3. Fetch Transactions
      const { data: transData } = await supabase
        .from("transactions")
        .select("*")
        .eq("user_id", user.id)
        .order("date", { ascending: false });

      if (transData && Array.isArray(transData)) {
        setTransactions(
          transData.map((t) => ({
            id: t.id,
            title: t.title,
            amount: Number(t.amount),
            type: t.type as any,
            category: t.category,
            date: t.date,
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

      if (taskData && Array.isArray(taskData)) {
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
            dueDate: t.due_date || "",
            recurring: t.recurring,
            tags: t.tags || [],
            category: t.category || "Personal",
            reasonNotDone: t.reason_not_done || undefined,
            completionTime: t.completion_time || undefined,
          })),
        );
      }

      // 5. Fetch Notes
      const { data: notesData } = await supabase
        .from("notes")
        .select("*")
        .eq("user_id", user.id)
        .order("is_pinned", { ascending: false })
        .order("updated_at", { ascending: false });

      if (notesData && Array.isArray(notesData)) {
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
      setIsDataLoaded(true);
    } catch (error) {

      console.error("Error fetching data:", error);
      setIsDataLoaded(true);
    }
  };



  const checkRecurringTransactions = async () => {
    try {
      if (!user) return;
      await supabase.rpc("process_recurring_transactions", {
        p_user_id: user.id,
      });
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



  // Actions
  const addTransaction = async (transaction: Transaction) => {
    if (!user) return;
    try {
      const dateObj = new Date(transaction.date);
      const isoDate = !isNaN(dateObj.getTime())
        ? dateObj.toISOString()
        : new Date().toISOString();

      const payload: any = {
        user_id: user.id,
        title: transaction.title,
        amount: transaction.amount,
        type: transaction.type,
        category: transaction.category,
        receipt_url: transaction.receipt_url,
        date: isoDate,
        payment_method: transaction.paymentMethod || "Cash",
      };

      // Validate if transaction.id is a valid UUID, otherwise let Supabase auto-generate it
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      if (transaction.id && uuidRegex.test(transaction.id)) {
        payload.id = transaction.id;
      }

      const { data, error } = await supabase
        .from("transactions")
        .insert(payload)
        .select()
        .single();

      if (error) throw error;

      if (data) {
        const newTx: Transaction = {
          id: data.id,
          title: data.title,
          amount: Number(data.amount),
          type: data.type,
          category: data.category,
          receipt_url: data.receipt_url,
          date: data.date,
          paymentMethod: data.payment_method,
        };
        setTransactions((prev) => [newTx, ...prev.filter((t) => t.id !== transaction.id)]);
      }
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
    if (!user) return;
    try {
      let isoDate = new Date().toISOString();
      if (task.dueDate) {
        const d = new Date(task.dueDate);
        if (!isNaN(d.getTime())) isoDate = d.toISOString();
      }

      const payload: any = {
        user_id: user.id,
        title: task.title,
        description: task.description,
        status: task.status,
        priority: task.priority,
        recurring: task.recurring,
        due_date: isoDate,
        tags: task.tags,
        category: task.category || "Personal",
      };

      // Validate if task.id is a valid UUID, otherwise let Supabase auto-generate it
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      if (task.id && uuidRegex.test(task.id)) {
        payload.id = task.id;
      }

      const { data, error } = await supabase
        .from("tasks")
        .insert(payload)
        .select()
        .single();
      console.log('[DEBUG] Supabase insert result:', data, error);

      if (error) throw error;

      if (data) {
        const normalizeStatus = (s: string): TaskStatus => {
          const lower = s.toLowerCase();
          if (lower === "in_progress" || lower === "in progress")
            return "in-progress";
          return lower as TaskStatus;
        };

        const newTsk: Task = {
          id: data.id,
          title: data.title,
          description: data.description || "",
          status: normalizeStatus(data.status),
          priority: data.priority as any,
          dueDate: data.due_date || "",
          recurring: data.recurring,
          tags: data.tags || [],
          category: data.category || "Personal",
          reasonNotDone: data.reason_not_done || undefined,
          completionTime: data.completion_time || undefined,
        };

        setTasks((prev) => [newTsk, ...prev.filter((t) => t.id !== task.id)]);
        console.log('[DEBUG] setTasks completed');
      }
    } catch (e) {
      console.error("Add Task Error", e);
    }
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
      try {
        const alarmId = await AsyncStorage.getItem("task_alarm_" + id);
        if (alarmId) {
          await cancelScheduledAlarm(alarmId);
          await AsyncStorage.removeItem("task_alarm_" + id);
        }
      } catch (err) {
        console.warn("Failed to cancel alarm during task deletion:", err);
      }
      setUndoItem(null);
    }, 10000);
  };

  const undoLastDelete = () => {
    if (!undoItem) return;
    if (undoTimeoutRef.current) clearTimeout(undoTimeoutRef.current);
    if (undoItem.type === "transaction") {
      setTransactions((prev) => [undoItem.data as Transaction, ...prev]);
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
    // Helper to normalize status
    const normalizeStatus = (s: string): TaskStatus => {
      const lower = s.toLowerCase();
      if (lower === "in_progress" || lower === "in progress")
        return "in-progress";
      return lower as TaskStatus;
    };
    const normalized = normalizeStatus(status);
    const completionTime = normalized === "completed" ? new Date().toISOString() : undefined;

    setTasks((prev) =>
      prev.map((t) =>
        t.id === id
          ? {
              ...t,
              status: normalized,
              reasonNotDone: reasonNotDone || t.reasonNotDone,
              completionTime: completionTime || t.completionTime,
            }
          : t,
      ),
    );
    await supabase
      .from("tasks")
      .update({
        status: normalized,
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
    try {
      const payload: any = {
        user_id: user.id,
        task_id: note.taskId,
        title: note.title || "Untitled Note",
        content: note.content || "",
        summary: note.summary,
        tags: note.tags || [],
        extracted_tasks: note.extractedTasks || [],
        is_pinned: note.isPinned || false,
        color: note.color || "default",
      };

      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      if (note.id && uuidRegex.test(note.id)) {
        payload.id = note.id;
      }

      const { data, error } = await supabase
        .from("notes")
        .insert(payload)
        .select()
        .single();

      if (error) throw error;

      if (data) {
        const newNote: Note = {
          id: data.id,
          userId: data.user_id,
          taskId: data.task_id,
          title: data.title,
          content: data.content,
          summary: data.summary,
          tags: data.tags,
          extractedTasks: data.extracted_tasks,
          isPinned: data.is_pinned,
          color: data.color,
          createdAt: data.created_at,
          updatedAt: data.updated_at,
        };
        setNotes((prev) => [newNote, ...prev.filter((n) => n.id !== note.id)]);
      }
    } catch (e) {
      console.error("Error adding note:", e);
    }
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

  // Synchronise widget data on state updates
  useEffect(() => {
    if (metrics) {
      const sortedTxs = [...transactions].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      const latestTx = sortedTxs[0];
      const spentToday = metrics.spentToday || 0;
      const dailyLimit = metrics.dailyLimit || 2000;

      const upcomingTasks = tasks
        .filter(t => t.status !== 'completed')
        .slice(0, 3)
        .map(t => {
          let dueDateStr = "No deadline";
          if (t.dueDate) {
            const d = new Date(t.dueDate);
            if (!isNaN(d.getTime())) {
              dueDateStr = d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
            } else {
              dueDateStr = t.dueDate;
            }
          }
          return {
            title: t.title,
            dueDate: dueDateStr
          };
        });

      const totalIncome = metrics.totalIncome || 0;
      const totalFixedExpenses = metrics.totalFixedExpenses || 0;
      const totalVariableExpenses = metrics.totalVariableExpenses || 0;

      if (process.env.NODE_ENV !== "test" && Platform.OS === "android" && NativeModules?.WidgetSharedData) {
        try {
          const payload = JSON.stringify({
            spentToday: spentToday.toFixed(0),
            dailyLimit: dailyLimit.toFixed(0),
            recentMerchant: latestTx ? latestTx.title : "No activity",
            recentAmount: latestTx ? latestTx.amount.toFixed(2) : "0.00",
            tasks: upcomingTasks,
            totalIncome: totalIncome.toFixed(0),
            totalFixedExpenses: totalFixedExpenses.toFixed(0),
            totalVariableExpenses: totalVariableExpenses.toFixed(0),
          });
          NativeModules.WidgetSharedData.setWidgetData(payload);
        } catch (e) {
          console.warn("Failed to update home screen widget:", e);
        }
      }
    }
  }, [transactions, metrics, tasks]);

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
        isDataLoaded,
        undoItem,

        undoLastDelete,
        categoryWarnings,
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
        isSearching,
        setIsSearching,
        searchText,
        setSearchText,
        searchScope,
        setSearchScope,
        isGlobalAddTransactionOpen,
        setIsGlobalAddTransactionOpen,
        isGlobalAddTaskOpen,
        setIsGlobalAddTaskOpen,
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
