import React from 'react';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { Download, Calendar, TrendingUp, TrendingDown, DollarSign, Target } from 'lucide-react';
import { SPENDING_DATA, EXPENSE_CATEGORIES_DATA, MONTHLY_COMPARISON_DATA, COLORS } from '../constants';

const Analytics = () => {
  return (
    <div className="space-y-8 animate-fade-in pb-20">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-end gap-6">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-800 dark:text-white tracking-tight mb-2">Financial Analytics</h1>
          <p className="text-slate-500 dark:text-slate-400 font-medium">Deep dive into your spending habits and trends.</p>
        </div>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 px-5 py-2.5 bg-white/60 dark:bg-slate-800/60 backdrop-blur-md text-slate-700 dark:text-slate-200 font-bold rounded-full border border-white dark:border-slate-700 hover:bg-white dark:hover:bg-slate-800 transition-all shadow-sm hover:shadow-md">
            <Calendar className="w-4 h-4" /> Last 30 Days
          </button>
          <button className="flex items-center gap-2 px-6 py-2.5 bg-brand-500 text-white font-bold rounded-full hover:bg-brand-600 transition-all shadow-lg shadow-brand-500/30 active:scale-95">
            <Download className="w-5 h-5" /> Export Report
          </button>
        </div>
      </div>

      {/* Summary Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Spent', value: '$2,450', icon: DollarSign, color: 'text-slate-800 dark:text-white', bg: 'bg-white/40 dark:bg-slate-800/40' },
          { label: 'Avg. Daily', value: '$81.50', icon: Target, color: 'text-brand-600 dark:text-brand-400', bg: 'bg-brand-50 dark:bg-brand-900/20' },
          { label: 'Highest Spend', value: '$450', sub: 'Housing', icon: TrendingUp, color: 'text-rose-500 dark:text-rose-400', bg: 'bg-rose-50 dark:bg-rose-900/20' },
          { label: 'Savings Rate', value: '24%', icon: TrendingDown, color: 'text-emerald-500 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-900/20' },
        ].map((stat, idx) => (
          <div key={idx} className={`glass-panel p-5 rounded-2xl flex items-center justify-between animate-slide-up`} style={{ animationDelay: `${idx * 100}ms` }}>
            <div>
              <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wide">{stat.label}</p>
              <p className={`text-2xl font-extrabold ${stat.color} mt-1`}>{stat.value}</p>
              {stat.sub && <p className="text-xs font-medium text-slate-400 dark:text-slate-500">{stat.sub}</p>}
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
        <div className="glass-panel p-8 rounded-3xl animate-slide-up" style={{ animationDelay: '400ms' }}>
          <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-6">Income vs Expenses</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={MONTHLY_COMPARISON_DATA} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" strokeOpacity={0.2} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
                <Tooltip 
                   cursor={{ fill: '#f1f5f9', opacity: 0.1 }}
                   contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', backgroundColor: 'rgba(255, 255, 255, 0.9)' }}
                />
                <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px' }} />
                <Bar dataKey="value" name="Income" fill="#14b8a6" radius={[4, 4, 0, 0]} barSize={20} />
                <Bar dataKey="secondary" name="Expenses" fill="#f43f5e" radius={[4, 4, 0, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Breakdown */}
        <div className="glass-panel p-8 rounded-3xl animate-slide-up" style={{ animationDelay: '500ms' }}>
          <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-6">Spending by Category</h3>
          <div className="h-[300px] flex items-center justify-center">
             <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={EXPENSE_CATEGORIES_DATA}
                  cx="50%"
                  cy="50%"
                  innerRadius={80}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {EXPENSE_CATEGORIES_DATA.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="none" />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', backgroundColor: 'rgba(255, 255, 255, 0.9)' }} />
                <Legend layout="vertical" verticalAlign="middle" align="right" />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* Spending Trend Area Chart */}
      <div className="glass-panel p-8 rounded-3xl animate-slide-up" style={{ animationDelay: '600ms' }}>
        <div className="flex justify-between items-center mb-6">
           <h3 className="text-xl font-bold text-slate-800 dark:text-white">Weekly Spending Trend</h3>
           <div className="flex gap-2">
             <span className="flex items-center gap-1 text-xs font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 px-2 py-1 rounded-md">
               <TrendingDown className="w-3 h-3" /> 12% vs last week
             </span>
           </div>
        </div>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={SPENDING_DATA} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="analyticsGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f97316" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" strokeOpacity={0.2} />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} dy={10} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
              <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', backgroundColor: 'rgba(255, 255, 255, 0.9)' }} />
              <Area type="monotone" dataKey="value" stroke="#f97316" strokeWidth={3} fillOpacity={1} fill="url(#analyticsGradient)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* AI Insights Section */}
      <div className="glass-panel p-8 rounded-3xl bg-gradient-to-br from-slate-800 to-slate-900 text-white animate-slide-up" style={{ animationDelay: '700ms' }}>
        <div className="flex items-center gap-3 mb-4">
           <div className="p-2 bg-white/10 rounded-lg backdrop-blur-md">
             <Target className="w-5 h-5 text-brand-300" />
           </div>
           <h3 className="text-xl font-bold">Smart Insights</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
           <p className="text-slate-300 leading-relaxed">
             <strong className="text-white">Spending Alert:</strong> You've spent <span className="text-rose-400 font-bold">15% more</span> on Food & Dining compared to last week. Consider eating out less this weekend to stay within budget.
           </p>
           <p className="text-slate-300 leading-relaxed">
             <strong className="text-white">Savings Opportunity:</strong> Your subscription costs are rising. Review your <span className="text-brand-300 font-bold">Entertainment</span> category to find unused services ($15.99 detected).
           </p>
        </div>
      </div>

    </div>
  );
};

export default Analytics;