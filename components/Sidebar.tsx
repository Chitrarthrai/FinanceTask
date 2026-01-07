import React from 'react';
import { LayoutDashboard, Wallet, CheckSquare, Settings, PieChart, LogOut, CreditCard } from 'lucide-react';
import { NavLink, useNavigate } from 'react-router-dom';

const Sidebar = () => {
  const navigate = useNavigate();
  const navItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/app' },
    { icon: Wallet, label: 'Transactions', path: '/app/transactions' },
    { icon: CheckSquare, label: 'Tasks', path: '/app/tasks' },
    { icon: PieChart, label: 'Analytics', path: '/app/analytics' },
    { icon: Settings, label: 'Settings', path: '/app/settings' },
  ];

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col w-64 h-screen fixed left-0 top-0 glass-sidebar z-50 transition-all duration-300">
        <div className="p-8 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-500 to-brand-400 flex items-center justify-center shadow-lg shadow-brand-500/20">
            <CreditCard className="w-5 h-5 text-white" />
          </div>
          <h1 className="text-xl font-bold text-slate-800 tracking-tight">
            FinanceTask
          </h1>
        </div>

        <nav className="flex-1 px-4 space-y-2 overflow-y-auto pt-4">
          <div className="px-4 pb-2">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Main Menu</p>
          </div>
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/app'}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all duration-200 group relative overflow-hidden ${
                  isActive
                    ? 'bg-white/60 text-brand-600 shadow-sm font-semibold'
                    : 'text-slate-500 hover:bg-white/40 hover:text-slate-900 font-medium'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <item.icon
                    className={`w-5 h-5 transition-transform duration-200 ${
                      isActive ? 'text-brand-500' : 'text-slate-400 group-hover:text-slate-600'
                    } ${isActive ? 'scale-110' : 'group-hover:scale-110'}`}
                  />
                  <span>{item.label}</span>
                  {isActive && (
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 rounded-r-full bg-brand-500" />
                  )}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="p-6 mt-auto">
          <div className="glass-panel p-5 rounded-3xl mb-4 bg-gradient-to-br from-slate-800 to-slate-900 text-white shadow-xl shadow-slate-900/10 border-none">
            <div className="flex justify-between items-start mb-2">
              <div className="p-2 bg-white/10 rounded-lg">
                <Wallet className="w-4 h-4 text-brand-300" />
              </div>
              <span className="text-xs font-medium text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded-full">+2.5%</span>
            </div>
            <p className="text-xs text-slate-400 mb-1">Total Balance</p>
            <p className="text-2xl font-bold mb-3">$14,250.00</p>
            <div className="h-1.5 bg-slate-700/50 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-brand-400 to-brand-300 w-[75%] rounded-full" />
            </div>
          </div>
          <button 
            onClick={() => navigate('/')}
            className="flex items-center gap-3 px-4 py-3 text-slate-500 hover:text-rose-500 transition-colors w-full rounded-2xl hover:bg-rose-50/50"
          >
            <LogOut className="w-5 h-5" />
            <span className="font-medium">Log Out</span>
          </button>
        </div>
      </aside>

      {/* Mobile Bottom Nav */}
      <nav className="lg:hidden fixed bottom-4 left-4 right-4 bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl shadow-slate-900/5 border border-white/50 z-50 px-6 py-3 flex justify-between items-center">
        {navItems.slice(0, 4).map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === '/app'}
            className={({ isActive }) =>
              `flex flex-col items-center gap-1 p-2 rounded-xl transition-all ${
                isActive ? 'text-brand-600 bg-brand-50' : 'text-slate-400'
              }`
            }
          >
            {({ isActive }) => (
              <item.icon className={`w-6 h-6 ${isActive ? 'fill-current' : ''}`} />
            )}
          </NavLink>
        ))}
      </nav>
    </>
  );
};

export default Sidebar;