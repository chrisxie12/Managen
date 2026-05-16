const CARD_BG = "#0f0f1a";
const BORDER = "rgba(255,255,255,0.07)";

export function StatCard({ icon: Icon, label, value, sub, color, trend }: {
  icon: any; label: string; value: string; sub?: string; color: string; trend?: { dir: "up" | "down"; text: string };
}) {
  return (
    <div className="p-5 rounded-[24px] transition-all duration-200 hover:scale-[1.02]" style={{ background: CARD_BG, border: `1px solid ${BORDER}` }}>
      <div className="flex items-start justify-between mb-4">
        <div className="w-10 h-10 rounded-2xl flex items-center justify-center" style={{ background: `${color}15` }}>
          <Icon size={18} color={color} />
        </div>
        {trend && <span style={{ color: trend.dir === "up" ? "#10B981" : "#EF4444", fontSize: "0.65rem", fontWeight: 600, padding: "2px 8px", borderRadius: "999px", background: trend.dir === "up" ? "rgba(16,185,129,0.15)" : "rgba(239,68,68,0.15)" }}>{trend.text}</span>}
      </div>
      <div style={{ fontFamily: "'JetBrains Mono', monospace", color: "#e2e8f0", fontSize: "1.5rem", fontWeight: 700, lineHeight: 1.1, marginBottom: "0.2rem" }}>{value}</div>
      <div style={{ color: "#64748b", fontSize: "0.75rem", marginBottom: "0.1rem" }}>{label}</div>
      {sub && <div style={{ color: "#94a3b8", fontSize: "0.7rem" }}>{sub}</div>}
    </div>
  );
}

export function Badge({ text, color }: { text: string; color: string }) {
  return <span className="px-2.5 py-1 rounded-full text-xs font-medium" style={{ background: `${color}20`, color }}>{text}</span>;
}

export function LoadingSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="p-5 rounded-[24px] animate-pulse" style={{ background: CARD_BG, border: `1px solid ${BORDER}` }}>
            <div className="w-10 h-10 rounded-2xl mb-4" style={{ background: "rgba(255,255,255,0.06)" }} />
            <div className="h-7 w-24 rounded mb-2" style={{ background: "rgba(255,255,255,0.06)" }} />
            <div className="h-4 w-20 rounded" style={{ background: "rgba(255,255,255,0.04)" }} />
          </div>
        ))}
      </div>
      <div className="p-6 rounded-[24px] animate-pulse" style={{ background: CARD_BG, border: `1px solid ${BORDER}` }}>
        <div className="h-6 w-40 rounded mb-6" style={{ background: "rgba(255,255,255,0.06)" }} />
        <div className="h-48 rounded" style={{ background: "rgba(255,255,255,0.04)" }} />
      </div>
    </div>
  );
}

export function EmptyState({ icon: Icon, title, desc }: { icon: any; title: string; desc: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <Icon size={40} color="#64748b" />
      <p style={{ color: "#64748b", fontSize: "0.95rem", marginTop: "0.75rem" }}>{title}</p>
      <p style={{ color: "#475569", fontSize: "0.78rem", marginTop: "0.25rem", maxWidth: 300 }}>{desc}</p>
    </div>
  );
}

export function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-4" style={{ background: "rgba(239,68,68,0.15)" }}>
        <span style={{ color: "#EF4444", fontSize: "1.2rem" }}>!</span>
      </div>
      <p style={{ color: "#e2e8f0", fontSize: "0.95rem" }}>Failed to load data</p>
      <p style={{ color: "#64748b", fontSize: "0.78rem", marginTop: "0.25rem" }}>{message}</p>
      {onRetry && <button onClick={onRetry} className="mt-4 px-4 py-2 rounded-full text-sm" style={{ background: "rgba(255,107,53,0.15)", color: "#ff6b35" }}>Retry</button>}
    </div>
  );
}

export const CARD_BG_C = CARD_BG;
export const BORDER_C = BORDER;
