const crypto = require('crypto');
const supabase = require('../config/db');
const emailService = require('./emailService');
const smsService = require('./smsService');
const whatsappService = require('./whatsappService');

class CommunicationService {
  // ─── Messages ──────────────────────────────────────────────────
  async sendMessage(schoolId, senderId, { subject, body, channel, scheduled_at, recipients, template_id }) {
    const isScheduled = !!scheduled_at && new Date(scheduled_at) > new Date();
    const status = isScheduled ? 'scheduled' : 'sending';

    const { data: message, error: msgErr } = await supabase.from('outbound_messages').insert({
      id: crypto.randomUUID(),
      school_id: schoolId,
      subject,
      body,
      channel,
      sender_id: senderId,
      status,
      scheduled_at: isScheduled ? scheduled_at : null,
      template_id: template_id || null,
    }).select().single();

    if (msgErr) throw msgErr;

    if (!recipients || recipients.length === 0) {
      await supabase.from('outbound_messages').update({ status: 'failed' }).eq('id', message.id);
      const err = new Error('No recipients specified.');
      err.statusCode = 400;
      throw err;
    }

    const recipientRecords = recipients.map(r => ({
      id: crypto.randomUUID(),
      message_id: message.id,
      recipient_type: r.type || 'custom',
      recipient_id: r.id || null,
      recipient_name: r.name || null,
      recipient_contact: r.contact,
      status: 'pending',
      channel,
    }));

    const { error: recErr } = await supabase.from('message_recipients').insert(recipientRecords);
    if (recErr) throw recErr;

    if (!isScheduled) {
      const results = await this._sendToRecipients(message, recipientRecords);
      const sentCount = results.filter(r => r.success).length;
      const finalStatus = sentCount === 0 ? 'failed' : sentCount < recipientRecords.length ? 'partial' : 'sent';
      const sentAt = sentCount > 0 ? new Date().toISOString() : null;

      await supabase.from('outbound_messages').update({ status: finalStatus, sent_at: sentAt }).eq('id', message.id);

      for (const result of results) {
        await supabase.from('message_recipients')
          .update({ status: result.success ? 'sent' : 'failed', error_message: result.error || null, sent_at: result.success ? new Date().toISOString() : null })
          .eq('id', result.recipientId);
      }

      message.status = finalStatus;
      message.sent_at = sentAt;
    }

    return this.getMessageById(schoolId, message.id);
  }

  async _sendToRecipients(message, recipients) {
    const results = [];
    for (const rec of recipients) {
      try {
        let result;
        switch (message.channel) {
          case 'email':
            result = await emailService.send({ to: rec.recipient_contact, subject: message.subject, text: message.body });
            break;
          case 'sms':
            result = await smsService.send({ to: rec.recipient_contact, message: message.body });
            break;
          case 'whatsapp':
            result = await whatsappService.send({ to: rec.recipient_contact, body: message.body });
            break;
          default:
            result = { success: false, error: `Unsupported channel: ${message.channel}` };
        }
        results.push({ recipientId: rec.id, success: result.success, error: result.error?.message || null });
      } catch (err) {
        results.push({ recipientId: rec.id, success: false, error: err.message || 'Send failed' });
      }
    }
    return results;
  }

  async getMessages(schoolId, filters = {}) {
    let query = supabase.from('outbound_messages')
      .select('*', { count: 'exact' })
      .eq('school_id', schoolId);

    if (filters.status) query = query.eq('status', filters.status);
    if (filters.channel) query = query.eq('channel', filters.channel);
    if (filters.search) query = query.or(`subject.ilike.%${filters.search}%,body.ilike.%${filters.search}%`);

    const page = Math.max(1, Number.parseInt(filters.page) || 1);
    const limit = Math.min(100, Math.max(1, Number.parseInt(filters.limit) || 20));
    query = query.order('created_at', { ascending: false }).range((page - 1) * limit, page * limit - 1);

    const { data, count, error } = await query;
    if (error) throw error;

    const records = data || [];
    if (records.length > 0) {
      const msgIds = records.map(m => m.id);
      const { data: recipients } = await supabase.from('message_recipients')
        .select('message_id, status, recipient_type')
        .in('message_id', msgIds);

      const byMessage = (recipients || []).reduce((acc, r) => {
        if (!acc[r.message_id]) acc[r.message_id] = { total: 0, sent: 0, failed: 0, pending: 0, types: new Set() };
        acc[r.message_id].total += 1;
        if (r.status === 'sent') acc[r.message_id].sent += 1;
        else if (r.status === 'failed') acc[r.message_id].failed += 1;
        else acc[r.message_id].pending += 1;
        acc[r.message_id].types.add(r.recipient_type);
        return acc;
      }, {});

      for (const msg of records) {
        const stats = byMessage[msg.id];
        msg.recipientSummary = stats ? {
          total: stats.total,
          sent: stats.sent,
          failed: stats.failed,
          pending: stats.pending,
          types: [...stats.types],
        } : { total: 0, sent: 0, failed: 0, pending: 0, types: [] };
      }
    }

    return { records, total: count || 0, page, limit };
  }

