import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, Loader2, ArrowRight } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Logo } from '../components/common/Logo';
import { useAuth } from '../contexts/AuthContext';

export const Login: React.FC = () => {
  const { session, setSessionState } = useAuth();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [message, setMessage] = useState<{
    type: 'error' | 'success';
    text: string;
  } | null>(null);
  const navigate = useNavigate();

  // If already logged in, redirect to dashboard
  React.useEffect(() => {
    if (session) {
      navigate('/app');
    }
  }, [session, navigate]);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      if (isSignUp) {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: email.split('@')[0],
            },
          },
        });
        if (error) throw error;

        if (data.session) {
          setSessionState(data.session);
          navigate('/app');
        } else {
          setMessage({
            type: 'success',
            text: 'Account created! Please check your email to confirm your account before signing in.',
          });
        }
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;

        if (data.session) {
          setSessionState(data.session);
          navigate('/app');
        }
      }
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    setMessage(null);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/#/auth/callback`,
        },
      });
      if (error) throw error;
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message });
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

        <Button
          type="button"
          variant="glass"
          size="md"
          className="w-full justify-center text-sm font-semibold tracking-wide"
          leftIcon={
            <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
            </svg>
          }
          onClick={handleGoogleLogin}
          disabled={loading}
        >
          Continue with Google
        </Button>

        <div className="relative flex items-center justify-center">
          <div className="border-t border-slate-700/60 w-full" />
          <span className="bg-[var(--surface-l1)] px-3 text-[10px] uppercase tracking-wider font-mono text-[var(--text-muted)] absolute">
            or email
          </span>
        </div>

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
