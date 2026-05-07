const assert = require('assert');

process.env.FEE_REMINDER_CHANNEL_ORDER = 'whatsapp,sms,email';
process.env.TENANT_BASE_URL = 'localhost:3000';
process.env.SUPABASE_URL = process.env.SUPABASE_URL || 'https://example.supabase.co';
process.env.SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY || 'test-service-key';

const feeReminderService = require('../services/feeReminderService');

const { parseChannelOrder, normalizeBaseUrl, buildReminderMessage } = feeReminderService._private;

const run = () => {
    const channels = parseChannelOrder();
    assert.deepStrictEqual(channels, ['whatsapp', 'sms', 'email']);

    const baseUrl = normalizeBaseUrl();
    assert.strictEqual(baseUrl, 'http://localhost:3000');

    const message = buildReminderMessage({
        schoolName: 'Green Valley School',
        parentName: 'Ama',
        studentName: 'Kwame',
        amount: 120,
        dueDate: '2026-05-10',
        paymentLink: 'http://localhost:3000/pay?feeId=fee_1',
    });

    assert.ok(message.includes('Green Valley School'));
    assert.ok(message.includes('GHS 120.00'));
    assert.ok(message.includes('Kwame'));
    assert.ok(message.includes('http://localhost:3000/pay?feeId=fee_1'));

    console.log('Fee reminder helper tests passed.');
};

run();
