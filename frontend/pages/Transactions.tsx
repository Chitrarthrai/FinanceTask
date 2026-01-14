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
  ChevronDown,
  Edit,
  Trash2,
  Receipt,
  CreditCard,
  Briefcase,
  Zap,
  Music,
} from "lucide-react";
import { useData } from "../contexts/DataContext";
import Modal from "../components/Modal";
import { Transaction } from "../types";
import { supabase } from "../lib/supabase";
import CustomDatePicker from "../components/CustomDatePicker";

// Force reload
const Transactions = () => {
  const {
    transactions,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    categories,
    user,
  } = useData();
  const [filter, setFilter] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [limit, setLimit] = useState(6);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [receiptFile, setReceiptFile] = useState<File | null>(null);

  const [searchParams] = useSearchParams();

  useEffect(() => {
    const query = searchParams.get("search");
    if (query) {
      setSearchTerm(query);
    }
  }, [searchParams]);

  const handleViewReceipt = async (path: string) => {
    try {
      if (!path) return;
      const { data, error } = await supabase.storage
        .from("receipts")
        .createSignedUrl(path, 60); // Valid for 60 seconds
      if (error) throw error;
      if (data) {
        window.open(data.signedUrl, "_blank");
      }
    } catch (err) {
      console.error("Error opening receipt:", err);
      alert("Could not open receipt.");
    }
  };

  // Form State
  const [newTrans, setNewTrans] = useState<
    Partial<Transaction> & { paymentMethod?: string }
  >({
    title: "",
    amount: 0,
    category: "Food",
    type: "expense",
    date: new Date().toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }),
    paymentMethod: "Card",
    id: undefined, // Add ID field for updates
  });
  const [isRecurring, setIsRecurring] = useState(false);
  const [frequency, setFrequency] = useState("monthly");
  const { addRecurringRule } = useData();

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

  const handleAddTransaction = async (e: React.FormEvent) => {
    e.preventDefault();
    setUploading(true);
    let receiptPath = "";

    try {
      if (receiptFile && user) {
        const fileExt = receiptFile.name.split(".").pop();
        const fileName = `${user.id}/${Date.now()}.${fileExt}`;
        const { error: uploadError } = await supabase.storage
          .from("receipts")
          .upload(fileName, receiptFile);

        if (uploadError) throw uploadError;
        receiptPath = fileName;
      }

      if (newTrans.id) {
        // Update existing
        await updateTransaction({
          id: newTrans.id,
          title: newTrans.title || "Untitled",
          category: newTrans.category || "Others",
          amount: Number(newTrans.amount),
          date: newTrans.date || "Today",
          type: newTrans.type as "income" | "expense",
          receipt_url: receiptPath || newTrans.receipt_url, // Keep existing if not replaced
          paymentMethod: newTrans.paymentMethod,
        });
      } else {
        // Create new
        await addTransaction({
          id: Math.random().toString(36).substr(2, 9),
          title: newTrans.title || "Untitled",
          category: newTrans.category || "Others",
          amount: Number(newTrans.amount),
          date: newTrans.date || "Today",
          type: newTrans.type as "income" | "expense",
          receipt_url: receiptPath,
          paymentMethod: newTrans.paymentMethod,
        });
      }

      if (isRecurring) {
        let nextDate = new Date(newTrans.date || new Date());
        if (frequency === "weekly") nextDate.setDate(nextDate.getDate() + 7);
        if (frequency === "monthly") nextDate.setMonth(nextDate.getMonth() + 1);
        if (frequency === "yearly")
          nextDate.setFullYear(nextDate.getFullYear() + 1);

        await addRecurringRule({
          title: newTrans.title,
          amount: Number(newTrans.amount),
          category: newTrans.category,
          type: newTrans.type,
          frequency: frequency,
          start_date: new Date(newTrans.date || new Date()).toISOString(),
          next_due_date: nextDate.toISOString(),
        });
      }

      setIsModalOpen(false);
      setNewTrans({
        title: "",
        amount: 0,
        category: "Food",
        type: "expense",
        paymentMethod: "Card",
        id: undefined,
        date: new Date().toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        }),
      });
      setReceiptFile(null);
    } catch (error) {
      console.error("Error saving transaction:", error);
      alert("Failed to save transaction. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = (id: string) => {
    if (window.confirm("Are you sure you want to delete this transaction?")) {
      deleteTransaction(id);
    }
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
            className="flex items-center gap-2 px-5 py-2.5 backdrop-blur-md font-bold rounded-full border transition-all shadow-sm hover:shadow-md bg-bg-secondary/60 text-text-secondary border-border-primary hover:bg-bg-secondary hover:border-brand-300">
            <Download className="w-4 h-4" /> Export
          </button>
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-6 py-2.5 bg-brand-600 text-white font-bold rounded-full hover:bg-brand-700 transition-all shadow-lg shadow-brand-500/30 active:scale-95">
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
          <div className="w-14 h-14 bg-emerald-500 dark:bg-emerald-900/30 rounded-2xl flex items-center justify-center text-white dark:text-emerald-400 group-hover:scale-110 transition-transform shadow-sm">
            <ArrowDownRight className="w-8 h-8" />
          </div>
        </div>
        <div className="glass-panel p-6 rounded-3xl flex items-center justify-between group hover:border-rose-300 dark:hover:border-rose-900 transition-all shadow-sm hover:shadow-md bg-white/60 dark:bg-slate-800/60">
          <div>
            <p className="text-text-muted font-semibold mb-1">Total Expenses</p>
            <h3 className="text-3xl font-extrabold text-text-primary">
              ${totalExpenses.toLocaleString()}
            </h3>
          </div>
          <div className="w-14 h-14 bg-rose-500 dark:bg-rose-900/30 rounded-2xl flex items-center justify-center text-white dark:text-rose-400 group-hover:scale-110 transition-transform shadow-sm">
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
                  className={`px-4 py-2 rounded-xl text-sm font-bold whitespace-nowrap transition-all border ${
                    filter === cat
                      ? "bg-brand-600 text-white shadow-lg shadow-brand-500/30 border-transparent"
                      : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 shadow-sm hover:bg-slate-50 dark:hover:bg-slate-700 hover:border-brand-200 dark:hover:border-slate-600"
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
                className="p-2.5 bg-rose-500 rounded-xl border border-transparent hover:bg-rose-600 text-white transition-all text-sm font-bold flex items-center gap-2 shadow-sm hover:shadow-md hover:-translate-y-0.5">
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
                  className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-105 shadow-sm ${
                    t.type === "expense"
                      ? "bg-orange-500 dark:bg-orange-900/30 text-white dark:text-orange-400"
                      : "bg-emerald-500 dark:bg-emerald-900/30 text-white dark:text-emerald-400"
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
                      setNewTrans({
                        ...t,
                        paymentMethod: t.paymentMethod || "Card",
                      });
                      setIsModalOpen(true);
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
              className="text-sm font-bold text-brand-600 dark:text-brand-400 hover:text-brand-700 dark:hover:text-brand-300 transition-colors">
              Load More
            </button>
          </div>
        )}
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Add Transaction">
        <form onSubmit={handleAddTransaction} className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-text-primary mb-1">
              Title
            </label>
            <input
              required
              type="text"
              value={newTrans.title}
              onChange={(e) =>
                setNewTrans({ ...newTrans, title: e.target.value })
              }
              className="w-full px-4 py-3 rounded-xl font-medium bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500 transition-all shadow-sm"
              placeholder="e.g. Grocery Shopping"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-text-primary mb-1">
                Amount ($)
              </label>
              <input
                required
                type="number"
                step="0.01"
                value={newTrans.amount}
                onChange={(e) =>
                  setNewTrans({
                    ...newTrans,
                    amount: parseFloat(e.target.value),
                  })
                }
                className="w-full px-4 py-3 rounded-xl font-medium bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500 transition-all shadow-sm"
                placeholder="0.00"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-text-primary mb-1">
                Type
              </label>
              <div className="relative">
                <select
                  value={newTrans.type}
                  onChange={(e) =>
                    setNewTrans({ ...newTrans, type: e.target.value as any })
                  }
                  className="w-full px-4 py-3 rounded-xl font-medium appearance-none bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500 transition-all shadow-sm">
                  <option value="expense">Expense</option>
                  <option value="income">Income</option>
                </select>
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted pointer-events-none" />
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-text-primary mb-1">
                Date
              </label>
              <CustomDatePicker
                value={newTrans.date || new Date().toDateString()}
                onChange={(date) =>
                  setNewTrans({
                    ...newTrans,
                    date: date.toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    }),
                  })
                }
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-text-primary mb-1">
                Category
              </label>
              <div className="relative">
                <select
                  value={newTrans.category}
                  onChange={(e) =>
                    setNewTrans({ ...newTrans, category: e.target.value })
                  }
                  className="w-full px-4 py-3 rounded-xl font-medium appearance-none bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500 transition-all shadow-sm">
                  {categoryNames
                    .filter((c) => c !== "All")
                    .map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                </select>
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Recurring Toggle */}
          <div className="flex items-center gap-4 bg-bg-primary/50 p-4 rounded-xl border border-border-primary">
            <div className="flex-1">
              <label className="text-sm font-bold text-text-primary">
                Repeat Transaction
              </label>
              <p className="text-xs text-text-muted">
                Automatically create this transaction?
              </p>
            </div>
            <div className="flex items-center gap-3">
              {isRecurring && (
                <div className="relative">
                  <select
                    value={frequency}
                    onChange={(e) => setFrequency(e.target.value)}
                    className="pl-3 pr-8 py-1.5 text-sm rounded-lg bg-bg-secondary border border-border-primary focus:ring-2 focus:ring-brand-500 outline-none appearance-none font-medium text-text-primary">
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                    <option value="yearly">Yearly</option>
                  </select>
                  <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-text-muted pointer-events-none" />
                </div>
              )}
              <button
                type="button"
                onClick={() => setIsRecurring(!isRecurring)}
                className={`w-12 h-6 rounded-full transition-colors relative ${
                  isRecurring ? "bg-brand-500" : "bg-gray-300 dark:bg-gray-600"
                }`}>
                <div
                  className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform ${
                    isRecurring ? "translate-x-6" : "translate-x-0"
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Payment Method & Receipt */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-text-primary mb-1">
                Payment Method
              </label>
              <div className="relative">
                <select
                  value={newTrans.paymentMethod}
                  onChange={(e) =>
                    setNewTrans({ ...newTrans, paymentMethod: e.target.value })
                  }
                  className="w-full px-4 py-3 rounded-xl font-medium appearance-none bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500 transition-all shadow-sm">
                  <option>Card</option>
                  <option>Cash</option>
                  <option>UPI</option>
                  <option>Bank Transfer</option>
                </select>
                <CreditCard className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted pointer-events-none" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-text-primary mb-1">
                Receipt
              </label>
              <label className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl glass-input font-medium cursor-pointer hover:bg-bg-secondary border-dashed border-2 border-border-primary transition-colors">
                <Receipt className="w-4 h-4 text-text-muted" />
                <span className="text-xs text-text-muted">
                  {receiptFile
                    ? receiptFile.name.substring(0, 15) + "..."
                    : "Upload (Opt)"}
                </span>
                <input
                  type="file"
                  className="hidden"
                  accept="image/*,application/pdf"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      setReceiptFile(e.target.files[0]);
                    }
                  }}
                />
              </label>
            </div>
          </div>

          <button
            type="submit"
            disabled={uploading}
            className="w-full py-3 bg-brand-500 text-white font-bold rounded-xl hover:bg-brand-600 transition-colors shadow-lg shadow-brand-500/30 disabled:opacity-50 flex items-center justify-center gap-2">
            {uploading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Saving...
              </>
            ) : (
              "Save Transaction"
            )}
          </button>
        </form>
      </Modal>
    </div>
  );
};

export default Transactions;
