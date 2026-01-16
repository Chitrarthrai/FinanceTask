import { useData } from "../contexts/DataContext";
import { MonthlyMetrics, CategoryDistribution, SpendingTrend } from "../types";
import { useState, useEffect } from "react";
import { useThemeColors } from "../lib/theme"; // Added
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
} from "recharts";
import {
  Calendar,
  Download,
  DollarSign,
  Target,
  TrendingUp,
  TrendingDown,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

const Analytics = () => {
  const { getAnalyticsData, getSmartInsights } = useData();
  const colors = useThemeColors(); // Added
  const [metrics, setMetrics] = useState<MonthlyMetrics | null>(null);
  const [distributions, setDistributions] = useState<CategoryDistribution[]>(
    []
  );
  const [trend, setTrend] = useState<SpendingTrend[]>([]);
  const [insights, setInsights] = useState<any[]>([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [loading, setLoading] = useState(true);
  const [showMonthPicker, setShowMonthPicker] = useState(false);

  // Generate list of last 24 months for quick selection
  const generateMonthOptions = () => {
    const options = [];
    const today = new Date();
    for (let i = 0; i < 24; i++) {
      const date = new Date(today.getFullYear(), today.getMonth() - i, 1);
      options.push(date);
    }
    return options;
  };

  const monthOptions = generateMonthOptions();

  // Dynamic Chart Colors
  const CHART_COLORS = [
    colors.chart1,
    colors.chart2,
    colors.chart3,
    colors.chart4,
    colors.chart5,
  ];

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      const monthStr = `${currentDate.getFullYear()}-${String(
        currentDate.getMonth() + 1
      ).padStart(2, "0")}-01`;

      const { metrics, distribution, trend } = await getAnalyticsData(monthStr);
      const fetchedInsights = await getSmartInsights(monthStr);
      setMetrics(metrics);
      setDistributions(distribution);
      setTrend(trend);
      setInsights(fetchedInsights);
      setLoading(false);
    };
    loadData();
  }, [currentDate]);

  // Close month picker when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest(".month-picker-container")) {
        setShowMonthPicker(false);
      }
    };

    if (showMonthPicker) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showMonthPicker]);

  if (loading) {
    return (
      <div className="p-8 text-center text-text-muted">
        Loading analytics...
      </div>
    );
  }

  // Derived stats
  const totalSpent = metrics?.total_expenses || 0;
  const daysInMonth = 30; // Approximation
  const avgDaily = totalSpent / daysInMonth;
  // Income vs Expense Chart Data (Current Month)
  const comparisonData = [
    {
      name: "Current",
      value: metrics?.total_income || 0,
      secondary: metrics?.total_expenses || 0,
    },
  ];

  const handleExport = () => {
    if (!metrics) return;
    const rows = [
      ["Metric", "Value"],
      ["Total Income", metrics.total_income],
      ["Total Expenses", metrics.total_expenses],
      ["Net Savings", metrics.net_savings],
      [],
      ["Category", "Amount"],
      ...distributions.map((d) => [d.name, d.value]),
    ];

    const csvContent =
      "data:text/csv;charset=utf-8," + rows.map((e) => e.join(",")).join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "financial_analytics.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-8 animate-fade-in pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-end gap-6">
        <div>
          <h1 className="text-3xl font-extrabold text-text-primary tracking-tight mb-2">
            Financial Analytics
          </h1>
          <p className="text-text-muted font-medium">
            Deep dive into your spending habits and trends.
          </p>
        </div>
        <div className="flex gap-3">
          {/* Month Picker Dropdown */}
          <div className="relative month-picker-container">
            <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-bg-primary/60 backdrop-blur-md border border-surface-glass-border text-text-secondary">
              <button
                onClick={() =>
                  setCurrentDate(
                    new Date(
                      currentDate.getFullYear(),
                      currentDate.getMonth() - 1,
                      1
                    )
                  )
                }
                className="p-1 rounded-full transition-colors hover:bg-bg-tertiary">
                <ChevronLeft className="w-4 h-4 text-text-muted" />
              </button>
              <div
                onClick={() => setShowMonthPicker(!showMonthPicker)}
                className="flex items-center gap-2 min-w-[140px] justify-center cursor-pointer hover:bg-bg-tertiary px-2 py-1 rounded-lg transition-colors">
                <Calendar className="w-4 h-4 text-text-muted" />
                <span className="font-bold text-sm">
                  {currentDate.toLocaleDateString("en-US", {
                    month: "long",
                    year: "numeric",
                  })}
                </span>
              </div>
              <button
                onClick={() =>
                  setCurrentDate(
                    new Date(
                      currentDate.getFullYear(),
                      currentDate.getMonth() + 1,
                      1
                    )
                  )
                }
                className="p-1 rounded-full transition-colors hover:bg-bg-tertiary">
                <ChevronRight className="w-4 h-4 text-text-muted" />
              </button>
            </div>

            {/* Month Picker Dropdown */}
            {showMonthPicker && (
              <div className="absolute top-full mt-2 left-0 w-64 max-h-80 overflow-y-auto bg-white/95 dark:bg-slate-800/95 backdrop-blur-lg border border-slate-200 dark:border-slate-700 rounded-2xl shadow-2xl z-50 p-2">
                {monthOptions.map((date, idx) => {
                  const isSelected =
                    date.getMonth() === currentDate.getMonth() &&
                    date.getFullYear() === currentDate.getFullYear();
                  return (
                    <button
                      key={idx}
                      onClick={() => {
                        setCurrentDate(date);
                        setShowMonthPicker(false);
                      }}
                      className={`w-full text-left px-4 py-2.5 rounded-xl font-medium transition-colors ${
                        isSelected
                          ? "bg-brand-500 text-white"
                          : "text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700"
                      }`}>
                      {date.toLocaleDateString("en-US", {
                        month: "long",
                        year: "numeric",
                      })}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
          <button
            onClick={handleExport}
            className="flex items-center gap-2 px-6 py-2.5 bg-brand-600 text-text-inverted font-bold rounded-full hover:bg-brand-700 transition-all shadow-lg shadow-brand-500/30 active:scale-95 border border-transparent">
            <Download className="w-5 h-5" /> Export Report
          </button>
        </div>
      </div>

      {/* Summary Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          {
            label: "Total Spent",
            value: `$${totalSpent.toLocaleString()}`,
            icon: DollarSign,
            color: "text-white",
            bg: "bg-emerald-500 dark:bg-emerald-900/20",
          },
          {
            label: "Avg. Daily",
            value: `$${avgDaily.toFixed(2)}`,
            icon: Target,
            color: "text-white",
            bg: "bg-brand-500 dark:bg-brand-900/20",
          },
          {
            label: "Highest Spend",
            value: `$${Math.max(
              0,
              ...distributions.map((d) => d.value)
            ).toLocaleString()}`,
            sub:
              distributions.sort((a, b) => b.value - a.value)[0]?.name || "N/A",
            icon: TrendingUp,
            color: "text-white",
            bg: "bg-rose-500 dark:bg-rose-900/20",
          },
          {
            label: "Savings Rate",
            value: `${
              metrics?.total_income
                ? ((metrics.net_savings / metrics.total_income) * 100).toFixed(
                    1
                  )
                : 0
            }%`,
            icon: TrendingDown,
            color: "text-white",
            bg: "bg-emerald-500 dark:bg-emerald-900/20",
          },
        ].map((stat, idx) => (
          <div
            key={idx}
            className={`glass-panel p-5 rounded-2xl flex items-center justify-between animate-slide-up hover:border-brand-200 dark:hover:border-slate-700 transition-colors`}
            style={{ animationDelay: `${idx * 100}ms` }}>
            <div>
              <p className="text-xs font-bold text-text-muted uppercase tracking-wide">
                {stat.label}
              </p>
              <p className={`text-2xl font-extrabold ${stat.color} mt-1`}>
                {stat.value}
              </p>
              {stat.sub && (
                <p className="text-xs font-medium text-text-muted">
                  {stat.sub}
                </p>
              )}
            </div>
            <div className={`p-3 rounded-xl ${stat.bg} ${stat.color}`}>
              <stat.icon className="w-5 h-5" />
            </div>
          </div>
        ))}
      </div>

      {/* Main Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Income vs Expense */}
        <div
          className="glass-panel p-8 rounded-3xl animate-slide-up hover:border-brand-200 dark:hover:border-slate-700 transition-colors"
          style={{ animationDelay: "400ms" }}>
          <h3 className="text-xl font-bold text-text-primary mb-6">
            Income vs Expenses
          </h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={comparisonData}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke={colors.muted}
                  strokeOpacity={0.2}
                />
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: colors.muted, fontSize: 12 }}
                  dy={10}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: colors.muted, fontSize: 12 }}
                />
                <Tooltip
                  cursor={{ fill: colors.secondary, opacity: 0.1 }}
                  contentStyle={{
                    borderRadius: "16px",
                    border: "1px solid var(--surface-glass-border)",
                    boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
                    backgroundColor: "var(--surface-glass)",
                    backdropFilter: "blur(12px)",
                    color: "var(--text-primary)",
                  }}
                  itemStyle={{ color: "var(--text-primary)", fontWeight: 600 }}
                  labelStyle={{
                    color: "var(--text-muted)",
                    marginBottom: "0.5rem",
                  }}
                />
                <Legend
                  iconType="circle"
                  wrapperStyle={{ paddingTop: "20px" }}
                />
                <Bar
                  dataKey="value"
                  name="Income"
                  fill={colors.chart2}
                  radius={[4, 4, 0, 0]}
                  barSize={20}
                />
                <Bar
                  dataKey="secondary"
                  name="Expenses"
                  fill={colors.chart4}
                  radius={[4, 4, 0, 0]}
                  barSize={20}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Breakdown */}
        <div
          className="glass-panel p-8 rounded-3xl animate-slide-up hover:border-brand-200 dark:hover:border-slate-700 transition-colors"
          style={{ animationDelay: "500ms" }}>
          <h3 className="text-xl font-bold text-text-primary mb-6">
            Spending by Category
          </h3>
          <div className="h-[300px] flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={distributions}
                  cx="50%"
                  cy="50%"
                  innerRadius={80}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value">
                  {distributions.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={CHART_COLORS[index % CHART_COLORS.length]}
                      stroke="none"
                    />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    borderRadius: "16px",
                    border: "1px solid var(--surface-glass-border)",
                    boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
                    backgroundColor: "var(--surface-glass)",
                    backdropFilter: "blur(12px)",
                    color: "var(--text-primary)",
                  }}
                  itemStyle={{ color: "var(--text-primary)", fontWeight: 600 }}
                />
                <Legend
                  layout="vertical"
                  verticalAlign="middle"
                  align="right"
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Spending Trend Area Chart */}
      <div
        className="glass-panel p-8 rounded-3xl animate-slide-up hover:border-brand-200 dark:hover:border-slate-700 transition-colors"
        style={{ animationDelay: "600ms" }}>
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-text-primary">
            Weekly Spending Trend
          </h3>
          <div className="flex gap-2">
            <span className="flex items-center gap-1 text-xs font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 px-2 py-1 rounded-md">
              <TrendingDown className="w-3 h-3" /> 12% vs last week
            </span>
          </div>
        </div>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={trend}
              margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient
                  id="analyticsGradient"
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1">
                  <stop
                    offset="5%"
                    stopColor={colors.chart1}
                    stopOpacity={0.3}
                  />
                  <stop
                    offset="95%"
                    stopColor={colors.chart1}
                    stopOpacity={0}
                  />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke={colors.muted}
                strokeOpacity={0.2}
              />
              <XAxis
                dataKey="day_label"
                axisLine={false}
                tickLine={false}
                tick={{ fill: colors.muted, fontSize: 12 }}
                dy={10}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: colors.muted, fontSize: 12 }}
              />
              <Tooltip
                contentStyle={{
                  borderRadius: "16px",
                  border: "1px solid var(--surface-glass-border)",
                  boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
                  backgroundColor: "var(--surface-glass)",
                  backdropFilter: "blur(12px)",
                  color: "var(--text-primary)",
                }}
                itemStyle={{ color: "var(--text-primary)", fontWeight: 600 }}
                labelStyle={{
                  color: "var(--text-muted)",
                  marginBottom: "0.5rem",
                }}
              />
              <Area
                type="monotone"
                dataKey="amount"
                stroke={colors.chart1}
                strokeWidth={3}
                fillOpacity={1}
                fill="url(#analyticsGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* AI Insights Section */}
      <div
        className="glass-panel p-8 rounded-3xl bg-gradient-to-br from-brand-600 to-amber-600 dark:from-slate-800 dark:to-slate-900 text-white animate-slide-up shadow-xl shadow-brand-900/20 dark:shadow-slate-900/20"
        style={{ animationDelay: "700ms" }}>
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-white/10 rounded-lg backdrop-blur-md">
            <Target className="w-5 h-5 text-brand-300" />
          </div>
          <h3 className="text-xl font-bold">Smart Insights</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {insights.length > 0 ? (
            insights.slice(0, 2).map((insight, idx) => (
              <p
                key={idx}
                className="text-slate-700 dark:text-slate-300 leading-relaxed">
                <strong className="text-brand-600 dark:text-brand-300 font-bold">
                  {insight.title}:
                </strong>{" "}
                {insight.message}
              </p>
            ))
          ) : (
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed col-span-2">
              <strong className="text-brand-600 dark:text-brand-300 font-bold">
                No Insights Available:
              </strong>{" "}
              Start tracking your expenses to see personalized insights here.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Analytics;
