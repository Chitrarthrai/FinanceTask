import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { Loader2 } from 'lucide-react';

export const AuthCallback: React.FC = () => {
  const navigate = useNavigate();
  const { setSessionState } = useAuth();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    const handleCallback = async () => {
      try {
        const fullUrl = window.location.href;

        // Check if access_token exists in URL (e.g. #/auth/callback#access_token=... or #access_token=...)
        if (fullUrl.includes('access_token=')) {
          const hashString = fullUrl.substring(fullUrl.indexOf('access_token='));
          const params = new URLSearchParams(hashString);
          const accessToken = params.get('access_token');
          const refreshToken = params.get('refresh_token');

          if (accessToken) {
            const { data, error } = await supabase.auth.setSession({
              access_token: accessToken,
              refresh_token: refreshToken || '',
            });

            if (error) throw error;

            if (data.session && mounted) {
              setSessionState(data.session);
              navigate('/app', { replace: true });
              return;
            }
          }
        }

        // Fallback session check
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) throw error;

        if (session && mounted) {
          setSessionState(session);
          navigate('/app', { replace: true });
        } else if (mounted) {
          setTimeout(() => {
            if (mounted) navigate('/login', { replace: true });
          }, 3000);
        }
      } catch (err: any) {
        if (mounted) {
          setErrorMsg(err.message || 'Authentication failed');
          setTimeout(() => {
            if (mounted) navigate('/login', { replace: true });
          }, 3000);
        }
      }
    };

    handleCallback();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session && mounted) {
        setSessionState(session);
        navigate('/app', { replace: true });
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [navigate, setSessionState]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[var(--bg-app)] text-[var(--text-primary)] p-4 text-center">
      {errorMsg ? (
        <div className="space-y-3">
          <p className="text-[var(--danger)] font-semibold text-sm">{errorMsg}</p>
          <p className="font-mono text-xs text-[var(--text-muted)]">Redirecting to login...</p>
        </div>
      ) : (
        <div className="flex flex-col items-center">
          <Loader2 className="w-10 h-10 animate-spin text-[var(--accent-primary)] mb-4" />
          <p className="font-mono text-sm text-[var(--text-muted)]">Completing authentication...</p>
        </div>
      )}
    </div>
  );
};

export default AuthCallback;
