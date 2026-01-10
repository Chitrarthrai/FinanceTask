import React, { useState, useEffect } from "react";
import { HashRouter, Routes, Route, Navigate, Outlet } from "react-router-dom";
import Sidebar from "./components/Sidebar";
import Header from "./components/Header";
import Dashboard from "./pages/Dashboard";
import Transactions from "./pages/Transactions";
import Tasks from "./pages/Tasks";
import Analytics from "./pages/Analytics";
import Settings from "./pages/Settings";
import Reports from "./pages/Reports";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import { DataProvider } from "./contexts/DataContext";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { Loader2 } from "lucide-react";

// Layout for the main authenticated application
const AppLayout = ({
  theme,
  setTheme,
}: {
  theme: string;
  setTheme: (t: string) => void;
}) => {
  return (
    <div className="flex min-h-screen text-slate-800 dark:text-slate-100 font-sans selection:bg-brand-200 selection:text-brand-900 transition-colors duration-300">
      <Sidebar />
      <div className="flex-1 lg:pl-64 transition-all duration-300">
        <Header theme={theme} setTheme={setTheme} />
        <main className="px-6 py-4">
          <Outlet context={{ theme, setTheme }} />
        </main>
      </div>
    </div>
  );
};

// Protected Route Component
const ProtectedRoute = ({ children }: { children: React.ReactElement }) => {
  const { session, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
        <Loader2 className="w-8 h-8 animate-spin text-brand-500" />
      </div>
    );
  }

  if (!session) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

const App = () => {
  // Theme state management with localStorage persistence
  const [theme, setTheme] = useState(() => {
    const savedTheme = localStorage.getItem("theme");
    return savedTheme || "dark";
  });

  useEffect(() => {
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    localStorage.setItem("theme", theme);
  }, [theme]);

  // Combined Provider to ensure Data has access to Auth if needed later
  const AppProviders = ({ children }: { children: React.ReactNode }) => (
    <AuthProvider>
      <DataProvider>{children}</DataProvider>
    </AuthProvider>
  );

  return (
    <AppProviders>
      <HashRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />

          {/* Protected App Routes */}
          <Route
            path="/app"
            element={
              <ProtectedRoute>
                <AppLayout theme={theme} setTheme={setTheme} />
              </ProtectedRoute>
            }>
            <Route index element={<Dashboard />} />
            <Route path="transactions" element={<Transactions />} />
            <Route path="tasks" element={<Tasks />} />
            <Route path="analytics" element={<Analytics />} />
            <Route path="reports" element={<Reports />} />
            <Route path="settings" element={<Settings />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </HashRouter>
    </AppProviders>
  );
};

export default App;
