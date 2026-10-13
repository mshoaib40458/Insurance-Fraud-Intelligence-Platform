// Badge Component - Glowing Badges

import { HTMLAttributes, forwardRef } from 'react';
import { cn, getRiskBadgeClass } from '@/utils/helpers';

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'risk' | 'success' | 'warning' | 'danger' | 'info' | 'outline' | 'purple';
  size?: 'sm' | 'md';
  dot?: boolean;
}

export const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant = 'default', size = 'md', dot, children, ...props }, ref) => {
    const variants = {
      default: 'bg-slate-800/80 text-slate-300 border border-slate-700/80',
      risk: '',
      success: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 shadow-[0_0_10px_rgba(16,185,129,0.15)]',
      warning: 'bg-amber-500/10 text-amber-400 border border-amber-500/30 shadow-[0_0_10px_rgba(245,158,11,0.15)]',
      danger: 'bg-rose-500/10 text-rose-400 border border-rose-500/30 shadow-[0_0_10px_rgba(244,63,94,0.15)]',
      info: 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/30 shadow-[0_0_10px_rgba(99,102,241,0.15)]',
      purple: 'bg-purple-500/10 text-purple-400 border border-purple-500/30 shadow-[0_0_10px_rgba(168,85,247,0.15)]',
      outline: 'bg-transparent text-slate-400 border border-slate-700/60',
    };
    
    const sizes = {
      sm: 'px-2 py-0.5 text-[10px] gap-1 font-semibold tracking-wide uppercase',
      md: 'px-2.5 py-1 text-xs gap-1.5 font-semibold',
    };
    
    const isRiskLevel = ['Low', 'Medium', 'High'].includes(String(children));
    
    const dotColor = isRiskLevel
      ? String(children) === 'Low' ? 'bg-emerald-400 shadow-[0_0_6px_#10b981]' : String(children) === 'Medium' ? 'bg-amber-400 shadow-[0_0_6px_#f59e0b]' : 'bg-rose-400 shadow-[0_0_6px_#f43f5e]'
      : 'bg-indigo-400 shadow-[0_0_6px_#6366f1]';
    
    return (
      <span
        ref={ref}
        className={cn(
          'inline-flex items-center rounded-full font-sans transition-all duration-200',
          sizes[size],
          isRiskLevel ? getRiskBadgeClass(children as 'Low' | 'Medium' | 'High') : variants[variant],
          className
        )}
        {...props}
      >
        {dot && <span className={cn('w-1.5 h-1.5 rounded-full flex-shrink-0 animate-pulse', dotColor)} aria-hidden="true" />}
        {children}
      </span>
    );
  }
);

Badge.displayName = 'Badge';
