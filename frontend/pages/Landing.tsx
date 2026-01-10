import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Shield, Zap, PieChart } from 'lucide-react';

const Landing = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Navbar */}
      <nav className="relative z-10 flex items-center justify-between px-6 py-6 max-w-7xl mx-auto">
        <div className="text-2xl font-black text-slate-800 tracking-tighter">FinanceTask</div>
        <div className="flex gap-4">
          <button 
            onClick={() => navigate('/login')}
            className="px-6 py-2.5 text-slate-600 font-bold hover:text-slate-900 transition-colors"
          >
            Log In
          </button>
          <button 
            onClick={() => navigate('/signup')}
            className="px-6 py-2.5 bg-slate-900 text-white font-bold rounded-full hover:bg-slate-800 hover:shadow-lg transition-all active:scale-95"
          >
            Get Started
          </button>
        </div>
      </nav>

      {/* Hero Content */}
      <main className="relative z-10 pt-20 pb-32 px-6 max-w-7xl mx-auto text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/40 backdrop-blur-md border border-white/60 mb-8 animate-fade-in shadow-sm">
          <span className="w-2 h-2 rounded-full bg-brand-500 animate-pulse"></span>
          <span className="text-sm font-bold text-slate-700">V2.0 is live now</span>
        </div>
        
        <h1 className="text-5xl md:text-7xl font-extrabold text-slate-900 mb-6 tracking-tight leading-tight animate-slide-up">
          Master your money.<br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-500 to-brand-300">
            Conquer your tasks.
          </span>
        </h1>
        
        <p className="text-xl text-slate-600 mb-10 max-w-2xl mx-auto font-medium leading-relaxed animate-slide-up" style={{ animationDelay: '100ms' }}>
          The all-in-one platform designed to bring clarity to your finances and productivity to your day. Beautifully simple.
        </p>
        
        <div className="flex flex-col sm:flex-row justify-center gap-4 animate-slide-up" style={{ animationDelay: '200ms' }}>
          <button 
             onClick={() => navigate('/signup')}
             className="px-8 py-4 bg-brand-500 text-white text-lg font-bold rounded-full shadow-xl shadow-brand-500/30 hover:bg-brand-600 hover:scale-105 transition-all flex items-center justify-center gap-2"
          >
            Start Free Trial <ArrowRight className="w-5 h-5" />
          </button>
          <button className="px-8 py-4 bg-white/50 backdrop-blur-md text-slate-800 text-lg font-bold rounded-full border border-white hover:bg-white transition-all shadow-lg hover:shadow-xl">
            View Demo
          </button>
        </div>

        {/* Feature Cards Floating */}
        <div className="mt-24 grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
           {[
             { icon: PieChart, title: 'Smart Analytics', desc: 'Visualize your spending with beautiful, interactive charts.' },
             { icon: Zap, title: 'Instant Sync', desc: 'Real-time updates across all your devices instantly.' },
             { icon: Shield, title: 'Bank-Grade Security', desc: 'Your data is encrypted and protected 24/7.' }
           ].map((feature, i) => (
             <div key={i} className="glass-panel p-8 rounded-3xl animate-slide-up hover:translate-y-[-10px] transition-transform duration-500" style={{ animationDelay: `${300 + i * 100}ms` }}>
               <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-md mb-6 text-brand-500">
                 <feature.icon className="w-6 h-6" />
               </div>
               <h3 className="text-xl font-bold text-slate-800 mb-3">{feature.title}</h3>
               <p className="text-slate-600 font-medium leading-relaxed">{feature.desc}</p>
             </div>
           ))}
        </div>
      </main>

    </div>
  );
};

export default Landing;