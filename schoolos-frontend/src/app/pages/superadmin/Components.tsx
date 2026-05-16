const CARD_BG = "#0f0f1a";
const BORDER = "rgba(255,255,255,0.07)";
const TEXT = "#e2e8f0";
const MUTED = "#64748b";
const ACCENT = "#ff6b35";

export const planColors: Record<string, string> = {
  trial: "#F59E0B", growth: "#6366F1", pro: "#10B981", enterprise: "#8B5CF6",
};

export function ChartTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="p-3 rounded-xl" style={{ background: "#1a1a2e", border: `1px solid ${BORDER}`, boxShadow: "0 8px 24px rgba(0,0,0,0.3)" }}>
      <p style={{ color: TEXT, fontSize: "0.78rem", fontWeight: 600, marginBottom: "0.25rem" }}>{label}</p>
      {payload.map((p: any, i: number) => (
        <p key={i} style={{ color: p.color, fontSize: "0.72rem" }}>{p.name}: <span style={{ fontWeight: 600 }}>{p.value}</span></p>
      ))}
    </div>
  );
}

export function StatCard({ icon: Icon, label, value, sub, color, trend, badge }: {
  icon: any; label: string; value: string; sub?: string; color: string;
  trend?: { dir: "up" | "down" | "neutral"; text: string };
  badge?: { text: string; color: string };
}) {
  return (
    <div className="p-5 rounded-[24px] transition-all duration-200 hover:scale-[1.02] hover:shadow-lg" style={{ background: CARD_BG, border: `1px solid ${BORDER}` }}>
      <div className="flex items-start justify-between mb-3">
        <div className="w-10 h-10 rounded-2xl flex items-center justify-center" style={{ background: `${color}15` }}>
          <Icon size={18} color={color} />
        </div>
        <div className="flex items-center gap-2">
          {badge && <span className="px-2 py-0.5 rounded-full text-xs font-medium" style={{ background: `${badge.color}20`, color: badge.color }}>{badge.text}</span>}
          {trend && (
            <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium" style={{
              background: trend.dir === "up" ? "rgba(16,185,129,0.15)" : trend.dir === "down" ? "rgba(239,68,68,0.15)" : "rgba(100,116,139,0.15)",
              color: trend.dir === "up" ? "#10B981" : trend.dir === "down" ? "#EF4444" : "#94a3b8",
            }}>
              <span style={{ fontSize: "0.65rem" }}>{trend.dir === "up" ? "↑" : trend.dir === "down" ? "↓" : "→"}</span>
              {trend.text}
            </span>
          )}
        </div>
      </div>
      <div style={{ fontFamily: "'JetBrains Mono', monospace", color: "#e2e8f0", fontSize: "1.6rem", fontWeight: 700, lineHeight: 1.1, marginBottom: "0.15rem" }}>{value}</div>
      <div style={{ color: "#64748b", fontSize: "0.75rem", fontWeight: 500 }}>{label}</div>
      {sub && <div style={{ color: "#94a3b8", fontSize: "0.68rem", marginTop: "0.15rem" }}>{sub}</div>}
    </div>
  );
}

export function AlertBanner({ type, title, message, action }: {
  type: "warning" | "error" | "info" | "success";
  title: string; message: string; action?: { label: string; onClick: () => void };
}) {
  const colors = {
    warning: { bg: "rgba(245,158,11,0.1)", border: "rgba(245,158,11,0.25)", text: "#F59E0B", icon: "⚠" },
    error: { bg: "rgba(239,68,68,0.1)", border: "rgba(239,68,68,0.25)", text: "#EF4444", icon: "✕" },
    info: { bg: "rgba(99,102,241,0.1)", border: "rgba(99,102,241,0.25)", text: "#6366F1", icon: "ℹ" },
    success: { bg: "rgba(16,185,129,0.1)", border: "rgba(16,185,129,0.25)", text: "#10B981", icon: "✓" },
  };
  const c = colors[type];
  return (
    <div className="flex items-start gap-3 px-5 py-3.5 rounded-2xl" style={{ background: c.bg, border: `1px solid ${c.border}` }}>
      <span style={{ fontSize: "1rem", flexShrink: 0 }}>{c.icon}</span>
      <div className="flex-1 min-w-0">
        <p style={{ color: c.text, fontWeight: 600, fontSize: "0.85rem" }}>{title}</p>
        <p style={{ color: "#94a3b8", fontSize: "0.78rem", marginTop: "0.1rem" }}>{message}</p>
      </div>
      {action && (
        <button onClick={action.onClick} className="px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap hover:opacity-80" style={{ background: c.text, color: "#080810" }}>
          {action.label}
        </button>
      )}
    </div>
  );
}

export function MetricCell({ label, value, sub, color }: { label: string; value: string; sub?: string; color: string }) {
  return (
    <div className="p-4 rounded-2xl" style={{ background: "rgba(255,255,255,0.02)" }}>
      <div style={{ fontFamily: "'JetBrains Mono', monospace", color, fontSize: "1.2rem", fontWeight: 700 }}>{value}</div>
      <div style={{ color: "#e2e8f0", fontSize: "0.78rem", fontWeight: 500, marginTop: "0.15rem" }}>{label}</div>
      {sub && <div style={{ color: "#64748b", fontSize: "0.68rem", marginTop: "0.1rem" }}>{sub}</div>}
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
      <div className="grid lg:grid-cols-3 gap-6">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="p-6 rounded-[24px] animate-pulse" style={{ background: CARD_BG, border: `1px solid ${BORDER}` }}>
            <div className="h-5 w-32 rounded mb-6" style={{ background: "rgba(255,255,255,0.06)" }} />
            <div className="h-40 rounded" style={{ background: "rgba(255,255,255,0.04)" }} />
          </div>
        ))}
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
export const TEXT_C = TEXT;
export const MUTED_C = MUTED;
export const ACCENT_C = ACCENT;
