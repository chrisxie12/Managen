const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');

const headmasterService = require('../services/dashboardService');
const teacherService = require('../services/teacherDashboardService');
const accountantService = require('../services/accountantDashboardService');
const studentService = require('../services/studentDashboardService');
const parentService = require('../services/parentDashboardService');
const librarianService = require('../services/librarianDashboardService');

const ensureMatchingTenant = (decoded, tenant) => {
    const tokenTenantId = decoded?.tenantId || decoded?.schoolId || null;
    if (tenant && tokenTenantId && tokenTenantId !== tenant.id) {
        const error = new Error('Token does not match the requested school.');
        error.statusCode = 403;
        throw error;
    }
};

const protect = (req, res, next) => {
    try {
        const token = req.cookies?.schoolos_token;
        if (!token) return res.status(401).json({ error: 'No token provided.' });
        req.user = jwt.verify(token, process.env.JWT_SECRET);
        ensureMatchingTenant(req.user, req.tenant);
        next();
    } catch (err) {
        const statusCode = err.statusCode || 401;
        return res.status(statusCode).json({ error: 'Invalid or expired token.' });
    }
};

const allowRoles = (...roles) => (req, res, next) => {
    if (!roles.includes(req.user.role))
        return res.status(403).json({ error: 'Access denied for your role.' });
    next();
};

// --- Headmaster / Admin Routes ---
router.get('/dashboard/stats', protect, allowRoles('headmaster', 'admin', 'school_admin'), async (req, res) => {
    try { res.json({ data: await headmasterService.getStats(req.tenant.id) }); } 
    catch (e) { res.status(500).json({ error: e.message }); }
});

router.get('/dashboard/alerts', protect, allowRoles('headmaster', 'admin', 'school_admin'), async (req, res) => {
    try { res.json({ data: await headmasterService.getAlerts(req.tenant.id) }); } 
    catch (e) { res.status(500).json({ error: e.message }); }
});

router.get('/dashboard/financial-performance', protect, allowRoles('headmaster', 'admin', 'school_admin'), async (req, res) => {
    try { res.json({ data: await headmasterService.getFinancialPerformance(req.tenant.id, req.query.days) }); } 
    catch (e) { res.status(500).json({ error: e.message }); }
});

router.get('/dashboard/attendance-trend', protect, allowRoles('headmaster', 'admin', 'school_admin'), async (req, res) => {
    try { res.json({ data: await headmasterService.getAttendanceTrend(req.tenant.id) }); } 
    catch (e) { res.status(500).json({ error: e.message }); }
});

router.get('/dashboard/fee-status', protect, allowRoles('headmaster', 'admin', 'school_admin'), async (req, res) => {
    try { res.json({ data: await headmasterService.getFeeStatus(req.tenant.id) }); } 
    catch (e) { res.status(500).json({ error: e.message }); }
});

router.get('/dashboard/student-types', protect, allowRoles('headmaster', 'admin', 'school_admin'), async (req, res) => {
    try { res.json({ data: await headmasterService.getStudentTypes(req.tenant.id) }); } 
    catch (e) { res.status(500).json({ error: e.message }); }
});

router.get('/dashboard/class-performance', protect, allowRoles('headmaster', 'admin', 'school_admin'), async (req, res) => {
    try { res.json({ data: await headmasterService.getClassPerformance(req.tenant.id) }); } 
    catch (e) { res.status(500).json({ error: e.message }); }
});

router.get('/dashboard/activity', protect, allowRoles('headmaster', 'admin', 'school_admin', 'librarian'), async (req, res) => {
    try { res.json({ data: await headmasterService.getActivity(req.tenant.id, req.query.limit) }); } 
    catch (e) { res.status(500).json({ error: e.message }); }
});

router.get('/dashboard/birthdays', protect, allowRoles('headmaster', 'admin', 'school_admin'), async (req, res) => {
    try { res.json({ data: await headmasterService.getBirthdays(req.tenant.id, req.query.days) }); } 
    catch (e) { res.status(500).json({ error: e.message }); }
});

router.get('/dashboard/staff-today', protect, allowRoles('headmaster', 'admin', 'school_admin'), async (req, res) => {
    try { res.json({ data: await headmasterService.getStaffToday(req.tenant.id) }); } 
    catch (e) { res.status(500).json({ error: e.message }); }
});

