import type { EventItem } from '../../hooks/useDashboardData';

interface UpcomingEventsWidgetProps {
  events?: EventItem[] | null;
  loading?: boolean;
  error?: string | null;
  onRetry?: () => void;
}

const TYPE_COLORS: Record<string, string> = {
  exam: '#3b82f6',
  event: '#f59e0b',
  deadline: '#ef4444',
  holiday: '#10b981',
};

export function UpcomingEventsWidget({ events, loading, error, onRetry }: UpcomingEventsWidgetProps) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-3">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-bold text-gray-800">📅 Upcoming Events</span>
      </div>

      {loading && (
        <div className="space-y-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-10 bg-gray-100 rounded animate-pulse" />
          ))}
        </div>
      )}

      {error && (
        <div className="text-center py-4">
          <p className="text-red-400 text-xs">⚠ Could not load events</p>
          {onRetry && <button onClick={onRetry} className="mt-1 text-xs text-blue-600 underline">Retry</button>}
        </div>
      )}

      {!loading && !error && (!events || events.length === 0) && (
        <div className="flex items-center justify-center py-6">
          <p className="text-gray-400 text-xs italic">No upcoming events scheduled.</p>
        </div>
      )}

      {!loading && !error && events && events.length > 0 && (
        <div className="space-y-2">
          {events.slice(0, 4).map(event => {
            const eventDate = new Date(event.date);
            const color = event.color || TYPE_COLORS[event.type] || '#6b7280';
            return (
              <div key={event.id} className="flex items-center gap-2">
                <div
                  className="w-10 h-10 rounded flex flex-col items-center justify-center flex-shrink-0 text-white text-[9px] font-bold leading-tight"
                  style={{ backgroundColor: color }}
                >
                  <span>{eventDate.getDate()}</span>
                  <span>{eventDate.toLocaleDateString('en-US', { month: 'short' })}</span>
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-semibold text-gray-800 leading-snug truncate">
                    {event.title}
                  </div>
                  <span
                    className="inline-block text-[9px] px-1.5 py-0.5 rounded-full mt-0.5 text-white"
                    style={{ backgroundColor: color }}
                  >
                    {event.type}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
