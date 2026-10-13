// Pagination Component - Dark UI

import { useMemo } from 'react';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import { cn } from '@/utils/helpers';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  showPageSize?: boolean;
  pageSize?: number;
  onPageSizeChange?: (size: number) => void;
  pageSizeOptions?: number[];
  totalItems?: number;
  itemLabel?: string;
}

export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  showPageSize = false,
  pageSize,
  onPageSizeChange,
  pageSizeOptions = [10, 20, 50, 100],
  totalItems,
  itemLabel = 'items',
}: PaginationProps) {
  
  const pages = useMemo(() => {
    if (totalPages <= 1) return [];
    
    const pages: (number | string)[] = [];
    const maxVisible = 5;
    let start = Math.max(1, currentPage - Math.floor(maxVisible / 2));
    const end = Math.min(totalPages, start + maxVisible - 1);
    
    if (end - start + 1 < maxVisible) {
      start = Math.max(1, end - maxVisible + 1);
    }
    
    if (start > 1) {
      pages.push(1);
      if (start > 2) pages.push('...');
    }
    
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    
    if (end < totalPages) {
      if (end < totalPages - 1) pages.push('...');
      pages.push(totalPages);
    }
    
    return pages;
  }, [currentPage, totalPages]);
  
  if (totalPages <= 1 && !showPageSize) return null;
  
  const navButton = 'p-2 text-slate-400 hover:text-slate-100 hover:bg-slate-800/80 rounded-xl transition-colors disabled:opacity-30 disabled:pointer-events-none cursor-pointer';
  
  return (
    <nav className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-5 py-4 border-t border-slate-800/60 bg-slate-900/60" aria-label="Pagination">
      <div className="flex items-center gap-4">
        {totalItems !== undefined ? (
          <span className="text-xs text-slate-400 font-medium">
            Showing <span className="text-slate-200 font-semibold">{totalItems.toLocaleString()}</span> {itemLabel}
          </span>
        ) : (
          <span className="text-xs text-slate-400 font-medium">
            Page <span className="text-slate-200 font-semibold">{currentPage}</span> of {totalPages}
          </span>
        )}
        {showPageSize && pageSize && onPageSizeChange && (
          <select
            value={pageSize}
            onChange={(e) => onPageSizeChange(Number(e.target.value))}
            className="px-2.5 py-1 text-xs border border-slate-800 rounded-lg bg-slate-900 text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 cursor-pointer"
            aria-label="Rows per page"
          >
            {pageSizeOptions.map((size) => (
              <option key={size} value={size} className="bg-slate-900 text-slate-200">
                {size} / page
              </option>
            ))}
          </select>
        )}
      </div>
      
      <div className="flex items-center gap-1">
        <button
          onClick={() => onPageChange(1)}
          disabled={currentPage === 1}
          className={navButton}
          aria-label="First page"
        >
          <ChevronsLeft className="h-4 w-4" />
        </button>
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className={navButton}
          aria-label="Previous page"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        
        <div className="flex items-center gap-1 px-1">
          {pages.map((page, index) => (
            <button
              key={index}
              onClick={() => typeof page === 'number' && onPageChange(page)}
              disabled={page === '...' || page === currentPage}
              className={cn(
                'w-8 h-8 flex items-center justify-center text-xs rounded-xl transition-all duration-200 cursor-pointer',
                page === currentPage
                  ? 'bg-indigo-600 text-white font-semibold shadow-lg shadow-indigo-600/30 border border-indigo-400/30'
                  : page === '...'
                    ? 'text-slate-500 cursor-default'
                    : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
              )}
              aria-label={page === '...' ? undefined : `Page ${page}`}
              aria-current={page === currentPage ? 'page' : undefined}
            >
              {page}
            </button>
          ))}
        </div>
        
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className={navButton}
          aria-label="Next page"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
        <button
          onClick={() => onPageChange(totalPages)}
          disabled={currentPage === totalPages}
          className={navButton}
          aria-label="Last page"
        >
          <ChevronsRight className="h-4 w-4" />
        </button>
      </div>
    </nav>
  );
}
