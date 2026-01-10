import React, { useState } from "react";
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
          <h1 className="text-3xl font-extrabold text-slate-800 dark:text-white tracking-tight mb-2">
            Transactions
          </h1>
          <p className="text-slate-500 dark:text-slate-400 font-medium">
            Manage and track your financial history.
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleExport}
            className="flex items-center gap-2 px-5 py-2.5 bg-white/60 dark:bg-slate-800/60 backdrop-blur-md text-slate-700 dark:text-slate-200 font-bold rounded-full border border-white dark:border-slate-700 hover:bg-white dark:hover:bg-slate-800 transition-all shadow-sm hover:shadow-md">
            <Download className="w-4 h-4" /> Export
          </button>
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-6 py-2.5 bg-brand-500 text-white font-bold rounded-full hover:bg-brand-600 transition-all shadow-lg shadow-brand-500/30 active:scale-95">
            <Plus className="w-5 h-5" /> Add Transaction
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="glass-panel p-6 rounded-3xl flex items-center justify-between group hover:border-emerald-200 dark:hover:border-emerald-900 transition-all">
          <div>
            <p className="text-slate-500 dark:text-slate-400 font-semibold mb-1">
              Total Income
            </p>
            <h3 className="text-3xl font-extrabold text-emerald-600 dark:text-emerald-400">
              ${totalIncome.toLocaleString()}
            </h3>
          </div>
          <div className="w-14 h-14 bg-emerald-100 dark:bg-emerald-900/30 rounded-2xl flex items-center justify-center text-emerald-600 dark:text-emerald-400 group-hover:scale-110 transition-transform shadow-sm">
            <ArrowDownRight className="w-8 h-8" />
          </div>
        </div>
        <div className="glass-panel p-6 rounded-3xl flex items-center justify-between group hover:border-rose-200 dark:hover:border-rose-900 transition-all">
          <div>
            <p className="text-slate-500 dark:text-slate-400 font-semibold mb-1">
              Total Expenses
            </p>
            <h3 className="text-3xl font-extrabold text-slate-800 dark:text-white">
              ${totalExpenses.toLocaleString()}
            </h3>
          </div>
          <div className="w-14 h-14 bg-rose-100 dark:bg-rose-900/30 rounded-2xl flex items-center justify-center text-rose-500 dark:text-rose-400 group-hover:scale-110 transition-transform shadow-sm">
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
                  className={`px-4 py-2 rounded-xl text-sm font-bold whitespace-nowrap transition-all ${
                    filter === cat
                      ? "bg-brand-500 text-white shadow-lg shadow-brand-500/20"
                      : "filter-chip-default hover:bg-white dark:hover:bg-slate-700"
                  }`}>
                  {cat}
                </button>
              ))}
            </div>

            {/* Search & Sort */}
            <div className="flex gap-3 w-full md:w-auto">
              <div className="relative flex-1 md:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-white/50 dark:bg-slate-800/50 border border-white/50 dark:border-slate-700/50 rounded-xl focus:ring-2 focus:ring-brand-200 focus:bg-white dark:focus:bg-slate-900 outline-none transition-all text-sm font-medium text-slate-700 dark:text-slate-200"
                />
              </div>
              <button
                onClick={() => {
                  setFilter("All");
                  setSearchTerm("");
                  setStartDate(null);
                  setEndDate(null);
                }}
                className="p-2.5 bg-white/50 dark:bg-slate-800/50 rounded-xl border border-white/50 dark:border-slate-700/50 hover:bg-white dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 transition-all text-sm font-bold flex items-center gap-2">
                <Filter className="w-4 h-4" /> Clear
              </button>
            </div>
          </div>

          {/* Date Filters */}
          <div className="flex gap-4 items-center mb-6 overflow-x-auto pb-2">
            <div className="flex items-center gap-2 text-sm text-slate-500 font-bold whitespace-nowrap">
              <span>From:</span>
              <div className="w-40">
                <CustomDatePicker
                  value={startDate ? startDate.toLocaleDateString() : ""}
                  onChange={(d) => setStartDate(d)}
                />
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm text-slate-500 font-bold whitespace-nowrap">
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
              className="flex items-center justify-between p-4 rounded-2xl hover:bg-white/60 dark:hover:bg-white/5 transition-all group border border-transparent hover:border-white/60 dark:hover:border-white/10 group">
              <div className="flex items-center gap-5">
                <div
                  className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-105 shadow-sm ${
                    t.type === "expense"
                      ? "bg-orange-50 dark:bg-orange-900/20 text-orange-500"
                      : "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-500"
                  }`}>
                  {getIcon(t.category)}
                </div>
                <div>
                  <p className="font-bold text-slate-800 dark:text-slate-200 text-lg">
                    {t.title}
                  </p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400">
                      {t.category}
                    </span>
                    <span className="text-xs text-slate-400 font-medium">
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
                        ? "text-slate-800 dark:text-slate-200"
                        : "text-emerald-600 dark:text-emerald-400"
                    }`}>
                    {t.type === "expense" ? "-" : "+"}$
                    {Number(t.amount).toFixed(2)}
                  </span>
                  <span className="text-xs text-slate-400 font-medium">
                    {t.type === "expense" ? "Debit Card" : "Direct Deposit"}
                  </span>
                </div>

                {/* Actions (Visible on Hover) */}
                <div className="hidden md:flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all bg-white/80 dark:bg-slate-800/80 p-1.5 rounded-xl backdrop-blur-sm shadow-sm border border-white/50 dark:border-slate-700/50">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setNewTrans({
                        ...t,
                        paymentMethod: t.paymentMethod || "Card",
                      });
                      setIsModalOpen(true);
                    }}
                    className="p-1.5 hover:bg-brand-50 hover:text-brand-600 rounded-lg text-slate-400 transition-colors"
                    title="Edit">
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(t.id);
                    }}
                    className="p-1.5 hover:bg-rose-50 hover:text-rose-600 rounded-lg text-slate-400 transition-colors"
                    title="Delete">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}

          {displayedData.length === 0 && (
            <div className="py-12 text-center">
              <p className="text-slate-400 font-medium">
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
            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">
              Title
            </label>
            <input
              required
              type="text"
              value={newTrans.title}
              onChange={(e) =>
                setNewTrans({ ...newTrans, title: e.target.value })
              }
              className="w-full px-4 py-3 rounded-xl glass-input font-medium"
              placeholder="e.g. Grocery Shopping"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">
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
                className="w-full px-4 py-3 rounded-xl glass-input font-medium"
                placeholder="0.00"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">
                Type
              </label>
              <div className="relative">
                <select
                  value={newTrans.type}
                  onChange={(e) =>
                    setNewTrans({ ...newTrans, type: e.target.value as any })
                  }
                  className="w-full px-4 py-3 rounded-xl glass-input font-medium appearance-none">
                  <option value="expense">Expense</option>
                  <option value="income">Income</option>
                </select>
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">
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
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">
                Category
              </label>
              <div className="relative">
                <select
                  value={newTrans.category}
                  onChange={(e) =>
                    setNewTrans({ ...newTrans, category: e.target.value })
                  }
                  className="w-full px-4 py-3 rounded-xl glass-input font-medium appearance-none">
                  {categoryNames
                    .filter((c) => c !== "All")
                    .map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                </select>
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Recurring Toggle */}
          <div className="flex items-center gap-4 bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-100 dark:border-slate-700">
            <div className="flex-1">
              <label className="text-sm font-bold text-slate-700 dark:text-slate-300">
                Repeat Transaction
              </label>
              <p className="text-xs text-slate-400">
                Automatically create this transaction?
              </p>
            </div>
            <div className="flex items-center gap-3">
              {isRecurring && (
                <div className="relative">
                  <select
                    value={frequency}
                    onChange={(e) => setFrequency(e.target.value)}
                    className="pl-3 pr-8 py-1.5 text-sm rounded-lg bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 focus:ring-2 focus:ring-brand-500 outline-none appearance-none font-medium">
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                    <option value="yearly">Yearly</option>
                  </select>
                  <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-400 pointer-events-none" />
                </div>
              )}
              <button
                type="button"
                onClick={() => setIsRecurring(!isRecurring)}
                className={`w-12 h-6 rounded-full transition-colors relative ${
                  isRecurring
                    ? "bg-brand-500"
                    : "bg-slate-200 dark:bg-slate-600"
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
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">
                Payment Method
              </label>
              <div className="relative">
                <select
                  value={newTrans.paymentMethod}
                  onChange={(e) =>
                    setNewTrans({ ...newTrans, paymentMethod: e.target.value })
                  }
                  className="w-full px-4 py-3 rounded-xl glass-input font-medium appearance-none">
                  <option>Card</option>
                  <option>Cash</option>
                  <option>UPI</option>
                  <option>Bank Transfer</option>
                </select>
                <CreditCard className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">
                Receipt
              </label>
              <label className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl glass-input font-medium cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 border-dashed border-2 border-slate-300 dark:border-slate-600 transition-colors">
                <Receipt className="w-4 h-4 text-slate-500" />
                <span className="text-xs text-slate-500">
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
