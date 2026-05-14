import { useNavigate } from "react-router";
import { TrendingUp, TrendingDown, AlertCircle, ArrowRight, CheckCircle, Download, Receipt } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const PLUM = "#381932";
const PLUM_LIGHT = "#512b4a";
const MUTED = "#7D6077";

const collectionData = [
  { month: "Sep", collected: 42000, outstanding: 8500 },
  { month: "Oct", collected: 58000, outstanding: 7200 },
  { month: "Nov", collected: 49000, outstanding: 9100 },
  { month: "Dec", collected: 63000, outstanding: 6400 },
  { month: "Jan", collected: 71000, outstanding: 5800 },
  { month: "Feb", collected: 86000, outstanding: 4300 },
  { month: "Mar", collected: 94000, outstanding: 3900 },
];

const recentTransactions = [
  { id: "TXN-8821", student: "Ama Owusu", amount: 1800, method: "Paystack", date: "Mar 28", status: "success" },
  { id: "TXN-8820", student: "Kwesi Boateng", amount: 825, method: "Cash", date: "Mar 25", status: "partial" },
  { id: "TXN-8819", student: "Efua Mensah", amount: 1800, method: "Flutterwave", date: "Mar 22", status: "success" },
  { id: "TXN-8818", student: "Yaw Darko", amount: 1500, method: "—", date: "Feb 01", status: "overdue" },
];

const pendingInvoices = [
  { student: "Yaw Darko", class: "JHS 1C", amount: 1500, due: "Apr 15, 2026", daysOverdue: 29 },
  { student: "Abena Asante", class: "JHS 2A", amount: 1150, due: "Mar 01, 2026", daysOverdue: 74 },
  { student: "Ama Owusu", class: "JHS 3A", amount: 1800, due: "May 01, 2026", daysOverdue: 0 },
];

