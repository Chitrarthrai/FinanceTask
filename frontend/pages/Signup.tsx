import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, User, Mail, Lock } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Logo } from '../components/common/Logo';

export const Signup: React.FC = () => {
  const navigate = useNavigate();

  const handleSignup = (e: React.FormEvent) => {
    e.preventDefault();
    navigate('/login');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--bg-app)] p-4 text-[var(--text-primary)] relative">
      <div className="absolute top-6 left-6">
        <Button
          variant="glass"
          size="sm"
          onClick={() => navigate('/')}
          leftIcon={<ArrowLeft className="w-4 h-4" />}
        >
          Home
        </Button>
      </div>

      <Card variant="rim" className="w-full max-w-md p-8 space-y-6 bg-[var(--surface-l1)]">
        <div className="text-center space-y-3">
          <div className="flex justify-center">
            <Logo size="lg" />
          </div>
          <h1 className="text-2xl font-bold font-display text-[var(--text-primary)]">
            Create Workspace Account
          </h1>
          <p className="text-xs font-mono text-[var(--text-muted)]">
            Start tracking budgets, transactions & tasks
          </p>
        </div>

        <form onSubmit={handleSignup} className="space-y-4">
          <Input
            label="Full Name"
            type="text"
            required
            leftIcon={<User className="w-4 h-4 text-[var(--text-muted)]" />}
            placeholder="John Doe"
          />

          <Input
            label="Email Address"
            type="email"
            required
            leftIcon={<Mail className="w-4 h-4 text-[var(--text-muted)]" />}
            placeholder="you@company.com"
          />

          <Input
            label="Password"
            type="password"
            required
            leftIcon={<Lock className="w-4 h-4 text-[var(--text-muted)]" />}
            placeholder="••••••••"
            minLength={6}
          />

          <Button type="submit" variant="primary" className="w-full">
            Create Workspace Account
          </Button>
        </form>

        <div className="pt-2 text-center text-xs text-[var(--text-muted)]">
          Already have an account?{' '}
          <button
            onClick={() => navigate('/login')}
            className="text-[var(--accent-primary)] font-bold hover:underline cursor-pointer"
          >
            Log In
          </button>
        </div>
      </Card>
    </div>
  );
};

export default Signup;
