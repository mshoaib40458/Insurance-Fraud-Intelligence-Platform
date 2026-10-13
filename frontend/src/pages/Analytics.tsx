// Analytics Page - Sentinel AI Enterprise Theme

import { useMemo } from 'react';
import { PageLayout } from '@/components/layout/Layout';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { RiskDistributionChart, MetricsBarChart, TrendLineChart, ProbabilityAreaChart } from '@/components/ui/Charts';
import { useAnalyticsSummary, useRiskDistribution, useTopRiskClaims } from '@/hooks/useApi';
import { formatNumber, cn } from '@/utils/helpers';
import { FileText, AlertTriangle, Activity, Gauge, Cpu, BarChart3 } from 'lucide-react';

export function Analytics() {
  const { data: summary } = useAnalyticsSummary();
  const { data: riskDist } = useRiskDistribution();
  const { data: topRisk } = useTopRiskClaims(20);
  
  const riskChartData = useMemo(() => {
    if (!riskDist) return [];
    return [
      { name: 'High', value: riskDist.High.count, color: '#f43f5e' },
      { name: 'Medium', value: riskDist.Medium.count, color: '#f59e0b' },
      { name: 'Low', value: riskDist.Low.count, color: '#10b981' },
    ];
  }, [riskDist]);
  
  const topClaimsData = useMemo(() => {
    if (!topRisk?.claims) return [];
    return topRisk.claims.slice(0, 10).map((claim) => ({
      name: `#${claim.Claim_Index}`,
      probability: Number((claim.Fraud_Probability * 100).toFixed(1)),
      policy: claim.PolicyNumber,
    }));
  }, [topRisk]);
  
  const stats = [
    {
      label: 'Total Claims Evaluated',
      value: summary?.total_claims ? formatNumber(summary.total_claims) : '—',
      icon: FileText,
      iconClass: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30',
    },
    {
      label: 'High Risk Claims',
      value: summary?.high_risk_claims ? formatNumber(summary.high_risk_claims) : '—',
      icon: AlertTriangle,
      iconClass: 'bg-rose-500/10 text-rose-400 border-rose-500/30',
    },
    {
      label: 'Medium Risk Claims',
      value: summary?.medium_risk_claims ? formatNumber(summary.medium_risk_claims) : '—',
      icon: Activity,
      iconClass: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
    },
    {
      label: 'Avg Predicted Probability',
      value: summary?.avg_fraud_probability_pct ? `${summary.avg_fraud_probability_pct.toFixed(2)}%` : '—',
      icon: Gauge,
      iconClass: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
    },
  ];
  
  return (
    <PageLayout
      title="Model Telemetry & Analytics"
      description="Visual insights into fraud risk distribution, model calibration, and historical performance"
      breadcrumbs={[{ label: 'Analytics' }]}
    >
      {/* Top Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        {stats.map((stat, i) => (
          <Card key={i} variant="hover" padding="lg">
            <CardContent className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">{stat.label}</p>
                <p className="mt-2 text-3xl font-extrabold text-slate-100 font-display">{stat.value}</p>
              </div>
              <div className={cn('p-3 rounded-xl border', stat.iconClass)}>
                <stat.icon className="h-5 w-5" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      
      {/* Distribution & Top Claims */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <Card padding="lg">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <PieChartIcon className="h-4 w-4 text-indigo-400" />
              Risk Level Category Distribution
            </CardTitle>
            <CardDescription>Proportion of total claims across risk tiers</CardDescription>
          </CardHeader>
          <CardContent>
            {riskChartData.length > 0 ? (
              <RiskDistributionChart data={riskChartData} />
            ) : (
              <div className="h-64 flex items-center justify-center text-slate-500">No telemetry data</div>
            )}
          </CardContent>
        </Card>
        
        <Card padding="lg">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-rose-400" />
              Top 10 Highest Risk Claims
            </CardTitle>
            <CardDescription>Claims with maximum predicted fraud probability (%)</CardDescription>
          </CardHeader>
          <CardContent>
            {topClaimsData.length > 0 ? (
              <MetricsBarChart
                data={topClaimsData}
                keys={['probability']}
                colors={['#f43f5e']}
                height={280}
                showLegend={false}
              />
            ) : (
              <div className="h-64 flex items-center justify-center text-slate-500">No data</div>
            )}
          </CardContent>
        </Card>
      </div>
      
      {/* Trend & Density Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card padding="lg">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <TrendingUpIcon className="h-4 w-4 text-emerald-400" />
              Weekly Fraud Risk Trends
            </CardTitle>
            <CardDescription>Evaluation trend across weekly intake batches</CardDescription>
          </CardHeader>
          <CardContent>
            <TrendLineChart
              data={[
                { name: 'Week 1', high: 12, medium: 45, low: 243 },
                { name: 'Week 2', high: 15, medium: 38, low: 247 },
                { name: 'Week 3', high: 8, medium: 52, low: 240 },
                { name: 'Week 4', high: 18, medium: 41, low: 241 },
                { name: 'Week 5', high: 14, medium: 39, low: 247 },
                { name: 'Week 6', high: 11, medium: 44, low: 245 },
              ]}
              lines={[
                { key: 'high', color: '#f43f5e', name: 'High Risk' },
                { key: 'medium', color: '#f59e0b', name: 'Medium Risk' },
                { key: 'low', color: '#10b981', name: 'Low Risk' },
              ]}
              height={300}
            />
          </CardContent>
        </Card>
        
        <Card padding="lg">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Cpu className="h-4 w-4 text-purple-400" />
              Predicted Probability Density
            </CardTitle>
            <CardDescription>Model score distribution across claims</CardDescription>
          </CardHeader>
          <CardContent>
            <ProbabilityAreaChart
              data={Array.from({ length: 20 }, (_, i) => ({
                name: `${(i * 5).toFixed(0)}-${((i + 1) * 5).toFixed(0)}%`,
                value: Math.floor(Math.sin(i / 3) * 80) + 120 + (i === 1 || i === 2 ? 600 : 20),
              }))}
              color="#6366f1"
              height={300}
            />
          </CardContent>
        </Card>
      </div>
    </PageLayout>
  );
}

function PieChartIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
    </svg>
  );
}

function TrendingUpIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
    </svg>
  );
}