export function AccountantDashboard() {
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Collected", value: "GHS 463K", change: "+18% vs last term", positive: true, icon: TrendingUp, color: "#10B981" },
          { label: "Outstanding", value: "GHS 44.2K", change: "-12% this month", positive: true, icon: TrendingDown, color: "#F59E0B" },
          { label: "Overdue Accounts", value: "34", change: "6 are >60 days", positive: false, icon: AlertCircle, color: "#EF4444" },
          { label: "Invoices This Month", value: "218", change: "168 paid, 50 pending", positive: true, icon: Receipt, color: "#6366F1" },
        ].map((card) => (
          <div key={card.label} className="p-5 rounded-[24px]" style={{ background: "white", border: "1px solid rgba(56,25,50,0.07)" }}>
            <div className="w-10 h-10 rounded-2xl flex items-center justify-center mb-4" style={{ background: `${card.color}15` }}>
              <card.icon size={18} color={card.color} />
            </div>
            <div style={{ fontFamily: "'JetBrains Mono', monospace", color: PLUM, fontSize: "clamp(1rem, 2vw, 1.4rem)", fontWeight: 700, lineHeight: 1.1, marginBottom: "0.3rem" }}>{card.value}</div>
            <div style={{ color: MUTED, fontSize: "0.75rem", marginBottom: "0.3rem" }}>{card.label}</div>
            <div className="flex items-center gap-1 text-xs" style={{ color: card.positive ? "#10B981" : "#EF4444" }}>
              {card.positive ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
              {card.change}
            </div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 p-6 rounded-[24px]" style={{ background: "white", border: "1px solid rgba(56,25,50,0.07)" }}>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 style={{ fontFamily: "'Playfair Display', serif", color: PLUM, fontWeight: 700, fontSize: "1.05rem" }}>Collection vs Outstanding</h3>
              <p style={{ color: MUTED, fontSize: "0.78rem" }}>This academic year</p>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={collectionData}>
              <defs>
                <linearGradient id="collectedGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10B981" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#10B981" stopOpacity={0.01} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(56,25,50,0.05)" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: MUTED }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: MUTED }} axisLine={false} tickLine={false} tickFormatter={(v) => `${(v/1000).toFixed(0)}K`} />
              <Tooltip contentStyle={{ background: "white", border: "1px solid rgba(56,25,50,0.1)", borderRadius: 12, fontSize: 12 }} />
              <Area type="monotone" dataKey="collected" stroke="#10B981" strokeWidth={2.5} fill="url(#collectedGrad)" name="Collected" />
              <Area type="monotone" dataKey="outstanding" stroke="#F59E0B" strokeWidth={2} fill="none" strokeDasharray="5 5" name="Outstanding" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="p-6 rounded-[24px]" style={{ background: "white", border: "1px solid rgba(56,25,50,0.07)" }}>
          <h3 style={{ fontFamily: "'Playfair Display', serif", color: PLUM, fontWeight: 700, fontSize: "1.05rem", marginBottom: "1rem" }}>Pending Invoices</h3>
          <div className="space-y-3">
            {pendingInvoices.map((inv) => (
              <div key={inv.student} className="p-3 rounded-2xl" style={{ background: "rgba(56,25,50,0.03)" }}>
                <div className="flex justify-between mb-1">
                  <span style={{ color: PLUM, fontSize: "0.82rem", fontWeight: 500 }}>{inv.student}</span>
                  <span style={{ fontFamily: "'JetBrains Mono', monospace", color: PLUM, fontSize: "0.8rem", fontWeight: 600 }}>GHS {inv.amount.toLocaleString()}</span>
                </div>
                <div style={{ color: MUTED, fontSize: "0.72rem" }}>{inv.class} · Due {inv.due}</div>
                {inv.daysOverdue > 0 && (
                  <div className="flex items-center gap-1 mt-1" style={{ color: "#EF4444", fontSize: "0.7rem" }}>
                    <AlertCircle size={10} /> {inv.daysOverdue} days overdue
                  </div>
                )}
              </div>
            ))}
          </div>
          <button onClick={() => navigate("/dashboard/finance")} className="mt-4 w-full py-2 rounded-full text-xs" style={{ color: PLUM_LIGHT }}>
            View all invoices <ArrowRight size={11} className="inline" />
          </button>
        </div>
      </div>

      <div className="p-6 rounded-[24px]" style={{ background: "white", border: "1px solid rgba(56,25,50,0.07)" }}>
        <div className="flex items-center justify-between mb-4">
          <h3 style={{ fontFamily: "'Playfair Display', serif", color: PLUM, fontWeight: 700, fontSize: "1.05rem" }}>Recent Transactions</h3>
          <button className="flex items-center gap-1 text-xs hover:opacity-70" style={{ color: PLUM_LIGHT }}>
            <Download size={12} /> Export
          </button>
        </div>
        <div className="space-y-2">
          {recentTransactions.map((t, i) => (
            <div key={t.id} className="flex items-center justify-between p-3 rounded-2xl" style={{ background: i % 2 === 0 ? "rgba(56,25,50,0.02)" : "transparent" }}>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: t.status === "success" ? "#D1FAE5" : t.status === "partial" ? "#FEF3C7" : "#FEE2E2" }}>
                  {t.status === "success" ? <CheckCircle size={14} color="#10B981" /> : <AlertCircle size={14} color={t.status === "partial" ? "#F59E0B" : "#EF4444"} />}
                </div>
                <div>
                  <div style={{ color: PLUM, fontSize: "0.82rem", fontWeight: 500 }}>{t.student}</div>
                  <div style={{ color: MUTED, fontSize: "0.7rem" }}>{t.method} · {t.date}</div>
                </div>
              </div>
              <div style={{ fontFamily: "'JetBrains Mono', monospace", color: PLUM, fontSize: "0.85rem", fontWeight: 600 }}>GHS {t.amount.toLocaleString()}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
