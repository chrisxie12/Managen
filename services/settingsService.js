const crypto = require('crypto');
const supabase = require('../config/db');
const emailService = require('./emailService');
const smsService = require('./smsService');
const whatsappService = require('./whatsappService');

const SCHOOL_FIELDS = [
  'name', 'email', 'phone', 'address', 'website', 'country',
  'currency', 'currency_symbol', 'timezone', 'locale', 'date_format', 'week_starts_on',
  'logo_url', 'primary_color', 'accent_color',
  'notification_email', 'notification_phone',
  'enable_sms_notifications', 'enable_email_notifications',
  'enable_whatsapp_notifications', 'enable_in_app_notifications',
  'auto_publish_report_cards', 'enable_online_payments',
  'enable_fee_reminders', 'enable_attendance_tracking',
  'enable_parent_portal', 'enable_student_portal',
];

const BRANDING_FIELDS = ['logo_url', 'primary_color', 'accent_color'];
const NOTIFICATION_FIELDS = [
  'notification_email', 'notification_phone',
  'enable_sms_notifications', 'enable_email_notifications',
  'enable_whatsapp_notifications', 'enable_in_app_notifications',
  'auto_publish_report_cards', 'enable_fee_reminders',
];

const ACADEMIC_FIELDS = [
  'academic_year', 'current_term', 'term_start_date', 'term_end_date',
  'grading_system', 'pass_mark', 'class_settings', 'attendance_settings',
  'grade_boundaries', 'metadata',
];

const FEE_FIELDS = [
  'payment_methods', 'fee_categories', 'late_fee_settings',
  'receipt_settings', 'metadata',
];

class SettingsService {
  // ─── Profile ──────────────────────────────────────────────────
  async getProfile(schoolId) {
    const { data, error } = await supabase.from('schools').select('*').eq('id', schoolId).single();
    if (error) throw error;
    return data;
  }

  async updateProfile(schoolId, payload) {
    const allowed = {};
    for (const key of SCHOOL_FIELDS) {
      if (payload[key] !== undefined) allowed[key] = payload[key];
    }
    if (Object.keys(allowed).length === 0) return this.getProfile(schoolId);

    const { data, error } = await supabase.from('schools').update(allowed).eq('id', schoolId).select().single();
    if (error) throw error;
    return data;
  }

  // ─── Branding ──────────────────────────────────────────────────
  async updateBranding(schoolId, payload) {
    const allowed = {};
    for (const key of BRANDING_FIELDS) {
      if (payload[key] !== undefined) allowed[key] = payload[key];
    }
    if (Object.keys(allowed).length === 0) return this.getProfile(schoolId);

    const { data, error } = await supabase.from('schools').update(allowed).eq('id', schoolId).select().single();
    if (error) throw error;
    return data;
  }

  // ─── Key-Value Settings ────────────────────────────────────────
  async getSettingsMap(schoolId) {
    const { data, error } = await supabase.from('school_settings').select('key, value').eq('school_id', schoolId);
    if (error) throw error;
    const map = {};
    (data || []).forEach(s => { map[s.key] = s.value; });
    return map;
  }

  async updateSetting(schoolId, key, value) {
    const { data, error } = await supabase.from('school_settings').upsert({
      school_id: schoolId, key, value: typeof value === 'object' ? value : { value },
      updated_at: new Date().toISOString(),
    }, { onConflict: 'school_id, key' }).select().single();
    if (error) throw error;
    return data;
  }

  async getSetting(schoolId, key) {
    const { data, error } = await supabase.from('school_settings')
      .select('value').eq('school_id', schoolId).eq('key', key).maybeSingle();
    if (error) throw error;
    const raw = data?.value;
    if (typeof raw === 'object' && raw !== null && 'balance' in raw) return raw;
    if (typeof raw === 'object' && raw !== null && 'value' in raw) return raw.value;
    return raw;
  }

  async deleteSetting(schoolId, key) {
    const { error } = await supabase.from('school_settings').delete().eq('school_id', schoolId).eq('key', key);
    if (error) throw error;
    return true;
  }

