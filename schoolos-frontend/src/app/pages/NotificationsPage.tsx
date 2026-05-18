import { useState, useEffect } from "react";
import { AlertCircle, X } from "lucide-react";
import { api } from "../services/api";
import { NotificationList } from "../components/notifications/NotificationList";

const PLUM = "#381932";
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

export function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    api.get<{ notifications: Notification[] }>("/api/school/notifications")
      .then(res => setNotifications(res.data?.notifications || []))
      .catch(err => setError(err.message || "Failed to load notifications."))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-5">
      {error && (
        <div className="p-3 rounded-xl flex items-center gap-2" style={{ background: "#FEF2F2", color: "#EF4444", border: "1px solid #FECACA", fontSize: "0.9rem" }}>
          <AlertCircle size={14} /> <span className="flex-1">{error}</span>
          <button onClick={() => setError("")}><X size={14} /></button>
        </div>
      )}

      <div>
        <h2 className="text-xl font-bold" style={{ color: PLUM, fontFamily: "'Playfair Display', serif" }}>Notifications</h2>
        <p className="text-sm" style={{ color: MUTED }}>Stay updated with school alerts and messages</p>
      </div>

      <NotificationList notifications={notifications} loading={loading} />
    </div>
  );
}
