import React, { useState } from "react";
import {
  Download,
  FileText,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Printer,
  Share2,
  TrendingUp,
  TrendingDown,
  DollarSign,
  CreditCard,
} from "lucide-react";
import { useOutletContext } from "react-router-dom";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { EXPENSE_CATEGORIES_DATA } from "../constants";
import { useThemeColors } from "../lib/theme";
import { useData } from "../contexts/DataContext";
import { MonthlyMetrics, CategoryDistribution, SpendingTrend } from "../types";

const Reports = () => {
  // const { theme } = useOutletContext<{ theme: string }>(); // Removed: using semantic classes
  const themeColors = useThemeColors();
  const COLORS = [
    themeColors.chart1,
    themeColors.chart2,
    themeColors.chart3,
    themeColors.chart4,
    themeColors.chart5,
  ];
  const { getAnalyticsData } = useData();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [metrics, setMetrics] = useState<MonthlyMetrics | null>(null);
  const [distributions, setDistributions] = useState<CategoryDistribution[]>(
    []
  );
  const [loading, setLoading] = useState(true);
  const [notes, setNotes] = useState("");

  const selectedMonth = currentDate.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  const handlePrevMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1)
    );
  };

  const handleNextMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1)
    );
  };

  React.useEffect(() => {
    const saved = localStorage.getItem(`report_notes_${selectedMonth}`);
    setNotes(saved || ""); // Default to empty
  }, [selectedMonth]);

  React.useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      // Format as YYYY-MM-01 for API
      const monthStr = `${currentDate.getFullYear()}-${String(
        currentDate.getMonth() + 1
      ).padStart(2, "0")}-01`;

      const { metrics, distribution } = await getAnalyticsData(monthStr);
      setMetrics(metrics);
      setDistributions(distribution);
      setLoading(false);
    };
    loadData();
  }, [currentDate]);

  if (loading && !metrics) {
    return <div className="p-8 text-center">Loading reports...</div>;
  }

  const handlePrint = () => {
    window.print();
  };

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      alert("Report link copied to clipboard!");
    } catch (err) {
      console.error("Failed to copy", err);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-end gap-6">
        <div>
          <h1 className="text-3xl font-extrabold text-text-primary tracking-tight mb-2">
            Monthly Report
          </h1>
          <p className="text-text-muted font-medium">
            Detailed financial summary for {selectedMonth}.
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handlePrint}
            className="p-2.5 bg-white/60 dark:bg-slate-800/60 backdrop-blur-md text-slate-700 dark:text-slate-200 rounded-full border border-white dark:border-slate-700 hover:bg-white dark:hover:bg-slate-800 transition-all shadow-sm">
            <Printer className="w-5 h-5" />
          </button>
          <button
            onClick={handleShare}
            className="p-2.5 bg-white/60 dark:bg-slate-800/60 backdrop-blur-md text-slate-700 dark:text-slate-200 rounded-full border border-white dark:border-slate-700 hover:bg-white dark:hover:bg-slate-800 transition-all shadow-sm">
            <Share2 className="w-5 h-5" />
          </button>
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-6 py-2.5 bg-brand-600 text-white font-bold rounded-full hover:bg-brand-700 transition-all shadow-lg shadow-brand-500/30 active:scale-95">
            <Download className="w-5 h-5" /> Download PDF
          </button>
        </div>
      </div>

      {/* Report Paper - Styled like a physical sheet */}
      <div className="paper-card rounded-3xl p-8 shadow-xl shadow-slate-200/50 dark:shadow-slate-900/50 border border-border-subtle animate-slide-up">
        {/* Report Header */}
        <div className="flex justify-between items-center border-b border-border-subtle pb-8 mb-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-tr from-brand-600 via-orange-500 to-amber-500 rounded-xl flex items-center justify-center shadow-lg shadow-brand-500/30">
              <CreditCard className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-text-primary">
                FinanceTask
              </h2>
              <p className="text-xs font-bold text-text-muted uppercase tracking-widest">
                Personal Finance Report
              </p>
            </div>
          </div>
          <div className="text-right">
            <div className="flex items-center gap-2 px-4 py-2 rounded-xl transition-all border bg-bg-secondary border-border-primary text-text-secondary">
              <button
                onClick={handlePrevMonth}
                className="p-1 rounded-full transition-colors hover:bg-bg-tertiary">
                <ChevronLeft className="w-4 h-4 text-text-muted" />
              </button>
              <div className="flex items-center gap-2 min-w-[140px] justify-center">
                <Calendar className="w-4 h-4 text-text-muted" />
                <span className="font-bold text-text-secondary">
                  {selectedMonth}
                </span>
              </div>
              <button
                onClick={handleNextMonth}
                className="p-1 rounded-full transition-colors hover:bg-bg-tertiary">
                <ChevronRight className="w-4 h-4 text-text-muted" />
              </button>
            </div>
          </div>
        </div>

        {/* Executive Summary */}
        <div className="grid grid-cols-3 gap-8 mb-12">
          <div className="space-y-1">
            <p className="text-xs font-bold text-text-muted uppercase">
              Total Income
            </p>
            <p className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400 flex items-center gap-2">
              ${metrics?.total_income.toLocaleString() ?? "0"}{" "}
              <TrendingUp className="w-4 h-4" />
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-xs font-bold text-text-muted uppercase">
              Total Expenses
            </p>
            <p className="text-2xl font-extrabold text-rose-500 dark:text-rose-400 flex items-center gap-2">
              ${metrics?.total_expenses.toLocaleString() ?? "0"}
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-xs font-bold text-text-muted uppercase">
              Net Savings
            </p>
            <p className="text-2xl font-extrabold text-brand-600 dark:text-brand-400">
              ${metrics?.net_savings.toLocaleString() ?? "0"}
            </p>
          </div>
        </div>

        {/* Visual Breakdown */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-12">
          <div>
            <h3 className="font-bold text-text-primary mb-6">
              Spending Distribution
            </h3>
            <div className="h-64 relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={distributions}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value">
                    {distributions.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={entry.color || COLORS[index % COLORS.length]}
                        stroke="none"
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="text-center">
                  <p className="text-xs text-text-muted font-bold uppercase">
                    Total
                  </p>
                  <p className="text-xl font-extrabold text-text-primary kpi-value-text">
                    ${metrics?.total_expenses.toLocaleString() ?? "0"}
                  </p>
                </div>
              </div>
            </div>
          </div>
          <div>
            <h3 className="font-bold text-text-primary mb-4">
              Top Spending Categories
            </h3>
            <div className="space-y-4">
              {distributions.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{
                        backgroundColor:
                          item.color || COLORS[idx % COLORS.length],
                      }}
                    />
                    <span className="font-medium text-text-secondary">
                      {item.name}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-text-primary">
                      ${item.value.toLocaleString()}
                    </span>
                    <span className="text-xs text-text-muted ml-2">
                      (
                      {metrics?.total_expenses
                        ? Math.round(
                            (item.value / metrics.total_expenses) * 100
                          )
                        : 0}
                      %)
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Insights / Notes */}
        {/* Insights / Notes */}
        <div className="rounded-2xl p-6 border bg-bg-secondary/50 border-border-primary">
          <h3 className="font-bold mb-3 text-sm uppercase flex items-center gap-2 text-text-primary">
            <FileText className="w-4 h-4 text-brand-500" /> Analyst Notes
          </h3>
          <textarea
            value={notes}
            onChange={(e) => {
              setNotes(e.target.value);
              localStorage.setItem(
                `report_notes_${selectedMonth}`,
                e.target.value
              );
            }}
            className="w-full h-32 glass-input resize-none text-sm leading-relaxed font-medium p-4 text-text-secondary placeholder:text-text-muted"
            placeholder="Add your notes specific to this month's report..."
          />
        </div>

        {/* Footer */}
        <div className="mt-12 pt-8 border-t border-border-subtle flex justify-between items-center text-xs text-text-muted">
          <span>Generated on {new Date().toLocaleDateString()}</span>
          <span>FinanceTask Automated Report</span>
        </div>
      </div>
    </div>
  );
};

export default Reports;
