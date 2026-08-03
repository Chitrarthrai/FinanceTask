import React from 'react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, leftIcon, rightIcon, className = '', ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1.5 w-full">
        {label && (
          <label className="text-xs font-semibold text-[var(--text-secondary)] tracking-wider uppercase">
            {label}
          </label>
        )}
        <div className="relative flex items-center w-full">
          {leftIcon && (
            <span className="absolute left-3 text-[var(--text-muted)] pointer-events-none flex items-center justify-center">
              {leftIcon}
            </span>
          )}
          <input
            ref={ref}
            className={`w-full glass-input rounded-xl px-3.5 py-2.5 text-sm placeholder-[var(--text-muted)] transition-all ${
              leftIcon ? 'pl-10' : ''
            } ${rightIcon ? 'pr-10' : ''} ${error ? 'border-[var(--danger)] focus:border-[var(--danger)]' : ''} ${className}`}
            {...props}
          />
          {rightIcon && (
            <span className="absolute right-3 text-[var(--text-muted)] flex items-center justify-center">
              {rightIcon}
            </span>
          )}
        </div>
        {error && <span className="text-xs text-[var(--danger)] mt-0.5">{error}</span>}
      </div>
    );
  }
);

Input.displayName = 'Input';
