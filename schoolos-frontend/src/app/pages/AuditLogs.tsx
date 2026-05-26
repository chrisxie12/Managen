import { useState, useEffect, useCallback, useRef } from "react";
import {
  Loader2, X, AlertCircle, Download, Search, Calendar,
  Shield, User, Activity, Globe, Clock, ChevronLeft, ChevronRight,
  Eye, FileText,
} from "lucide-react";
import { api } from "../services/api";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "../components/ui/select";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "../components/ui/table";
import { Badge } from "../components/ui/badge";
import {
  Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription,
} from "../components/ui/sheet";

const NAVY = "#0A2472";
const MUTED = "#6B7280";

type AuditLog = {
  id: string;
  user_id: string | null;
  school_id: string;
  action: string;
  resource: string;
  resource_id: string | null;
  metadata: Record<string, any> | null;
  ip_address: string | null;
  created_at: string;
  user: { name: string; email: string; role: string } | null;
  severity: string;
};

type AuditFilters = {
  actions: string[];
  resources: string[];
};

type AuditResponse = {
  records: AuditLog[];
  total: number;
  page: number;
  limit: number;
  filters: AuditFilters;
};

const severityStyles: Record<string, string> = {
  critical: "bg-red-100 text-red-700",
  high: "bg-orange-100 text-orange-700",
  medium: "bg-yellow-100 text-yellow-700",
  info: "bg-blue-100 text-blue-700",
};

const actionLabels: Record<string, string> = {
  created: "Created",
  updated: "Updated",
  deleted: "Deleted",
  viewed: "Viewed",
  logged_in: "Logged In",
  logged_out: "Logged Out",
  exported: "Exported",
  invited: "Invited",
  suspended: "Suspended",
  activated: "Activated",
};

const resourceLabels: Record<string, string> = {
  student: "Student",
  teacher: "Teacher",
  user: "User",
  role: "Role",
  permission: "Permission",
  fee: "Fee",
  fee_structure: "Fee Structure",
  invoice: "Invoice",
  payment: "Payment",
  waiver: "Waiver",
  discount: "Discount",
  attendance: "Attendance",
  grade: "Grade",
  exam: "Exam",
  result: "Result",
  class: "Class",
  subject: "Subject",
  announcement: "Announcement",
  report: "Report",
  school: "School",
  subscription: "Subscription",
};

const SeverityBadge = ({ severity }: { severity: string }) => (
  <Badge className={severityStyles[severity] || "bg-gray-100 text-gray-600"} variant="outline">
    {severity}
  </Badge>
);

const ActionBadge = ({ action }: { action: string }) => {
  const colorMap: Record<string, string> = {
    created: "bg-green-100 text-green-700",
    updated: "bg-blue-100 text-blue-700",
    deleted: "bg-red-100 text-red-700",
    viewed: "bg-gray-100 text-gray-600",
    exported: "bg-purple-100 text-purple-700",
    logged_in: "bg-teal-100 text-teal-700",
    logged_out: "bg-gray-100 text-gray-500",
    invited: "bg-indigo-100 text-indigo-700",
    suspended: "bg-orange-100 text-orange-700",
    activated: "bg-green-100 text-green-700",
  };
  return (
    <Badge className={colorMap[action] || "bg-gray-100 text-gray-600"} variant="outline">
      {actionLabels[action] || action.replace(/_/g, " ")}
    </Badge>
  );
};

const AlertBanner = ({ type, message, onClose }: { type: "error" | "success"; message: string; onClose: () => void }) => {
  const bg = type === "error" ? "#FEF2F2" : "#D1FAE5";
  const color = type === "error" ? "#EF4444" : "#065F46";
  return (
    <div className="mb-4 p-3 rounded-xl flex items-center gap-2" style={{ background: bg, color, border: `1px solid ${type === "error" ? "#FECACA" : "#A7F3D0"}`, fontSize: "0.9rem" }}>
      {type === "error" ? <AlertCircle size={14} /> : <Shield size={14} />}
      <span className="flex-1">{message}</span>
      <button onClick={onClose} className="ml-auto"><X size={14} /></button>
    </div>
  );
};

