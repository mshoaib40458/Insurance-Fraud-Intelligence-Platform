// Select Component - Dark UI

import { forwardRef, SelectHTMLAttributes } from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/utils/helpers';

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  helperText?: string;
  options: { value: string; label: string }[];
  placeholder?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, label, error, helperText, options, placeholder, id, ...props }, ref) => {
    const selectId = id || label?.toLowerCase().replace(/\s+/g, '-');
    
    return (
      <div className="w-full">
        {label && (
          <label htmlFor={selectId} className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
            {label}
          </label>
        )}
        <div className="relative">
          <select
            ref={ref}
            id={selectId}
            className={cn(
              'w-full px-3.5 py-2.5 rounded-xl border bg-slate-900/90 text-slate-100 text-sm appearance-none pr-10 cursor-pointer',
              'focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500/80 transition-all duration-200',
              'disabled:bg-slate-950 disabled:text-slate-600 disabled:cursor-not-allowed',
              error ? 'border-rose-500/60 focus:ring-rose-500/30' : 'border-slate-800 hover:border-slate-700',
              className
            )}
            aria-invalid={error ? 'true' : 'false'}
            aria-describedby={error ? `${selectId}-error` : helperText ? `${selectId}-helper` : undefined}
            {...props}
          >
            {placeholder && (
              <option value="" disabled className="bg-slate-900 text-slate-400">
                {placeholder}
              </option>
            )}
            {options.map((option) => (
              <option key={option.value} value={option.value} className="bg-slate-900 text-slate-200">
                {option.label}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" aria-hidden="true" />
        </div>
        {error && (
          <p id={`${selectId}-error`} className="mt-1.5 text-xs text-rose-400 font-medium" role="alert">
            {error}
          </p>
        )}
        {helperText && !error && (
          <p id={`${selectId}-helper`} className="mt-1.5 text-xs text-slate-500">
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

Select.displayName = 'Select';
