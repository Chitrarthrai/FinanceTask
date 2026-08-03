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
import P2PShare from "./pages/P2PShare";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Notes from "./pages/Notes";
import { DataProvider } from "./contexts/DataContext";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { AIChatBot } from "./components/AIChatBot";
import { OnboardingTour } from "./components/ui/OnboardingTour";
import { Loader2 } from "lucide-react";

const AppLayout = ({
  theme,
  setTheme,
}: {
  theme: string;
  setTheme: (t: string) => void;
}) => {
  return (
    <div className="min-h-screen bg-[var(--bg-app)] text-[var(--text-primary)] font-sans transition-colors duration-300">
      <Sidebar />
      <div className="lg:pl-64 flex flex-col min-h-screen transition-all duration-300">
        <div className="px-4 sm:px-6 py-4 flex-1 flex flex-col w-full">
          <Header theme={theme} setTheme={setTheme} />
          <main className="flex-1 w-full">
            <Outlet context={{ theme, setTheme }} />
          </main>
        </div>
        <AIChatBot />
        <OnboardingTour />
      </div>
    </div>
  );
};

const ProtectedRoute = ({ children }: { children: React.ReactElement }) => {
  const { session, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--bg-app)]">
        <Loader2 className="w-8 h-8 animate-spin text-[var(--accent-primary)]" />
      </div>
    );
  }

  return children;
};

const App = () => {
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

  const AppProviders = ({ children }: { children: React.ReactNode }) => (
    <AuthProvider>
      <DataProvider>{children}</DataProvider>
    </AuthProvider>
  );

  return (
    <AppProviders>
      <HashRouter>
        <Routes>
          <Route
            path="/"
            element={<Landing theme={theme} setTheme={setTheme} />}
          />
          <Route path="/signup" element={<Signup />} />
          <Route path="/login" element={<Login />} />

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
            <Route path="notes" element={<Notes />} />
            <Route path="analytics" element={<Analytics />} />
            <Route path="reports" element={<Reports />} />
            <Route path="settings" element={<Settings />} />
            <Route path="p2p" element={<P2PShare />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </HashRouter>
    </AppProviders>
  );
};

export default App;
