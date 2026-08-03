import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, Loader2, ArrowRight } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Logo } from '../components/common/Logo';

export const Login: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [message, setMessage] = useState<{
    type: 'error' | 'success';
    text: string;
  } | null>(null);
  const navigate = useNavigate();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: email.split('@')[0],
            },
          },
        });
        if (error) throw error;
        setMessage({
          type: 'success',
          text: 'Check your email for confirmation link!',
        });
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        navigate('/app');
      }
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--bg-app)] p-4 text-[var(--text-primary)] relative">
      <div className="absolute w-96 h-96 bg-[var(--accent-primary)]/15 rounded-full blur-[120px] pointer-events-none" />

      <Card variant="rim" className="w-full max-w-md p-8 space-y-6 bg-[var(--surface-l1)]">
        <div className="text-center space-y-3">
          <div className="flex justify-center">
            <Logo size="lg" />
          </div>
          <h1 className="text-2xl font-bold font-display text-[var(--text-primary)]">
            {isSignUp ? 'Create Workspace Account' : 'Welcome Back'}
          </h1>
          <p className="text-xs font-mono text-[var(--text-muted)]">
            {isSignUp
              ? 'Register to unlock financial automation'
              : 'Sign in to access your audit dashboard'}
          </p>
        </div>

        {message && (
          <div
            className={`p-3 rounded-xl text-xs font-mono ${
              message.type === 'error'
                ? 'bg-[var(--danger)]/15 border border-[var(--danger)]/30 text-[var(--danger)]'
                : 'bg-[var(--success)]/15 border border-[var(--success)]/30 text-[var(--success)]'
            }`}
          >
            {message.text}
          </div>
        )}

        <form onSubmit={handleAuth} className="space-y-4">
          <Input
            label="Email Address"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            leftIcon={<Mail className="w-4 h-4 text-[var(--text-muted)]" />}
            placeholder="you@domain.com"
          />

          <Input
            label="Password"
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            leftIcon={<Lock className="w-4 h-4 text-[var(--text-muted)]" />}
            placeholder="••••••••"
            minLength={6}
          />

          <Button
            type="submit"
            variant="primary"
            className="w-full"
            disabled={loading}
            rightIcon={!loading && <ArrowRight className="w-4 h-4" />}
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : isSignUp ? 'Sign Up' : 'Sign In'}
          </Button>
        </form>

        <div className="pt-2 text-center">
          <Button
            variant="ghost"
            size="sm"
            className="w-full text-xs"
            onClick={() => {
              setIsSignUp(!isSignUp);
              setMessage(null);
            }}
          >
            {isSignUp ? 'Already have an account? Sign In' : "Don't have an account? Sign Up"}
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default Login;