  // ─── Notification Preferences ──────────────────────────────────
  async updateNotificationPrefs(schoolId, payload) {
    const allowed = {};
    for (const key of NOTIFICATION_FIELDS) {
      if (payload[key] !== undefined) allowed[key] = payload[key];
    }
    if (Object.keys(allowed).length === 0) return this.getProfile(schoolId);

    const { data, error } = await supabase.from('schools').update(allowed).eq('id', schoolId).select().single();
    if (error) throw error;
    return data;
  }

  // ─── Academic Settings ──────────────────────────────────────────
  async updateAcademic(schoolId, payload) {
    const allowed = {};
    for (const key of ACADEMIC_FIELDS) {
      if (payload[key] !== undefined) allowed[key] = payload[key];
    }
    if (Object.keys(allowed).length === 0) return this.getProfile(schoolId);

    const { data, error } = await supabase.from('schools').update(allowed).eq('id', schoolId).select().single();
    if (error) throw error;
    return data;
  }

  // ─── Fee Settings ────────────────────────────────────────────────
  async updateFee(schoolId, payload) {
    const allowed = {};
    for (const key of FEE_FIELDS) {
      if (payload[key] !== undefined) allowed[key] = payload[key];
    }
    if (Object.keys(allowed).length === 0) return this.getProfile(schoolId);

    const { data, error } = await supabase.from('schools').update(allowed).eq('id', schoolId).select().single();
    if (error) throw error;
    return data;
  }

  async testEmail(to, subject, text) {
    try {
      const result = await emailService.send({ to, subject, text });
      return { success: result.success, message: result.success ? 'Email sent successfully.' : (result.error?.message || 'Send failed') };
    } catch (err) {
      return { success: false, message: err.message || 'Email send failed' };
    }
  }

  async testSms(to, message) {
    try {
      const result = await smsService.send({ to, message });
      return { success: result.success, message: result.success ? 'SMS sent successfully.' : (result.error?.message || 'Send failed') };
    } catch (err) {
      return { success: false, message: err.message || 'SMS send failed' };
    }
  }

  async testWhatsApp(to, body) {
    try {
      const result = await whatsappService.send({ to, body });
      return { success: result.success, message: result.success ? 'WhatsApp sent successfully.' : (result.error?.message || 'Send failed') };
    } catch (err) {
      return { success: false, message: err.message || 'WhatsApp send failed' };
    }
  }

  // ─── Academic Terms ────────────────────────────────────────────
  async getTerms(schoolId) {
    const { data, error } = await supabase.from('academic_terms').select('*').eq('school_id', schoolId).order('start_date', { ascending: false });
    if (error) throw error;
    return data || [];
  }

  async createTerm(schoolId, { name, start_date, end_date, is_current }) {
    if (is_current) {
      await supabase.from('academic_terms').update({ is_current: false }).eq('school_id', schoolId).eq('is_current', true);
    }
    const { data, error } = await supabase.from('academic_terms').insert({
      id: crypto.randomUUID(), school_id: schoolId, name, start_date, end_date, is_current: !!is_current,
    }).select().single();
    if (error) throw error;
    return data;
  }

  async updateTerm(schoolId, id, { name, start_date, end_date, is_current }) {
    if (is_current) {
      await supabase.from('academic_terms').update({ is_current: false }).eq('school_id', schoolId).eq('is_current', true);
    }
    const payload = {};
    if (name !== undefined) payload.name = name;
    if (start_date !== undefined) payload.start_date = start_date;
    if (end_date !== undefined) payload.end_date = end_date;
    if (is_current !== undefined) payload.is_current = is_current;

    const { data, error } = await supabase.from('academic_terms').update(payload).eq('id', id).eq('school_id', schoolId).select().single();
    if (error) {
      if (error.code === 'PGRST116') { const e = new Error('Term not found.'); e.statusCode = 404; throw e; }
      throw error;
    }
    return data;
  }

  async deleteTerm(schoolId, id) {
    const { error } = await supabase.from('academic_terms').delete().eq('id', id).eq('school_id', schoolId);
    if (error) throw error;
    return true;
  }

