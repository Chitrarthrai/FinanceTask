import React, { useEffect, useState } from 'react';
import { KPIData } from '../types';
import { Wallet, TrendingUp, PiggyBank, AlertCircle, CreditCard, DollarSign } from 'lucide-react';

interface KPICardProps {
  data: KPIData;
  delay?: number;
}

const iconMap = {
  wallet: Wallet,
  'trending-up': TrendingUp,
  'piggy-bank': PiggyBank,
  'alert-circle': AlertCircle,
  'credit-card': CreditCard,
  'dollar-sign': DollarSign,
};

const KPICard: React.FC<KPICardProps> = ({ data, delay = 0 }) => {
  const Icon = iconMap[data.icon];
  const [count, setCount] = useState(0);

  useEffect(() => {
    let start = 0;
    const end = data.value;
    const duration = 1500;
    const increment = end / (duration / 16); 

    const timer = setTimeout(() => {
      const counter = setInterval(() => {
        start += increment;
        if (start >= end) {
          setCount(end);
          clearInterval(counter);
        } else {
          setCount(Math.floor(start));
        }
      }, 16);
      return () => clearInterval(counter);
    }, delay * 100);

    return () => clearTimeout(timer);
  }, [data.value, delay]);

  const formattedValue = data.currency 
    ? new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(count)
    : count.toLocaleString();

  return (
    <div 
      className="glass-panel glass-card-hover rounded-3xl p-6 relative overflow-hidden group transition-all duration-500 opacity-0 animate-slide-up flex flex-col justify-between h-full"
      style={{ animationDelay: `${delay * 100}ms` }}
    >
      <div className="flex justify-between items-start mb-4 relative z-10">
        <div className={`p-3.5 rounded-2xl ${data.color} bg-opacity-10 backdrop-blur-sm`}>
          <Icon className="w-6 h-6" />
        </div>
        {data.trend !== undefined && (
          <div className={`flex items-center gap-1 text-xs font-bold px-2.5 py-1.5 rounded-full backdrop-blur-sm border border-white/20 ${
            data.trend >= 0 ? 'bg-emerald-400/10 text-emerald-600' : 'bg-rose-400/10 text-rose-600'
          }`}>
            <TrendingUp className={`w-3 h-3 ${data.trend < 0 ? 'rotate-180' : ''}`} />
            <span>{Math.abs(data.trend)}%</span>
          </div>
        )}
      </div>
      
      <div className="relative z-10">
        <p className="text-slate-500 text-sm font-semibold mb-1">{data.label}</p>
        <h3 className="text-3xl font-extrabold text-slate-800 tracking-tight">{formattedValue}</h3>
      </div>

      {/* Decorative gradient blob */}
      <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-gradient-to-br from-white/40 to-transparent rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-2xl pointer-events-none" />
      <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-b from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
    </div>
  );
};

export default KPICard;