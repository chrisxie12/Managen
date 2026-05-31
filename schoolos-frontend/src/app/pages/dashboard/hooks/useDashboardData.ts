import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { api } from '../../../services/api';

export interface StatsData {
  students: { total: number; newThisTerm: number; boarding: number; day: number };
  staff: { total: number; active: number; onLeave: number };
  attendance: { rate: number; present: number; absent: number; late: number };
  fees: { collectedThisMonth: number; totalOutstanding: number; defaulters: number; collectedThisTerm: number; termTarget: number };
  income: { thisMonth: number };
  leaves: { pendingToday: number; pendingApprovals: number };
  capacity: { enrolled: number; total: number; percent: number };
}

export interface AlertData {
  type: 'critical' | 'warning' | 'info';
  message: string;
  cta: string;
  ctaLink: string;
}

export interface FinancialDay {
  date: string;
  collected: number;
}

export interface ActivityItem {
  id: string;
  type: 'attendance' | 'fee' | 'admission' | 'marks' | 'notice' | 'leave' | 'system';
  text: string;
  timestamp: string;
  createdAt: string;
  color: string;
}

export interface BirthdayItem {
  id: string;
  name: string;
  className: string;
  admissionNumber: string;
  birthDate: string;
  birthdayThisYear: string;
  daysUntil: number;
  isToday: boolean;
  avatarColor: string;
}

export interface EventItem {
  id: string;
  title: string;
  date: string;
  type: string;
  color?: string;
}

export interface AnnouncementItem {
  id: string;
  title: string;
  content: string;
  date: string;
  type: string;
}

export interface StaffTodayData {
  present: number;
  absent: number;
  onLeave: number;
  late: number;
  absentList: { name: string; role: string; department: string }[];
}

export interface DashboardData {
  stats: StatsData | null;
  alerts: AlertData[] | null;
  financialPerformance: FinancialDay[] | null;
  activity: ActivityItem[] | null;
  birthdays: BirthdayItem[] | null;
  events: EventItem[] | null;
  announcements: AnnouncementItem[] | null;
  staffToday: StaffTodayData | null;
}

export interface DashboardErrors {
  stats: string | null;
  alerts: string | null;
  financialPerformance: string | null;
  activity: string | null;
  birthdays: string | null;
  events: string | null;
  announcements: string | null;
  staffToday: string | null;
}

export interface DashboardLoading {
  stats: boolean;
  alerts: boolean;
  financialPerformance: boolean;
  activity: boolean;
  birthdays: boolean;
  events: boolean;
  announcements: boolean;
  staffToday: boolean;
}

const initialData: DashboardData = {
  stats: null,
  alerts: null,
  financialPerformance: null,
  activity: null,
  birthdays: null,
  events: null,
  announcements: null,
  staffToday: null,
};

const initialErrors: DashboardErrors = {
  stats: null,
  alerts: null,
  financialPerformance: null,
  activity: null,
  birthdays: null,
  events: null,
  announcements: null,
  staffToday: null,
};

const initialLoading: DashboardLoading = {
  stats: true,
  alerts: true,
  financialPerformance: true,
  activity: true,
  birthdays: true,
  events: true,
  announcements: true,
  staffToday: true,
};

export default function useDashboardData() {
  useAuth();
  const [data, setData] = useState<DashboardData>(initialData);
  const [errors, setErrors] = useState<DashboardErrors>(initialErrors);
  const [loading, setLoading] = useState<DashboardLoading>(initialLoading);
  const [financialRange, setFinancialRange] = useState<number>(25);
  const mountedRef = useRef(true);

  const fetchSection = useCallback(async <T,>(
    key: keyof DashboardData,
    endpoint: string,
    transform?: (res: any) => T,
  ) => {
    try {
      setLoading(prev => ({ ...prev, [key]: true }));
      const res = await api.get<{ data: T }>(endpoint);
      if (!mountedRef.current) return;
      if (res.data) {
        const value = res.data.data !== undefined ? (res.data as any).data : res.data;
        setData(prev => ({ ...prev, [key]: transform ? transform(value) : value }));
        setErrors(prev => ({ ...prev, [key]: null }));
      }
    } catch (err: any) {
      if (!mountedRef.current) return;
      setErrors(prev => ({ ...prev, [key]: err.message || 'Failed to load' }));
    } finally {
      if (mountedRef.current) {
        setLoading(prev => ({ ...prev, [key]: false }));
      }
    }
  }, []);

  const fetchAll = useCallback(() => {
    fetchSection('stats', '/api/school/dashboard/stats');
    fetchSection('alerts', '/api/school/dashboard/alerts');
    fetchSection('financialPerformance', `/api/school/dashboard/financial-performance?days=${financialRange}`);
    fetchSection('activity', '/api/school/dashboard/activity?limit=20');
    fetchSection('birthdays', '/api/school/dashboard/birthdays?days=7');
    fetchSection('events', '/api/school/events?upcoming=true&limit=4');
    fetchSection('announcements', '/api/school/announcements?limit=3');
    fetchSection('staffToday', '/api/school/dashboard/staff-today');
  }, [fetchSection, financialRange]);

  const refetch = useCallback(() => {
    setLoading(initialLoading);
    fetchAll();
  }, [fetchAll]);

  useEffect(() => {
    mountedRef.current = true;
    fetchAll();

    const activityInterval = setInterval(() => {
      fetchSection('activity', '/api/school/dashboard/activity?limit=20');
    }, 30000);

    const statsAlertsInterval = setInterval(() => {
      fetchSection('stats', '/api/school/dashboard/stats');
      fetchSection('alerts', '/api/school/dashboard/alerts');
    }, 300000);

    const restInterval = setInterval(() => {
      fetchSection('birthdays', '/api/school/dashboard/birthdays?days=7');
      fetchSection('events', '/api/school/events?upcoming=true&limit=4');
      fetchSection('announcements', '/api/school/announcements?limit=3');
      fetchSection('staffToday', '/api/school/dashboard/staff-today');
    }, 600000);

    return () => {
      mountedRef.current = false;
      clearInterval(activityInterval);
      clearInterval(statsAlertsInterval);
      clearInterval(restInterval);
    };
  }, [fetchAll, fetchSection]);

  const setFinancialRangeAndRefetch = useCallback((days: number) => {
    setFinancialRange(days);
    fetchSection('financialPerformance', `/api/school/dashboard/financial-performance?days=${days}`);
  }, [fetchSection]);

  return {
    data,
    errors,
    loading,
    financialRange,
    setFinancialRange: setFinancialRangeAndRefetch,
    refetch,
  };
}
