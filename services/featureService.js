const crypto = require('crypto');
const path = require('path');
const fs = require('fs');
const supabase = require('../config/db');

const TEMP_DIR = path.join(__dirname, '..', 'temp');

if (!fs.existsSync(TEMP_DIR)) fs.mkdirSync(TEMP_DIR, { recursive: true });

class FeatureService {
    // ─── Feature 1: Geofenced Staff Attendance Link ───────────
    async generateAttendanceLink(schoolId, userId, payload) {
        const { expiresInMinutes = 60, targetGroup = 'all' } = payload;
        const expiresAt = new Date(Date.now() + expiresInMinutes * 60000).toISOString();
        const linkCode = crypto.randomBytes(24).toString('hex');

        const { data, error } = await supabase.from('attendance_links').insert({
            id: crypto.randomUUID(),
            school_id: schoolId,
            created_by: userId,
            target_group: targetGroup,
            expires_at: expiresAt,
            is_one_time: true,
            link_code: linkCode,
        }).select().single();

        if (error) throw error;
        return data;
    }

    async verifyGeofenceAndRecord(schoolId, linkCode, userId, latitude, longitude) {
        const { data: link, error: linkErr } = await supabase.from('attendance_links')
            .select('*, school:schools(latitude, longitude, geofence_radius, timezone, name)')
            .eq('link_code', linkCode)
            .eq('is_active', true)
            .single();

        if (linkErr || !link) throw Object.assign(new Error('Invalid or expired attendance link.'), { statusCode: 404 });

        if (new Date(link.expires_at) < new Date()) {
            await supabase.from('attendance_links').update({ is_active: false }).eq('id', link.id);
            throw Object.assign(new Error('This attendance link has expired.'), { statusCode: 410 });
        }

        const school = link.school;
        if (!school.latitude || !school.longitude) {
            throw Object.assign(new Error('School location not configured. Please set school coordinates in settings.'), { statusCode: 400 });
        }

        const distance = this.calculateDistance(school.latitude, school.longitude, latitude, longitude);
        const radius = school.geofence_radius || 100;

        if (distance > radius) {
            await supabase.from('geofence_attendance').insert({
                id: crypto.randomUUID(),
                school_id: schoolId,
                user_id: userId,
                link_id: link.id,
                latitude,
                longitude,
                status: 'rejected',
            });
            throw Object.assign(new Error(`You are ${Math.round(distance)}m away from the school. Please move within ${radius}m of the school to mark attendance.`), { statusCode: 403 });
        }

        if (link.is_one_time) {
            const { data: existing } = await supabase.from('geofence_attendance')
                .select('id').eq('link_id', link.id).eq('user_id', userId).maybeSingle();
            if (existing) throw Object.assign(new Error('This link has already been used.'), { statusCode: 409 });
        }

        const { data: record, error } = await supabase.from('geofence_attendance').insert({
            id: crypto.randomUUID(),
            school_id: schoolId,
            user_id: userId,
            link_id: link.id,
            timestamp: new Date().toISOString(),
            latitude,
            longitude,
            status: 'present',
        }).select('*, user:users(name, email)').single();

        if (error) throw error;

        await supabase.from('attendance_links').update({ is_active: false }).eq('id', link.id);

        const { error: staffAttErr } = await supabase.from('staff_attendance').upsert({
            id: crypto.randomUUID(),
            school_id: schoolId,
            user_id: userId,
            date: new Date().toISOString().split('T')[0],
            status: 'Present',
            check_in: new Date().toISOString().split('T')[1].split('.')[0],
            marked_by: userId,
        }, { onConflict: 'user_id,date' });

        if (staffAttErr) throw staffAttErr;

        return record;
    }

    async getAttendanceLinks(schoolId) {
        const { data, error } = await supabase.from('attendance_links')
            .select('*, created_by_user:users!created_by(name, email)')
            .eq('school_id', schoolId)
            .order('created_at', { ascending: false });
        if (error) throw error;
        return data || [];
    }

