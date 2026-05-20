import { useState, useEffect, useCallback } from "react";
import {
  Loader2, X, AlertCircle, Check, RefreshCw, Server, Database,
  Wifi, HardDrive, Mail, Phone, Globe,
  Activity, AlertTriangle, ChevronDown, ChevronUp,
} from "lucide-react";
import { api } from "../services/api";
import { Button } from "../components/ui/button";


const NAVY = "#0A2472";
const MUTED = "#6B7280";

type HealthStatus = "healthy" | "degraded" | "down" | "unconfigured";

type ServiceCheck = {
  status: HealthStatus; latency?: number; detail?: string;
  uptime?: string; memory?: Record<string, any>;
  counts?: Record<string, number>; storage?: string; estimatedRows?: number;
  platform?: string; hostname?: string; cpuCores?: number;
  loadAvg?: number[]; freeMem?: string; totalMem?: string;
  nodeVersion?: string; startTime?: string;
};

type NotificationStats = {
  total: number; sent: number; failed: number; rate: number;
  byChannel: Record<string, { sent: number; failed: number; total: number }>;
};

type FailureRecord = {
  id: string; type: string; channel: string;
  recipient: string; error: string | null; created_at: string;
};

type IncidentRecord = {
  id: string; type: string; resource: string;
  resource_id: string | null; actor: string; action: string; created_at: string;
};

type HealthData = {
  status: HealthStatus; timestamp: string;
  summary: { total: number; healthy: number; degraded: number; down: number; unconfigured: number };
  checks: Record<string, ServiceCheck>;
  notifications: NotificationStats;
  recentFailures: { total: number; records: FailureRecord[] };
  incidents: { total: number; records: IncidentRecord[] };
};

const statusConfig: Record<HealthStatus, { label: string; bg: string; color: string; icon: any }> = {
  healthy: { label: "Healthy", bg: "#D1FAE5", color: "#065F46", icon: Check },
  degraded: { label: "Degraded", bg: "#FEF9C3", color: "#92400E", icon: AlertTriangle },
  down: { label: "Down", bg: "#FEF2F2", color: "#991B1B", icon: X },
  unconfigured: { label: "Unconfigured", bg: "#F3F4F6", color: "#6B7280", icon: AlertCircle },
};

const serviceLabels: Record<string, { label: string; icon: any }> = {
  db: { label: "Database", icon: Database },
  server: { label: "Server", icon: Server },
  redis: { label: "Redis Cache", icon: Wifi },
  queue: { label: "Background Jobs", icon: Activity },
  storage: { label: "Storage", icon: HardDrive },
  email: { label: "Email (Mailgun)", icon: Mail },
  sms: { label: "SMS (Arkesel)", icon: Phone },
  whatsapp: { label: "WhatsApp (Twilio)", icon: Globe },
};

const AlertBanner = ({ type, message, onClose }: { type: "error" | "success"; message: string; onClose: () => void }) => (
  <div className="mb-4 p-3 rounded-xl flex items-center gap-2 text-sm"
    style={{ background: type === "error" ? "#FEF2F2" : "#D1FAE5", color: type === "error" ? "#EF4444" : "#065F46", border: `1px solid ${type === "error" ? "#FECACA" : "#A7F3D0"}` }}>
    {type === "error" ? <AlertCircle size={14} /> : <Check size={14} />}
    <span className="flex-1">{message}</span>
    <button onClick={onClose}><X size={14} /></button>
  </div>
);

const LoadingSpinner = ({ height = 48 }: { height?: number }) => (
  <div className="flex items-center justify-center" style={{ height }}><Loader2 className="animate-spin" size={24} color={NAVY} /></div>
);

