import { useState, useEffect } from 'react';
import { api } from '../services/api';

export interface StudentTodayStats {
    subjectName: string;
    timeUntilNext: string;
    roomNumber: string;
    teacherName: string;
    attendancePercent: number;
    presentDays: number;
    absentDays: number;
    amountDue: number;
    daysUntilDeadline: number;
}

export interface StudentTimetable {
    id: string;
    time: string;
    subject: string;
    teacherName: string;
    roomNumber: string;
    status: 'DONE' | 'NOW' | 'UPCOMING';
}

export interface StudentResult {
    id: string;
    subject: string;
    examName: string;
    score: number;
    maxScore: number;
    grade: string;
    rank: number;
    total: number;
    date: string;
}

export interface ActiveHomework {
    id: string;
    subject: string;
    teacher: string;
    description: string;
    dueDate: string;
    status: string;
    score?: string;
}

export interface StudentUpcomingExam {
    id: string;
    name: string;
    subject: string;
    date: string;
    venue: string;
    daysUntil: number;
}

export interface StudyMaterial {
    id: string;
    subject: string;
    title: string;
    type: string;
    uploader: string;
    date: string;
}

export interface StudentNotice {
    id: string;
    title: string;
    date: string;
    type: string;
}

export function useStudentDashboard() {
    const [stats, setStats] = useState<StudentTodayStats | null>(null);
    const [timetable, setTimetable] = useState<StudentTimetable[]>([]);
    const [results, setResults] = useState<StudentResult[]>([]);
    const [homework, setHomework] = useState<ActiveHomework[]>([]);
    const [exams, setExams] = useState<StudentUpcomingExam[]>([]);
    const [materials, setMaterials] = useState<StudyMaterial[]>([]);
    const [notices, setNotices] = useState<StudentNotice[]>([]);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const [
                    statsRes, timetableRes, resRes, hwRes, examRes, matRes, notRes
                ] = await Promise.all([
                    api.get<any>('/api/school/student/dashboard/today'),
                    api.get<any>('/api/school/student/timetable/today'),
                    api.get<any>('/api/school/student/results/recent'),
                    api.get<any>('/api/school/student/homework/active'),
                    api.get<any>('/api/school/student/exams/upcoming'),
                    api.get<any>('/api/school/student/study-materials'),
                    api.get<any>('/api/school/student/notices')
                ]);

                // dashboard.js returns { data: <actual_value> }
                setStats(statsRes.data || null);
                setTimetable(timetableRes.data || []);
                setResults(resRes.data || []);
                setHomework(hwRes.data || []);
                setExams(examRes.data || []);
                setMaterials(matRes.data || []);
                setNotices(notRes.data || []);
                setError(null);
            } catch (err: any) {
                console.error('Error fetching student dashboard:', err);
                setError('Failed to load dashboard data.');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    return {
        stats, timetable, results, homework, exams, materials, notices,
        loading, error
    };
}
