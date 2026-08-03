import React, { useState, useEffect, useRef } from 'react';
import { useData } from '../contexts/DataContext';
import { MonthlyMetrics, CategoryDistribution, SpendingTrend } from '../types';
import { useThemeColors } from '../lib/theme';
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
} from 'recharts';
import {
  Calendar,
  Download,
  DollarSign,
  Target,
  TrendingUp,
  TrendingDown,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Camera,
} from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';

export const Analytics: React.FC = () => {
  const { getAnalyticsData, getSmartInsights, currencySymbol } = useData();
  const colors = useThemeColors();

  const [metrics, setMetrics] = useState<MonthlyMetrics | null>(null);
  const [distributions, setDistributions] = useState<CategoryDistribution[]>([]);
  const [trend, setTrend] = useState<SpendingTrend[]>([]);
  const [insights, setInsights] = useState<any[]>([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [loading, setLoading] = useState(true);
  const [showMonthPicker, setShowMonthPicker] = useState(false);
  const velocityChartRef = useRef<HTMLDivElement>(null);

  const CHART_COLORS = [
    '#00f2ff',
    '#7c3aed',
    '#00ff9d',
    '#ffb800',
    '#ff3b5c',
  ];

  const velocityGradientColor =
    metrics && metrics.net_savings < 0 ? '#ff3b5c' : '#00f2ff';

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

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      const monthStr = `${currentDate.getFullYear()}-${String(
        currentDate.getMonth() + 1
      ).padStart(2, '0')}-01`;

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

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('.month-picker-container')) {
        setShowMonthPicker(false);
      }
    };
    if (showMonthPicker) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showMonthPicker]);

  const handleExportChartImage = () => {
    if (!velocityChartRef.current) return;
    const svgElement = velocityChartRef.current.querySelector('svg');
    if (!svgElement) return;

    const svgData = new XMLSerializer().serializeToString(svgElement);
    const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
    const URL = window.URL || window.webkitURL || window;
    const blobURL = URL.createObjectURL(svgBlob);

    const link = document.createElement('a');
    link.href = blobURL;
    link.download = `financial_velocity_chart_${currentDate.toISOString().slice(0, 7)}.svg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <div className="p-12 text-center text-[var(--text-muted)] font-mono text-sm">
        <span className="inline-block animate-spin mr-2">⚡</span> Loading Financial Intelligence...
      </div>
    );
  }

  const totalSpent = metrics?.total_expenses || 0;
  const avgDaily = totalSpent / 30;
  const comparisonData = [
    {
      name: 'Current Month',
      Income: metrics?.total_income || 0,
      Expenses: metrics?.total_expenses || 0,
    },
  ];

  const handleExport = () => {
    if (!metrics) return;
    const rows = [
      ['Metric', 'Value'],
      ['Total Income', metrics.total_income],
      ['Total Expenses', metrics.total_expenses],
      ['Net Savings', metrics.net_savings],
      [],
      ['Category', 'Amount'],
      ...distributions.map((d) => [d.name, d.value]),
    ];

    const csvContent =
      'data:text/csv;charset=utf-8,' + rows.map((e) => e.join(',')).join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'financial_analytics_report.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const savingsRate = metrics?.total_income
    ? ((metrics.net_savings / metrics.total_income) * 100).toFixed(1)
    : '0';

  return (
    <div className="space-y-6 pb-20 animate-fade-in">
      {/* Top Header & Period Selector */}
      <section className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold font-display text-[var(--text-primary)] tracking-tight">
            Financial Intelligence
          </h1>
          <p className="text-sm font-medium text-[var(--text-secondary)] mt-0.5">
            Deep-dive analytics, burn rate velocity, and category cash flow trends
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Month Picker Dropdown */}
          <div className="relative month-picker-container">
            <div className="flex items-center gap-1.5 p-1 rounded-xl glass-panel">
              <Button
                variant="ghost"
                size="icon"
                onClick={() =>
                  setCurrentDate(
                    new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1)
                  )
                }
              >
                <ChevronLeft className="w-4 h-4 text-[var(--text-secondary)]" />
              </Button>

              <button
                onClick={() => setShowMonthPicker(!showMonthPicker)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-[var(--surface-l2)] transition-all cursor-pointer font-mono font-bold text-xs text-[var(--text-primary)]"
              >
                <Calendar className="w-3.5 h-3.5 text-[var(--accent-primary)]" />
                <span>
                  {currentDate.toLocaleDateString('en-US', {
                    month: 'long',
                    year: 'numeric',
                  })}
                </span>
              </button>

              <Button
                variant="ghost"
                size="icon"
                onClick={() =>
                  setCurrentDate(
                    new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1)
                  )
                }
              >
                <ChevronRight className="w-4 h-4 text-[var(--text-secondary)]" />
              </Button>
            </div>

            {/* Dropdown Menu */}
            {showMonthPicker && (
              <div className="absolute top-full mt-2 left-0 w-60 max-h-72 overflow-y-auto glass-panel rounded-xl border border-[var(--border-rim)] shadow-2xl p-1.5 z-50 animate-slide-up">
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
                      className={`w-full text-left px-3 py-2 rounded-lg text-xs font-mono font-medium transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-[var(--accent-primary)] text-[var(--text-inverted)] font-bold'
                          : 'text-[var(--text-primary)] hover:bg-[var(--surface-l2)]'
                      }`}
                    >
                      {date.toLocaleDateString('en-US', {
                        month: 'long',
                        year: 'numeric',
                      })}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          <Button
            variant="glass"
            size="sm"
            onClick={handleExportChartImage}
            leftIcon={<Camera className="w-4 h-4 text-[var(--accent-primary)]" />}
          >
            Export Chart
          </Button>

          <Button
            variant="glass"
            size="sm"
            onClick={handleExport}
            leftIcon={<Download className="w-4 h-4 text-[var(--accent-primary)]" />}
          >
            Export CSV
          </Button>
        </div>
      </section>

      {/* Summary KPI Cards */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card variant="glass" hoverable glowColor="cyan">
          <div className="flex items-center justify-between pb-2">
            <span className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">
              Total Spent
            </span>
            <DollarSign className="w-4 h-4 text-[var(--danger)]" />
          </div>
          <div className="text-2xl font-bold font-mono text-[var(--text-primary)] my-1">
            {currencySymbol}
            {totalSpent.toLocaleString()}
          </div>
          <span className="text-[11px] text-[var(--text-muted)] font-mono">Monthly Total</span>
        </Card>

        <Card variant="glass" hoverable glowColor="violet">
          <div className="flex items-center justify-between pb-2">
            <span className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">
              Avg Daily Burn
            </span>
            <Target className="w-4 h-4 text-[var(--accent-primary)]" />
          </div>
          <div className="text-2xl font-bold font-mono text-[var(--text-primary)] my-1">
            {currencySymbol}
            {avgDaily.toFixed(2)}
          </div>
          <span className="text-[11px] text-[var(--text-muted)] font-mono">Daily Expense Pace</span>
        </Card>

        <Card variant="glass" hoverable glowColor="cyan">
          <div className="flex items-center justify-between pb-2">
            <span className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">
              Highest Category
            </span>
            <TrendingUp className="w-4 h-4 text-[var(--warning)]" />
          </div>
          <div className="text-2xl font-bold font-mono text-[var(--text-primary)] my-1 truncate">
            {currencySymbol}
            {Math.max(0, ...distributions.map((d) => d.value)).toLocaleString()}
          </div>
          <span className="text-[11px] text-[var(--accent-primary)] font-mono font-bold">
            {distributions.sort((a, b) => b.value - a.value)[0]?.name || 'N/A'}
          </span>
        </Card>

        <Card variant="glass" hoverable glowColor="success">
          <div className="flex items-center justify-between pb-2">
            <span className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">
              Savings Rate
            </span>
            <TrendingDown className="w-4 h-4 text-[var(--success)]" />
          </div>
          <div className="text-2xl font-bold font-mono text-[var(--success)] my-1">
            {savingsRate}%
          </div>
          <Badge variant={Number(savingsRate) >= 20 ? 'success' : 'warning'} size="sm">
            {Number(savingsRate) >= 20 ? 'Healthy' : 'Below Target'}
          </Badge>
        </Card>
      </section>

      {/* Main Charts Row */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Income vs Expenses Bar Chart */}
        <Card variant="glass">
          <h3 className="text-base font-bold font-display text-[var(--text-primary)] mb-4">
            Income vs Expense Comparison
          </h3>
          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={comparisonData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(148, 163, 184, 0.15)" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: 'var(--text-muted)', fontSize: 12 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: 'var(--text-muted)', fontSize: 12 }} />
                <Tooltip
                  cursor={{ fill: 'rgba(255, 255, 255, 0.05)' }}
                  contentStyle={{
                    borderRadius: '12px',
                    border: '1px solid var(--border-rim)',
                    backgroundColor: 'var(--surface-l2)',
                    backdropFilter: 'blur(16px)',
                    color: 'var(--text-primary)',
                  }}
                />
                <Legend iconType="circle" />
                <Bar dataKey="Income" fill="#00ff9d" radius={[6, 6, 0, 0]} barSize={28} />
                <Bar dataKey="Expenses" fill="#ff3b5c" radius={[6, 6, 0, 0]} barSize={28} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Category Breakdown Donut Chart */}
        <Card variant="glass">
          <h3 className="text-base font-bold font-display text-[var(--text-primary)] mb-4">
            Category Expenditure Breakdown
          </h3>
          <div className="h-[280px] flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={distributions}
                  cx="50%"
                  cy="50%"
                  innerRadius={70}
                  outerRadius={95}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {distributions.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} stroke="none" />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    borderRadius: '12px',
                    border: '1px solid var(--border-rim)',
                    backgroundColor: 'var(--surface-l2)',
                    backdropFilter: 'blur(16px)',
                    color: 'var(--text-primary)',
                  }}
                />
                <Legend layout="vertical" verticalAlign="middle" align="right" />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </section>

      {/* Weekly Spending Trend Area Chart */}
      <Card variant="glass">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-bold font-display text-[var(--text-primary)]">
            Weekly Velocity Trend
          </h3>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={handleExportChartImage} leftIcon={<Camera className="w-3.5 h-3.5" />}>
              Export SVG
            </Button>
            <Badge variant="cyan" size="sm">
              Live Trajectory
            </Badge>
          </div>
        </div>
        <div className="h-[280px]" ref={velocityChartRef}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={trend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="analyticsVelocityGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={velocityGradientColor} stopOpacity={0.4} />
                  <stop offset="95%" stopColor={velocityGradientColor} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(148, 163, 184, 0.15)" />
              <XAxis dataKey="day_label" axisLine={false} tickLine={false} tick={{ fill: 'var(--text-muted)', fontSize: 12 }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: 'var(--text-muted)', fontSize: 12 }} />
              <Tooltip
                contentStyle={{
                  borderRadius: '12px',
                  border: '1px solid var(--border-rim)',
                  backgroundColor: 'var(--surface-l2)',
                  backdropFilter: 'blur(16px)',
                  color: 'var(--text-primary)',
                }}
              />
              <Area
                type="monotone"
                dataKey="amount"
                stroke={velocityGradientColor}
                strokeWidth={3}
                fillOpacity={1}
                fill="url(#analyticsVelocityGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* AI Smart Financial Insights */}
      <Card variant="rim" className="bg-gradient-to-br from-[var(--surface-l1)] to-[var(--surface-l2)]">
        <div className="flex items-center gap-2.5 mb-3">
          <div className="p-2 rounded-xl bg-[var(--accent-primary-light)] text-[var(--accent-primary)] border border-[var(--accent-primary)]/30">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold font-display text-[var(--text-primary)]">
              AI Smart Financial Insights
            </h3>
            <p className="text-xs text-[var(--text-muted)]">Pattern recognition & optimization recommendations</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {insights.length > 0 ? (
            insights.slice(0, 2).map((insight, idx) => (
              <div key={idx} className="p-3.5 rounded-xl bg-[var(--surface-l2)] border border-[var(--border-rim)] text-xs text-[var(--text-secondary)] leading-relaxed">
                <strong className="text-[var(--accent-primary)] font-bold block mb-1">
                  {insight.title}
                </strong>
                {insight.message}
              </div>
            ))
          ) : (
            <div className="col-span-2 p-3.5 rounded-xl bg-[var(--surface-l2)] border border-[var(--border-rim)] text-xs text-[var(--text-secondary)]">
              <strong className="text-[var(--accent-primary)] font-bold block mb-1">
                Data Gathering In Progress:
              </strong>
              Continue logging daily transactions to unlock automated spending velocity insights and budget optimization tips.
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};

export default Analytics;
