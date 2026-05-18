import { useState, useMemo } from "react";
import { Bell, AlertTriangle, CreditCard, Megaphone, Info, Loader2, CheckCircle2, Filter } from "lucide-react";

const PLUM = "#381932";
const PLUM_LIGHT = "#512b4a";
const MILK = "#FFF3E6";
const MUTED = "#7D6077";

type Notification = {
  id: string;
  type: string;
  channel: string;
  recipient: string;
  status: string;
  error_message?: string;
  created_at: string;
};

const CATEGORIES = [
  { key: "all", label: "All", icon: Bell },
  { key: "academic", label: "Academic", icon: Info },
  { key: "attendance", label: "Attendance", icon: AlertTriangle },
  { key: "fee", label: "Fees", icon: CreditCard },
  { key: "announcement", label: "Announcements", icon: Megaphone },
];

const TYPE_CATEGORY: Record<string, string> = {
  fee_reminder: "fee",
  attendance_alert: "attendance",
  academic_alert: "academic",
  announcement: "announcement",
  system: "system",
  grade_published: "academic",
  report_card: "academic",
};

export function NotificationList({ notifications, loading }: { notifications: Notification[]; loading: boolean }) {
  const [category, setCategory] = useState("all");
  const [timeRange, setTimeRange] = useState("all");

  const filtered = useMemo(() => {
    let list = notifications;
    if (category !== "all") {
      list = list.filter(n => (TYPE_CATEGORY[n.type] || "system") === category);
    }
    if (timeRange === "7d") {
      const cutoff = Date.now() - 7 * 86400000;
      list = list.filter(n => new Date(n.created_at).getTime() > cutoff);
    } else if (timeRange === "30d") {
      const cutoff = Date.now() - 30 * 86400000;
      list = list.filter(n => new Date(n.created_at).getTime() > cutoff);
    }
    return list;
  }, [notifications, category, timeRange]);

  if (loading) {
    return <div className="flex justify-center py-12"><Loader2 size={24} className="animate-spin" color={MUTED} /></div>;
  }

  const statusIcon = (status: string) =>
    status === "sent" ? <CheckCircle2 size={12} color="#10B981" /> :
    status === "failed" ? <AlertTriangle size={12} color="#EF4444" /> : null;

  const typeLabel = (type: string) => type.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase());

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 flex-wrap">
        {CATEGORIES.map(c => (
          <button key={c.key} onClick={() => setCategory(c.key)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all"
            style={{
              background: category === c.key ? PLUM : "white",
              color: category === c.key ? MILK : PLUM_LIGHT,
              border: category === c.key ? "none" : "1px solid rgba(56,25,50,0.1)",
            }}>
            <c.icon size={13} /> {c.label}
          </button>
        ))}
        <select value={timeRange} onChange={e => setTimeRange(e.target.value)}
          className="ml-auto px-3 py-1.5 rounded-xl text-xs outline-none" style={{ background: "white", border: "1px solid rgba(56,25,50,0.1)", color: PLUM }}>
          <option value="all">All time</option>
          <option value="7d">Last 7 days</option>
          <option value="30d">Last 30 days</option>
        </select>
      </div>

      {notifications.length === 0 ? (
        <div className="text-center py-12" style={{ color: MUTED }}>
          <Bell size={36} className="mx-auto mb-3" />
          <p className="font-semibold" style={{ color: PLUM }}>No Notifications</p>
          <p className="text-sm mt-1">You're all caught up.</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-8" style={{ color: MUTED }}>
          <Filter size={24} className="mx-auto mb-2" />
          <p className="text-sm">No notifications match the selected filter.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map(n => (
            <div key={n.id} className="p-3 rounded-xl flex items-start gap-3" style={{ background: "white", border: "1px solid rgba(56,25,50,0.07)" }}>
              <div className="mt-0.5">{statusIcon(n.status)}</div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium" style={{ color: PLUM }}>{typeLabel(n.type)}</p>
                  <span className="text-xs" style={{ color: MUTED }}>{new Date(n.created_at).toLocaleDateString()}</span>
                </div>
                <p className="text-xs mt-0.5" style={{ color: PLUM_LIGHT }}>{n.recipient}</p>
                {n.error_message && <p className="text-xs mt-0.5" style={{ color: "#EF4444" }}>{n.error_message}</p>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