function ServiceCard({ name, check }: { name: string; check: ServiceCheck }) {
  const sconfig = statusConfig[check.status] || statusConfig.unconfigured;
  const sinfo = serviceLabels[name] || { label: name, icon: Activity };
  const Icon = sinfo.icon;
  const SIcon = sconfig.icon;

  const showDetails = () => {
    const parts: string[] = [];
    if (check.latency != null) parts.push(`${check.latency}ms`);
    if (check.detail) parts.push(check.detail);
    if (check.counts) {
      const c = check.counts;
      parts.push(`${c.waiting || 0} waiting, ${c.active || 0} active, ${c.failed || 0} failed`);
    }
    if (check.storage) parts.push(check.storage);
    return parts.join(" — ");
  };

  return (
    <div className="p-4 rounded-2xl flex items-center justify-between"
      style={{ background: "white", border: "1px solid rgba(10,36,114,0.07)" }}>
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: sconfig.bg }}>
          <Icon size={18} color={sconfig.color} />
        </div>
        <div>
          <p className="text-sm font-semibold" style={{ color: NAVY }}>{sinfo.label}</p>
          <p className="text-xs" style={{ color: MUTED }}>{showDetails() || "—"}</p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <SIcon size={14} color={sconfig.color} />
        <span className="text-xs font-medium" style={{ color: sconfig.color }}>{sconfig.label}</span>
      </div>
    </div>
  );
}

const formatDate = (iso: string | null) => {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
};