    async getGeofenceAttendanceRecords(schoolId, filters = {}) {
        let query = supabase.from('geofence_attendance')
            .select('*, user:users(name, email, department, role_title), link:attendance_links(link_code, target_group, expires_at)', { count: 'exact' })
            .eq('school_id', schoolId)
            .order('timestamp', { ascending: false });

        if (filters.user_id) query = query.eq('user_id', filters.user_id);
        if (filters.status) query = query.eq('status', filters.status);
        if (filters.date_from) query = query.gte('timestamp', filters.date_from);
        if (filters.date_to) query = query.lte('timestamp', filters.date_to);

        const page = Math.max(1, Number.parseInt(filters.page) || 1);
        const limit = Math.min(200, Math.max(1, Number.parseInt(filters.limit) || 50));
        query = query.range((page - 1) * limit, page * limit - 1);

        const { data, count, error } = await query;
        if (error) throw error;
        return { records: data || [], total: count || 0, page, limit };
    }

    // ─── Feature 2: Automated Report Card Generation ─────────
    async uploadReportCardTemplate(schoolId, userId, file) {
        const uploadDir = path.join(TEMP_DIR, 'report_templates', schoolId);
        if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

        const fileName = `${crypto.randomUUID()}-${file.originalname}`;
        const filePath = path.join(uploadDir, fileName);
        fs.writeFileSync(filePath, file.buffer);

        const { data, error } = await supabase.from('report_card_templates').insert({
            id: crypto.randomUUID(),
            school_id: schoolId,
            name: file.originalname.replace(/\.docx$/i, ''),
            file_path: filePath,
            file_name: file.originalname,
            uploaded_by: userId,
        }).select().single();

        if (error) { fs.unlinkSync(filePath); throw error; }
        return data;
    }

    async getReportCardTemplates(schoolId) {
        const { data, error } = await supabase.from('report_card_templates')
            .select('*, uploader:users!uploaded_by(name, email)')
            .eq('school_id', schoolId)
            .eq('is_active', true)
            .order('created_at', { ascending: false });
        if (error) throw error;
        return data || [];
    }

    async generateReportCards(schoolId, payload) {
        const { template_id, class_id, term_id, session_id, scale_id } = payload;

        const { data: template, error: tErr } = await supabase.from('report_card_templates')
            .select('*').eq('id', template_id).eq('school_id', schoolId).single();
        if (tErr || !template) throw Object.assign(new Error('Template not found.'), { statusCode: 404 });

        const { data: students, error: sErr } = await supabase.from('students')
            .select('id, name, admission_no, class_name')
            .eq('tenant_id', schoolId)
            .eq('is_active', true);
        if (sErr) throw sErr;

        const { data: classData } = await supabase.from('classes').select('id, name').eq('id', class_id).single();
        const { data: termData } = await supabase.from('academic_terms').select('id, name').eq('id', term_id).single();

        const examService = require('./examService');
        const gradResult = await examService.calculateTermGrades(schoolId, class_id, term_id, session_id, scale_id);

        const mammoth = require('mammoth');
        const templateBuffer = fs.readFileSync(template.file_path);

        const generated = [];

        for (const studentResult of gradResult.results) {
            const student = students.find(s => s.id === studentResult.student_id);
            if (!student) continue;

            const subjectScoresHtml = (studentResult.subjects || []).map(subj =>
                `<tr><td>${subj.subject_name}</td><td>${subj.score}/${subj.max_score}</td><td>${subj.percentage.toFixed(1)}%</td></tr>`
            ).join('');

            const placeholders = {
                student_name: student.name,
                roll_no: student.admission_no || 'N/A',
                class: classData?.name || student.class_name,
                term: termData?.name || 'Current Term',
                subject_scores: subjectScoresHtml,
                total_score: studentResult.total_score,
                total_max_score: studentResult.total_max_score,
                percentage: studentResult.average,
                grade: studentResult.grade,
                remark: this.getRemark(Number(studentResult.average)),
            };

            let html;
            try {
                const result = await mammoth.convertToHtml({ buffer: templateBuffer });
                html = result.value;
            } catch {
                html = this.buildDefaultHtml(placeholders);
            }

            for (const [key, value] of Object.entries(placeholders)) {
                html = html.replace(new RegExp(`\\{\\{\\s*${key}\\s*\\}\\}`, 'gi'), String(value));
            }

            const fullHtml = `<!DOCTYPE html><html><head><meta charset="utf-8"><style>
                body { font-family: 'Times New Roman', serif; padding: 40px; color: #333; }
                .header { text-align: center; border-bottom: 2px solid #0A2472; padding-bottom: 20px; margin-bottom: 20px; }

                .header h1 { color: #0A2472; margin: 0; font-size: 24px; }

                .scores-table th { background: #0A2472; color: white; padding: 8px 12px; text-align: left; }

                .summary-item .value { font-size: 22px; font-weight: 700; color: #0A2472; }

            <h3 style="color:#0A2472;">Subject Scores</h3>
            <table class="scores-table"><thead><tr><th>Subject</th><th>Score</th><th>Percentage</th></tr></thead>
            <tbody>${subjectScoresHtml}</tbody></table>
            <div class="summary">
                <div class="summary-item"><div class="label">Total Score</div><div class="value">${placeholders.total_score}</div></div>
                <div class="summary-item"><div class="label">Percentage</div><div class="value">${placeholders.percentage}%</div></div>
                <div class="summary-item"><div class="label">Grade</div><div class="value">${placeholders.grade}</div></div>
            </div>
            <div class="remark"><strong>Remark:</strong> ${placeholders.remark}</div>
            </body></html>`;

            let pdfPath = null;
            try {
                const pdfDir = path.join(TEMP_DIR, 'report_cards', schoolId);
                if (!fs.existsSync(pdfDir)) fs.mkdirSync(pdfDir, { recursive: true });
                pdfPath = path.join(pdfDir, `${student.id}_${crypto.randomUUID().slice(0, 8)}.pdf`);
                await this.htmlToPdf(fullHtml, pdfPath);
            } catch (pdfErr) {
                console.error('PDF generation error for student', student.id, pdfErr);
            }

            const { data: card, error: cErr } = await supabase.from('student_report_cards').upsert({
                id: crypto.randomUUID(),
                school_id: schoolId,
                student_id: student.id,
                template_id,
                class_id,
                term_id,
                session_id: session_id || null,
                pdf_path: pdfPath,
                status: pdfPath ? 'generated' : 'draft',
            }, { onConflict: 'student_id,term_id,session_id,template_id' }).select().single();

            if (!cErr) generated.push({ ...card, student_name: student.name });
        }

        return { generated: generated.length, total: gradResult.results.length };
    }

