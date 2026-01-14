import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import KPICard from "../components/KPICard";
// import { KPI_MOCK_DATA } from "../constants"; // Removed unused import
import {
  SpendingOverview,
  CategoryDistribution,
} from "../components/DashboardCharts";
import {
  ArrowUpRight,
  ArrowRight,
  Clock,
  MoreVertical,
  Plus,
  Calendar,
} from "lucide-react";
import { useData } from "../contexts/DataContext";
import { KPIData } from "../types";

// Force reload
const Dashboard = () => {
  const navigate = useNavigate();

  const { transactions, tasks, metrics } = useData();
  const [kpiData, setKpiData] = useState<KPIData[]>([]);
  const [timeRange, setTimeRange] = useState("Week");

  // Update KPIs based on Real Metrics
  useEffect(() => {
    const newKpis: KPIData[] = [
      {
        label: "Monthly Salary",
        value: metrics.totalIncome,
        currency: true,
        trend: 0,
        icon: "wallet",
        color: "emerald",
      },
      {
        label: "Fixed Expenses",
        value: metrics.totalFixedExpenses,
        currency: true,
        trend: 0,
        icon: "credit-card",
        color: "rose",
      },
      {
        label: "Pocket Money Pool",
        value: metrics.pocketMoneyPool,
        currency: true,
        trend:
          metrics.budgetHealth === "Critical"
            ? -10
            : metrics.budgetHealth === "At Risk"
            ? -5
            : 0,
        icon: "piggy-bank",
        color:
          metrics.budgetHealth === "Critical"
            ? "rose"
            : metrics.budgetHealth === "At Risk"
            ? "amber"
            : "blue",
      },
      {
        label: "Daily Limit",
        value: metrics.dailyLimit,
        currency: true,
        trend: 0,
        icon: "dollar-sign",
        color: "brand",
      },
      {
        label: "Variable (Est)",
        value: metrics.totalVariableExpenses,
        currency: true,
        trend: 0,
        icon: "trending-up",
        color: "amber",
      },
      {
        label: "Savings Target",
        value: metrics.totalSavings,
        currency: true,
        trend: 0,
        icon: "trending-up",
        color: "indigo",
      },
    ];
    setKpiData(newKpis);
  }, [metrics]);

  // Get only top 4 recent transactions
  const recentTransactions = transactions.slice(0, 4);
  // Get only top 3 upcoming tasks
  const upcomingTasks = tasks
    .filter((t) => t.status !== "completed")
    .slice(0, 3);

  // Calculate percentage used for the daily progress bar
  // If daily limit is 0 (e.g. at end of month or no budget), handle gracefully
  const percentUsed =
    metrics.dailyLimit > 0
      ? Math.round((metrics.spentToday / metrics.dailyLimit) * 100)
      : 0;

  // Prepare Chart Data Locally from Transactions
  const categoryData = React.useMemo(() => {
    const expenseTrans = transactions.filter((t) => t.type === "expense");
    const grouped = expenseTrans.reduce((acc, curr) => {
      acc[curr.category] = (acc[curr.category] || 0) + curr.amount;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(grouped).map(([name, value]) => ({ name, value }));
  }, [transactions]);

  const spendingData = React.useMemo(() => {
    const today = new Date();
    let labels: string[] = [];
    let dataMap: Record<string, number> = {};

    if (timeRange === "Week") {
      // Last 7 Days
      labels = Array.from({ length: 7 }, (_, i) => {
        const d = new Date();
        d.setDate(today.getDate() - (6 - i));
        return d.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        });
      });
    } else if (timeRange === "Month") {
      // Last 30 Days (grouped by 3-day intervals to fit chart? or just daily)
      // Let's do daily for last 30 days
      labels = Array.from({ length: 30 }, (_, i) => {
        const d = new Date();
        d.setDate(today.getDate() - (29 - i));
        return d.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        });
      });
    } else if (timeRange === "Year") {
      // Last 12 Months
      labels = Array.from({ length: 12 }, (_, i) => {
        const d = new Date();
        d.setMonth(today.getMonth() - (11 - i));
        return d.toLocaleDateString("en-US", { month: "short" });
      });
    }

    // Process transactions
    if (timeRange === "Year") {
      // Group by Month
      transactions
        .filter((t) => t.type === "expense")
        .forEach((t) => {
          const d = new Date(t.date); // "Oct 12, 2024" is parseable
          const monthKey = d.toLocaleDateString("en-US", { month: "short" });
          // Check if this transaction is within the last 12 months roughly
          // For simplicity, just matching label key
          if (labels.includes(monthKey)) {
            dataMap[monthKey] = (dataMap[monthKey] || 0) + t.amount;
          }
        });
    } else {
      // Daily grouping
      transactions
        .filter((t) => t.type === "expense")
        .forEach((t) => {
          const d = new Date(t.date);
          const dayKey = d.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
          });
          if (labels.includes(dayKey)) {
            dataMap[dayKey] = (dataMap[dayKey] || 0) + t.amount;
          }
        });
    }

    return labels.map((label) => ({
      name: label,
      value: dataMap[label] || 0,
      secondary: 0,
    }));
  }, [transactions, timeRange]);

  return (
    <div className="space-y-8 animate-fade-in pb-20">
      {/* Hero Section */}
      <section className="flex flex-col md:flex-row justify-between items-end gap-6">
        <div>
          <h1 className="text-4xl font-extrabold text-text-primary mb-2 tracking-tight">
            Good Morning!
          </h1>
          <p className="text-text-muted text-lg font-medium">
            You have{" "}
            <span className="text-brand-600 dark:text-brand-400 font-bold">
              ${Math.max(0, metrics.remainingToday).toFixed(2)}
            </span>{" "}
            left to spend today.
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => navigate("/app/transactions")}
            className="flex items-center gap-2 px-6 py-3 bg-brand-600 text-white font-bold rounded-full hover:bg-brand-700 transition-all shadow-lg shadow-brand-500/30 hover:shadow-brand-500/40 active:scale-95 border border-transparent">
            <Plus className="w-5 h-5" />
            Quick Add
          </button>
        </div>
      </section>

      {/* KPI Grid */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {kpiData.map((kpi, index) => (
          <KPICard key={kpi.label} data={kpi} delay={index} />
        ))}
      </section>

      {/* Charts & Widgets */}
      <section className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Main Chart */}
        <div
          className="xl:col-span-2 glass-panel p-8 rounded-3xl animate-slide-up hover:border-brand-200 dark:hover:border-slate-700 transition-colors duration-300"
          style={{ animationDelay: "400ms" }}>
          <div className="flex justify-between items-center mb-8">
            <div>
              <h3 className="text-xl font-bold text-text-primary">
                Spending Analysis
              </h3>
              <p className="text-sm text-text-muted">
                Your spending trend over time
              </p>
            </div>
            <div className="flex p-1 rounded-xl bg-bg-tertiary border border-border-subtle">
              {["Week", "Month", "Year"].map((period) => (
                <button
                  key={period}
                  onClick={() => setTimeRange(period)}
                  className={`px-4 py-1.5 text-sm font-semibold rounded-lg transition-all ${
                    timeRange === period
                      ? "bg-brand-500 text-white shadow-md shadow-brand-500/20"
                      : "text-text-muted hover:text-text-primary hover:bg-bg-secondary/50"
                  }`}>
                  {period}
                </button>
              ))}
            </div>
          </div>
          <SpendingOverview data={spendingData} />
        </div>

        {/* Side Widgets Column */}
        <div className="space-y-6">
          {/* Daily Goal Card */}
          <div
            className="p-8 rounded-3xl shadow-xl relative overflow-hidden animate-slide-up border border-transparent bg-gradient-brand text-white shadow-slate-900/20"
            style={{ animationDelay: "600ms" }}>
            <div className="relative z-10">
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-bold text-xl">Daily Limit</h3>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-bold backdrop-blur-md border ${
                    percentUsed >= 100
                      ? "bg-rose-500/50 text-white border-white/10"
                      : "bg-white/10 text-white border-white/10"
                  }`}>
                  {percentUsed}% Used
                </span>
              </div>
              <div className="flex items-baseline gap-2 mb-6">
                <span className="text-5xl font-extrabold tracking-tight">
                  ${metrics.spentToday.toFixed(0)}
                </span>
                <span className="text-white/60 font-medium text-lg">
                  / ${metrics.dailyLimit.toFixed(0)}
                </span>
              </div>
              <div className="h-2.5 bg-black/20 rounded-full overflow-hidden mb-4">
                <div
                  className={`h-full rounded-full shadow-[0_0_15px_rgba(255,255,255,0.3)] transition-all duration-1000 ${
                    percentUsed >= 100 ? "bg-rose-400" : "bg-white"
                  }`}
                  style={{ width: `${Math.min(100, percentUsed)}%` }}
                />
              </div>
              <p className="text-sm font-medium text-white/80">
                {metrics.remainingToday >= 0 ? (
                  <>
                    You have{" "}
                    <span className="text-white font-bold">
                      ${metrics.remainingToday.toFixed(2)} left
                    </span>{" "}
                    for today.
                  </>
                ) : (
                  <>
                    You have overspent by{" "}
                    <span className="text-rose-200 font-bold">
                      ${Math.abs(metrics.remainingToday).toFixed(2)}
                    </span>
                    !
                  </>
                )}
              </p>
            </div>

            {/* Abstract blobs */}
            <div className="absolute top-[-20%] right-[-10%] w-48 h-48 bg-white/10 rounded-full blur-3xl" />
            <div className="absolute bottom-[-20%] left-[-10%] w-40 h-40 bg-black/10 rounded-full blur-3xl" />
          </div>

          {/* Category Chart */}
          <div
            className="glass-panel p-8 rounded-3xl animate-slide-up flex flex-col justify-center min-h-[250px] hover:border-brand-200 dark:hover:border-slate-700 transition-colors"
            style={{ animationDelay: "500ms" }}>
            <h3 className="text-xl font-bold text-text-primary mb-2">
              Expenses by Category
            </h3>
            <CategoryDistribution data={categoryData} />
          </div>
        </div>
      </section>

      {/* Lists Row */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6 pb-8">
        {/* Recent Transactions */}
        <div
          className="glass-panel p-8 rounded-3xl animate-slide-up border border-surface-glass-border"
          style={{ animationDelay: "700ms" }}>
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold text-text-primary">
              Recent Transactions
            </h3>
            <button
              onClick={() => navigate("/app/transactions")}
              className="text-brand-600 dark:text-brand-400 text-sm font-bold hover:text-brand-700 flex items-center gap-1 px-3 py-1.5 rounded-lg hover:bg-brand-50 dark:hover:bg-brand-900/30 transition-colors border border-transparent hover:border-brand-200 dark:hover:border-brand-800">
              View All <ArrowRight className="w-4 h-4" />
            </button>
          </div>
          <div className="space-y-2">
            {recentTransactions.map((t) => (
              <div
                key={t.id}
                className="flex items-center justify-between p-4 rounded-2xl hover:bg-bg-secondary transition-all group cursor-pointer border border-transparent hover:border-border-primary hover:translate-x-1">
                <div className="flex items-center gap-4">
                  <div
                    className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-colors shadow-sm ${
                      t.type === "expense"
                        ? "bg-rose-500 dark:bg-rose-900/20 text-white dark:text-rose-400"
                        : "bg-emerald-500 dark:bg-emerald-900/20 text-white dark:text-emerald-400"
                    }`}>
                    {t.type === "expense" ? (
                      <ArrowUpRight className="w-6 h-6" />
                    ) : (
                      <ArrowUpRight className="w-6 h-6 rotate-180" />
                    )}
                  </div>
                  <div>
                    <p className="font-bold text-text-primary text-base">
                      {t.title}
                    </p>
                    <p className="text-xs font-medium text-text-muted mt-0.5">
                      {t.date} • {t.category}
                    </p>
                  </div>
                </div>
                <span
                  className={`font-bold text-lg ${
                    t.type === "expense"
                      ? "text-text-primary"
                      : "text-emerald-600 dark:text-emerald-400"
                  }`}>
                  {t.type === "expense" ? "-" : "+"}$
                  {Number(t.amount).toFixed(2)}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Upcoming Tasks */}
        <div
          className="glass-panel p-8 rounded-3xl animate-slide-up border border-surface-glass-border"
          style={{ animationDelay: "800ms" }}>
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold text-text-primary">
              Upcoming Tasks
            </h3>
            <button
              onClick={() => navigate("/app/tasks")}
              className="p-2 hover:bg-bg-secondary rounded-xl transition-colors border border-transparent hover:border-border-primary">
              <MoreVertical className="w-5 h-5 text-text-muted" />
            </button>
          </div>
          <div className="space-y-3">
            {upcomingTasks.map((task) => (
              <div
                key={task.id}
                className="flex items-center gap-4 p-4 border border-border-subtle rounded-2xl bg-bg-secondary/50 hover:bg-bg-secondary transition-all hover:shadow-md group cursor-pointer hover:-translate-y-1">
                <div className="flex-1">
                  <p className="font-semibold text-text-secondary group-hover:text-text-primary transition-colors text-base">
                    {task.title}
                  </p>
                  <div className="flex items-center gap-2 mt-1.5">
                    <span
                      className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wide ${
                        task.priority === "high"
                          ? "bg-rose-500 dark:bg-rose-900/40 text-white dark:text-rose-400"
                          : task.priority === "medium"
                          ? "bg-amber-500 dark:bg-amber-900/40 text-white dark:text-amber-400"
                          : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
                      }`}>
                      {task.priority}
                    </span>
                    <div className="flex items-center gap-1 text-xs font-medium text-text-muted">
                      <Clock className="w-3.5 h-3.5" />
                      {task.dueDate}
                    </div>
                  </div>
                </div>
              </div>
            ))}
            <button
              onClick={() => navigate("/app/tasks")}
              className="w-full py-4 border-2 border-dashed border-border-primary rounded-2xl text-text-muted text-sm font-bold hover:border-brand-300 hover:text-brand-500 hover:bg-brand-50/50 dark:hover:bg-brand-900/20 transition-all flex items-center justify-center gap-2 mt-4 hover:shadow-sm">
              <Plus className="w-5 h-5" /> Add New Task
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Dashboard;
