import { useState, useCallback } from 'react';
import { SmartFeeReminders } from './SmartFeeReminders';
import useDashboardData from './dashboard/hooks/useDashboardData';
import { DashboardSidebar } from './dashboard/components/headmaster/DashboardSidebar';
import { DashboardTopbar } from './dashboard/components/headmaster/DashboardTopbar';
import { GreetingBar } from './dashboard/components/headmaster/GreetingBar';
import { AlertBanners } from './dashboard/components/headmaster/AlertBanners';
import { KpiCards } from './dashboard/components/headmaster/KpiCards';
import { FinancialPerformanceChart } from './dashboard/components/headmaster/FinancialPerformanceChart';
import { LiveProtocolFeed } from './dashboard/components/headmaster/LiveProtocolFeed';
import { UpcomingEventsWidget } from './dashboard/components/headmaster/UpcomingEventsWidget';
import { BirthdaysWidget } from './dashboard/components/headmaster/BirthdaysWidget';
import { OfficialNoticesWidget } from './dashboard/components/headmaster/OfficialNoticesWidget';
import { QuickActionsGrid } from './dashboard/components/headmaster/QuickActionsGrid';

export function HeadmasterDashboard() {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [feeRemindersOpen, setFeeRemindersOpen] = useState(false);
  const {
    data,
    errors,
    loading,
    financialRange,
    setFinancialRange,
    refetch,
  } = useDashboardData();

  const {
    stats,
    alerts,
    financialPerformance,
    activity,
    birthdays,
    events,
    announcements,
  } = data;

  const toggleSidebar = useCallback(() => setSidebarOpen(prev => !prev), []);
  const criticalCount = (alerts || []).filter(a => a.type === 'critical').length;
  const warningCount = (alerts || []).filter(a => a.type === 'warning').length;
  const totalUnreadAlerts = criticalCount + warningCount;
  const overdueFeesCount = stats?.fees?.defaulters || 0;

  return (
    <div className="min-h-screen bg-[#f4f6f8]">
      <DashboardSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="lg:pl-[240px]">
        <DashboardTopbar
          onToggleSidebar={toggleSidebar}
          unreadAlerts={totalUnreadAlerts}
          overdueFeesCount={overdueFeesCount}
        />

        <main className="p-4 lg:p-6 max-w-[1400px]">
          <GreetingBar
            alerts={alerts}
            alertLoading={loading.alerts}
            onRetryAlerts={() => {
              refetch();
            }}
          />

          <AlertBanners
            alerts={alerts}
            loading={loading.alerts}
            onRetry={() => refetch()}
          />

          <KpiCards
            stats={stats}
            loading={loading.stats}
            error={errors.stats}
            onRetry={() => refetch()}
          />

          <div className="grid grid-cols-1 lg:grid-cols-[3fr_1fr_1fr] gap-4 mb-6">
            <FinancialPerformanceChart
              data={financialPerformance}
              loading={loading.financialPerformance}
              error={errors.financialPerformance}
              range={financialRange}
              onRangeChange={setFinancialRange}
              onRetry={() => refetch()}
            />

            <LiveProtocolFeed
              activities={activity}
              loading={loading.activity}
              error={errors.activity}
              onRetry={() => refetch()}
            />

            <div className="space-y-3">
              <UpcomingEventsWidget
                events={events}
                loading={loading.events}
                error={errors.events}
                onRetry={() => refetch()}
              />
              <BirthdaysWidget
                birthdays={birthdays}
                loading={loading.birthdays}
                error={errors.birthdays}
                onRetry={() => refetch()}
              />
              <OfficialNoticesWidget
                notices={announcements}
                loading={loading.announcements}
                error={errors.announcements}
                onRetry={() => refetch()}
              />
            </div>
          </div>

          <QuickActionsGrid onOpenFeeReminders={() => setFeeRemindersOpen(true)} />
        </main>
      </div>

      {feeRemindersOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setFeeRemindersOpen(false)}>
          <div className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto bg-white rounded-xl shadow-2xl mx-4" onClick={e => e.stopPropagation()}>
            <button
              onClick={() => setFeeRemindersOpen(false)}
              className="absolute top-3 right-3 z-10 text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
            <SmartFeeReminders />
          </div>
        </div>
      )}
    </div>
  );
}
