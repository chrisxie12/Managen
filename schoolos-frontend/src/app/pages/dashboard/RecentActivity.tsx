import { format, formatDistanceToNow } from "date-fns";
import {
  Users, Wallet, FileText, CheckCircle2, AlertCircle,
  MessageSquare, Settings, Clock, LogIn, LogOut,
  LucideIcon
} from "lucide-react";

interface ActivityLog {
  id: string;
  type: "user_created" | "fee_collected" | "report_generated" | "approval_completed" | "alert" | "message_sent" | "settings_changed" | "login" | "logout" | "fee_reminder";
  title: string;
  description: string;
  user?: string;
  timestamp: Date;
  metadata?: Record<string, any>;
  severity?: "critical" | "warning" | "info" | "success";
}

const activityTypeConfig: Record<string, { icon: LucideIcon; color: string; bg: string }> = {
  user_created: { icon: Users, color: "#0A2472", bg: "#E0E7FF" },
  fee_collected: { icon: Wallet, color: "#10B981", bg: "#DCFCE7" },
  report_generated: { icon: FileText, color: "#3B82F6", bg: "#DBEAFE" },
  approval_completed: { icon: CheckCircle2, color: "#8B5CF6", bg: "#F3E8FF" },
  alert: { icon: AlertCircle, color: "#EF4444", bg: "#FEE2E2" },
  message_sent: { icon: MessageSquare, color: "#EC4899", bg: "#FCE7F3" },
  settings_changed: { icon: Settings, color: "#6B7280", bg: "#F3F4F6" },
  login: { icon: LogIn, color: "#06B6D4", bg: "#CFFAFE" },
  logout: { icon: LogOut, color: "#64748B", bg: "#F1F5F9" },
  fee_reminder: { icon: Clock, color: "#F59E0B", bg: "#FEF3C7" },
};

interface RecentActivityProps {
  activities?: ActivityLog[];
  onActivityClick?: (activity: ActivityLog) => void;
  maxItems?: number;
}

export function RecentActivity({ activities = [], onActivityClick, maxItems = 6 }: RecentActivityProps) {
  // Mock activities if none provided
  const mockActivities: ActivityLog[] = [
    {
      id: "1",
      type: "fee_collected",
      title: "Fee Payment Received",
      description: "KES 15,000 payment from Jane Kipchoge",
      user: "System",
      timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000),
      severity: "success",
    },
    {
      id: "2",
      type: "report_generated",
      title: "Report Cards Generated",
      description: "Term 2 report cards for Class 4 Blue",
      user: "Mrs. Kamau",
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
      severity: "success",
    },
    {
      id: "3",
      type: "user_created",
      title: "New Student Enrolled",
      description: "Samuel Kipchoge - Class 3 Green",
      user: "John Mutua",
      timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000),
      severity: "info",
    },
    {
      id: "4",
      type: "fee_reminder",
      title: "Fee Reminder Sent",
      description: "Automated reminder to 42 parents",
      user: "System",
      timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000),
      severity: "info",
    },
    {
      id: "5",
      type: "alert",
      title: "System Alert",
      description: "Database backup completed successfully",
      user: "System",
      timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000),
      severity: "success",
    },
    {
      id: "6",
      type: "approval_completed",
      title: "Exam Results Approved",
      description: "Class 4 Blue exam results approved",
      user: "Dr. Kipchoge",
      timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000),
      severity: "success",
    },
  ];

  const displayActivities = activities.length > 0 ? activities : mockActivities;
  const limitedActivities = displayActivities.slice(0, maxItems);

  return (
    <div
      className="p-6 rounded-2xl border"
      style={{ background: "white", borderColor: "#E5E7EB" }}
    >
      <h3 style={{ fontSize: "1rem", fontWeight: 700, marginBottom: "1.5rem" }}>
        Recent Activity
      </h3>

      <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
        {limitedActivities.map((activity, idx) => {
          const config = activityTypeConfig[activity.type];
          const Icon = config.icon;
          const timeAgo = formatDistanceToNow(activity.timestamp, { addSuffix: true });

          return (
            <button
              key={activity.id}
              onClick={() => onActivityClick?.(activity)}
              style={{
                display: "flex",
                gap: "1rem",
                padding: "1rem",
                borderRadius: "0.75rem",
                border: "1px solid #E5E7EB",
                background: "white",
                cursor: "pointer",
                transition: "all 0.2s",
                textAlign: "left",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.background = "#F9FAFB";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.background = "white";
              }}
            >
              <div
                style={{
                  flex: "0 0 40px",
                  width: "40px",
                  height: "40px",
                  borderRadius: "0.75rem",
                  background: config.bg,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Icon size={20} color={config.color} />
              </div>

              <div style={{ flex: 1, minWidth: 0 }}>
                <div
                  style={{
                    fontSize: "0.875rem",
                    fontWeight: 600,
                    marginBottom: "0.25rem",
                    color: "#1F2937",
                  }}
                >
                  {activity.title}
                </div>
                <div
                  style={{
                    fontSize: "0.75rem",
                    color: "#6B7280",
                    marginBottom: "0.25rem",
                  }}
                >
                  {activity.description}
                </div>
                <div
                  style={{
                    fontSize: "0.625rem",
                    color: "#9CA3AF",
                  }}
                >
                  {activity.user} • {timeAgo}
                </div>
              </div>

              {activity.severity === "critical" && (
                <div
                  style={{
                    width: "8px",
                    height: "8px",
                    borderRadius: "50%",
                    background: "#EF4444",
                    flex: "0 0 8px",
                  }}
                />
              )}
            </button>
          );
        })}
      </div>

      <button
        style={{
          width: "100%",
          padding: "0.75rem",
          marginTop: "1rem",
          borderRadius: "0.75rem",
          border: "1px solid #E5E7EB",
          background: "white",
          fontWeight: 600,
          cursor: "pointer",
          color: "#0A2472",
          fontSize: "0.875rem",
        }}
      >
        View All Activity
      </button>
    </div>
  );
}
