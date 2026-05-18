import { Loader2, ChevronRight, TrendingUp, TrendingDown, AlertCircle, CheckCircle2, Info, X, LucideIcon } from "lucide-react";
import { useNavigate } from "react-router";

const PLUM = "#381932";
const PLUM_LIGHT = "#512b4a";
const MILK = "#FFF3E6";
const MUTED = "#7D6077";

export function LoadingSpinner({ height = "min-h-[400px]" }: { height?: string }) {
  return (
    <div className={`flex items-center justify-center ${height}`}>
      <Loader2 className="animate-spin" size={32} color={PLUM} />
    </div>
  );
}

export function LoadingSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="p-5 rounded-[24px]" style={{ background: "white", border: "1px solid rgba(56,25,50,0.07)" }}>
          <div className="w-10 h-10 rounded-2xl mb-4 animate-pulse" style={{ background: `${PLUM}10` }} />
          <div className="h-6 w-20 rounded mb-2 animate-pulse" style={{ background: `${PLUM}08` }} />
          <div className="h-3 w-16 rounded animate-pulse" style={{ background: `${PLUM}05` }} />
        </div>
      ))}
    </div>
  );
}

export function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div className="flex items-center justify-center min-h-[300px]">
      <div className="text-center p-8">
        <AlertCircle size={40} color="#EF4444" className="mx-auto mb-4" />
        <p className="text-lg font-semibold mb-1" style={{ color: PLUM }}>Something went wrong</p>
        <p style={{ color: MUTED, fontSize: "0.85rem", marginBottom: "1rem" }}>{message}</p>
        {onRetry && (
          <button onClick={onRetry} className="px-5 py-2 rounded-full text-sm active:scale-95 transition-transform" style={{ background: PLUM, color: "white" }}>
            Try Again
          </button>
        )}
      </div>
    </div>
  );
}

export function EmptyState({ icon: Icon, title, desc }: { icon: LucideIcon; title: string; desc: string }) {
  return (
    <div className="flex items-center justify-center min-h-[200px] rounded-[24px]" style={{ background: "white", border: "1px solid rgba(56,25,50,0.07)" }}>
      <div className="text-center p-8">
        <Icon size={36} color={MUTED} className="mx-auto mb-3" />
        <p style={{ color: PLUM, fontSize: "0.95rem", fontWeight: 600, marginBottom: "0.3rem" }}>{title}</p>
        <p style={{ color: MUTED, fontSize: "0.8rem" }}>{desc}</p>
      </div>
    </div>
  );
}

export function AlertBanner({ type, message, onClose }: { type: "error" | "success" | "warning" | "info"; message: string; onClose?: () => void }) {
  const config = {
    error: { bg: "#FEF2F2", color: "#EF4444", border: "#FECACA", icon: AlertCircle },
    success: { bg: "#D1FAE5", color: "#065F46", border: "#A7F3D0", icon: CheckCircle2 },
    warning: { bg: "#FEF3C7", color: "#92400E", border: "#FDE68A", icon: AlertCircle },
    info: { bg: "#EEF2FF", color: "#3730A3", border: "#C7D2FE", icon: Info },
  };
  const c = config[type];
  const Icon = c.icon;
  return (
    <div className="mb-4 p-3 rounded-xl flex items-center gap-2" style={{ background: c.bg, color: c.color, border: `1px solid ${c.border}`, fontSize: "0.9rem" }}>
      <Icon size={14} className="flex-shrink-0" />
      <span className="flex-1">{message}</span>
      {onClose && <button onClick={onClose} className="flex-shrink-0"><X size={14} /></button>}
    </div>
  );
}

export function DashboardCard({ title, action, children, className }: { title: string; action?: React.ReactNode; children: React.ReactNode; className?: string }) {
  return (
    <div className={`p-5 rounded-[24px] ${className || ""}`} style={{ background: "white", border: "1px solid rgba(56,25,50,0.07)", boxShadow: "0 4px 24px rgba(56,25,50,0.06)" }}>
      <div className="flex items-center justify-between mb-4">
        <h3 style={{ fontFamily: "'Playfair Display', serif", color: PLUM, fontWeight: 700, fontSize: "1rem" }}>{title}</h3>
        {action}
      </div>
      {children}
    </div>
  );
}

