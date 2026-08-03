import React, { useState, useEffect } from "react";
import { ChevronDown, CreditCard, Receipt } from "lucide-react";
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
    currencySymbol,
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

      onClose();
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
      <form onSubmit={handleSubmit} className="space-y-4 font-sans">
        <div>
          <label className="block text-xs font-bold font-display uppercase tracking-wider text-[var(--text-secondary)] mb-1">
            Title
          </label>
          <input
            required
            type="text"
            value={newTrans.title}
            onChange={(e) =>
              setNewTrans({ ...newTrans, title: e.target.value })
            }
            className="w-full glass-input rounded-xl px-4 py-2.5 text-xs font-medium"
            placeholder="e.g. Grocery Shopping"
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold font-display uppercase tracking-wider text-[var(--text-secondary)] mb-1">
              Amount ({currencySymbol})
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
              className="w-full glass-input rounded-xl px-4 py-2.5 text-xs font-mono font-bold"
              placeholder="0.00"
            />
          </div>
          <div>
            <label className="block text-xs font-bold font-display uppercase tracking-wider text-[var(--text-secondary)] mb-1">
              Type
            </label>
            <div className="relative">
              <select
                value={newTrans.type}
                onChange={(e) =>
                  setNewTrans({ ...newTrans, type: e.target.value as any })
                }
                className="w-full glass-input rounded-xl px-4 py-2.5 text-xs font-semibold appearance-none">
                <option value="expense">Expense</option>
                <option value="income">Income</option>
              </select>
              <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)] pointer-events-none" />
            </div>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold font-display uppercase tracking-wider text-[var(--text-secondary)] mb-1">
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
            <label className="block text-xs font-bold font-display uppercase tracking-wider text-[var(--text-secondary)] mb-1">
              Category
            </label>
            <div className="relative">
              <select
                value={newTrans.category}
                onChange={(e) =>
                  setNewTrans({ ...newTrans, category: e.target.value })
                }
                className="w-full glass-input rounded-xl px-4 py-2.5 text-xs font-semibold appearance-none">
                {categoryNames
                  .filter((c) => c !== "All")
                  .map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
              </select>
              <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)] pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Recurring Toggle */}
        <div className="flex items-center gap-4 bg-[var(--surface-l2)]/60 p-3.5 rounded-xl border border-[var(--border-rim)]">
          <div className="flex-1">
            <label className="text-xs font-bold text-[var(--text-primary)]">
              Repeat Transaction
            </label>
            <p className="text-[11px] text-[var(--text-muted)]">
              Automatically create this transaction?
            </p>
          </div>
          <div className="flex items-center gap-3">
            {isRecurring && (
              <div className="relative">
                <select
                  value={frequency}
                  onChange={(e) => setFrequency(e.target.value)}
                  className="pl-3 pr-8 py-1 text-xs rounded-lg glass-input font-medium appearance-none">
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                  <option value="yearly">Yearly</option>
                </select>
                <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-[var(--text-muted)] pointer-events-none" />
              </div>
            )}
            <button
              type="button"
              onClick={() => setIsRecurring(!isRecurring)}
              className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                isRecurring ? "bg-[var(--accent-primary)]" : "bg-[var(--surface-l2)] border border-[var(--border-rim)]"
              }`}>
              <div
                className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform ${
                  isRecurring ? "translate-x-5" : "translate-x-0"
                }`}
              />
            </button>
          </div>
        </div>

        {/* Payment Method & Receipt */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold font-display uppercase tracking-wider text-[var(--text-secondary)] mb-1">
              Payment Method
            </label>
            <div className="relative">
              <select
                value={newTrans.paymentMethod}
                onChange={(e) =>
                  setNewTrans({ ...newTrans, paymentMethod: e.target.value })
                }
                className="w-full glass-input rounded-xl px-4 py-2.5 text-xs font-semibold appearance-none">
                <option>Card</option>
                <option>Cash</option>
                <option>UPI</option>
                <option>Bank Transfer</option>
              </select>
              <CreditCard className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)] pointer-events-none" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold font-display uppercase tracking-wider text-[var(--text-secondary)] mb-1">
              Receipt
            </label>
            <label className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl glass-input font-medium cursor-pointer border-dashed border border-[var(--border-rim)] hover:border-[var(--accent-primary)] transition-colors">
              <Receipt className="w-4 h-4 text-[var(--text-muted)]" />
              <span className="text-xs text-[var(--text-muted)]">
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
          className="w-full py-3 bg-[var(--accent-primary)] text-[var(--text-inverted)] text-xs font-bold rounded-xl hover:scale-[1.01] active:scale-[0.99] transition-all shadow-lg cursor-pointer flex items-center justify-center gap-2">
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
