import React from 'react';
import {
  LayoutDashboard,
  Wallet,
  CheckSquare,
  Settings,
  PieChart,
  LogOut,
  FileText,
  Share2,
} from 'lucide-react';
import { NavLink, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useData } from '../contexts/DataContext';
import { Logo } from './common/Logo';

export const Sidebar: React.FC = () => {
  const navigate = useNavigate();
  const { metrics, currencySymbol } = useData();

  const navItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/app' },
    { icon: Wallet, label: 'Transactions', path: '/app/transactions' },
    { icon: CheckSquare, label: 'Tasks', path: '/app/tasks' },
    { icon: FileText, label: 'Notes', path: '/app/notes' },
    { icon: PieChart, label: 'Analytics', path: '/app/analytics' },
    { icon: FileText, label: 'Reports', path: '/app/reports' },
    { icon: Share2, label: 'P2P Share', path: '/app/p2p' },
    { icon: Settings, label: 'Settings', path: '/app/settings' },
  ];

  const handleLogout = () => {
    navigate('/login');
  };

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col w-64 h-screen fixed left-0 top-0 glass-panel-rim z-40 bg-[var(--surface-l1)] border-r border-[var(--border-rim)]">
        {/* Brand Header */}
        <div className="p-6 border-b border-[var(--border-rim)]">
          <Logo size="md" />
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          <div className="px-3 pb-2">
            <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest font-mono">
              Main Platform
            </p>
          </div>
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/app'}
              className={({ isActive }) =>
                `relative flex items-center gap-3 px-3.5 py-3 rounded-xl text-sm font-medium transition-all duration-200 group ${
                  isActive
                    ? 'text-[var(--accent-primary)] font-semibold'
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-l2)]'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  {isActive && (
                    <motion.div
                      layoutId="activeNavPill"
                      className="absolute inset-0 bg-[var(--accent-primary-light)] rounded-xl border border-[var(--accent-primary)]/30"
                      transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                    />
                  )}
                  <item.icon
                    className={`w-4 h-4 z-10 transition-transform ${
                      isActive ? 'text-[var(--accent-primary)] scale-110' : 'group-hover:scale-110'
                    }`}
                  />
                  <span className="z-10">{item.label}</span>
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Total Savings KPI Widget */}
        <div className="p-4 mt-auto border-t border-[var(--border-rim)]">
          <div className="p-4 rounded-xl bg-[var(--surface-l2)] border border-[var(--border-rim)] relative overflow-hidden mb-3">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] font-mono uppercase tracking-wider text-[var(--text-muted)] font-semibold">
                Total Balance
              </span>
              {metrics?.savingsTrend !== undefined && (
                <span
                  className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded-full ${
                    metrics.savingsTrend >= 0
                      ? 'bg-[var(--success)]/15 text-[var(--success)]'
                      : 'bg-[var(--danger)]/15 text-[var(--danger)]'
                  }`}
                >
                  {metrics.savingsTrend >= 0 ? '↑' : '↓'} {Math.abs(metrics.savingsTrend).toFixed(1)}%
                </span>
              )}
            </div>
            <div className="text-xl font-bold font-mono text-[var(--text-primary)] tracking-tight">
              {currencySymbol}{(metrics?.totalSavings || 0).toLocaleString()}
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="flex items-center gap-2.5 w-full px-3.5 py-2.5 rounded-xl text-xs font-semibold text-[var(--text-muted)] hover:text-[var(--danger)] hover:bg-[var(--danger)]/10 transition-all cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>Log Out</span>
          </button>
        </div>
      </aside>

      {/* Mobile Navigation Dock */}
      <nav className="lg:hidden fixed bottom-3 left-3 right-3 glass-panel rounded-2xl border border-[var(--border-rim)] z-50 px-2 py-2 flex justify-around items-center shadow-xl">
        {navItems.slice(0, 5).map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === '/app'}
            className={({ isActive }) =>
              `p-2.5 rounded-xl transition-all ${
                isActive
                  ? 'text-[var(--accent-primary)] bg-[var(--accent-primary-light)]'
                  : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
              }`
            }
          >
            <item.icon className="w-5 h-5" />
          </NavLink>
        ))}
      </nav>
    </>
  );
};

export default Sidebar;
