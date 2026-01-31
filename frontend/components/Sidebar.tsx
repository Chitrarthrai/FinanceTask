import React from "react";
import {
  LayoutDashboard,
  Wallet,
  CheckSquare,
  Settings,
  PieChart,
  LogOut,
  CreditCard,
  FileText,
  Share2,
} from "lucide-react";
import { NavLink, useNavigate } from "react-router-dom";
import { useData } from "../contexts/DataContext";

const Sidebar = () => {
  const navigate = useNavigate();
  const { metrics } = useData();
  const navItems = [
    { icon: LayoutDashboard, label: "Dashboard", path: "/app" },
    { icon: Wallet, label: "Transactions", path: "/app/transactions" },
    { icon: CheckSquare, label: "Tasks", path: "/app/tasks" },
    { icon: FileText, label: "Notes", path: "/app/notes" },
    { icon: PieChart, label: "Analytics", path: "/app/analytics" },
    { icon: FileText, label: "Reports", path: "/app/reports" },
    { icon: Share2, label: "P2P Share", path: "/app/p2p" },
    { icon: Settings, label: "Settings", path: "/app/settings" },
  ];

  const handleLogout = () => {
    // Clear any user session data here if needed
    navigate("/");
  };

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col w-64 h-screen fixed left-0 top-0 glass-sidebar z-50 transition-all duration-300 bg-bg-secondary/50 border-r border-border-subtle">
        <div className="p-8 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-600 via-orange-500 to-amber-500 flex items-center justify-center shadow-lg shadow-brand-500/20">
            <CreditCard className="w-5 h-5 text-white" />
          </div>
          <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-brand-600 to-amber-600 tracking-tight">
            FinanceTask
          </h1>
        </div>

        <nav className="flex-1 px-4 space-y-2 overflow-y-auto pt-4">
          <div className="px-4 pb-2">
            <p className="text-xs font-semibold text-text-muted uppercase tracking-wider">
              Main Menu
            </p>
          </div>
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === "/app"}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all duration-200 group relative overflow-hidden hover:translate-x-1 ${
                  isActive
                    ? "bg-brand-50 dark:bg-brand-900/10 text-brand-600 dark:text-brand-400 shadow-sm font-semibold ring-1 ring-brand-200 dark:ring-brand-800"
                    : "text-text-muted hover:bg-bg-secondary hover:text-text-primary font-medium hover:ring-1 hover:ring-border-primary"
                }`
              }>
              {({ isActive }) => (
                <>
                  <item.icon
                    className={`w-5 h-5 transition-transform duration-200 ${
                      isActive
                        ? "text-brand-500 dark:text-brand-400"
                        : "text-text-muted group-hover:text-text-secondary"
                    } ${isActive ? "scale-110" : "group-hover:scale-110"}`}
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
          <div className="glass-panel p-5 rounded-3xl mb-4 bg-gradient-brand text-white shadow-xl shadow-brand-900/10 border-none relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full blur-2xl -mr-10 -mt-10 group-hover:bg-white/20 transition-colors"></div>
            <div className="relative z-10">
              <div className="flex justify-between items-start mb-2">
                <div className="p-2 bg-white/10 rounded-lg">
                  <Wallet className="w-4 h-4 text-white" />
                </div>
                {metrics?.savingsTrend !== undefined && (
                  <span
                    className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                      metrics.savingsTrend >= 0
                        ? "text-emerald-100 bg-emerald-500/20"
                        : "text-rose-100 bg-rose-500/20"
                    }`}>
                    {metrics.savingsTrend >= 0 ? "+" : ""}
                    {metrics.savingsTrend.toFixed(1)}%
                  </span>
                )}
              </div>
              <p className="text-xs text-white/70 mb-1">Total Balance</p>
              <p className="text-2xl font-bold mb-3">
                ${(metrics?.totalSavings || 0).toLocaleString()}
              </p>
              <div className="h-1.5 bg-black/20 rounded-full overflow-hidden">
                <div
                  className="h-full bg-white/90 rounded-full transition-all duration-1000 shadow-[0_0_10px_rgba(255,255,255,0.5)]"
                  style={{
                    width: `${Math.min(
                      100,
                      Math.max(
                        0,
                        ((metrics?.totalSavings || 0) /
                          (metrics?.totalIncome || 1)) *
                          100,
                      ),
                    )}%`,
                  }}
                />
              </div>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 text-text-muted hover:text-rose-500 transition-colors w-full rounded-2xl hover:bg-rose-50/50 dark:hover:bg-rose-900/10">
            <LogOut className="w-5 h-5" />
            <span className="font-medium">Log Out</span>
          </button>
        </div>
      </aside>

      {/* Mobile Bottom Nav */}
      <nav className="lg:hidden fixed bottom-4 left-4 right-4 bg-bg-secondary/90 backdrop-blur-xl rounded-2xl shadow-xl shadow-slate-900/5 border border-border-subtle z-50 px-2 py-3 flex justify-between items-center">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === "/app"}
            className={({ isActive }) =>
              `flex flex-col items-center gap-1 p-2 rounded-xl transition-all ${
                isActive
                  ? "text-brand-600 dark:text-brand-400 bg-brand-50 dark:bg-brand-900/20"
                  : "text-text-muted"
              }`
            }>
            {({ isActive }) => (
              <item.icon
                className={`w-6 h-6 ${isActive ? "fill-current" : ""}`}
              />
            )}
          </NavLink>
        ))}
      </nav>
    </>
  );
};

export default Sidebar;
