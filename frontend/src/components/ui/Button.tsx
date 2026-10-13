// Button Component - Dark Glassmorphic Styling

import { forwardRef, ButtonHTMLAttributes } from 'react';
import { cn } from '@/utils/helpers';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'success' | 'glow';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', loading, disabled, children, ...props }, ref) => {
    const baseStyles = 'inline-flex items-center justify-center font-medium rounded-xl transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none active:scale-[0.97] whitespace-nowrap cursor-pointer';
    
    const variants = {
      primary: 'bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 text-white hover:opacity-95 shadow-lg shadow-indigo-600/30 border border-indigo-400/30 focus-visible:ring-indigo-500',
      secondary: 'bg-slate-800/80 text-slate-200 border border-slate-700/80 hover:bg-slate-700/80 hover:text-white focus-visible:ring-slate-400',
      outline: 'border border-slate-800 bg-slate-900/40 text-slate-300 hover:bg-slate-800/80 hover:text-white hover:border-slate-700 focus-visible:ring-indigo-500',
      ghost: 'bg-transparent text-slate-400 hover:bg-slate-800/60 hover:text-slate-200 focus-visible:ring-slate-400',
      danger: 'bg-gradient-to-r from-rose-600 to-pink-600 text-white hover:opacity-95 shadow-lg shadow-rose-600/30 border border-rose-400/30 focus-visible:ring-rose-500',
      success: 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white hover:opacity-95 shadow-lg shadow-emerald-600/30 border border-emerald-400/30 focus-visible:ring-emerald-500',
      glow: 'bg-slate-900 text-indigo-300 border border-indigo-500/40 hover:border-indigo-400 shadow-glow-primary hover:bg-indigo-950/40 focus-visible:ring-indigo-500',
    };
    
    const sizes = {
      sm: 'px-3 py-1.5 text-xs gap-1.5 rounded-lg',
      md: 'px-4 py-2 text-sm gap-2 rounded-xl',
      lg: 'px-6 py-2.5 text-sm font-semibold gap-2 rounded-xl',
    };
    
    return (
      <button
        ref={ref}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        disabled={disabled || loading}
        {...props}
      >
        {loading && (
          <svg className="animate-spin h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
        )}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';