// --- Teacher Routes ---
router.get('/teacher/dashboard/stats', protect, allowRoles('teacher'), async (req, res) => {
    try { res.json({ data: await teacherService.getStats(req.tenant.id, req.user.userId) }); } 
    catch (e) { res.status(500).json({ error: e.message }); }
});
router.get('/teacher/timetable/today', protect, allowRoles('teacher'), async (req, res) => {
    try { res.json({ data: await teacherService.getTimetableToday(req.tenant.id, req.user.userId) }); } 
    catch (e) { res.status(500).json({ error: e.message }); }
});
router.get('/teacher/my-classes/performance', protect, allowRoles('teacher'), async (req, res) => {
    try { res.json({ data: await teacherService.getMyClassesPerformance(req.tenant.id, req.user.userId) }); } 
    catch (e) { res.status(500).json({ error: e.message }); }
});
router.get('/teacher/homework', protect, allowRoles('teacher'), async (req, res) => {
    try { res.json({ data: await teacherService.getHomework(req.tenant.id, req.user.userId, req.query.limit) }); } 
    catch (e) { res.status(500).json({ error: e.message }); }
});
router.get('/teacher/exams/upcoming', protect, allowRoles('teacher'), async (req, res) => {
    try { res.json({ data: await teacherService.getUpcomingExams(req.tenant.id, req.user.userId) }); } 
    catch (e) { res.status(500).json({ error: e.message }); }
});
router.get('/teacher/attendance/weekly', protect, allowRoles('teacher'), async (req, res) => {
    try { res.json({ data: await teacherService.getAttendanceWeekly(req.tenant.id, req.user.userId) }); } 
    catch (e) { res.status(500).json({ error: e.message }); }
});

// --- Accountant Routes ---
router.get('/accountant/dashboard/stats', protect, allowRoles('accountant'), async (req, res) => {
    try { res.json({ data: await accountantService.getStats(req.tenant.id) }); } 
    catch (e) { res.status(500).json({ error: e.message }); }
});
router.get('/accountant/fee-trend', protect, allowRoles('accountant'), async (req, res) => {
    try { res.json({ data: await accountantService.getFeeTrend(req.tenant.id) }); } 
    catch (e) { res.status(500).json({ error: e.message }); }
});
router.get('/accountant/payment-modes', protect, allowRoles('accountant'), async (req, res) => {
    try { res.json({ data: await accountantService.getPaymentModes(req.tenant.id) }); } 
    catch (e) { res.status(500).json({ error: e.message }); }
});
router.get('/accountant/income-expense', protect, allowRoles('accountant'), async (req, res) => {
    try { res.json({ data: await accountantService.getIncomeExpense(req.tenant.id) }); } 
    catch (e) { res.status(500).json({ error: e.message }); }
});
router.get('/accountant/fee-status-detail', protect, allowRoles('accountant'), async (req, res) => {
    try { res.json({ data: await accountantService.getFeeStatusDetail(req.tenant.id) }); } 
    catch (e) { res.status(500).json({ error: e.message }); }
});
router.get('/accountant/class-collection', protect, allowRoles('accountant'), async (req, res) => {
    try { res.json({ data: await accountantService.getClassCollection(req.tenant.id) }); } 
    catch (e) { res.status(500).json({ error: e.message }); }
});

// --- Student Routes ---
router.get('/student/dashboard/today', protect, allowRoles('student'), async (req, res) => {
    try { res.json({ data: await studentService.getTodayStats(req.tenant.id, req.user.userId) }); } 
    catch (e) { res.status(500).json({ error: e.message }); }
});
router.get('/student/timetable/today', protect, allowRoles('student'), async (req, res) => {
    try { res.json({ data: await studentService.getTimetableToday(req.tenant.id, req.user.userId) }); } 
    catch (e) { res.status(500).json({ error: e.message }); }
});
router.get('/student/results/recent', protect, allowRoles('student'), async (req, res) => {
    try { res.json({ data: await studentService.getRecentResults(req.tenant.id, req.user.userId, req.query.limit) }); } 
    catch (e) { res.status(500).json({ error: e.message }); }
});
router.get('/student/homework/active', protect, allowRoles('student'), async (req, res) => {
    try { res.json({ data: await studentService.getActiveHomework(req.tenant.id, req.user.userId) }); } 
    catch (e) { res.status(500).json({ error: e.message }); }
});
router.get('/student/exams/upcoming', protect, allowRoles('student'), async (req, res) => {
    try { res.json({ data: await studentService.getUpcomingExams(req.tenant.id, req.user.userId) }); } 
    catch (e) { res.status(500).json({ error: e.message }); }
});
router.get('/student/study-materials', protect, allowRoles('student'), async (req, res) => {
    try { res.json({ data: await studentService.getStudyMaterials(req.tenant.id, req.user.userId, req.query.limit) }); } 
    catch (e) { res.status(500).json({ error: e.message }); }
});
router.get('/student/notices', protect, allowRoles('student'), async (req, res) => {
    try { res.json({ data: await studentService.getNotices(req.tenant.id, req.user.userId, req.query.limit) }); } 
    catch (e) { res.status(500).json({ error: e.message }); }
});

