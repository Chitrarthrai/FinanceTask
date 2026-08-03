import React from 'react';

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: Array<{ value: string; label: string }>;
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, options, className = '', ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1.5 w-full">
        {label && (
          <label className="text-xs font-semibold text-[var(--text-secondary)] tracking-wider uppercase">
            {label}
          </label>
        )}
        <select
          ref={ref}
          className={`w-full glass-input rounded-xl px-3.5 py-2.5 text-sm transition-all cursor-pointer ${
            error ? 'border-[var(--danger)]' : ''
          } ${className}`}
          {...props}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        {error && <span className="text-xs text-[var(--danger)] mt-0.5">{error}</span>}
      </div>
    );
  }
);

Select.displayName = 'Select';