  // ─── Academic Sessions ─────────────────────────────────────────
  async getSessions(schoolId) {
    const { data, error } = await supabase.from('academic_sessions').select('*').eq('school_id', schoolId).order('start_date', { ascending: false });
    if (error) throw error;
    return data || [];
  }

  async createSession(schoolId, { name, start_date, end_date, is_current }) {
    if (is_current) {
      await supabase.from('academic_sessions').update({ is_current: false }).eq('school_id', schoolId).eq('is_current', true);
    }
    const { data, error } = await supabase.from('academic_sessions').insert({
      id: crypto.randomUUID(), school_id: schoolId, name, start_date, end_date, is_current: !!is_current,
    }).select().single();
    if (error) throw error;
    return data;
  }

  async updateSession(schoolId, id, { name, start_date, end_date, is_current }) {
    if (is_current) {
      await supabase.from('academic_sessions').update({ is_current: false }).eq('school_id', schoolId).eq('is_current', true);
    }
    const payload = {};
    if (name !== undefined) payload.name = name;
    if (start_date !== undefined) payload.start_date = start_date;
    if (end_date !== undefined) payload.end_date = end_date;
    if (is_current !== undefined) payload.is_current = is_current;

    const { data, error } = await supabase.from('academic_sessions').update(payload).eq('id', id).eq('school_id', schoolId).select().single();
    if (error) {
      if (error.code === 'PGRST116') { const e = new Error('Session not found.'); e.statusCode = 404; throw e; }
      throw error;
    }
    return data;
  }

  async deleteSession(schoolId, id) {
    const { error } = await supabase.from('academic_sessions').delete().eq('id', id).eq('school_id', schoolId);
    if (error) throw error;
    return true;
  }

  // ─── Grading Scales ────────────────────────────────────────────
  async getGradingScales(schoolId) {
    const { data, error } = await supabase.from('grading_scales').select('*').eq('school_id', schoolId).order('name');
    if (error) throw error;
    const scales = data || [];
    if (scales.length > 0) {
      const scaleIds = scales.map(s => s.id);
      const { data: rules } = await supabase.from('grade_rules').select('*').in('grading_scale_id', scaleIds).order('min_percent', { ascending: false });
      const rulesByScale = (rules || []).reduce((acc, r) => {
        if (!acc[r.grading_scale_id]) acc[r.grading_scale_id] = [];
        acc[r.grading_scale_id].push(r);
        return acc;
      }, {});
      for (const scale of scales) {
        scale.rules = rulesByScale[scale.id] || [];
      }
    }
    return scales;
  }

  async createGradingScale(schoolId, { name, is_default }) {
    if (is_default) {
      await supabase.from('grading_scales').update({ is_default: false }).eq('school_id', schoolId).eq('is_default', true);
    }
    const { data, error } = await supabase.from('grading_scales').insert({
      id: crypto.randomUUID(), school_id: schoolId, name, is_default: !!is_default,
    }).select().single();
    if (error) throw error;
    return data;
  }

  async deleteGradingScale(schoolId, id) {
    const { error } = await supabase.from('grading_scales').delete().eq('id', id).eq('school_id', schoolId);
    if (error) throw error;
    return true;
  }

  async setGradeRule(scaleId, { grade, min_percent, max_percent, points, remark }) {
    const { data, error } = await supabase.from('grade_rules').insert({
      id: crypto.randomUUID(), grading_scale_id: scaleId, grade, min_percent, max_percent, points: points || 0, remark: remark || null,
    }).select().single();
    if (error) throw error;
    return data;
  }

  async deleteGradeRule(ruleId) {
    const { error } = await supabase.from('grade_rules').delete().eq('id', ruleId);
    if (error) throw error;
    return true;
  }

