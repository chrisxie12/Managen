import type { AnnouncementItem } from '../../hooks/useDashboardData';
import { formatDate } from '../../../../utils/formatters';

interface OfficialNoticesWidgetProps {
  notices?: AnnouncementItem[] | null;
  loading?: boolean;
  error?: string | null;
  onRetry?: () => void;
}

export function OfficialNoticesWidget({ notices, loading, error, onRetry }: OfficialNoticesWidgetProps) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-3">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-bold text-gray-800">📢 Official Notices</span>
      </div>

      {loading && (
        <div className="space-y-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="h-3 w-full bg-gray-200 rounded mb-1" />
              <div className="h-2 w-20 bg-gray-100 rounded" />
            </div>
          ))}
        </div>
      )}

      {error && (
        <div className="text-center py-4">
          <p className="text-red-400 text-xs">⚠ Could not load notices</p>
          {onRetry && <button onClick={onRetry} className="mt-1 text-xs text-blue-600 underline">Retry</button>}
        </div>
      )}

      {!loading && !error && (!notices || notices.length === 0) && (
        <div className="flex items-center justify-center py-6">
          <p className="text-gray-400 text-xs italic">No notices published yet</p>
        </div>
      )}

      {!loading && !error && notices && notices.length > 0 && (
        <div className="space-y-2.5">
          {notices.slice(0, 3).map(notice => (
            <div key={notice.id}>
              <div className="text-xs font-bold text-gray-800 leading-snug line-clamp-2">
                {notice.title}
              </div>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="text-[9px] text-gray-400">
                  {notice.date ? formatDate(notice.date, { month: 'short', day: 'numeric', year: 'numeric' }) : ''}
                </span>
                <span className="text-[9px] font-medium px-1.5 py-0.5 rounded-full bg-gray-100 text-gray-500">
                  {notice.type || 'notice'}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
