import { useState } from "react";
import { Loader2, Send, CheckCircle2, X, AlertTriangle } from "lucide-react";
import { api } from "../../services/api";

const NAVY = "#0A2472";
const NAVY_LIGHT = "#0C2D8A";
const CREAM = "#F8F9FA";
const MUTED = "#6B7280";

export function ClassAnnouncement({ className }: { className: string; classId: string }) {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [sending, setSending] = useState(false);
  const [alert, setAlert] = useState<{ type: "error" | "success"; message: string } | null>(null);

  const sendAnnouncement = async () => {
    if (!title.trim() || !body.trim()) return;
    setSending(true);
    setAlert(null);
    try {
      const res = await api.post<any>("/api/school/communications/announcements", {
        title: title.trim(),
        body: body.trim(),
        channel: "in_app",
      });
      // Announcement created as draft — try publishing it immediately
      const annId = res.data?.id;
      if (annId) {
        await api.put(`/api/school/communications/announcements/${annId}/publish`, {}).catch(() => {});
      }
      setAlert({ type: "success", message: `Announcement sent to ${className}.` });
      setTitle("");
      setBody("");
    } catch {
      setAlert({ type: "error", message: "Failed to send announcement." });
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="space-y-4 max-w-xl">
      {alert && (
        <div className="p-3 rounded-xl flex items-center gap-2" style={{
          background: alert.type === "error" ? "#FEF2F2" : "#D1FAE5",
          color: alert.type === "error" ? "#EF4444" : "#065F46",
          border: `1px solid ${alert.type === "error" ? "#FECACA" : "#A7F3D0"}`,
          fontSize: "0.9rem",
        }}>
          {alert.type === "error" ? <AlertTriangle size={14} /> : <CheckCircle2 size={14} />}
          <span className="flex-1">{alert.message}</span>
          <button onClick={() => setAlert(null)} className="ml-auto"><X size={14} /></button>
        </div>
      )}

      <div>
        <label className="block text-xs uppercase tracking-wider mb-1.5 font-medium" style={{ color: MUTED }}>Title</label>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Announcement title..."
          className="w-full px-4 py-2.5 rounded-xl outline-none text-sm"
          style={{ background: "white", border: "1px solid rgba(56,25,50,0.1)", color: NAVY }}
        />
      </div>
      <div>
        <label className="block text-xs uppercase tracking-wider mb-1.5 font-medium" style={{ color: MUTED }}>Message</label>
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Write your announcement..."
          rows={4}
          className="w-full px-4 py-2.5 rounded-xl outline-none text-sm resize-none"
          style={{ background: "white", border: "1px solid rgba(56,25,50,0.1)", color: NAVY }}
        />
      </div>
      <button
        onClick={sendAnnouncement}
        disabled={sending || !title.trim() || !body.trim()}
        className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold active:scale-95 transition-transform disabled:opacity-50"
        style={{ background: `linear-gradient(135deg, ${NAVY}, ${NAVY_LIGHT})`, color: CREAM }}
      >
        {sending ? <Loader2 size={15} className="animate-spin" /> : <Send size={15} />}
        {sending ? "Sending..." : `Send to ${className}`}
      </button>
    </div>
  );
}
