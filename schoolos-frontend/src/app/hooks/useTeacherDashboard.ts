import { useState, useEffect } from 'react';
import { api } from '../services/api';

export interface TeacherStats {
    totalStudentsInMyClasses: number;
    classCount: number;
    markedToday: number;
    totalClassesToday: number;
    pendingEvaluations: number;
    overdueSubmissions: number;
    nextClassName: string;
    timeUntilNext: string;
    room: string;
}

export interface TimetableClass {
    id: string;
    time: string;
    subject: string;
    classSection: string;
    room: string;
    status: 'DONE' | 'NOW' | 'UPCOMING';
}

export interface MyClassPerformance {
    id: string;
    className: string;
    subject: string;
    students: number;
    avgScore: number;
    topStudent: string;
    attendancePercent: number;
}

export interface Homework {
    id: string;
    subject: string;
    class: string;
    dueDate: string;
    submitted: number;
    total: number;
    status: string;
}

export interface UpcomingExam {
    id: string;
    date: string;
    name: string;
    subject: string;
    class: string;
    status: string;
}

export interface WeeklyAttendance {
    className: string;
    weeklyData: { day: string; status: 'marked' | 'unmarked' | 'absent_heavy' }[];
    overallPercent: number;
}

export function useTeacherDashboard() {
    const [stats, setStats] = useState<TeacherStats | null>(null);
    const [timetable, setTimetable] = useState<TimetableClass[]>([]);
    const [performance, setPerformance] = useState<MyClassPerformance[]>([]);
    const [homework, setHomework] = useState<Homework[]>([]);
    const [exams, setExams] = useState<UpcomingExam[]>([]);
    const [attendance, setAttendance] = useState<WeeklyAttendance[]>([]);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const [
                    statsRes, timetableRes, perfRes, hwRes, examRes, attRes
                ] = await Promise.all([
                    api.get<any>('/api/school/teacher/dashboard/stats'),
                    api.get<any>('/api/school/teacher/timetable/today'),
                    api.get<any>('/api/school/teacher/my-classes/performance'),
                    api.get<any>('/api/school/teacher/homework'),
                    api.get<any>('/api/school/teacher/exams/upcoming'),
                    api.get<any>('/api/school/teacher/attendance/weekly')
                ]);

                // dashboard.js returns { data: <actual_value> }
                setStats(statsRes.data || null);
                setTimetable(timetableRes.data || []);
                setPerformance(perfRes.data || []);
                setHomework(hwRes.data || []);
                setExams(examRes.data || []);
                setAttendance(attRes.data || []);
                setError(null);
            } catch (err: any) {
                console.error('Error fetching teacher dashboard:', err);
                setError('Failed to load dashboard data.');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    return {
        stats, timetable, performance, homework, exams, attendance,
        loading, error
    };
}
