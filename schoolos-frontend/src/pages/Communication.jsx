import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
import Sidebar from '../components/layout/Sidebar';
import DashboardNavbar from '../components/layout/DashboardNavbar';

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

const Communication = ({ onNavigate }) => {
  const [activeItem, setActiveItem] = useState('communication');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selected, setSelected] = useState(conversations[0]);
  const [message, setMessage] = useState("");
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("inbox");
  const [sending, setSending] = useState(false);

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

  return (
    <div className="min-h-screen bg-bg-primary text-text-primary font-body flex flex-col">
      <Sidebar 
        activeItem={activeItem} 
        onNavigate={(item) => {
          setActiveItem(item);
          onNavigate(item);
        }} 
        isOpen={sidebarOpen} 
        onClose={() => setSidebarOpen(false)} 
      />
      
      <DashboardNavbar 
        activeItem={activeItem} 
        onMenuClick={() => setSidebarOpen(true)} 
      />

      <main className="lg:ml-64 pt-16 h-screen flex flex-col">
        <div className="flex-1 p-6 sm:p-8 flex gap-6 overflow-hidden">
          {/* Contacts List */}
          <div
            className="w-80 flex-shrink-0 flex flex-col rounded-[32px] overflow-hidden border"
            style={{
              background: "white",
              borderColor: "rgba(56,25,50,0.07)",
              boxShadow: "0 4px 24px rgba(56,25,50,0.06)",
            }}
          >
            <div className="p-5 border-b" style={{ borderColor: "rgba(56,25,50,0.06)" }}>
              <h3 style={{ fontFamily: "'Playfair Display', serif", color: PLUM, fontWeight: 800, fontSize: "1.1rem", marginBottom: "1rem" }}>WhatsApp Inbox</h3>
              <div className="flex gap-2 mb-4">
                {["inbox", "broadcast"].map(t => (
                  <button
                    key={t}
                    onClick={() => setActiveTab(t)}
                    className="flex-1 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all"
                    style={{
                      background: activeTab === t ? PLUM : "rgba(56,25,50,0.05)",
                      color: activeTab === t ? MILK : MUTED,
                    }}
                  >
                    {t}
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-100">
                <Search size={14} color={MUTED} />
                <input
                  placeholder="Search parents..."
                  className="bg-transparent outline-none text-xs flex-1 font-medium"
                  style={{ color: PLUM }}
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
                  className="w-full p-4 text-left flex items-start gap-3 transition-colors hover:bg-bg-primary/50"
                  style={{
                    borderBottom: "1px solid rgba(56,25,50,0.03)",
                    background: selected?.id === conv.id ? "rgba(56,25,50,0.03)" : "transparent"
                  }}
                >
                  <div className="w-10 h-10 rounded-full flex items-center justify-center font-black text-xs" style={{ background: `${WHATSAPP}15`, color: WHATSAPP }}>
                    {conv.parent.substring(0, 2).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center mb-0.5">
                      <span className="text-xs font-black truncate" style={{ color: PLUM }}>{conv.parent}</span>
                      <span className="text-[9px] font-bold" style={{ color: MUTED }}>{conv.time}</span>
                    </div>
                    <p className="text-[10px] font-bold truncate mb-1" style={{ color: MUTED }}>{conv.student} · {conv.class}</p>
                    <p className="text-[11px] truncate font-medium" style={{ color: conv.unread > 0 ? PLUM : MUTED }}>{conv.lastMsg}</p>
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
                background: "white",
                borderColor: "rgba(56,25,50,0.07)",
                boxShadow: "0 4px 24px rgba(56,25,50,0.06)",
              }}
            >
              {/* Header */}
              <div className="px-6 py-4 border-b flex items-center justify-between" style={{ background: "rgba(37,211,102,0.03)", borderColor: "rgba(56,25,50,0.06)" }}>
                <div className="flex items-center gap-3">
                   <div className="w-10 h-10 rounded-full flex items-center justify-center font-black text-xs shadow-sm" style={{ background: MILK, color: PLUM }}>
                      {selected.parent.substring(0, 2).toUpperCase()}
                   </div>
                   <div>
                      <h4 style={{ color: PLUM, fontSize: "0.9rem", fontWeight: 800 }}>{selected.parent}</h4>
                      <div className="flex items-center gap-1.5">
                         <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                         <span style={{ color: WHATSAPP, fontSize: "0.7rem", fontWeight: 700 }}>WhatsApp Business</span>
                      </div>
                   </div>
                </div>
                <div className="flex gap-2">
                   <button className="w-9 h-9 rounded-xl flex items-center justify-center bg-white border border-slate-100 shadow-sm"><Phone size={14} color={PLUM} /></button>
                   <button className="w-9 h-9 rounded-xl flex items-center justify-center bg-white border border-slate-100 shadow-sm"><MoreHorizontal size={14} color={PLUM} /></button>
                </div>
              </div>

              {/* Messages Area */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4 no-scrollbar" style={{ background: "#FDFCFB" }}>
                {(messages[selected.id] || []).map((msg, i) => (
                  <div key={i} className={`flex ${msg.from === 'parent' ? 'justify-start' : 'justify-end'}`}>
                    <div
                      className="max-w-[75%] p-4 rounded-2xl shadow-sm"
                      style={{
                        background: msg.from === 'parent' ? "white" : (msg.from === 'system' ? "#F0FDF4" : PLUM),
                        color: msg.from === 'school' ? MILK : PLUM,
                        borderRadius: msg.from === 'parent' ? "0 20px 20px 20px" : "20px 0 20px 20px",
                        border: msg.from === 'system' ? `1px solid ${WHATSAPP}20` : "none"
                      }}
                    >
                      {msg.from === 'system' && <p className="text-[9px] font-black uppercase tracking-widest mb-1" style={{ color: WHATSAPP }}>Auto-Report</p>}
                      <p className="text-xs font-medium leading-relaxed whitespace-pre-line">{msg.text}</p>
                      <div className="flex items-center justify-end gap-1 mt-2">
                        <span className="text-[8px] font-bold opacity-60">{msg.time}</span>
                        {msg.from !== 'parent' && <CheckCheck size={10} className="opacity-60" />}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Input Area */}
              <div className="p-6 border-t" style={{ borderColor: "rgba(56,25,50,0.06)" }}>
                 <div className="flex gap-2 mb-4">
                    {templates.map(t => (
                      <button key={t.id} className="px-3 py-1.5 rounded-lg border flex items-center gap-2 text-[9px] font-black uppercase tracking-widest hover:bg-slate-50 transition-colors" style={{ borderColor: `${t.color}20`, color: t.color }}>
                        <t.icon size={12} /> {t.label}
                      </button>
                    ))}
                 </div>
                 <div className="flex items-end gap-3 bg-slate-50 border border-slate-100 rounded-[24px] p-2 pr-2">
                    <textarea
                      placeholder="Type a message..."
                      className="flex-1 bg-transparent border-none outline-none p-3 text-xs font-medium resize-none max-h-32"
                      rows={1}
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                    />
                    <button
                      onClick={handleSend}
                      disabled={!message.trim() || sending}
                      className="w-10 h-10 rounded-full flex items-center justify-center transition-all active:scale-90"
                      style={{
                        background: message.trim() ? WHATSAPP : "rgba(56,25,50,0.1)",
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
            <div className="flex-1 flex flex-col items-center justify-center border-2 border-dashed rounded-[32px]" style={{ borderColor: "rgba(56,25,50,0.08)" }}>
               <div className="w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center mb-4"><MessageSquare size={24} color={MUTED} /></div>
               <p style={{ color: PLUM, fontWeight: 700, fontSize: "0.9rem" }}>Select a conversation to start messaging</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Communication;
