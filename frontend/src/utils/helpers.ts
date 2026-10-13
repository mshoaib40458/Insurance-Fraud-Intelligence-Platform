// Utility functions

export function cn(...inputs: (string | undefined | null | false)[]): string {
  return inputs.filter(Boolean).join(' ');
}

export function formatPercentage(value: number, decimals = 1): string {
  return `${(value * 100).toFixed(decimals)}%`;
}

export function formatNumber(value: number): string {
  return new Intl.NumberFormat().format(value);
}

export function getRiskColor(level: 'Low' | 'Medium' | 'High'): string {
  switch (level) {
    case 'Low': return 'text-emerald-400';
    case 'Medium': return 'text-amber-400';
    case 'High': return 'text-rose-400';
  }
}

export function getRiskBgColor(level: 'Low' | 'Medium' | 'High'): string {
  switch (level) {
    case 'Low': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
    case 'Medium': return 'bg-amber-500/10 text-amber-400 border-amber-500/30';
    case 'High': return 'bg-rose-500/10 text-rose-400 border-rose-500/30';
  }
}

export function getRiskBadgeClass(level: 'Low' | 'Medium' | 'High'): string {
  const base = 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border backdrop-blur-md';
  switch (level) {
    case 'Low': return `${base} bg-emerald-500/10 text-emerald-400 border-emerald-500/30 shadow-[0_0_10px_rgba(16,185,129,0.15)]`;
    case 'Medium': return `${base} bg-amber-500/10 text-amber-400 border-amber-500/30 shadow-[0_0_10px_rgba(245,158,11,0.15)]`;
    case 'High': return `${base} bg-rose-500/10 text-rose-400 border-rose-500/30 shadow-[0_0_10px_rgba(244,63,94,0.15)]`;
  }
}

export function getRiskSolidClass(level: 'Low' | 'Medium' | 'High'): string {
  switch (level) {
    case 'Low': return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40';
    case 'Medium': return 'bg-amber-500/20 text-amber-300 border-amber-500/40';
    case 'High': return 'bg-rose-500/20 text-rose-300 border-rose-500/40';
  }
}

export function truncate(str: string, length: number): string {
  if (str.length <= length) return str;
  return str.slice(0, length) + '...';
}

export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(date);
}

export function formatDateTime(dateString: string): string {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}
