const supabase = require('../config/db');

const SEVERITY_MAP = {
  critical: ['deleted'],
  high: ['user', 'role', 'permission', 'fee_structure', 'subscription', 'plan'],
  medium: ['student', 'teacher', 'grade', 'payment', 'invoice', 'attendance', 'fee', 'waiver', 'discount', 'exam', 'result'],
};

function inferSeverity(action, resource) {
  const r = (resource || '').toLowerCase();
  if (SEVERITY_MAP.critical.includes(action)) return 'critical';
  if (action === 'updated' && SEVERITY_MAP.high.includes(r)) return 'high';
  if (action === 'created' && SEVERITY_MAP.high.includes(r)) return 'high';
  if (SEVERITY_MAP.medium.includes(r)) return action === 'created' || action === 'updated' ? 'medium' : 'info';
  if (action === 'logged_in' || action === 'logged_out' || action === 'viewed') return 'info';
  return 'info';
}

class AuditService {
  async getAuditLogs(schoolId, filters = {}) {
    let query = supabase.from('audit_logs')
      .select('*, user:users(name, email, role)', { count: 'exact' })
      .eq('school_id', schoolId);

    if (filters.date_from) query = query.gte('created_at', filters.date_from);
    if (filters.date_to) query = query.lte('created_at', filters.date_to);
    if (filters.action) query = query.eq('action', filters.action);
    if (filters.resource) query = query.eq('resource', filters.resource);
    if (filters.user_id) query = query.eq('user_id', filters.user_id);
    if (filters.search) {
      const searchTerm = `%${filters.search}%`;
      const { data: matchedUsers } = await supabase.from('users')
        .select('id')
        .or(`name.ilike.${searchTerm},email.ilike.${searchTerm}`)
        .eq('school_id', schoolId);
      const userIds = (matchedUsers || []).map(u => u.id);
      if (userIds.length > 0) {
        query = query.in('user_id', userIds);
      } else {
        query = query.or(`resource_id.ilike.${searchTerm},action.ilike.${searchTerm},resource.ilike.${searchTerm}`);
      }
    }

    if (filters.severity) {
      return this._filterBySeverity(query, filters.severity, filters);
    }

    const page = Math.max(1, Number.parseInt(filters.page) || 1);
    const limit = Math.min(200, Math.max(1, Number.parseInt(filters.limit) || 50));
    query = query.order('created_at', { ascending: false }).range((page - 1) * limit, page * limit - 1);

    const { data, count, error } = await query;
    if (error) throw error;

    const records = (data || []).map(r => ({
      ...r,
      severity: inferSeverity(r.action, r.resource),
      metadata: typeof r.metadata === 'object' ? r.metadata : null,
    }));

    const distinctQuery = supabase.from('audit_logs')
      .select('action, resource')
      .eq('school_id', schoolId)
      .order('created_at', { ascending: false });

    const { data: distinctData } = await distinctQuery;
    const actions = [...new Set((distinctData || []).map(r => r.action).filter(Boolean))];
    const resources = [...new Set((distinctData || []).map(r => r.resource).filter(Boolean))];

    return {
      records,
      total: count || 0,
      page,
      limit,
      filters: { actions, resources },
    };
  }

  async _filterBySeverity(baseQuery, targetSeverity, filters) {
    const all = await baseQuery.order('created_at', { ascending: false });
    if (all.error) throw all.error;
    const filtered = (all.data || []).filter(r => inferSeverity(r.action, r.resource) === targetSeverity);

    const page = Math.max(1, Number.parseInt(filters.page) || 1);
    const limit = Math.min(200, Math.max(1, Number.parseInt(filters.limit) || 50));
    const start = (page - 1) * limit;
    const paginated = filtered.slice(start, start + limit);

    const records = paginated.map(r => ({
      ...r,
      severity: inferSeverity(r.action, r.resource),
      metadata: typeof r.metadata === 'object' ? r.metadata : null,
    }));

    const distinctQuery = supabase.from('audit_logs')
      .select('action, resource')
      .eq('school_id', filters.school_id || baseQuery.school_id)
      .order('created_at', { ascending: false });

    const { data: distinctData } = await distinctQuery;
    const actions = [...new Set((distinctData || []).map(r => r.action).filter(Boolean))];
    const resources = [...new Set((distinctData || []).map(r => r.resource).filter(Boolean))];

    return {
      records,
      total: filtered.length,
      page,
      limit,
      filters: { actions, resources },
    };
  }

  async getAuditLogById(schoolId, logId) {
    const { data, error } = await supabase.from('audit_logs')
      .select('*, user:users(name, email, role)')
      .eq('id', logId)
      .eq('school_id', schoolId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        const err = new Error('Audit log not found.');
        err.statusCode = 404;
        throw err;
      }
      throw error;
    }

    return {
      ...data,
      severity: inferSeverity(data.action, data.resource),
      metadata: typeof data.metadata === 'object' ? data.metadata : null,
    };
  }

  async exportAuditLogsCsv(schoolId, filters = {}) {
    const result = await this.getAuditLogs(schoolId, { ...filters, limit: 10000, page: 1 });
    const rows = result.records.map(r => ({
      Timestamp: r.created_at ? new Date(r.created_at).toISOString() : '',
      Actor: r.user?.name || 'System',
      'Actor Email': r.user?.email || '',
      'Actor Role': r.user?.role || '',
      Action: r.action || '',
      Resource: r.resource || '',
      'Resource ID': r.resource_id || '',
      Severity: r.severity || '',
      'IP Address': r.ip_address || '',
      Details: r.metadata ? JSON.stringify(r.metadata) : '',
    }));
    return rows;
  }
}

module.exports = new AuditService();