    async getStudentReportCards(schoolId, filters = {}) {
        let query = supabase.from('student_report_cards')
            .select('*, student:students(name, admission_no, class_name), template:report_card_templates(name), class:classes(name), term:academic_terms(name)')
            .eq('school_id', schoolId)
            .order('generated_at', { ascending: false });

        if (filters.term_id) query = query.eq('term_id', filters.term_id);
        if (filters.class_id) query = query.eq('class_id', filters.class_id);
        if (filters.student_id) query = query.eq('student_id', filters.student_id);
        if (filters.status) query = query.eq('status', filters.status);

        const { data, error } = await query;
        if (error) throw error;
        return data || [];
    }

    async downloadReportCardsZip(schoolId, filters = {}) {
        const cards = await this.getStudentReportCards(schoolId, filters);
        const archiver = require('archiver');
        const zipPath = path.join(TEMP_DIR, `report_cards_${schoolId}_${Date.now()}.zip`);

        return new Promise((resolve, reject) => {
            const output = fs.createWriteStream(zipPath);
            const archive = archiver('zip', { zlib: { level: 9 } });
            output.on('close', () => resolve({ zipPath, count: cards.length }));
            archive.on('error', reject);
            archive.pipe(output);

            let addedCount = 0;
            for (const card of cards) {
                if (card.pdf_path && fs.existsSync(card.pdf_path)) {
                    archive.file(card.pdf_path, {
                        name: `${card.student?.name || 'student'}_${card.student?.admission_no || card.student_id}.pdf`
                    });
                    addedCount++;
                }
            }

            if (addedCount === 0) {
                archive.append('No PDF files generated yet.', { name: 'README.txt' });
            }

            archive.finalize();
        });
    }

