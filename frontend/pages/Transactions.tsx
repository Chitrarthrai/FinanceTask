import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Search,
  Filter,
  Download,
  Plus,
  ArrowUpRight,
  ArrowDownRight,
  Coffee,
  ShoppingBag,
  Home,
  Car,
  DollarSign,
  Edit,
  Trash2,
  Briefcase,
  Zap,
  Music,
} from 'lucide-react';
import { useData } from '../contexts/DataContext';
import TransactionModal from '../components/TransactionModal';
import { Transaction } from '../types';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Badge } from '../components/ui/Badge';

export const Transactions: React.FC = () => {
  const { transactions, deleteTransaction, categories, currencySymbol } = useData();
  const [filter, setFilter] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [limit, setLimit] = useState(8);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<
    Partial<Transaction> | undefined
  >(undefined);

  const [searchParams] = useSearchParams();

  useEffect(() => {
    const query = searchParams.get('search');
    if (query) {
      setSearchTerm(query);
    }
  }, [searchParams]);

  const categoryNames = ['All', ...new Set(categories.map((c) => c.name))];
  if (!categoryNames.includes('Income')) categoryNames.push('Income');

  const getIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case 'food':
        return <Coffee className="w-4 h-4" />;
      case 'shopping':
        return <ShoppingBag className="w-4 h-4" />;
      case 'housing':
      case 'rent':
        return <Home className="w-4 h-4" />;
      case 'utilities':
      case 'internet':
        return <Zap className="w-4 h-4" />;
      case 'transport':
      case 'uber':
        return <Car className="w-4 h-4" />;
      case 'income':
      case 'salary':
        return <DollarSign className="w-4 h-4" />;
      case 'entertainment':
        return <Music className="w-4 h-4" />;
      case 'work':
      case 'freelance':
        return <Briefcase className="w-4 h-4" />;
      default:
        return <ShoppingBag className="w-4 h-4" />;
    }
  };

  const filteredData = transactions
    .filter((t) => (filter === 'All' ? true : t.category === filter))
    .filter((t) => t.title.toLowerCase().includes(searchTerm.toLowerCase()));

  const displayedData = filteredData.slice(0, limit);

  const handleExport = () => {
    const headers = ['ID', 'Title', 'Category', 'Amount', 'Date', 'Type'];
    const rows = filteredData.map((t) => [
      t.id,
      t.title,
      t.category,
      t.amount,
      t.date,
      t.type,
    ]);
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      headers.join(',') +
      '\n' +
      rows.map((e) => e.join(',')).join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'transaction_ledger.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this transaction?')) {
      deleteTransaction(id);
    }
  };

  const openAddModal = () => {
    setSelectedTransaction(undefined);
    setIsModalOpen(true);
  };

  const openEditModal = (t: Transaction) => {
    setSelectedTransaction(t);
    setIsModalOpen(true);
  };

  const totalIncome = transactions
    .filter((t) => t.type === 'income')
    .reduce((acc, curr) => acc + curr.amount, 0);
  const totalExpenses = transactions
    .filter((t) => t.type === 'expense')
    .reduce((acc, curr) => acc + curr.amount, 0);

  return (
    <div className="space-y-6 pb-20 animate-fade-in">
      {/* Header Bar */}
      <section className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold font-display text-[var(--text-primary)] tracking-tight">
            Transactions Ledger
          </h1>
          <p className="text-sm font-medium text-[var(--text-secondary)] mt-0.5">
            Audit, filter, and manage your complete financial history
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="glass"
            size="sm"
            onClick={handleExport}
            leftIcon={<Download className="w-4 h-4 text-[var(--accent-primary)]" />}
          >
            Export CSV
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={openAddModal}
            leftIcon={<Plus className="w-4 h-4" />}
          >
            Add Transaction
          </Button>
        </div>
      </section>

      {/* Summary Cards */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card variant="glass" hoverable glowColor="success">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">
                Total Credit Income
              </span>
              <div className="text-3xl font-bold font-mono text-[var(--success)] mt-1">
                {currencySymbol}
                {totalIncome.toLocaleString()}
              </div>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-[var(--success)]/15 border border-[var(--success)]/30 text-[var(--success)] flex items-center justify-center">
              <ArrowDownRight className="w-6 h-6" />
            </div>
          </div>
        </Card>

        <Card variant="glass" hoverable glowColor="cyan">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">
                Total Debit Expenses
              </span>
              <div className="text-3xl font-bold font-mono text-[var(--text-primary)] mt-1">
                {currencySymbol}
                {totalExpenses.toLocaleString()}
              </div>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-[var(--danger)]/15 border border-[var(--danger)]/30 text-[var(--danger)] flex items-center justify-center">
              <ArrowUpRight className="w-6 h-6" />
            </div>
          </div>
        </Card>
      </section>

      {/* Toolbar & Filters */}
      <Card variant="glass">
        <div className="flex flex-col md:flex-row gap-4 justify-between items-center mb-4">
          {/* Category Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-1 scrollbar-hide">
            {categoryNames.map((cat) => (
              <button
                key={cat}
                onClick={() => setFilter(cat)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer whitespace-nowrap border ${
                  filter === cat
                    ? 'bg-[var(--accent-primary)] text-[var(--text-inverted)] border-transparent shadow-sm'
                    : 'bg-[var(--surface-l2)] text-[var(--text-secondary)] border-[var(--border-rim)] hover:text-[var(--text-primary)]'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Search & Reset */}
          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="flex-1 md:w-64">
              <Input
                placeholder="Search ledger..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                leftIcon={<Search className="w-4 h-4 text-[var(--text-muted)]" />}
                className="py-1.5 text-xs"
              />
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setFilter('All');
                setSearchTerm('');
              }}
              leftIcon={<Filter className="w-3.5 h-3.5" />}
            >
              Reset
            </Button>
          </div>
        </div>

        {/* High-Contrast Transactions Table */}
        <div className="space-y-2 mt-4">
          {displayedData.map((t) => (
            <div
              key={t.id}
              className="flex items-center justify-between p-3.5 rounded-xl bg-[var(--surface-l2)]/50 hover:bg-[var(--surface-l2)] border border-[var(--border-rim)] hover:border-[var(--border-highlight)] transition-all group"
            >
              <div className="flex items-center gap-3.5">
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center text-white ${
                    t.type === 'expense' ? 'bg-[var(--danger)]/80' : 'bg-[var(--success)]/80'
                  }`}
                >
                  {getIcon(t.category)}
                </div>
                <div>
                  <p className="font-bold text-sm text-[var(--text-primary)]">{t.title}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <Badge variant="neutral" size="sm">
                      {t.category}
                    </Badge>
                    <span className="text-[11px] font-mono text-[var(--text-muted)]">{t.date}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="text-right font-mono">
                  <span
                    className={`block font-bold text-base ${
                      t.type === 'expense' ? 'text-[var(--text-primary)]' : 'text-[var(--success)]'
                    }`}
                  >
                    {t.type === 'expense' ? '-' : '+'}{currencySymbol}
                    {Number(t.amount).toFixed(2)}
                  </span>
                </div>

                {/* Edit & Delete Action Triggers */}
                <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={(e) => {
                      e.stopPropagation();
                      openEditModal(t);
                    }}
                  >
                    <Edit className="w-3.5 h-3.5 text-[var(--accent-primary)]" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(t.id);
                    }}
                  >
                    <Trash2 className="w-3.5 h-3.5 text-[var(--danger)]" />
                  </Button>
                </div>
              </div>
            </div>
          ))}

          {displayedData.length === 0 && (
            <div className="py-12 text-center text-[var(--text-muted)] font-mono text-xs">
              No matching transactions found in ledger.
            </div>
          )}
        </div>

        {/* Load More Pagination */}
        {displayedData.length < filteredData.length && (
          <div className="flex justify-center mt-6">
            <Button variant="glass" size="sm" onClick={() => setLimit((prev) => prev + 8)}>
              Load More Entries
            </Button>
          </div>
        )}
      </Card>

      {/* Transaction Edit/Add Modal */}
      <TransactionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        initialData={selectedTransaction}
        isEditMode={!!selectedTransaction}
      />
    </div>
  );
};

export default Transactions;
