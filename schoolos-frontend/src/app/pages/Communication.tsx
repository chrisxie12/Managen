import { useState } from "react";
import {
  MessageSquare,
  Send,
  Phone,
  CheckCheck,
  Check,
  Clock,
  Plus,
  Search,
  Users,
  Bell,
  FileText,
  Smile,
  MoreHorizontal,
  X,
} from "lucide-react";

const PLUM = "#381932";
const PLUM_LIGHT = "#512b4a";
const MILK = "#FFF3E6";
const MUTED = "#7D6077";
const WHATSAPP = "#25D366";

const conversations = [
  {
    id: 1,
    parent: "Mr. & Mrs. Owusu",
    student: "Ama Owusu",
    class: "JHS 3A",
    phone: "+233 24 000 1234",
    lastMsg: "Thank you for the report card! We are very proud of Ama.",
    time: "10:32 AM",
    unread: 0,
    status: "delivered",
    type: "incoming",
  },
  {
    id: 2,
    parent: "Mr. Boateng Sr.",
    student: "Kwesi Boateng",
    class: "JHS 2B",
    phone: "+233 20 111 5678",
    lastMsg: "Terminal report sent successfully ✓",
    time: "9:15 AM",
    unread: 0,
    status: "read",
    type: "outgoing",
  },
  {
    id: 3,
    parent: "Mrs. Mensah",
    student: "Efua Mensah",
    class: "JHS 3A",
    phone: "+233 55 222 9012",
    lastMsg: "Please note the outstanding balance of GHS 825",
    time: "Yesterday",
    unread: 2,
    status: "unread",
    type: "incoming",
  },
  {
    id: 4,
    parent: "Mr. Darko",
    student: "Yaw Darko",
    class: "JHS 1C",
    phone: "+233 24 333 3456",
    lastMsg: "Fee reminder: Your ward's fees are 30+ days overdue.",
    time: "Yesterday",
    unread: 0,
    status: "sent",
    type: "outgoing",
  },
  {
    id: 5,
    parent: "Mrs. Asante",
    student: "Abena Asante",
    class: "JHS 2A",
    phone: "+233 20 444 7890",
    lastMsg: "Hi, when can we come in to discuss attendance issues?",
    time: "Mon",
    unread: 1,
    status: "unread",
    type: "incoming",
  },
];

const messages: Record<number, Array<{ from: string; text: string; time: string; status?: string }>> = {
  1: [
    { from: "system", text: "📄 Terminal Report Card — Term 2, 2025/2026\nStudent: Ama Owusu (GH-2024-001)\nClass: JHS 3A | Position: 1st\nAverage: 95.5% — Grade A1\n\nSubjects:\n• Mathematics: 97\n• English: 95\n• Science: 94\n• Social Studies: 98\n• ICT: 96\n• French: 93\n\nRemarks: Outstanding performance!", time: "9:00 AM", status: "read" },
    { from: "parent", text: "Thank you for the report card! We are very proud of Ama.", time: "10:32 AM" },
    { from: "school", text: "We are equally proud! Ama has been an exceptional student this term. 🌟", time: "10:35 AM", status: "read" },
  ],
  3: [
    { from: "school", text: "Dear Mrs. Mensah,\n\nThis is a reminder that Efua's school fees for Term 2 have a balance of GHS 825 outstanding.\n\nKindly make payment at your earliest convenience.\n\nRegards,\nAccra Ridge School", time: "Yesterday 2:00 PM", status: "read" },
    { from: "parent", text: "Please note the outstanding balance of GHS 825", time: "Yesterday 3:45 PM" },
    { from: "parent", text: "We will come in on Thursday to pay. Sorry for the delay.", time: "Yesterday 3:47 PM" },
  ],
  2: [
    { from: "school", text: "📄 Terminal Report sent to Mr. Boateng Sr. for Kwesi Boateng (JHS 2B). Average: 92.3%", time: "9:15 AM", status: "read" },
  ],
  4: [
    { from: "school", text: "Dear Mr. Darko,\n\nWe wish to bring to your attention that Yaw Darko's school fees for Term 2 (GHS 1,500) remain unpaid as of today. The deadline was February 1st, 2026 — now 30+ days overdue.\n\nPlease contact the accounts office immediately.\n\nThank you.", time: "Yesterday 10:00 AM", status: "sent" },
  ],
  5: [
    { from: "parent", text: "Hi, when can we come in to discuss attendance issues?", time: "Mon 4:12 PM" },
  ],
};