const LoadingSpinner = ({ height = 48 }: { height?: number }) => (
  <div className="flex items-center justify-center" style={{ height }}><Loader2 className="animate-spin" size={24} color={NAVY} /></div>
);

const EmptyState = ({ icon: Icon, title, desc }: { icon: any; title: string; desc: string }) => (
  <div className="text-center py-16 rounded-2xl" style={{ background: "rgba(10,36,114,0.03)", border: "1px dashed rgba(10,36,114,0.1)" }}>
    <Icon size={40} color={MUTED} className="mx-auto mb-3" />
    <p className="font-semibold text-sm" style={{ color: NAVY }}>{title}</p>
    <p className="text-xs mt-1" style={{ color: MUTED }}>{desc}</p>
  </div>
);

const formatDate = (iso: string) => {
  const d = new Date(iso);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" });
};

const maskIp = (ip: string | null) => {
  if (!ip) return "—";
  const parts = ip.split(".");
  if (parts.length === 4) return `${parts[0]}.${parts[1]}.${parts[2]}.xxx`;
  return ip;
};

const DetailRow = ({ label, value }: { label: string; value: React.ReactNode }) => (
  <div className="flex items-start gap-3 py-2 border-b" style={{ borderColor: "rgba(10,36,114,0.06)" }}>
    <span className="text-xs font-medium shrink-0 w-28" style={{ color: MUTED }}>{label}</span>
    <span className="text-sm" style={{ color: NAVY }}>{value}</span>
  </div>
);

