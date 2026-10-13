// Card Component - Glassmorphic Dark UI

import { HTMLAttributes, forwardRef } from 'react';
import { cn } from '@/utils/helpers';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'hover' | 'elevated' | 'flat' | 'glass' | 'glow';
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant = 'default', padding = 'md', children, ...props }, ref) => {
    const paddings = {
      none: 'p-0',
      sm: 'p-4',
      md: 'p-5',
      lg: 'p-6',
    };
    
    const variants = {
      default: 'bg-slate-900/80 backdrop-blur-xl border border-slate-800/80 rounded-2xl shadow-xl',
      hover: 'bg-slate-900/80 backdrop-blur-xl border border-slate-800/80 rounded-2xl shadow-xl hover:border-slate-700 hover:bg-slate-900/95 hover:shadow-2xl hover:-translate-y-0.5 transition-all duration-300',
      elevated: 'bg-slate-900/90 backdrop-blur-2xl border border-slate-700/60 rounded-2xl shadow-2xl shadow-slate-950/50',
      flat: 'bg-slate-900/40 border border-slate-800/40 rounded-2xl shadow-none',
      glass: 'bg-slate-900/50 backdrop-blur-md border border-white/10 rounded-2xl shadow-glass',
      glow: 'bg-slate-900/90 border border-indigo-500/30 rounded-2xl shadow-glow-primary hover:border-indigo-500/60 transition-all duration-300',
    };
    
    return (
      <div
        ref={ref}
        className={cn(variants[variant], paddings[padding], className)}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = 'Card';

export const CardHeader = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, children, ...props }, ref) => (
    <div ref={ref} className={cn('mb-4', className)} {...props}>
      {children}
    </div>
  )
);

CardHeader.displayName = 'CardHeader';

export const CardTitle = forwardRef<HTMLHeadingElement, HTMLAttributes<HTMLHeadingElement>>(
  ({ className, children, ...props }, ref) => (
    <h3 ref={ref} className={cn('text-base font-semibold text-slate-100 font-display tracking-tight', className)} {...props}>
      {children}
    </h3>
  )
);

CardTitle.displayName = 'CardTitle';

export const CardDescription = forwardRef<HTMLParagraphElement, HTMLAttributes<HTMLParagraphElement>>(
  ({ className, children, ...props }, ref) => (
    <p ref={ref} className={cn('text-xs text-slate-400 mt-1 leading-relaxed', className)} {...props}>
      {children}
    </p>
  )
);

CardDescription.displayName = 'CardDescription';

export const CardContent = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, children, ...props }, ref) => (
    <div ref={ref} className={cn('', className)} {...props}>
      {children}
    </div>
  )
);

CardContent.displayName = 'CardContent';

export const CardFooter = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, children, ...props }, ref) => (
    <div ref={ref} className={cn('mt-5 pt-4 border-t border-slate-800/80', className)} {...props}>
      {children}
    </div>
  )
);

CardFooter.displayName = 'CardFooter';
