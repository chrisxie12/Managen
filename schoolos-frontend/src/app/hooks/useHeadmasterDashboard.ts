import { useState, useEffect } from 'react';
import { api } from '../services/api'; // Assuming a standard api service exists or fetch

export interface HeadmasterStats {
    totalStudents: number;
    newThisTerm: number;
    feesCollected: number;
    feeTarget: number;
    attendanceRate: string;
    present: number;
    absent: number;
    late: number;
    pendingAmount: number;
    defaulters: number;
    totalStaff: number;
    activeStaff: number;
    staffOnLeave: number;
}

export interface HeadmasterAlert {
    type: 'critical' | 'warning' | 'info';
    message: string;
    actionUrl: string;
}

export interface FinancialPerformance {
    date: string;
    collected: number;
    target: number;
}

export interface AttendanceTrend {
    day: string;
    present: number;
    absent: number;
    late: number;
}

export interface FeeStatus {
    name: string;
    value: number;
}

export interface StudentType {
    name: string;
    value: number;
}

export interface ClassPerformance {
    id: string;
    name: string;
    stream: string;
    students: number;
    avgScore: number;
    attendancePercent: number;
    feesPaidPercent: number;
    trend: 'up' | 'down';
}

export interface Activity {
    id: number;
    type: string;
    message: string;
    timestamp: string;
}

export interface Birthday {
    id: string;
    name: string;
    class: string;
    admissionNo: string;
    date: string;
}

export function useHeadmasterDashboard() {
    const [stats, setStats] = useState<HeadmasterStats | null>(null);
    const [alerts, setAlerts] = useState<HeadmasterAlert[]>([]);
    const [finances, setFinances] = useState<FinancialPerformance[]>([]);
    const [attendanceTrend, setAttendanceTrend] = useState<AttendanceTrend[]>([]);
    const [feeStatus, setFeeStatus] = useState<FeeStatus[]>([]);
    const [studentTypes, setStudentTypes] = useState<StudentType[]>([]);
    const [classPerformance, setClassPerformance] = useState<ClassPerformance[]>([]);
    const [activity, setActivity] = useState<Activity[]>([]);
    const [birthdays, setBirthdays] = useState<Birthday[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const [
                    statsRes, alertsRes, financesRes, attendanceRes, 
                    feeRes, typesRes, classRes, activityRes, bdayRes
                ] = await Promise.all([
                    api.get('/api/school/dashboard/stats'),
                    api.get('/api/school/dashboard/alerts'),
                    api.get('/api/school/dashboard/financial-performance?days=30'),
                    api.get('/api/school/dashboard/attendance-trend'),
                    api.get('/api/school/dashboard/fee-status'),
                    api.get('/api/school/dashboard/student-types'),
                    api.get('/api/school/dashboard/class-performance'),
                    api.get('/api/school/dashboard/activity'),
                    api.get('/api/school/dashboard/birthdays')
                ]);

                setStats(statsRes.data?.data || null);
                setAlerts(alertsRes.data?.data || []);
                setFinances(financesRes.data?.data || []);
                setAttendanceTrend(attendanceRes.data?.data || []);
                setFeeStatus(feeRes.data?.data || []);
                setStudentTypes(typesRes.data?.data || []);
                setClassPerformance(classRes.data?.data || []);
                setActivity(activityRes.data?.data || []);
                setBirthdays(bdayRes.data?.data || []);
                setError(null);
            } catch (err: any) {
                console.error('Error fetching headmaster dashboard:', err);
                setError('Failed to load dashboard data.');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    return { 
        stats, alerts, finances, attendanceTrend, 
        feeStatus, studentTypes, classPerformance, activity, birthdays,
        loading, error 
    };
}
