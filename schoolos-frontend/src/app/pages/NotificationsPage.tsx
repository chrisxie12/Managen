import { useState, useMemo, useEffect } from "react";
import {
  Bell, AlertTriangle, CreditCard, Megaphone, Info, Loader2,
  CheckCircle2, GraduationCap, BookOpen, DollarSign,
  CheckCheck,
} from "lucide-react";
import { api } from "../services/api";
import { useAuth } from "../contexts/AuthContext";
import { useRealtimeNotifications } from "../hooks/useRealtimeNotifications";

const NAVY = "#031B4E";
const NAVY_LIGHT = "#0069D9";
const CREAM = "#F8F9FA";
const MUTED = "#6B7280";

const CATEGORIES = [
  { key: "all", label: "All", icon: Bell },
  { key: "grade", label: "Grades", icon: GraduationCap },
  { key: "report_card", label: "Reports", icon: BookOpen },
  { key: "fee", label: "Fees", icon: CreditCard },
  { key: "attendance", label: "Attendance", icon: AlertTriangle },
  { key: "announcement", label: "Announcements", icon: Megaphone },
];

const TYPE_ICONS: Record<string, { icon: any; bg: string }> = {
  grade: { icon: GraduationCap, bg: "#D1FAE5" },
  report_card: { icon: BookOpen, bg: "#DBEAFE" },
  fee: { icon: DollarSign, bg: "#FEF3C7" },
  attendance: { icon: AlertTriangle, bg: "#FEE2E2" },
  announcement: { icon: Megaphone, bg: "#EDE9FE" },
  general: { icon: Info, bg: "#F3F4F6" },
};

export function NotificationsPage() {
  const { user, school } = useAuth();
  const userId = user?.id;
  const schoolId = school?.slug; // slug maps to school context in backend
  const [filterTab, setFilterTab] = useState("all");
  const [showUnread, setShowUnread] = useState(false);

  const {
    notifications,
    unreadCount,
    loading,
    markAsRead,
    markAllAsRead,
  } = useRealtimeNotifications(userId, schoolId);

  // Also fetch delivery logs (SMS/email) for admin view
  const [logs, setLogs] = useState<any[]>([]);
  const [logsLoading, setLogsLoading] = useState(false);

  const isStaff = user && ["school_admin", "headmaster", "teacher"].includes(user.role);

  useEffect(() => {
    if (isStaff) {
      setLogsLoading(true);
      api.get<{ data: { notifications: any[] } }>("/api/school/notifications")
        .then((res) => setLogs(res.data?.data?.notifications || []))
        .catch(() => {})
        .finally(() => setLogsLoading(false));
    }
  }, [isStaff]);

  const filtered = useMemo(() => {
    let list = notifications;
    if (filterTab !== "all") {
      list = list.filter((n) => n.type === filterTab);
    }
    if (showUnread) {
      list = list.filter((n) => !n.is_read);
    }
    return list;
  }, [notifications, filterTab, showUnread]);

  const typeStyle = (type: string) =>
    TYPE_ICONS[type] || TYPE_ICONS.general;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold" style={{ color: NAVY, fontFamily: "'Playfair Display', serif" }}>
            Notifications
          </h2>
          <p className="text-sm" style={{ color: MUTED }}>
            {unreadCount > 0 ? `${unreadCount} unread` : "You're all caught up"}
          </p>
        </div>
        {unreadCount > 0 && (
          <button
            onClick={markAllAsRead}
            className="px-3 py-1.5 rounded-xl text-xs font-medium flex items-center gap-1.5"
            style={{ background: NAVY, color: "white" }}
          >
            <CheckCheck size={14} />
            Mark all read
          </button>
        )}
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        {CATEGORIES.map((c) => (
          <button
            key={c.key}
            onClick={() => setFilterTab(c.key)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all"
            style={{
              background: filterTab === c.key ? NAVY : "white",
              color: filterTab === c.key ? CREAM : NAVY_LIGHT,
              border: filterTab === c.key ? "none" : "1px solid rgba(10,36,114,0.1)",
            }}
          >
            <c.icon size={13} /> {c.label}
          </button>
        ))}
        <button
          onClick={() => setShowUnread(!showUnread)}
          className="ml-auto px-3 py-1.5 rounded-xl text-xs font-medium"
          style={{
            background: showUnread ? NAVY : "transparent",
            color: showUnread ? "white" : MUTED,
            border: "1px solid rgba(10,36,114,0.1)",
          }}
        >
          Unread only
        </button>
      </div>

      {loading && (
        <div className="flex justify-center py-12">
          <Loader2 size={24} className="animate-spin" style={{ color: MUTED }} />
        </div>
      )}

      {!loading && filtered.length === 0 && (
        <div className="text-center py-12" style={{ color: MUTED }}>
          <Bell size={36} className="mx-auto mb-3" />
          <p className="font-semibold" style={{ color: NAVY }}>No Notifications</p>
          <p className="text-sm mt-1">
            {showUnread ? "No unread notifications." : "You're all caught up."}
          </p>
        </div>
      )}

      {!loading && filtered.length > 0 && (
        <div className="space-y-2">
          {filtered.map((n) => {
            const style = typeStyle(n.type);
            return (
              <div
                key={n.id}
                onClick={() => !n.is_read && markAsRead(n.id)}
                className="p-3 rounded-xl flex items-start gap-3 transition-all duration-150 cursor-pointer"
                style={{
                  background: n.is_read ? "white" : "rgba(10,36,114,0.03)",
                  border: n.is_read
                    ? "1px solid rgba(10,36,114,0.07)"
                    : `1px solid ${NAVY}22`,
                  opacity: n.is_read ? 0.7 : 1,
                }}
              >
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                  style={{ background: style.bg }}
                >
                  <style.icon size={14} style={{ color: NAVY }} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-medium truncate" style={{ color: NAVY }}>
                      {n.title}
                    </p>
                    <div className="flex items-center gap-2 shrink-0">
                      {!n.is_read && (
                        <span
                          className="w-2 h-2 rounded-full"
                          style={{ background: NAVY }}
                        />
                      )}
                      <span className="text-xs" style={{ color: MUTED }}>
                        {new Date(n.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  {n.message && (
                    <p className="text-xs mt-0.5" style={{ color: NAVY_LIGHT }}>
                      {n.message}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Admin delivery logs */}
      {isStaff && (
        <details className="mt-6">
          <summary className="text-sm font-medium cursor-pointer" style={{ color: MUTED }}>
            Delivery Logs (SMS/Email) — {logs.length}
          </summary>
          <div className="mt-2 space-y-1 max-h-60 overflow-y-auto">
            {(logsLoading ? [] : logs).map((log: any) => (
              <div
                key={log.id}
                className="p-2 rounded text-xs flex items-center gap-2"
                style={{ background: "white", border: "1px solid rgba(10,36,114,0.05)" }}
              >
                {log.status === "sent" ? (
                  <CheckCircle2 size={10} color="#16A34A" />
                ) : (
                  <AlertTriangle size={10} color="#EF4444" />
                )}
                <span style={{ color: NAVY }}>{log.type}</span>
                <span style={{ color: MUTED }}>{log.channel}</span>
                <span style={{ color: MUTED }}>{log.recipient}</span>
                <span className="ml-auto" style={{ color: MUTED }}>
                  {new Date(log.created_at).toLocaleDateString()}
                </span>
              </div>
            ))}
          </div>
        </details>
      )}
    </div>
  );
}
