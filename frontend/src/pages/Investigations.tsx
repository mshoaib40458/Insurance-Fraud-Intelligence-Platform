// Investigations Page - Sentinel AI Enterprise Theme

import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { FileText, Edit, Flag, Download, Filter, ShieldAlert } from 'lucide-react';
import { PageLayout } from '@/components/layout/Layout';
import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Table } from '@/components/ui/Table';
import { Pagination } from '@/components/ui/Pagination';
import { Modal } from '@/components/ui/Modal';
import { Textarea } from '@/components/ui/Input';
import { useClaims } from '@/hooks/useApi';
import { formatPercentage } from '@/utils/helpers';

const INVESTIGATION_STATUSES = [
  { value: 'Pending Review', label: 'Pending Review' },
  { value: 'Under Investigation', label: 'Under Investigation' },
  { value: 'Cleared', label: 'Cleared' },
  { value: 'Escalated', label: 'Escalated' },
  { value: 'Closed', label: 'Closed' },
] as const;

type InvestigationStatus = typeof INVESTIGATION_STATUSES[number]['value'];

interface InvestigationClaim {
  Claim_Index: number;
  PolicyNumber: number;
  Fraud_Probability: number;
  Risk_Level: 'Low' | 'Medium' | 'High';
  Investigation_Status: InvestigationStatus;
  Investigator_Notes: string;
  Assigned_Investigator?: string;
  Created_At: string;
  Updated_At: string;
  [key: string]: unknown;
}

function getStatusVariant(status: InvestigationStatus): 'default' | 'danger' | 'warning' | 'success' | 'info' {
  switch (status) {
    case 'Escalated': return 'danger';
    case 'Under Investigation': return 'warning';
    case 'Cleared': return 'success';
    case 'Pending Review': return 'info';
    default: return 'default';
  }
}

