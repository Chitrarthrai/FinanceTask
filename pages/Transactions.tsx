import React, { useState } from 'react';
import { Search, Filter, Download, Plus, ArrowUpRight, ArrowDownRight, Coffee, ShoppingBag, Home, Car, DollarSign } from 'lucide-react';
import { RECENT_TRANSACTIONS } from '../constants';

const Transactions = () => {
  const [filter, setFilter] = useState('All');

  // Expanded Mock Data
  const allTransactions = [
    ...RECENT_TRANSACTIONS,
    { id: '5', title: 'Salary Deposit', category: 'Income', amount: 5400.00, date: 'Aug 20, 2024', type: 'income' as const },
    { id: '6', title: 'Electric Bill', category: 'Utilities', amount: 145.20, date: 'Aug 18, 2024', type: 'expense' as const },
    { id: '7', title: 'Starbucks', category: 'Food', amount: 6.50, date: 'Aug 18, 2024', type: 'expense' as const },
    { id: '8', title: 'Gym Membership', category: 'Health', amount: 45.00, date: 'Aug 15, 2024', type: 'expense' as const },
    { id: '9', title: 'Client Payment', category: 'Income', amount: 1200.00, date: 'Aug 12, 2024', type: 'income' as const },
    { id: '10', title: 'Uber Ride', category: 'Transport', amount: 24.50, date: 'Aug 10, 2024', type: 'expense' as const },
  ];

  const categories = ['All', 'Food', 'Transport', 'Entertainment', 'Income', 'Utilities'];

  const getIcon = (category: string) => {
    switch(category) {
      case 'Food': return <Coffee className="w-5 h-5" />;
      case 'Shopping': return <ShoppingBag className="w-5 h-5" />;
      case 'Housing': case 'Utilities': return <Home className="w-5 h-5" />;
      case 'Transport': return <Car className="w-5 h-5" />;
      case 'Income': return <DollarSign className="w-5 h-5" />;
      default: return <ShoppingBag className="w-5 h-5" />;
    }
  };

  const filteredData = filter === 'All' 
    ? allTransactions 
    : allTransactions.filter(t => t.category === filter);

  return (
    <div className="space-y-8 animate-fade-in pb-20">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-end gap-6">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-800 dark:text-white tracking-tight mb-2">Transactions</h1>
          <p className="text-slate-500 dark:text-slate-400 font-medium">Manage and track your financial history.</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => alert('Exporting transaction history to CSV...')}
            className="flex items-center gap-2 px-5 py-2.5 bg-white/60 dark:bg-slate-800/60 backdrop-blur-md text-slate-700 dark:text-slate-200 font-bold rounded-full border border-white dark:border-slate-700 hover:bg-white dark:hover:bg-slate-800 transition-all shadow-sm hover:shadow-md"
          >
            <Download className="w-4 h-4" /> Export
          </button>
          <button 
            onClick={() => alert('Opening Add Transaction Modal...')}
            className="flex items-center gap-2 px-6 py-2.5 bg-brand-500 text-white font-bold rounded-full hover:bg-brand-600 transition-all shadow-lg shadow-brand-500/30 active:scale-95"
          >
            <Plus className="w-5 h-5" /> Add Transaction
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="glass-panel p-6 rounded-3xl flex items-center justify-between group hover:border-emerald-200 dark:hover:border-emerald-900 transition-all">
          <div>
            <p className="text-slate-500 dark:text-slate-400 font-semibold mb-1">Total Income</p>
            <h3 className="text-3xl font-extrabold text-emerald-600 dark:text-emerald-400">$7,450.00</h3>
          </div>
          <div className="w-14 h-14 bg-emerald-100 dark:bg-emerald-900/30 rounded-2xl flex items-center justify-center text-emerald-600 dark:text-emerald-400 group-hover:scale-110 transition-transform shadow-sm">
            <ArrowDownRight className="w-8 h-8" />
          </div>
        </div>
        <div className="glass-panel p-6 rounded-3xl flex items-center justify-between group hover:border-rose-200 dark:hover:border-rose-900 transition-all">
          <div>
            <p className="text-slate-500 dark:text-slate-400 font-semibold mb-1">Total Expenses</p>
            <h3 className="text-3xl font-extrabold text-slate-800 dark:text-white">$3,450.00</h3>
          </div>
          <div className="w-14 h-14 bg-rose-100 dark:bg-rose-900/30 rounded-2xl flex items-center justify-center text-rose-500 dark:text-rose-400 group-hover:scale-110 transition-transform shadow-sm">
            <ArrowUpRight className="w-8 h-8" />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="glass-panel rounded-3xl p-6 md:p-8 animate-slide-up" style={{ animationDelay: '200ms' }}>
        
        {/* Controls */}
        <div className="flex flex-col md:flex-row gap-4 justify-between items-center mb-8">
          
          {/* Category Filter Chips */}
          <div className="flex gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 scrollbar-hide">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setFilter(cat)}
                className={`px-4 py-2 rounded-xl text-sm font-bold whitespace-nowrap transition-all ${
                  filter === cat 
                    ? 'bg-brand-500 text-white shadow-lg shadow-brand-500/20' 
                    : 'bg-white/50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 hover:bg-white dark:hover:bg-slate-700 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Search & Sort */}
          <div className="flex gap-3 w-full md:w-auto">
            <div className="relative flex-1 md:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input 
                type="text" 
                placeholder="Search..." 
                className="w-full pl-10 pr-4 py-2.5 bg-white/50 dark:bg-slate-800/50 border border-white/50 dark:border-slate-700/50 rounded-xl focus:ring-2 focus:ring-brand-200 focus:bg-white dark:focus:bg-slate-900 outline-none transition-all text-sm font-medium text-slate-700 dark:text-slate-200"
              />
            </div>
            <button className="p-2.5 bg-white/50 dark:bg-slate-800/50 rounded-xl border border-white/50 dark:border-slate-700/50 hover:bg-white dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 transition-all">
              <Filter className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Transaction List */}
        <div className="space-y-3">
          {filteredData.map((t, idx) => (
            <div key={t.id} className="flex items-center justify-between p-4 rounded-2xl hover:bg-white/60 dark:hover:bg-white/5 transition-all group border border-transparent hover:border-white/60 dark:hover:border-white/10">
              <div className="flex items-center gap-5">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-105 shadow-sm ${
                  t.type === 'expense' ? 'bg-orange-50 dark:bg-orange-900/20 text-orange-500' : 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-500'
                }`}>
                  {getIcon(t.category)}
                </div>
                <div>
                  <p className="font-bold text-slate-800 dark:text-slate-200 text-lg">{t.title}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400">{t.category}</span>
                    <span className="text-xs text-slate-400 font-medium">{t.date}</span>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <span className={`block font-bold text-xl ${t.type === 'expense' ? 'text-slate-800 dark:text-slate-200' : 'text-emerald-600 dark:text-emerald-400'}`}>
                  {t.type === 'expense' ? '-' : '+'}${t.amount.toFixed(2)}
                </span>
                <span className="text-xs text-slate-400 font-medium">
                  {t.type === 'expense' ? 'Debit Card' : 'Direct Deposit'}
                </span>
              </div>
            </div>
          ))}
          
          {filteredData.length === 0 && (
             <div className="py-12 text-center">
               <p className="text-slate-400 font-medium">No transactions found.</p>
             </div>
          )}
        </div>

        {/* Pagination Placeholder */}
        <div className="flex justify-center mt-8">
           <button className="text-sm font-bold text-brand-600 dark:text-brand-400 hover:text-brand-700 dark:hover:text-brand-300 transition-colors">Load More</button>
        </div>

      </div>
    </div>
  );
};

export default Transactions;