const templates = [
  {
    id: "report",
    icon: FileText,
    label: "Terminal Report",
    desc: "Send student's full report card",
    color: "#6366F1",
  },
  {
    id: "fee",
    icon: Bell,
    label: "Fee Reminder",
    desc: "Notify parents of outstanding fees",
    color: "#F59E0B",
  },
  {
    id: "attend",
    icon: Users,
    label: "Attendance Alert",
    desc: "Alert parent of poor attendance",
    color: "#EF4444",
  },
  {
    id: "event",
    icon: Clock,
    label: "Event Notice",
    desc: "Announce school events or closures",
    color: "#10B981",
  },
];

const broadcastHistory = [
  { label: "Term 2 Reports Sent", count: "248 parents", time: "Today 9:00 AM", status: "success" },
  { label: "Fee Reminder Batch", count: "34 parents", time: "Mar 28", status: "success" },
  { label: "School Closure Notice", count: "All parents", time: "Mar 22", status: "success" },
  { label: "Mid-term Exam Schedule", count: "All parents", time: "Mar 15", status: "success" },
];

export function Communication() {
  const [selected, setSelected] = useState<typeof conversations[0] | null>(
    conversations[0]
  );
  const [message, setMessage] = useState("");
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState<"inbox" | "broadcast">("inbox");
  const [sending, setSending] = useState(false);
  const [showBroadcast, setShowBroadcast] = useState(false);
  const [broadcastMsg, setBroadcastMsg] = useState("");
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);

  const filtered = conversations.filter(
    (c) =>
      c.parent.toLowerCase().includes(search.toLowerCase()) ||
      c.student.toLowerCase().includes(search.toLowerCase())
  );

  const handleSend = () => {
    if (!message.trim()) return;
    setSending(true);
    setTimeout(() => {
      setSending(false);
      setMessage("");
    }, 800);
  };

  const handleBroadcast = () => {
    setSending(true);
    setTimeout(() => {
      setSending(false);
      setShowBroadcast(false);
      setBroadcastMsg("");
      setSelectedTemplate(null);
    }, 1500);
  };

  const totalUnread = conversations.reduce((acc, c) => acc + c.unread, 0);

  return (
    <div
      className="flex gap-5 h-[calc(100vh-140px)]"
      style={{ fontFamily: "'DM Sans', sans-serif" }}
    >
      {/* ── Left: Contact List ── */}
      <div
        className="w-80 flex-shrink-0 flex flex-col rounded-[24px] overflow-hidden"
        style={{
          background: "white",
          border: `1px solid rgba(56,25,50,0.07)`,
          boxShadow: "0 4px 24px rgba(56,25,50,0.06)",
        }}
      >
        {/* Header */}
        <div className="p-4" style={{ borderBottom: `1px solid rgba(56,25,50,0.06)` }}>
          <div className="flex items-center justify-between mb-3">
            <h3
              style={{
                fontFamily: "'Playfair Display', serif",
                color: PLUM,
                fontWeight: 700,
                fontSize: "1rem",
              }}
            >
              WhatsApp Inbox
              {totalUnread > 0 && (
                <span
                  className="ml-2 px-2 py-0.5 rounded-full text-xs"
                  style={{ background: WHATSAPP, color: "white", fontSize: "0.7rem" }}
                >
                  {totalUnread}
                </span>
              )}
            </h3>
            <button
              onClick={() => setShowBroadcast(true)}
              className="flex items-center gap-1 px-3 py-1.5 rounded-full text-xs active:scale-95 transition-transform"
              style={{
                background: `linear-gradient(135deg, ${PLUM}, ${PLUM_LIGHT})`,
                color: MILK,
                fontWeight: 600,
              }}
            >
              <Plus size={11} /> Broadcast
            </button>
          </div>

          {/* Tab */}
          <div className="flex gap-1 mb-3">
            {(["inbox", "broadcast"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setActiveTab(t)}
                className="flex-1 py-1.5 rounded-lg text-xs capitalize transition-colors"
                style={{
                  background: activeTab === t ? `rgba(56,25,50,0.07)` : "transparent",
                  color: activeTab === t ? PLUM : MUTED,
                  fontWeight: activeTab === t ? 600 : 400,
                }}
              >
                {t}
              </button>
            ))}
          </div>

          {/* Search */}
          <div
            className="flex items-center gap-2 px-3 py-2 rounded-xl"
            style={{ background: "#F5F5F5" }}
          >
            <Search size={12} color={MUTED} />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search parent or student..."
              className="bg-transparent outline-none text-xs flex-1"
              style={{ color: PLUM }}
            />
          </div>
        </div>

        {/* Conversations or Broadcast History */}
        <div className="flex-1 overflow-y-auto">
          {activeTab === "inbox" ? (
            filtered.map((conv) => (
              <button
                key={conv.id}
                onClick={() => setSelected(conv)}
                className="w-full px-4 py-3 text-left flex items-start gap-3 transition-colors hover:bg-[#FFF3E6]/60"
                style={{
                  borderBottom: `1px solid rgba(56,25,50,0.04)`,
                  background:
                    selected?.id === conv.id ? `rgba(56,25,50,0.04)` : "transparent",
                }}
              >
                {/* Avatar */}
                <div className="relative flex-shrink-0">
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center"
                    style={{
                      background: `linear-gradient(135deg, ${WHATSAPP}25, ${WHATSAPP}40)`,
                      color: WHATSAPP,
                      fontSize: "0.8rem",
                      fontWeight: 700,
                    }}
                  >
                    {conv.parent
                      .split(" ")
                      .filter((n) => !["Mr.", "Mrs.", "&"].includes(n))
                      .map((n) => n[0])
                      .join("")
                      .slice(0, 2)}
                  </div>
                  {conv.unread > 0 && (
                    <span
                      className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full flex items-center justify-center text-xs"
                      style={{ background: WHATSAPP, color: "white", fontSize: "0.6rem" }}
                    >
                      {conv.unread}
                    </span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between">
                    <span
                      style={{
                        color: PLUM,
                        fontSize: "0.83rem",
                        fontWeight: conv.unread > 0 ? 700 : 500,
                      }}
                      className="truncate"
                    >
                      {conv.parent}
                    </span>
                    <span style={{ color: MUTED, fontSize: "0.68rem", flexShrink: 0, marginLeft: "0.5rem" }}>
                      {conv.time}
                    </span>
                  </div>
                  <span style={{ color: MUTED, fontSize: "0.7rem", display: "block" }}>
                    {conv.student} · {conv.class}
                  </span>
                  <p
                    className="truncate mt-0.5"
                    style={{
                      color: conv.unread > 0 ? PLUM_LIGHT : MUTED,
                      fontSize: "0.75rem",
                      fontWeight: conv.unread > 0 ? 600 : 400,
                    }}
                  >
                    {conv.lastMsg}
                  </p>
                </div>
              </button>
            ))
          ) : (
            <div className="p-4 space-y-3">
              <p style={{ color: MUTED, fontSize: "0.78rem" }}>Recent broadcasts</p>
              {broadcastHistory.map((b, i) => (
                <div
                  key={i}
                  className="p-3 rounded-xl"
                  style={{ background: "#F9F9F9", border: `1px solid rgba(56,25,50,0.05)` }}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                    <span style={{ color: PLUM, fontSize: "0.82rem", fontWeight: 500 }}>
                      {b.label}
                    </span>
                  </div>
                  <p style={{ color: MUTED, fontSize: "0.73rem" }}>{b.count} · {b.time}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Right: Chat Window ── */}
      {selected ? (
        <div
          className="flex-1 flex flex-col rounded-[24px] overflow-hidden"
          style={{
            background: "white",
            border: `1px solid rgba(56,25,50,0.07)`,
            boxShadow: "0 4px 24px rgba(56,25,50,0.06)",
          }}
        >
          {/* Chat header */}
          <div
            className="px-6 py-4 flex items-center justify-between"
            style={{
              borderBottom: `1px solid rgba(56,25,50,0.06)`,
              background: `rgba(37,211,102,0.04)`,
            }}
          >
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center"
                style={{
                  background: `linear-gradient(135deg, ${WHATSAPP}25, ${WHATSAPP}40)`,
                  color: WHATSAPP,
                  fontSize: "0.8rem",
                  fontWeight: 700,
                }}
              >
                {selected.parent
                  .split(" ")
                  .filter((n) => !["Mr.", "Mrs.", "&"].includes(n))
                  .map((n) => n[0])
                  .join("")
                  .slice(0, 2)}
              </div>
              <div>
                <p style={{ color: PLUM, fontSize: "0.9rem", fontWeight: 600 }}>
                  {selected.parent}
                </p>
                <div className="flex items-center gap-1.5">
                  <Phone size={10} color={WHATSAPP} />
                  <span
                    style={{
                      color: MUTED,
                      fontSize: "0.72rem",
                      fontFamily: "'JetBrains Mono', monospace",
                    }}
                  >
                    {selected.phone}
                  </span>
                  <span style={{ color: MUTED, fontSize: "0.72rem" }}>·</span>
                  <span style={{ color: MUTED, fontSize: "0.72rem" }}>
                    {selected.student} ({selected.class})
                  </span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div
                className="flex items-center gap-1.5 px-3 py-1 rounded-full"
                style={{ background: `${WHATSAPP}15`, border: `1px solid ${WHATSAPP}30` }}
              >
                <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                <span style={{ color: WHATSAPP, fontSize: "0.72rem", fontWeight: 600 }}>
                  WhatsApp
                </span>
              </div>
              <button className="w-8 h-8 rounded-xl flex items-center justify-center hover:opacity-70" style={{ background: `rgba(56,25,50,0.06)` }}>
                <MoreHorizontal size={14} color={MUTED} />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div
            className="flex-1 overflow-y-auto p-5 space-y-4"
            style={{ background: "#F0F2F5" }}
          >
            {(messages[selected.id] || []).map((msg, i) => (
              <div
                key={i}
                className={`flex ${msg.from === "parent" ? "justify-start" : "justify-end"}`}
              >
                <div
                  className="max-w-[70%] px-4 py-3 rounded-2xl"
                  style={{
                    background:
                      msg.from === "system"
                        ? "#E8F5E9"
                        : msg.from === "school"
                        ? "white"
                        : "#DCF8C6",
                    boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
                    borderRadius:
                      msg.from === "parent"
                        ? "0 18px 18px 18px"
                        : "18px 0 18px 18px",
                    border: msg.from === "system" ? `1px solid ${WHATSAPP}30` : "none",
                  }}
                >
                  {msg.from === "system" && (
                    <div
                      className="flex items-center gap-1 mb-2"
                      style={{ color: WHATSAPP, fontSize: "0.72rem", fontWeight: 600 }}
                    >
                      <FileText size={11} /> SchoolOS Report
                    </div>
                  )}
                  <p
                    style={{
                      color: PLUM,
                      lineHeight: 1.6,
                      whiteSpace: "pre-line",
                      fontFamily:
                        msg.from === "system" ? "'JetBrains Mono', monospace" : "inherit",
                      fontSize: msg.from === "system" ? "0.78rem" : "0.85rem",
                    }}
                  >
                    {msg.text}
                  </p>
                  <div
                    className="flex items-center justify-end gap-1 mt-1"
                    style={{ color: MUTED, fontSize: "0.65rem" }}
                  >
                    {msg.time}
                    {msg.status && (
                      msg.status === "read" ? (
                        <CheckCheck size={11} color={WHATSAPP} />
                      ) : msg.status === "sent" ? (
                        <Check size={11} color={MUTED} />
                      ) : null
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Message input */}
          <div
            className="p-4"
            style={{ borderTop: `1px solid rgba(56,25,50,0.06)` }}
          >
            {/* Template buttons */}
            <div className="flex gap-2 mb-3 flex-wrap">
              {templates.slice(0, 3).map((t) => (
                <button
                  key={t.id}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs active:scale-95 transition-transform"
                  style={{
                    background: `${t.color}12`,
                    color: t.color,
                    border: `1px solid ${t.color}25`,
                    fontWeight: 500,
                  }}
                  onClick={() => setMessage(`[${t.label}] `)}
                >
                  <t.icon size={11} />
                  {t.label}
                </button>
              ))}
            </div>

            <div
              className="flex items-end gap-3 p-3 rounded-2xl"
              style={{
                background: "#F5F5F5",
                border: `1.5px solid rgba(56,25,50,0.08)`,
              }}
            >
              <button className="mb-1">
                <Smile size={18} color={MUTED} />
              </button>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Type a message..."
                rows={2}
                className="flex-1 bg-transparent outline-none resize-none text-sm"
                style={{ color: PLUM, lineHeight: 1.5 }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
              />
              <button
                onClick={handleSend}
                disabled={!message.trim() || sending}
                className="w-9 h-9 rounded-full flex items-center justify-center mb-0.5 active:scale-95 transition-transform flex-shrink-0"
                style={{
                  background: message.trim()
                    ? `linear-gradient(135deg, ${WHATSAPP}, #128C7E)`
                    : "rgba(56,25,50,0.1)",
                  boxShadow: message.trim()
                    ? "0 4px 12px rgba(37,211,102,0.35)"
                    : "none",
                }}
              >
                <Send size={15} color={message.trim() ? "white" : MUTED} />
              </button>
            </div>
            <p style={{ color: MUTED, fontSize: "0.68rem", textAlign: "center", marginTop: "0.5rem" }}>
              Messages sent via WhatsApp Business API
            </p>
          </div>
        </div>
      ) : (
        <div
          className="flex-1 flex flex-col items-center justify-center rounded-[24px]"
          style={{
            background: "white",
            border: `1.5px dashed rgba(56,25,50,0.12)`,
          }}
        >
          <MessageSquare size={36} color={MUTED} className="mb-4" />
          <p style={{ color: PLUM, fontWeight: 600 }}>Select a conversation</p>
        </div>
      )}

      {/* ── Broadcast Modal ── */}
      {showBroadcast && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setShowBroadcast(false)}
          />
          <div
            className="relative w-full max-w-lg rounded-[24px] p-8"
            style={{
              background: "white",
              boxShadow: "0 24px 80px rgba(56,25,50,0.3)",
            }}
          >
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3
                  style={{
                    fontFamily: "'Playfair Display', serif",
                    color: PLUM,
                    fontWeight: 700,
                    fontSize: "1.2rem",
                  }}
                >
                  Broadcast Message
                </h3>
                <p style={{ color: MUTED, fontSize: "0.8rem" }}>
                  Send to multiple parents at once
                </p>
              </div>
              <button onClick={() => setShowBroadcast(false)}>
                <X size={18} color={MUTED} />
              </button>
            </div>

            {/* Template selector */}
            <div className="mb-5">
              <p
                style={{
                  color: PLUM_LIGHT,
                  fontSize: "0.82rem",
                  fontWeight: 500,
                  marginBottom: "0.7rem",
                }}
              >
                Message Template
              </p>
              <div className="grid grid-cols-2 gap-2">
                {templates.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setSelectedTemplate(t.id)}
                    className="p-3 rounded-2xl text-left transition-all active:scale-95"
                    style={{
                      background:
                        selectedTemplate === t.id ? `${t.color}12` : "#F9F9F9",
                      border: `1.5px solid ${selectedTemplate === t.id ? t.color : "transparent"}`,
                    }}
                  >
                    <t.icon size={14} color={t.color} className="mb-1" />
                    <p style={{ color: PLUM, fontSize: "0.82rem", fontWeight: 500 }}>
                      {t.label}
                    </p>
                    <p style={{ color: MUTED, fontSize: "0.72rem" }}>{t.desc}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Recipients */}
            <div className="mb-4">
              <label
                style={{
                  color: PLUM_LIGHT,
                  fontSize: "0.82rem",
                  fontWeight: 500,
                  display: "block",
                  marginBottom: "0.4rem",
                }}
              >
                Send To
              </label>
              <select
                className="w-full px-4 py-3 rounded-2xl outline-none text-sm"
                style={{
                  background: "#FAFAFA",
                  border: `1.5px solid rgba(56,25,50,0.10)`,
                  color: PLUM,
                }}
              >
                <option>All Parents (248)</option>
                <option>JHS 3A Parents (32)</option>
                <option>JHS 3B Parents (30)</option>
                <option>Overdue Fee Parents (34)</option>
                <option>Low Attendance Parents (18)</option>
              </select>
            </div>

            <div className="mb-5">
              <label
                style={{
                  color: PLUM_LIGHT,
                  fontSize: "0.82rem",
                  fontWeight: 500,
                  display: "block",
                  marginBottom: "0.4rem",
                }}
              >
                Custom Message (optional)
              </label>
              <textarea
                value={broadcastMsg}
                onChange={(e) => setBroadcastMsg(e.target.value)}
                placeholder="Add a custom note to include with the message..."
                rows={3}
                className="w-full px-4 py-3 rounded-2xl outline-none text-sm resize-none"
                style={{
                  background: "#FAFAFA",
                  border: `1.5px solid rgba(56,25,50,0.10)`,
                  color: PLUM,
                }}
              />
            </div>

            <button
              onClick={handleBroadcast}
              disabled={sending}
              className="w-full py-3.5 rounded-full flex items-center justify-center gap-2 active:scale-95 transition-transform"
              style={{
                background: sending
                  ? "#D1FAE5"
                  : `linear-gradient(135deg, ${WHATSAPP}, #128C7E)`,
                color: sending ? "#065F46" : "white",
                fontWeight: 600,
                boxShadow: sending ? "none" : "0 8px 24px rgba(37,211,102,0.3)",
              }}
            >
              {sending ? (
                <>
                  <CheckCheck size={16} /> Sending...
                </>
              ) : (
                <>
                  <Send size={16} /> Send via WhatsApp
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
