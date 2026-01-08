import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Transaction, Task } from '../types';
import { RECENT_TRANSACTIONS, ALL_TASKS } from '../constants';

interface DataContextType {
  transactions: Transaction[];
  tasks: Task[];
  addTransaction: (t: Transaction) => void;
  addTask: (t: Task) => void;
  deleteTransaction: (id: string) => void;
  deleteTask: (id: string) => void;
  updateTaskStatus: (id: string, status: Task['status']) => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

interface DataProviderProps {
  children: ReactNode;
}

export const DataProvider: React.FC<DataProviderProps> = ({ children }) => {
  // Initialize with expanded mock data
  const [transactions, setTransactions] = useState<Transaction[]>([
    ...RECENT_TRANSACTIONS,
    { id: '5', title: 'Salary Deposit', category: 'Income', amount: 5400.00, date: 'Aug 20, 2024', type: 'income' },
    { id: '6', title: 'Electric Bill', category: 'Utilities', amount: 145.20, date: 'Aug 18, 2024', type: 'expense' },
    { id: '7', title: 'Starbucks', category: 'Food', amount: 6.50, date: 'Aug 18, 2024', type: 'expense' },
    { id: '8', title: 'Gym Membership', category: 'Health', amount: 45.00, date: 'Aug 15, 2024', type: 'expense' },
    { id: '9', title: 'Client Payment', category: 'Income', amount: 1200.00, date: 'Aug 12, 2024', type: 'income' },
    { id: '10', title: 'Uber Ride', category: 'Transport', amount: 24.50, date: 'Aug 10, 2024', type: 'expense' },
  ]);
  
  const [tasks, setTasks] = useState<Task[]>(ALL_TASKS);

  const addTransaction = (t: Transaction) => setTransactions([t, ...transactions]);
  
  const addTask = (t: Task) => setTasks([t, ...tasks]);
  
  const deleteTransaction = (id: string) => setTransactions(transactions.filter(t => t.id !== id));
  
  const deleteTask = (id: string) => setTasks(tasks.filter(t => t.id !== id));

  const updateTaskStatus = (id: string, status: Task['status']) => {
    setTasks(tasks.map(t => t.id === id ? { ...t, status } : t));
  };

  return (
    <DataContext.Provider value={{ transactions, tasks, addTransaction, addTask, deleteTransaction, deleteTask, updateTaskStatus }}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) throw new Error('useData must be used within DataProvider');
  return context;
};