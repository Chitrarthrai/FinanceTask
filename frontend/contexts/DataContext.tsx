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
} from "../types";
import { supabase } from "../lib/supabase";
import { useAuth } from "./AuthContext";

interface DataContextType {
  transactions: Transaction[];
  tasks: Task[];
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
    color: string
  ) => Promise<void>;
  updateCategory: (id: string, name: string) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;
  addRecurringRule: (rule: any) => Promise<void>;
  refreshData: () => Promise<void>;
  getAnalyticsData: (month: string) => Promise<{
    metrics: MonthlyMetrics | null;
    distribution: CategoryDistribution[];
    trend: SpendingTrend[];
  }>;
}

const defaultBudgetSettings: BudgetSettings = {
  id: "", // Will be set from DB
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
  const [budgetSettings, setBudgetSettings] = useState<BudgetSettings>(
    defaultBudgetSettings
  );
  const [categories, setCategories] = useState<Category[]>([]);

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
        // Create default budget settings if not exists
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
          }))
        );
      } else {
        // Initialize default categories if none exist
        const defaults = [
          { name: "Food", type: "variable", color: "#f43f5e", icon: "Coffee" },
          {
            name: "Transport",
            type: "variable",
            color: "#f97316",
            icon: "Car",
          },
          { name: "Housing", type: "fixed", color: "#14b8a6", icon: "Home" },
          {
            name: "Income",
            type: "income",
            color: "#10b981",
            icon: "DollarSign",
          },
        ];
        // We can insert them or just set them locally? Better insert to DB.
        // For now, let's just set empty and let user creating them, OR auto-create.
        // Auto-create is better UX.
        // (Skipping auto-create logic for brevity, user can add)
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
            // Convert ISO string from DB to display string
            date: new Date(t.date).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            }),
            paymentMethod: t.payment_method,
          }))
        );
      }

      // 4. Fetch Tasks
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
                  hour: "numeric",
                  minute: "2-digit",
                })
              : "",
            recurring: t.recurring,
            tags: t.tags || [],
            category: t.category || "Personal",
          }))
        );
      }

      // 5. Fetch Global Metrics for Sidebar (Current Month)
      const dateForMetrics = new Date();
      const monthStr = `${dateForMetrics.getFullYear()}-${String(
        dateForMetrics.getMonth() + 1
      ).padStart(2, "0")}-01`;

      // We can reuse the getAnalyticsData logic, but we need to define it or import it.
      // Since it's inside the same hook return, we can't call the export.
      // We will duplicate the simple fetch call here or move the logic to a helper.
      // For simplicity and safety, we call the RPC directly here as we did in getAnalyticsData.
      const { data: metricsData } = await supabase.rpc("get_monthly_metrics", {
        month_date: monthStr,
        user_id: user.id,
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

  // Calculate Metrics
  useEffect(() => {
    const today = new Date();
    const daysInMonth = new Date(
      today.getFullYear(),
      today.getMonth() + 1,
      0
    ).getDate();
    const daysRemaining = Math.max(1, daysInMonth - today.getDate());

    const totalIncome = budgetSettings.monthlySalary;

    const totalFixedExpenses = budgetSettings.fixedExpenses.reduce(
      (acc, curr) => acc + curr.amount,
      0
    );

    const totalVariableExpenses = budgetSettings.variableExpenses.reduce(
      (acc, curr) => acc + curr.amount,
      0
    );

    const totalSavings =
      (totalIncome * (budgetSettings.savingsTargetPercent || 20)) / 100;

    const pocketMoneyPool = Math.max(
      0,
      totalIncome - totalFixedExpenses - totalVariableExpenses - totalSavings
    );

    const todayStr = today.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });

    // Calculate spent today based on current transactions state
    const spentToday = transactions
      .filter((t) => t.type === "expense" && t.date === todayStr)
      .reduce((acc, curr) => acc + curr.amount, 0);

    // Calculate spent this month (excluding today for opening balance calculation or including? Daily limit usually dynamic based on *remaining* funds)
    // Formula: (Current Balance) / Days Remaining
    // Current Balance = Pool - Spent So Far

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
    });
  }, [budgetSettings, transactions]);

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
        prev.map((t) => (t.id === transaction.id ? transaction : t))
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

    // Assume task.dueDate is roughly parseable or default to now
    let isoDate = new Date().toISOString();
    if (task.dueDate) {
      // Attempt to parse "Oct 12, 10:00 AM" by appending current year if needed?
      // This relies on Tasks.tsx sending a good string.
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
      category: task.category || "Personal", // Added
    });
  };

  const deleteTask = async (id: string) => {
    if (!user) return;
    setTasks((prev) => prev.filter((t) => t.id !== id));
    await supabase.from("tasks").delete().eq("id", id);
  };

  const updateTaskStatus = async (id: string, status: TaskStatus) => {
    if (!user) return;
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, status } : t)));
    await supabase.from("tasks").update({ status }).eq("id", id);
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
      })
      .select()
      .single();

    if (data) {
      setCategories((prev) =>
        prev.map((c) => (c.id === tempId ? { ...c, id: data.id } : c))
      );
    }
  };

  const updateCategory = async (category: Category) => {
    if (!user) return;
    setCategories((prev) =>
      prev.map((c) => (c.id === category.id ? category : c))
    );
    await supabase
      .from("categories")
      .update({
        name: category.name,
        type: category.type,
        color: category.color,
        icon: category.icon,
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
        next_due_date: rule.start_date, // Initial due date
      });
      if (error) throw error;
      // Refresh transactions just in case (optional) in future
    } catch (err) {
      console.error("Error adding recurring rule:", err);
      throw err;
    }
  };

  return (
    <DataContext.Provider
      value={{
        transactions,
        tasks,
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
