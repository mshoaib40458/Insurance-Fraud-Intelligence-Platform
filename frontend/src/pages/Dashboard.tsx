// Dashboard Page - Sentinel AI Enterprise Theme

import { useMemo, useState } from 'react';
import { 
  AlertTriangle, 
  FileText, 
  Activity,
  ArrowUpRight,
  Gauge,
  Sparkles,
  Zap,
} from 'lucide-react';
import { PageLayout } from '@/components/layout/Layout';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { RiskDistributionChart } from '@/components/ui/Charts';
import { useAnalyticsSummary, useRiskDistribution, useModelInfo } from '@/hooks/useApi';
import { formatNumber, formatPercentage, cn } from '@/utils/helpers';
import { predictSingle } from '@/services/api';

const riskBadgeBorder = {
  High: 'border-rose-500/30 bg-rose-500/10 text-rose-300',
  Medium: 'border-amber-500/30 bg-amber-500/10 text-amber-300',
  Low: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300',
};

function mapAgeToCategory(age: number): string {
  if (age <= 17) return '16 to 17';
  if (age <= 20) return '18 to 20';
  if (age <= 25) return '21 to 25';
  if (age <= 30) return '26 to 30';
  if (age <= 35) return '31 to 35';
  if (age <= 40) return '36 to 40';
  if (age <= 50) return '41 to 50';
  if (age <= 65) return '51 to 65';
  return 'over 65';
}

