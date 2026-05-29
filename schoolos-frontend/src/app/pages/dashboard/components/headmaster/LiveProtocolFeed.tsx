import { useEffect, useRef } from 'react';
import type { ActivityItem } from '../../hooks/useDashboardData';

interface LiveProtocolFeedProps {
  activities?: ActivityItem[] | null;
  loading?: boolean;
  error?: string | null;
  onRetry?: () => void;
}

export function LiveProtocolFeed({ activities, loading, error, onRetry }: LiveProtocolFeedProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const visibleActivities = (activities || []).slice(0, 8);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = 0;
    }
  }, [activities]);

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-3 h-full flex flex-col">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-bold text-gray-800">⚡ Live Protocol</span>
        <span className="text-[9px] font-bold uppercase px-1.5 py-0.5 rounded-full bg-green-500 text-white">
          APPS
        </span>
      </div>

      {loading && (
        <div className="flex-1 space-y-2 py-1">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="flex gap-2 animate-pulse">
              <div className="w-0.5 h-10 bg-gray-200 rounded" />
              <div className="flex-1 space-y-1">
                <div className="h-2.5 w-12 bg-gray-200 rounded" />
                <div className="h-3 w-full bg-gray-100 rounded" />
              </div>
            </div>
          ))}
        </div>
      )}

      {error && (
        <div className="flex-1 flex items-center justify-center">
          <p className="text-red-400 text-xs">⚠ Could not load activity</p>
          {onRetry && <button onClick={onRetry} className="ml-1 text-xs text-blue-600 underline">Retry</button>}
        </div>
      )}

      {!loading && !error && visibleActivities.length === 0 && (
        <div className="flex-1 flex items-center justify-center">
          <p className="text-gray-400 text-xs italic">No activity recorded today</p>
        </div>
      )}

      {!loading && !error && visibleActivities.length > 0 && (
        <div ref={scrollRef} className="flex-1 overflow-y-auto space-y-1.5 custom-scrollbar pr-1" style={{ maxHeight: 280 }}>
          {visibleActivities.map(item => (
            <div key={item.id} className="flex gap-2">
              <div className="w-0.5 rounded flex-shrink-0" style={{ backgroundColor: item.color }} />
              <div className="min-w-0">
                <div
                  className="text-[10px] text-gray-400 leading-none mb-0.5"
                  style={{ fontFamily: "'DM Mono', monospace" }}
                >
                  {item.timestamp || '--:--:--'}
                </div>
                <div className="text-xs text-gray-700 leading-snug line-clamp-2">
                  {item.text}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {!loading && !error && (activities?.length || 0) > 8 && (
        <a
          href="/dashboard/audit-logs"
          className="block text-center text-[10px] text-blue-600 hover:text-blue-800 mt-2 pt-1.5 border-t border-gray-100"
        >
          View Full Log →
        </a>
      )}

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 3px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #e5e7eb; border-radius: 3px; }
      `}</style>
    </div>
  );
}
