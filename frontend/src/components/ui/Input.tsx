// Input Component - Dark UI

import { forwardRef, InputHTMLAttributes, TextareaHTMLAttributes } from 'react';
import { cn } from '@/utils/helpers';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, helperText, id, leftIcon, rightIcon, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');
    
    return (
      <div className="w-full">
        {label && (
          <label htmlFor={inputId} className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
            {label}
          </label>
        )}
        <div className="relative">
          {leftIcon && (
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
              {leftIcon}
            </span>
          )}
          <input
            ref={ref}
            id={inputId}
            className={cn(
              'w-full px-3.5 py-2.5 rounded-xl border bg-slate-900/90 text-slate-100 placeholder-slate-500 text-sm font-sans',
              'focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500/80 transition-all duration-200',
              'disabled:bg-slate-950 disabled:text-slate-600 disabled:cursor-not-allowed',
              leftIcon != null ? 'pl-10' : '',
              rightIcon != null ? 'pr-10' : '',
              error ? 'border-rose-500/60 focus:ring-rose-500/30' : 'border-slate-800 hover:border-slate-700',
              className
            )}
            aria-invalid={error ? 'true' : 'false'}
            aria-describedby={error ? `${inputId}-error` : helperText ? `${inputId}-helper` : undefined}
            {...props}
          />
          {rightIcon && (
            <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
              {rightIcon}
            </span>
          )}
        </div>
        {error && (
          <p id={`${inputId}-error`} className="mt-1.5 text-xs text-rose-400 font-medium" role="alert">
            {error}
          </p>
        )}
        {helperText && !error && (
          <p id={`${inputId}-helper`} className="mt-1.5 text-xs text-slate-500">
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, error, helperText, id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');
    
    return (
      <div className="w-full">
        {label && (
          <label htmlFor={inputId} className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          id={inputId}
          className={cn(
            'w-full px-3.5 py-2.5 rounded-xl border bg-slate-900/90 text-slate-100 placeholder-slate-500 text-sm resize-y min-h-[90px]',
            'focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500/80 transition-all duration-200',
            'disabled:bg-slate-950 disabled:text-slate-600 disabled:cursor-not-allowed',
            error ? 'border-rose-500/60 focus:ring-rose-500/30' : 'border-slate-800 hover:border-slate-700',
            className
          )}
          aria-invalid={error ? 'true' : 'false'}
          aria-describedby={error ? `${inputId}-error` : helperText ? `${inputId}-helper` : undefined}
          {...props}
        />
        {error && (
          <p id={`${inputId}-error`} className="mt-1.5 text-xs text-rose-400 font-medium" role="alert">
            {error}
          </p>
        )}
        {helperText && !error && (
          <p id={`${inputId}-helper`} className="mt-1.5 text-xs text-slate-500">
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';
