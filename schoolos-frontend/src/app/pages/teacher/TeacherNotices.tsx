import { useState } from "react";
import { Send, MessageSquare, Users } from "lucide-react";

const NAVY = "#031B4E";
const MUTED = "#6B7280";

interface Notice {
  id: string; title: string; target: string; date: string;
  channels: string[]; delivered: number; total: number;
}

const mockNotices: Notice[] = [];

export function TeacherNotices() {
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [target, setTarget] = useState("My Classes");
  const [priority, setPriority] = useState("Normal");
  const [channels, setChannels] = useState({ whatsapp: true, sms: false, inApp: true });
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const toggleChannel = (k: keyof typeof channels) => setChannels(c => ({ ...c, [k]: !c[k] }));

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !message) return;
    setSending(true);
    await new Promise(r => setTimeout(r, 1000));
    setSending(false);
    setSent(true);
    setTimeout(() => setSent(false), 3000);
    setTitle(""); setMessage("");
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold" style={{ color: NAVY }}>Send Notice</h1>
        <p className="text-sm mt-1" style={{ color: MUTED }}>Broadcast messages to your students' parents</p>
      </div>

      {/* Compose */}
      <div className="bg-card border border-border rounded-2xl p-5">
        <h3 className="text-sm font-semibold mb-4" style={{ color: NAVY }}>Compose Notice</h3>
        <form onSubmit={handleSend} className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium mb-1 block" style={{ color: NAVY }}>Title</label>
              <input value={title} onChange={e => setTitle(e.target.value)} required
                className="w-full h-9 px-3 rounded-xl text-sm border border-border bg-background focus:outline-none"
                placeholder="Notice subject…" />
            </div>
            <div>
              <label className="text-xs font-medium mb-1 block" style={{ color: NAVY }}>Send To</label>
              <select value={target} onChange={e => setTarget(e.target.value)}
                className="w-full h-9 px-3 rounded-xl text-sm border border-border bg-background focus:outline-none appearance-none">
                <option>My Classes</option>
                <option>Form 1A</option>
                <option>Form 1B</option>
                <option>Form 2A</option>
              </select>
            </div>
          </div>
          <div>
            <label className="text-xs font-medium mb-1 block" style={{ color: NAVY }}>Message</label>
            <textarea value={message} onChange={e => setMessage(e.target.value)} required rows={4}
              className="w-full px-3 py-2 rounded-xl text-sm border border-border bg-background focus:outline-none resize-none"
              placeholder="Type your notice here…" />
          </div>
          <div className="flex items-center gap-4 flex-wrap">
            <div>
              <label className="text-xs font-medium mb-1 block" style={{ color: NAVY }}>Priority</label>
              <select value={priority} onChange={e => setPriority(e.target.value)}
                className="h-8 px-3 rounded-xl text-xs border border-border bg-background focus:outline-none appearance-none">
                <option>Normal</option>
                <option>Urgent</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-medium mb-2 block" style={{ color: NAVY }}>Send via</label>
              <div className="flex items-center gap-3">
                {[
                  { key: "whatsapp" as const, label: "WhatsApp", color: "#16A34A" },
                  { key: "sms" as const, label: "SMS", color: "#0080FF" },
                  { key: "inApp" as const, label: "In-App", color: NAVY },
                ].map(({ key, label, color }) => (
                  <button key={key} type="button" onClick={() => toggleChannel(key)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all border"
                    style={{
                      background: channels[key] ? `${color}15` : "transparent",
                      borderColor: channels[key] ? color : "var(--border)",
                      color: channels[key] ? color : MUTED,
                    }}>
                    {label}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <div className="flex justify-end">
            <button type="submit" disabled={sending || sent}
              className="flex items-center gap-2 px-6 py-2 rounded-xl text-sm font-semibold text-white transition-all active:scale-95"
              style={{ background: sent ? "#16A34A" : NAVY }}>
              {sending ? "Sending…" : sent ? "Sent!" : <><Send size={14} /> Send Notice</>}
            </button>
          </div>
        </form>
      </div>

      {/* History */}
      <div>
        <h3 className="text-sm font-semibold mb-3" style={{ color: NAVY }}>Sent Notices</h3>
        {mockNotices.length === 0 ? (
          <div className="bg-card border border-border rounded-2xl p-10 text-center">
            <MessageSquare size={32} className="mx-auto mb-3" style={{ color: MUTED }} />
            <p className="text-sm" style={{ color: MUTED }}>No notices sent yet. Use the form above to send your first notice.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {mockNotices.map(n => (
              <div key={n.id} className="bg-card border border-border rounded-2xl p-4 flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "#DBEAFE" }}>
                  <MessageSquare size={15} color="#0080FF" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm font-medium" style={{ color: NAVY }}>{n.title}</p>
                    <span className="text-xs flex-shrink-0" style={{ color: MUTED }}>{n.date}</span>
                  </div>
                  <div className="flex items-center gap-3 mt-1 flex-wrap">
                    <span className="flex items-center gap-1 text-xs" style={{ color: MUTED }}>
                      <Users size={11} /> {n.target}
                    </span>
                    <span className="text-xs" style={{ color: MUTED }}>{n.channels.join(", ")}</span>
                    <span className="text-xs font-medium" style={{ color: "#16A34A" }}>{n.delivered}/{n.total} delivered</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