export function Dashboard() {
  const { data: summary } = useAnalyticsSummary();
  const { data: riskDist, isLoading: riskDistLoading } = useRiskDistribution();
  const { data: modelInfo } = useModelInfo();

  // Quick Simulator State with full risk feature controls
  const [simForm, setSimForm] = useState({
    Age: 18,
    BasePolicy: 'All Perils',
    Days_Policy_Accident: 'none',
    Fault: 'Policy Holder',
    PastNumberOfClaims: 'more than 4',
    PoliceReportFiled: 'No',
    Deductible: 300,
    VehicleCategory: 'Sedan',
  });
  const [simResult, setSimResult] = useState<{ fraud_probability: number; risk_level: string; prediction: number } | null>(null);
  const [simLoading, setSimLoading] = useState(false);

  const handleSimulate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSimLoading(true);
    try {
      const ageVal = Number(simForm.Age);
      const fullClaimData = {
        Month: "Jan",
        WeekOfMonth: 3,
        DayOfWeek: "Monday",
        Make: "Honda",
        AccidentArea: "Urban",
        DayOfWeekClaimed: "Monday",
        MonthClaimed: "Jan",
        WeekOfMonthClaimed: 3,
        Sex: "Male",
        MaritalStatus: "Single",
        PolicyType: `${simForm.VehicleCategory} - ${simForm.BasePolicy}`,
        VehiclePrice: "20000 to 29000",
        RepNumber: 5,
        DriverRating: 4,
        Days_Policy_Accident: simForm.Days_Policy_Accident,
        Days_Policy_Claim: "more than 30",
        AgeOfVehicle: "new",
        AgeOfPolicyHolder: mapAgeToCategory(ageVal),
        PoliceReportFiled: simForm.PoliceReportFiled,
        WitnessPresent: "No",
        AgentType: "External",
        NumberOfSuppliments: "none",
        AddressChange_Claim: "no change",
        NumberOfCars: "1 vehicle",
        Year: 1994,
        BasePolicy: simForm.BasePolicy,
        Age: ageVal,
        Deductible: Number(simForm.Deductible),
        PastNumberOfClaims: simForm.PastNumberOfClaims,
        Fault: simForm.Fault,
        VehicleCategory: simForm.VehicleCategory,
      };
      const res = await predictSingle(fullClaimData);
      setSimResult(res.data);
    } catch (err) {
      console.error('Simulation error:', err);
    } finally {
      setSimLoading(false);
    }
  };

  const riskChartData = useMemo(() => {
    if (!riskDist) return [];
    return [
      { name: 'High', value: riskDist.High.count, color: '#f43f5e' },
      { name: 'Medium', value: riskDist.Medium.count, color: '#f59e0b' },
      { name: 'Low', value: riskDist.Low.count, color: '#10b981' },
    ];
  }, [riskDist]);

  const metrics = [
    {
      label: 'Total Claims Evaluated',
      value: summary?.total_claims ? formatNumber(summary.total_claims) : '—',
      sub: `${summary?.high_risk_claims ?? 0} high-risk flagged`,
      icon: FileText,
      glow: 'shadow-glow-primary',
      iconBg: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30',
    },
    {
      label: 'High Fraud Risk Flagged',
      value: summary?.high_risk_claims ? formatNumber(summary.high_risk_claims) : '—',
      sub: `Brier Score ${modelInfo?.brier_score_after?.toFixed(3) ?? '0.050'}`,
      icon: AlertTriangle,
      glow: 'shadow-glow-rose',
      iconBg: 'bg-rose-500/10 text-rose-400 border-rose-500/30',
    },
    {
      label: 'Medium Fraud Risk',
      value: summary?.medium_risk_claims ? formatNumber(summary.medium_risk_claims) : '—',
      sub: `${riskDist?.Medium.percentage.toFixed(1) ?? '—'}% of total dataset`,
      icon: Activity,
      glow: 'shadow-glow-amber',
      iconBg: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
    },
    {
      label: 'Average Fraud Probability',
      value: summary?.avg_fraud_probability_pct ? `${summary.avg_fraud_probability_pct.toFixed(2)}%` : '—',
      sub: `Decision Threshold ${summary?.threshold ? formatPercentage(summary.threshold, 0) : '10%'}`,
      icon: Gauge,
      glow: 'shadow-glow-emerald',
      iconBg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
    },
  ];

  return (
    <PageLayout
      title="Fraud Risk Intelligence"
      description="Real-time machine learning predictions and risk telemetry dashboard"
    >
      {/* Hero KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5 mb-8">
        {metrics.map((metric, index) => (
          <Card key={index} variant="hover" padding="lg" className="relative overflow-hidden group">
            <div className="flex items-start justify-between">
              <div className={cn('p-3 rounded-xl border', metric.iconBg)}>
                <metric.icon className="h-5 w-5" aria-hidden="true" />
              </div>
              <div className="p-1 rounded-lg bg-slate-800/60 text-slate-500 group-hover:text-indigo-400 transition-colors">
                <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
              </div>
            </div>
            <p className="mt-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">{metric.label}</p>
            <p className="mt-1 text-3xl font-extrabold text-slate-100 font-display tracking-tight">{metric.value}</p>
            <p className="mt-2 text-xs text-slate-500 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 inline-block" />
              {metric.sub}
            </p>
          </Card>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Risk Level Distribution Pie Chart */}
        <Card className="lg:col-span-2" padding="lg">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg">Risk Category Breakdown</CardTitle>
                <CardDescription>Claims categorized by model predicted fraud risk level</CardDescription>
              </div>
              <Badge variant="success" dot>Live Model</Badge>
            </div>
          </CardHeader>
          <CardContent>
            {riskDistLoading ? (
              <div className="h-64 flex items-center justify-center">
                <div className="flex items-center gap-2 text-slate-400">
                  <div className="w-5 h-5 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                  <span>Loading distribution telemetry...</span>
                </div>
              </div>
            ) : riskChartData.length > 0 ? (
              <RiskDistributionChart data={riskChartData} />
            ) : (
              <div className="h-64 flex items-center justify-center text-slate-500">No telemetry data</div>
            )}
            <div className="mt-6 grid grid-cols-3 gap-4">
              {riskDist && [
                { level: 'High' as const, count: riskDist.High.count, pct: riskDist.High.percentage },
                { level: 'Medium' as const, count: riskDist.Medium.count, pct: riskDist.Medium.percentage },
                { level: 'Low' as const, count: riskDist.Low.count, pct: riskDist.Low.percentage },
              ].map(({ level, count, pct }) => (
                <div key={level} className={cn('rounded-xl border p-4 backdrop-blur-md', riskBadgeBorder[level])}>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider">{level} Risk</span>
                    <span className="text-xs font-mono font-bold">{pct.toFixed(1)}%</span>
                  </div>
                  <p className="mt-2 text-2xl font-extrabold font-display">{formatNumber(count)}</p>
                  <p className="text-[11px] opacity-75">claims flagged</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Live Fraud Risk Simulator */}
        <Card padding="lg" className="border-indigo-500/30 bg-gradient-to-b from-slate-900/90 to-indigo-950/20">
          <CardHeader>
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/30">
                <Zap className="h-4 w-4" />
              </div>
              <div>
                <CardTitle className="text-base">Real-time Predictor</CardTitle>
                <CardDescription>Simulate instant AI fraud score</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSimulate} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <Input
                  label="Age"
                  type="number"
                  value={simForm.Age}
                  onChange={(e) => setSimForm(prev => ({ ...prev, Age: Number(e.target.value) }))}
                />
                <Input
                  label="Deductible ($)"
                  type="number"
                  value={simForm.Deductible}
                  onChange={(e) => setSimForm(prev => ({ ...prev, Deductible: Number(e.target.value) }))}
                />
              </div>

              <Select
                label="Base Policy Type"
                options={[
                  { value: 'All Perils', label: 'All Perils (High Risk)' },
                  { value: 'Collision', label: 'Collision' },
                  { value: 'Liability', label: 'Liability (Low Risk)' },
                ]}
                value={simForm.BasePolicy}
                onChange={(e) => setSimForm(prev => ({ ...prev, BasePolicy: e.target.value }))}
              />

              <Select
                label="Days Policy to Accident"
                options={[
                  { value: 'none', label: 'Immediate / None (Suspicious)' },
                  { value: '1 to 7', label: '1 to 7 days' },
                  { value: '8 to 15', label: '8 to 15 days' },
                  { value: '15 to 30', label: '15 to 30 days' },
                  { value: 'more than 30', label: 'More than 30 days (Normal)' },
                ]}
                value={simForm.Days_Policy_Accident}
                onChange={(e) => setSimForm(prev => ({ ...prev, Days_Policy_Accident: e.target.value }))}
              />

              <div className="grid grid-cols-2 gap-3">
                <Select
                  label="Fault"
                  options={[
                    { value: 'Policy Holder', label: 'Policy Holder' },
                    { value: 'Third Party', label: 'Third Party' },
                  ]}
                  value={simForm.Fault}
                  onChange={(e) => setSimForm(prev => ({ ...prev, Fault: e.target.value }))}
                />

                <Select
                  label="Police Report"
                  options={[
                    { value: 'No', label: 'No Report' },
                    { value: 'Yes', label: 'Filed' },
                  ]}
                  value={simForm.PoliceReportFiled}
                  onChange={(e) => setSimForm(prev => ({ ...prev, PoliceReportFiled: e.target.value }))}
                />
              </div>

              <Select
                label="Past Claims"
                options={[
                  { value: 'none', label: 'None' },
                  { value: '1', label: '1 claim' },
                  { value: '2 to 4', label: '2 to 4 claims' },
                  { value: 'more than 4', label: 'More than 4 claims' },
                ]}
                value={simForm.PastNumberOfClaims}
                onChange={(e) => setSimForm(prev => ({ ...prev, PastNumberOfClaims: e.target.value }))}
              />
              
              <Button type="submit" variant="primary" loading={simLoading} className="w-full mt-2">
                <Sparkles className="h-4 w-4" />
                Run AI Prediction
              </Button>
            </form>

            {simResult && (
              <div className="mt-4 p-4 rounded-xl bg-slate-950/80 border border-indigo-500/40 animate-fade-in">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-slate-400 font-semibold uppercase">Risk Level Score</span>
                  <Badge variant="risk">{simResult.risk_level as 'Low' | 'Medium' | 'High'}</Badge>
                </div>
                <div className="text-2xl font-extrabold text-white font-mono">
                  {formatPercentage(simResult.fraud_probability)}
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  Model AI Verdict: <span className="font-bold text-slate-100">{simResult.prediction === 1 ? '⚠️ Flagged Fraud' : '✅ Legitimate Claim'}</span>
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </PageLayout>
  );
}
