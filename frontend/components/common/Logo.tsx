import React from 'react';
import { motion } from 'framer-motion';

export const Logo: React.FC<{ size?: 'sm' | 'md' | 'lg' }> = ({ size = 'md' }) => {
  const iconSizes = {
    sm: 'w-6 h-6 text-xs',
    md: 'w-8 h-8 text-sm',
    lg: 'w-10 h-10 text-base',
  };

  const textSizes = {
    sm: 'text-base',
    md: 'text-xl',
    lg: 'text-2xl',
  };

  return (
    <div className="flex items-center gap-2.5 select-none cursor-pointer group">
      <motion.div
        whileHover={{ rotate: 180, scale: 1.05 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className={`${iconSizes[size]} rounded-xl bg-gradient-to-tr from-[var(--accent-secondary)] to-[var(--accent-primary)] flex items-center justify-center font-bold text-[var(--text-inverted)] shadow-[0_0_15px_var(--accent-primary-light)] border border-white/20 shrink-0`}
      >
        <span className="font-mono font-black tracking-tighter">FT</span>
      </motion.div>
      <div className="flex flex-col">
        <span className={`font-bold font-display tracking-tight text-[var(--text-primary)] leading-none ${textSizes[size]}`}>
          Finance<span className="text-[var(--accent-primary)] font-black">Task</span>
        </span>
        <span className="text-[9px] font-mono tracking-widest text-[var(--text-muted)] uppercase mt-0.5">
          Titanium OS
        </span>
      </div>
    </div>
  );
};
