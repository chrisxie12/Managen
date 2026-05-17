import { MessageSquare } from "lucide-react";

const PLUM = "#381932";
const MUTED = "#7D6077";

export function Communication() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 style={{ fontWeight: 800, fontSize: "1.5rem", color: PLUM }}>Communication</h1>
          <p style={{ color: MUTED, fontSize: "0.85rem" }}>Send messages and broadcast to parents</p>
        </div>
      </div>

      <div className="flex items-center justify-center min-h-[400px] rounded-[24px]" style={{ background: "white", border: "1px solid rgba(56,25,50,0.07)" }}>
        <div className="text-center p-8">
          <MessageSquare size={48} color={MUTED} className="mx-auto mb-4" />
          <p style={{ color: PLUM, fontSize: "1.1rem", fontWeight: 600, marginBottom: "0.3rem" }}>No Conversations Yet</p>
          <p style={{ color: MUTED, fontSize: "0.85rem" }}>Messages and broadcasts to parents will appear here once you start communicating.</p>
        </div>
      </div>
    </div>
  );
}
