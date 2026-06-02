const express = require('express');
const router = express.Router();
const supabase = require('../config/db');
const whatsappService = require('../services/whatsappService');
const { generateReportCard } = require('../services/reportPdfService');
const { uploadToSpaces } = require('../services/storageService');
const crypto = require('crypto');

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

                        await supabase.from('notifications').insert({
                            school_id: job.tenant_id,
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

// POST /api/workers/process-report-queue
router.post('/process-report-queue', async (req, res) => {
    try {
        const workerSecret = req.headers['x-worker-secret'];
        if (process.env.WORKER_SECRET && workerSecret !== process.env.WORKER_SECRET) {
            return res.status(401).json({ error: 'Unauthorized worker' });
        }

        // 1. Pop jobs atomically
        const { data: jobs, error: rpcError } = await supabase.rpc('pop_report_jobs', { p_limit: 5 });
        if (rpcError) {
            console.error('Error popping report jobs:', rpcError);
            return res.status(500).json({ error: 'Database error' });
        }

        if (!jobs || jobs.length === 0) {
            return res.json({ status: 'success', processed: 0, message: 'No pending jobs' });
        }

        const results = { success: 0, failures: 0 };

        for (const job of jobs) {
            try {
                let studentIds = [];
                if (job.student_id) {
                    studentIds.push(job.student_id);
                } else {
                    // Fetch all students in class
                    const { data: students } = await supabase.from('students').select('id').eq('current_class_id', job.class_id);
                    if (students) studentIds = students.map(s => s.id);
                }

                for (const sId of studentIds) {
                    const { data: school } = await supabase.from('schools').select('*').eq('id', job.school_id).single();
                    const { data: scores } = await supabase.from('assessment_scores').select('*').eq('student_id', sId).order('id');
                    const { data: term } = await supabase.from('academic_terms').select('*').eq('id', job.term_id).single();
                    const { data: student } = await supabase.from('students').select('*').eq('id', sId).single();

                    const hashInput = JSON.stringify({
                        scores: scores || [],
                        schoolLogo: school?.logo_url,
                        primaryColor: school?.primary_color,
                        headmasterComment: "Static for now", 
                        teacherComment: "Static for now",
                        attendance: "60/62"
                    });
                    const scoresHash = crypto.createHash('md5').update(hashInput).digest('hex');

                    const { data: existingRecords } = await supabase.from('report_cards')
                        .select('*').eq('student_id', sId).eq('term_id', job.term_id).order('generated_at', { ascending: false });
                    const existing = existingRecords?.[0];

                    const isLessThan24h = existing && (new Date() - new Date(existing.generated_at)) < 24 * 60 * 60 * 1000;
                    let pdfUrl = existing?.pdf_url;
                    let isReprint = false;

                    if (existing && existing.status !== 'archived' && existing.scores_hash === scoresHash && isLessThan24h) {
                        // Use cached
                    } else {
                        if (existing?.status === 'published') isReprint = true;
                        
                        const { pdfBuffer, qrToken } = await generateReportCard(job.school_id, job.class_id, job.term_id, sId, false, isReprint);
                        const filename = `term_${job.term_id}/student_${sId}_${Date.now()}.pdf`;
                        pdfUrl = await uploadToSpaces(pdfBuffer, filename, 'application/pdf');

                        if (existing?.status === 'archived') {
                            await supabase.from('report_cards').insert({
                                student_id: sId, term_id: job.term_id, pdf_url: pdfUrl, qr_token: qrToken,
                                status: 'published', scores_hash: scoresHash, generated_by: job.generated_by, parent_id: existing.id
                            });
                        } else if (existing?.status === 'published') {
                            await supabase.from('report_cards').update({
                                pdf_url: pdfUrl, qr_token: qrToken, scores_hash: scoresHash,
                                generated_by: job.generated_by, generated_at: new Date().toISOString(), reprint_count: (existing.reprint_count || 0) + 1
                            }).eq('id', existing.id);
                        } else {
                            if (existing?.status === 'draft') {
                                await supabase.from('report_cards').update({
                                    pdf_url: pdfUrl, qr_token: qrToken, status: 'published', scores_hash: scoresHash,
                                    generated_by: job.generated_by, generated_at: new Date().toISOString()
                                }).eq('id', existing.id);
                            } else {
                                await supabase.from('report_cards').insert({
                                    student_id: sId, term_id: job.term_id, pdf_url: pdfUrl, qr_token: qrToken,
                                    status: 'published', scores_hash: scoresHash, generated_by: job.generated_by
                                });
                            }
                        }
                    }

                    if (pdfUrl && student?.parent_phone) {
                        await supabase.from('receipt_queue').insert({
                            payment_id: null,
                            tenant_id: job.school_id,
                            parent_phone: student.parent_phone,
                            message: `*${school?.name || 'SchoolOS'}* — Report Card Ready!\n\n${student.name}'s ${term?.name} report card is ready.\nView: ${pdfUrl}`,
                            channel: 'whatsapp',
                            status: 'pending'
                        });
                    }
                }

                await supabase.from('report_job_queue').update({ status: 'completed' }).eq('id', job.id);
                results.success++;
            } catch (err) {
                console.error(`Failed to process report job ${job.id}:`, err);
                await supabase.from('report_job_queue').update({ status: 'failed', error_message: err.message }).eq('id', job.id);
                results.failures++;
            }
        }

        return res.json({ status: 'success', processed: jobs.length, results });
    } catch (err) {
        console.error('Report queue processing error:', err);
        return res.status(500).json({ error: 'Internal worker error' });
    }
});

module.exports = router;
