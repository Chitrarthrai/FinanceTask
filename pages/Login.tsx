import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

const Login = () => {
  const navigate = useNavigate();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    navigate('/app');
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="absolute top-6 left-6">
        <button onClick={() => navigate('/')} className="flex items-center gap-2 text-slate-600 hover:text-slate-900 font-bold px-4 py-2 bg-white/40 rounded-full backdrop-blur-md transition-all">
          <ArrowLeft className="w-4 h-4" /> Back
        </button>
      </div>

      <div className="glass-panel w-full max-w-md p-10 rounded-[2.5rem] shadow-2xl shadow-slate-900/10 animate-slide-up">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-extrabold text-slate-800 mb-2">Welcome Back</h1>
          <p className="text-slate-500 font-medium">Enter your credentials to access your account.</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700 ml-1">Email Address</label>
            <input 
              type="email" 
              defaultValue="alex@example.com"
              className="w-full px-5 py-4 rounded-2xl glass-input text-slate-800 font-medium placeholder:text-slate-400 transition-all"
              placeholder="name@company.com"
            />
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between items-center ml-1">
              <label className="text-sm font-bold text-slate-700">Password</label>
              <a href="#" className="text-xs font-bold text-brand-600 hover:text-brand-700">Forgot?</a>
            </div>
            <input 
              type="password" 
              defaultValue="password123"
              className="w-full px-5 py-4 rounded-2xl glass-input text-slate-800 font-medium placeholder:text-slate-400 transition-all"
              placeholder="••••••••"
            />
          </div>

          <button 
            type="submit"
            className="w-full py-4 bg-brand-500 text-white font-bold rounded-2xl hover:bg-brand-600 shadow-xl shadow-brand-500/20 active:scale-95 transition-all text-lg"
          >
            Sign In
          </button>
        </form>

        <div className="mt-8 text-center">
          <p className="text-slate-500 font-medium">
            Don't have an account? <span onClick={() => navigate('/signup')} className="text-brand-600 font-bold cursor-pointer hover:underline">Sign up</span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;