  async getMessageById(schoolId, messageId) {
    const { data, error } = await supabase.from('outbound_messages')
      .select('*')
      .eq('id', messageId)
      .eq('school_id', schoolId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        const err = new Error('Message not found.');
        err.statusCode = 404;
        throw err;
      }
      throw error;
    }

    const { data: recipients } = await supabase.from('message_recipients')
      .select('*')
      .eq('message_id', messageId)
      .order('status', { ascending: true });

    const stats = (recipients || []).reduce((acc, r) => {
      acc.total += 1;
      if (r.status === 'sent') acc.sent += 1;
      else if (r.status === 'failed') acc.failed += 1;
      else acc.pending += 1;
      return acc;
    }, { total: 0, sent: 0, failed: 0, pending: 0 });

    return { ...data, recipients: recipients || [], recipientSummary: stats };
  }

  async getRecipients(schoolId, messageId) {
    const { data, error } = await supabase.from('message_recipients')
      .select('*')
      .eq('message_id', messageId);

    if (error) throw error;
    return data || [];
  }

  async deleteMessage(schoolId, messageId) {
    const { error } = await supabase.from('outbound_messages').delete().eq('id', messageId).eq('school_id', schoolId);
    if (error) throw error;
    return true;
  }

  async resendFailed(schoolId, messageId) {
    const message = await this.getMessageById(schoolId, messageId);
    const failedRecipients = (message.recipients || []).filter(r => r.status === 'failed');

    if (failedRecipients.length === 0) return message;

    const results = await this._sendToRecipients(message, failedRecipients);

    for (const result of results) {
      await supabase.from('message_recipients')
        .update({ status: result.success ? 'sent' : 'failed', error_message: result.error || null, sent_at: result.success ? new Date().toISOString() : null })
        .eq('id', result.recipientId);
    }

    const updated = await this.getMessageById(schoolId, messageId);
    const allSent = updated.recipients.every(r => r.status === 'sent');
    const anySent = updated.recipients.some(r => r.status === 'sent');
    await supabase.from('outbound_messages').update({ status: allSent ? 'sent' : anySent ? 'partial' : 'failed' }).eq('id', messageId);

    return this.getMessageById(schoolId, messageId);
  }

  // ─── Drafts ────────────────────────────────────────────────────
  async saveDraft(schoolId, senderId, data) {
    const { data: existing } = data.id ? await supabase.from('outbound_messages').select('id').eq('id', data.id).eq('school_id', schoolId).eq('status', 'draft').single().catch(() => ({})) : {};

    if (existing) {
      const { data: updated, error } = await supabase.from('outbound_messages').update({
        subject: data.subject,
        body: data.body,
        channel: data.channel,
        template_id: data.template_id || null,
        updated_at: new Date().toISOString(),
      }).eq('id', data.id).select().single();
      if (error) throw error;
      return updated;
    }

    const { data: created, error } = await supabase.from('outbound_messages').insert({
      id: crypto.randomUUID(),
      school_id: schoolId,
      subject: data.subject || '(no subject)',
      body: data.body || '',
      channel: data.channel || 'email',
      sender_id: senderId,
      status: 'draft',
      template_id: data.template_id || null,
    }).select().single();

    if (error) throw error;
    return created;
  }

  // ─── Templates ─────────────────────────────────────────────────
  async getTemplates(schoolId, category) {
    let query = supabase.from('message_templates').select('*').eq('school_id', schoolId).order('name', { ascending: true });
    if (category && category !== 'all') query = query.eq('category', category);
    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  }

  async createTemplate(schoolId, data) {
    const { data: template, error } = await supabase.from('message_templates').insert({
      id: crypto.randomUUID(),
      school_id: schoolId,
      name: data.name,
      subject: data.subject || null,
      body: data.body,
      channel: data.channel || 'any',
      category: data.category || 'general',
    }).select().single();
    if (error) throw error;
    return template;
  }

  async updateTemplate(schoolId, templateId, data) {
    const { data: template, error } = await supabase.from('message_templates').update({
      ...data,
      updated_at: new Date().toISOString(),
    }).eq('id', templateId).eq('school_id', schoolId).select().single();
    if (error) throw error;
    return template;
  }

  async deleteTemplate(schoolId, templateId) {
    const { error } = await supabase.from('message_templates').delete().eq('id', templateId).eq('school_id', schoolId);
    if (error) throw error;
    return true;
  }

  // ─── Announcements ─────────────────────────────────────────────
  async getAnnouncements(schoolId, filters = {}) {
    let query = supabase.from('announcements')
      .select('*', { count: 'exact' })
      .eq('school_id', schoolId);

    if (filters.status) query = query.eq('status', filters.status);
    if (filters.search) query = query.or(`title.ilike.%${filters.search}%,body.ilike.%${filters.search}%`);

    const page = Math.max(1, Number.parseInt(filters.page) || 1);
    const limit = Math.min(100, Math.max(1, Number.parseInt(filters.limit) || 20));
    query = query.order('created_at', { ascending: false }).range((page - 1) * limit, page * limit - 1);

    const { data, count, error } = await query;
    if (error) throw error;
    return { records: data || [], total: count || 0, page, limit };
  }

  async createAnnouncement(schoolId, userId, data) {
    const isScheduled = !!data.scheduled_at && new Date(data.scheduled_at) > new Date();
    const { data: announcement, error } = await supabase.from('announcements').insert({
      id: crypto.randomUUID(),
      school_id: schoolId,
      title: data.title,
      body: data.body,
      channel: data.channel || 'email',
      status: isScheduled ? 'scheduled' : 'draft',
      scheduled_at: isScheduled ? data.scheduled_at : null,
      created_by: userId,
    }).select().single();
    if (error) throw error;
    return announcement;
  }

  async publishAnnouncement(schoolId, announcementId) {
    const { data: announcement, error } = await supabase.from('announcements')
      .update({ status: 'published', published_at: new Date().toISOString() })
      .eq('id', announcementId).eq('school_id', schoolId)
      .select().single();
    if (error) {
      if (error.code === 'PGRST116') {
        const err = new Error('Announcement not found.');
        err.statusCode = 404;
        throw err;
      }
      throw error;
    }
    return announcement;
  }

  // ─── Recipient Options ─────────────────────────────────────────
  async getRecipientOptions(schoolId) {
    const [classesRes, rolesRes, studentsRes] = await Promise.all([
      supabase.from('classes').select('id, name').eq('school_id', schoolId).order('name'),
      supabase.from('users').select('role').eq('tenant_id', schoolId).not('role', 'is', null),
      supabase.from('students').select('id, name, class_name, parent_name, parent_phone, parent_email').eq('tenant_id', schoolId).eq('is_active', true),
    ]);

    const classes = classesRes.data || [];
    const roles = [...new Set((rolesRes.data || []).map(u => u.role).filter(Boolean))];
    const students = studentsRes.data || [];

    return { classes, roles, students };
  }

  // ─── Stats ─────────────────────────────────────────────────────
  async getStats(schoolId) {
    const [msgRes, tmplRes, annRes] = await Promise.all([
      supabase.from('outbound_messages').select('status', { count: 'exact' }).eq('school_id', schoolId),
      supabase.from('message_templates').select('id', { count: 'exact', head: true }).eq('school_id', schoolId),
      supabase.from('announcements').select('status', { count: 'exact' }).eq('school_id', schoolId),
    ]);

    const byStatus = (msgRes.data || []).reduce((acc, m) => {
      acc[m.status] = (acc[m.status] || 0) + 1;
      return acc;
    }, {});

    const annByStatus = (annRes.data || []).reduce((acc, a) => {
      acc[a.status] = (acc[a.status] || 0) + 1;
      return acc;
    }, {});

    return {
      messages: {
        total: msgRes.count || 0,
        sent: byStatus.sent || 0,
        draft: byStatus.draft || 0,
        scheduled: byStatus.scheduled || 0,
        failed: byStatus.failed || 0,
        partial: byStatus.partial || 0,
      },
      templates: tmplRes.count || 0,
      announcements: {
        total: annRes.count || 0,
        published: annByStatus.published || 0,
        draft: annByStatus.draft || 0,
      },
    };
  }
}

module.exports = new CommunicationService();
