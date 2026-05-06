import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  MessageSquare,
  Send,
  Phone,
  CheckCheck,
  Plus,
  Search,
  Users,
  Bell,
  FileText,
  MoreHorizontal
} from "lucide-react";
import { useTheme } from '../contexts/ThemeContext';
import { useToast } from '../contexts/ToastContext';
import { useAuth } from '../contexts/AuthContext';
import { buildUrl, getHeaders, handleApiError } from '../services/api';

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
];

const messages = {
  1: [
    { from: "system", text: "📄 Terminal Report Card — Term 2, 2025/2026\nStudent: Ama Owusu (GH-2024-001)\nClass: JHS 3A | Position: 1st\nAverage: 95.5% — Grade A1", time: "9:00 AM", status: "read" },
    { from: "parent", text: "Thank you for the report card! We are very proud of Ama.", time: "10:32 AM" },
    { from: "school", text: "We are equally proud! Ama has been an exceptional student this term. 🌟", time: "10:35 AM", status: "read" },
  ],
  3: [
    { from: "school", text: "Dear Mrs. Mensah,\n\nThis is a reminder that Efua's school fees for Term 2 have a balance of GHS 825 outstanding.", time: "Yesterday 2:00 PM", status: "read" },
    { from: "parent", text: "Please note the outstanding balance of GHS 825", time: "Yesterday 3:45 PM" },
  ],
};

const templates = [
  { id: "report", icon: FileText, label: "Terminal Report", color: "#6366F1" },
  { id: "fee", icon: Bell, label: "Fee Reminder", color: "#F59E0B" },
  { id: "attend", icon: Users, label: "Attendance Alert", color: "#EF4444" },
];

const WHATSAPP = "#25D366";

