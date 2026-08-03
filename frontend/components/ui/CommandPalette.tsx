import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  LayoutDashboard,
  Wallet,
  CheckSquare,
  FileText,
  PieChart,
  Share2,
  Settings,
  Plus,
  Moon,
  Sun,
  X,
  Command,
} from 'lucide-react';
import { useData } from '../../contexts/DataContext';
import { useAuth } from '../../contexts/AuthContext';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  theme?: string;
  setTheme?: (theme: string) => void;
  onOpenTransactionModal?: () => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  isOpen,
  onClose,
  theme,
  setTheme,
  onOpenTransactionModal,
}) => {
  const navigate = useNavigate();
  const { currencySymbol, setCurrencySymbol } = useData();
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const actions = [
    {
      id: 'nav-dashboard',
      label: 'Go to Dashboard',
      category: 'Navigation',
      icon: LayoutDashboard,
      run: () => navigate('/app'),
    },
    {
      id: 'nav-transactions',
      label: 'Go to Transactions Ledger',
      category: 'Navigation',
      icon: Wallet,
      run: () => navigate('/app/transactions'),
    },
    {
      id: 'nav-tasks',
      label: 'Go to Task Kanban',
      category: 'Navigation',
      icon: CheckSquare,
      run: () => navigate('/app/tasks'),
    },
    {
      id: 'nav-notes',
      label: 'Go to AI Smart Notes',
      category: 'Navigation',
      icon: FileText,
      run: () => navigate('/app/notes'),
    },
    {
      id: 'nav-analytics',
      label: 'Go to Financial Analytics',
      category: 'Navigation',
      icon: PieChart,
      run: () => navigate('/app/analytics'),
    },
    {
      id: 'nav-reports',
      label: 'Go to Executive Reports',
      category: 'Navigation',
      icon: FileText,
      run: () => navigate('/app/reports'),
    },
    {
      id: 'nav-p2p',
      label: 'Go to P2P File Share',
      category: 'Navigation',
      icon: Share2,
      run: () => navigate('/app/p2p'),
    },
    {
      id: 'nav-settings',
      label: 'Go to Settings',
      category: 'Navigation',
      icon: Settings,
      run: () => navigate('/app/settings'),
    },
    {
      id: 'act-new-transaction',
      label: 'Add New Transaction',
      category: 'Actions',
      icon: Plus,
      run: () => {
        if (onOpenTransactionModal) onOpenTransactionModal();
      },
    },
    {
      id: 'act-toggle-theme',
      label: `Switch Theme (Current: ${theme === 'dark' ? 'Dark 🌙' : 'Light ☀️'})`,
      category: 'Preferences',
      icon: theme === 'dark' ? Sun : Moon,
      run: () => {
        if (setTheme) setTheme(theme === 'dark' ? 'light' : 'dark');
      },
    },
    {
      id: 'act-currency-usd',
      label: 'Set Currency to USD ($)',
      category: 'Preferences',
      icon: Command,
      run: () => setCurrencySymbol('$'),
    },
    {
      id: 'act-currency-inr',
      label: 'Set Currency to INR (₹)',
      category: 'Preferences',
      icon: Command,
      run: () => setCurrencySymbol('₹'),
    },
    {
      id: 'act-currency-eur',
      label: 'Set Currency to EUR (€)',
      category: 'Preferences',
      icon: Command,
      run: () => setCurrencySymbol('€'),
    },
  ];

  const filteredActions = actions.filter((action) =>
    action.label.toLowerCase().includes(query.toLowerCase())
  );

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      setSelectedIndex(0);
    }
  }, [isOpen]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % filteredActions.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + filteredActions.length) % filteredActions.length);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredActions[selectedIndex]) {
        filteredActions[selectedIndex].run();
        onClose();
      }
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-black/60 backdrop-blur-sm animate-fade-in font-sans">
      <div className="w-full max-w-xl glass-panel rounded-2xl border border-[var(--border-rim)] shadow-2xl overflow-hidden flex flex-col animate-slide-up">
        {/* Search Header */}
        <div className="p-3.5 border-b border-[var(--border-rim)] flex items-center gap-3 bg-[var(--surface-l2)]">
          <Search className="w-4 h-4 text-[var(--accent-primary)] shrink-0" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Type a command or search shortcuts... (Press ESC to close)"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            onKeyDown={handleKeyDown}
            className="flex-1 bg-transparent border-none outline-none text-xs font-semibold text-[var(--text-primary)] placeholder-[var(--text-muted)]"
          />
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-[var(--surface-l1)] text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Action List */}
        <div className="max-h-80 overflow-y-auto p-2 space-y-1">
          {filteredActions.length === 0 ? (
            <div className="p-6 text-center text-xs font-mono text-[var(--text-muted)]">
              No matching command found for "{query}".
            </div>
          ) : (
            filteredActions.map((action, idx) => {
              const Icon = action.icon;
              const isSelected = idx === selectedIndex;
              return (
                <div
                  key={action.id}
                  onClick={() => {
                    action.run();
                    onClose();
                  }}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-[var(--accent-primary)] text-[var(--text-inverted)] shadow-sm'
                      : 'text-[var(--text-primary)] hover:bg-[var(--surface-l2)]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 ${isSelected ? 'text-[var(--text-inverted)]' : 'text-[var(--accent-primary)]'}`} />
                    <span>{action.label}</span>
                  </div>
                  <span className={`text-[10px] font-mono px-2 py-0.5 rounded-md ${
                    isSelected ? 'bg-white/20 text-white' : 'bg-[var(--surface-l2)] text-[var(--text-muted)]'
                  }`}>
                    {action.category}
                  </span>
                </div>
              );
            })
          )}
        </div>

        {/* Footer Shortcut Legend */}
        <div className="px-4 py-2 border-t border-[var(--border-rim)] bg-[var(--surface-l1)] flex items-center justify-between text-[10px] font-mono text-[var(--text-muted)]">
          <div className="flex items-center gap-3">
            <span><kbd className="px-1.5 py-0.5 rounded bg-[var(--surface-l2)] border border-[var(--border-rim)]">↑↓</kbd> Navigate</span>
            <span><kbd className="px-1.5 py-0.5 rounded bg-[var(--surface-l2)] border border-[var(--border-rim)]">↵</kbd> Select</span>
            <span><kbd className="px-1.5 py-0.5 rounded bg-[var(--surface-l2)] border border-[var(--border-rim)]">ESC</kbd> Close</span>
          </div>
          <span className="font-bold text-[var(--accent-primary)]">FinanceTask Command Palette</span>
        </div>
      </div>
    </div>
  );
};
