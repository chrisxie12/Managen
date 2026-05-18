import { useState } from "react";
import { Mail, MailOpen, Loader2, Search, MessageSquare } from "lucide-react";
import type { InboxMessage } from "./types";

const PLUM = "#381932";
const PLUM_LIGHT = "#512b4a";
const MILK = "#FFF3E6";
const MUTED = "#7D6077";

export function InboxList({ messages, loading, onSelect }: { messages: InboxMessage[]; loading: boolean; onSelect: (m: InboxMessage) => void }) {
  const [search, setSearch] = useState("");

  const filtered = messages.filter(m =>
    !search || m.message.subject.toLowerCase().includes(search.toLowerCase()) || m.message.body.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return <div className="flex justify-center py-12"><Loader2 size={24} className="animate-spin" color={MUTED} /></div>;
  }

  if (messages.length === 0) {
    return (
      <div className="text-center py-12" style={{ color: MUTED }}>
        <MessageSquare size={36} className="mx-auto mb-3" />
        <p className="font-semibold" style={{ color: PLUM }}>Inbox Empty</p>
        <p className="text-sm mt-1">No messages yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 px-3 py-2 rounded-xl max-w-xs" style={{ background: "white", border: "1px solid rgba(56,25,50,0.1)" }}>
        <Search size={14} color={MUTED} />
        <input placeholder="Search messages..." value={search} onChange={(e) => setSearch(e.target.value)}
          className="bg-transparent outline-none text-sm flex-1" style={{ color: PLUM }} />
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-6" style={{ color: MUTED }}>
          <p className="text-sm">No messages match your search.</p>
        </div>
      ) : filtered.map(m => (
        <div key={m.id} onClick={() => onSelect(m)}
          className="p-4 rounded-xl cursor-pointer hover:opacity-80 transition-opacity"
          style={{ background: m.status !== "read" ? MILK : "white", border: "1px solid rgba(56,25,50,0.07)" }}>
          <div className="flex items-start gap-3">
            <div className="mt-0.5">
              {m.status !== "read" ? <Mail size={16} color={PLUM} /> : <MailOpen size={16} color={MUTED} />}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1">
                <p className={`text-sm font-medium truncate ${m.status !== "read" ? "font-semibold" : ""}`} style={{ color: PLUM }}>
                  {m.message.subject}
                </p>
                <span className="text-xs shrink-0 ml-2" style={{ color: MUTED }}>
                  {new Date(m.message.created_at).toLocaleDateString()}
                </span>
              </div>
              <p className="text-xs line-clamp-2" style={{ color: PLUM_LIGHT }}>{m.message.body}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
