// Main Layout Component - Sentinel AI Enterprise Theme

import { ReactNode, Fragment } from 'react';
import { Link, Outlet } from 'react-router-dom';
import { useState } from 'react';
import { Sidebar, Header } from './Sidebar';
import { cn } from '@/utils/helpers';
import { ChevronRight, Shield } from 'lucide-react';

export function MainLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans antialiased relative selection:bg-indigo-500 selection:text-white">
      {/* Background ambient lighting */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0" aria-hidden="true">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl" />
        <div className="absolute top-1/3 -right-40 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 left-1/3 w-96 h-96 bg-rose-600/10 rounded-full blur-3xl" />
        <div className="absolute inset-0 bg-grid-pattern opacity-30" />
      </div>

      <div className="relative z-10 flex min-h-screen">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        
        <div className={cn('flex-1 flex flex-col min-w-0 transition-all duration-300')}>
          <Header 
            onMenuClick={() => setSidebarOpen(true)}
            breadcrumbs={[]}
          />
          
          <main className="flex-1 p-4 sm:p-6 lg:p-8 relative" role="main">
            <Outlet />
          </main>
          
          <footer className="border-t border-slate-900 bg-slate-950/80 backdrop-blur">
            <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-5 flex items-center justify-between text-xs text-slate-500">
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-indigo-400" />
                <span className="font-medium text-slate-400 font-display">Sentinel AI Risk Engine v1.0.0</span>
                <span className="hidden sm:inline text-slate-700">•</span>
                <span className="hidden sm:inline text-slate-500">Isotonic Calibrated ML Model</span>
              </div>
              <span className="text-slate-500">© {new Date().getFullYear()} Sentinel Risk Intelligence Inc.</span>
            </div>
          </footer>
        </div>
      </div>
    </div>
  );
}

export function PageLayout({ 
  title, 
  description, 
  breadcrumbs = [],
  actions,
  children,
}: {
  title: string;
  description?: string;
  breadcrumbs?: { label: string; href?: string }[];
  actions?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="max-w-[1600px] mx-auto animate-fade-up">
      <div className="mb-8">
        {breadcrumbs.length > 0 && (
          <nav className="flex items-center gap-2 text-xs mb-3" aria-label="Breadcrumb">
            <Link to="/" className="text-slate-400 hover:text-indigo-400 transition-colors font-medium">Home</Link>
            {breadcrumbs.map((crumb) => (
              <Fragment key={crumb.label}>
                <ChevronRight className="h-3.5 w-3.5 text-slate-600" aria-hidden="true" />
                {crumb.href ? (
                  <Link to={crumb.href} className="text-slate-400 hover:text-indigo-400 transition-colors font-medium">
                    {crumb.label}
                  </Link>
                ) : (
                  <span className="text-slate-200 font-bold" aria-current="page">
                    {crumb.label}
                  </span>
                )}
              </Fragment>
            ))}
          </nav>
        )}
        
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-100 font-display tracking-tight">{title}</h1>
            {description && (
              <p className="mt-1.5 text-sm text-slate-400">{description}</p>
            )}
          </div>
          {actions && <div className="flex items-center gap-2.5 flex-wrap shrink-0">{actions}</div>}
        </div>
      </div>
      
      {children}
    </div>
  );
}