export function StatCard({ icon: Icon, label, value, color, path, badge, onClick }: {
  icon: LucideIcon; label: string; value: string; color: string; path?: string; badge?: string; onClick?: () => void;
}) {
  const nav = useNavigate();
  const handleClick = onClick || (path ? () => nav(path) : undefined);
  return (
    <div onClick={handleClick} className="p-5 rounded-[24px] cursor-pointer hover:scale-[1.02] transition-transform"
      style={{ background: "white", border: "1px solid rgba(56,25,50,0.07)", boxShadow: "0 4px 24px rgba(56,25,50,0.06)" }}>
      <div className="flex items-start justify-between mb-4">
        <div className="w-10 h-10 rounded-2xl flex items-center justify-center" style={{ background: `${color}15` }}>
          <Icon size={18} color={color} />
        </div>
        <ChevronRight size={14} color={MUTED} />
      </div>
      <div style={{ fontFamily: "'JetBrains Mono', monospace", color: PLUM, fontSize: "clamp(1.1rem, 2.5vw, 1.5rem)", fontWeight: 700, lineHeight: 1.1, marginBottom: "0.3rem" }}>{value}</div>
      <div style={{ color: MUTED, fontSize: "0.75rem" }}>{label}</div>
      {badge && <div className="mt-1 text-xs" style={{ color }}>{badge}</div>}
    </div>
  );
}

export function KpiCard({ value, label, sub, positive, onClick }: { value: string; label: string; sub?: string; positive?: boolean; onClick?: () => void }) {
  return (
    <div onClick={onClick} className={`p-5 rounded-[24px] ${onClick ? 'cursor-pointer hover:scale-[1.02] transition-transform' : ''}`} style={{ background: "white", border: "1px solid rgba(56,25,50,0.07)", boxShadow: "0 4px 24px rgba(56,25,50,0.06)" }}>
      <div style={{ fontFamily: "'JetBrains Mono', monospace", color: PLUM, fontSize: "clamp(1rem, 2vw, 1.4rem)", fontWeight: 700, lineHeight: 1.1, marginBottom: "0.3rem" }}>{value}</div>
      <div style={{ color: MUTED, fontSize: "0.75rem" }}>{label}</div>
      {sub && (
        <div className="flex items-center gap-1 text-xs mt-1" style={{ color: positive !== undefined ? (positive ? "#10B981" : "#EF4444") : MUTED }}>
          {positive !== undefined && (positive ? <TrendingUp size={11} /> : <TrendingDown size={11} />)}
          {sub}
        </div>
      )}
    </div>
  );
}

