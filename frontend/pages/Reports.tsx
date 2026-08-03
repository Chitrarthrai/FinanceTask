import React, { useState, useEffect } from 'react';
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
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { useData } from '../contexts/DataContext';
import { MonthlyMetrics, CategoryDistribution } from '../types';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Logo } from '../components/common/Logo';

export const Reports: React.FC = () => {
  const { getAnalyticsData, currencySymbol } = useData();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [metrics, setMetrics] = useState<MonthlyMetrics | null>(null);
  const [distributions, setDistributions] = useState<CategoryDistribution[]>([]);
  const [loading, setLoading] = useState(true);
  const [notes, setNotes] = useState('');

  const COLORS = ['#00f2ff', '#7c3aed', '#00ff9d', '#ffb800', '#ff3b5c'];

  const selectedMonth = currentDate.toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  });

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  useEffect(() => {
    const saved = localStorage.getItem(`report_notes_${selectedMonth}`);
    setNotes(saved || '');
  }, [selectedMonth]);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      const monthStr = `${currentDate.getFullYear()}-${String(
        currentDate.getMonth() + 1
      ).padStart(2, '0')}-01`;

      const { metrics, distribution } = await getAnalyticsData(monthStr);
      setMetrics(metrics);
      setDistributions(distribution);
      setLoading(false);
    };
    loadData();
  }, [currentDate]);

  const handlePrint = () => {
    window.print();
  };

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      alert('Report link copied to clipboard!');
    } catch (err) {
      console.error('Failed to copy', err);
    }
  };

  if (loading && !metrics) {
    return (
      <div className="p-12 text-center text-[var(--text-muted)] font-mono text-sm">
        <span className="inline-block animate-spin mr-2">⚡</span> Compiling Executive Report...
      </div>
    );
  }

  return (
    <div className="w-full space-y-6 pb-20 animate-fade-in">
      {/* Top Header & Export Toolbar */}
      <section className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold font-display text-[var(--text-primary)] tracking-tight">
            Executive Report Compiler
          </h1>
          <p className="text-sm font-medium text-[var(--text-secondary)] mt-0.5">
            Audit-grade financial statement for {selectedMonth}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="glass" size="icon" onClick={handlePrint} title="Print Report">
            <Printer className="w-4 h-4 text-[var(--text-secondary)]" />
          </Button>
          <Button variant="glass" size="icon" onClick={handleShare} title="Share Link">
            <Share2 className="w-4 h-4 text-[var(--text-secondary)]" />
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={handlePrint}
            leftIcon={<Download className="w-4 h-4" />}
          >
            Download PDF
          </Button>
        </div>
      </section>

      {/* Print-Ready Report Card */}
      <Card variant="rim" className="p-8 space-y-8 bg-[var(--surface-l1)]">
        {/* Statement Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-6 border-b border-[var(--border-rim)]">
          <Logo size="md" />

          {/* Month Selector */}
          <div className="flex items-center gap-1 p-1 rounded-xl glass-panel">
            <Button variant="ghost" size="icon" onClick={handlePrevMonth}>
              <ChevronLeft className="w-4 h-4 text-[var(--text-secondary)]" />
            </Button>
            <span className="flex items-center gap-2 px-3 py-1 text-xs font-mono font-bold text-[var(--text-primary)]">
              <Calendar className="w-3.5 h-3.5 text-[var(--accent-primary)]" />
              {selectedMonth}
            </span>
            <Button variant="ghost" size="icon" onClick={handleNextMonth}>
              <ChevronRight className="w-4 h-4 text-[var(--text-secondary)]" />
            </Button>
          </div>
        </div>

        {/* Executive Metrics Summary */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 font-mono">
          <div className="p-4 rounded-xl bg-[var(--surface-l2)] border border-[var(--border-rim)]">
            <span className="text-xs uppercase tracking-wider text-[var(--text-muted)] font-semibold">
              Total Credit Income
            </span>
            <div className="text-2xl font-bold text-[var(--success)] mt-1 flex items-center gap-2">
              {currencySymbol}
              {metrics?.total_income.toLocaleString() ?? '0'}
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>

          <div className="p-4 rounded-xl bg-[var(--surface-l2)] border border-[var(--border-rim)]">
            <span className="text-xs uppercase tracking-wider text-[var(--text-muted)] font-semibold">
              Total Debit Expenses
            </span>
            <div className="text-2xl font-bold text-[var(--danger)] mt-1 flex items-center gap-2">
              {currencySymbol}
              {metrics?.total_expenses.toLocaleString() ?? '0'}
              <TrendingDown className="w-4 h-4" />
            </div>
          </div>

          <div className="p-4 rounded-xl bg-[var(--surface-l2)] border border-[var(--border-rim)]">
            <span className="text-xs uppercase tracking-wider text-[var(--text-muted)] font-semibold">
              Net Savings Balance
            </span>
            <div className="text-2xl font-bold text-[var(--accent-primary)] mt-1">
              {currencySymbol}
              {metrics?.net_savings.toLocaleString() ?? '0'}
            </div>
          </div>
        </div>

        {/* Visual Breakdown */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
          <div>
            <h3 className="text-sm font-bold font-display uppercase tracking-wider text-[var(--text-primary)] mb-4">
              Spending Distribution
            </h3>
            <div className="h-56 relative flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={distributions}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={75}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {distributions.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="none" />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      borderRadius: '12px',
                      border: '1px solid var(--border-rim)',
                      backgroundColor: 'var(--surface-l2)',
                      color: 'var(--text-primary)',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-[10px] uppercase font-mono tracking-wider text-[var(--text-muted)] font-semibold">
                  Total
                </span>
                <span className="text-lg font-bold font-mono text-[var(--text-primary)]">
                  {currencySymbol}
                  {metrics?.total_expenses.toLocaleString() ?? '0'}
                </span>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-bold font-display uppercase tracking-wider text-[var(--text-primary)] mb-4">
              Category Breakdown
            </h3>
            <div className="space-y-3 font-mono">
              {distributions.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: COLORS[idx % COLORS.length] }}
                    />
                    <span className="font-semibold text-[var(--text-primary)]">{item.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-[var(--text-primary)]">
                      {currencySymbol}
                      {item.value.toLocaleString()}
                    </span>
                    <span className="text-[11px] text-[var(--text-muted)]">
                      (
                      {metrics?.total_expenses
                        ? Math.round((item.value / metrics.total_expenses) * 100)
                        : 0}
                      %)
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Analyst Notes Box */}
        <div className="pt-4">
          <label className="block text-xs font-bold font-display uppercase tracking-wider text-[var(--text-primary)] mb-2 flex items-center gap-2">
            <FileText className="w-4 h-4 text-[var(--accent-primary)]" /> Executive Notes & Analysis
          </label>
          <textarea
            value={notes}
            onChange={(e) => {
              setNotes(e.target.value);
              localStorage.setItem(`report_notes_${selectedMonth}`, e.target.value);
            }}
            className="w-full glass-input rounded-xl p-4 text-xs font-mono leading-relaxed"
            rows={4}
            placeholder="Add analyst notes specific to this monthly report..."
          />
        </div>

        {/* Footer Seal */}
        <div className="pt-6 border-t border-[var(--border-rim)] flex justify-between items-center text-[10px] font-mono text-[var(--text-muted)]">
          <span>Generated: {new Date().toLocaleDateString()}</span>
          <span>FinanceTask Titanium Audit Seal</span>
        </div>
      </Card>
    </div>
  );
};

export default Reports;
