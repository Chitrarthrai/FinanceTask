import React from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';

export interface CardProps extends HTMLMotionProps<'div'> {
  variant?: 'glass' | 'rim' | 'elevated' | 'ghost';
  hoverable?: boolean;
  glowColor?: 'cyan' | 'violet' | 'success' | 'none';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  children?: React.ReactNode;
}

export const Card: React.FC<CardProps> = ({
  variant = 'glass',
  hoverable = false,
  glowColor = 'none',
  padding = 'md',
  children,
  className = '',
  ...props
}) => {
  const baseStyles = 'rounded-2xl transition-all duration-300 relative overflow-hidden';

  const variantStyles = {
    glass: 'glass-panel',
    rim: 'glass-panel-rim',
    elevated: 'bg-[var(--surface-elevated)] border border-[var(--border-rim)] shadow-lg',
    ghost: 'bg-transparent border border-dashed border-[var(--border-rim)]',
  };

  const paddingStyles = {
    none: 'p-0',
    sm: 'p-3',
    md: 'p-5',
    lg: 'p-7',
  };

  const glowStyles = {
    none: '',
    cyan: 'hover:shadow-[0_0_25px_rgba(0,242,255,0.25)] hover:border-[var(--accent-primary)]',
    violet: 'hover:shadow-[0_0_25px_rgba(124,58,237,0.25)] hover:border-[var(--accent-secondary)]',
    success: 'hover:shadow-[0_0_25px_rgba(0,255,157,0.25)] hover:border-[var(--success)]',
  };

  const hoverStyles = hoverable ? `glass-panel-hover ${glowStyles[glowColor]}` : '';

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
      className={`${baseStyles} ${variantStyles[variant]} ${paddingStyles[padding]} ${hoverStyles} ${className}`}
      {...props}
    >
      {children}
    </motion.div>
  );
};
