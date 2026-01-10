import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

const Signup = () => {
  const navigate = useNavigate();

  const handleSignup = (e: React.FormEvent) => {
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
          <h1 className="text-3xl font-extrabold text-slate-800 mb-2">Create Account</h1>
          <p className="text-slate-500 font-medium">Start your journey to financial freedom.</p>
        </div>

        <form onSubmit={handleSignup} className="space-y-5">
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700 ml-1">Full Name</label>
            <input 
              type="text" 
              className="w-full px-5 py-4 rounded-2xl glass-input text-slate-800 font-medium placeholder:text-slate-400 transition-all"
              placeholder="John Doe"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700 ml-1">Email Address</label>
            <input 
              type="email" 
              className="w-full px-5 py-4 rounded-2xl glass-input text-slate-800 font-medium placeholder:text-slate-400 transition-all"
              placeholder="name@company.com"
            />
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700 ml-1">Password</label>
            <input 
              type="password" 
              className="w-full px-5 py-4 rounded-2xl glass-input text-slate-800 font-medium placeholder:text-slate-400 transition-all"
              placeholder="••••••••"
            />
          </div>

          <button 
            type="submit"
            className="w-full py-4 bg-slate-800 text-white font-bold rounded-2xl hover:bg-slate-900 shadow-xl shadow-slate-800/20 active:scale-95 transition-all text-lg mt-2"
          >
            Create Account
          </button>
        </form>

        <div className="mt-8 text-center">
          <p className="text-slate-500 font-medium">
            Already have an account? <span onClick={() => navigate('/login')} className="text-brand-600 font-bold cursor-pointer hover:underline">Log in</span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Signup;