    // ─── Feature 3: Bulk Data Import ────────────────────────
    async previewImport(schoolId, entityType, file) {
        const XLSX = require('xlsx');
        const workbook = XLSX.read(file.buffer, { type: 'buffer' });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const rawRows = XLSX.utils.sheet_to_json(sheet, { defval: '' });

        if (rawRows.length === 0) throw Object.assign(new Error('The file is empty.'), { statusCode: 400 });

        const requiredColumns = {
            students: ['name', 'class', 'roll number', 'parent contact'],
            teachers: ['name', 'employee id', 'department', 'email', 'phone'],
            'non-teaching': ['name', 'employee id', 'role', 'phone'],
        };

        const colMap = (entityType === 'non-teaching') ? requiredColumns['non-teaching'] : requiredColumns[entityType];
        if (!colMap) throw Object.assign(new Error('Invalid entity type.'), { statusCode: 400 });

        const headers = Object.keys(rawRows[0]).map(h => h.toLowerCase().trim());
        const missing = colMap.filter(c => !headers.some(h => h.includes(c) || c.includes(h)));

        const columnMapping = {};
        colMap.forEach(c => {
            const found = headers.find(h => h.includes(c) || c.includes(h));
            if (found) columnMapping[c] = found;
        });

        const errors = [];
        const validRows = rawRows.slice(0, 5).map((row, idx) => {
            const mapped = {};
            for (const [standard, original] of Object.entries(columnMapping)) {
                mapped[standard] = row[original] || '';
            }
            for (const col of colMap) {
                const val = mapped[col] || '';
                if (!val.toString().trim()) {
                    errors.push({ row: idx + 2, field: col, message: `${col} is required` });
                }
            }
            return mapped;
        });

        const allRows = rawRows.map((row, idx) => {
            const mapped = {};
            for (const [standard, original] of Object.entries(columnMapping)) {
                mapped[standard] = row[original] || '';
            }
            return mapped;
        });

        return {
            preview: validRows,
            totalRows: rawRows.length,
            entityType,
            requiredColumns: colMap,
            columnMapping,
            errors: errors.slice(0, 20),
            allRows,
        };
    }

    async confirmImport(schoolId, entityType, file) {
        const preview = await this.previewImport(schoolId, entityType, file);
        if (preview.errors.length > 0) throw Object.assign(new Error('Please fix validation errors before importing.'), { statusCode: 400 });

        const XLSX = require('xlsx');
        const workbook = XLSX.read(file.buffer, { type: 'buffer' });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const rawRows = XLSX.utils.sheet_to_json(sheet, { defval: '' });

        const importErrors = [];
        let imported = 0;
        let skipped = 0;

        for (let i = 0; i < rawRows.length; i++) {
            const row = rawRows[i];
            try {
                const mapped = {};
                for (const [standard, original] of Object.entries(preview.columnMapping)) {
                    mapped[standard] = (row[original] || '').toString().trim();
                }

                if (entityType === 'students') {
                    const contactEmail = mapped['parent contact'];
                    const emailField = contactEmail?.includes('@') ? contactEmail : null;
                    const name = mapped['name'];
                    const className = mapped['class'];
                    const rollNo = mapped['roll number'];

                    if (!name || !className) {
                        importErrors.push({ row: i + 2, message: 'Name and class are required' });
                        continue;
                    }

                    const existing = emailField ? await supabase.from('students')
                        .select('id').eq('tenant_id', schoolId).eq('parent_email', emailField).maybeSingle() : null;

                    if (existing?.data) {
                        skipped++;
                        continue;
                    }

                    await supabase.from('students').insert({
                        id: crypto.randomUUID(),
                        tenant_id: schoolId,
                        name,
                        class_name: className,
                        admission_no: rollNo,
                        parent_phone: mapped['parent contact']?.replace(/[^0-9+]/g, '') || null,
                        parent_email: emailField,
                        is_active: true,
                    });
                    imported++;
                } else if (entityType === 'teachers') {
                    const email = mapped['email'];
                    if (!email) { importErrors.push({ row: i + 2, message: 'Email is required' }); continue; }

                    const existing = await supabase.from('users')
                        .select('id').eq('tenant_id', schoolId).eq('email', email).maybeSingle();

                    if (existing?.data) {
                        await supabase.from('users').update({
                            name: mapped['name'],
                            department: mapped['department'],
                            phone: mapped['phone'],
                            employee_id: mapped['employee id'],
                        }).eq('id', existing.data.id);
                        imported++;
                        continue;
                    }

                    const bcrypt = require('bcryptjs');
                    const tempPass = crypto.randomBytes(4).toString('hex');

                    await supabase.from('users').insert({
                        id: crypto.randomUUID(),
                        tenant_id: schoolId,
                        full_name: mapped['name'],
                        name: mapped['name'],
                        email,
                        phone: mapped['phone']?.replace(/[^0-9+]/g, '') || null,
                        role: 'teacher',
                        department: mapped['department'] || null,
                        employee_id: mapped['employee id'] || null,
                        password: await bcrypt.hash(tempPass, 12),
                        is_active: true,
                    });
                    imported++;
                } else if (entityType === 'non-teaching') {
                    const phone = mapped['phone'];
                    if (!phone) { importErrors.push({ row: i + 2, message: 'Phone is required' }); continue; }

                    const existing = await supabase.from('users')
                        .select('id').eq('tenant_id', schoolId).eq('phone', phone).maybeSingle();

                    if (existing?.data) { skipped++; continue; }

                    const bcrypt = require('bcryptjs');
                    const tempPass = crypto.randomBytes(4).toString('hex');

                    await supabase.from('users').insert({
                        id: crypto.randomUUID(),
                        tenant_id: schoolId,
                        full_name: mapped['name'],
                        name: mapped['name'],
                        phone: phone?.replace(/[^0-9+]/g, '') || null,
                        role: 'staff',
                        role_title: mapped['role'] || null,
                        employee_id: mapped['employee id'] || null,
                        password: await bcrypt.hash(tempPass, 12),
                        is_active: true,
                    });
                    imported++;
                }
            } catch (err) {
                importErrors.push({ row: i + 2, message: err.message });
            }
        }

        return { imported, skipped, errors: importErrors };
    }

