import { useState, useEffect } from 'react';
import { api } from '../services/api';

export interface Child {
    id: string;
    name: string;
    class: string;
    initials: string;
}

export interface ChildSummary {
    attendancePercent: number;
    presentDays: number;
    amountDue: number;
    daysUntilDeadline: number;
    lastExamScore: number;
    lastExamName: string;
    date: string;
    grade: string;
    rank: number;
    total: number;
    pendingHomework: number;
    overdueHomework: number;
}

export interface WeekSummary {
    day: string;
    status: 'present' | 'absent' | 'late';
    classes: number;
    hasExam: boolean;
    hasHomework: boolean;
}

export interface ChildAttendance {
    summary: { present: number; absent: number; late: number; percent: number };
    absences: { date: string; reason: string }[];
}

export interface ChildFees {
    currentTerm: { name: string; amount: number; status: string }[];
    history: { id: string; date: string; amount: number; mode: string }[];
    outstanding: number;
}

export interface ChildResults {
    summary: { avg: number; rank: number; total: number; grade: string };
    subjects: { name: string; score: number; grade: string }[];
}

export interface ChildHomework {
    id: string;
    subject: string;
    dueDate: string;
    status: string;
}

export interface ChildExam {
    id: string;
    name: string;
    subject: string;
    date: string;
    daysUntil: number;
    tip: string;
}

export interface Notice {
    id: string;
    title: string;
    date: string;
    type: string;
    unread: boolean;
}

export function useParentDashboard() {
    const [children, setChildren] = useState<Child[]>([]);
    const [selectedChildId, setSelectedChildId] = useState<string | null>(null);

    const [summary, setSummary] = useState<ChildSummary | null>(null);
    const [weekSummary, setWeekSummary] = useState<WeekSummary[]>([]);
    const [attendance, setAttendance] = useState<ChildAttendance | null>(null);
    const [fees, setFees] = useState<ChildFees | null>(null);
    const [results, setResults] = useState<ChildResults | null>(null);
    const [homework, setHomework] = useState<ChildHomework[]>([]);
    const [exams, setExams] = useState<ChildExam[]>([]);
    const [notices, setNotices] = useState<Notice[]>([]);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchChildren = async () => {
            try {
                const res = await api.get<any>('/api/school/parent/children');
                // school.js returns { data: { children: [...] } }
                const kids = res.data?.children || [];
                setChildren(kids);
                if (kids.length > 0) {
                    setSelectedChildId(kids[0].id);
                }
            } catch (err) {
                console.error('Failed to fetch children', err);
                setError('Failed to load your children profiles.');
            }
        };
        fetchChildren();
    }, []);

    useEffect(() => {
        if (!selectedChildId) return;

        const fetchChildData = async () => {
            try {
                setLoading(true);
                const [
                    sumRes, weekRes, attRes, feeRes, resRes, hwRes, examRes, noticeRes
                ] = await Promise.all([
                    api.get<any>(`/api/school/parent/child/${selectedChildId}/summary`),
                    api.get<any>(`/api/school/parent/child/${selectedChildId}/week-summary`),
                    api.get<any>(`/api/school/parent/child/${selectedChildId}/attendance`),
                    api.get<any>(`/api/school/parent/child/${selectedChildId}/fees`),
                    api.get<any>(`/api/school/parent/child/${selectedChildId}/results`),
                    api.get<any>(`/api/school/parent/child/${selectedChildId}/homework`),
                    api.get<any>(`/api/school/parent/child/${selectedChildId}/exams`),
                    api.get<any>('/api/school/parent/notices')
                ]);

                // dashboard.js returns { data: <actual_value> } for all child detail routes
                setSummary(sumRes.data || null);
                setWeekSummary(weekRes.data || []);
                setAttendance(attRes.data || null);
                setFees(feeRes.data || null);
                setResults(resRes.data || null);
                setHomework(hwRes.data || []);
                setExams(examRes.data || []);
                setNotices(noticeRes.data || []);
                setError(null);
            } catch (err: any) {
                console.error('Error fetching child data:', err);
                setError('Failed to load child data.');
            } finally {
                setLoading(false);
            }
        };

        fetchChildData();
    }, [selectedChildId]);

    return {
        children,
        selectedChildId,
        setSelectedChildId,
        summary,
        weekSummary,
        attendance,
        fees,
        results,
        homework,
        exams,
        notices,
        loading,
        error
    };
}
