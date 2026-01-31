import React, { useState, useEffect } from "react";
import { ChevronDown, CreditCard, Receipt, Plus } from "lucide-react";
import Modal from "./Modal";
import CustomDatePicker from "./CustomDatePicker";
import { useData } from "../contexts/DataContext";
import { parseReceiptImage } from "../utils/gemini";
import { supabase } from "../lib/supabase";
import { Transaction } from "../types";

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialData?: Partial<Transaction> & { paymentMethod?: string };
  isEditMode?: boolean;
}

const TransactionModal: React.FC<TransactionModalProps> = ({
  isOpen,
  onClose,
  initialData,
  isEditMode = false,
}) => {
  const {
    addTransaction,
    updateTransaction,
    addRecurringRule,
    categories,
    user,
  } = useData();

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
    id: undefined,
  });

  const [isRecurring, setIsRecurring] = useState(false);
  const [frequency, setFrequency] = useState("monthly");
  const [uploading, setUploading] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [receiptFile, setReceiptFile] = useState<File | null>(null);

  // Initialize form when opening
  useEffect(() => {
    if (isOpen && initialData) {
      setNewTrans({
        ...initialData,
        date:
          initialData.date ||
          new Date().toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          }),
        paymentMethod: initialData.paymentMethod || "Card",
        category: initialData.category || "Food",
        type: initialData.type || "expense",
      });
    } else if (isOpen && !isEditMode) {
      // Reset on new open if not edit
      setNewTrans({
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
        id: undefined,
      });
      setReceiptFile(null);
      setIsRecurring(false);
    }
  }, [isOpen, initialData, isEditMode]);

  const categoryNames = ["All", ...new Set(categories.map((c) => c.name))];
  if (!categoryNames.includes("Income")) categoryNames.push("Income");

  const handleSubmit = async (e: React.FormEvent) => {
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
          receipt_url: receiptPath || newTrans.receipt_url,
          paymentMethod: newTrans.paymentMethod,
        });
      } else {
        // Create new
        await addTransaction({
          id: crypto.randomUUID(),
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

      onClose(); // Close modal on success
      setReceiptFile(null);
    } catch (error) {
      console.error("Error saving transaction:", error);
      alert("Failed to save transaction. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditMode ? "Edit Transaction" : "Add Transaction"}>
      <form onSubmit={handleSubmit} className="space-y-4">
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
            className="w-full px-4 py-3 rounded-lg font-medium bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500 transition-all shadow-sm"
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
              className="w-full px-4 py-3 rounded-lg font-medium bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500 transition-all shadow-sm"
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
                className="w-full px-4 py-3 rounded-lg font-medium appearance-none bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500 transition-all shadow-sm">
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
                className="w-full px-4 py-3 rounded-lg font-medium appearance-none bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500 transition-all shadow-sm">
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
        <div className="flex items-center gap-4 bg-bg-primary/50 p-4 rounded-lg border border-border-primary">
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
                isRecurring ? "bg-brand-500" : "bg-slate-300 dark:bg-slate-600"
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
                className="w-full px-4 py-3 rounded-lg font-medium appearance-none bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500 transition-all shadow-sm">
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
            <label className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg glass-input font-medium cursor-pointer hover:bg-bg-secondary border-dashed border-2 border-border-primary transition-colors">
              <Receipt className="w-4 h-4 text-text-muted" />
              <span className="text-xs text-text-muted">
                {scanning
                  ? "Scanning..."
                  : receiptFile
                    ? receiptFile.name.substring(0, 15) + "..."
                    : "Upload & Scan Receipt"}
              </span>
              <input
                type="file"
                className="hidden"
                accept="image/*,application/pdf"
                onChange={async (e) => {
                  if (e.target.files && e.target.files[0]) {
                    const file = e.target.files[0];
                    setReceiptFile(file);

                    // Trigger AI Scan
                    try {
                      setScanning(true);
                      const result = await parseReceiptImage(file);

                      setNewTrans((prev) => ({
                        ...prev,
                        title: result.merchantName || prev.title,
                        amount: result.amount || prev.amount,
                        date: result.date
                          ? new Date(result.date).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })
                          : prev.date,
                        category: result.category || prev.category,
                        type: result.type || prev.type,
                      }));
                    } catch (err) {
                      console.error("Scan failed", err);
                      alert(
                        "Receipt scan failed, please enter details manually.",
                      );
                    } finally {
                      setScanning(false);
                    }
                  }
                }}
              />
            </label>
          </div>
        </div>

        <button
          type="submit"
          disabled={uploading}
          className="w-full py-2.5 bg-brand-500 text-white text-sm font-medium rounded-lg hover:bg-brand-600 transition-colors shadow-lg shadow-brand-500/30 hover:shadow-brand-500/40 active:scale-95 border border-transparent disabled:opacity-50 flex items-center justify-center gap-2">
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
  );
};

export default TransactionModal;
