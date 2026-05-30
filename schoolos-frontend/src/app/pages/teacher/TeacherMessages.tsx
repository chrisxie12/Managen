import { useState } from "react";
import { Send, ChevronLeft } from "lucide-react";

const NAVY = "#031B4E";
const MUTED = "#6B7280";

interface Message { id: string; sender: "teacher" | "parent"; text: string; time: string; }
interface Conversation {
  id: string; parentName: string; studentName: string; studentClass: string;
  unread: number; lastMessage: string; lastTime: string;
  messages: Message[];
}

const mockConversations: Conversation[] = [];

export function TeacherMessages() {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [reply, setReply] = useState("");
  const [showList, setShowList] = useState(true);

  const activeConv = mockConversations.find(c => c.id === activeId);

  const handleSelectConv = (id: string) => {
    setActiveId(id);
    setShowList(false);
  };

  const handleBack = () => {
    setShowList(true);
    setActiveId(null);
  };

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reply.trim()) return;
    setReply("");
  };

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold" style={{ color: NAVY }}>Parent Messages</h1>
        <p className="text-sm mt-1" style={{ color: MUTED }}>
          {mockConversations.reduce((a, c) => a + c.unread, 0) || "No"} unread messages
        </p>
      </div>

      <div className="flex gap-0 bg-card border border-border rounded-2xl overflow-hidden" style={{ minHeight: 480 }}>
        {/* Conversation list */}
        <div className={`${showList ? "flex" : "hidden"} md:flex flex-col border-r border-border w-full md:w-72 flex-shrink-0`}>
          {mockConversations.length === 0 && (
            <div className="flex-1 flex items-center justify-center p-6 text-center">
              <p className="text-sm" style={{ color: MUTED }}>No conversations yet.</p>
            </div>
          )}
          {mockConversations.map(c => (
            <button key={c.id} onClick={() => handleSelectConv(c.id)}
              className="flex items-start gap-3 px-4 py-3.5 border-b border-border last:border-0 text-left transition-colors hover:bg-muted/30"
              style={{ background: activeId === c.id ? "var(--muted)/20" : undefined }}>
              <div className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                style={{ background: "#DBEAFE", color: "#0080FF" }}>
                {c.parentName.split(" ").slice(-1)[0][0]}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-1">
                  <p className="text-sm font-semibold truncate" style={{ color: NAVY }}>{c.parentName}</p>
                  <span className="text-[10px] flex-shrink-0" style={{ color: MUTED }}>{c.lastTime}</span>
                </div>
                <p className="text-xs truncate" style={{ color: MUTED }}>{c.studentName} · {c.studentClass}</p>
                <p className="text-xs truncate mt-0.5" style={{ color: MUTED }}>{c.lastMessage}</p>
              </div>
              {c.unread > 0 && (
                <span className="w-5 h-5 rounded-full text-[10px] font-bold text-white flex items-center justify-center flex-shrink-0"
                  style={{ background: "#0080FF" }}>{c.unread}</span>
              )}
            </button>
          ))}
        </div>

        {/* Chat thread */}
        <div className={`${!showList || activeConv ? "flex" : "hidden"} md:flex flex-col flex-1 min-w-0`}>
          {activeConv ? (
            <>
              {/* Header */}
              <div className="flex items-center gap-3 px-4 py-3 border-b border-border">
                <button onClick={handleBack} className="md:hidden mr-1"><ChevronLeft size={18} style={{ color: MUTED }} /></button>
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold"
                  style={{ background: "#DBEAFE", color: "#0080FF" }}>
                  {activeConv.parentName.split(" ").slice(-1)[0][0]}
                </div>
                <div>
                  <p className="text-sm font-semibold" style={{ color: NAVY }}>{activeConv.parentName}</p>
                  <p className="text-xs" style={{ color: MUTED }}>{activeConv.studentName} · {activeConv.studentClass}</p>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {activeConv.messages.map(m => (
                  <div key={m.id} className={`flex ${m.sender === "teacher" ? "justify-end" : "justify-start"}`}>
                    <div className="max-w-[75%]">
                      <div className="px-3 py-2 rounded-2xl text-sm"
                        style={{
                          background: m.sender === "teacher" ? NAVY : "var(--muted)/30",
                          color: m.sender === "teacher" ? "white" : "var(--foreground)",
                          borderBottomRightRadius: m.sender === "teacher" ? 4 : undefined,
                          borderBottomLeftRadius: m.sender === "parent" ? 4 : undefined,
                        }}>
                        {m.text}
                      </div>
                      <p className={`text-[10px] mt-1 ${m.sender === "teacher" ? "text-right" : ""}`} style={{ color: MUTED }}>{m.time}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Reply input */}
              <form onSubmit={handleSend} className="flex items-center gap-2 p-3 border-t border-border">
                <input value={reply} onChange={e => setReply(e.target.value)}
                  className="flex-1 h-9 px-3 rounded-xl text-sm border border-border bg-background focus:outline-none"
                  placeholder="Type a reply…" />
                <button type="submit"
                  className="w-9 h-9 rounded-xl flex items-center justify-center text-white flex-shrink-0 transition-all active:scale-95"
                  style={{ background: NAVY }}>
                  <Send size={15} />
                </button>
              </form>
            </>
          ) : (
            <div className="hidden md:flex flex-1 items-center justify-center">
              <p className="text-sm" style={{ color: MUTED }}>Select a conversation to view messages</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