    // ─── Feature 4: Enhanced Students/Staff Queries ─────────
    async getStudentsEnhanced(schoolId, filters = {}) {
        const { view, className, search, sortBy = 'name', sortOrder = 'asc', page = 1, limit = 50 } = filters;
        const parsedPage = Math.max(1, Number.parseInt(page));
        const parsedLimit = Math.min(100, Math.max(1, Number.parseInt(limit)));

        let query = supabase.from('students')
            .select('*', { count: 'exact' })
            .eq('tenant_id', schoolId);

        if (view === 'by_class' && className) query = query.eq('class_name', className);

        if (search) {
            const like = `%${search}%`;
            query = query.or(`name.ilike.${like},admission_no.ilike.${like},parent_phone.ilike.${like}`);
        }

        const allowedSorts = ['name', 'admission_no', 'created_at', 'class_name'];
        const field = allowedSorts.includes(sortBy) ? sortBy : 'name';
        const order = sortOrder === 'desc' ? false : true;
        query = query.order(field, { ascending: order });

        query = query.range((parsedPage - 1) * parsedLimit, parsedPage * parsedLimit - 1);

        const { data, count, error } = await query;
        if (error) throw error;
        return { students: data || [], total: count || 0, page: parsedPage, limit: parsedLimit };
    }

    async getTeachersEnhanced(schoolId, filters = {}) {
        const { view, department, search, sortBy = 'name', sortOrder = 'asc', page = 1, limit = 50 } = filters;
        const parsedPage = Math.max(1, Number.parseInt(page));
        const parsedLimit = Math.min(100, Math.max(1, Number.parseInt(limit)));

        let query = supabase.from('users')
            .select('id, tenant_id, full_name, name, email, phone, role, is_active, created_at, employee_id, department, role_title', { count: 'exact' })
            .eq('tenant_id', schoolId)
            .eq('role', 'teacher');

        if (view === 'by_department' && department) query = query.eq('department', department);

        if (search) {
            const like = `%${search}%`;
            query = query.or(`name.ilike.${like},full_name.ilike.${like},email.ilike.${like},employee_id.ilike.${like},department.ilike.${like}`);
        }

        const allowedSorts = ['name', 'full_name', 'email', 'employee_id', 'department', 'created_at'];
        const field = allowedSorts.includes(sortBy) ? sortBy : 'name';
        const order = sortOrder === 'desc' ? false : true;
        query = query.order(field, { ascending: order });

        query = query.range((parsedPage - 1) * parsedLimit, parsedPage * parsedLimit - 1);

        const { data, count, error } = await query;
        if (error) throw error;
        return { teachers: data || [], total: count || 0, page: parsedPage, limit: parsedLimit };
    }

