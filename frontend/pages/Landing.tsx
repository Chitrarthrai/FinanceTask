import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  Shield,
  Zap,
  PieChart,
  CheckCircle2,
  BellRing,
  Smartphone,
  Lock,
  Sun,
  Moon,
  Mail,
} from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Logo } from '../components/common/Logo';
import { useAuth } from '../contexts/AuthContext';

interface LandingProps {
  theme?: string;
  setTheme?: (theme: string) => void;
}

export const Landing: React.FC<LandingProps> = ({
  theme = 'dark',
  setTheme = () => {},
}) => {
  const { session } = useAuth();
  const navigate = useNavigate();

  React.useEffect(() => {
    if (session) {
      navigate('/app', { replace: true });
    }
  }, [session, navigate]);

  if (session) {
    return null;
  }

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-[var(--bg-app)] text-[var(--text-primary)]">
      {/* Background Glow Orbs */}
      <div className="absolute top-[-10%] right-[-5%] w-96 h-96 bg-[var(--accent-primary)]/15 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-5%] w-96 h-96 bg-[var(--accent-secondary)]/15 rounded-full blur-[120px] pointer-events-none" />

      {/* Navigation Header */}
      <nav className="relative z-10 flex items-center justify-between px-6 py-5 max-w-7xl mx-auto border-b border-[var(--border-rim)]">
        <Logo size="md" />

        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            title="Toggle Light/Dark Theme"
          >
            {theme === 'dark' ? (
              <Sun className="w-4 h-4 text-amber-400" />
            ) : (
              <Moon className="w-4 h-4 text-[var(--text-primary)]" />
            )}
          </Button>

          <Button variant="ghost" size="sm" onClick={() => navigate('/login')}>
            Log In
          </Button>

          <Button variant="primary" size="sm" onClick={() => navigate('/signup')}>
            Get Started
          </Button>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="relative z-10 pt-16 pb-24 px-6 max-w-6xl mx-auto text-center space-y-8">
        <div className="inline-flex items-center gap-2">
          <Badge variant="cyan" pulse size="sm">
            Titanium Release v2.0
          </Badge>
          <span className="text-xs font-mono text-[var(--text-muted)]">
            Autonomous Financial Intelligence Platform
          </span>
        </div>

        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-bold font-display tracking-tight leading-tight">
          Master Your Cash Flow. <br />
          <span className="text-[var(--accent-primary)]">Automate Your Backlog.</span>
        </h1>

        <p className="text-base sm:text-lg text-[var(--text-secondary)] max-w-2xl mx-auto font-sans leading-relaxed">
          FinanceTask brings your monthly budgets, transaction audit ledgers, AI insights, and task operations Kanban into one unified liquid glass interface.
        </p>

        <div className="flex flex-col sm:flex-row justify-center gap-3 pt-2">
          <Button
            variant="primary"
            size="lg"
            onClick={() => navigate('/signup')}
            rightIcon={<ArrowRight className="w-4 h-4" />}
          >
            Start Free Workspace
          </Button>

          <Button
            variant="glass"
            size="lg"
            onClick={() => navigate('/login')}
          >
            Explore Live Demo
          </Button>
        </div>

        {/* Feature Grid */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-12 text-left">
          <Card variant="glass" hoverable glowColor="cyan">
            <div className="w-10 h-10 rounded-xl bg-[var(--accent-primary-light)] text-[var(--accent-primary)] flex items-center justify-center mb-3">
              <PieChart className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold font-display text-[var(--text-primary)] mb-1">
              Smart Neon Analytics
            </h3>
            <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
              Real-time velocity area charts, category breakdown donuts, and AI financial recommendations.
            </p>
          </Card>

          <Card variant="glass" hoverable glowColor="violet">
            <div className="w-10 h-10 rounded-xl bg-[var(--accent-secondary)]/15 text-[var(--accent-secondary)] flex items-center justify-center mb-3">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold font-display text-[var(--text-primary)] mb-1">
              Operations Kanban
            </h3>
            <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
              Agile drag-and-drop task board with priority status badges and Reason Not Done feedback loops.
            </p>
          </Card>

          <Card variant="glass" hoverable glowColor="success">
            <div className="w-10 h-10 rounded-xl bg-[var(--success)]/15 text-[var(--success)] flex items-center justify-center mb-3">
              <Lock className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold font-display text-[var(--text-primary)] mb-1">
              Supabase PostgreSQL
            </h3>
            <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
              Row Level Security policies, encrypted database schemas, and instant cross-device sync.
            </p>
          </Card>
        </section>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-[var(--border-rim)] py-8 px-6 text-center text-xs font-mono text-[var(--text-muted)]">
        © 2026 FinanceTask (Toffee). Titanium Industrial Modern Architecture.
      </footer>
    </div>
  );
};

export default Landing;
