const PDFDocument = require('pdfkit');
const QRCode = require('qrcode');
const axios = require('axios');
const { PassThrough } = require('stream');
const supabase = require('../config/db');
const { uploadToSpaces } = require('./storageService');
const crypto = require('crypto');

async function generateReportCard(schoolId, classId, termId, studentId, isDraft = false, isReprint = false) {
    return new Promise(async (resolve, reject) => {
        try {
            // 1. Fetch Data
            // School branding
            const { data: school } = await supabase.from('schools').select('*').eq('id', schoolId).single();
            // Student info
            const { data: student } = await supabase.from('students').select('*').eq('id', studentId).single();
            // Class & Term
            const { data: currentClass } = await supabase.from('classes').select('*').eq('id', classId).single();
            const { data: term } = await supabase.from('academic_terms').select('*').eq('id', termId).single();

            // Assessments & Scores
            const { data: assessments } = await supabase.from('assessments').select('*').eq('class_id', classId).eq('term_id', termId);
            const assessmentIds = assessments.map(a => a.id);
            let scores = [];
            if (assessmentIds.length > 0) {
                const { data: scoresData } = await supabase.from('assessment_scores').select('*').in('assessment_id', assessmentIds).eq('student_id', studentId);
                scores = scoresData || [];
            }
            
            const { data: assessmentTypes } = await supabase.from('assessment_types').select('*').eq('school_id', schoolId);
            const { data: gradeRules } = await supabase.from('grade_rules').select('*'); // Should filter by scale

            // 2. Initialize PDFKit
            const doc = new PDFDocument({ margin: 40, size: 'A4' });
            const stream = new PassThrough();
            
            // Collect chunks to return as buffer (for Supabase Storage upload)
            const buffers = [];
            stream.on('data', chunk => buffers.push(chunk));
            stream.on('error', reject);

            doc.pipe(stream);

            const primaryColor = school?.primary_color || '#0A2472';

            // DRAFT Watermark
            if (isDraft) {
                doc.save();
                doc.translate(doc.page.width / 2, doc.page.height / 2)
                   .rotate(-45)
                   .fontSize(80)
                   .fillColor('#EEEEEE')
                   .text('DRAFT - NOT OFFICIAL', -300, -50)
                   .restore();
            }

            // REPRINT Watermark
            if (isReprint && !isDraft) {
                doc.save();
                doc.translate(doc.page.width / 2, doc.page.height / 2)
                   .rotate(-45)
                   .fontSize(80)
                   .fillColor('#FF0000')
                   .fillOpacity(0.3)
                   .text('REPRINT', -300, -50, { align: 'center', width: 600 })
                   .restore();
            }

            // --- HEADER ---
            doc.rect(40, 40, doc.page.width - 80, 80)
               .lineWidth(2).strokeColor(primaryColor).stroke();

            // Fetch and draw School Logo
            let logoDrawn = false;
            if (school?.logo_url) {
                try {
                    const response = await axios.get(school.logo_url, { responseType: 'arraybuffer' });
                    const logoBuffer = Buffer.from(response.data, 'binary');
                    doc.image(logoBuffer, 50, 50, { width: 60, height: 60, fit: [60, 60] });
                    logoDrawn = true;
                } catch (err) {
                    console.error('Failed to fetch school logo:', err.message);
                }
            }
            
            if (!logoDrawn) {
                doc.rect(50, 50, 60, 60).lineWidth(1).strokeColor(primaryColor).stroke();
                doc.fontSize(10).fillColor('#666').text('LOGO', 65, 75);
            }

            // School Info
            doc.fillColor(primaryColor).fontSize(20).font('Helvetica-Bold')
               .text(school?.name || 'School Name', 120, 50);
            doc.fillColor('#333').fontSize(10).font('Helvetica')
               .text(school?.address || 'School Address', 120, 75);
            doc.text(`GES Reg No: ${school?.ges_number || 'N/A'}`, 120, 90);

            // --- STUDENT INFO ---
            doc.moveDown(2);
            doc.rect(40, doc.y, doc.page.width - 80, 70).lineWidth(1).strokeColor('#ccc').stroke();
            const infoY = doc.y + 10;
            doc.fontSize(10).fillColor('#000')
               .text(`Student Name: ${student?.name}`, 50, infoY)
               .text(`Student ID: ${student?.roll_number || student?.id.slice(0,8)}`, 50, infoY + 20)
               .text(`Date of Birth: ${student?.dob || 'N/A'}`, 50, infoY + 40);
            
            doc.text(`Class: ${currentClass?.name}`, 300, infoY)
               .text(`Term: ${term?.name}`, 300, infoY + 20);

            // --- ACADEMIC GRID ---
            doc.moveDown(4);
            const tableTop = doc.y;
            doc.font('Helvetica-Bold').fontSize(10);
            
            // Draw Table Headers
            const headers = ['Subject', 'Cls Ex', 'HW', 'Proj', 'Mid', 'End', 'Total', 'Band'];
            const colWidths = [120, 45, 45, 45, 45, 45, 45, 45];
            let currentX = 40;

            doc.rect(40, tableTop, doc.page.width - 80, 20).fillAndStroke(primaryColor, primaryColor);
            doc.fillColor('#fff');
            
            headers.forEach((h, i) => {
                doc.text(h, currentX + 5, tableTop + 5, { width: colWidths[i], align: 'left' });
                currentX += colWidths[i];
            });

            // Draw Table Rows
            doc.font('Helvetica').fillColor('#000');
            let rowY = tableTop + 20;

            // Group assessments by subject
            const subjectsObj = {};
            assessments.forEach(a => {
                if (!subjectsObj[a.subject_id]) subjectsObj[a.subject_id] = [];
                subjectsObj[a.subject_id].push(a);
            });

            Object.keys(subjectsObj).forEach(subId => {
                const subAssessments = subjectsObj[subId];
                currentX = 40;
                
                // Fetch subject name (Placeholder here, normally join subjects table)
                doc.text(`Subject ${subId.slice(0,4)}`, currentX + 5, rowY + 5, { width: colWidths[0] });
                currentX += colWidths[0];

                let totalWeight = 0;
                let weightedSum = 0;

                // For a real implementation, we map assessment types to columns strictly.
                // Simplified column mapping for demonstration:
                ['Class Exercise', 'Homework', 'Project Work', 'Mid-Term', 'End-Term'].forEach((typeStr, i) => {
                    const typeObj = assessmentTypes.find(t => t.name.includes(typeStr));
                    const assess = subAssessments.find(a => a.assessment_type_id === typeObj?.id);
                    const score = assess ? scores.find(s => s.assessment_id === assess.id) : null;
                    
                    const scoreVal = score && score.score !== null ? score.score : 'N/A';
                    doc.text(scoreVal.toString(), currentX + 5, rowY + 5, { width: colWidths[i+1] });
                    currentX += colWidths[i+1];

                    if (score && score.score !== null && typeObj) {
                        totalWeight += typeObj.weight;
                        weightedSum += (score.score / assess.max_score) * 100 * typeObj.weight;
                    }
                });

                // Total and Band
                const finalScore = totalWeight > 0 ? (weightedSum / totalWeight).toFixed(2) : 'N/A';
                doc.text(finalScore.toString(), currentX + 5, rowY + 5, { width: colWidths[6] });
                currentX += colWidths[6];

                const bandRule = gradeRules.find(r => finalScore !== 'N/A' && finalScore >= r.min_percent && finalScore <= r.max_percent);
                let bandStr = '-';
                if (bandRule) {
                    if (bandRule.grade === 'EE') bandStr = 'EE (Exceeding)';
                    else if (bandRule.grade === 'ME') bandStr = 'ME (Meeting)';
                    else if (bandRule.grade === 'AE') bandStr = 'AE (Approaching)';
                    else if (bandRule.grade === 'BE') bandStr = 'BE (Below)';
                    else bandStr = bandRule.grade;
                }
                
                doc.text(bandStr, currentX + 5, rowY + 5, { width: colWidths[7] });

                doc.rect(40, rowY, doc.page.width - 80, 20).strokeColor(primaryColor).stroke();
                rowY += 20;
            });

            // --- BANDS KEY ---
            doc.moveDown(2);
            doc.font('Helvetica-Bold').fontSize(9).fillColor('#000').text('Competency Bands Key:');
            doc.font('Helvetica').fontSize(8).text('EE: Exceeding Expectations | ME: Meeting Expectations | AE: Approaching Expectations | BE: Below Expectations');

            // --- ATTENDANCE ---
            doc.moveDown(1);
            doc.font('Helvetica-Bold').fontSize(10).text('Attendance:');
            // Hardcoded for now. Should query attendance table.
            doc.font('Helvetica').fontSize(9).text('Present: 60 days | Absent: 2 days | Total: 62 days');

            // --- REMARKS & NEXT TERM ---
            doc.moveDown(2);
            const remarkY = doc.y;
            doc.rect(40, remarkY, (doc.page.width - 80)/2 - 10, 80).stroke();
            doc.text('Class Teacher Remarks:', 45, remarkY + 5);
            // doc.text(remarks.teacher, 45, remarkY + 20);

            doc.rect((doc.page.width / 2) + 10, remarkY, (doc.page.width - 80)/2 - 10, 80).stroke();
            doc.text('Headmaster Remarks:', (doc.page.width / 2) + 15, remarkY + 5);

            doc.moveDown(5);
            doc.text('Promotional Status: Promoted to Next Class', 40, doc.y);
            doc.text(`Next Term Resumption: ${term?.next_term_start || 'TBD'}`, 40, doc.y + 15);

            // --- QR CODE & AUTHENTICITY ---
            const qrToken = crypto.randomBytes(16).toString('hex');
            const qrUrl = `https://getschoolos.me/verify/${qrToken}`;
            const qrDataURI = await QRCode.toDataURL(qrUrl, { color: { dark: primaryColor, light: '#FFFFFF' } });
            
            doc.rect(doc.page.width - 125, doc.page.height - 155, 90, 90).lineWidth(1).strokeColor(primaryColor).stroke();
            doc.image(qrDataURI, doc.page.width - 120, doc.page.height - 150, { width: 80 });
            doc.fontSize(8).text('Scan to Verify', doc.page.width - 110, doc.page.height - 65);

            // --- SIGNATURES ---
            const sigY = doc.page.height - 100;
            doc.moveTo(40, sigY).lineTo(150, sigY).stroke();
            doc.text('Class Teacher', 60, sigY + 5);

            doc.moveTo(200, sigY).lineTo(310, sigY).stroke();
            doc.text('Headmaster', 225, sigY + 5);

            doc.end();

            // We need to return both the buffer and the generated QR token so the caller can save it to the DB
            stream.on('end', () => {
                resolve({ pdfBuffer: Buffer.concat(buffers), qrToken });
            });
            
        } catch (err) {
            reject(err);
        }
    });
}

module.exports = { generateReportCard };
