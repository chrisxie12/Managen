const crypto = require('crypto');
const supabase = require('../config/db');
const whatsappService = require('./whatsappService');
const smsService = require('./smsService');
const emailService = require('./emailService');

const DEFAULT_CHANNEL_ORDER = ['whatsapp', 'sms', 'email'];
const DEFAULT_FEE_STATUSES = ['unpaid', 'overdue', 'pending'];

const parseChannelOrder = () => {
    const raw = String(process.env.FEE_REMINDER_CHANNEL_ORDER || '').trim();
    if (!raw) return DEFAULT_CHANNEL_ORDER;

    const parsed = raw
        .split(',')
        .map((channel) => String(channel || '').trim().toLowerCase())
        .filter(Boolean);

    return parsed.length ? parsed : DEFAULT_CHANNEL_ORDER;
};

const normalizeBaseUrl = () => {
    const raw = String(process.env.TENANT_BASE_URL || 'http://localhost:3000').trim();
    if (!raw) return 'http://localhost:3000';
    if (raw.startsWith('http://') || raw.startsWith('https://')) return raw.replace(/\/$/, '');
    return `http://${raw.replace(/\/$/, '')}`;
};

const buildPaymentLink = (feeId) => `${normalizeBaseUrl()}/pay?feeId=${encodeURIComponent(feeId)}`;

const formatAmount = (value) => {
    const amount = Number(value || 0);
    if (!Number.isFinite(amount)) return '0.00';
    return amount.toFixed(2);
};

const buildReminderMessage = ({ schoolName, parentName, studentName, amount, dueDate, paymentLink }) => {
    const safeSchoolName = schoolName || 'your school';
    const dueText = dueDate ? ` Due date: ${dueDate}.` : '';
    const studentText = studentName ? ` for ${studentName}` : '';

    return `Hi ${parentName || 'Parent'}, this is a reminder from ${safeSchoolName}. An outstanding fee of GHS ${formatAmount(amount)} is due${studentText}.${dueText} Pay now: ${paymentLink}`;
};

const getOutstandingFees = async (tenantId, limit = 100) => {
    let query = supabase
        .from('fees')
        .select('*')
        .eq('tenant_id', tenantId)
        .limit(limit);

    try {
        query = query.in('status', DEFAULT_FEE_STATUSES);
    } catch (err) {
        // Some adapters may not support .in during tests; keep a fallback below.
    }

    const { data, error } = await query;
    if (error) throw error;

    return (data || []).filter((fee) => {
        const status = String(fee.status || '').toLowerCase();
        return !status || DEFAULT_FEE_STATUSES.includes(status);
    });
};

const fetchStudentDetails = async (tenantId, studentId) => {
    if (!studentId) return null;

    const { data, error } = await supabase
        .from('students')
        .select('id, name, parent_name, parent_phone, parent_email')
        .eq('tenant_id', tenantId)
        .eq('id', studentId)
        .maybeSingle();

    if (error) return null;
    return data || null;
};

const resolveRecipient = async (tenant, fee) => {
    const student = await fetchStudentDetails(tenant.id, fee.student_id);

    const parentName = fee.parent_name || (student && student.parent_name) || null;
    const studentName = fee.student_name || (student && student.name) || null;

    return {
        parentName,
        studentName,
        phone: fee.parent_phone || fee.phone || (student && student.parent_phone) || null,
        email: fee.parent_email || fee.email || (student && student.parent_email) || null,
    };
};

const sendByChannel = async ({ channel, phone, email, message, subject }) => {
    if (channel === 'whatsapp') {
        if (!phone) return { success: false, skipped: true, reason: 'missing_phone' };
        return whatsappService.sendFeeReminder({ to: phone, message });
    }

    if (channel === 'sms') {
        if (!phone) return { success: false, skipped: true, reason: 'missing_phone' };
        return smsService.sendFeeReminder({ to: phone, message });
    }

    if (channel === 'email') {
        if (!email) return { success: false, skipped: true, reason: 'missing_email' };
        return emailService.sendFeeReminder({ to: email, subject, message });
    }

    return { success: false, skipped: true, reason: `unsupported_channel:${channel}` };
};

const saveDeliveryLog = async ({ tenantId, feeId, channel, recipient, success, error, actorId }) => {
    try {
        await supabase
            .from('notification_logs')
            .insert({
                id: crypto.randomUUID(),
                tenant_id: tenantId,
                type: 'fee_reminder',
                channel,
                recipient,
                status: success ? 'sent' : 'failed',
                fee_id: feeId,
                actor_id: actorId || null,
                error_message: error || null,
                created_at: new Date().toISOString(),
            });
    } catch (logError) {
        console.error('fee reminder log write error:', logError.message || logError);
    }
};

const sendReminderForFee = async ({ tenant, fee, actorId, dryRun = false }) => {
    const recipient = await resolveRecipient(tenant, fee);
    const paymentLink = buildPaymentLink(fee.id);
    const message = buildReminderMessage({
        schoolName: tenant.name,
        parentName: recipient.parentName,
        studentName: recipient.studentName,
        amount: fee.amount,
        dueDate: fee.due_date,
        paymentLink,
    });

    const subject = `${tenant.name || 'Managen'} fee reminder`;
    const channels = parseChannelOrder();
    const attempts = [];

    if (dryRun) {
        return {
            feeId: fee.id,
            dryRun: true,
            channels,
            recipient,
            paymentLink,
        };
    }

    for (const channel of channels) {
        const result = await sendByChannel({
            channel,
            phone: recipient.phone,
            email: recipient.email,
            message,
            subject,
        });

        attempts.push({ channel, success: Boolean(result && result.success), error: result && result.error ? String(result.error) : null });

        await saveDeliveryLog({
            tenantId: tenant.id,
            feeId: fee.id,
            channel,
            recipient: channel === 'email' ? recipient.email : recipient.phone,
            success: Boolean(result && result.success),
            error: result && result.error ? String(result.error) : null,
            actorId,
        });

        if (result && result.success) {
            return {
                feeId: fee.id,
                sent: true,
                channel,
                attempts,
                recipient,
                paymentLink,
            };
        }
    }

    return {
        feeId: fee.id,
        sent: false,
        channel: null,
        attempts,
        recipient,
        paymentLink,
    };
};

const sendDueFeeReminders = async ({ tenant, actorId, limit = 100, dryRun = false }) => {
    if (!tenant || !tenant.id) {
        const error = new Error('Tenant context is required.');
        error.statusCode = 400;
        throw error;
    }

    const fees = await getOutstandingFees(tenant.id, limit);

    const results = [];
    for (const fee of fees) {
        const outcome = await sendReminderForFee({ tenant, fee, actorId, dryRun });
        results.push(outcome);
    }

    const sentCount = results.filter((item) => item.sent).length;

    return {
        totalFees: fees.length,
        sentCount,
        failedCount: fees.length - sentCount,
        dryRun,
        results,
    };
};

module.exports = {
    sendDueFeeReminders,
    _private: {
        buildReminderMessage,
        formatAmount,
        parseChannelOrder,
        normalizeBaseUrl,
    },
};