  // ─── Integrations ──────────────────────────────────────────────
  async getIntegrations() {
    const val = (k) => process.env[k] || '';
    return [
      { provider: 'email', label: 'Email (Mailgun)', configured: !!(process.env.MAILGUN_API_KEY && process.env.MAILGUN_DOMAIN), fields: [{ key: 'MAILGUN_API_KEY', masked: true, value: val('MAILGUN_API_KEY') }, { key: 'MAILGUN_DOMAIN', masked: false, value: val('MAILGUN_DOMAIN') }, { key: 'MAILGUN_FROM', masked: false, value: val('MAILGUN_FROM') }] },
      { provider: 'sms', label: 'SMS (Arkesel)', configured: !!process.env.ARKESEL_API_KEY, fields: [{ key: 'ARKESEL_API_KEY', masked: true, value: val('ARKESEL_API_KEY') }, { key: 'SMS_SENDER_ID', masked: false, value: val('SMS_SENDER_ID') }] },
      { provider: 'whatsapp', label: 'WhatsApp (Twilio)', configured: !!(process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_WHATSAPP_FROM), fields: [{ key: 'TWILIO_ACCOUNT_SID', masked: true, value: val('TWILIO_ACCOUNT_SID') }, { key: 'TWILIO_WHATSAPP_FROM', masked: false, value: val('TWILIO_WHATSAPP_FROM') }] },
      { provider: 'payments', label: 'Payments (Paystack)', configured: !!process.env.PAYSTACK_SECRET_KEY, fields: [{ key: 'PAYSTACK_SECRET_KEY', masked: true, value: val('PAYSTACK_SECRET_KEY') }] },
    ];
  }

  async getDBIntegrations(schoolId) {
    const { data, error } = await supabase.from('integrations').select('*').eq('school_id', schoolId);
    if (error) throw error;
    return data || [];
  }

  async updateIntegration(schoolId, provider, config, is_active) {
    const { data, error } = await supabase.from('integrations').upsert({
      school_id: schoolId, provider, config: config || {}, is_active: !!is_active, updated_at: new Date().toISOString(),
    }, { onConflict: 'school_id, provider' }).select().single();
    if (error) throw error;
    return data;
  }

  // ─── WhatsApp Business API Config ─────────────────────────────
  async getWhatsAppConfig(schoolId) {
    const { data, error } = await supabase.from('schools')
      .select('whatsapp_phone_id, whatsapp_access_token, whatsapp_business_account_id, whatsapp_verify_token')
      .eq('id', schoolId).single();
    if (error) throw error;
    return {
      phone_id: data.whatsapp_phone_id || '',
      // Mask token — return only last 8 chars so the UI can show "configured"
      access_token_hint: data.whatsapp_access_token
        ? `••••••••${data.whatsapp_access_token.slice(-8)}`
        : '',
      has_access_token: !!data.whatsapp_access_token,
      business_account_id: data.whatsapp_business_account_id || '',
      verify_token: data.whatsapp_verify_token || '',
    };
  }

  async updateWhatsAppConfig(schoolId, { phone_id, access_token, business_account_id, verify_token }) {
    const payload = {};
    if (phone_id !== undefined) payload.whatsapp_phone_id = phone_id;
    if (access_token !== undefined && access_token !== '') payload.whatsapp_access_token = access_token;
    if (business_account_id !== undefined) payload.whatsapp_business_account_id = business_account_id;
    if (verify_token !== undefined) payload.whatsapp_verify_token = verify_token;

    if (Object.keys(payload).length === 0) return this.getWhatsAppConfig(schoolId);

    const { error } = await supabase.from('schools').update(payload).eq('id', schoolId);
    if (error) throw error;
    return this.getWhatsAppConfig(schoolId);
  }

  // ─── All Settings ──────────────────────────────────────────────
  async getAll(schoolId) {
    const [profile, settingsMap, terms, sessions, gradingScales, integrations, dbIntegrations] = await Promise.all([
      this.getProfile(schoolId),
      this.getSettingsMap(schoolId),
      this.getTerms(schoolId),
      this.getSessions(schoolId),
      this.getGradingScales(schoolId),
      this.getIntegrations(),
      this.getDBIntegrations(schoolId),
    ]);

    return { profile, settingsMap, terms, sessions, gradingScales, integrations, dbIntegrations };
  }
}

module.exports = new SettingsService();