const Communication = () => {
  const { isDarkMode } = useTheme();
  const { showToast } = useToast();
  const { authSession } = useAuth();

  const [selected, setSelected] = useState(conversations[0]);
  const [message, setMessage] = useState("");
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("inbox");
  const [sending, setSending] = useState(false);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const res = await fetch(buildUrl('/api/school/notifications'), {
        headers: getHeaders(authSession?.token),
        credentials: 'include'
      });
      const json = await res.json();
      if (res.ok) {
        setLogs(json.data.notifications || []);
      }
    } catch (e) {}
    finally { setLoading(false); }
  };

  React.useEffect(() => {
    fetchLogs();
  }, []);

  const handleSend = async () => {
    if (!message.trim()) return;
    setSending(true);
    try {
      const res = await fetch(buildUrl('/api/school/notifications'), {
        method: 'POST',
        headers: getHeaders(authSession?.token),
        body: JSON.stringify({
          type: 'WhatsApp',
          recipient: selected.phone,
          message: message,
          status: 'Delivered'
        }),
        credentials: 'include'
      });

      if (res.ok) {
        setMessage("");
        fetchLogs();
        showToast({
          title: 'Delivered',
          message: 'Message dispatched through WhatsApp API.',
          type: 'success'
        });
      } else {
        const error = await handleApiError(res);
        throw new Error(error);
      }
    } catch (err) {
      showToast({ title: 'Dispatch Error', message: err.message, type: 'error' });
    } finally {
      setSending(false);
    }
  };

  const filtered = conversations.filter(
    (c) =>
      c.parent.toLowerCase().includes(search.toLowerCase()) ||
      c.student.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="px-8 pt-8">
         <h1 style={{ fontFamily: "'Playfair Display', serif", color: "var(--text-primary)", fontSize: "1.8rem", fontWeight: 800 }}>Unified Messaging</h1>
         <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", fontWeight: 600 }}>Institutional WhatsApp communication and broadcast node</p>
      </div>
      <div className="flex-1 p-6 sm:p-8 flex gap-6 overflow-hidden min-h-0">
        {/* Contacts List */}
        <div
          className="w-80 flex-shrink-0 flex flex-col rounded-[32px] overflow-hidden border"
          style={{
            background: "var(--card-bg)",
            borderColor: "var(--border)",
            boxShadow: "var(--shadow-card)",
          }}
        >
          <div className="p-5 border-b" style={{ borderColor: "var(--border)" }}>
            <h2 style={{ fontFamily: "'Playfair Display', serif", color: "var(--text-primary)", fontWeight: 800, fontSize: "1.1rem", marginBottom: "1rem" }}>WhatsApp Inbox</h2>
            <div className="flex gap-2 mb-4">
              {["inbox", "broadcast"].map(t => (
                <button
                  key={t}
                  onClick={() => setActiveTab(t)}
                  className="flex-1 py-1.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all"
                  style={{
                    background: activeTab === t ? "var(--accent-primary)" : "var(--bg-secondary)",
                    color: activeTab === t ? "var(--bg-primary)" : "var(--text-muted)",
                  }}
                >
                  {t}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl border group" style={{ background: "var(--bg-secondary)", borderColor: "var(--border)" }}>
              <Search size={14} style={{ color: "var(--text-muted)" }} className="group-focus-within:scale-110 transition-transform" />
              <input
                placeholder="Search parents..."
                className="bg-transparent outline-none text-xs flex-1 font-medium"
                style={{ color: "var(--text-primary)" }}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto no-scrollbar">
            {filtered.map((conv) => (
              <button
                key={conv.id}
                onClick={() => setSelected(conv)}
                className="w-full p-4 text-left flex items-start gap-3 transition-colors hover:bg-black/[0.02]"
                style={{
                  borderBottom: `1px solid var(--border)`,
                  background: selected?.id === conv.id ? "var(--bg-secondary)" : "transparent"
                }}
              >
                <div className="w-10 h-10 rounded-full flex items-center justify-center font-black text-xs" style={{ background: `${WHATSAPP}15`, color: WHATSAPP }}>
                  {conv.parent.substring(0, 2).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-center mb-0.5">
                    <span className="text-xs font-black truncate" style={{ color: "var(--text-primary)" }}>{conv.parent}</span>
                    <span className="text-xs font-bold" style={{ color: "var(--text-muted)" }}>{conv.time}</span>
                  </div>
                  <p className="text-xs font-bold truncate mb-1" style={{ color: "var(--text-muted)" }}>{conv.student} · {conv.class}</p>
                  <p className="text-xs truncate font-medium" style={{ color: conv.unread > 0 ? "var(--text-primary)" : "var(--text-muted)" }}>{conv.lastMsg}</p>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Chat Window */}
        {selected ? (
          <div
            className="flex-1 flex flex-col rounded-[32px] overflow-hidden border"
            style={{
              background: "var(--card-bg)",
              borderColor: "var(--border)",
              boxShadow: "var(--shadow-card)",
            }}
          >
            {/* Header */}
            <div className="px-6 py-4 border-b flex items-center justify-between" style={{ background: isDarkMode ? "var(--bg-secondary)" : "rgba(37,211,102,0.03)", borderColor: "var(--border)" }}>
              <div className="flex items-center gap-3">
                 <div className="w-10 h-10 rounded-full flex items-center justify-center font-black text-xs shadow-sm bg-plum text-milk">
                    {selected.parent.substring(0, 2).toUpperCase()}
                 </div>
                 <div>
                    <h4 style={{ color: "var(--text-primary)", fontSize: "0.9rem", fontWeight: 800 }}>{selected.parent}</h4>
                    <div className="flex items-center gap-1.5">
                       <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                       <span style={{ color: WHATSAPP, fontSize: "0.7rem", fontWeight: 700 }}>WhatsApp Business</span>
                    </div>
                 </div>
              </div>
              <div className="flex gap-2">
                 <button 
                   onClick={() => {
                     showToast({
                       title: 'Initiating Call',
                       message: `Connecting to ${selected.phone}...`,
                       type: 'info'
                     });
                   }}
                   className="w-9 h-9 rounded-xl flex items-center justify-center border transition-colors shadow-sm" 
                   style={{ background: "var(--card-bg)", borderColor: "var(--border)" }}
                 >
                   <Phone size={14} style={{ color: "var(--text-primary)" }} />
                 </button>
                 <button 
                   onClick={() => {
                     showToast({
                       title: 'Channel Settings',
                       message: 'Opening advanced communication parameters.',
                       type: 'info'
                     });
                   }}
                   className="w-9 h-9 rounded-xl flex items-center justify-center border transition-colors shadow-sm" 
                   style={{ background: "var(--card-bg)", borderColor: "var(--border)" }}
                 >
                   <MoreHorizontal size={14} style={{ color: "var(--text-primary)" }} />
                 </button>
              </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4 no-scrollbar" style={{ background: "var(--bg-secondary)" }}>
              {(messages[selected.id] || []).map((msg, i) => (
                <div key={i} className={`flex ${msg.from === 'parent' ? 'justify-start' : 'justify-end'}`}>
                  <div
                    className="max-w-[75%] p-4 rounded-2xl shadow-sm"
                    style={{
                      background: msg.from === 'parent' ? "var(--card-bg)" : (msg.from === 'system' ? (isDarkMode ? "rgba(37,211,102,0.1)" : "#F0FDF4") : "var(--accent-primary)"),
                      color: msg.from === 'school' ? "var(--bg-primary)" : "var(--text-primary)",
                      borderRadius: msg.from === 'parent' ? "0 20px 20px 20px" : "20px 0 20px 20px",
                      border: msg.from === 'system' ? `1px solid ${WHATSAPP}40` : (msg.from === 'parent' ? `1px solid var(--border)` : "none")
                    }}
                  >
                    {msg.from === 'system' && <p className="text-xs font-black uppercase tracking-widest mb-1" style={{ color: WHATSAPP }}>Auto-Report</p>}
                    <p className="text-xs font-medium leading-relaxed whitespace-pre-line">{msg.text}</p>
                    <div className="flex items-center justify-end gap-1 mt-2">
                      <span className="text-xs font-bold opacity-90" style={{ color: "var(--text-muted)" }}>{msg.time}</span>
                      {msg.from !== 'parent' && <CheckCheck size={10} style={{ color: "var(--text-muted)" }} className="opacity-90" />}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Input Area */}
            <div className="p-6 border-t" style={{ borderColor: "var(--border)" }}>
               <div className="flex gap-2 mb-4">
                  {templates.map(t => (
                     <button 
                      key={t.id} 
                      onClick={() => {
                        let tpl = "";
                        if (t.id === 'report') tpl = `Terminal Report Card for ${selected.student}...`;
                        if (t.id === 'fee') tpl = `Dear ${selected.parent}, this is a reminder regarding...`;
                        if (t.id === 'attend') tpl = `${selected.student} was marked absent today...`;
                        setMessage(tpl);
                        showToast({
                          title: 'Template Loaded',
                          message: `${t.label} draft is ready for dispatch.`,
                          type: 'info'
                        });
                      }}
                      className="px-3 py-1.5 rounded-lg border flex items-center gap-2 text-xs font-black uppercase tracking-widest transition-colors hover:bg-black/5" 
                      style={{ borderColor: `${t.color}40`, color: t.color }}
                    >
                      <t.icon size={12} /> {t.label}
                    </button>
                  ))}
               </div>
               <div className="flex items-end gap-3 border rounded-[24px] p-2 pr-2 shadow-sm" style={{ background: "var(--bg-secondary)", borderColor: "var(--border)" }}>
                  <textarea
                    placeholder="Type a message..."
                    className="flex-1 bg-transparent border-none outline-none p-3 text-xs font-medium resize-none max-h-32"
                    rows={1}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    style={{ color: "var(--text-primary)" }}
                  />
                  <button
                    onClick={handleSend}
                    disabled={!message.trim() || sending}
                    className="w-10 h-10 rounded-full flex items-center justify-center transition-all active:scale-90"
                    style={{
                      background: message.trim() ? WHATSAPP : "var(--border)",
                      color: "white",
                      boxShadow: message.trim() ? `0 4px 12px ${WHATSAPP}40` : "none"
                    }}
                  >
                    <Send size={16} />
                  </button>
               </div>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center border-2 border-dashed rounded-[32px]" style={{ borderColor: "var(--border)" }}>
             <div className="w-16 h-16 rounded-full flex items-center justify-center mb-4" style={{ background: "var(--bg-secondary)" }}><MessageSquare size={24} style={{ color: "var(--text-muted)" }} /></div>
             <p style={{ color: "var(--text-primary)", fontWeight: 700, fontSize: "0.9rem" }}>Select a conversation to start messaging</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Communication;
