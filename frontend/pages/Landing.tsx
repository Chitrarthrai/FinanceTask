import React from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowRight,
  Shield,
  Zap,
  PieChart,
  CheckCircle2,
  Layout,
  BellRing,
  Smartphone,
  Globe,
  Lock,
  CreditCard,
  Sun,
  Moon,
  Mail,
} from "lucide-react";

interface LandingProps {
  theme?: string;
  setTheme?: (theme: string) => void;
}

const Landing: React.FC<LandingProps> = ({
  theme = "light",
  setTheme = (p0: string) => {},
}) => {
  const navigate = useNavigate();

  const toggleTheme = () => {
    setTheme(theme === "light" ? "dark" : "light");
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-bg-primary">
      {/* Dynamic Background Elements */}
      <div className="absolute top-[-20%] right-[-10%] w-200 h-200 bg-brand-400/20 rounded-full blur-[120px] mix-blend-multiply animate-pulse-slow pointer-events-none" />
      <div
        className="absolute bottom-[-20%] left-[-10%] w-150 h-150 bg-indigo-400/20 rounded-full blur-[100px] mix-blend-multiply animate-pulse-slow pointer-events-none"
        style={{ animationDelay: "2s" }}
      />

      {/* Navbar */}
      <nav className="relative z-10 flex items-center justify-between px-6 py-6 max-w-7xl mx-auto">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-tr from-brand-600 via-orange-500 to-amber-500 rounded-lg flex items-center justify-center shadow-lg shadow-brand-500/30">
            <CreditCard className="w-4 h-4 text-white" />
          </div>
          <div className="text-2xl font-black text-text-primary tracking-tighter">
            FinanceTask
          </div>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={toggleTheme}
            className={`p-2.5 rounded-lg border transition-all hover:shadow-lg hover:shadow-brand-500/10 group backdrop-blur-md ${
              theme === "dark"
                ? "bg-slate-800/50 hover:bg-slate-700/80 border-slate-700/50 text-slate-300"
                : "bg-white/40 hover:bg-white/80 border-white/50 text-slate-600"
            }`}
            aria-label="Toggle Dark Mode">
            {theme === "dark" ? (
              <Sun className="w-5 h-5 text-amber-400 group-hover:rotate-45 transition-transform" />
            ) : (
              <Moon className="w-5 h-5 text-slate-600 group-hover:-rotate-12 transition-transform" />
            )}
          </button>
          <button
            onClick={() => navigate("/login")}
            className="px-4 py-2.5 text-sm font-medium rounded-lg border border-border-primary bg-bg-secondary/30 backdrop-blur-sm text-text-secondary hover:text-white hover:bg-brand-600 dark:hover:bg-brand-500 hover:border-brand-600 dark:hover:border-brand-500 transition-all active:scale-95 shadow-sm hover:shadow-brand-500/25">
            Log In
          </button>
          <button
            onClick={() => navigate("/signup")}
            className="hidden sm:block px-4 py-2.5 text-sm font-medium rounded-lg border border-border-primary bg-bg-secondary/30 backdrop-blur-sm text-text-secondary hover:text-white hover:bg-brand-600 dark:hover:bg-brand-500 hover:border-brand-600 dark:hover:border-brand-500 transition-all active:scale-95 shadow-sm hover:shadow-brand-500/25">
            Get Started
          </button>
        </div>
      </nav>

      {/* Hero Content */}
      <main className="relative z-10 pt-20 pb-32 px-6 max-w-7xl mx-auto text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-bg-secondary/70 backdrop-blur-md border border-border-primary mb-8 animate-fade-in shadow-sm hover:scale-105 transition-transform cursor-default">
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-brand-500"></span>
          </span>
          <span className="text-sm font-bold text-text-secondary">
            New: Mobile App Available
          </span>
        </div>

        <h1 className="text-5xl md:text-7xl lg:text-8xl font-extrabold text-text-primary mb-8 tracking-tight leading-[1.1] animate-slide-up">
          Master your money.
          <br />
          <span className="text-transparent bg-clip-text bg-linear-to-r from-brand-600 via-indigo-500 to-purple-500 animate-gradient-x">
            Conquer your tasks.
          </span>
        </h1>

        <p
          className="text-xl text-text-muted mb-12 max-w-2xl mx-auto font-medium leading-relaxed animate-slide-up"
          style={{ animationDelay: "100ms" }}>
          Stop juggling multiple apps. FinanceTask brings your budget,
          transactions, and daily to-dos into one beautiful, unified dashboard.
        </p>

        <div
          className="flex flex-col sm:flex-row justify-center gap-4 animate-slide-up mb-20"
          style={{ animationDelay: "200ms" }}>
          <button
            onClick={() => navigate("/signup")}
            className="group px-6 py-3 text-sm font-medium rounded-lg border-2 border-brand-600 text-brand-600 bg-transparent hover:bg-brand-600 hover:text-white transition-all shadow-lg shadow-brand-500/30 hover:shadow-brand-500/40 flex items-center justify-center gap-2 active:scale-[0.98]">
            Start Free Trial
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
          <button
            onClick={() => navigate("/login")}
            className="px-6 py-3 text-sm font-medium rounded-lg border-2 border-border-primary bg-bg-secondary/30 backdrop-blur-md text-text-primary hover:text-white hover:bg-brand-600 hover:border-brand-600 transition-all shadow-lg hover:shadow-xl active:scale-[0.98]">
            View Live Demo
          </button>
        </div>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 text-left">
          {[
            {
              icon: PieChart,
              color: "text-blue-500",
              bg: "bg-blue-50 dark:bg-blue-900/20",
              title: "Smart Analytics",
              desc: "Visualize your spending habits with interactive charts and monthly reports.",
            },
            {
              icon: CheckCircle2,
              color: "text-emerald-500",
              bg: "bg-emerald-50 dark:bg-emerald-900/20",
              title: "Unified Tasks",
              desc: "Manage your daily to-dos alongside your finances for true productivity.",
            },
            {
              icon: Smartphone,
              color: "text-violet-500",
              bg: "bg-violet-50 dark:bg-violet-900/20",
              title: "Mobile First",
              desc: "Take your dashboard with you. Fully native mobile app for iOS and Android.",
            },
            {
              icon: Zap,
              color: "text-amber-500",
              bg: "bg-amber-50 dark:bg-amber-900/20",
              title: "Instant Sync",
              desc: "Changes made on mobile reflect instantly on web, and vice versa.",
            },
            {
              icon: Lock,
              color: "text-rose-500",
              bg: "bg-rose-50 dark:bg-rose-900/20",
              title: "Bank-Grade Security",
              desc: "Your data is encrypted with AES-256 and protected by Row Level Security.",
            },
            {
              icon: BellRing,
              color: "text-cyan-500",
              bg: "bg-cyan-50 dark:bg-cyan-900/20",
              title: "Smart Alerts",
              desc: "Get notified when you exceed your budget or have an upcoming bill.",
            },
          ].map((feature, i) => (
            <div
              key={i}
              className="group glass-panel p-8 rounded-3xl animate-slide-up hover:border-brand-200 dark:hover:border-brand-800 transition-all duration-300 hover:shadow-2xl hover:shadow-brand-500/10"
              style={{ animationDelay: `${300 + i * 100}ms` }}>
              <div
                className={`w-14 h-14 ${feature.bg} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                <feature.icon className={`w-7 h-7 ${feature.color}`} />
              </div>
              <h3 className="text-xl font-bold text-text-primary mb-3">
                {feature.title}
              </h3>
              <p className="text-text-muted font-medium leading-relaxed">
                {feature.desc}
              </p>
            </div>
          ))}
        </div>
      </main>

      {/* Contact Section */}
      <div className="container mx-auto px-6 pb-24">
        <div className="max-w-4xl mx-auto text-center glass-panel p-12 rounded-[2.5rem] shadow-2xl shadow-brand-500/10 animate-slide-up">
          <h2 className="text-4xl font-bold mb-6 bg-gradient-to-r from-slate-800 to-slate-600 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
            Still have questions?
          </h2>
          <p className="text-xl text-text-secondary mb-8 max-w-2xl mx-auto">
            We're here to help you on your financial journey. Reach out to us
            directly.
          </p>
          <a
            href="mailto:chitrarthrai@gmail.com"
            className="inline-flex items-center gap-2 px-6 py-3 text-sm font-medium rounded-lg border-2 border-brand-600 text-brand-600 bg-transparent hover:bg-brand-600 hover:text-white transition-all shadow-lg shadow-brand-500/30 hover:shadow-brand-500/40 active:scale-[0.98]">
            <Mail className="w-5 h-5" />
            Get in Touch
          </a>
        </div>
      </div>

      {/* Footer */}
      <footer className="relative z-10 border-t border-border-primary bg-bg-secondary/30 backdrop-blur-xl mt-20">
        <div className="max-w-7xl mx-auto px-6 py-12 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-gradient-to-tr from-brand-600 via-orange-500 to-amber-500 rounded-md flex items-center justify-center shadow-lg shadow-brand-500/20">
              <CreditCard className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="font-bold text-text-secondary">FinanceTask</span>
          </div>

          <div className="flex gap-8 text-sm font-medium text-text-muted">
            <a
              href="#"
              className="hover:text-brand-600 dark:hover:text-brand-400 transition-colors">
              Privacy
            </a>
            <a
              href="#"
              className="hover:text-brand-600 dark:hover:text-brand-400 transition-colors">
              Terms
            </a>
            <a
              href="#"
              className="hover:text-brand-600 dark:hover:text-brand-400 transition-colors">
              Contact
            </a>
            <a
              href="#"
              className="hover:text-brand-600 dark:hover:text-brand-400 transition-colors">
              Support
            </a>
          </div>

          <div className="text-text-muted text-sm">
            © 2024 FinanceTask. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
