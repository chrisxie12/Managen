import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import type { FinancialDay } from '../../hooks/useDashboardData';
import { formatCurrency } from '../../../../utils/formatters';

interface FinancialPerformanceChartProps {
  data?: FinancialDay[] | null;
  loading?: boolean;
  error?: string | null;
  range: number;
  onRangeChange: (days: number) => void;
  onRetry?: () => void;
}

const RANGES = [7, 15, 25, 30] as const;

export function FinancialPerformanceChart({
  data,
  loading,
  error,
  range,
  onRangeChange,
  onRetry,
}: FinancialPerformanceChartProps) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold text-gray-800">📊 Financial Performance</span>
          <span className="text-[10px] text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
            Last {range} days
          </span>
        </div>
        <div className="flex items-center gap-1">
          {RANGES.map(d => (
            <button
              key={d}
              onClick={() => onRangeChange(d)}
              className={`text-[10px] px-2 py-1 rounded-md transition-colors ${
                range === d
                  ? 'bg-indigo-500 text-white font-medium'
                  : 'text-gray-500 hover:bg-gray-100'
              }`}
            >
              {d}d
            </button>
          ))}
        </div>
      </div>

      {loading && (
        <div className="h-[280px] bg-gray-100 rounded-lg animate-pulse" />
      )}

      {error && (
        <div className="h-[280px] flex items-center justify-center bg-gray-50 rounded-lg">
          <div className="text-center">
            <p className="text-red-400 text-sm">⚠ Could not load chart</p>
            <button onClick={onRetry} className="mt-1 text-xs text-blue-600 underline">Retry</button>
          </div>
        </div>
      )}

      {!loading && !error && data && data.length > 0 && (
        <>
          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="incomeGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0.01} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 9, fill: '#9ca3af' }}
                  tickLine={false}
                  axisLine={false}
                  angle={-45}
                  textAnchor="end"
                  height={50}
                  tickFormatter={val => {
                    const d = new Date(val);
                    return `${d.getDate()}/${d.getMonth() + 1}`;
                  }}
                  interval={4}
                />
                <YAxis
                  tick={{ fontSize: 9, fill: '#9ca3af' }}
                  tickLine={false}
                  axisLine={false}
                  width={50}
                  tickFormatter={val => `GHS${val >= 1000 ? `${(val / 1000).toFixed(0)}k` : val}`}
                />
                <Tooltip
                  contentStyle={{
                    fontSize: 11,
                    fontFamily: "'DM Mono', monospace",
                    borderRadius: 6,
                    border: '1px solid #e5e7eb',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                  }}
                  formatter={(value: number) => [formatCurrency(value), 'Income Collection']}
                  labelFormatter={label => new Date(label).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                />
                <Area
                  type="monotone"
                  dataKey="collected"
                  stroke="#6366f1"
                  strokeWidth={2}
                  fill="url(#incomeGradient)"
                  dot={false}
                  activeDot={{ r: 3, fill: '#6366f1', stroke: 'white', strokeWidth: 2 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="flex items-center gap-1.5 mt-2 text-[10px] text-gray-500">
            <span className="inline-block w-4 h-0.5 bg-indigo-500 rounded" />
            Income Collection
          </div>
        </>
      )}

      {!loading && !error && data && data.length === 0 && (
        <div className="h-[280px] flex items-center justify-center bg-gray-50 rounded-lg">
          <p className="text-gray-400 text-sm italic">No financial data available</p>
        </div>
      )}
    </div>
  );
}
