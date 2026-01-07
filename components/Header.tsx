import React from 'react';
import { Search, Bell, Menu } from 'lucide-react';
import { useLocation } from 'react-router-dom';

const Header = () => {
  const location = useLocation();

  const getPageTitle = () => {
    switch (location.pathname) {
      case '/app/transactions': return 'Transactions';
      case '/app/tasks': return 'Task Board';
      case '/app/analytics': return 'Analytics';
      case '/app/settings': return 'Settings';
      default: return 'Dashboard';
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full px-6 py-4 flex items-center justify-between transition-all duration-300">
      <div className="flex items-center gap-4 lg:hidden">
         <button className="p-2 bg-white/50 dark:bg-slate-800/50 rounded-xl">
           <Menu className="w-6 h-6 text-slate-700 dark:text-slate-200" />
         </button>
         <div className="font-bold text-lg text-slate-800 dark:text-white">FinanceTask</div>
      </div>

      <div className="hidden lg:flex items-center gap-2">
         <h2 className="text-2xl font-bold text-slate-800 dark:text-white transition-colors">{getPageTitle()}</h2>
         <span className="px-3 py-1 bg-gradient-to-r from-brand-100 to-brand-50 text-brand-700 text-xs font-bold rounded-full border border-brand-200 shadow-sm">PRO</span>
      </div>

      <div className="flex items-center gap-4 ml-auto">
        <div className="hidden md:flex items-center bg-white/40 dark:bg-slate-800/50 hover:bg-white/60 dark:hover:bg-slate-800/80 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-white/50 dark:border-slate-700/50 focus-within:border-brand-300 focus-within:ring-2 focus-within:ring-brand-100 transition-all shadow-sm w-72">
          <Search className="w-4 h-4 text-slate-400 mr-2" />
          <input 
            type="text" 
            placeholder="Search..." 
            className="bg-transparent border-none outline-none text-sm text-slate-700 dark:text-slate-200 placeholder:text-slate-500 w-full"
          />
        </div>

        <button className="relative p-3 bg-white/40 dark:bg-slate-800/50 hover:bg-white/80 dark:hover:bg-slate-700/80 rounded-xl border border-white/50 dark:border-slate-700/50 text-slate-600 dark:text-slate-300 hover:text-brand-600 transition-all hover:shadow-lg hover:shadow-brand-500/10 group backdrop-blur-md">
          <Bell className="w-5 h-5 group-hover:scale-110 transition-transform" />
          <span className="absolute top-2.5 right-3 w-2 h-2 bg-rose-500 rounded-full border border-white dark:border-slate-800"></span>
        </button>

        <button className="flex items-center gap-3 pl-1 pr-4 py-1 bg-white/40 dark:bg-slate-800/50 hover:bg-white/80 dark:hover:bg-slate-700/80 rounded-full border border-white/50 dark:border-slate-700/50 transition-all hover:shadow-md backdrop-blur-md">
          <img 
            src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80" 
            alt="User" 
            className="w-9 h-9 rounded-full object-cover ring-2 ring-white dark:ring-slate-700"
          />
          <div className="hidden md:flex flex-col items-start">
            <span className="text-sm font-bold text-slate-700 dark:text-slate-200 leading-tight">Alex M.</span>
            <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">Free Plan</span>
          </div>
        </button>
      </div>
    </header>
  );
};

export default Header;