export function SystemHealth() {
  const [data, setData] = useState<HealthData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [alert, setAlert] = useState<{ type: "error" | "success"; message: string } | null>(null);
  const [serverExpanded, setServerExpanded] = useState(false);

  const fetch = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const res = await api.get<HealthData>("/school/health");
      if (res.error) { setError(res.error); return; }
      if (res.data) setData(res.data);
    } catch (err: any) { setError(err.message || "Failed to load health data."); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetch(); }, []);

  const handleRefresh = async () => {
    setLoading(true);
    try {
      const res = await api.get<HealthData>("/school/health/refresh");
      if (res.data) setData(res.data);
      setAlert({ type: "success", message: "Health check refreshed." });
    } catch { setAlert({ type: "error", message: "Refresh failed." }); }
    finally { setLoading(false); }
  };

  if (loading && !data) return <div className="p-6 max-w-7xl mx-auto"><LoadingSpinner height={400} /></div>;
  if (error && !data) return (
    <div className="p-6 max-w-7xl mx-auto text-center py-16">
      <AlertCircle size={40} color="#EF4444" className="mx-auto mb-3" />
      <p className="text-sm font-medium" style={{ color: "#EF4444" }}>{error}</p>
      <Button variant="outline" size="sm" className="mt-3" onClick={fetch}>Retry</Button>
    </div>
  );

  const s = data?.summary;
  const sd = data?.status ? statusConfig[data.status] : null;

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {alert && <AlertBanner type={alert.type} message={alert.message} onClose={() => setAlert(null)} />}

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold" style={{ color: NAVY }}>System Health</h1>
          <p className="text-xs mt-1" style={{ color: MUTED }}>
            {data?.timestamp ? `Last checked ${formatDate(data.timestamp)}` : "Platform reliability & service status"}
          </p>
        </div>
        <Button onClick={handleRefresh} disabled={loading} variant="outline" size="sm" className="text-xs rounded-xl">
          <RefreshCw size={14} className={`mr-1 ${loading ? "animate-spin" : ""}`} />
          {loading ? "Checking..." : "Refresh"}
        </Button>
      </div>

      {sd && (
        <div className="flex items-center gap-3 mb-6 p-4 rounded-2xl" style={{ background: sd.bg, border: `1px solid ${sd.color}20` }}>
          <sd.icon size={24} color={sd.color} />
          <div>
            <p className="font-semibold text-sm" style={{ color: sd.color }}>
              Overall Status: {sd.label}
            </p>
            <p className="text-xs" style={{ color: sd.color, opacity: 0.8 }}>
              {s?.healthy}/{s?.total} services healthy
              {s && s.degraded > 0 ? `, ${s.degraded} degraded` : ""}
              {s && s.down > 0 ? `, ${s.down} down` : ""}
              {s && s.unconfigured > 0 ? `, ${s.unconfigured} unconfigured` : ""}
            </p>
          </div>
        </div>
      )}

      {s && (
        <div className="flex flex-wrap gap-3 mb-6">
          {[
            { label: "Healthy", count: s.healthy, color: "#10B981", icon: Check },
            { label: "Degraded", count: s.degraded, color: "#F59E0B", icon: AlertTriangle },
            { label: "Down", count: s.down, color: "#EF4444", icon: X },
            { label: "Unconfigured", count: s.unconfigured, color: "#6B7280", icon: AlertCircle },
          ].filter(g => g.count > 0).map(g => (
            <div key={g.label} className="flex items-center gap-2 px-4 py-2 rounded-xl" style={{ background: "white", border: "1px solid rgba(10,36,114,0.07)" }}>
              <g.icon size={16} color={g.color} />
              <span className="text-sm font-semibold" style={{ color: g.color }}>{g.count}</span>
              <span className="text-xs" style={{ color: MUTED }}>{g.label}</span>
            </div>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
        {data?.checks && Object.entries(data.checks).map(([name, check]) => (
          <ServiceCard key={name} name={name} check={check} />
        ))}
      </div>

      {data?.checks?.server && (
        <div className="mb-8">
          <button onClick={() => setServerExpanded(!serverExpanded)}
            className="flex items-center gap-2 text-sm font-semibold mb-3" style={{ color: NAVY }}>
            {serverExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            Server Details
          </button>
          {serverExpanded && (
            <div className="p-4 rounded-2xl grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 text-xs"
              style={{ background: "white", border: "1px solid rgba(10,36,114,0.07)" }}>
              {[
                { label: "Uptime", value: data.checks.server.uptime || "—" },
                { label: "Platform", value: data.checks.server.platform || "—" },
                { label: "Hostname", value: data.checks.server.hostname || "—" },
                { label: "CPU Cores", value: String(data.checks.server.cpuCores || "—") },
                { label: "Load (1m)", value: String(data.checks.server.loadAvg?.[0]?.toFixed(2) || "—") },
                { label: "Load (5m)", value: String(data.checks.server.loadAvg?.[1]?.toFixed(2) || "—") },
                { label: "Load (15m)", value: String(data.checks.server.loadAvg?.[2]?.toFixed(2) || "—") },
                { label: "Memory (RSS)", value: data.checks.server.memory?.rss || "—" },
                { label: "Heap Used", value: data.checks.server.memory?.heapUsed || "—" },
                { label: "Heap Total", value: data.checks.server.memory?.heapTotal || "—" },
                { label: "Free Memory", value: data.checks.server.freeMem || "—" },
                { label: "Total Memory", value: data.checks.server.totalMem || "—" },
                { label: "Node Version", value: data.checks.server.nodeVersion || "—" },
                { label: "Start Time", value: data.checks.server.startTime ? formatDate(data.checks.server.startTime) : "—" },
              ].map(({ label, value }) => (
                <div key={label} className="p-2 rounded-xl" style={{ background: "rgba(10,36,114,0.03)" }}>
                  <span className="block font-medium" style={{ color: MUTED }}>{label}</span>
                  <span style={{ color: NAVY }}>{value}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {data?.notifications && data.notifications.total > 0 && (
        <div className="mb-8">
          <h3 className="text-sm font-semibold mb-3" style={{ color: NAVY }}>Notification Delivery (7 days)</h3>
          <div className="flex flex-wrap gap-3">
            <div className="p-4 rounded-2xl flex-1 min-w-[140px]" style={{ background: "white", border: "1px solid rgba(10,36,114,0.07)" }}>
              <p className="text-xs" style={{ color: MUTED }}>Total Sent</p>
              <p className="text-lg font-bold" style={{ color: NAVY }}>{data.notifications.sent}</p>
            </div>
            <div className="p-4 rounded-2xl flex-1 min-w-[140px]" style={{ background: "white", border: "1px solid rgba(10,36,114,0.07)" }}>
              <p className="text-xs" style={{ color: MUTED }}>Failed</p>
              <p className="text-lg font-bold" style={{ color: "#EF4444" }}>{data.notifications.failed}</p>
            </div>
            <div className="p-4 rounded-2xl flex-1 min-w-[140px]" style={{ background: "white", border: "1px solid rgba(10,36,114,0.07)" }}>
              <p className="text-xs" style={{ color: MUTED }}>Success Rate</p>
              <p className="text-lg font-bold" style={{ color: data.notifications.rate >= 90 ? "#10B981" : data.notifications.rate >= 70 ? "#F59E0B" : "#EF4444" }}>
                {data.notifications.rate}%
              </p>
            </div>
            {Object.entries(data.notifications.byChannel).map(([ch, st]) => (
              <div key={ch} className="p-4 rounded-2xl flex-1 min-w-[140px]" style={{ background: "white", border: "1px solid rgba(10,36,114,0.07)" }}>
                <p className="text-xs" style={{ color: MUTED }}>{ch}</p>
                <p className="text-lg font-bold" style={{ color: NAVY }}>{st.sent}/{st.total}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {data?.recentFailures && data.recentFailures.records.length > 0 && (
          <div>
            <h3 className="text-sm font-semibold mb-3 flex items-center gap-2" style={{ color: NAVY }}>
              <AlertCircle size={14} /> Recent Failures (7d)
              {data.recentFailures.total > data.recentFailures.records.length && (
                <span className="text-xs font-normal" style={{ color: MUTED }}>
                  showing {data.recentFailures.records.length} of {data.recentFailures.total}
                </span>
              )}
            </h3>
            <div className="space-y-2 max-h-[400px] overflow-y-auto">
              {data.recentFailures.records.map(f => (
                <div key={f.id} className="p-3 rounded-xl text-xs" style={{ background: "#FEF2F2", border: "1px solid #FECACA" }}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium" style={{ color: "#991B1B" }}>{f.channel?.toUpperCase()} — {f.type}</span>
                    <span style={{ color: MUTED }}>{formatDate(f.created_at)}</span>
                  </div>
                  <p style={{ color: "#92400E" }}>To: {f.recipient || "—"}</p>
                  {f.error && <p className="mt-1 font-mono" style={{ color: "#6B7280", fontSize: "0.7rem", wordBreak: "break-word" }}>{f.error}</p>}
                </div>
              ))}
            </div>
          </div>
        )}

        {data?.incidents && data.incidents.records.length > 0 && (
          <div>
            <h3 className="text-sm font-semibold mb-3 flex items-center gap-2" style={{ color: NAVY }}>
              <AlertTriangle size={14} /> Recent Delete Events (7d)
              {data.incidents.total > data.incidents.records.length && (
                <span className="text-xs font-normal" style={{ color: MUTED }}>
                  showing {data.incidents.records.length} of {data.incidents.total}
                </span>
              )}
            </h3>
            <div className="space-y-2 max-h-[400px] overflow-y-auto">
              {data.incidents.records.map(inc => (
                <div key={inc.id} className="p-3 rounded-xl text-xs" style={{ background: "#FFF7ED", border: "1px solid #FED7AA" }}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium" style={{ color: "#9A3412" }}>{inc.resource} — {inc.action}</span>
                    <span style={{ color: MUTED }}>{formatDate(inc.created_at)}</span>
                  </div>
                  <p style={{ color: "#92400E" }}>By: {inc.actor}</p>
                  {inc.resource_id && <p className="font-mono" style={{ color: "#6B7280", fontSize: "0.7rem" }}>ID: {inc.resource_id}</p>}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {data?.recentFailures && data.recentFailures.records.length === 0 && data?.incidents && data.incidents.records.length === 0 && (
        <div className="text-center py-12">
          <Check size={40} color="#10B981" className="mx-auto mb-3" />
          <p className="text-sm font-semibold" style={{ color: "#065F46" }}>No issues detected in the last 7 days</p>
          <p className="text-xs mt-1" style={{ color: MUTED }}>All systems operational. No failed deliveries or critical events found.</p>
        </div>
      )}
    </div>
  );
}
