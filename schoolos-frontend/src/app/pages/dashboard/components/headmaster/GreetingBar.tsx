import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { Clock, Calendar } from 'lucide-react';
import { useAuth } from '../../../../contexts/AuthContext';
import { getGreeting, formatTime, formatDate } from '../../../../utils/formatters';
import type { AlertData } from '../../hooks/useDashboardData';

interface GreetingBarProps {
  alerts?: AlertData[] | null;
  alertLoading?: boolean;
}

export function GreetingBar({ alerts, alertLoading }: GreetingBarProps) {
  const navigate = useNavigate();
  const { user, school } = useAuth();
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const greeting = getGreeting();
  const firstName = user?.fullName?.split(' ')[0] || 'Admin';
  const plan = school?.plan || '';

  const criticalAlerts = (alerts || []).filter(a => a.type === 'critical');
  const warningAlerts = (alerts || []).filter(a => a.type === 'warning');
  const totalUnread = criticalAlerts.length + warningAlerts.length;

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
      <div>
        <div className="flex items-center gap-2 flex-wrap">
          <h2 className="text-[22px] font-bold text-gray-800" style={{ fontFamily: "'DM Sans', sans-serif" }}>
            {greeting}
          </h2>
          <span className="text-[22px] font-bold text-blue-600 underline underline-offset-2 decoration-blue-300">
            {firstName}
          </span>
          {plan === 'trial' && (
            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-green-500 text-white">
              NEW TRIAL
            </span>
          )}
        </div>
        <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
          <span className="flex items-center gap-1">
            <Clock size={12} />
            {formatTime(now)}
          </span>
          <span className="flex items-center gap-1">
            <Calendar size={12} />
            {formatDate(now)}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        {alertLoading ? (
          <div className="h-6 w-20 bg-gray-200 rounded-full animate-pulse" />
        ) : totalUnread > 0 ? (
          <button
            onClick={() => navigate('/dashboard/notifications')}
            className="inline-flex items-center gap-1.5 text-[10px] font-bold px-3 py-1.5 rounded-full bg-amber-500 text-white hover:bg-amber-600 transition-colors"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
            UPDATES {totalUnread > 0 && `(${totalUnread})`}
          </button>
        ) : null}

        {criticalAlerts.length > 0 && (
          <button
            onClick={() => navigate('/dashboard/fees')}
            className="inline-flex items-center gap-1 text-[10px] font-bold px-3 py-1.5 rounded-full bg-red-500 text-white hover:bg-red-600 transition-colors"
          >
            Fees Reminder Live ↗
          </button>
        )}
      </div>
    </div>
  );
}
