import type { StatsData } from '../../hooks/useDashboardData';
import { formatCurrency } from '../../../../utils/formatters';

interface KpiCardsProps {
  stats?: StatsData | null;
  loading?: boolean;
  error?: string | null;
  onRetry?: () => void;
}

const CARD_CONFIG = [
  {
    bg: '#0891b2',
    label: 'TOTAL STUDENTS',
    valueKey: (s: StatsData) => s.students.total.toLocaleString(),
    icon: '🎓',
    subtitleKey: (s: StatsData) => `+${s.students.newThisTerm} this term`,
    href: '/dashboard/students',
  },
  {
    bg: '#3b82f6',
    label: 'TOTAL STAFF',
    valueKey: (s: StatsData) => s.staff.total.toLocaleString(),
    icon: '👤',
    subtitleKey: (s: StatsData) => `${s.staff.active} active`,
    href: '/dashboard/staff',
  },
  {
    bg: '#f97316',
    label: 'ATTENDANCE',
    valueKey: (s: StatsData) => `${s.attendance.rate}%`,
    icon: '📅',
    subtitleKey: (s: StatsData) => `${s.attendance.present} present today`,
    href: '/dashboard/attendance',
  },
  {
    bg: '#16a34a',
    label: 'COLLECTED',
    valueKey: (s: StatsData) => formatCurrency(s.fees.collectedThisMonth),
    icon: '💰',
    subtitleKey: () => 'this month',
    badge: { text: 'live', color: '#dc2626', pulsing: true },
    href: '/dashboard/finance',
  },
  {
    bg: '#991b1b',
    label: 'FEES DUE',
    valueKey: (s: StatsData) => formatCurrency(s.fees.totalOutstanding),
    icon: '⚠️',
    subtitleKey: (s: StatsData) => `${s.fees.defaulters} students`,
    badge: (s: StatsData) => s.fees.defaulters > 20 ? { text: 'CRITICAL', color: '#dc2626' } : undefined,
    href: '/dashboard/finance/defaulters',
  },
  {
    bg: '#7c3aed',
    label: 'INCOME',
    valueKey: (s: StatsData) => formatCurrency(s.income.thisMonth),
    icon: '📈',
    subtitleKey: () => 'non-fee income',
    href: '/dashboard/accounts/income',
  },
  {
    bg: '#92400e',
    label: 'LEAVES',
    valueKey: (s: StatsData) => s.leaves.pendingToday.toLocaleString(),
    icon: '🗓️',
    subtitleKey: (s: StatsData) => `${s.leaves.pendingApprovals} pending`,
    href: '/dashboard/hr/leave',
  },
  {
    bg: '#0f766e',
    label: 'CAPACITY',
    valueKey: (s: StatsData) => `${s.capacity.percent}%`,
    icon: '📊',
    subtitleKey: (s: StatsData) => `${s.capacity.enrolled}/${s.capacity.total} enrolled`,
    href: '/dashboard/settings/school',
  },
] as const;

export function KpiCards({ stats, loading, error, onRetry }: KpiCardsProps) {
  if (error) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3 mb-6">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="rounded-lg p-4 bg-red-50 flex items-center justify-center min-h-[110px]">
            <div className="text-center">
              <span className="text-red-400 text-lg">—</span>
              <button onClick={onRetry} className="block mt-1 text-[9px] text-blue-600 underline mx-auto">
                Retry
              </button>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3 mb-6">
      {CARD_CONFIG.map(card => {
        const badge = stats && 'badge' in card && typeof card.badge === 'function'
          ? card.badge(stats)
          : 'badge' in card ? (card.badge as any) : undefined;

        return (
          <div key={card.label}
            className="rounded-xl p-3 flex flex-col justify-between min-h-[100px] cursor-pointer hover:opacity-90 transition-opacity"
            style={{ background: card.bg }}
            onClick={() => window.location.href = card.href}
          >
            <div className="flex items-start justify-between">
              <span className="text-lg">{card.icon}</span>
              {badge && (
                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-white/20 text-white">
                  {(badge as any).text}
                </span>
              )}
            </div>
            <div>
              <p className="text-lg font-bold text-white leading-tight">
                {loading ? <span className="opacity-50">…</span> : (stats ? card.valueKey(stats) : '—')}
              </p>
              <p className="text-[10px] font-semibold text-white/80 uppercase tracking-wide mt-0.5">{card.label}</p>
              {stats && (
                <p className="text-[10px] text-white/60 mt-0.5">{card.subtitleKey(stats)}</p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
