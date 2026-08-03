import React from 'react';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'cyan' | 'violet' | 'success' | 'warning' | 'danger' | 'neutral';
  pulse?: boolean;
  size?: 'sm' | 'md';
  children: React.ReactNode;
}

export const Badge: React.FC<BadgeProps> = ({
  variant = 'cyan',
  pulse = false,
  size = 'md',
  children,
  className = '',
  ...props
}) => {
  const baseStyles = 'inline-flex items-center gap-1.5 font-medium rounded-full border transition-all select-none';

  const variantStyles = {
    cyan: 'bg-[var(--accent-primary-light)] text-[var(--accent-primary)] border-[var(--accent-primary)]/30',
    violet: 'bg-[var(--accent-secondary)]/15 text-[var(--accent-secondary)] border-[var(--accent-secondary)]/30',
    success: 'bg-[var(--success)]/15 text-[var(--success)] border-[var(--success)]/30',
    warning: 'bg-[var(--warning)]/15 text-[var(--warning)] border-[var(--warning)]/30',
    danger: 'bg-[var(--danger)]/15 text-[var(--danger)] border-[var(--danger)]/30',
    neutral: 'bg-[var(--surface-l2)] text-[var(--text-secondary)] border-[var(--border-rim)]',
  };

  const dotStyles = {
    cyan: 'bg-[var(--accent-primary)]',
    violet: 'bg-[var(--accent-secondary)]',
    success: 'bg-[var(--success)]',
    warning: 'bg-[var(--warning)]',
    danger: 'bg-[var(--danger)]',
    neutral: 'bg-[var(--text-muted)]',
  };

  const sizeStyles = {
    sm: 'px-2 py-0.5 text-[10px]',
    md: 'px-3 py-1 text-xs',
  };

  return (
    <span
      className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
      {...props}
    >
      <span
        className={`w-1.5 h-1.5 rounded-full shrink-0 ${dotStyles[variant]} ${pulse ? 'led-pulse' : ''}`}
      />
      {children}
    </span>
  );
};
