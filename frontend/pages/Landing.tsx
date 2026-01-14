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
} from "lucide-react";

const Landing = () => {
  const navigate = useNavigate();

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
          <div className="w-8 h-8 bg-brand-600 rounded-lg flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-brand-500/30">
            F
          </div>
          <div className="text-2xl font-black text-text-primary tracking-tighter">
            FinanceTask
          </div>
        </div>
        <div className="flex gap-4">
          <button
            onClick={() => navigate("/login")}
            className="px-6 py-2.5 text-text-secondary font-bold hover:text-brand-600 transition-colors">
            Log In
          </button>
          <button
            onClick={() => navigate("/signup")}
            className="hidden sm:block px-6 py-2.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold rounded-full hover:bg-slate-800 dark:hover:bg-slate-100 hover:shadow-lg transition-all active:scale-95">
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
            className="group px-8 py-4 bg-brand-600 text-white text-lg font-bold rounded-full shadow-xl shadow-brand-500/30 hover:bg-brand-700 hover:scale-105 transition-all flex items-center justify-center gap-2">
            Start Free Trial
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
          <button className="px-8 py-4 bg-bg-secondary/50 backdrop-blur-md text-text-primary text-lg font-bold rounded-full border border-border-primary hover:bg-bg-secondary transition-all shadow-lg hover:shadow-xl">
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

      {/* Footer */}
      <footer className="relative z-10 border-t border-border-primary bg-bg-secondary/30 backdrop-blur-xl mt-20">
        <div className="max-w-7xl mx-auto px-6 py-12 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-slate-800 dark:bg-white rounded-md flex items-center justify-center text-white dark:text-slate-900 font-bold text-sm">
              F
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