const MetadataBlock = ({ data }: { data: Record<string, any> | null }) => {
  if (!data || Object.keys(data).length === 0) return <span className="text-xs italic" style={{ color: MUTED }}>No additional data</span>;

  const sensitiveKeys = ["password", "token", "secret", "authorization"];
  const maskSensitive = (key: string, val: any) => {
    if (sensitiveKeys.some(s => key.toLowerCase().includes(s))) return "••••••••";
    if (typeof val === "object") return JSON.stringify(val);
    return String(val);
  };

  const skipKeys = ["method", "url", "body", "response"];

  return (
    <div className="space-y-1 max-h-64 overflow-y-auto">
      {Object.entries(data).map(([key, val]) => {
        if (skipKeys.includes(key)) return null;
        return (
          <div key={key} className="flex items-start gap-2 text-xs">
            <span className="font-medium shrink-0" style={{ color: MUTED, minWidth: 80 }}>{key}:</span>
            <span style={{ color: NAVY, wordBreak: "break-word" }}>{maskSensitive(key, val)}</span>
          </div>
        );
      })}
      {data.body && (
        <div className="mt-2 pt-2 border-t" style={{ borderColor: "rgba(10,36,114,0.06)" }}>
          <span className="text-xs font-semibold block mb-1" style={{ color: NAVY }}>Request Body:</span>
          <pre className="text-xs p-2 rounded-lg overflow-x-auto" style={{ background: "rgba(10,36,114,0.03)", color: MUTED, maxHeight: 120 }}>
            {JSON.stringify(data.body, null, 2)}
          </pre>
        </div>
      )}
      {data.response && (
        <div className="mt-2 pt-2 border-t" style={{ borderColor: "rgba(10,36,114,0.06)" }}>
          <span className="text-xs font-semibold block mb-1" style={{ color: NAVY }}>Response:</span>
          <pre className="text-xs p-2 rounded-lg overflow-x-auto" style={{ background: "rgba(10,36,114,0.03)", color: MUTED, maxHeight: 120 }}>
            {JSON.stringify(data.response, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
};

const DetailDrawer = ({ log, open, onClose }: { log: AuditLog | null; open: boolean; onClose: () => void }) => {
  if (!log) return null;

  const getBeforeAfter = () => {
    const body = log.metadata?.body;
    const response = log.metadata?.response?.data;
    if (!body && !response) return null;

    if (log.action === "updated" && body && response) {
      const before: Record<string, any> = {};
      const after: Record<string, any> = {};
      const skipFields = ["updated_at", "id", "password"];
      for (const key of Object.keys(body)) {
        if (skipFields.includes(key)) continue;
        after[key] = body[key];
      }
      for (const key of Object.keys(response)) {
        if (skipFields.includes(key)) continue;
        if (key in body) {
          before[key] = response[key];
        }
      }
      if (Object.keys(before).length === 0 && Object.keys(after).length === 0) return null;
      return { before, after };
    }

    if (log.action === "created" && response) {
      const skipFields = ["updated_at", "id", "created_at", "password"];
      const created: Record<string, any> = {};
      for (const key of Object.keys(response)) {
        if (skipFields.includes(key)) continue;
        created[key] = response[key];
      }
      return Object.keys(created).length > 0 ? { created } : null;
    }

    return null;
  };

  const changes: any = getBeforeAfter();

  return (
    <Sheet open={open} onOpenChange={(v) => { if (!v) onClose(); }}>
      <SheetContent side="right" className="w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader className="pb-4 border-b" style={{ borderColor: "rgba(10,36,114,0.08)" }}>
          <SheetTitle className="text-lg font-bold" style={{ color: NAVY }}>
            Audit Log Detail
          </SheetTitle>
          <SheetDescription style={{ color: MUTED }}>
            <ActionBadge action={log.action} /> <SeverityBadge severity={log.severity} />
          </SheetDescription>
        </SheetHeader>

        <div className="mt-4 space-y-1">
          <DetailRow label="Timestamp" value={formatDate(log.created_at)} />
          <DetailRow label="Actor" value={
            log.user ? (
              <span>
                <span className="font-medium">{log.user.name}</span>
                <span className="text-xs ml-2" style={{ color: MUTED }}>({log.user.email})</span>
                <Badge className="ml-2 bg-gray-100 text-gray-600 text-[10px]" variant="outline">{log.user.role}</Badge>
              </span>
            ) : <span className="italic">System</span>
          } />
          <DetailRow label="Action" value={<ActionBadge action={log.action} />} />
          <DetailRow label="Resource" value={resourceLabels[log.resource] || log.resource} />
          <DetailRow label="Resource ID" value={log.resource_id || "—"} />
          <DetailRow label="Severity" value={<SeverityBadge severity={log.severity} />} />
          <DetailRow label="IP Address" value={maskIp(log.ip_address)} />
        </div>

        {changes && (
          <div className="mt-6">
            <h4 className="text-sm font-semibold mb-3 flex items-center gap-2" style={{ color: NAVY }}>
              <Activity size={14} /> Changes
            </h4>
            {"before" in changes && "after" in changes && (
              <div className="space-y-3">
                <div>
                  <p className="text-xs font-medium mb-1" style={{ color: "#EF4444" }}>Before</p>
                  <div className="text-xs p-3 rounded-lg" style={{ background: "#FEF2F2", border: "1px solid #FECACA" }}>
                    {Object.entries(changes.before).map(([k, v]) => (
                      <div key={k} className="flex gap-2 py-0.5">
                        <span className="font-medium shrink-0">{k}:</span>
                        <span style={{ wordBreak: "break-word" }}>{v != null ? String(v) : "—"}</span>
                      </div>
                    ))}
                    {Object.keys(changes.before).length === 0 && <span className="italic">No before data captured</span>}
                  </div>
                </div>
                <div>
                  <p className="text-xs font-medium mb-1" style={{ color: "#065F46" }}>After</p>
                  <div className="text-xs p-3 rounded-lg" style={{ background: "#D1FAE5", border: "1px solid #A7F3D0" }}>
                    {Object.entries(changes.after).map(([k, v]) => (
                      <div key={k} className="flex gap-2 py-0.5">
                        <span className="font-medium shrink-0">{k}:</span>
                        <span style={{ wordBreak: "break-word" }}>{v != null ? String(v) : "—"}</span>
                      </div>
                    ))}
                    {Object.keys(changes.after).length === 0 && <span className="italic">No after data captured</span>}
                  </div>
                </div>
              </div>
            )}
            {"created" in changes && changes.created && (
              <div>
                <p className="text-xs font-medium mb-1" style={{ color: "#065F46" }}>Created Values</p>
                <div className="text-xs p-3 rounded-lg" style={{ background: "#D1FAE5", border: "1px solid #A7F3D0" }}>
                  {Object.entries(changes.created).map(([k, v]) => (
                    <div key={k} className="flex gap-2 py-0.5">
                      <span className="font-medium shrink-0">{k}:</span>
                      <span style={{ wordBreak: "break-word" }}>{v != null ? String(v) : "—"}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        <div className="mt-6">
          <h4 className="text-sm font-semibold mb-2 flex items-center gap-2" style={{ color: NAVY }}>
            <FileText size={14} /> Full Metadata
          </h4>
          <MetadataBlock data={log.metadata} />
        </div>
      </SheetContent>
    </Sheet>
  );
};

export function AuditLogs() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit] = useState(50);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [alert, setAlert] = useState<{ type: "error" | "success"; message: string } | null>(null);

  const [search, setSearch] = useState("");
  const [actionFilter, setActionFilter] = useState("all");
  const [resourceFilter, setResourceFilter] = useState("all");
  const [severityFilter, setSeverityFilter] = useState("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const [availableActions, setAvailableActions] = useState<string[]>([]);
  const [availableResources, setAvailableResources] = useState<string[]>([]);

  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const [exporting, setExporting] = useState(false);
  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fetchLogs = useCallback(async (p: number) => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      params.set("page", String(p));
      params.set("limit", String(limit));
      if (search) params.set("search", search);
      if (actionFilter !== "all") params.set("action", actionFilter);
      if (resourceFilter !== "all") params.set("resource", resourceFilter);
      if (severityFilter !== "all") params.set("severity", severityFilter);
      if (dateFrom) params.set("date_from", dateFrom);
      if (dateTo) params.set("date_to", dateTo);

      const res = await api.get<AuditResponse>(`/school/audit-logs?${params.toString()}`);
      if (res.error) { setError(res.error); setLogs([]); return; }
      if (res.data) {
        setLogs(res.data.records);
        setTotal(res.data.total);
        setPage(res.data.page);
        setAvailableActions(res.data.filters?.actions || []);
        setAvailableResources(res.data.filters?.resources || []);
      }
    } catch (err: any) {
      setError(err.message || "Failed to load audit logs.");
      setLogs([]);
    } finally {
      setLoading(false);
    }
  }, [search, actionFilter, resourceFilter, severityFilter, dateFrom, dateTo, limit]);

  useEffect(() => {
    fetchLogs(page);
  }, []);

  useEffect(() => {
    if (searchTimer.current) clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => {
      setPage(1);
      fetchLogs(1);
    }, 400);
    return () => { if (searchTimer.current) clearTimeout(searchTimer.current); };
  }, [search, actionFilter, resourceFilter, severityFilter, dateFrom, dateTo]);

  const handleExport = async () => {
    setExporting(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      if (actionFilter !== "all") params.set("action", actionFilter);
      if (resourceFilter !== "all") params.set("resource", resourceFilter);
      if (severityFilter !== "all") params.set("severity", severityFilter);
      if (dateFrom) params.set("date_from", dateFrom);
      if (dateTo) params.set("date_to", dateTo);

      const subdomain = localStorage.getItem('schoolos_subdomain');
      const res = await fetch(`/api/school/audit-logs/export?${params.toString()}`, {
        credentials: "include",
        headers: subdomain ? { 'x-tenant-subdomain': subdomain } : {},
      });
      if (!res.ok) { setAlert({ type: "error", message: "Export failed." }); return; }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `audit-logs-${Date.now()}.csv`;
      a.click();
      URL.revokeObjectURL(url);
      setAlert({ type: "success", message: "Audit logs exported successfully." });
    } catch {
      setAlert({ type: "error", message: "Export failed." });
    } finally {
      setExporting(false);
    }
  };

  const openDetail = async (log: AuditLog) => {
    try {
      const res = await api.get<AuditLog>(`/school/audit-logs/${log.id}`);
      if (res.data) {
        setSelectedLog(res.data);
      } else {
        setSelectedLog(log);
      }
    } catch {
      setSelectedLog(log);
    }
    setDrawerOpen(true);
  };

  const totalPages = Math.ceil(total / limit);

  const clearFilters = () => {
    setSearch("");
    setActionFilter("all");
    setResourceFilter("all");
    setSeverityFilter("all");
    setDateFrom("");
    setDateTo("");
  };

  const hasActiveFilters = search || actionFilter !== "all" || resourceFilter !== "all" || severityFilter !== "all" || dateFrom || dateTo;

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold" style={{ color: NAVY }}>Audit Logs</h1>
          <p className="text-xs mt-1" style={{ color: MUTED }}>
            Complete audit trail of all system actions — {total} total events
          </p>
        </div>
        <div className="flex gap-2">
          {hasActiveFilters && (
            <Button variant="outline" size="sm" onClick={clearFilters} className="text-xs">
              <X size={14} className="mr-1" /> Clear
            </Button>
          )}
          <Button variant="outline" size="sm" onClick={handleExport} disabled={exporting || logs.length === 0} className="text-xs">
            {exporting ? <Loader2 size={14} className="animate-spin mr-1" /> : <Download size={14} className="mr-1" />}
            Export CSV
          </Button>
        </div>
      </div>

      {alert && <AlertBanner type={alert.type} message={alert.message} onClose={() => setAlert(null)} />}

      <div className="mb-4 flex flex-wrap gap-2" style={{ color: NAVY }}>
        <div className="relative flex-1 min-w-[200px] max-w-xs">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: MUTED }} />
          <Input
            placeholder="Search actor, action, resource..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-9 text-xs rounded-xl"
            style={{ borderColor: "rgba(10,36,114,0.12)" }}
          />
        </div>

        <Select value={actionFilter} onValueChange={setActionFilter}>
          <SelectTrigger className="w-[130px] h-9 text-xs rounded-xl" style={{ borderColor: "rgba(10,36,114,0.12)" }}>
            <SelectValue placeholder="All Actions" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Actions</SelectItem>
            {availableActions.map((a) => (
              <SelectItem key={a} value={a}>{actionLabels[a] || a.replace(/_/g, " ")}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={resourceFilter} onValueChange={setResourceFilter}>
          <SelectTrigger className="w-[140px] h-9 text-xs rounded-xl" style={{ borderColor: "rgba(10,36,114,0.12)" }}>
            <SelectValue placeholder="All Entities" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Entities</SelectItem>
            {availableResources.map((r) => (
              <SelectItem key={r} value={r}>{resourceLabels[r] || r}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={severityFilter} onValueChange={setSeverityFilter}>
          <SelectTrigger className="w-[120px] h-9 text-xs rounded-xl" style={{ borderColor: "rgba(10,36,114,0.12)" }}>
            <SelectValue placeholder="All Severity" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Severity</SelectItem>
            <SelectItem value="critical">Critical</SelectItem>
            <SelectItem value="high">High</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="info">Info</SelectItem>
          </SelectContent>
        </Select>

        <div className="relative">
          <Calendar size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: MUTED }} />
          <Input
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            className="pl-9 h-9 text-xs rounded-xl w-[150px]"
            style={{ borderColor: "rgba(10,36,114,0.12)" }}
            placeholder="From"
          />
        </div>
        <div className="relative">
          <Calendar size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: MUTED }} />
          <Input
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            className="pl-9 h-9 text-xs rounded-xl w-[150px]"
            style={{ borderColor: "rgba(10,36,114,0.12)" }}
            placeholder="To"
          />
        </div>
      </div>

      {loading ? (
        <LoadingSpinner height={300} />
      ) : error ? (
        <div className="text-center py-12">
          <AlertCircle size={32} color="#EF4444" className="mx-auto mb-3" />
          <p className="text-sm font-medium" style={{ color: "#EF4444" }}>{error}</p>
          <Button variant="outline" size="sm" className="mt-3 text-xs" onClick={() => fetchLogs(1)}>Retry</Button>
        </div>
      ) : logs.length === 0 ? (
        <EmptyState icon={Shield} title="No audit logs found" desc={hasActiveFilters ? "Try adjusting your filters." : "Audit events will appear here as actions are performed in the system."} />
      ) : (
        <>
          <div className="rounded-2xl overflow-hidden border" style={{ borderColor: "rgba(10,36,114,0.07)", background: "white" }}>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs font-semibold" style={{ color: NAVY }}>Timestamp</TableHead>
                  <TableHead className="text-xs font-semibold" style={{ color: NAVY }}>Actor</TableHead>
                  <TableHead className="text-xs font-semibold" style={{ color: NAVY }}>Action</TableHead>
                  <TableHead className="text-xs font-semibold" style={{ color: NAVY }}>Resource</TableHead>
                  <TableHead className="text-xs font-semibold" style={{ color: NAVY }}>Severity</TableHead>
                  <TableHead className="text-xs font-semibold" style={{ color: NAVY }}>IP</TableHead>
                  <TableHead className="w-10"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {logs.map((log) => (
                  <TableRow
                    key={log.id}
                    className="cursor-pointer hover:bg-[rgba(10,36,114,0.02)]"
                    onClick={() => openDetail(log)}
                  >
                    <TableCell className="text-xs" style={{ color: NAVY }}>
                      <div className="flex items-center gap-1.5">
                        <Clock size={12} style={{ color: MUTED }} />
                        {formatDate(log.created_at)}
                      </div>
                    </TableCell>
                    <TableCell className="text-xs">
                      {log.user ? (
                        <div className="flex items-center gap-1.5">
                          <User size={12} style={{ color: MUTED }} />
                          <span style={{ color: NAVY }}>{log.user.name}</span>
                        </div>
                      ) : (
                        <span className="italic" style={{ color: MUTED }}>System</span>
                      )}
                    </TableCell>
                    <TableCell><ActionBadge action={log.action} /></TableCell>
                    <TableCell className="text-xs" style={{ color: NAVY }}>
                      <div className="flex items-center gap-1.5">
                        <Globe size={12} style={{ color: MUTED }} />
                        {resourceLabels[log.resource] || log.resource}
                      </div>
                    </TableCell>
                    <TableCell><SeverityBadge severity={log.severity} /></TableCell>
                    <TableCell className="text-xs font-mono" style={{ color: MUTED }}>{maskIp(log.ip_address)}</TableCell>
                    <TableCell>
                      <Button variant="ghost" size="icon" className="h-7 w-7">
                        <Eye size={14} style={{ color: MUTED }} />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <p className="text-xs" style={{ color: MUTED }}>
                Showing {(page - 1) * limit + 1}–{Math.min(page * limit, total)} of {total}
              </p>
              <div className="flex gap-1">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page <= 1}
                  onClick={() => fetchLogs(page - 1)}
                  className="h-8 w-8 p-0"
                >
                  <ChevronLeft size={14} />
                </Button>
                {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                  let pageNum: number;
                  if (totalPages <= 7) {
                    pageNum = i + 1;
                  } else if (page <= 4) {
                    pageNum = i + 1;
                  } else if (page >= totalPages - 3) {
                    pageNum = totalPages - 6 + i;
                  } else {
                    pageNum = page - 3 + i;
                  }
                  return (
                    <Button
                      key={pageNum}
                      variant={pageNum === page ? "default" : "outline"}
                      size="sm"
                      onClick={() => fetchLogs(pageNum)}
                      className="h-8 w-8 p-0 text-xs"
                      style={pageNum === page ? { background: NAVY } : {}}
                    >
                      {pageNum}
                    </Button>
                  );
                })}
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page >= totalPages}
                  onClick={() => fetchLogs(page + 1)}
                  className="h-8 w-8 p-0"
                >
                  <ChevronRight size={14} />
                </Button>
              </div>
            </div>
          )}
        </>
      )}

      <DetailDrawer log={selectedLog} open={drawerOpen} onClose={() => { setDrawerOpen(false); setSelectedLog(null); }} />
    </div>
  );
}
