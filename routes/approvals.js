const express = require('express');
const router = express.Router();
const supabase = require('../config/db');
const { protect } = require('./school');
const { requirePermission } = require('../middleware/permission');

// GET /api/school/approvals — list pending approvals
router.get('/', protect, requirePermission('settings.edit', 'grades.view', 'fees.edit'), async (req, res) => {
    try {
        const { data: approvals, error } = await supabase
            .from('approvals')
            .select('*, requested_by_user:requested_by(full_name, email)')
            .eq('school_id', req.tenant.id)
            .eq('status', 'pending')
            .order('created_at', { ascending: false });

        if (error) return res.status(400).json({ error: error.message });
        return res.json({ data: { approvals: approvals || [] } });
    } catch (err) {
        return res.status(500).json({ error: err.message || 'Error fetching approvals.' });
    }
});

// POST /api/school/approvals — submit a new approval request
router.post('/', protect, async (req, res) => {
    try {
        const { resource, resource_id, action, payload } = req.body;
        if (!resource || !action) {
            return res.status(400).json({ error: 'resource and action are required.' });
        }

        const { data, error } = await supabase
            .from('approvals')
            .insert({
                school_id: req.tenant.id,
                requested_by: req.user.userId,
                resource,
                resource_id: resource_id || null,
                action,
                payload: payload || null,
                status: 'pending',
            })
            .select('*, requested_by_user:requested_by(full_name, email)')
            .single();

        if (error) return res.status(400).json({ error: error.message });
        return res.status(201).json({ data: { approval: data, message: 'Approval request submitted.' } });
    } catch (err) {
        return res.status(500).json({ error: err.message || 'Error submitting approval request.' });
    }
});

// PUT /api/school/approvals/:id/approve
router.put('/:id/approve', protect, requirePermission('settings.edit', 'grades.view', 'fees.edit'), async (req, res) => {
    try {
        const { reason } = req.body;
        const { data, error } = await supabase
            .from('approvals')
            .update({ status: 'approved', approved_by: req.user.userId, reason: reason || null, updated_at: new Date().toISOString() })
            .eq('id', req.params.id)
            .eq('school_id', req.tenant.id)
            .eq('status', 'pending')
            .select()
            .single();

        if (error) return res.status(400).json({ error: error.message });
        if (!data) return res.status(404).json({ error: 'Approval request not found or already processed.' });
        return res.json({ data: { approval: data, message: 'Request approved.' } });
    } catch (err) {
        return res.status(500).json({ error: err.message || 'Error approving request.' });
    }
});

// PUT /api/school/approvals/:id/reject
router.put('/:id/reject', protect, requirePermission('settings.edit', 'grades.view', 'fees.edit'), async (req, res) => {
    try {
        const { reason } = req.body;
        if (!reason) return res.status(400).json({ error: 'Reason is required for rejection.' });

        const { data, error } = await supabase
            .from('approvals')
            .update({ status: 'rejected', approved_by: req.user.userId, reason, updated_at: new Date().toISOString() })
            .eq('id', req.params.id)
            .eq('school_id', req.tenant.id)
            .eq('status', 'pending')
            .select()
            .single();

        if (error) return res.status(400).json({ error: error.message });
        if (!data) return res.status(404).json({ error: 'Approval request not found or already processed.' });
        return res.json({ data: { approval: data, message: 'Request rejected.' } });
    } catch (err) {
        return res.status(500).json({ error: err.message || 'Error rejecting request.' });
    }
});

module.exports = router;
