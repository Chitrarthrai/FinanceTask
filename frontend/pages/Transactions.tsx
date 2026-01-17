import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
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
} from "lucide-react";
import { useData } from "../contexts/DataContext";
import TransactionModal from "../components/TransactionModal";
import { Transaction } from "../types";
import { supabase } from "../lib/supabase";
import CustomDatePicker from "../components/CustomDatePicker"; // Kept if used in filters? Yes, lines 378, 387.

// Force reload
const Transactions = () => {
  const { transactions, deleteTransaction, categories, user } = useData();
  const [filter, setFilter] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [limit, setLimit] = useState(6);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<
    Partial<Transaction> | undefined
  >(undefined);

  const [searchParams] = useSearchParams();

  useEffect(() => {
    const query = searchParams.get("search");
    if (query) {
      setSearchTerm(query);
    }
  }, [searchParams]);

  // Extract category names for UI, adding "All" and "Income" if missing
  const categoryNames = ["All", ...new Set(categories.map((c) => c.name))];
  if (!categoryNames.includes("Income")) categoryNames.push("Income");

  const getIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case "food":
        return <Coffee className="w-5 h-5" />;
      case "shopping":
        return <ShoppingBag className="w-5 h-5" />;
      case "housing":
      case "rent":
        return <Home className="w-5 h-5" />;
      case "utilities":
      case "internet":
        return <Zap className="w-5 h-5" />;
      case "transport":
      case "uber":
        return <Car className="w-5 h-5" />;
      case "income":
      case "salary":
        return <DollarSign className="w-5 h-5" />;
      case "entertainment":
        return <Music className="w-5 h-5" />;
      case "work":
      case "freelance":
        return <Briefcase className="w-5 h-5" />;
      default:
        return <ShoppingBag className="w-5 h-5" />;
    }
  };

  const filteredData = transactions
    .filter((t) => (filter === "All" ? true : t.category === filter))
    .filter((t) => t.title.toLowerCase().includes(searchTerm.toLowerCase()))
    .filter((t) => {
      if (!startDate && !endDate) return true;
      const transDate = new Date(t.date);
      transDate.setHours(0, 0, 0, 0);

      if (startDate) {
        const start = new Date(startDate);
        start.setHours(0, 0, 0, 0);
        if (transDate < start) return false;
      }
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(0, 0, 0, 0);
        if (transDate > end) return false;
      }
      return true;
    });

  const displayedData = filteredData.slice(0, limit);

  const handleExport = () => {
    const headers = ["ID", "Title", "Category", "Amount", "Date", "Type"];
    const rows = filteredData.map((t) => [
      t.id,
      t.title,
      t.category,
      t.amount,
      t.date,
      t.type,
    ]);
    const csvContent =
      "data:text/csv;charset=utf-8," +
      headers.join(",") +
      "\n" +
      rows.map((e) => e.join(",")).join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "transactions.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDelete = (id: string) => {
    if (window.confirm("Are you sure you want to delete this transaction?")) {
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
    .filter((t) => t.type === "income")
    .reduce((acc, curr) => acc + curr.amount, 0);
  const totalExpenses = transactions
    .filter((t) => t.type === "expense")
    .reduce((acc, curr) => acc + curr.amount, 0);

  return (
    <div className="space-y-8 animate-fade-in pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-end gap-6">
        <div>
          <h1 className="text-3xl font-extrabold text-text-primary tracking-tight mb-2">
            Transactions
          </h1>
          <p className="text-text-muted font-medium">
            Manage and track your financial history.
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleExport}
            className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium backdrop-blur-md rounded-lg border transition-all shadow-sm hover:shadow-md bg-bg-secondary/60 text-text-secondary border-border-primary hover:bg-bg-secondary hover:border-brand-300">
            <Download className="w-4 h-4" /> Export
          </button>
          <button
            onClick={openAddModal}
            className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium bg-brand-600 text-white rounded-lg hover:bg-brand-700 transition-all shadow-lg shadow-brand-500/30 hover:shadow-brand-500/40 active:scale-95 border border-transparent">
            <Plus className="w-5 h-5" /> Add Transaction
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="glass-panel p-6 rounded-3xl flex items-center justify-between group hover:border-emerald-300 dark:hover:border-emerald-900 transition-all shadow-sm hover:shadow-md bg-white/60 dark:bg-slate-800/60">
          <div>
            <p className="text-text-muted font-semibold mb-1">Total Income</p>
            <h3 className="text-3xl font-extrabold text-emerald-600 dark:text-emerald-400">
              ${totalIncome.toLocaleString()}
            </h3>
          </div>
          <div className="w-14 h-14 bg-emerald-500 dark:bg-emerald-600 rounded-2xl flex items-center justify-center text-white group-hover:scale-110 transition-transform shadow-lg shadow-emerald-500/30">
            <ArrowDownRight className="w-8 h-8" />
          </div>
        </div>
        <div className="glass-panel p-6 rounded-3xl flex items-center justify-between group hover:border-red-300 dark:hover:border-red-700 transition-all shadow-sm hover:shadow-md bg-white/60 dark:bg-slate-800/60">
          <div>
            <p className="text-text-muted font-semibold mb-1">Total Expenses</p>
            <h3 className="text-3xl font-extrabold text-text-primary">
              ${totalExpenses.toLocaleString()}
            </h3>
          </div>
          <div className="w-14 h-14 bg-red-500 dark:bg-red-600 rounded-2xl flex items-center justify-center text-white group-hover:scale-110 transition-transform shadow-lg shadow-red-500/30">
            <ArrowUpRight className="w-8 h-8" />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div
        className="glass-panel rounded-3xl p-6 md:p-8 animate-slide-up"
        style={{ animationDelay: "200ms" }}>
        {/* Controls */}
        <div className="flex flex-col gap-4 mb-8">
          <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
            {/* Category Filter Chips */}
            <div className="flex gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 scrollbar-hide">
              {categoryNames.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setFilter(cat)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all border shadow-sm ${
                    filter === cat
                      ? "bg-orange-500 dark:bg-brand-600 text-white shadow-lg shadow-orange-500/30 dark:shadow-brand-500/30 border-transparent"
                      : "bg-slate-100 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-border-primary hover:bg-slate-200 dark:hover:bg-slate-800 hover:border-orange-300 dark:hover:border-brand-300"
                  }`}>
                  {cat}
                </button>
              ))}
            </div>

            {/* Search & Sort */}
            <div className="flex gap-3 w-full md:w-auto">
              <div className="relative flex-1 md:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm font-medium glass-input placeholder:text-text-muted"
                />
              </div>
              <button
                onClick={() => {
                  setFilter("All");
                  setSearchTerm("");
                  setStartDate(null);
                  setEndDate(null);
                }}
                className="px-4 py-2.5 text-sm font-medium bg-red-500 dark:bg-red-600 rounded-lg border border-transparent hover:bg-red-600 dark:hover:bg-red-700 text-white transition-all flex items-center gap-2 shadow-sm hover:shadow-md hover:-translate-y-0.5">
                <Filter className="w-4 h-4" /> Clear
              </button>
            </div>
          </div>

          {/* Date Filters - Changed overflow to flex-wrap for visible dropdowns */}
          <div className="flex flex-wrap gap-4 items-center mb-6 pb-2">
            <div className="flex items-center gap-2 text-sm text-text-muted font-bold whitespace-nowrap">
              <span>From:</span>
              <div className="w-40">
                <CustomDatePicker
                  value={startDate ? startDate.toLocaleDateString() : ""}
                  onChange={(d) => setStartDate(d)}
                />
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm text-text-muted font-bold whitespace-nowrap">
              <span>To:</span>
              <div className="w-40">
                <CustomDatePicker
                  value={endDate ? endDate.toLocaleDateString() : ""}
                  onChange={(d) => setEndDate(d)}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Transaction List */}
        <div className="space-y-3">
          {displayedData.map((t) => (
            <div
              key={t.id}
              className="flex items-center justify-between p-4 rounded-2xl hover:bg-orange-50/60 dark:hover:bg-bg-secondary transition-all group border border-transparent hover:border-brand-200 dark:hover:border-border-primary hover:translate-x-1 cursor-default hover:shadow-sm">
              <div className="flex items-center gap-5">
                <div
                  className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-105 shadow-lg ${
                    t.type === "expense"
                      ? "bg-red-500 dark:bg-red-600 text-white shadow-red-500/50 dark:shadow-red-600/30"
                      : "bg-emerald-500 dark:bg-emerald-600 text-white dark:text-emerald-400 shadow-emerald-500/40 dark:shadow-emerald-600/30"
                  }`}>
                  {getIcon(t.category)}
                </div>
                <div>
                  <p className="font-bold text-lg text-text-primary">
                    {t.title}
                  </p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-bg-tertiary text-text-secondary">
                      {t.category}
                    </span>
                    <span className="text-xs text-text-muted font-medium">
                      {t.date}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-6">
                <div className="text-right">
                  <span
                    className={`block font-bold text-xl ${
                      t.type === "expense"
                        ? "text-text-primary"
                        : "text-emerald-500"
                    }`}>
                    {t.type === "expense" ? "-" : "+"}$
                    {Number(t.amount).toFixed(2)}
                  </span>
                  <span className="text-xs text-text-muted font-medium">
                    {t.type === "expense" ? "Debit Card" : "Direct Deposit"}
                  </span>
                </div>

                {/* Actions (Visible on Hover) */}
                <div className="hidden md:flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all p-1.5 rounded-xl backdrop-blur-sm shadow-sm border bg-bg-secondary/90 border-border-primary">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      openEditModal(t);
                    }}
                    className="p-1.5 hover:bg-brand-50 hover:text-brand-600 rounded-lg text-text-muted transition-colors"
                    title="Edit">
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(t.id);
                    }}
                    className="p-1.5 hover:bg-rose-50 hover:text-rose-600 rounded-lg text-text-muted transition-colors"
                    title="Delete">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}

          {displayedData.length === 0 && (
            <div className="py-12 text-center">
              <p className="text-text-muted font-medium">
                No transactions found.
              </p>
            </div>
          )}
        </div>

        {/* Pagination */}
        {displayedData.length < filteredData.length && (
          <div className="flex justify-center mt-8">
            <button
              onClick={() => setLimit((prev) => prev + 5)}
              className="text-sm font-medium text-brand-600 dark:text-brand-400 hover:text-brand-700 dark:hover:text-brand-300 transition-colors">
              Load More
            </button>
          </div>
        )}
      </div>

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
