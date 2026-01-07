import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Dashboard from './pages/Dashboard';
import Transactions from './pages/Transactions';
import Tasks from './pages/Tasks';
import Analytics from './pages/Analytics';
import Settings from './pages/Settings';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Signup from './pages/Signup';

// Layout for the main authenticated application
const AppLayout = ({ theme }: { theme: string }) => {
  return (
    <div className="flex min-h-screen text-slate-800 dark:text-slate-100 font-sans selection:bg-brand-200 selection:text-brand-900 transition-colors duration-300">
      <Sidebar />
      <div className="flex-1 lg:pl-64 transition-all duration-300">
        <Header />
        <main className="px-6 py-4">
           {/* Pass context to children like Settings */}
           <Outlet context={{ theme }} />
        </main>
      </div>
    </div>
  );
};

const App = () => {
  // Theme state management
  const [theme, setTheme] = useState('light');

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  return (
    <HashRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        {/* Protected App Routes - Pass setTheme via context for Settings page */}
        <Route path="/app" element={<Outlet context={{ theme, setTheme }} />}>
           <Route element={<AppLayout theme={theme} />}>
            <Route index element={<Dashboard />} />
            <Route path="transactions" element={<Transactions />} />
            <Route path="tasks" element={<Tasks />} />
            <Route path="analytics" element={<Analytics />} />
            <Route path="settings" element={<Settings />} />
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </HashRouter>
  );
};

export default App;