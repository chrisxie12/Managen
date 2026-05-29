import { useState, useEffect } from "react";
import { Loader2, Megaphone } from "lucide-react";
import { api } from "../../services/api";

const NAVY = "#0A2472";
const NAVY_LIGHT = "#0C2D8A";
const CREAM = "#F8F9FA";
const MUTED = "#6B7280";

type Announcement = {
  id: string;
  title: string;
  body: string;
  status: string;
  created_at: string;
};

export function StudentAnnouncements() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get<{ records: Announcement[] }>("/api/school/communications/announcements/list?limit=10")
      .then(res => setAnnouncements(res.data?.records || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="flex justify-center py-8"><Loader2 size={24} className="animate-spin" color={MUTED} /></div>;
  }

  if (announcements.length === 0) {
    return (
      <div className="text-center py-6" style={{ color: MUTED }}>
        <Megaphone size={28} className="mx-auto mb-2" />
        <p className="text-sm">No announcements.</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {announcements.slice(0, 5).map(a => (
        <div key={a.id} className="p-3 rounded-xl" style={{ background: CREAM }}>
          <div className="flex items-start justify-between mb-1">
            <p className="text-sm font-medium" style={{ color: NAVY }}>{a.title}</p>
            <span className="text-xs" style={{ color: MUTED }}>{new Date(a.created_at).toLocaleDateString()}</span>
          </div>
          {a.body && <p className="text-xs line-clamp-2" style={{ color: NAVY_LIGHT }}>{a.body}</p>}
        </div>
      ))}
    </div>
  );
}
