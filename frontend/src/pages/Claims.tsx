// Claims Page - Sentinel AI Enterprise Theme

import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Search, Filter, RefreshCw, X, Eye } from 'lucide-react';
import { PageLayout } from '@/components/layout/Layout';
import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Table } from '@/components/ui/Table';
import { Pagination } from '@/components/ui/Pagination';
import { useClaims } from '@/hooks/useApi';
import { formatNumber, formatPercentage } from '@/utils/helpers';
import type { ClaimRecord } from '@/types/api';

export function Claims() {
  const [filters, setFilters] = useState({
    page: 1,
    page_size: 20,
    risk_level: '',
    min_prob: '',
    max_prob: '',
    q: '',
    sort_by: 'Fraud_Probability',
    sort_desc: true,
  });

  const { data: claimsData, isLoading, refetch } = useClaims({
    page: filters.page,
    page_size: filters.page_size,
    risk_level: filters.risk_level || undefined,
    min_prob: filters.min_prob ? Number(filters.min_prob) : undefined,
    max_prob: filters.max_prob ? Number(filters.max_prob) : undefined,
    sort_by: filters.sort_by,
    sort_desc: filters.sort_desc,
  });

  // Client side search filter for Claim_Index / PolicyNumber if q is typed
  const rawClaims = claimsData?.claims ?? [];
  const currentClaims = useMemo(() => {
    if (!filters.q.trim()) return rawClaims;
    const qLower = filters.q.trim().toLowerCase();
    return rawClaims.filter(c => 
      String(c.Claim_Index).includes(qLower) || 
      String(c.PolicyNumber).includes(qLower)
    );
  }, [rawClaims, filters.q]);

  const totalClaims = claimsData?.total ?? 0;
  const totalPages = claimsData?.pages ?? 1;
  const currentPage = claimsData?.page ?? 1;
  
  const columns = useMemo(() => [
    {
      key: 'Claim_Index',
      header: 'Claim ID',
      render: (value: unknown) => (
        <Link to={`/claims/${String(value)}`} className="text-indigo-400 hover:text-indigo-300 font-mono font-bold hover:underline flex items-center gap-1">
          #{String(value)}
        </Link>
      ),
      sortable: true,
    },
    {
      key: 'PolicyNumber',
      header: 'Policy Number',
      render: (value: unknown, row: ClaimRecord) => {
        const val = value || `POL-${row.Claim_Index}`;
        return <span className="font-mono text-slate-300 text-xs font-semibold">{String(val)}</span>;
      },
      sortable: true,
    },
    {
      key: 'Fraud_Probability',
      header: 'Fraud Risk Score',
      render: (value: unknown) => {
        const prob = value as number;
        return (
          <div className="flex items-center gap-3 min-w-[150px]">
            <div className="flex-1 h-2 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
              <div
                className="h-full rounded-full transition-all duration-300"
                style={{ 
                  width: `${Math.min(100, prob * 100)}%`,
                  backgroundColor: prob >= 0.6 ? '#f43f5e' : prob >= 0.3 ? '#f59e0b' : '#10b981',
                  boxShadow: prob >= 0.6 ? '0 0 10px rgba(244,63,94,0.5)' : 'none',
                }}
              />
            </div>
            <span className="font-mono font-bold text-xs text-slate-200">{formatPercentage(prob)}</span>
          </div>
        );
      },
      sortable: true,
    },
    {
      key: 'Risk_Level',
      header: 'Risk Level',
      render: (value: unknown) => (
        <Badge variant="risk">{String(value)}</Badge>
      ),
      sortable: true,
    },
    {
      key: 'Prediction',
      header: 'AI Verdict',
      render: (_: unknown, row: ClaimRecord) => {
        const isFraud = row.Predicted_Fraud === 1 || row.Prediction === 1 || (row.Fraud_Probability && row.Fraud_Probability >= 0.1);
        return (
          <Badge variant={isFraud ? 'danger' : 'success'}>
            {isFraud ? 'Flagged Fraud' : 'Passed'}
          </Badge>
        );
      },
      sortable: true,
    },
    {
      key: 'Actual_Fraud',
      header: 'Actual Status',
      render: (value: unknown) => {
        if (value === undefined || value === null) return <span className="text-slate-600">—</span>;
        return <Badge variant={value === 1 ? 'danger' : 'success'}>{value === 1 ? 'Fraud' : 'Legit'}</Badge>;
      },
      sortable: true,
    },
    {
      key: 'actions',
      header: 'Action',
      render: (_: unknown, row: ClaimRecord) => (
        <Link to={`/claims/${row.Claim_Index}`}>
          <Button variant="ghost" size="sm" className="px-2 py-1 text-xs">
            <Eye className="h-3.5 w-3.5" />
            Inspect
          </Button>
        </Link>
      ),
    },
  ], []);
  
  const handleFilterChange = (key: string, value: string | number) => {
    setFilters(prev => ({ ...prev, [key]: value, page: 1 }));
  };
  
  const clearFilters = () => {
    setFilters({
      page: 1,
      page_size: 20,
      risk_level: '',
      min_prob: '',
      max_prob: '',
      q: '',
      sort_by: 'Fraud_Probability',
      sort_desc: true,
    });
  };
  
  const hasActiveFilters = Boolean(filters.risk_level || filters.min_prob || filters.max_prob || filters.q);
  
  return (
    <PageLayout
      title="Claims Intelligence Registry"
      description="Inspect insurance claims evaluated by machine learning risk models"
      actions={
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => { void refetch(); }} size="sm">
            <RefreshCw className="h-4 w-4" />
            Refresh Telemetry
          </Button>
          {hasActiveFilters && (
            <Button variant="secondary" size="sm" onClick={clearFilters}>
              <X className="h-4 w-4" />
              Reset Filters
            </Button>
          )}
        </div>
      }
    >
      {/* Control Panel / Filter Bar */}
      <Card padding="lg" className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/30">
              <Filter className="h-4 w-4" />
            </div>
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-200 font-display">Filter Claims Engine</h2>
            {hasActiveFilters && (
              <Badge variant="info" size="sm">Filters Active</Badge>
            )}
          </div>
          <span className="text-xs font-mono text-slate-400 font-semibold">{formatNumber(totalClaims)} total records matched</span>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <Input
            label="Search Query"
            placeholder="Claim ID, policy #..."
            value={filters.q}
            onChange={(e) => handleFilterChange('q', e.target.value)}
            leftIcon={<Search className="h-4 w-4" />}
          />
          
          <Select
            label="Risk Filter"
            options={[
              { value: '', label: 'All Risk Levels' },
              { value: 'High', label: 'High Risk' },
              { value: 'Medium', label: 'Medium Risk' },
              { value: 'Low', label: 'Low Risk' },
            ]}
            value={filters.risk_level}
            onChange={(e) => handleFilterChange('risk_level', e.target.value)}
          />
          
          <Input
            label="Min Probability"
            type="number"
            step="0.01"
            min="0"
            max="1"
            placeholder="0.00"
            value={filters.min_prob}
            onChange={(e) => handleFilterChange('min_prob', e.target.value)}
          />
          
          <Input
            label="Max Probability"
            type="number"
            step="0.01"
            min="0"
            max="1"
            placeholder="1.00"
            value={filters.max_prob}
            onChange={(e) => handleFilterChange('max_prob', e.target.value)}
          />
          
          <Select
            label="Records Per Page"
            options={[
              { value: '10', label: '10 records' },
              { value: '20', label: '20 records' },
              { value: '50', label: '50 records' },
              { value: '100', label: '100 records' },
            ]}
            value={String(filters.page_size)}
            onChange={(e) => handleFilterChange('page_size', Number(e.target.value))}
          />
        </div>
      </Card>

      {/* Claims Table Container */}
      <Card padding="none" className="overflow-hidden">
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-16 text-center">
              <div className="inline-block h-8 w-8 animate-spin border-2 border-indigo-500 border-t-transparent rounded-full mb-3" />
              <p className="text-sm text-slate-400 font-medium">Fetching claims from risk engine...</p>
            </div>
          ) : (
            <>
              <Table<ClaimRecord>
                data={currentClaims}
                columns={columns}
                keyField="Claim_Index"
                hoverable
                striped
                emptyMessage="No claim records match your specified criteria"
              />
              
              {totalPages > 1 && (
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={(page) => setFilters(prev => ({ ...prev, page }))}
                  showPageSize
                  pageSize={filters.page_size}
                  onPageSizeChange={(size) => handleFilterChange('page_size', size)}
                  totalItems={totalClaims}
                  itemLabel="claims"
                />
              )}
            </>
          )}
        </CardContent>
      </Card>
    </PageLayout>
  );
}