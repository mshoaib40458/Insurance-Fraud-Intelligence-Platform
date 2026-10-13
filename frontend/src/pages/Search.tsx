// Search Page - Sentinel AI Enterprise Theme

import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Search as SearchIcon, X, Sparkles, Eye } from 'lucide-react';
import { PageLayout } from '@/components/layout/Layout';
import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Table } from '@/components/ui/Table';
import { Pagination } from '@/components/ui/Pagination';
import { useSearchClaims } from '@/hooks/useApi';
import { formatNumber, formatPercentage } from '@/utils/helpers';
import type { ClaimRecord } from '@/types/api';

export function Search() {
  const [params, setParams] = useState({
    q: '',
    risk_level: '',
    min_prob: '',
    max_prob: '',
    page: 1,
    page_size: 20,
  });
  
  const { data, isLoading } = useSearchClaims({
    q: params.q || undefined,
    risk_level: params.risk_level || undefined,
    min_prob: params.min_prob ? Number(params.min_prob) : undefined,
    max_prob: params.max_prob ? Number(params.max_prob) : undefined,
  });
  const searchData = data;
  const claims = searchData?.claims ?? [];
  const total = searchData?.total ?? 0;
  const totalPages = Math.ceil(total / params.page_size);
  
  const columns = [
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
        return <span className="font-mono text-xs text-slate-300 font-semibold">{String(val)}</span>;
      },
      sortable: true,
    },
    {
      key: 'Fraud_Probability',
      header: 'Fraud Risk Score',
      render: (value: unknown) => {
        const prob = value as number;
        return (
          <div className="flex items-center gap-2.5 min-w-[130px]">
            <div className="flex-1 h-2 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
              <div
                className="h-full rounded-full"
                style={{
                  width: `${Math.min(100, prob * 100)}%`,
                  backgroundColor: prob >= 0.6 ? '#f43f5e' : prob >= 0.3 ? '#f59e0b' : '#10b981',
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
      render: (value: unknown) => <Badge variant="risk">{String(value)}</Badge>,
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
      key: 'actions',
      header: 'Action',
      render: (_: unknown, row: ClaimRecord) => (
        <Link to={`/claims/${row.Claim_Index}`}>
          <Button variant="ghost" size="sm" className="px-2 py-1 text-xs">
            <Eye className="h-3.5 w-3.5" />
            View
          </Button>
        </Link>
      ),
    },
  ];
  
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setParams(prev => ({ ...prev, page: 1 }));
  };
  
  const clearFilters = () => {
    setParams({ q: '', risk_level: '', min_prob: '', max_prob: '', page: 1, page_size: 20 });
  };
  
  const hasActiveFilters = params.q || params.risk_level || params.min_prob || params.max_prob;
  
  return (
    <PageLayout
      title="Search Claims Registry"
      description="Advanced query engine for multi-attribute insurance claim lookup"
      breadcrumbs={[{ label: 'Claims', href: '/claims' }, { label: 'Search Console' }]}
      actions={
        hasActiveFilters ? (
          <Button variant="outline" size="sm" onClick={clearFilters}>
            <X className="h-4 w-4" />
            Reset Console
          </Button>
        ) : undefined
      }
    >
      {/* Search Console Input Card */}
      <Card padding="lg" className="mb-6 border-indigo-500/30 bg-gradient-to-b from-slate-900 to-indigo-950/20">
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="h-4.5 w-4.5 text-indigo-400" />
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-200 font-display">Multi-Parameter Query Console</h2>
        </div>
        <form onSubmit={handleSearch} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            <Input
              label="Query Input"
              placeholder="Claim ID, policy number..."
              value={params.q}
              onChange={(e) => setParams(prev => ({ ...prev, q: e.target.value }))}
              leftIcon={<SearchIcon className="h-4 w-4" />}
            />
            
            <Select
              label="Risk Level Tier"
              options={[
                { value: '', label: 'All Risk Tiers' },
                { value: 'High', label: 'High Risk' },
                { value: 'Medium', label: 'Medium Risk' },
                { value: 'Low', label: 'Low Risk' },
              ]}
              value={params.risk_level}
              onChange={(e) => setParams(prev => ({ ...prev, risk_level: e.target.value, page: 1 }))}
            />
            
            <Input
              label="Min Probability"
              type="number"
              step="0.01"
              min="0"
              max="1"
              placeholder="0.00"
              value={params.min_prob}
              onChange={(e) => setParams(prev => ({ ...prev, min_prob: e.target.value, page: 1 }))}
            />
            
            <Input
              label="Max Probability"
              type="number"
              step="0.01"
              min="0"
              max="1"
              placeholder="1.00"
              value={params.max_prob}
              onChange={(e) => setParams(prev => ({ ...prev, max_prob: e.target.value, page: 1 }))}
            />
            
            <Select
              label="Results Limit"
              options={[
                { value: '10', label: '10 per page' },
                { value: '20', label: '20 per page' },
                { value: '50', label: '50 per page' },
              ]}
              value={String(params.page_size)}
              onChange={(e) => setParams(prev => ({ ...prev, page_size: Number(e.target.value), page: 1 }))}
            />
          </div>
          
          <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-800">
            <Button type="submit" variant="primary">
              <SearchIcon className="h-4 w-4" />
              Execute Search
            </Button>
            {hasActiveFilters && (
              <Button type="button" variant="outline" onClick={clearFilters}>
                Clear Criteria
              </Button>
            )}
          </div>
        </form>
      </Card>
      
      {/* Results Container */}
      <Card padding="none" className="overflow-hidden">
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-16 text-center">
              <div className="inline-block h-8 w-8 animate-spin border-2 border-indigo-500 border-t-transparent rounded-full mb-3" />
              <p className="text-sm text-slate-400">Executing database search query...</p>
            </div>
          ) : (
            <>
              <Table<ClaimRecord>
                data={claims}
                columns={columns}
                keyField="Claim_Index"
                hoverable
                striped
                emptyMessage={hasActiveFilters ? 'No claim records match your specified search criteria' : 'Enter search parameters above to view matching claims'}
              />
              
              {totalPages > 1 && (
                <Pagination
                  currentPage={params.page}
                  totalPages={totalPages}
                  onPageChange={(page) => setParams(prev => ({ ...prev, page }))}
                  showPageSize
                  pageSize={params.page_size}
                  onPageSizeChange={(size) => setParams(prev => ({ ...prev, page_size: size, page: 1 }))}
                  totalItems={total}
                  itemLabel="results"
                />
              )}
            </>
          )}
        </CardContent>
      </Card>
      
      <div className="mt-4 text-xs font-mono text-slate-500">
        {total > 0 
          ? `Found ${formatNumber(total)} matching record${total !== 1 ? 's' : ''}`
          : 'No records found'}
      </div>
    </PageLayout>
  );
}