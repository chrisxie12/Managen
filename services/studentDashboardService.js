const supabase = require('../config/db');

class StudentDashboardService {
    async getTodayStats(schoolId, studentId) {
        return {
            subjectName: 'Biology',
            timeUntilNext: '15 mins',
            roomNumber: 'Lab 2',
            teacherName: 'Kofi Mensah',
            attendancePercent: 95,
            presentDays: 45,
            absentDays: 2,
            amountDue: 500,
            daysUntilDeadline: 14
        };
    }

    async getTimetableToday(schoolId, studentId) {
        return [
            { id: '1', time: '08:00', subject: 'Mathematics', teacherName: 'Mr. Osei', roomNumber: 'Room 10', status: 'DONE' },
            { id: '2', time: '09:00', subject: 'English', teacherName: 'Ms. Addo', roomNumber: 'Room 10', status: 'DONE' },
            { id: '3', time: '10:00', subject: 'Biology', teacherName: 'Mr. Mensah', roomNumber: 'Lab 2', status: 'NOW' },
            { id: '4', time: '11:00', subject: 'Physics', teacherName: 'Mr. Manu', roomNumber: 'Lab 1', status: 'UPCOMING' }
        ];
    }

    async getRecentResults(schoolId, studentId, limit = 5) {
        return [
            { id: '1', subject: 'Mathematics', examName: 'Mid-Term Test', score: 85, maxScore: 100, grade: 'A', rank: 4, total: 35, date: new Date().toISOString() },
            { id: '2', subject: 'English', examName: 'Mid-Term Test', score: 68, maxScore: 100, grade: 'C', rank: 15, total: 35, date: new Date(Date.now() - 86400000).toISOString() }
        ];
    }

    async getActiveHomework(schoolId, studentId) {
        return [
            { id: '1', subject: 'Biology', teacher: 'Mr. Mensah', description: 'Draw and label the human digestive system', dueDate: new Date(Date.now() + 2 * 86400000).toISOString(), status: 'Pending' },
            { id: '2', subject: 'Mathematics', teacher: 'Mr. Osei', description: 'Solve quadratic equations assignment', dueDate: new Date(Date.now() - 86400000).toISOString(), status: 'Evaluated', score: '8/10' }
        ];
    }

    async getUpcomingExams(schoolId, studentId) {
        return [
            { id: '1', name: 'End of Term Exam', subject: 'Mathematics', date: new Date(Date.now() + 10 * 86400000).toISOString(), venue: 'Main Hall', daysUntil: 10 }
        ];
    }

    async getStudyMaterials(schoolId, studentId, limit = 6) {
        return [
            { id: '1', subject: 'Physics', title: 'Newtonian Mechanics Guide', type: 'PDF', uploader: 'Mr. Manu', date: new Date().toISOString() }
        ];
    }

    async getNotices(schoolId, studentId, limit = 4) {
        return [
            { id: '1', title: 'Science Fair Registration', date: new Date().toISOString(), type: 'General' }
        ];
    }
}

module.exports = new StudentDashboardService();
