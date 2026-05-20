import { useState } from "react";
import { Send, Loader2, CheckCircle2, X, AlertTriangle } from "lucide-react";
import { api } from "../../services/api";

const NAVY = "#0A2472";
const NAVY_LIGHT = "#0C2D8A";
const CREAM = "#F8F9FA";
const MUTED = "#6B7280";

export function ComposeMessage({ onSent }: { onSent: () => void }) {
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [recipientInput, setRecipientInput] = useState("");
  const [sending, setSending] = useState(false);
  const [alert, setAlert] = useState<{ type: "error" | "success"; message: string } | null>(null);

  const send = async () => {
    if (!body.trim()) return;
    setSending(true);
    setAlert(null);
    try {
      // Simple direct send — in production, recipient resolution would be richer
      const recipients = recipientInput.split(/[\n,]/).map(s => s.trim()).filter(Boolean);
      await api.post("/api/school/communications/send", {
        subject: subject.trim() || "(no subject)",
        body: body.trim(),
        channel: "in_app",
        recipients: recipients.length > 0 ? recipients.map(c => ({ type: "custom", id: null, name: null, contact: c })) : [],
      });
      setAlert({ type: "success", message: "Message sent." });
      setSubject(""); setBody(""); setRecipientInput("");
      onSent();
    } catch (err: any) {
      setAlert({ type: "error", message: err.message || "Failed to send." });
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
          <button onClick={() => setAlert(null)}><X size={14} /></button>
        </div>
      )}

      <div>
        <label className="block text-xs font-medium mb-1" style={{ color: MUTED }}>Subject</label>
        <input value={subject} onChange={e => setSubject(e.target.value)}
          className="w-full px-4 py-2.5 rounded-xl outline-none text-sm" placeholder="Subject..."
          style={{ background: "white", border: "1px solid rgba(56,25,50,0.1)", color: NAVY }} />
      </div>
      <div>
        <label className="block text-xs font-medium mb-1" style={{ color: MUTED }}>Message</label>
        <textarea value={body} onChange={e => setBody(e.target.value)} rows={5}
          className="w-full px-4 py-2.5 rounded-xl outline-none text-sm resize-none" placeholder="Write your message..."
          style={{ background: "white", border: "1px solid rgba(56,25,50,0.1)", color: NAVY }} />
      </div>
      <button onClick={send} disabled={sending || !body.trim()}
        className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold active:scale-95 transition-transform disabled:opacity-50"
        style={{ background: `linear-gradient(135deg, ${NAVY}, ${NAVY_LIGHT})`, color: CREAM }}>
        {sending ? <Loader2 size={15} className="animate-spin" /> : <Send size={15} />}
        {sending ? "Sending..." : "Send Message"}
      </button>
    </div>
  );
}
