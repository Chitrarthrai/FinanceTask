import React, { useState, useRef, useEffect } from 'react';
import { Search, Bell, Settings, LogOut, Plus, Command } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useData } from '../contexts/DataContext';
import { ThemeToggle } from './ui/ThemeToggle';
import { CurrencySelector } from './ui/CurrencySelector';
import { Button } from './ui/Button';
import { CommandPalette } from './ui/CommandPalette';
import TransactionModal from './TransactionModal';

interface HeaderProps {
  theme: string;
  setTheme: (theme: string) => void;
}

const Header: React.FC<HeaderProps> = ({ theme, setTheme }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { categoryWarnings } = useData();

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  const getPageTitle = () => {
    switch (location.pathname) {
      case '/app':
        return 'Executive Dashboard';
      case '/app/transactions':
        return 'Transactions Ledger';
      case '/app/tasks':
        return 'Task Kanban';
      case '/app/notes':
        return 'Financial Notes';
      case '/app/analytics':
        return 'Financial Analytics';
      case '/app/reports':
        return 'Executive Reports';
      case '/app/settings':
        return 'Settings & Preferences';
      default:
        return 'FinanceTask';
    }
  };

  return (
    <>
      <header className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6 pt-2">
        {/* Title & User Greeting */}
        <div>
          <h1 className="text-2xl font-bold font-display text-[var(--text-primary)] tracking-tight">
            {getPageTitle()}
          </h1>
          <p className="text-xs font-medium text-[var(--text-secondary)] mt-0.5">
            Welcome back, {user?.user_metadata?.full_name?.split(' ')[0] || 'User'} • Titanium Operating System
          </p>
        </div>

        {/* Global Controls */}
        <div className="flex items-center gap-3 w-full md:w-auto justify-end flex-wrap">
          {/* Command Palette Quick Trigger */}
          <button
            onClick={() => setIsCommandPaletteOpen(true)}
            className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-xl glass-panel text-xs font-mono text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:border-[var(--border-highlight)] transition-all cursor-pointer"
          >
            <Search className="w-3.5 h-3.5 text-[var(--accent-primary)]" />
            <span>Search or command...</span>
            <kbd className="px-1.5 py-0.5 rounded bg-[var(--surface-l2)] border border-[var(--border-rim)] text-[10px] font-bold">
              ⌘K
            </kbd>
          </button>

          {/* Quick Add Action Button */}
          <Button
            variant="primary"
            size="sm"
            onClick={() => setIsAddModalOpen(true)}
            leftIcon={<Plus className="w-4 h-4" />}
          >
            New Entry
          </Button>

          {/* Currency Selector */}
          <CurrencySelector />

          {/* Theme Toggle */}
          <ThemeToggle theme={theme} setTheme={setTheme} />

          {/* Notifications Indicator */}
          <div className="relative">
            <Button variant="glass" size="icon" className="rounded-xl relative">
              <Bell className="w-4 h-4 text-[var(--text-secondary)]" />
              {categoryWarnings.length > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[var(--danger)] led-pulse" />
              )}
            </Button>
          </div>

          {/* User Profile Avatar Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center gap-2.5 p-1 pr-3 rounded-full border border-[var(--border-rim)] bg-[var(--surface-l1)] hover:border-[var(--border-highlight)] transition-all cursor-pointer"
            >
              <img
                src={`https://ui-avatars.com/api/?name=${encodeURIComponent(
                  user?.user_metadata?.full_name || 'User'
                )}&background=00f2ff&color=090a0f&bold=true`}
                alt="User Avatar"
                className="w-7 h-7 rounded-full object-cover border border-white/20"
              />
              <span className="hidden md:inline text-xs font-semibold text-[var(--text-primary)]">
                {user?.user_metadata?.full_name?.split(' ')[0] || 'User'}
              </span>
            </button>

            {isDropdownOpen && (
              <div className="absolute right-0 mt-2 w-52 glass-panel rounded-xl border border-[var(--border-rim)] shadow-2xl p-1.5 z-50 animate-slide-up">
                <div className="px-3 py-2 border-b border-[var(--border-rim)] mb-1">
                  <p className="text-xs font-bold text-[var(--text-primary)]">
                    {user?.user_metadata?.full_name || 'User'}
                  </p>
                  <p className="text-[10px] text-[var(--text-muted)] truncate">{user?.email}</p>
                </div>
                <button
                  onClick={() => {
                    setIsDropdownOpen(false);
                    navigate('/app/settings');
                  }}
                  className="flex items-center gap-2 w-full px-3 py-2 text-xs font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-l2)] rounded-lg transition-colors cursor-pointer"
                >
                  <Settings className="w-4 h-4 text-[var(--accent-primary)]" />
                  <span>Settings</span>
                </button>
                <button
                  onClick={handleSignOut}
                  className="flex items-center gap-2 w-full px-3 py-2 text-xs font-medium text-[var(--danger)] hover:bg-[var(--danger)]/10 rounded-lg transition-colors cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Command Palette Modal */}
      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        theme={theme}
        setTheme={setTheme}
        onOpenTransactionModal={() => setIsAddModalOpen(true)}
      />

      {/* Quick Add Transaction Modal */}
      {isAddModalOpen && (
        <TransactionModal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
        />
      )}
    </>
  );
};

export default Header;
