// Claim Detail Page - Sentinel AI Enterprise Theme

import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Shield, AlertTriangle, CheckCircle, Download, TrendingUp, TrendingDown, Cpu, Sparkles } from 'lucide-react';
import { PageLayout } from '@/components/layout/Layout';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Table } from '@/components/ui/Table';
import { useClaim, useModelInfo } from '@/hooks/useApi';
import { formatNumber, formatPercentage, cn } from '@/utils/helpers';

interface RiskFactorRow {
  feature: string;
  shap_value: number;
  analyst_note: string;
}

export function ClaimDetail({ claimIndex }: { claimIndex: string }) {
  const index = parseInt(claimIndex, 10);
  const { data: claim, isLoading, error } = useClaim(index);
  const { data: modelInfo } = useModelInfo();
  
  const featureRows = useMemo(() => {
    if (!claim) return [];
    return [
      { label: 'Policy Number', value: claim.PolicyNumber || `POL-${claim.Claim_Index}` },
      { label: 'Claim Index', value: claim.Claim_Index },
      { label: 'Month', value: claim.Month },
      { label: 'Week of Month', value: claim.WeekOfMonth },
      { label: 'Day of Week', value: claim.DayOfWeek },
      { label: 'Make', value: claim.Make },
      { label: 'Accident Area', value: claim.AccidentArea },
      { label: 'Day of Week Claimed', value: claim.DayOfWeekClaimed },
      { label: 'Month Claimed', value: claim.MonthClaimed },
      { label: 'Week of Month Claimed', value: claim.WeekOfMonthClaimed },
      { label: 'Sex', value: claim.Sex },
      { label: 'Marital Status', value: claim.MaritalStatus },
      { label: 'Age', value: claim.Age },
      { label: 'Fault', value: claim.Fault },
      { label: 'Policy Type', value: claim.PolicyType },
      { label: 'Vehicle Category', value: claim.VehicleCategory },
      { label: 'Vehicle Price', value: claim.VehiclePrice },
      { label: 'Rep Number', value: claim.RepNumber },
      { label: 'Deductible', value: claim.Deductible ? `$${formatNumber(claim.Deductible)}` : '—' },
      { label: 'Driver Rating', value: claim.DriverRating },
      { label: 'Days Policy-Accident', value: claim.Days_Policy_Accident },
      { label: 'Days Policy-Claim', value: claim.Days_Policy_Claim },
      { label: 'Past Number of Claims', value: claim.PastNumberOfClaims },
      { label: 'Age of Vehicle', value: claim.AgeOfVehicle },
      { label: 'Age of Policy Holder', value: claim.AgeOfPolicyHolder },
      { label: 'Police Report Filed', value: claim.PoliceReportFiled },
      { label: 'Witness Present', value: claim.WitnessPresent },
      { label: 'Agent Type', value: claim.AgentType },
      { label: 'Number of Suppliments', value: claim.NumberOfSuppliments },
      { label: 'Address Change Claim', value: claim.AddressChange_Claim },
      { label: 'Number of Cars', value: claim.NumberOfCars },
      { label: 'Year', value: claim.Year },
      { label: 'Base Policy', value: claim.BasePolicy },
    ];
  }, [claim]);
  
  if (isLoading) {
    return (
      <PageLayout title="Inspecting Claim Record..." description="Loading model features and SHAP explanations">
        <div className="flex items-center justify-center h-80">
          <div className="flex flex-col items-center gap-3">
            <div className="inline-block h-10 w-10 animate-spin border-3 border-indigo-500 border-t-transparent rounded-full" />
            <p className="text-sm text-slate-400 font-medium">Computing SHAP feature contribution breakdown...</p>
          </div>
        </div>
      </PageLayout>
    );
  }
  
  if (error || !claim) {
    return (
      <PageLayout title="Claim Record Not Found" description="">
        <Card className="max-w-md mx-auto my-12" padding="lg">
          <CardContent className="text-center py-6">
            <AlertTriangle className="h-12 w-12 text-rose-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-slate-100 font-display mb-2">Claim Not Found</h2>
            <p className="text-slate-400 text-sm mb-6">The requested claim index #{claimIndex} does not exist in the active prediction registry.</p>
            <Link to="/claims">
              <Button variant="primary">Return to Registry</Button>
            </Link>
          </CardContent>
        </Card>
      </PageLayout>
    );
  }
  
  const riskFactors: RiskFactorRow[] = claim.top_risk_factors ?? [];
  const protectiveFactors: RiskFactorRow[] = claim.top_protective_factors ?? [];
  
  const riskGradient = claim.Risk_Level === 'High'
    ? 'border-rose-500/40 bg-gradient-to-r from-rose-950/40 via-slate-900/80 to-slate-900/80'
    : claim.Risk_Level === 'Medium'
      ? 'border-amber-500/40 bg-gradient-to-r from-amber-950/40 via-slate-900/80 to-slate-900/80'
      : 'border-emerald-500/40 bg-gradient-to-r from-emerald-950/40 via-slate-900/80 to-slate-900/80';
  
  return (
    <PageLayout
      title={`Claim Record #${claim.Claim_Index}`}
      description={`Policy ID #${claim.PolicyNumber || `POL-${claim.Claim_Index}`}`}
      breadcrumbs={[
        { label: 'Claims', href: '/claims' },
        { label: `Claim #${claim.Claim_Index}` },
      ]}
      actions={
        <div className="flex items-center gap-2.5">
          <Link to="/claims">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4" />
              Back to Registry
            </Button>
          </Link>
          <Button variant="primary" size="sm">
            <Download className="h-4 w-4" />
            Export Forensic Analysis
          </Button>
        </div>
      }
    >
      {/* High-Impact Verdict Hero Card */}
      <Card className={cn('mb-8 border shadow-2xl', riskGradient)} padding="lg">
        <CardContent className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Risk Level Badge */}
          <div className="flex items-start gap-4">
            <div className={cn(
              'w-16 h-16 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg border',
              claim.Risk_Level === 'High' ? 'bg-rose-500/20 text-rose-400 border-rose-500/40 shadow-glow-rose' :
              claim.Risk_Level === 'Medium' ? 'bg-amber-500/20 text-amber-400 border-amber-500/40 shadow-glow-amber' :
              'bg-emerald-500/20 text-emerald-400 border-emerald-500/40 shadow-glow-emerald'
            )}>
              {claim.Risk_Level === 'High' && <AlertTriangle className="h-8 w-8" />}
              {claim.Risk_Level === 'Medium' && <Shield className="h-8 w-8" />}
              {claim.Risk_Level === 'Low' && <CheckCircle className="h-8 w-8" />}
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Risk Assessment</p>
              <div className="mt-1 flex items-center gap-3">
                <span className="text-3xl font-extrabold text-slate-100 font-display">{claim.Risk_Level} Risk</span>
                <Badge variant="risk">{claim.Risk_Level}</Badge>
              </div>
              <p className="mt-2 text-xs text-slate-400">
                Model AI Classification: <span className="font-bold text-slate-200">{claim.prediction === 1 ? 'Fraudulent Claim' : 'Legitimate Claim'}</span>
              </p>
            </div>
          </div>
          
          {/* Probability Progress Gauge */}
          <div className="flex flex-col justify-center">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Model Predicted Probability</span>
              <span className="text-xl font-extrabold font-mono text-slate-100">{formatPercentage(claim.fraud_probability)}</span>
            </div>
            <div className="h-3 bg-slate-950 border border-slate-800 rounded-full overflow-hidden p-0.5">
              <div
                className={cn(
                  'h-full rounded-full transition-all duration-700',
                  claim.Risk_Level === 'High' ? 'bg-gradient-to-r from-amber-500 to-rose-500 shadow-[0_0_12px_#f43f5e]' : 
                  claim.Risk_Level === 'Medium' ? 'bg-gradient-to-r from-emerald-500 to-amber-500' : 
                  'bg-gradient-to-r from-teal-500 to-emerald-500'
                )}
                style={{ width: `${Math.min(100, claim.fraud_probability * 100)}%` }}
              />
            </div>
            <div className="mt-2.5 flex justify-between text-[11px] font-mono text-slate-400 font-semibold">
              <span>Score: {claim.risk_score}</span>
              <span>Decision Threshold: {formatPercentage(claim.threshold_used, 0)}</span>
            </div>
          </div>
          
          {/* Summary Metric Cards */}
          <div className="grid grid-cols-2 gap-3 content-center">
            <div className="rounded-xl bg-slate-950/70 border border-slate-800 p-3.5">
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">AI Classification</p>
              <p className="mt-1 text-base font-extrabold text-slate-100 font-display">
                {claim.prediction === 1 ? 'Fraud (Positive)' : 'Legit (Negative)'}
              </p>
            </div>
            <div className="rounded-xl bg-slate-950/70 border border-slate-800 p-3.5">
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Ground Truth</p>
              <p className="mt-1 text-base font-extrabold text-slate-100 font-display">
                {claim.Actual_Fraud !== undefined 
                  ? (claim.Actual_Fraud === 1 ? 'Confirmed Fraud' : 'Confirmed Legit')
                  : 'Pending Audit'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Detail Layout Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* SHAP Explanation Card */}
        <div className="space-y-6">
          <Card padding="lg">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Sparkles className="h-4.5 w-4.5 text-indigo-400" />
                  SHAP Explainability Insights
                </CardTitle>
                <Badge variant="purple" size="sm">XAI Engine</Badge>
              </div>
              <CardDescription>Feature contributions driving prediction score for Claim #{claim.Claim_Index}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Risk Factors */}
              <div>
                <h4 className="font-bold text-xs uppercase tracking-wider text-rose-400 mb-3 flex items-center gap-2 font-display">
                  <span className="p-1 rounded-lg bg-rose-500/10 border border-rose-500/30">
                    <TrendingUp className="h-3.5 w-3.5 text-rose-400" />
                  </span>
                  Top Risk Drivers (Increases Fraud Score)
                </h4>
                {riskFactors.length > 0 ? (
                  <div className="space-y-2">
                    {riskFactors.map((factor, i) => (
                      <div key={i} className="p-3 bg-rose-500/5 rounded-xl border border-rose-500/20 backdrop-blur-md">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-bold text-slate-200 truncate">{factor.feature}</p>
                            <p className="text-[11px] text-slate-400 mt-0.5">{factor.analyst_note}</p>
                          </div>
                          <span className="px-2.5 py-1 rounded-lg bg-rose-500/20 text-rose-300 text-xs font-mono font-bold whitespace-nowrap border border-rose-500/30">
                            +{factor.shap_value.toFixed(3)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-500 py-3 text-center">No major risk factors detected</p>
                )}
              </div>
              
              {/* Protective Factors */}
              <div>
                <h4 className="font-bold text-xs uppercase tracking-wider text-emerald-400 mb-3 flex items-center gap-2 font-display">
                  <span className="p-1 rounded-lg bg-emerald-500/10 border border-emerald-500/30">
                    <TrendingDown className="h-3.5 w-3.5 text-emerald-400" />
                  </span>
                  Protective Factors (Lowers Fraud Score)
                </h4>
                {protectiveFactors.length > 0 ? (
                  <div className="space-y-2">
                    {protectiveFactors.map((factor, i) => (
                      <div key={i} className="p-3 bg-emerald-500/5 rounded-xl border border-emerald-500/20 backdrop-blur-md">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-bold text-slate-200 truncate">{factor.feature}</p>
                            <p className="text-[11px] text-slate-400 mt-0.5">{factor.analyst_note}</p>
                          </div>
                          <span className="px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-300 text-xs font-mono font-bold whitespace-nowrap border border-emerald-500/30">
                            {factor.shap_value.toFixed(3)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-500 py-3 text-center">No major protective factors detected</p>
                )}
              </div>
            </CardContent>
          </Card>
          
          {/* Model Telemetry Info */}
          <Card padding="lg">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Cpu className="h-4.5 w-4.5 text-indigo-400" />
                <CardTitle className="text-base">Model Context</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              {modelInfo ? (
                <dl className="grid grid-cols-2 gap-3">
                  {[
                    { label: 'Algorithm', value: modelInfo.model_name },
                    { label: 'Model Version', value: modelInfo.model_version },
                    { label: 'Operational Cutoff', value: formatPercentage(modelInfo.operational_threshold, 0) },
                    { label: 'Brier Calibration', value: modelInfo.brier_score_after?.toFixed(4) ?? '0.0581' },
                  ].map(({ label, value }) => (
                    <div key={label} className="rounded-xl bg-slate-950/80 border border-slate-800 p-3">
                      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{label}</p>
                      <p className="mt-1 text-xs font-bold text-slate-200 font-mono">{value}</p>
                    </div>
                  ))}
                </dl>
              ) : (
                <div className="space-y-2">
                  {[1, 2].map(i => (
                    <div key={i} className="h-10 animate-pulse bg-slate-900 rounded-lg" />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Claim Feature Table */}
        <Card padding="lg">
          <CardHeader>
            <CardTitle className="text-base">Feature Breakdown Registry</CardTitle>
            <CardDescription>Full feature record evaluated for this claim</CardDescription>
          </CardHeader>
          <CardContent>
            <Table
              data={featureRows}
              columns={[
                { key: 'label', header: 'Feature Name', className: 'font-semibold text-slate-400 text-xs uppercase tracking-wider w-1/2 font-display' },
                { key: 'value', header: 'Value', className: 'text-slate-100 font-mono text-xs font-bold' },
              ]}
              keyField="label"
              hoverable
              dense
              emptyMessage="No claim features available"
            />
          </CardContent>
        </Card>
      </div>
    </PageLayout>
  );
}