// --- Parent Routes ---
router.get('/parent/children', protect, allowRoles('parent'), async (req, res) => {
    try { res.json({ data: await parentService.getChildren(req.tenant.id, req.user.userId) }); } 
    catch (e) { res.status(500).json({ error: e.message }); }
});
router.get('/parent/child/:id/summary', protect, allowRoles('parent'), async (req, res) => {
    try { res.json({ data: await parentService.getChildSummary(req.tenant.id, req.params.id) }); } 
    catch (e) { res.status(500).json({ error: e.message }); }
});
router.get('/parent/child/:id/week-summary', protect, allowRoles('parent'), async (req, res) => {
    try { res.json({ data: await parentService.getChildWeekSummary(req.tenant.id, req.params.id) }); } 
    catch (e) { res.status(500).json({ error: e.message }); }
});
router.get('/parent/child/:id/attendance', protect, allowRoles('parent'), async (req, res) => {
    try { res.json({ data: await parentService.getChildAttendance(req.tenant.id, req.params.id) }); } 
    catch (e) { res.status(500).json({ error: e.message }); }
});
router.get('/parent/child/:id/fees', protect, allowRoles('parent'), async (req, res) => {
    try { res.json({ data: await parentService.getChildFees(req.tenant.id, req.params.id) }); } 
    catch (e) { res.status(500).json({ error: e.message }); }
});
router.get('/parent/child/:id/results', protect, allowRoles('parent'), async (req, res) => {
    try { res.json({ data: await parentService.getChildResults(req.tenant.id, req.params.id) }); } 
    catch (e) { res.status(500).json({ error: e.message }); }
});
router.get('/parent/child/:id/homework', protect, allowRoles('parent'), async (req, res) => {
    try { res.json({ data: await parentService.getChildHomework(req.tenant.id, req.params.id) }); } 
    catch (e) { res.status(500).json({ error: e.message }); }
});
router.get('/parent/child/:id/exams', protect, allowRoles('parent'), async (req, res) => {
    try { res.json({ data: await parentService.getChildExams(req.tenant.id, req.params.id) }); } 
    catch (e) { res.status(500).json({ error: e.message }); }
});
router.get('/parent/notices', protect, allowRoles('parent'), async (req, res) => {
    try { res.json({ data: await parentService.getNotices(req.tenant.id, req.user.userId, req.query.limit) }); } 
    catch (e) { res.status(500).json({ error: e.message }); }
});

// --- Librarian Routes ---
router.get('/library/dashboard/stats', protect, allowRoles('librarian'), async (req, res) => {
    try { res.json({ data: await librarianService.getStats(req.tenant.id) }); } 
    catch (e) { res.status(500).json({ error: e.message }); }
});
router.get('/library/circulation-trend', protect, allowRoles('librarian'), async (req, res) => {
    try { res.json({ data: await librarianService.getCirculationTrend(req.tenant.id) }); } 
    catch (e) { res.status(500).json({ error: e.message }); }
});
router.get('/library/overdue-breakdown', protect, allowRoles('librarian'), async (req, res) => {
    try { res.json({ data: await librarianService.getOverdueBreakdown(req.tenant.id) }); } 
    catch (e) { res.status(500).json({ error: e.message }); }
});
router.get('/library/overdue', protect, allowRoles('librarian'), async (req, res) => {
    try { res.json({ data: await librarianService.getOverdue(req.tenant.id, req.query.limit) }); } 
    catch (e) { res.status(500).json({ error: e.message }); }
});
router.get('/library/activity', protect, allowRoles('librarian'), async (req, res) => {
    try { res.json({ data: await librarianService.getActivity(req.tenant.id, req.query.limit) }); } 
    catch (e) { res.status(500).json({ error: e.message }); }
});
router.get('/library/low-stock', protect, allowRoles('librarian'), async (req, res) => {
    try { res.json({ data: await librarianService.getLowStock(req.tenant.id, req.query.limit) }); } 
    catch (e) { res.status(500).json({ error: e.message }); }
});
router.get('/library/top-books', protect, allowRoles('librarian'), async (req, res) => {
    try { res.json({ data: await librarianService.getTopBooks(req.tenant.id, req.query.limit) }); } 
    catch (e) { res.status(500).json({ error: e.message }); }
});

module.exports = router;
