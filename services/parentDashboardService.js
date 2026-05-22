const supabase = require('../config/db');

class ParentDashboardService {
    async getChildren(schoolId, parentId) {
        return [
            { id: '1', name: 'John Doe', class: 'Form 3A', initials: 'JD' },
            { id: '2', name: 'Jane Doe', class: 'Form 1B', initials: 'JD' }
        ];
    }

    async getChildSummary(schoolId, childId) {
        return {
            attendancePercent: 92,
            presentDays: 42,
            amountDue: 1500,
            daysUntilDeadline: 10,
            lastExamScore: 82,
            lastExamName: 'Mid-Term Science',
            date: new Date().toISOString(),
            grade: 'B',
            rank: 8,
            total: 35,
            pendingHomework: 3,
            overdueHomework: 1
        };
    }

    async getChildWeekSummary(schoolId, childId) {
        const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
        return days.map(day => ({
            day,
            status: day === 'Wed' ? 'absent' : 'present',
            classes: 6,
            hasExam: day === 'Fri',
            hasHomework: day === 'Tue' || day === 'Thu'
        }));
    }

    async getChildAttendance(schoolId, childId) {
        return {
            summary: { present: 42, absent: 3, late: 1, percent: 92 },
            absences: [
                { date: new Date(Date.now() - 3 * 86400000).toISOString(), reason: 'Fever' }
            ]
        };
    }

    async getChildFees(schoolId, childId) {
        return {
            currentTerm: [
                { name: 'Tuition Fee', amount: 2000, status: 'Partial' },
                { name: 'Bus Fee', amount: 500, status: 'Unpaid' }
            ],
            history: [
                { id: '1', date: new Date(Date.now() - 30 * 86400000).toISOString(), amount: 1000, mode: 'Mobile Money' }
            ],
            outstanding: 1500
        };
    }

    async getChildResults(schoolId, childId) {
        return {
            summary: { avg: 78, rank: 8, total: 35, grade: 'B' },
            subjects: [
                { name: 'Mathematics', score: 85, grade: 'A' },
                { name: 'English', score: 68, grade: 'C' },
                { name: 'Science', score: 81, grade: 'A' }
            ]
        };
    }

    async getChildHomework(schoolId, childId) {
        return [
            { id: '1', subject: 'Mathematics', dueDate: new Date(Date.now() + 86400000).toISOString(), status: 'Pending' },
            { id: '2', subject: 'English', dueDate: new Date(Date.now() - 86400000).toISOString(), status: 'Overdue' }
        ];
    }

    async getChildExams(schoolId, childId) {
        return [
            { id: '1', name: 'End of Term', subject: 'Mathematics', date: new Date(Date.now() + 10 * 86400000).toISOString(), daysUntil: 10, tip: 'Focus on algebra' }
        ];
    }

    async getNotices(schoolId, parentId, limit = 4) {
        return [
            { id: '1', title: 'PTA Meeting Next Week', date: new Date().toISOString(), type: 'General', unread: true }
        ];
    }
}

module.exports = new ParentDashboardService();