    async getNonTeachingStaff(schoolId, filters = {}) {
        const { view, role_title, search, sortBy = 'name', sortOrder = 'asc', page = 1, limit = 50 } = filters;
        const parsedPage = Math.max(1, Number.parseInt(page));
        const parsedLimit = Math.min(100, Math.max(1, Number.parseInt(limit)));

        let query = supabase.from('users')
            .select('id, tenant_id, full_name, name, email, phone, role, is_active, created_at, employee_id, department, role_title', { count: 'exact' })
            .eq('tenant_id', schoolId)
            .eq('role', 'staff');

        if (view === 'by_role' && role_title) query = query.eq('role_title', role_title);

        if (search) {
            const like = `%${search}%`;
            query = query.or(`name.ilike.${like},full_name.ilike.${like},employee_id.ilike.${like},role_title.ilike.${like}`);
        }

        const allowedSorts = ['name', 'full_name', 'employee_id', 'role_title', 'created_at'];
        const field = allowedSorts.includes(sortBy) ? sortBy : 'name';
        const order = sortOrder === 'desc' ? false : true;
        query = query.order(field, { ascending: order });

        query = query.range((parsedPage - 1) * parsedLimit, parsedPage * parsedLimit - 1);

        const { data, count, error } = await query;
        if (error) throw error;
        return { staff: data || [], total: count || 0, page: parsedPage, limit: parsedLimit };
    }

    // ─── Feature 5: Daily Staff Sign-in/Sign-out ────────────
    async generateDailyAttendanceLinks(schoolId) {
        const school = await this.getSchool(schoolId);
        const timezone = school.timezone || 'Africa/Accra';
        const now = new Date();
        const dateStr = now.toISOString().split('T')[0];

        const signInStart = school.sign_in_start || '06:00:00';
        const signInEnd = school.sign_in_end || '14:00:00';
        const signOutStart = school.sign_out_start || '14:30:00';
        const signOutEnd = school.sign_out_end || '15:30:00';

        const results = [];

        for (const linkType of ['signin', 'signout']) {
            const linkCode = crypto.randomBytes(24).toString('hex');
            const activeFrom = linkType === 'signin' ? signInStart : signOutStart;
            const activeUntil = linkType === 'signin' ? signInEnd : signOutEnd;

            const { data, error } = await supabase.from('daily_attendance_links').upsert({
                id: crypto.randomUUID(),
                school_id: schoolId,
                link_type: linkType,
                link_code: linkCode,
                date: dateStr,
                active_from: activeFrom,
                active_until: activeUntil,
            }, { onConflict: 'school_id,date,link_type' }).select().single();

            if (!error) results.push(data);
        }

        return results;
    }

    async processSignInOut(schoolId, linkCode, userId) {
        const { data: link, error: linkErr } = await supabase.from('daily_attendance_links')
            .select('*').eq('link_code', linkCode).eq('is_active', true).single();

        if (linkErr || !link) throw Object.assign(new Error('Invalid or expired attendance link.'), { statusCode: 404 });

        const school = await this.getSchool(schoolId);
        const timezone = school.timezone || 'Africa/Accra';
        const now = new Date();
        const nowTime = now.toISOString().split('T')[1].split('.')[0];

        if (nowTime < link.active_from || nowTime > link.active_until) {
            throw Object.assign(new Error(`This ${link.link_type === 'signin' ? 'sign-in' : 'sign-out'} link is only valid between ${link.active_from.slice(0, 5)} and ${link.active_until.slice(0, 5)}.`), { statusCode: 403 });
        }

        const dateStr = link.date;
        const updateData = {};
        if (link.link_type === 'signin') {
            updateData.sign_in_time = now.toISOString();
            updateData.sign_in_link_id = link.id;
            updateData.sign_in_status = 'on_time';
        } else {
            updateData.sign_out_time = now.toISOString();
            updateData.sign_out_link_id = link.id;
            updateData.sign_out_status = 'on_time';
        }

        const { data: existing } = await supabase.from('daily_staff_attendance')
            .select('id').eq('school_id', schoolId).eq('user_id', userId).eq('date', dateStr).maybeSingle();

        let result;
        if (existing) {
            const { data, error } = await supabase.from('daily_staff_attendance')
                .update(updateData).eq('id', existing.id).select('*, user:users(name, email, role_title)').single();
            if (error) throw error;
            result = data;
        } else {
            const { data, error } = await supabase.from('daily_staff_attendance').insert({
                id: crypto.randomUUID(),
                school_id: schoolId,
                user_id: userId,
                date: dateStr,
                ...updateData,
            }).select('*, user:users(name, email, role_title)').single();
            if (error) throw error;
            result = data;
        }

        return result;
    }

