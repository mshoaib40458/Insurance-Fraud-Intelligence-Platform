// Chart Components using Recharts - Dark Glass Styling

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  AreaChart,
  Area,
} from 'recharts';

interface RiskDistributionData {
  name: string;
  value: number;
  color: string;
}

export function RiskDistributionChart({ data }: { data: RiskDistributionData[] }) {
  const COLORS = {
    High: '#f43f5e',
    Medium: '#f59e0b',
    Low: '#10b981',
  };
  
  return (
    <div className="w-full h-64">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={65}
            outerRadius={95}
            paddingAngle={4}
            dataKey="value"
            nameKey="name"
            stroke="none"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[entry.name as keyof typeof COLORS] || entry.color} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              backgroundColor: 'rgba(15, 23, 42, 0.95)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '12px',
              boxShadow: '0 10px 30px -5px rgba(0, 0, 0, 0.5)',
              color: '#f8fafc',
              padding: '10px 14px',
            }}
            itemStyle={{ color: '#f8fafc', fontWeight: 600 }}
          />
          <Legend
            layout="horizontal"
            align="center"
            verticalAlign="bottom"
            iconType="circle"
            iconSize={8}
            wrapperStyle={{ paddingTop: 16, color: '#94a3b8', fontSize: '12px' }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

interface BarChartData {
  name: string;
  [key: string]: string | number;
}

interface BarChartProps {
  data: BarChartData[];
  keys: string[];
  colors?: string[];
  height?: number;
  showLegend?: boolean;
  yAxisLabel?: string;
}

export function MetricsBarChart({ 
  data, 
  keys, 
  colors = ['#6366f1', '#4f46e5', '#10b981', '#f59e0b', '#f43f5e', '#a855f7'],
  height = 300,
  showLegend = true,
}: BarChartProps) {
  return (
    <div className="w-full" style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} layout="vertical" margin={{ top: 10, right: 30, left: 10, bottom: 10 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.05)" vertical={false} />
          <XAxis 
            type="number" 
            tick={{ fontSize: 11, fill: '#64748b' }}
            axisLine={{ stroke: 'rgba(255, 255, 255, 0.08)' }}
            tickLine={false}
          />
          <YAxis 
            dataKey="name" 
            type="category" 
            width={90}
            tick={{ fontSize: 11, fill: '#94a3b8' }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: 'rgba(15, 23, 42, 0.95)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '12px',
              boxShadow: '0 10px 30px -5px rgba(0, 0, 0, 0.5)',
              color: '#f8fafc',
            }}
            formatter={(value: number) => [value.toLocaleString(), 'Probability (%)']}
          />
          {showLegend && (
            <Legend
              layout="horizontal"
              align="center"
              verticalAlign="top"
              iconType="circle"
              iconSize={8}
              wrapperStyle={{ paddingTop: 10, color: '#94a3b8' }}
            />
          )}
          {keys.map((key, index) => (
            <Bar
              key={key}
              dataKey={key}
              fill={colors[index % colors.length]}
              radius={[0, 6, 6, 0]}
              maxBarSize={24}
            />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

interface LineChartData {
  name: string;
  [key: string]: string | number;
}

interface LineChartProps {
  data: LineChartData[];
  lines: { key: string; color: string; name: string }[];
  height?: number;
  xAxisKey?: string;
}

export function TrendLineChart({ 
  data, 
  lines, 
  height = 300,
  xAxisKey = 'name',
}: LineChartProps) {
  return (
    <div className="w-full" style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 10, right: 30, left: 10, bottom: 10 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.05)" />
          <XAxis 
            dataKey={xAxisKey} 
            tick={{ fontSize: 11, fill: '#64748b' }}
            axisLine={{ stroke: 'rgba(255, 255, 255, 0.08)' }}
            tickLine={false}
          />
          <YAxis 
            tick={{ fontSize: 11, fill: '#64748b' }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: 'rgba(15, 23, 42, 0.95)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '12px',
              boxShadow: '0 10px 30px -5px rgba(0, 0, 0, 0.5)',
              color: '#f8fafc',
            }}
          />
          <Legend
            layout="horizontal"
            align="center"
            verticalAlign="top"
            iconType="circle"
            iconSize={8}
            wrapperStyle={{ paddingTop: 10, color: '#94a3b8' }}
          />
          {lines.map((line) => (
            <Line
              key={line.key}
              type="monotone"
              dataKey={line.key}
              stroke={line.color}
              strokeWidth={2.5}
              dot={{ r: 3, fill: line.color, strokeWidth: 0 }}
              activeDot={{ r: 6, strokeWidth: 2, stroke: '#ffffff' }}
              name={line.name}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

interface AreaChartData {
  name: string;
  value: number;
}

interface AreaChartProps {
  data: AreaChartData[];
  color?: string;
  height?: number;
}

export function ProbabilityAreaChart({ data, color = '#6366f1', height = 250 }: AreaChartProps) {
  return (
    <div className="w-full" style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 10, left: 10, bottom: 10 }}>
          <defs>
            <linearGradient id={`color-${color.replace('#', '')}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={color} stopOpacity={0.4} />
              <stop offset="95%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.05)" vertical={false} />
          <XAxis 
            dataKey="name" 
            tick={{ fontSize: 10, fill: '#64748b' }}
            axisLine={{ stroke: 'rgba(255, 255, 255, 0.08)' }}
            tickLine={false}
          />
          <YAxis 
            tick={{ fontSize: 10, fill: '#64748b' }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: 'rgba(15, 23, 42, 0.95)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '12px',
              boxShadow: '0 10px 30px -5px rgba(0, 0, 0, 0.5)',
              color: '#f8fafc',
            }}
            formatter={(value: number) => [value.toFixed(0), 'Claims Count']}
          />
          <Area
            type="monotone"
            dataKey="value"
            stroke={color}
            strokeWidth={2.5}
            fillOpacity={1}
            fill={`url(#color-${color.replace('#', '')})`}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
