import React, { useState, useRef, useEffect } from "react";
import {
  Search,
  Bell,
  Menu,
  Sun,
  Moon,
  Settings as SettingsIcon,
  LogOut,
} from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

interface HeaderProps {
  theme: string;
  setTheme: (theme: string) => void;
}

const Header: React.FC<HeaderProps> = ({ theme, setTheme }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  /*
   * NEW: Search Scope State
   * Default to 'transactions' but switch if we are on the tasks page
   */
  const [searchScope, setSearchScope] = useState<"transactions" | "tasks">(
    "transactions"
  );

  // Auto-detect scope based on current URL
  useEffect(() => {
    if (location.pathname.includes("/tasks")) {
      setSearchScope("tasks");
    } else {
      setSearchScope("transactions");
    }
  }, [location.pathname]);

  const handleSearch = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && searchQuery.trim()) {
      if (searchScope === "transactions") {
        navigate(`/app/transactions?search=${encodeURIComponent(searchQuery)}`);
      } else {
        navigate(`/app/tasks?search=${encodeURIComponent(searchQuery)}`);
      }
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/login");
  };

  const getPageTitle = () => {
    switch (location.pathname) {
      case "/app":
        return "Dashboard";
      case "/app/transactions":
        return "Transactions";
      case "/app/tasks":
        return "Tasks";
      case "/app/settings":
        return "Settings";
      default:
        return "FinanceTask";
    }
  };

  const toggleTheme = () => {
    setTheme(theme === "light" ? "dark" : "light");
  };

  return (
    <header className="flex items-center justify-between mb-8">
      <div>
        <h2 className="text-2xl font-bold text-slate-800 dark:text-white tracking-tight">
          {getPageTitle()}
        </h2>
        <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">
          Welcome back,{" "}
          {user?.user_metadata?.full_name?.split(" ")[0] || "User"}
        </p>
      </div>

      <div className="flex items-center gap-4 ml-auto">
        <div
          className={`hidden md:flex items-center backdrop-blur-md px-4 py-2.5 rounded-2xl border focus-within:border-brand-300 focus-within:ring-2 focus-within:ring-brand-100 transition-all shadow-sm w-80 ${
            theme === "dark"
              ? "bg-slate-800/50 hover:bg-slate-800/80 border-slate-700/50"
              : "bg-white hover:bg-white border-slate-200"
          }`}>
          {/* Scope Selector */}
          <select
            value={searchScope}
            onChange={(e) =>
              setSearchScope(e.target.value as "transactions" | "tasks")
            }
            className={`bg-transparent border-none outline-none text-xs font-bold uppercase mr-2 cursor-pointer focus:text-brand-600 ${
              theme === "dark" ? "text-slate-500" : "text-slate-500"
            }`}>
            <option value="transactions">Trans</option>
            <option value="tasks">Tasks</option>
          </select>

          <div
            className={`h-4 w-px mr-2 ${
              theme === "dark" ? "bg-slate-600" : "bg-slate-300"
            }`}
          />

          <Search className="w-4 h-4 text-slate-400 mr-2" />
          <input
            type="text"
            placeholder={
              searchScope === "transactions"
                ? "Search transactions..."
                : "Search tasks..."
            }
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={handleSearch}
            className={`bg-transparent border-none outline-none text-sm placeholder:text-slate-500 w-full ${
              theme === "dark" ? "text-slate-200" : "text-slate-800"
            }`}
          />
        </div>

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className={`p-3 rounded-xl border transition-all hover:shadow-lg hover:shadow-brand-500/10 group backdrop-blur-md ${
            theme === "dark"
              ? "bg-slate-800/50 hover:bg-slate-700/80 border-slate-700/50 text-slate-300"
              : "bg-white/40 hover:bg-white/80 border-white/50 text-slate-600"
          }`}
          aria-label="Toggle Dark Mode">
          {theme === "dark" ? (
            <Sun className="w-5 h-5 text-amber-400 group-hover:rotate-45 transition-transform" />
          ) : (
            <Moon className="w-5 h-5 text-slate-600 group-hover:-rotate-12 transition-transform" />
          )}
        </button>

        <button
          className={`relative p-3 rounded-xl border transition-all hover:shadow-lg hover:shadow-brand-500/10 group backdrop-blur-md ${
            theme === "dark"
              ? "bg-slate-800/50 hover:bg-slate-700/80 border-slate-700/50 text-slate-300"
              : "bg-white/40 hover:bg-white/80 border-white/50 text-slate-600 hover:text-brand-600"
          }`}>
          <Bell className="w-5 h-5 group-hover:scale-110 transition-transform" />
          <span
            className={`absolute top-2.5 right-3 w-2 h-2 bg-rose-500 rounded-full border ${
              theme === "dark" ? "border-slate-800" : "border-white"
            }`}></span>
        </button>

        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className={`flex items-center gap-3 pl-1 pr-4 py-1 rounded-full border transition-all hover:shadow-md backdrop-blur-md ${
              theme === "dark"
                ? "bg-slate-800/50 hover:bg-slate-700/80 border-slate-700/50"
                : "bg-white/40 hover:bg-white/80 border-white/50"
            }`}>
            <img
              src={`https://ui-avatars.com/api/?name=${
                user?.user_metadata?.full_name || "User"
              }&background=random`}
              alt="User"
              className={`w-9 h-9 rounded-full object-cover ring-2 ${
                theme === "dark" ? "ring-slate-700" : "ring-white"
              }`}
            />
            <div className="hidden md:flex flex-col items-start">
              <span className="text-sm font-bold text-slate-700 dark:text-slate-200 leading-tight">
                {user?.user_metadata?.full_name || "User"}
              </span>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">
                {user?.email || "No Email"}
              </span>
            </div>
          </button>

          {isDropdownOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-100 dark:border-slate-700 overflow-hidden animate-fade-in z-50">
              <div className="p-1">
                <button
                  onClick={() => {
                    setIsDropdownOpen(false);
                    navigate("/app/settings");
                  }}
                  className="flex items-center gap-2 w-full px-4 py-2.5 text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/50 rounded-lg transition-colors">
                  <SettingsIcon className="w-4 h-4" /> Settings
                </button>
                <div className="h-px bg-slate-100 dark:bg-slate-700 my-1" />
                <button
                  onClick={handleSignOut}
                  className="flex items-center gap-2 w-full px-4 py-2.5 text-sm font-medium text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-lg transition-colors">
                  <LogOut className="w-4 h-4" /> Sign Out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