export function Investigations() {
  const [filters, setFilters] = useState({
    page: 1,
    page_size: 20,
    risk_level: '',
    status: '',
    sort_by: 'Fraud_Probability',
    sort_desc: true,
  });
  
  const [selectedClaim, setSelectedClaim] = useState<InvestigationClaim | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [noteText, setNoteText] = useState('');
  const [newStatus, setNewStatus] = useState<InvestigationStatus>('Pending Review');
  
  const { data, isLoading } = useClaims(filters);
  const claims = (data?.claims ?? []) as unknown as InvestigationClaim[];
  const totalPages = data?.pages ?? 1;
  const currentPage = data?.page ?? 1;
  
  const columns = useMemo(() => [
    {
      key: 'Claim_Index',
      header: 'Claim ID',
      render: (value: unknown) => (
        <Link to={`/claims/${String(value)}`} className="text-indigo-400 hover:text-indigo-300 font-mono font-bold hover:underline">
          #{String(value)}
        </Link>
      ),
      sortable: true,
    },
    {
      key: 'PolicyNumber',
      header: 'Policy Number',
      render: (value: unknown, row: InvestigationClaim) => {
        const val = value || `POL-${row.Claim_Index}`;
        return <span className="font-mono text-xs text-slate-300 font-semibold">{String(val)}</span>;
      },
      sortable: true,
    },
    {
      key: 'Fraud_Probability',
      header: 'Fraud Score',
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
      header: 'Risk Tier',
      render: (value: unknown) => <Badge variant="risk">{String(value)}</Badge>,
      sortable: true,
    },
    {
      key: 'Investigation_Status',
      header: 'Case Status',
      render: (value: unknown) => (
        <Badge variant={getStatusVariant(value as InvestigationStatus)}>{String(value)}</Badge>
      ),
      sortable: true,
    },
    {
      key: 'Assigned_Investigator',
      header: 'Investigator',
      render: (value: unknown) => {
        if (!value) return <span className="inline-flex items-center gap-1.5 text-slate-500 text-xs"><Flag className="h-3 w-3" /> Unassigned</span>;
        return <span className="text-xs text-slate-200 font-bold">{String(value)}</span>;
      },
    },
    {
      key: 'actions',
      header: 'Manage',
      render: (_: unknown, row: InvestigationClaim) => (
        <div className="flex items-center gap-1">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => openModal(row)}
            className="px-2.5 py-1 text-xs"
            aria-label={`Edit investigation for claim #${row.Claim_Index}`}
          >
            <Edit className="h-3.5 w-3.5" />
            Update Case
          </Button>
          <Link to={`/claims/${row.Claim_Index}`}>
            <Button variant="ghost" size="sm" className="px-2 py-1 text-xs" aria-label={`View claim #${row.Claim_Index}`}>
              <FileText className="h-3.5 w-3.5" />
            </Button>
          </Link>
        </div>
      ),
    },
  ], []);
  
  function openModal(claim: InvestigationClaim) {
    setSelectedClaim(claim);
    setNoteText(claim.Investigator_Notes || '');
    setNewStatus(claim.Investigation_Status || 'Pending Review');
    setModalOpen(true);
  }
  
  function handleSave() {
    if (!selectedClaim) return;
    console.log('Save investigation:', {
      claimIndex: selectedClaim.Claim_Index,
      status: newStatus,
      notes: noteText,
    });
    setModalOpen(false);
    setSelectedClaim(null);
  }
  
  return (
    <PageLayout
      title="Fraud Investigation Queue"
      description="Manage active fraud cases, assign investigators, and record audit findings"
      breadcrumbs={[{ label: 'Investigations' }]}
      actions={
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4" />
            Export Audit Logs
          </Button>
          <Button variant="primary" size="sm">
            <ShieldAlert className="h-4 w-4" />
            Flag New Case
          </Button>
        </div>
      }
    >
      {/* Case Status Summary Pills */}
      <div className="mb-6 grid grid-cols-2 sm:grid-cols-5 gap-4">
        {INVESTIGATION_STATUSES.map((status) => {
          const count = claims.filter(c => c.Investigation_Status === status.value).length;
          return (
            <Card key={status.label} variant="hover" padding="md" className="text-center">
              <CardContent>
                <p className="text-2xl font-extrabold text-slate-100 font-display">{count}</p>
                <Badge variant={getStatusVariant(status.value as InvestigationStatus)} size="sm" className="mt-1.5">{status.label}</Badge>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Case Filters */}
      <Card padding="lg" className="mb-6">
        <div className="flex items-center gap-2 mb-4">
          <Filter className="h-4 w-4 text-indigo-400" />
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-200 font-display">Case Management Filters</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Input
            label="Search Case"
            placeholder="Claim ID, policy #..."
            value={filters.risk_level}
            onChange={(e) => setFilters(prev => ({ ...prev, risk_level: e.target.value, page: 1 }))}
          />
          
          <Select
            label="Risk Tier"
            options={[
              { value: '', label: 'All Tiers' },
              { value: 'High', label: 'High Risk' },
              { value: 'Medium', label: 'Medium Risk' },
              { value: 'Low', label: 'Low Risk' },
            ]}
            value={filters.risk_level}
            onChange={(e) => setFilters(prev => ({ ...prev, risk_level: e.target.value, page: 1 }))}
          />
          
          <Select
            label="Investigation Status"
            options={[
              { value: '', label: 'All Statuses' },
              ...INVESTIGATION_STATUSES.map(s => ({ value: s.value, label: s.label })),
            ]}
            value={filters.status}
            onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value, page: 1 }))}
          />
          
          <Select
            label="Page Size"
            options={[
              { value: '10', label: '10 cases' },
              { value: '20', label: '20 cases' },
              { value: '50', label: '50 cases' },
            ]}
            value={String(filters.page_size)}
            onChange={(e) => setFilters(prev => ({ ...prev, page_size: Number(e.target.value), page: 1 }))}
          />
        </div>
      </Card>
      
      {/* Table */}
      <Card padding="none" className="overflow-hidden">
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-16 text-center">
              <div className="inline-block h-8 w-8 animate-spin border-2 border-indigo-500 border-t-transparent rounded-full mb-3" />
              <p className="text-sm text-slate-400">Loading active cases...</p>
            </div>
          ) : (
            <>
              <Table<InvestigationClaim>
                data={claims}
                columns={columns}
                keyField="Claim_Index"
                hoverable
                striped
                dense
                emptyMessage="No investigation cases found matching filter"
              />
              
              {totalPages > 1 && (
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={(page) => setFilters(prev => ({ ...prev, page }))}
                  showPageSize
                  pageSize={filters.page_size}
                  onPageSizeChange={(size) => setFilters(prev => ({ ...prev, page_size: size }))}
                  totalItems={data?.total ?? 0}
                  itemLabel="cases"
                />
              )}
            </>
          )}
        </CardContent>
      </Card>
      
      {/* Update Case Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Update Investigation Case"
        description={selectedClaim ? `Claim #${selectedClaim.Claim_Index} — Policy #${selectedClaim.PolicyNumber}` : ''}
        size="md"
      >
        <div className="space-y-4">
          <Select
            label="Case Status"
            options={INVESTIGATION_STATUSES.map(s => ({ value: s.value, label: s.label }))}
            value={newStatus}
            onChange={(e) => setNewStatus(e.target.value as InvestigationStatus)}
          />
          
          <Textarea
            label="Investigator Findings & Audit Notes"
            value={noteText}
            onChange={(e) => setNoteText(e.target.value)}
            placeholder="Record evidence, interview notes, or action items..."
            rows={5}
          />
          
          <div className="flex justify-end gap-2.5 pt-4 border-t border-slate-800">
            <Button variant="outline" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleSave}>
              Save Investigation Update
            </Button>
          </div>
        </div>
      </Modal>
    </PageLayout>
  );
}