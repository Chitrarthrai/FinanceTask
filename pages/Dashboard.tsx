import React from 'react';
import { useNavigate } from 'react-router-dom';
import KPICard from '../components/KPICard';
import { KPI_MOCK_DATA, RECENT_TRANSACTIONS, UPCOMING_TASKS } from '../constants';
import { SpendingOverview, CategoryDistribution } from '../components/DashboardCharts';
import { ArrowUpRight, ArrowRight, Clock, MoreVertical, Plus, Calendar } from 'lucide-react';

const Dashboard = () => {
  const navigate = useNavigate();

  return (
    <div className="space-y-8 animate-fade-in pb-20">
      
      {/* Hero Section */}
      <section className="flex flex-col md:flex-row justify-between items-end gap-6">
        <div>
          <h1 className="text-4xl font-extrabold text-slate-800 dark:text-white mb-2 tracking-tight">
            Good Morning, Alex!
          </h1>
          <p className="text-slate-500 dark:text-slate-300 text-lg font-medium">
            Your financial health looks great today.
          </p>
        </div>
        <div className="flex gap-3">
            <button 
              onClick={() => alert('Date filter feature coming soon!')}
              className="flex items-center gap-2 px-5 py-3 bg-white/60 dark:bg-slate-800/60 backdrop-blur-md text-slate-700 dark:text-slate-200 font-bold rounded-full border border-white dark:border-slate-700 hover:bg-white dark:hover:bg-slate-800 hover:text-brand-600 transition-all shadow-sm hover:shadow-md active:scale-95"
            >
              <Calendar className="w-4 h-4" />
              This Month
            </button>
            <button 
              onClick={() => navigate('/app/transactions')}
              className="flex items-center gap-2 px-6 py-3 bg-brand-500 text-white font-bold rounded-full hover:bg-brand-600 transition-all shadow-lg shadow-brand-500/30 hover:shadow-brand-500/40 active:scale-95"
            >
              <Plus className="w-5 h-5" />
              Quick Add
            </button>
        </div>
      </section>

      {/* KPI Grid */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {KPI_MOCK_DATA.map((kpi, index) => (
          <KPICard key={kpi.label} data={kpi} delay={index} />
        ))}
      </section>

      {/* Charts & Widgets */}
      <section className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Main Chart */}
        <div className="xl:col-span-2 glass-panel p-8 rounded-3xl animate-slide-up hover:border-white/80 dark:hover:border-white/20 transition-colors" style={{ animationDelay: '400ms' }}>
          <div className="flex justify-between items-center mb-8">
            <div>
              <h3 className="text-xl font-bold text-slate-800 dark:text-white">Spending Analysis</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">Your spending trend over time</p>
            </div>
            <div className="flex bg-slate-100/50 dark:bg-slate-800/50 p-1 rounded-xl">
              {['Week', 'Month', 'Year'].map(period => (
                <button key={period} className={`px-4 py-1.5 text-sm font-semibold rounded-lg transition-all ${period === 'Week' ? 'bg-white dark:bg-slate-700 shadow-sm text-brand-600 dark:text-brand-400' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}`}>
                  {period}
                </button>
              ))}
            </div>
          </div>
          <SpendingOverview />
        </div>

        {/* Side Widgets Column */}
        <div className="space-y-6">
            {/* Category Chart */}
          <div className="glass-panel p-8 rounded-3xl animate-slide-up flex flex-col justify-center min-h-[350px]" style={{ animationDelay: '500ms' }}>
            <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-2">Expenses by Category</h3>
            <CategoryDistribution />
          </div>

          {/* Daily Goal Card */}
          <div className="bg-gradient-to-br from-slate-800 to-slate-900 p-8 rounded-3xl text-white shadow-2xl shadow-slate-900/20 relative overflow-hidden animate-slide-up" style={{ animationDelay: '600ms' }}>
            <div className="relative z-10">
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-bold text-xl">Daily Limit</h3>
                <span className="bg-white/10 px-3 py-1 rounded-full text-xs font-bold backdrop-blur-md border border-white/10">75% Used</span>
              </div>
              <div className="flex items-baseline gap-2 mb-6">
                  <span className="text-5xl font-extrabold tracking-tight">$34</span>
                  <span className="text-slate-400 font-medium text-lg">/ $45</span>
              </div>
              <div className="h-2.5 bg-slate-700/50 rounded-full overflow-hidden mb-4">
                  <div className="h-full bg-gradient-to-r from-brand-400 to-brand-300 w-3/4 rounded-full shadow-[0_0_15px_rgba(251,146,60,0.5)]" />
              </div>
              <p className="text-sm text-slate-300 font-medium">You have <span className="text-brand-300">$11 left</span> for today's budget.</p>
            </div>
            
            {/* Abstract blobs */}
            <div className="absolute top-[-20%] right-[-10%] w-48 h-48 bg-brand-500/20 rounded-full blur-3xl" />
            <div className="absolute bottom-[-20%] left-[-10%] w-40 h-40 bg-indigo-500/20 rounded-full blur-3xl" />
          </div>
        </div>
      </section>

      {/* Lists Row */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6 pb-8">
        
        {/* Recent Transactions */}
        <div className="glass-panel p-8 rounded-3xl animate-slide-up" style={{ animationDelay: '700ms' }}>
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold text-slate-800 dark:text-white">Recent Transactions</h3>
            <button 
              onClick={() => navigate('/app/transactions')}
              className="text-brand-600 dark:text-brand-400 text-sm font-bold hover:text-brand-700 flex items-center gap-1 px-3 py-1.5 rounded-lg hover:bg-brand-50 dark:hover:bg-brand-900/30 transition-colors"
            >
              View All <ArrowRight className="w-4 h-4" />
            </button>
          </div>
          <div className="space-y-2">
            {RECENT_TRANSACTIONS.map((t) => (
              <div key={t.id} className="flex items-center justify-between p-4 rounded-2xl hover:bg-white/40 dark:hover:bg-white/5 transition-all group cursor-pointer border border-transparent hover:border-white/50 dark:hover:border-white/10">
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-colors shadow-sm ${
                    t.type === 'expense' ? 'bg-rose-50 dark:bg-rose-900/20 text-rose-500' : 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-500'
                  }`}>
                    {t.type === 'expense' ? <ArrowUpRight className="w-6 h-6" /> : <ArrowUpRight className="w-6 h-6 rotate-180" />}
                  </div>
                  <div>
                    <p className="font-bold text-slate-800 dark:text-white text-base">{t.title}</p>
                    <p className="text-xs font-medium text-slate-400 dark:text-slate-500 mt-0.5">{t.date} • {t.category}</p>
                  </div>
                </div>
                <span className={`font-bold text-lg ${t.type === 'expense' ? 'text-slate-800 dark:text-slate-200' : 'text-emerald-600 dark:text-emerald-400'}`}>
                  {t.type === 'expense' ? '-' : '+'}${t.amount.toFixed(2)}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Upcoming Tasks */}
        <div className="glass-panel p-8 rounded-3xl animate-slide-up" style={{ animationDelay: '800ms' }}>
            <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold text-slate-800 dark:text-white">Upcoming Tasks</h3>
            <button 
              onClick={() => navigate('/app/tasks')}
              className="p-2 hover:bg-white/50 dark:hover:bg-white/10 rounded-xl transition-colors"
            >
              <MoreVertical className="w-5 h-5 text-slate-400 dark:text-slate-500" />
            </button>
          </div>
          <div className="space-y-3">
            {UPCOMING_TASKS.map((task) => (
              <div key={task.id} className="flex items-center gap-4 p-4 border border-white/40 dark:border-white/10 rounded-2xl bg-white/20 dark:bg-white/5 hover:bg-white/60 dark:hover:bg-white/10 transition-all hover:shadow-md group cursor-pointer">
                  <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center cursor-pointer transition-all ${
                    task.status === 'completed' ? 'bg-brand-500 border-brand-500' : 'border-slate-300 dark:border-slate-600 hover:border-brand-400'
                  }`}>
                    {task.status === 'completed' && <div className="w-3 h-3 bg-white rounded-sm" />}
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-slate-700 dark:text-slate-200 group-hover:text-slate-900 dark:group-hover:text-white transition-colors text-base">
                      {task.title}
                    </p>
                    <div className="flex items-center gap-2 mt-1.5">
                      <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wide ${
                        task.priority === 'high' ? 'bg-rose-100 dark:bg-rose-900/40 text-rose-600 dark:text-rose-400' : 
                        task.priority === 'medium' ? 'bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                      }`}>
                        {task.priority}
                      </span>
                      <div className="flex items-center gap-1 text-xs font-medium text-slate-400 dark:text-slate-500">
                        <Clock className="w-3.5 h-3.5" />
                        {task.dueDate}
                      </div>
                    </div>
                  </div>
              </div>
            ))}
            <button 
              onClick={() => navigate('/app/tasks')}
              className="w-full py-4 border-2 border-dashed border-slate-300/50 dark:border-slate-600/50 rounded-2xl text-slate-400 dark:text-slate-500 text-sm font-bold hover:border-brand-300 hover:text-brand-500 hover:bg-brand-50/50 dark:hover:bg-brand-900/20 transition-all flex items-center justify-center gap-2 mt-4"
            >
              <Plus className="w-5 h-5" /> Add New Task
            </button>
          </div>
        </div>

      </section>
    </div>
  );
};

export default Dashboard;