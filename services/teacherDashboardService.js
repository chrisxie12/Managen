const supabase = require('../config/db');

class TeacherDashboardService {
    async getStats(schoolId, teacherId) {
        return {
            totalStudentsInMyClasses: 120,
            classCount: 4,
            markedToday: 2,
            totalClassesToday: 3,
            pendingEvaluations: 45,
            overdueSubmissions: 5,
            nextClassName: 'Mathematics - Form 3A',
            timeUntilNext: '45 mins',
            room: 'Block A, Room 12'
        };
    }

    async getTimetableToday(schoolId, teacherId) {
        return [
            { id: '1', time: '08:00 - 09:00', subject: 'Mathematics', classSection: 'Form 3A', room: 'Room 12', status: 'DONE' },
            { id: '2', time: '09:00 - 10:00', subject: 'Physics', classSection: 'Form 2B', room: 'Lab 1', status: 'NOW' },
            { id: '3', time: '11:00 - 12:00', subject: 'Further Math', classSection: 'Form 4A', room: 'Room 14', status: 'UPCOMING' }
        ];
    }

    async getMyClassesPerformance(schoolId, teacherId) {
        return [
            { id: '1', className: 'Form 3A', subject: 'Mathematics', students: 30, avgScore: 78, topStudent: 'John Doe', attendancePercent: 92 },
            { id: '2', className: 'Form 2B', subject: 'Physics', students: 28, avgScore: 65, topStudent: 'Jane Smith', attendancePercent: 88 }
        ];
    }

    async getHomework(schoolId, teacherId, limit = 8) {
        return [
            { id: '1', subject: 'Mathematics', class: 'Form 3A', dueDate: new Date(Date.now() + 86400000).toISOString(), submitted: 25, total: 30, status: 'Active' },
            { id: '2', subject: 'Physics', class: 'Form 2B', dueDate: new Date(Date.now() - 86400000).toISOString(), submitted: 28, total: 28, status: 'Evaluated' }
        ];
    }

    async getUpcomingExams(schoolId, teacherId) {
        return [
            { id: '1', date: new Date(Date.now() + 3 * 86400000).toISOString(), name: 'Mid-Term Test 1', subject: 'Mathematics', class: 'Form 3A', status: 'Scheduled' }
        ];
    }

    async getAttendanceWeekly(schoolId, teacherId) {
        return [
            {
                className: 'Form 3A',
                weeklyData: [
                    { day: 'Mon', status: 'marked' },
                    { day: 'Tue', status: 'marked' },
                    { day: 'Wed', status: 'absent_heavy' },
                    { day: 'Thu', status: 'unmarked' },
                    { day: 'Fri', status: 'unmarked' }
                ],
                overallPercent: 85
            }
        ];
    }
}

module.exports = new TeacherDashboardService();
