const express = require('express');
const router = express.Router();
const supabase = require('../config/db');
const whatsappService = require('../services/whatsappService');

// POST /api/workers/process-receipt-queue
// This endpoint is meant to be hit by an external cron every 30 seconds
router.post('/process-receipt-queue', async (req, res) => {
    try {
        // Authenticate the worker call (e.g. via a secret header)
        const workerSecret = req.headers['x-worker-secret'];
        if (process.env.WORKER_SECRET && workerSecret !== process.env.WORKER_SECRET) {
            return res.status(401).json({ error: 'Unauthorized worker' });
        }

        // 1. Pop jobs atomically using Postgres FOR UPDATE SKIP LOCKED
        const { data: jobs, error: rpcError } = await supabase.rpc('pop_receipt_jobs', { batch_size: 10 });
        if (rpcError) {
            console.error('Error popping jobs:', rpcError);
            return res.status(500).json({ error: 'Database error' });
        }

        if (!jobs || jobs.length === 0) {
            return res.json({ status: 'success', processed: 0, message: 'No pending jobs' });
        }

        const results = {
            success: 0,
            retries: 0,
            fallbacks: 0,
            hard_failures: 0
        };

        // 2. Process each job
        for (const job of jobs) {
            try {
                let sendResult;
                if (job.channel === 'whatsapp') {
                    // Send WhatsApp
                    sendResult = await whatsappService.sendReceipt(job.parent_phone, {
                        schoolName: 'SchoolOS', // Could be fetched via tenant, simplify for now
                        studentName: 'Student', // Ideally saved in `message` or related record
                        className: 'Class',
                        amount: '0', 
                        method: 'MoMo',
                        date: new Date().toLocaleDateString(),
                        reference: 'RCP'
                    });
                    
                    // Note: If the message is already built as a plain string in `job.message`, 
                    // we should probably just use an endpoint that sends raw text, 
                    // or modify `sendReceipt` to accept raw text. 
                    // Since Arkesel WhatsApp API expects a raw string, we'll send it directly:
                    sendResult = await fetch('https://api.arkesel.com/v2/sms/whatsapp/send', {
                        method: 'POST',
                        headers: {
                            'api-key': process.env.ARKESEL_API_KEY,
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            sender: 'SchoolOS',
                            recipient: [job.parent_phone],
                            message: job.message
                        })
                    }).then(r => {
                        if (!r.ok) throw new Error(`HTTP ${r.status}`);
                        return r.json();
                    });

                } else if (job.channel === 'sms') {
                    // Send SMS (max 160 chars or concatenated)
                    const truncatedMessage = job.message.length > 160 ? job.message.substring(0, 157) + '...' : job.message;
                    sendResult = await whatsappService.sendSms(job.parent_phone, truncatedMessage);
                }

                // If no exception thrown, mark as sent
                await supabase.from('receipt_queue').update({ status: 'sent', processed_at: new Date().toISOString() }).eq('id', job.id);
                results.success++;

            } catch (err) {
                console.error(`Failed to send job ${job.id} via ${job.channel}:`, err.message);

                if (job.retries < 2) {
                    // Re-enqueue for retry
                    await supabase.from('receipt_queue')
                        .update({ status: 'pending', retries: job.retries + 1 })
                        .eq('id', job.id);
                    results.retries++;
                } else {
                    // Retries exhausted
                    if (job.channel === 'whatsapp') {
                        // Fallback to SMS
                        await supabase.from('receipt_queue')
                            .update({ channel: 'sms', status: 'pending', retries: 0 })
                            .eq('id', job.id);
                        results.fallbacks++;
                    } else if (job.channel === 'sms') {
                        // Hard failure: insert to pending_receipts and notify bursar
                        await supabase.from('pending_receipts').insert({
                            payment_id: job.payment_id,
                            tenant_id: job.tenant_id,
                            parent_phone: job.parent_phone,
                            message: job.message,
                            failure_reason: err.message || 'Unknown Arkesel SMS error'
                        });

                        await supabase.from('in_app_notifications').insert({
                            tenant_id: job.tenant_id,
                            title: 'Receipt Delivery Failed',
                            message: `Failed to deliver receipt to ${job.parent_phone} after falling back to SMS.`,
                            type: 'error'
                        }).catch(() => {}); // fire and forget notification

                        // Remove from queue
                        await supabase.from('receipt_queue').delete().eq('id', job.id);
                        results.hard_failures++;
                    }
                }
            }
        }

        return res.json({ status: 'success', processed: jobs.length, results });
    } catch (err) {
        console.error('Queue processing error:', err);
        return res.status(500).json({ error: 'Internal worker error' });
    }
});

module.exports = router;
