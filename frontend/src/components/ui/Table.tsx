// Table Component - Dark Glassmorphic

import { useState, useMemo, TableHTMLAttributes } from 'react';
import { ChevronUp, ChevronDown, ChevronsUpDown } from 'lucide-react';
import { cn } from '@/utils/helpers';

interface Column<T> {
  key: string;
  header: string;
  render?: (value: unknown, row: T, index: number) => React.ReactNode;
  className?: string;
  headerClassName?: string;
  sortable?: boolean;
}

interface SortConfig {
  key: string;
  direction: 'asc' | 'desc';
}

interface TableProps<T> extends TableHTMLAttributes<HTMLTableElement> {
  data: T[];
  columns: Column<T>[];
  keyField: keyof T;
  emptyMessage?: string;
  onRowClick?: (row: T) => void;
  striped?: boolean;
  hoverable?: boolean;
  dense?: boolean;
}

function TableHeader<T>({ columns, sortConfig, onSort }: { 
  columns: Column<T>[]; 
  sortConfig?: SortConfig | null;
  onSort?: (key: string) => void;
}) {
  return (
    <thead className="bg-slate-900/90 border-b border-slate-800">
      <tr>
        {columns.map((column) => (
          <th
            key={column.key}
            scope="col"
            className={cn(
              'px-4 py-3.5 text-left text-[11px] font-semibold text-slate-400 uppercase tracking-wider font-display',
              column.sortable && 'cursor-pointer hover:text-slate-200 group select-none transition-colors',
              column.headerClassName
            )}
            onClick={() => column.sortable && onSort?.(column.key)}
          >
            <div className="flex items-center gap-1.5">
              {column.header}
              {column.sortable && (
                <span className="text-slate-500">
                  {sortConfig?.key === column.key ? (
                    sortConfig.direction === 'asc' ? <ChevronUp className="h-3.5 w-3.5 text-indigo-400" /> : <ChevronDown className="h-3.5 w-3.5 text-indigo-400" />
                  ) : (
                    <ChevronsUpDown className="h-3.5 w-3.5 opacity-40 group-hover:opacity-100 transition-opacity" />
                  )}
                </span>
              )}
            </div>
          </th>
        ))}
      </tr>
    </thead>
  );
}

function TableBody<T>({ 
  data, 
  columns, 
  keyField, 
  onRowClick,
  striped,
  hoverable,
  dense,
}: { 
  data: T[];
  columns: Column<T>[];
  keyField: keyof T;
  onRowClick?: (row: T) => void;
  striped?: boolean;
  hoverable?: boolean;
  dense?: boolean;
}) {
  if (data.length === 0) return null;
  
  return (
    <tbody className="divide-y divide-slate-800/60">
      {data.map((row, rowIndex) => (
        <tr
          key={String(row[keyField])}
          className={cn(
            'transition-all duration-150',
            striped && rowIndex % 2 === 1 ? 'bg-slate-900/40' : 'bg-transparent',
            hoverable ? 'hover:bg-slate-800/60 hover:shadow-inner' : '',
            onRowClick && 'cursor-pointer'
          )}
          onClick={() => onRowClick?.(row)}
        >
          {columns.map((column) => {
            const value = row[column.key as keyof T];
            return (
              <td
                key={column.key}
                className={cn(
                  dense ? 'px-4 py-3' : 'px-4 py-4',
                  'text-sm text-slate-200 font-sans',
                  column.className
                )}
              >
                {column.render 
                  ? column.render(value, row, rowIndex)
                  : String(value ?? '')
                }
              </td>
            );
          })}
        </tr>
      ))}
    </tbody>
  );
}

export function Table<T extends Record<string, unknown>>({
  data,
  columns,
  keyField,
  emptyMessage = 'No data available',
  onRowClick,
  striped = true,
  hoverable = true,
  dense = false,
  className,
  ...props
}: TableProps<T>) {
  const [sortConfig, setSortConfig] = useState<SortConfig | null>(null);
  
  const handleSort = (key: string) => {
    setSortConfig(prev => ({
      key,
      direction: prev?.key === key && prev.direction === 'asc' ? 'desc' : 'asc',
    }));
  };
  
  const sortedData = useMemo(() => {
    if (!sortConfig) return data;
    return [...data].sort((a, b) => {
      const aVal = a[sortConfig.key as keyof T];
      const bVal = b[sortConfig.key as keyof T];
      if (aVal == null || bVal == null) return 0;
      if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
  }, [data, sortConfig]);
  
  return (
    <div className="overflow-x-auto">
      <table className={cn('w-full', className)} {...props}>
        <TableHeader columns={columns} sortConfig={sortConfig} onSort={handleSort} />
        <TableBody
          data={sortedData}
          columns={columns}
          keyField={keyField}
          onRowClick={onRowClick}
          striped={striped}
          hoverable={hoverable}
          dense={dense}
        />
      </table>
      {data.length === 0 && (
        <div className="text-center py-14 text-slate-400 text-sm">
          <div className="mx-auto mb-3 w-12 h-12 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-500">
            🔍
          </div>
          {emptyMessage}
        </div>
      )}
    </div>
  );
}

Table.displayName = 'Table';
