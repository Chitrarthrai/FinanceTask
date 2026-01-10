import React, { useState, useEffect } from "react";
import {
  User,
  Wallet,
  Bell,
  Shield,
  Save,
  Moon,
  Sun,
  Plus,
  Trash2,
  DollarSign,
  PieChart,
  List,
  Edit2,
  Lock,
} from "lucide-react";
import { useOutletContext } from "react-router-dom";
import { useData } from "../contexts/DataContext";
import { useAuth } from "../contexts/AuthContext";
import { supabase } from "../lib/supabase";
import { ExpenseItem } from "../types";

const Settings = () => {
  const { user, signOut } = useAuth(); // Added
  const {
    budgetSettings,
    updateBudgetSettings,
    categories,
    addCategory,
    updateCategory,
    deleteCategory,
  } = useData();

  const [activeTab, setActiveTab] = useState("profile"); // Modified
  const { theme, setTheme } = useOutletContext<{
    theme: string;
    setTheme: (t: string) => void;
  }>();

  const [profileData, setProfileData] = useState({
    // Added
    fullName: user?.user_metadata?.full_name || "User",
    email: user?.email || "",
    avatarUrl: "",
  });

  // Fetch Profile Data // Added
  useEffect(() => {
    // Added
    if (!user) return; // Added
    const fetchProfile = async () => {
      // Added
      const { data } = await supabase // Added
        .from("profiles") // Added
        .select("*") // Added
        .eq("id", user.id) // Added
        .single(); // Added

      if (data) {
        // Added
        setProfileData({
          // Added
          fullName: data.full_name || "", // Added
          email: data.email || "", // Added
          avatarUrl: data.avatar_url || "", // Added
        }); // Added
      } // Added
    }; // Added
    fetchProfile(); // Added
  }, [user]); // Added

  const handleSaveProfile = async () => {
    // Added
    if (!user) return; // Added
    try {
      // Added
      const { error } = await supabase // Added
        .from("profiles") // Added
        .update({
          // Added
          full_name: profileData.fullName, // Added
          // email is usually managed by Auth, so we might not update it here directly unless using updateUser // Added
        }) // Added
        .eq("id", user.id); // Added

      if (error) throw error; // Added
      alert("Profile updated successfully!"); // Added
    } catch (error) {
      // Added
      console.error("Error updating profile:", error); // Added
      alert("Failed to update profile."); // Added
    } // Added
  }; // Added

  const [saveStatus, setSaveStatus] = useState("Save Changes");

  // Local state for inputs
  const [newFixedName, setNewFixedName] = useState("");
  const [newFixedAmount, setNewFixedAmount] = useState("");
  const [newVarName, setNewVarName] = useState("");
  const [newVarAmount, setNewVarAmount] = useState("");

  // Local state for main config inputs to allow typing before commit
  const [salaryInput, setSalaryInput] = useState(
    budgetSettings.monthlySalary.toString()
  );
  const [savingsInput, setSavingsInput] = useState(
    (budgetSettings.savingsTargetPercent || 0).toString()
  );

  const handleSave = () => {
    setSaveStatus("Saving...");
    updateBudgetSettings({
      monthlySalary: Number(salaryInput),
      savingsTargetPercent: Number(savingsInput),
    });

    setTimeout(() => {
      setSaveStatus("Saved Successfully!");
      setTimeout(() => setSaveStatus("Save Changes"), 2000);
    }, 800);
  };

  const addFixedExpense = () => {
    if (newFixedName && newFixedAmount) {
      const newItem: ExpenseItem = {
        id: Math.random().toString(36).substr(2, 9),
        name: newFixedName,
        amount: parseFloat(newFixedAmount),
      };
      updateBudgetSettings({
        fixedExpenses: [...budgetSettings.fixedExpenses, newItem],
      });
      setNewFixedName("");
      setNewFixedAmount("");
    }
  };

  const removeFixedExpense = (id: string) => {
    updateBudgetSettings({
      fixedExpenses: budgetSettings.fixedExpenses.filter((e) => e.id !== id),
    });
  };

  const addVariableExpense = () => {
    if (newVarName && newVarAmount) {
      const newItem: ExpenseItem = {
        id: Math.random().toString(36).substr(2, 9),
        name: newVarName,
        amount: parseFloat(newVarAmount),
      };
      updateBudgetSettings({
        variableExpenses: [...budgetSettings.variableExpenses, newItem],
      });
      setNewVarName("");
      setNewVarAmount("");
    }
  };

  const removeVariableExpense = (id: string) => {
    updateBudgetSettings({
      variableExpenses: budgetSettings.variableExpenses.filter(
        (e) => e.id !== id
      ),
    });
  };

  const totalFixed = budgetSettings.fixedExpenses.reduce(
    (acc, curr) => acc + curr.amount,
    0
  );
  const totalVariable = budgetSettings.variableExpenses.reduce(
    (acc, curr) => acc + curr.amount,
    0
  );

  const tabs = [
    { id: "profile", label: "Profile", icon: User },
    { id: "budget", label: "Budget Config", icon: Wallet },
    { id: "categories", label: "Categories", icon: List },
    { id: "preferences", label: "Preferences", icon: Bell },
    { id: "security", label: "Security", icon: Lock },
  ];

  return (
    <div className="max-w-5xl mx-auto pb-20 animate-fade-in">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-slate-800 dark:text-white tracking-tight mb-2">
          Settings
        </h1>
        <p className="text-slate-500 dark:text-slate-400 font-medium">
          Manage your account, budget, and application preferences.
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar Tabs */}
        <div className="lg:w-64 flex-shrink-0">
          <div className="glass-panel p-2 rounded-2xl flex flex-row lg:flex-col gap-1 overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-bold text-sm whitespace-nowrap ${
                  activeTab === tab.id
                    ? "bg-brand-500 text-white shadow-lg shadow-brand-500/30"
                    : "text-slate-500 dark:text-slate-400 hover:bg-white/50 dark:hover:bg-slate-700/50 hover:text-slate-800 dark:hover:text-slate-200"
                }`}>
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1">
          <div className="glass-panel p-8 rounded-3xl animate-slide-up">
            {activeTab === "profile" && (
              <div className="space-y-6">
                {/* Profile Content */}
                <div className="flex items-center gap-6 pb-6 border-b border-white/20 dark:border-white/10">
                  <div className="relative">
                    <img
                      src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
                      alt="Profile"
                      className="w-24 h-24 rounded-full object-cover ring-4 ring-white dark:ring-slate-700 shadow-lg"
                    />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-slate-800 dark:text-white">
                      Alex M.
                    </h3>
                    <p className="text-slate-500 dark:text-slate-400 font-medium">
                      alex.m@example.com
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700 dark:text-slate-300">
                      Full Name
                    </label>
                    <input
                      type="text"
                      value={profileData.fullName}
                      onChange={(e) =>
                        setProfileData({
                          ...profileData,
                          fullName: e.target.value,
                        })
                      }
                      className="w-full px-4 py-3 rounded-xl glass-input font-medium"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700 dark:text-slate-300">
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={profileData.email}
                      disabled // Email usually generic/disabled if from auth
                      className="w-full px-4 py-3 rounded-xl glass-input font-medium opacity-70 cursor-not-allowed"
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-6 border-t border-white/20 dark:border-white/10">
                  <button
                    onClick={handleSaveProfile}
                    className="flex items-center gap-2 px-8 py-3 bg-brand-500 text-white font-bold rounded-full hover:bg-brand-600 transition-all shadow-lg active:scale-95">
                    <Save className="w-4 h-4" /> Save Profile
                  </button>
                </div>
              </div>
            )}

            {activeTab === "budget" && (
              <div className="space-y-10">
                {/* Income & Savings */}
                <div>
                  <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-6">
                    Income & Savings
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-slate-700 dark:text-slate-300">
                        Monthly Net Income
                      </label>
                      <div className="relative">
                        <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                          type="number"
                          value={salaryInput}
                          onChange={(e) => setSalaryInput(e.target.value)}
                          className="w-full pl-10 pr-4 py-3 rounded-xl glass-input font-bold"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <label className="text-sm font-bold text-slate-700 dark:text-slate-300">
                          Target Savings Rate
                        </label>
                        <span className="text-sm font-bold text-brand-600">
                          {savingsInput}%
                        </span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="50"
                        value={savingsInput}
                        onChange={(e) => setSavingsInput(e.target.value)}
                        className="w-full accent-brand-500 h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer mt-4"
                      />
                    </div>
                  </div>
                </div>

                {/* Fixed Expenses */}
                <div className="border-t border-white/20 dark:border-white/10 pt-8">
                  <div className="flex justify-between items-end mb-4">
                    <div>
                      <h3 className="text-xl font-bold text-slate-800 dark:text-white">
                        Fixed Expenses
                      </h3>
                      <p className="text-slate-500 dark:text-slate-400 text-sm">
                        Rent, Internet, Subscriptions
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-extrabold text-rose-500 dark:text-rose-400">
                        ${totalFixed.toLocaleString()}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3 mb-4">
                    {budgetSettings.fixedExpenses.map((expense) => (
                      <div
                        key={expense.id}
                        className="flex items-center gap-4 p-3 bg-white/40 dark:bg-slate-800/40 rounded-2xl border border-white/50 dark:border-slate-700/50 group">
                        <div className="flex-1 font-bold text-slate-800 dark:text-slate-200 ml-2">
                          {expense.name}
                        </div>
                        <div className="font-bold text-slate-600 dark:text-slate-300">
                          ${expense.amount}
                        </div>
                        <button
                          onClick={() => removeFixedExpense(expense.id)}
                          className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-xl transition-colors opacity-0 group-hover:opacity-100">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>

                  <div className="flex gap-3 p-1">
                    <input
                      type="text"
                      placeholder="Expense Name"
                      value={newFixedName}
                      onChange={(e) => setNewFixedName(e.target.value)}
                      className="flex-grow px-4 py-3 rounded-xl glass-input font-medium text-sm"
                    />
                    <input
                      type="number"
                      placeholder="Amount"
                      value={newFixedAmount}
                      onChange={(e) => setNewFixedAmount(e.target.value)}
                      className="w-28 px-4 py-3 rounded-xl glass-input font-medium text-sm"
                    />
                    <button
                      onClick={addFixedExpense}
                      disabled={!newFixedName || !newFixedAmount}
                      className="px-4 py-3 bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-xl font-bold hover:bg-brand-500 hover:text-white transition-colors disabled:opacity-50">
                      <Plus className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                {/* Variable Expenses */}
                <div className="border-t border-white/20 dark:border-white/10 pt-8">
                  <div className="flex justify-between items-end mb-4">
                    <div>
                      <h3 className="text-xl font-bold text-slate-800 dark:text-white">
                        Variable (Estimated)
                      </h3>
                      <p className="text-slate-500 dark:text-slate-400 text-sm">
                        Groceries, Utilities, Transport
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-extrabold text-amber-500 dark:text-amber-400">
                        ${totalVariable.toLocaleString()}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3 mb-4">
                    {budgetSettings.variableExpenses.map((expense) => (
                      <div
                        key={expense.id}
                        className="flex items-center gap-4 p-3 bg-white/40 dark:bg-slate-800/40 rounded-2xl border border-white/50 dark:border-slate-700/50 group">
                        <div className="flex-1 font-bold text-slate-800 dark:text-slate-200 ml-2">
                          {expense.name}
                        </div>
                        <div className="font-bold text-slate-600 dark:text-slate-300">
                          ~${expense.amount}
                        </div>
                        <button
                          onClick={() => removeVariableExpense(expense.id)}
                          className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-xl transition-colors opacity-0 group-hover:opacity-100">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>

                  <div className="flex gap-3 p-1">
                    <input
                      type="text"
                      placeholder="Expense Name"
                      value={newVarName}
                      onChange={(e) => setNewVarName(e.target.value)}
                      className="flex-grow px-4 py-3 rounded-xl glass-input font-medium text-sm"
                    />
                    <input
                      type="number"
                      placeholder="Est. Amount"
                      value={newVarAmount}
                      onChange={(e) => setNewVarAmount(e.target.value)}
                      className="w-28 px-4 py-3 rounded-xl glass-input font-medium text-sm"
                    />
                    <button
                      onClick={addVariableExpense}
                      disabled={!newVarName || !newVarAmount}
                      className="px-4 py-3 bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-xl font-bold hover:bg-brand-500 hover:text-white transition-colors disabled:opacity-50">
                      <Plus className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                <div className="mt-8 pt-6 border-t border-white/20 dark:border-white/10 flex justify-end">
                  <button
                    onClick={handleSave}
                    disabled={saveStatus !== "Save Changes"}
                    className="flex items-center gap-2 px-8 py-3 bg-brand-500 text-white font-bold rounded-full hover:bg-brand-600 transition-all shadow-lg active:scale-95 disabled:opacity-80">
                    <Save className="w-4 h-4" /> {saveStatus}
                  </button>
                </div>
              </div>
            )}

            {activeTab === "categories" && (
              <div>
                <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-6">
                  Manage Categories
                </h3>
                <div className="space-y-2">
                  {categories.map((c) => (
                    <div
                      key={c.id}
                      className="flex items-center justify-between p-3 bg-white/40 dark:bg-slate-800/40 rounded-xl border border-white/50">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-6 h-6 rounded-full"
                          style={{ backgroundColor: c.color }}></div>
                        <span className="font-bold text-slate-700 dark:text-slate-200">
                          {c.name}
                        </span>
                        <span className="text-xs uppercase font-bold bg-slate-200 dark:bg-slate-700 px-2 py-0.5 rounded text-slate-500">
                          {c.type}
                        </span>
                      </div>
                      <button
                        onClick={() => {
                          if (
                            window.confirm(
                              `Are you sure you want to delete ${c.name}? Settings and transaction history might be affected.`
                            )
                          ) {
                            deleteCategory(c.id);
                          }
                        }}
                        className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-xl transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
                <div className="mt-6 pt-6 border-t border-white/20 dark:border-white/10">
                  <h4 className="font-bold text-slate-700 dark:text-slate-300 mb-4">
                    Add New Category
                  </h4>
                  <div className="flex gap-3">
                    <input
                      type="text"
                      placeholder="Category Name"
                      id="new-category-name"
                      className="flex-grow px-4 py-3 rounded-xl glass-input font-medium text-sm"
                    />
                    <select
                      id="new-category-type"
                      className="px-4 py-3 rounded-xl glass-input font-medium text-sm bg-white/50 dark:bg-slate-800/50">
                      <option value="expense">Expense</option>
                      <option value="income">Income</option>
                    </select>
                    <input
                      type="color"
                      id="new-category-color"
                      defaultValue="#3b82f6"
                      className="w-12 h-full rounded-xl cursor-pointer bg-transparent"
                    />
                    <button
                      onClick={() => {
                        const nameInput = document.getElementById(
                          "new-category-name"
                        ) as HTMLInputElement;
                        const typeInput = document.getElementById(
                          "new-category-type"
                        ) as HTMLSelectElement;
                        const colorInput = document.getElementById(
                          "new-category-color"
                        ) as HTMLInputElement;

                        if (nameInput.value) {
                          addCategory({
                            name: nameInput.value,
                            type: typeInput.value as "income" | "expense",
                            color: colorInput.value,
                          });
                          nameInput.value = "";
                        }
                      }}
                      className="px-4 py-3 bg-brand-500 text-white rounded-xl font-bold hover:bg-brand-600 transition-colors">
                      <Plus className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "preferences" && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-4">
                    Appearance
                  </h3>
                  <div className="flex gap-4">
                    <button
                      onClick={() => setTheme("dark")}
                      className={`flex-1 py-3 rounded-xl font-bold transition-all ${
                        theme === "dark"
                          ? "bg-slate-800 text-white ring-2 ring-brand-500"
                          : "bg-slate-200 dark:bg-slate-700 text-slate-600"
                      }`}>
                      <Moon className="w-4 h-4 inline-block mr-2" />
                      Dark Mode
                    </button>
                    <button
                      onClick={() => setTheme("light")}
                      className={`flex-1 py-3 rounded-xl font-bold transition-all ${
                        theme === "light"
                          ? "bg-white ring-2 ring-brand-500 text-brand-600"
                          : "bg-slate-100 text-slate-500"
                      }`}>
                      <Sun className="w-4 h-4 inline-block mr-2" />
                      Light Mode
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "security" && (
              <div className="space-y-6">
                <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-6">
                  Security Settings
                </h3>

                <div className="bg-white/40 dark:bg-slate-800/40 p-6 rounded-2xl border border-white/50 dark:border-slate-700/50">
                  <h4 className="font-bold text-lg text-slate-700 dark:text-slate-200 mb-4">
                    Change Password
                  </h4>
                  <form
                    onSubmit={async (e) => {
                      e.preventDefault();
                      const form = e.target as HTMLFormElement;
                      const newPass = (
                        form.elements.namedItem(
                          "newPassword"
                        ) as HTMLInputElement
                      ).value;
                      const confirmPass = (
                        form.elements.namedItem(
                          "confirmPassword"
                        ) as HTMLInputElement
                      ).value;

                      if (newPass !== confirmPass) {
                        alert("Passwords do not match!");
                        return;
                      }
                      if (newPass.length < 6) {
                        alert("Password must be at least 6 characters.");
                        return;
                      }

                      try {
                        const { error } = await supabase.auth.updateUser({
                          password: newPass,
                        });
                        if (error) throw error;
                        alert("Password updated successfully!");
                        form.reset();
                      } catch (err: any) {
                        alert(err.message || "Failed to update password.");
                      }
                    }}
                    className="space-y-4 max-w-md">
                    <div>
                      <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">
                        New Password
                      </label>
                      <input
                        name="newPassword"
                        type="password"
                        required
                        className="w-full px-4 py-3 rounded-xl glass-input font-medium"
                        placeholder="••••••••"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Confirm Password
                      </label>
                      <input
                        name="confirmPassword"
                        type="password"
                        required
                        className="w-full px-4 py-3 rounded-xl glass-input font-medium"
                        placeholder="••••••••"
                      />
                    </div>
                    <button
                      type="submit"
                      className="w-full py-3 bg-brand-500 text-white font-bold rounded-xl hover:bg-brand-600 transition-colors shadow-lg active:scale-95">
                      Update Password
                    </button>
                  </form>
                </div>

                <div className="bg-rose-50 dark:bg-rose-900/20 p-6 rounded-2xl border border-rose-100 dark:border-rose-900/30">
                  <h4 className="font-bold text-lg text-rose-600 dark:text-rose-400 mb-2">
                    Danger Zone
                  </h4>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                    Once you delete your account, there is no going back. Please
                    be certain.
                  </p>
                  <button
                    type="button"
                    onClick={() =>
                      alert("Account deletion is disabled in this demo.")
                    }
                    className="px-6 py-2.5 bg-white dark:bg-slate-800 text-rose-500 font-bold rounded-xl border-2 border-rose-100 dark:border-rose-900 hover:bg-rose-50 dark:hover:bg-rose-900/40 transition-colors">
                    Delete Account
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
