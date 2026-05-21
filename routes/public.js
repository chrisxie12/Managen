const express = require('express');
const router = express.Router();
const supabase = require('../config/db');

// GET /api/public/verify-report/:qrToken
router.get('/verify-report/:qrToken', async (req, res) => {
    try {
        const { qrToken } = req.params;

        // 1. Fetch the report card by token
        const { data: reportCard, error: rcError } = await supabase
            .from('report_cards')
            .select(`
                id, 
                term_id, 
                student_id, 
                status, 
                pdf_url,
                students ( name, current_class_id, roll_number ),
                academic_terms ( name )
            `)
            .eq('qr_token', qrToken)
            .single();

        if (rcError || !reportCard) {
            return res.status(404).json({ error: 'Invalid or expired QR token.' });
        }

        // 2. Fetch the Class Name (Requires join since it's nested)
        const { data: currentClass } = await supabase
            .from('classes')
            .select('name')
            .eq('id', reportCard.students.current_class_id)
            .single();

        // 3. Increment Verification Count
        await supabase.rpc('increment_verification_count', { token: qrToken });
        
        // Also insert a log record
        await supabase.from('report_card_verifications').insert({
            report_card_id: reportCard.id,
            qr_token: qrToken,
            verified_by_ip: req.ip || req.connection.remoteAddress
        });

        // 4. Determine authenticity
        const isAuthentic = reportCard.status === 'published' || reportCard.status === 'archived';

        // 5. Build public response (NO CONDUCT REMARKS, NO ATTENDANCE)
        const publicData = {
            authentic: isAuthentic,
            status: reportCard.status,
            student_name: reportCard.students.name,
            student_id: reportCard.students.roll_number,
            class_name: currentClass?.name || 'Unknown Class',
            term_name: reportCard.academic_terms?.name || 'Unknown Term',
            pdf_url: isAuthentic ? reportCard.pdf_url : null,
            message: isAuthentic ? 'This report card is officially verified and authentic.' : 'This report card is still in draft mode.'
        };

        // Optionally, we could fetch and return the subjects + bands here 
        // to display on the verification page directly.

        res.json({ data: publicData });

    } catch (err) {
        console.error('Verify Report Error:', err);
        res.status(500).json({ error: 'Failed to verify report card.' });
    }
});

module.exports = router;
