import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowUpRight,
  ArrowRight,
  Clock,
  Plus,
  AlertCircle,
  RotateCcw,
  Wallet,
  CreditCard,
  PiggyBank,
  TrendingUp,
  DollarSign,
} from 'lucide-react';
import { useData } from '../contexts/DataContext';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { KpiWidget } from '../components/ui/KpiWidget';
import TransactionModal from '../components/TransactionModal';
import {
  SpendingOverview,
  CategoryDistribution,
} from '../components/DashboardCharts';

export const Dashboard: React.FC = () => {
  const navigate = useNavigate();

  const {
    transactions,
    tasks,
    metrics,
    categoryWarnings,
    undoItem,
    undoLastDelete,
    currencySymbol,
  } = useData();

  const [timeRange, setTimeRange] = useState('Week');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const percentUsed =
    metrics.dailyLimit > 0
      ? Math.min(100, Math.round((metrics.spentToday / metrics.dailyLimit) * 100))
      : 0;

  const recentTransactions = transactions.slice(0, 4);
  const upcomingTasks = tasks.filter((t) => t.status !== 'completed').slice(0, 4);

  // Category chart distribution data
  const categoryData = useMemo(() => {
    const expenseTrans = transactions.filter((t) => t.type === 'expense');
    const grouped = expenseTrans.reduce((acc, curr) => {
      acc[curr.category] = (acc[curr.category] || 0) + curr.amount;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(grouped).map(([name, value]) => ({ name, value }));
  }, [transactions]);

  // Spending trend chart data
  const spendingData = useMemo(() => {
    const today = new Date();
    let labels: string[] = [];
    let dataMap: Record<string, number> = {};

    if (timeRange === 'Week') {
      labels = Array.from({ length: 7 }, (_, i) => {
        const d = new Date();
        d.setDate(today.getDate() - (6 - i));
        return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      });
    } else if (timeRange === 'Month') {
      labels = Array.from({ length: 30 }, (_, i) => {
        const d = new Date();
        d.setDate(today.getDate() - (29 - i));
        return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      });
    } else if (timeRange === 'Year') {
      labels = Array.from({ length: 12 }, (_, i) => {
        const d = new Date();
        d.setMonth(today.getMonth() - (11 - i));
        return d.toLocaleDateString('en-US', { month: 'short' });
      });
    }

    transactions
      .filter((t) => t.type === 'expense')
      .forEach((t) => {
        const d = new Date(t.date);
        const key =
          timeRange === 'Year'
            ? d.toLocaleDateString('en-US', { month: 'short' })
            : d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        if (labels.includes(key)) {
          dataMap[key] = (dataMap[key] || 0) + t.amount;
        }
      });

    return labels.map((label) => ({
      name: label,
      value: dataMap[label] || 0,
      secondary: 0,
    }));
  }, [transactions, timeRange]);

  return (
    <div className="space-y-6 pb-20 animate-fade-in">
      {/* 1. Hero Header & Quick Action */}
      <section className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold font-display text-[var(--text-primary)] tracking-tight">
            Executive Overview
          </h1>
          <p className="text-sm font-medium text-[var(--text-secondary)] mt-0.5">
            Daily Budget Pool:{' '}
            <span className="font-mono font-bold text-[var(--accent-primary)]">
              {currencySymbol}
              {Math.max(0, metrics.remainingToday).toFixed(2)}
            </span>{' '}
            remaining today.
          </p>
        </div>
        <Button
          variant="primary"
          onClick={() => setIsModalOpen(true)}
          leftIcon={<Plus className="w-4 h-4" />}
        >
          Add Transaction
        </Button>
      </section>

      {/* 2. Category Budget Alert Banners */}
      {categoryWarnings.length > 0 && (
        <div className="space-y-2">
          {categoryWarnings.map((warn) => (
            <div
              key={warn.category}
              className={`p-3.5 rounded-xl border flex items-center justify-between backdrop-blur-md ${
                warn.level === 'critical'
                  ? 'bg-[var(--danger)]/15 border-[var(--danger)]/30 text-[var(--danger)]'
                  : 'bg-[var(--warning)]/15 border-[var(--warning)]/30 text-[var(--warning)]'
              }`}
            >
              <div className="flex items-center gap-3">
                <AlertCircle className="w-5 h-5 shrink-0" />
                <div>
                  <h4 className="font-bold text-xs">
                    {warn.level === 'critical' ? 'Budget Limit Breached' : 'Budget Warning'} —{' '}
                    {warn.category}
                  </h4>
                  <p className="text-[11px] opacity-90 font-mono">
                    Spent {currencySymbol}
                    {warn.spent.toLocaleString()} of {currencySymbol}
                    {warn.limit.toLocaleString()} ({warn.percent}%)
                  </p>
                </div>
              </div>
              <Badge variant={warn.level === 'critical' ? 'danger' : 'warning'} size="sm" pulse>
                {warn.percent}% Used
              </Badge>
            </div>
          ))}
        </div>
      )}

      {/* 3. Hero KPI Bento Grid */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiWidget
          title="Monthly Income"
          value={`${currencySymbol}${metrics.totalIncome.toLocaleString()}`}
          icon={<Wallet className="w-5 h-5 text-[var(--accent-primary)]" />}
          glowColor="cyan"
          subtitle="Fixed Monthly Base"
        />
        <KpiWidget
          title="Fixed Expenses"
          value={`${currencySymbol}${metrics.totalFixedExpenses.toLocaleString()}`}
          icon={<CreditCard className="w-5 h-5 text-[var(--danger)]" />}
          glowColor="violet"
          subtitle="Recurring Commitments"
        />
        <KpiWidget
          title="Pocket Money Pool"
          value={`${currencySymbol}${metrics.pocketMoneyPool.toLocaleString()}`}
          icon={<PiggyBank className="w-5 h-5 text-[var(--accent-secondary)]" />}
          glowColor="violet"
          subtitle={`Health: ${metrics.budgetHealth}`}
        />
        <KpiWidget
          title="Total Savings Target"
          value={`${currencySymbol}${metrics.totalSavings.toLocaleString()}`}
          icon={<TrendingUp className="w-5 h-5 text-[var(--success)]" />}
          glowColor="success"
          isPositive={metrics.savingsTrend >= 0}
          change={metrics.savingsTrend ? `${Math.abs(metrics.savingsTrend).toFixed(1)}%` : undefined}
          subtitle="Net Asset Savings"
        />
      </section>

      {/* 4. Bento Grid Main Content Row */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Spending Analysis Chart */}
        <Card variant="glass" className="lg:col-span-2 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-bold font-display text-[var(--text-primary)]">
                Spending Trend Analysis
              </h3>
              <p className="text-xs text-[var(--text-secondary)] font-medium">
                Historical cash flow expenditure
              </p>
            </div>
            <div className="flex p-1 rounded-xl bg-[var(--surface-l2)] border border-[var(--border-rim)]">
              {['Week', 'Month', 'Year'].map((period) => (
                <button
                  key={period}
                  onClick={() => setTimeRange(period)}
                  className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                    timeRange === period
                      ? 'bg-[var(--accent-primary)] text-[var(--text-inverted)] shadow-sm'
                      : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
                  }`}
                >
                  {period}
                </button>
              ))}
            </div>
          </div>
          <div className="pt-2">
            <SpendingOverview data={spendingData} />
          </div>
        </Card>

        {/* Daily Limit & Category Distribution Cards */}
        <div className="space-y-6">
          {/* Daily Limit Progress Card */}
          <Card variant="rim" className="bg-gradient-to-br from-[var(--surface-l1)] to-[var(--surface-l2)]">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold font-display uppercase tracking-wider text-[var(--text-secondary)]">
                Daily Budget Limit
              </span>
              <Badge variant={percentUsed >= 100 ? 'danger' : 'cyan'} size="sm" pulse>
                {percentUsed}% Used
              </Badge>
            </div>

            <div className="flex items-baseline gap-2 mb-3 font-mono">
              <span className="text-3xl font-extrabold text-[var(--text-primary)]">
                {currencySymbol}
                {metrics.spentToday.toFixed(0)}
              </span>
              <span className="text-xs text-[var(--text-muted)]">
                / {currencySymbol}
                {metrics.dailyLimit.toFixed(0)}
              </span>
            </div>

            <div className="h-2 bg-[var(--surface-l2)] rounded-full overflow-hidden mb-3 border border-[var(--border-rim)]">
              <div
                className={`h-full rounded-full transition-all duration-1000 ${
                  percentUsed >= 100 ? 'bg-[var(--danger)]' : 'bg-[var(--accent-primary)]'
                }`}
                style={{ width: `${percentUsed}%` }}
              />
            </div>

            <p className="text-xs font-medium text-[var(--text-secondary)]">
              {metrics.remainingToday >= 0 ? (
                <>
                  Remaining today:{' '}
                  <span className="font-mono font-bold text-[var(--success)]">
                    {currencySymbol}
                    {metrics.remainingToday.toFixed(2)}
                  </span>
                </>
              ) : (
                <>
                  Overspent by:{' '}
                  <span className="font-mono font-bold text-[var(--danger)]">
                    {currencySymbol}
                    {Math.abs(metrics.remainingToday).toFixed(2)}
                  </span>
                </>
              )}
            </p>
          </Card>

          {/* Category Distribution Card */}
          <Card variant="glass">
            <h3 className="text-base font-bold font-display text-[var(--text-primary)] mb-3">
              Category Distribution
            </h3>
            <CategoryDistribution data={categoryData} />
          </Card>
        </div>
      </section>

      {/* 5. Bottom Lists Row */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Transactions Table Preview */}
        <Card variant="glass">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold font-display text-[var(--text-primary)]">
              Recent Transactions
            </h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/app/transactions')}
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              View Ledger
            </Button>
          </div>

          <div className="space-y-2">
            {recentTransactions.map((t) => (
              <div
                key={t.id}
                className="flex items-center justify-between p-3 rounded-xl hover:bg-[var(--surface-l2)] transition-all group cursor-pointer border border-transparent hover:border-[var(--border-rim)]"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center text-white font-bold text-xs ${
                      t.type === 'expense'
                        ? 'bg-[var(--danger)]/80'
                        : 'bg-[var(--success)]/80'
                    }`}
                  >
                    {t.type === 'expense' ? (
                      <ArrowUpRight className="w-4 h-4" />
                    ) : (
                      <ArrowUpRight className="w-4 h-4 rotate-180" />
                    )}
                  </div>
                  <div>
                    <p className="font-bold text-sm text-[var(--text-primary)]">{t.title}</p>
                    <p className="text-[11px] text-[var(--text-muted)]">
                      {t.date} • {t.category}
                    </p>
                  </div>
                </div>
                <span
                  className={`font-mono font-bold text-sm ${
                    t.type === 'expense'
                      ? 'text-[var(--text-primary)]'
                      : 'text-[var(--success)]'
                  }`}
                >
                  {t.type === 'expense' ? '-' : '+'}{currencySymbol}
                  {Number(t.amount).toFixed(2)}
                </span>
              </div>
            ))}
          </div>
        </Card>

        {/* Task Kanban Overview Preview */}
        <Card variant="glass">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold font-display text-[var(--text-primary)]">
              Task Priority Queue
            </h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/app/tasks')}
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              Task Board
            </Button>
          </div>

          <div className="space-y-2">
            {upcomingTasks.map((task) => (
              <div
                key={task.id}
                className="flex items-center justify-between p-3 rounded-xl border border-[var(--border-rim)] bg-[var(--surface-l2)]/50 hover:bg-[var(--surface-l2)] transition-all group cursor-pointer"
              >
                <div className="flex-1">
                  <p className="font-semibold text-sm text-[var(--text-primary)]">
                    {task.title}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge
                      variant={
                        task.priority === 'high'
                          ? 'danger'
                          : task.priority === 'medium'
                          ? 'warning'
                          : 'cyan'
                      }
                      size="sm"
                    >
                      {task.priority}
                    </Badge>
                    <span className="text-[11px] text-[var(--text-muted)] flex items-center gap-1 font-mono">
                      <Clock className="w-3 h-3" />
                      {task.dueDate}
                    </span>
                  </div>
                </div>
              </div>
            ))}

            <Button
              variant="ghost"
              onClick={() => navigate('/app/tasks')}
              className="w-full mt-2 border border-dashed border-[var(--border-rim)]"
              leftIcon={<Plus className="w-4 h-4" />}
            >
              Add New Task
            </Button>
          </div>
        </Card>
      </section>

      {/* 6. Floating Undo Toast Notification */}
      {undoItem && (
        <div className="fixed bottom-6 right-6 z-50 glass-panel p-4 rounded-2xl border border-[var(--accent-primary)]/40 shadow-2xl flex items-center gap-4 animate-slide-up">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-[var(--accent-primary)]">
              Deleted {undoItem.type}
            </p>
            <p className="text-xs text-[var(--text-primary)] font-medium">
              {(undoItem.data as any).title || 'Item'}
            </p>
          </div>
          <Button
            variant="primary"
            size="sm"
            onClick={undoLastDelete}
            leftIcon={<RotateCcw className="w-3.5 h-3.5" />}
          >
            Undo
          </Button>
        </div>
      )}

      {/* Transaction Add Modal */}
      <TransactionModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
};

export default Dashboard;
