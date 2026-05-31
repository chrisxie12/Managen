import type { AlertData } from '../../hooks/useDashboardData';

interface AlertBannersProps {
  alerts?: AlertData[] | null;
  loading?: boolean;
  onRetry?: () => void;
}

export function AlertBanners({ alerts, loading }: AlertBannersProps) {
  if (loading) {
    return <div className="h-8 bg-gray-200 rounded animate-pulse mb-4" />;
  }

  if (!alerts || alerts.length === 0) return null;

  const colorMap = {
    critical: { bg: '#fef2f2', border: '#fecaca', text: '#991b1b', dot: '#ef4444' },
    warning: { bg: '#fffbeb', border: '#fde68a', text: '#92400e', dot: '#f59e0b' },
    info: { bg: '#eff6ff', border: '#bfdbfe', text: '#1e40af', dot: '#3b82f6' },
  };

  return (
    <div className="space-y-1.5 mb-4">
      {alerts.map((alert, i) => {
        const c = colorMap[alert.type];
        return (
          <div
            key={i}
            className="flex items-center gap-2 px-3 py-1.5 rounded-md text-xs"
            style={{ backgroundColor: c.bg, borderLeft: `3px solid ${c.dot}`, color: c.text }}
          >
            <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: c.dot }} />
            <span className="flex-1">{alert.message}</span>
            {alert.cta && (
              <a href={alert.ctaLink} className="font-semibold underline flex-shrink-0" style={{ color: c.text }}>
                {alert.cta}
              </a>
            )}
          </div>
        );
      })}
    </div>
  );
}