    async overrideStaffAttendance(schoolId, recordId, userId, payload) {
        const { sign_in_time, sign_out_time, sign_in_status, sign_out_status, reason } = payload;
        const updateData = { override_by: userId, override_reason: reason || null };
        if (sign_in_time !== undefined) updateData.sign_in_time = sign_in_time;
        if (sign_out_time !== undefined) updateData.sign_out_time = sign_out_time;
        if (sign_in_status !== undefined) updateData.sign_in_status = sign_in_status;
        if (sign_out_status !== undefined) updateData.sign_out_status = sign_out_status;

        const { data, error } = await supabase.from('daily_staff_attendance')
            .update(updateData).eq('id', recordId).eq('school_id', schoolId)
            .select('*, user:users(name, email, role_title)').single();
        if (error) throw error;
        return data;
    }

    async getDailyStaffAttendance(schoolId, filters = {}) {
        let query = supabase.from('daily_staff_attendance')
            .select('*, user:users(name, email, role_title, department)', { count: 'exact' })
            .eq('school_id', schoolId)
            .order('date', { ascending: false });

        if (filters.date) query = query.eq('date', filters.date);
        if (filters.user_id) query = query.eq('user_id', filters.user_id);
        if (filters.date_from) query = query.gte('date', filters.date_from);
        if (filters.date_to) query = query.lte('date', filters.date_to);

        const page = Math.max(1, Number.parseInt(filters.page) || 1);
        const limit = Math.min(200, Math.max(1, Number.parseInt(filters.limit) || 50));
        query = query.range((page - 1) * limit, page * limit - 1);

        const { data, count, error } = await query;
        if (error) throw error;
        return { records: data || [], total: count || 0, page, limit };
    }

    async getCurrentDailyLinks(schoolId) {
        const today = new Date().toISOString().split('T')[0];
        const { data, error } = await supabase.from('daily_attendance_links')
            .select('*')
            .eq('school_id', schoolId)
            .eq('date', today)
            .eq('is_active', true);
        if (error) throw error;
        return data || [];
    }

    // ─── Helpers ─────────────────────────────────────────
    calculateDistance(lat1, lon1, lat2, lon2) {
        const R = 6371000;
        const dLat = this.toRad(lat2 - lat1);
        const dLon = this.toRad(lon2 - lon1);
        const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(this.toRad(lat1)) * Math.cos(this.toRad(lat2)) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    }

    toRad(deg) { return deg * (Math.PI / 180); }

    getRemark(percentage) {
        if (percentage >= 80) return 'Excellent performance. Keep up the great work!';
        if (percentage >= 70) return 'Very good. Consistent effort shown.';
        if (percentage >= 60) return 'Good. Room for improvement in some areas.';
        if (percentage >= 50) return 'Satisfactory. Needs to put in more effort.';
        return 'Needs significant improvement. Please seek extra help.';
    }

    async getSchool(schoolId) {
        const { data, error } = await supabase.from('schools').select('*').eq('id', schoolId).single();
        if (error) throw error;
        return data;
    }

    async htmlToPdf(html, outputPath) {
        const puppeteer = require('puppeteer');
        const browser = await puppeteer.launch({
            headless: true,
            args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
        });
        try {
            const page = await browser.newPage();
            await page.setContent(html, { waitUntil: 'networkidle0' });
            await page.pdf({
                path: outputPath,
                format: 'A4',
                margin: { top: '20mm', bottom: '20mm', left: '15mm', right: '15mm' },
                printBackground: true,
            });
        } finally {
            await browser.close();
        }
    }

    buildDefaultHtml(placeholders) {
        return `<div class="header"><h1>REPORT CARD</h1></div>
        <table class="info-table"><tr><td>Student Name</td><td>${placeholders.student_name}</td></tr>
        <tr><td>Roll No</td><td>${placeholders.roll_no}</td></tr>
        <tr><td>Class</td><td>${placeholders.class}</td></tr>
        <tr><td>Term</td><td>${placeholders.term}</td></tr></table>
        <h3>Subject Scores</h3>
        <table class="scores-table"><thead><tr><th>Subject</th><th>Score</th><th>Percentage</th></tr></thead>
        <tbody>${placeholders.subject_scores}</tbody></table>
        <div class="summary">
            <div class="summary-item"><div class="label">Total Score</div><div class="value">${placeholders.total_score}</div></div>
            <div class="summary-item"><div class="label">Percentage</div><div class="value">${placeholders.percentage}%</div></div>
            <div class="summary-item"><div class="label">Grade</div><div class="value">${placeholders.grade}</div></div>
        </div>
        <div class="remark"><strong>Remark:</strong> ${placeholders.remark}</div>`;
    }
}

module.exports = new FeatureService();
