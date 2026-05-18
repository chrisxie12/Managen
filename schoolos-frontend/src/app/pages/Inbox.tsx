import { useState, useEffect } from "react";
import { PenSquare, ArrowLeft } from "lucide-react";
import { api } from "../services/api";
import { InboxList } from "../components/inbox/InboxList";
import { ComposeMessage } from "../components/inbox/ComposeMessage";
import type { InboxMessage } from "../components/inbox/types";

const PLUM = "#381932";
const PLUM_LIGHT = "#512b4a";
const MILK = "#FFF3E6";
const MUTED = "#7D6077";

type View = "inbox" | "compose" | "detail";

export function Inbox() {
  const [view, setView] = useState<View>("inbox");
  const [messages, setMessages] = useState<InboxMessage[]>([]);
  const [selected, setSelected] = useState<InboxMessage | null>(null);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const res = await api.get<{ messages: InboxMessage[] }>("/api/school/inbox");
      setMessages(res.data?.messages || []);
    } catch { /* ignore */ } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const openMessage = (m: InboxMessage) => {
    setSelected(m);
    setView("detail");
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        {view !== "inbox" ? (
          <button onClick={() => { setView("inbox"); setSelected(null); }} className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm" style={{ background: "white", border: "1px solid rgba(56,25,50,0.1)", color: PLUM }}>
            <ArrowLeft size={14} /> Back
          </button>
        ) : (
          <div>
            <h2 className="text-xl font-bold" style={{ color: PLUM, fontFamily: "'Playfair Display', serif" }}>Inbox</h2>
            <p className="text-sm" style={{ color: MUTED }}>{messages.length} message{messages.length !== 1 ? "s" : ""}</p>
          </div>
        )}
        <button onClick={() => setView("compose")}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold active:scale-95 transition-transform"
          style={{ background: `linear-gradient(135deg, ${PLUM}, ${PLUM_LIGHT})`, color: MILK }}>
          <PenSquare size={14} /> Compose
        </button>
      </div>

      {view === "inbox" && <InboxList messages={messages} loading={loading} onSelect={openMessage} />}

      {view === "compose" && <ComposeMessage onSent={() => { setView("inbox"); load(); }} />}

      {view === "detail" && selected && (
        <div className="p-6 rounded-[24px]" style={{ background: "white", border: "1px solid rgba(56,25,50,0.07)" }}>
          <div className="mb-4">
            <p className="text-lg font-bold" style={{ color: PLUM, fontFamily: "'Playfair Display', serif" }}>{selected.message.subject}</p>
            <p className="text-sm" style={{ color: MUTED }}>{new Date(selected.message.created_at).toLocaleString()}</p>
          </div>
          <div className="p-4 rounded-xl text-sm leading-relaxed whitespace-pre-wrap" style={{ background: MILK, color: PLUM_LIGHT }}>
            {selected.message.body}
          </div>
        </div>
      )}
    </div>
  );
}
