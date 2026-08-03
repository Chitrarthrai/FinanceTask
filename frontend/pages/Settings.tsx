import React, { useState, useEffect } from 'react';
import {
  User,
  Wallet,
  Bell,
  Save,
  Moon,
  Sun,
  Plus,
  Trash2,
  DollarSign,
  List,
  Lock,
} from 'lucide-react';
import { useOutletContext } from 'react-router-dom';
import { useData } from '../contexts/DataContext';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { ExpenseItem } from '../types';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Badge } from '../components/ui/Badge';

export const Settings: React.FC = () => {
  const { user } = useAuth();
  const {
    budgetSettings,
    updateBudgetSettings,
    categories,
    deleteCategory,
    currencySymbol,
  } = useData();

  const [activeTab, setActiveTab] = useState('profile');
  const { theme, setTheme } = useOutletContext<{
    theme: string;
    setTheme: (t: string) => void;
  }>();

  const [profileData, setProfileData] = useState({
    fullName: user?.user_metadata?.full_name || 'User',
    email: user?.email || '',
    avatarUrl: '',
  });

  useEffect(() => {
    if (!user) return;
    const fetchProfile = async () => {
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (data) {
        setProfileData({
          fullName: data.full_name || '',
          email: data.email || '',
          avatarUrl: data.avatar_url || '',
        });
      }
    };
    fetchProfile();
  }, [user]);

  const handleSaveProfile = async () => {
    if (!user) return;
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: profileData.fullName,
        })
        .eq('id', user.id);

      if (error) throw error;
      alert('Profile updated successfully!');
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Failed to update profile.');
    }
  };

  const [saveStatus, setSaveStatus] = useState('Save Changes');

  const [newFixedName, setNewFixedName] = useState('');
  const [newFixedAmount, setNewFixedAmount] = useState('');
  const [newVarName, setNewVarName] = useState('');
  const [newVarAmount, setNewVarAmount] = useState('');

  const [salaryInput, setSalaryInput] = useState(
    budgetSettings.monthlySalary.toString()
  );
  const [savingsInput, setSavingsInput] = useState(
    (budgetSettings.savingsTargetPercent || 0).toString()
  );

  const handleSaveBudget = () => {
    setSaveStatus('Saving...');
    updateBudgetSettings({
      monthlySalary: Number(salaryInput),
      savingsTargetPercent: Number(savingsInput),
    });

    setTimeout(() => {
      setSaveStatus('Saved Successfully!');
      setTimeout(() => setSaveStatus('Save Changes'), 2000);
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
      setNewFixedName('');
      setNewFixedAmount('');
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
      setNewVarName('');
      setNewVarAmount('');
    }
  };

  const removeVariableExpense = (id: string) => {
    updateBudgetSettings({
      variableExpenses: budgetSettings.variableExpenses.filter((e) => e.id !== id),
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
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'budget', label: 'Budget Config', icon: Wallet },
    { id: 'categories', label: 'Categories', icon: List },
    { id: 'preferences', label: 'Preferences', icon: Bell },
    { id: 'security', label: 'Security', icon: Lock },
  ];

  return (
    <div className="w-full pb-20 animate-fade-in space-y-6">
      <div>
        <h1 className="text-3xl font-bold font-display text-[var(--text-primary)] tracking-tight">
          System Control & Settings
        </h1>
        <p className="text-sm font-medium text-[var(--text-secondary)] mt-0.5">
          Configure personal profile, budget targets, category limits, and security
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Navigation Tabs */}
        <div className="lg:w-60 shrink-0">
          <Card variant="glass" padding="sm" className="space-y-1">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    isActive
                      ? 'bg-[var(--accent-primary)] text-[var(--text-inverted)] shadow-sm font-bold'
                      : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-l2)]'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </Card>
        </div>

        {/* Content Section */}
        <div className="flex-1">
          <Card variant="glass" padding="lg">
            {activeTab === 'profile' && (
              <div className="space-y-6">
                <div className="flex items-center gap-4 pb-6 border-b border-[var(--border-rim)]">
                  <div className="w-16 h-16 rounded-2xl bg-[var(--accent-primary)]/15 border border-[var(--accent-primary)]/30 flex items-center justify-center text-[var(--accent-primary)] font-bold text-xl font-mono">
                    {profileData.fullName.charAt(0)}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold font-display text-[var(--text-primary)]">
                      {profileData.fullName}
                    </h3>
                    <p className="text-xs font-mono text-[var(--text-muted)] mt-0.5">
                      {profileData.email}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Full Name"
                    value={profileData.fullName}
                    onChange={(e) =>
                      setProfileData({ ...profileData, fullName: e.target.value })
                    }
                  />
                  <Input
                    label="Email Address"
                    value={profileData.email}
                    disabled
                    className="opacity-60 cursor-not-allowed"
                  />
                </div>

                <div className="flex justify-end pt-4 border-t border-[var(--border-rim)]">
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={handleSaveProfile}
                    leftIcon={<Save className="w-4 h-4" />}
                  >
                    Save Profile
                  </Button>
                </div>
              </div>
            )}

            {activeTab === 'budget' && (
              <div className="space-y-8">
                {/* Income & Target */}
                <div>
                  <h3 className="text-base font-bold font-display text-[var(--text-primary)] mb-4">
                    Income & Target Savings
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                      label="Monthly Net Income"
                      type="number"
                      value={salaryInput}
                      onChange={(e) => setSalaryInput(e.target.value)}
                      leftIcon={<DollarSign className="w-4 h-4 text-[var(--text-muted)]" />}
                    />
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <label className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">
                          Savings Rate Target
                        </label>
                        <span className="text-xs font-mono font-bold text-[var(--accent-primary)]">
                          {savingsInput}%
                        </span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="50"
                        value={savingsInput}
                        onChange={(e) => setSavingsInput(e.target.value)}
                        className="w-full accent-[var(--accent-primary)] h-2 bg-[var(--surface-l2)] rounded-lg appearance-none cursor-pointer mt-3"
                      />
                    </div>
                  </div>
                </div>

                {/* Fixed Expenses */}
                <div className="pt-6 border-t border-[var(--border-rim)] space-y-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <h4 className="text-sm font-bold font-display text-[var(--text-primary)]">
                        Fixed Monthly Expenses
                      </h4>
                      <p className="text-xs text-[var(--text-muted)]">Rent, Insurance, Subscriptions</p>
                    </div>
                    <span className="text-lg font-bold font-mono text-[var(--danger)]">
                      {currencySymbol}{totalFixed.toLocaleString()}
                    </span>
                  </div>

                  <div className="space-y-2">
                    {budgetSettings.fixedExpenses.map((expense) => (
                      <div
                        key={expense.id}
                        className="flex items-center justify-between p-3 rounded-xl bg-[var(--surface-l2)]/60 border border-[var(--border-rim)] text-xs font-mono"
                      >
                        <span className="font-semibold text-[var(--text-primary)]">{expense.name}</span>
                        <div className="flex items-center gap-3">
                          <span className="font-bold text-[var(--text-primary)]">
                            {currencySymbol}{expense.amount}
                          </span>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => removeFixedExpense(expense.id)}
                          >
                            <Trash2 className="w-3.5 h-3.5 text-[var(--danger)]" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="flex gap-2 pt-2">
                    <Input
                      placeholder="Expense title"
                      value={newFixedName}
                      onChange={(e) => setNewFixedName(e.target.value)}
                      className="py-1.5 text-xs flex-1"
                    />
                    <Input
                      placeholder="Amount"
                      type="number"
                      value={newFixedAmount}
                      onChange={(e) => setNewFixedAmount(e.target.value)}
                      className="py-1.5 text-xs w-28"
                    />
                    <Button
                      variant="glass"
                      size="sm"
                      onClick={addFixedExpense}
                      disabled={!newFixedName || !newFixedAmount}
                      leftIcon={<Plus className="w-3.5 h-3.5" />}
                    >
                      Add
                    </Button>
                  </div>
                </div>

                {/* Variable Expenses */}
                <div className="pt-6 border-t border-[var(--border-rim)] space-y-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <h4 className="text-sm font-bold font-display text-[var(--text-primary)]">
                        Variable (Estimated) Expenses
                      </h4>
                      <p className="text-xs text-[var(--text-muted)]">Groceries, Transport, Dining</p>
                    </div>
                    <span className="text-lg font-bold font-mono text-[var(--warning)]">
                      {currencySymbol}{totalVariable.toLocaleString()}
                    </span>
                  </div>

                  <div className="space-y-2">
                    {budgetSettings.variableExpenses.map((expense) => (
                      <div
                        key={expense.id}
                        className="flex items-center justify-between p-3 rounded-xl bg-[var(--surface-l2)]/60 border border-[var(--border-rim)] text-xs font-mono"
                      >
                        <span className="font-semibold text-[var(--text-primary)]">{expense.name}</span>
                        <div className="flex items-center gap-3">
                          <span className="font-bold text-[var(--text-primary)]">
                            ~{currencySymbol}{expense.amount}
                          </span>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => removeVariableExpense(expense.id)}
                          >
                            <Trash2 className="w-3.5 h-3.5 text-[var(--danger)]" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="flex gap-2 pt-2">
                    <Input
                      placeholder="Expense title"
                      value={newVarName}
                      onChange={(e) => setNewVarName(e.target.value)}
                      className="py-1.5 text-xs flex-1"
                    />
                    <Input
                      placeholder="Est. amount"
                      type="number"
                      value={newVarAmount}
                      onChange={(e) => setNewVarAmount(e.target.value)}
                      className="py-1.5 text-xs w-28"
                    />
                    <Button
                      variant="glass"
                      size="sm"
                      onClick={addVariableExpense}
                      disabled={!newVarName || !newVarAmount}
                      leftIcon={<Plus className="w-3.5 h-3.5" />}
                    >
                      Add
                    </Button>
                  </div>
                </div>

                <div className="flex justify-end pt-4 border-t border-[var(--border-rim)]">
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={handleSaveBudget}
                    disabled={saveStatus !== 'Save Changes'}
                    leftIcon={<Save className="w-4 h-4" />}
                  >
                    {saveStatus}
                  </Button>
                </div>
              </div>
            )}

            {activeTab === 'categories' && (
              <div className="space-y-6">
                <h3 className="text-base font-bold font-display text-[var(--text-primary)] mb-4">
                  Manage Categories & Spending Limits
                </h3>

                <div className="space-y-2">
                  {categories.map((c) => (
                    <div
                      key={c.id}
                      className="flex items-center justify-between p-3 rounded-xl bg-[var(--surface-l2)]/60 border border-[var(--border-rim)] text-xs font-mono"
                    >
                      <div className="flex items-center gap-3">
                        <span
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: c.color }}
                        />
                        <span className="font-bold text-[var(--text-primary)]">{c.name}</span>
                        <Badge variant="neutral" size="sm">
                          {c.type}
                        </Badge>
                        {c.budgetLimit && (
                          <Badge variant="warning" size="sm">
                            Limit: {currencySymbol}{c.budgetLimit}
                          </Badge>
                        )}
                      </div>

                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          if (window.confirm(`Delete category ${c.name}?`)) {
                            deleteCategory(c.id);
                          }
                        }}
                      >
                        <Trash2 className="w-3.5 h-3.5 text-[var(--danger)]" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'preferences' && (
              <div className="space-y-6">
                <h3 className="text-base font-bold font-display text-[var(--text-primary)] mb-4">
                  Interface & Theme Preferences
                </h3>

                <div className="flex gap-4">
                  <Button
                    variant={theme === 'dark' ? 'primary' : 'glass'}
                    className="flex-1"
                    onClick={() => setTheme('dark')}
                    leftIcon={<Moon className="w-4 h-4" />}
                  >
                    Dark Theme 🌙
                  </Button>
                  <Button
                    variant={theme === 'light' ? 'primary' : 'glass'}
                    className="flex-1"
                    onClick={() => setTheme('light')}
                    leftIcon={<Sun className="w-4 h-4" />}
                  >
                    Light Theme ☀️
                  </Button>
                </div>
              </div>
            )}

            {activeTab === 'security' && (
              <div className="space-y-6">
                <h3 className="text-base font-bold font-display text-[var(--text-primary)] mb-4">
                  Security & Authentication
                </h3>

                <form
                  onSubmit={async (e) => {
                    e.preventDefault();
                    const form = e.target as HTMLFormElement;
                    const newPass = (form.elements.namedItem('newPassword') as HTMLInputElement).value;
                    const confirmPass = (form.elements.namedItem('confirmPassword') as HTMLInputElement).value;

                    if (newPass !== confirmPass) {
                      alert('Passwords do not match!');
                      return;
                    }

                    try {
                      const { error } = await supabase.auth.updateUser({ password: newPass });
                      if (error) throw error;
                      alert('Password updated successfully!');
                      form.reset();
                    } catch (err: any) {
                      alert(err.message || 'Failed to update password.');
                    }
                  }}
                  className="space-y-4 max-w-md"
                >
                  <Input
                    label="New Password"
                    name="newPassword"
                    type="password"
                    required
                    placeholder="••••••••"
                  />
                  <Input
                    label="Confirm Password"
                    name="confirmPassword"
                    type="password"
                    required
                    placeholder="••••••••"
                  />
                  <Button type="submit" variant="primary" className="w-full">
                    Update Password
                  </Button>
                </form>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Settings;
