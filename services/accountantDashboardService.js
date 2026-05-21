const supabase = require('../config/db');

class AccountantDashboardService {
    async getStats(schoolId) {
        return {
            todayAmount: 4500,
            todayCount: 12,
            termAmount: 125000,
            target: 200000,
            percent: 62.5,
            outstandingAmount: 75000,
            defaulterCount: 150,
            incomeAmount: 15000,
            expenseCount: 45,
            expenseAmount: 85000,
            netBalance: 55000
        };
    }

    async getFeeTrend(schoolId) {
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
        return months.map(m => ({
            month: m,
            collected: 10000 + Math.floor(Math.random() * 20000),
            target: 35000
        }));
    }

    async getPaymentModes(schoolId) {
        return [
            { name: 'Cash', value: 45000 },
            { name: 'Online', value: 35000 },
            { name: 'Mobile Money', value: 25000 },
            { name: 'Bank Transfer', value: 20000 }
        ];
    }

    async getIncomeExpense(schoolId) {
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
        return months.map(m => ({
            month: m,
            income: 20000 + Math.floor(Math.random() * 10000),
            expense: 15000 + Math.floor(Math.random() * 8000)
        }));
    }

    async getFeeStatusDetail(schoolId) {
        return {
            fullyPaid: { count: 350, amount: 87500, percent: 55 },
            partiallyPaid: { count: 150, amountCollected: 25000, amountRemaining: 15000 },
            notPaid: { count: 100, amount: 60000 }
        };
    }

    async getClassCollection(schoolId) {
        return [
            { id: '1', className: 'Form 1A', collected: 15000, target: 20000, percent: 75, defaulters: 5 },
            { id: '2', className: 'Form 2A', collected: 12000, target: 20000, percent: 60, defaulters: 12 },
            { id: '3', className: 'Form 3A', collected: 18000, target: 20000, percent: 90, defaulters: 2 }
        ];
    }
}

module.exports = new AccountantDashboardService();
