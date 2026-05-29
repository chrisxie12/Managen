import { formatShortDate } from '../../../../utils/formatters';
import type { BirthdayItem } from '../../hooks/useDashboardData';

interface BirthdaysWidgetProps {
  birthdays?: BirthdayItem[] | null;
  loading?: boolean;
  error?: string | null;
  onRetry?: () => void;
}

export function BirthdaysWidget({ birthdays, loading, error, onRetry }: BirthdaysWidgetProps) {
  const today = new Date();
  const todayStr = formatShortDate(today);

  return (
    <div className="bg-card rounded-lg border border-border p-3">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-bold text-foreground">🎂 Birthdays</span>
      </div>

      {loading && (
        <div className="space-y-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex items-center gap-2 animate-pulse">
              <div className="w-8 h-8 rounded-full bg-muted" />
              <div className="flex-1 space-y-1">
                <div className="h-3 w-24 bg-muted rounded" />
                <div className="h-2 w-16 bg-gray-100 rounded" />
              </div>
            </div>
          ))}
        </div>
      )}

      {error && (
        <div className="text-center py-4">
          <p className="text-red-400 text-xs">⚠ Could not load birthdays</p>
          {onRetry && <button onClick={onRetry} className="mt-1 text-xs text-blue-600 underline">Retry</button>}
        </div>
      )}

      {!loading && !error && (!birthdays || birthdays.length === 0) && (
        <div className="flex items-center justify-center py-6">
          <p className="text-muted-foreground text-xs italic">No birthdays this week 🎉</p>
        </div>
      )}

      {!loading && !error && birthdays && birthdays.length > 0 && (
        <div className="space-y-2">
          {birthdays.map(b => (
            <div
              key={b.id}
              className={`flex items-center gap-2 p-1.5 rounded-md ${
                b.isToday ? 'bg-amber-50 border border-amber-200' : ''
              }`}
            >
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                style={{ backgroundColor: b.avatarColor }}
              >
                {b.name.charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-xs font-bold text-foreground truncate">{b.name}</div>
                <div className="text-[9px] text-muted-foreground truncate">
                  {b.className} • {b.admissionNumber}
                </div>
              </div>
              <span
                className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full flex-shrink-0 ${
                  b.isToday
                    ? 'bg-red-500 text-white'
                    : 'bg-muted text-muted-foreground'
                }`}
                style={{ fontFamily: "'DM Mono', monospace" }}
              >
                {formatShortDate(b.birthdayThisYear)}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