export function MiniTable({ headers, rows }: { headers: string[]; rows: (string | React.ReactNode)[][] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr>
            {headers.map((h, i) => (
              <th key={i} className="text-left pb-2 font-medium" style={{ color: MUTED, fontSize: "0.7rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, ri) => (
            <tr key={ri} className="border-t" style={{ borderColor: "rgba(56,25,50,0.05)" }}>
              {row.map((cell, ci) => (
                <td key={ci} className="py-2.5 pr-3" style={{ color: PLUM_LIGHT, fontSize: "0.82rem" }}>{cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function StatusBadge({ status, colorMap }: { status: string; colorMap?: Record<string, { bg: string; color: string }> }) {
  const colors: Record<string, { bg: string; color: string }> = colorMap || {
    published: { bg: "#D1FAE5", color: "#065F46" },
    graded: { bg: "#EEF2FF", color: "#3730A3" },
    draft: { bg: "#FEF3C7", color: "#92400E" },
    present: { bg: "#D1FAE5", color: "#065F46" },
    absent: { bg: "#FEF2F2", color: "#EF4444" },
    late: { bg: "#FEF3C7", color: "#92400E" },
    paid: { bg: "#D1FAE5", color: "#065F46" },
    partial: { bg: "#FEF3C7", color: "#92400E" },
    overdue: { bg: "#FEF2F2", color: "#EF4444" },
    pending: { bg: "#FEF3C7", color: "#92400E" },
    active: { bg: "#D1FAE5", color: "#065F46" },
    suspended: { bg: "#FEF2F2", color: "#EF4444" },
    trial: { bg: "#FEF3C7", color: "#92400E" },
  };
  const c = colors[status.toLowerCase()] || { bg: "#F3F4F6", color: "#6B7280" };
  return (
    <span className="px-2 py-0.5 rounded-full text-xs" style={{ background: c.bg, color: c.color }}>
      {status}
    </span>
  );
}

export function SectionHeader({ title, subtitle, action }: { title: string; subtitle?: string; action?: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between mb-4">
      <div>
        <h2 style={{ fontFamily: "'Playfair Display', serif", color: PLUM, fontSize: "1.15rem", fontWeight: 700 }}>{title}</h2>
        {subtitle && <p style={{ color: MUTED, fontSize: "0.78rem" }}>{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

export function QuickActions({ items }: { items: { label: string; icon: LucideIcon; color: string; path: string }[] }) {
  const navigate = useNavigate();
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
      {items.map((action) => (
        <button key={action.label} onClick={() => navigate(action.path)}
          className="p-3 rounded-2xl text-left hover:scale-[1.03] transition-transform active:scale-95"
          style={{ background: `${action.color}10`, border: `1px solid ${action.color}20` }}>
          <action.icon size={16} color={action.color} className="mb-1" />
          <p style={{ color: PLUM, fontSize: "0.75rem", fontWeight: 500, lineHeight: 1.3 }}>{action.label}</p>
        </button>
      ))}
    </div>
  );
}

export function ActivityFeed({ items }: { items: { icon: LucideIcon; color: string; text: string; time: string }[] }) {
  if (items.length === 0) {
    return (
      <div className="flex items-center justify-center h-[200px]" style={{ color: MUTED }}>
        <p style={{ fontSize: "0.85rem" }}>No activity yet.</p>
      </div>
    );
  }
  return (
    <div className="space-y-4">
      {items.map((item, i) => (
        <div key={i} className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5" style={{ background: `${item.color}15` }}>
            <item.icon size={14} color={item.color} />
          </div>
          <div className="flex-1">
            <p style={{ color: PLUM_LIGHT, fontSize: "0.88rem", lineHeight: 1.4 }}>{item.text}</p>
            <p style={{ color: MUTED, fontSize: "0.75rem", marginTop: "0.15rem" }}>{item.time}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

export function ChartCard({ title, subtitle, action, children }: { title: string; subtitle?: string; action?: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="p-6 rounded-[24px]" style={{ background: "white", border: "1px solid rgba(56,25,50,0.07)", boxShadow: "0 4px 24px rgba(56,25,50,0.06)" }}>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 style={{ fontFamily: "'Playfair Display', serif", color: PLUM, fontWeight: 700, fontSize: "1.05rem" }}>{title}</h3>
          {subtitle && <p style={{ color: MUTED, fontSize: "0.78rem" }}>{subtitle}</p>}
        </div>
        {action}
      </div>
      {children}
    </div>
  );
}

export function SummaryCard({ icon: Icon, label, value, sub, color }: { icon: LucideIcon; label: string; value: string | number; sub?: string; color?: string }) {
  return (
    <div className="p-4 rounded-xl" style={{ background: "white", border: "1px solid rgba(56,25,50,0.07)" }}>
      <div className="flex items-center gap-2 mb-1">
        <Icon size={14} color={color || MUTED} />
        <p className="text-xs uppercase tracking-wider" style={{ color: MUTED }}>{label}</p>
      </div>
      <p className="text-2xl font-bold" style={{ color: PLUM }}>{value}</p>
      {sub && <p className="text-xs mt-1" style={{ color: MUTED }}>{sub}</p>}
    </div>
  );
}

export const palette = { PLUM, PLUM_LIGHT, MILK, MUTED } as const;
