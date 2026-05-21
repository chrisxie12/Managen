const supabase = require('../config/db');

class LibrarianDashboardService {
    async getStats(schoolId) {
        return {
            issuedToday: 15,
            returnedToday: 12,
            currentlyIssued: 145,
            overdueCount: 24,
            potentialFines: 120,
            totalBooks: 2500,
            availableBooks: 2355,
            lowStockTitles: 8,
            outOfStockTitles: 3
        };
    }

    async getCirculationTrend(schoolId) {
        return Array.from({ length: 30 }).map((_, i) => ({
            date: new Date(Date.now() - (29 - i) * 86400000).toISOString().split('T')[0],
            issues: 5 + Math.floor(Math.random() * 20),
            returns: 3 + Math.floor(Math.random() * 18)
        }));
    }

    async getOverdueBreakdown(schoolId) {
        return [
            { category: '1-7 days', count: 12 },
            { category: '8-14 days', count: 8 },
            { category: '15-30 days', count: 3 },
            { category: '>30 days', count: 1 }
        ];
    }

    async getOverdue(schoolId, limit = 10) {
        return [
            { id: '1', memberName: 'John Doe', memberType: 'Student', bookTitle: 'Introduction to Physics', department: 'Form 3A', issueDate: new Date(Date.now() - 20 * 86400000).toISOString(), daysOverdue: 6, fine: 12 }
        ];
    }

    async getActivity(schoolId, limit = 10) {
        return [
            { id: '1', type: 'issue', memberName: 'Jane Smith', bookTitle: 'African Literature', timestamp: new Date().toISOString() },
            { id: '2', type: 'return', memberName: 'John Doe', bookTitle: 'Basic Math', timestamp: new Date(Date.now() - 3600000).toISOString() }
        ];
    }

    async getLowStock(schoolId, limit = 8) {
        return [
            { id: '1', title: 'Advanced Biology', author: 'S. K. Addo', category: 'Science', available: 0, total: 5 },
            { id: '2', title: 'Modern History', author: 'A. Mensah', category: 'Arts', available: 1, total: 3 }
        ];
    }

    async getTopBooks(schoolId, limit = 6) {
        return [
            { id: '1', rank: 1, title: 'Things Fall Apart', author: 'Chinua Achebe', issueCount: 45, category: 'Literature', available: true }
        ];
    }
}

module.exports = new LibrarianDashboardService();
