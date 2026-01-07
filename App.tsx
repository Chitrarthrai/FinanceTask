import React from 'react';
import { HashRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Dashboard from './pages/Dashboard';
import Transactions from './pages/Transactions';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Signup from './pages/Signup';

// Layout for the main authenticated application
const AppLayout = () => {
  return (
    <div className="flex min-h-screen text-slate-800 font-sans selection:bg-brand-200 selection:text-brand-900">
      <Sidebar />
      <div className="flex-1 lg:pl-64 transition-all duration-300">
        <Header />
        <main className="px-6 py-4">
           <Outlet />
        </main>
      </div>
    </div>
  );
};

const App = () => {
  return (
    <HashRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        {/* Protected App Routes */}
        <Route path="/app" element={<AppLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="transactions" element={<Transactions />} />
          <Route path="tasks" element={<div className="glass-panel p-8 rounded-3xl m-6 text-center text-slate-500 font-medium">Tasks Board (Coming Soon)</div>} />
          <Route path="analytics" element={<div className="glass-panel p-8 rounded-3xl m-6 text-center text-slate-500 font-medium">Analytics Module (Coming Soon)</div>} />
          <Route path="settings" element={<div className="glass-panel p-8 rounded-3xl m-6 text-center text-slate-500 font-medium">Settings (Coming Soon)</div>} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </HashRouter>
  );
};

export default App;