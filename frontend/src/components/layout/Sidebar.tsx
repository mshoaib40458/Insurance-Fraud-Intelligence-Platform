// Sidebar Component - Clean Enterprise Navigation

import { useState, useRef, useEffect } from 'react';
import { Link, useLocation, NavLink, useNavigate } from 'react-router-dom';
import { cn } from '@/utils/helpers';
import {
  LayoutDashboard,
  FileText,
  Search,
  BarChart3,
  ShieldAlert,
  ChevronRight,
  ChevronDown,
  Menu,
  X,
  Bell,
  User,
  Command,
  Sparkles,
  LogOut,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

const navigation = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Claims Registry', href: '/claims', icon: FileText },
  { name: 'Search Console', href: '/search', icon: Search },
  { name: 'Analytics & Telemetry', href: '/analytics', icon: BarChart3 },
  { name: 'Investigations Queue', href: '/investigations', icon: ShieldAlert },
];

export function Sidebar({ 
  isOpen, 
  onClose 
}: { 
  isOpen: boolean; 
  onClose: () => void; 
}) {
  const location = useLocation();
  
  return (
    <>
      {/* Mobile Backdrop */}
      <div
        className={cn(
          'fixed inset-0 z-40 bg-slate-950/80 backdrop-blur-md transition-opacity lg:hidden',
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        )}
        onClick={onClose}
        aria-hidden="true"
      />
      
      {/* Sidebar Panel */}
      <aside
        className={cn(
          'fixed lg:static inset-y-0 left-0 z-50 w-72 bg-slate-950 border-r border-slate-800/80 transform transition-transform duration-300 ease-in-out flex flex-col',
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
        aria-label="Main navigation"
      >
        {/* Brand Header */}
        <div className="flex items-center justify-between h-20 px-6 border-b border-slate-800/80 bg-slate-950">
          <Link to="/" className="flex items-center gap-3.5 group" aria-label="Go to dashboard">
            <div className="relative">
              <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 via-purple-600 to-pink-500 rounded-xl flex items-center justify-center shadow-glow-primary group-hover:scale-105 transition-transform duration-300">
                <ShieldAlert className="w-5 h-5 text-white" />
              </div>
              <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-emerald-500 rounded-full border-2 border-slate-950 shadow-[0_0_8px_#10b981]" />
            </div>
            <div className="leading-tight">
              <div className="flex items-center gap-1.5">
                <span className="block font-bold text-slate-100 text-base font-display tracking-tight">SENTINEL</span>
                <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">AI</span>
              </div>
              <span className="block text-[11px] font-medium text-slate-400">Fraud Risk Engine</span>
            </div>
          </Link>
          <button
            onClick={onClose}
            className="lg:hidden p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-900 transition-colors"
            aria-label="Close sidebar"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        
        {/* Navigation items */}
        <nav className="flex-1 py-6 px-4 space-y-1.5 overflow-y-auto dark-scrollbar" aria-label="Main Navigation">
          <div className="px-3 pb-2 flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest font-display">System Navigation</span>
            <Sparkles className="w-3 h-3 text-indigo-400/60" />
          </div>
          <ul className="space-y-1" role="list">
            {navigation.map((item) => {
              const isActive = location.pathname === item.href || 
                (item.href !== '/' && location.pathname.startsWith(item.href));
              const Icon = item.icon;
              
              return (
                <li key={item.name}>
                  <NavLink
                    to={item.href}
                    onClick={onClose}
                    className={cn(
                      'flex items-center gap-3.5 px-3.5 py-3 rounded-xl text-sm font-semibold transition-all duration-200 group relative',
                      isActive
                        ? 'bg-gradient-to-r from-indigo-600 to-indigo-700 text-white shadow-lg shadow-indigo-600/30 border border-indigo-400/30'
                        : 'text-slate-400 hover:text-slate-100 hover:bg-slate-900/80 border border-transparent'
                    )}
                    aria-current={isActive ? 'page' : undefined}
                  >
                    <Icon className={cn(
                      'h-5 w-5 flex-shrink-0 transition-colors',
                      isActive ? 'text-white' : 'text-slate-400 group-hover:text-indigo-400'
                    )} aria-hidden="true" />
                    <span className="flex-1 font-sans">{item.name}</span>
                    {isActive && (
                      <span className="w-2 h-2 bg-white rounded-full shadow-[0_0_8px_#ffffff]" aria-hidden="true" />
                    )}
                  </NavLink>
                </li>
              );
            })}
          </ul>
        </nav>
        
        {/* User Card / Footer */}
        <div className="p-4 border-t border-slate-800/80 bg-slate-950">
          <UserCard />
        </div>
      </aside>
    </>
  );
}

function UserCard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-900/80 border border-slate-800 transition-all group">
      <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-xs shadow-md flex-shrink-0">
        <User className="h-4 w-4 text-white" />
      </div>
      <div className="flex-1 min-w-0 leading-tight">
        <span className="block text-xs font-bold text-slate-100 truncate">{user?.full_name ?? 'Guest'}</span>
        <span className="block text-[10px] text-slate-400 truncate">{user?.role ?? ''}</span>
      </div>
      <button
        onClick={handleLogout}
        title="Logout"
        className="p-1.5 text-slate-500 hover:text-rose-400 rounded-lg hover:bg-rose-500/10 transition-colors cursor-pointer"
        aria-label="Logout"
      >
        <LogOut className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}

interface HeaderProps {
  onMenuClick: () => void;
  title?: string;
  breadcrumbs?: { label: string; href?: string }[];
}

export function Header({ onMenuClick, title, breadcrumbs }: HeaderProps) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [profileOpen, setProfileOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setProfileOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-30 bg-slate-950/80 backdrop-blur-xl border-b border-slate-800/80">
      <div className="flex items-center justify-between h-20 px-4 sm:px-6 lg:px-8">
        {/* Mobile menu toggle */}
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 text-slate-400 hover:text-slate-100 rounded-xl hover:bg-slate-900 transition-colors"
          aria-label="Open menu"
        >
          <Menu className="h-6 w-6" />
        </button>
        
        {/* Breadcrumb Header */}
        <div className="hidden sm:flex flex-1 items-center gap-2 min-w-0">
          {breadcrumbs && breadcrumbs.length > 0 ? (
            <nav className="flex items-center gap-2 text-sm" aria-label="Breadcrumb">
              {breadcrumbs.map((crumb, index) => (
                <div key={crumb.label} className="flex items-center gap-2">
                  {index > 0 && <ChevronRight className="h-4 w-4 text-slate-600" aria-hidden="true" />}
                  {crumb.href ? (
                    <Link
                      to={crumb.href}
                      className={cn(
                        'hover:text-indigo-400 transition-colors font-medium',
                        index === breadcrumbs.length - 1 ? 'text-slate-100 font-bold' : 'text-slate-400'
                      )}
                    >
                      {crumb.label}
                    </Link>
                  ) : (
                    <span className="text-slate-100 font-bold font-display" aria-current="page">
                      {crumb.label}
                    </span>
                  )}
                </div>
              ))}
            </nav>
          ) : title ? (
            <h1 className="text-lg font-bold text-slate-100 font-display tracking-tight truncate">{title}</h1>
          ) : null}
        </div>
        
        {/* Search bar */}
        <div className="hidden md:flex flex-1 justify-center max-w-md">
          <Link to="/search" className="w-full">
            <div className="relative w-full rounded-xl bg-slate-900/90 border border-slate-800 hover:border-slate-700 transition-all duration-200 group">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-hover:text-indigo-400 transition-colors" />
              <input
                type="text"
                placeholder="Search claim ID, policy number..."
                className="w-full pl-10 pr-12 py-2.5 text-xs bg-transparent text-slate-200 placeholder-slate-500 focus:outline-none cursor-pointer"
                readOnly
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 px-1.5 py-0.5 rounded border border-slate-700/80 bg-slate-800/80 text-[10px] font-mono text-slate-400">
                <Command className="h-3 w-3" />K
              </div>
            </div>
          </Link>
        </div>
        
        {/* Right header controls */}
        <div className="flex items-center gap-3">
          {/* Status Indicator */}
          <div className="hidden xl:flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_#10b981]" />
            <span className="text-xs font-semibold text-emerald-400">XGBoost Model Active</span>
          </div>

          {/* Notifications button */}
          <button className="relative p-2.5 text-slate-400 hover:text-slate-100 rounded-xl hover:bg-slate-900 border border-slate-800/80 transition-colors" aria-label="Notifications">
            <Bell className="h-4.5 w-4.5" />
            <span className="absolute top-2 right-2 w-2 h-2 bg-rose-500 rounded-full shadow-[0_0_8px_#f43f5e]" aria-label="Notifications" />
          </button>
          
          <div className="w-px h-6 bg-slate-800 mx-1" />
          
          {/* Analyst profile avatar & Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setProfileOpen(!profileOpen)}
              className="flex items-center gap-2.5 p-1.5 rounded-xl hover:bg-slate-900 border border-transparent hover:border-slate-800 transition-all cursor-pointer focus:outline-none"
              aria-expanded={profileOpen}
              aria-label="User profile menu"
            >
              <div className="w-9 h-9 bg-gradient-to-tr from-indigo-500 via-purple-600 to-pink-500 rounded-xl flex items-center justify-center shadow-glow-primary">
                <User className="h-4.5 w-4.5 text-white" />
              </div>
              <div className="hidden md:block text-left leading-tight">
                <span className="block text-xs font-bold text-slate-200 truncate max-w-[120px]">
                  {user?.full_name || user?.username || 'User'}
                </span>
                <span className="block text-[10px] text-slate-400 capitalize">{user?.role || 'Analyst'}</span>
              </div>
              <ChevronDown className={cn("h-4 w-4 text-slate-400 transition-transform duration-200", profileOpen && "rotate-180")} />
            </button>

            {profileOpen && (
              <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl py-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                <div className="px-4 py-3 border-b border-slate-800/80">
                  <p className="text-xs font-bold text-slate-100 truncate">{user?.full_name || 'Logged User'}</p>
                  <p className="text-[11px] text-slate-400 truncate">{user?.email || `${user?.username || 'user'}@sentinel.ai`}</p>
                  <span className="inline-block mt-2 px-2 py-0.5 rounded text-[10px] font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 capitalize">
                    Role: {user?.role || 'Analyst'}
                  </span>
                </div>
                
                <div className="p-1.5">
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded-xl transition-colors text-left cursor-pointer"
                  >
                    <LogOut className="h-4 w-4 text-rose-400" />
                    <span>Logout</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

