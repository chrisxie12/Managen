import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import {
  DollarSign, TrendingUp, AlertCircle, CheckCircle2, Clock, BarChart3,
  ArrowUpRight, ArrowDownRight, User, Zap, Calendar,
} from "lucide-react";
import { api } from "../services/api";

const COLORS = {
  NAVY: "#0A2472",
  AMBER: "#FFBA08",
  MUTED: "#6B7280",
  GREEN: "#10B981",
  RED: "#EF4444",
  BLUE: "#3B82F6",
};

type AccountantDashboardData = {
  totalCollected: number;
  totalOutstanding: number;
  collectionRate: number;
  totalStudents: number;
  totalInvoices: number;
  pendingPayments: number;
};

export function AccountantDashboardV2() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<AccountantDashboardData>({
    totalCollected: 45000,
    totalOutstanding: 12500,
    collectionRate: 92,
    totalStudents: 1250,
    totalInvoices: 1250,
    pendingPayments: 85,
  });

  useEffect(() => {
    // Load data
    setLoading(false);
  }, []);

  if (loading) return <div>Loading...</div>;

  const KpiCard = ({ icon: Icon, label, value, color, trend, desc }: any) => (
    <div
      className="p-6 rounded-xl border cursor-pointer transition-all hover:shadow-lg"
      style={{
        background: "white",
        borderColor: `${color}20`,
        borderLeft: `4px solid ${color}`,
      }}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="w-12 h-12 rounded-lg flex items-center justify-center" style={{ background: `${color}15` }}>
          <Icon size={24} style={{ color }} />
        </div>
        {trend !== undefined && (
          <div className="flex items-center gap-1 text-xs font-semibold" style={{ color: trend > 0 ? COLORS.GREEN : COLORS.RED }}>
            {trend > 0 ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
            {Math.abs(trend)}%
          </div>
        )}
      </div>
      <div style={{ color: COLORS.NAVY }} className="text-3xl font-bold mb-1">
        {value}
      </div>
      <div style={{ color: COLORS.MUTED }} className="text-sm font-medium">
        {label}
      </div>
      {desc && <div style={{ color: COLORS.MUTED }} className="text-xs mt-2">{desc}</div>}
    </div>
  );

  return (
    <div className="space-y-6 sm:space-y-8 p-4 sm:p-6">
      {/* HEADER */}
      <div>
        <h1 style={{ color: COLORS.NAVY }} className="text-2xl sm:text-3xl font-bold">
          Finance Dashboard
        </h1>
        <p style={{ color: COLORS.MUTED }} className="mt-2">
          Monitor fee collections and school finances.
        </p>
      </div>

      {/* PRIMARY METRICS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          icon={DollarSign}
          label="Total Collected"
          value={`GHS ${data.totalCollected.toLocaleString()}`}
          color={COLORS.GREEN}
          trend={15}
          desc="This term"
        />
        <KpiCard
          icon={AlertCircle}
          label="Outstanding Fees"
          value={`GHS ${data.totalOutstanding.toLocaleString()}`}
          color={COLORS.RED}
          desc="Follow-up needed"
        />
        <KpiCard
          icon={TrendingUp}
          label="Collection Rate"
          value={`${data.collectionRate}%`}
          color={data.collectionRate > 90 ? COLORS.GREEN : COLORS.AMBER}
          desc="Students with paid fees"
        />
        <KpiCard
          icon={Clock}
          label="Pending Payments"
          value={data.pendingPayments}
          color={COLORS.AMBER}
          desc="Awaiting confirmation"
        />
      </div>

      {/* DETAILED BREAKDOWN */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Payment Methods */}
        <div className="p-4 sm:p-6 rounded-xl border bg-white">
          <h3 style={{ color: COLORS.NAVY }} className="font-bold mb-4">
            Payment Methods
          </h3>
          <div className="space-y-4">
            {[
              { method: "Paystack (Online)", amount: 28000, pct: 62 },
              { method: "Bank Transfer", amount: 12000, pct: 27 },
              { method: "Cash", amount: 5000, pct: 11 },
            ].map((p) => (
              <div key={p.method}>
                <div className="flex items-center justify-between mb-2">
                  <span style={{ color: COLORS.NAVY }} className="text-sm font-medium">
                    {p.method}
                  </span>
                  <span style={{ color: COLORS.NAVY }} className="font-bold">
                    GHS {p.amount.toLocaleString()}
                  </span>
                </div>
                <div className="h-2 rounded-full" style={{ background: "#E5E7EB" }}>
                  <div className="h-full rounded-full" style={{ width: `${p.pct}%`, background: COLORS.AMBER }} />
                </div>
                <div style={{ color: COLORS.MUTED }} className="text-xs mt-1">
                  {p.pct}% of total
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Class-wise Collection */}
        <div className="p-4 sm:p-6 rounded-xl border bg-white">
          <h3 style={{ color: COLORS.NAVY }} className="font-bold mb-4">
            Collection by Class
          </h3>
          <div className="space-y-3">
            {[
              { class: "Primary 6", collected: 2800, outstanding: 200, rate: 93 },
              { class: "JHS 2", collected: 3500, outstanding: 300, rate: 92 },
              { class: "SHS 3", collected: 4200, outstanding: 800, rate: 84 },
            ].map((c) => (
              <div key={c.class} className="p-3 rounded-lg" style={{ background: "#F9FAFB", border: "1px solid #E5E7EB" }}>
                <div className="flex items-center justify-between mb-2">
                  <span style={{ color: COLORS.NAVY }} className="font-medium">
                    {c.class}
                  </span>
                  <span style={{ color: COLORS.GREEN }} className="font-bold">
                    {c.rate}%
                  </span>
                </div>
                <div className="flex items-center gap-2 text-xs" style={{ color: COLORS.MUTED }}>
                  <span>GHS {c.collected} paid</span>
                  <span>·</span>
                  <span style={{ color: COLORS.RED }}>GHS {c.outstanding} due</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* RECENT INVOICES */}
      <div className="p-4 sm:p-6 rounded-xl border bg-white">
        <div className="flex items-center justify-between mb-4">
          <h3 style={{ color: COLORS.NAVY }} className="font-bold">
            Recent Invoices
          </h3>
          <button
            onClick={() => navigate("/dashboard/invoices")}
            style={{ color: COLORS.AMBER }}
            className="text-sm font-semibold hover:underline"
          >
            View All →
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr style={{ borderBottom: "1px solid #E5E7EB" }}>
                <th style={{ color: COLORS.MUTED }} className="text-left py-2 text-sm font-medium">
                  Student
                </th>
                <th style={{ color: COLORS.MUTED }} className="text-left py-2 text-sm font-medium">
                  Class
                </th>
                <th style={{ color: COLORS.MUTED }} className="text-left py-2 text-sm font-medium">
                  Amount
                </th>
                <th style={{ color: COLORS.MUTED }} className="text-left py-2 text-sm font-medium">
                  Status
                </th>
              </tr>
            </thead>
            <tbody>
              {[
                { name: "Kofi Mensah", class: "JHS 2", amount: 1200, status: "Paid", color: COLORS.GREEN },
                { name: "Ama Osei", class: "Primary 6", amount: 800, status: "Pending", color: COLORS.AMBER },
                { name: "David Owusu", class: "SHS 3", amount: 1500, status: "Overdue", color: COLORS.RED },
              ].map((invoice, i) => (
                <tr key={i} style={{ borderBottom: "1px solid #E5E7EB" }}>
                  <td style={{ color: COLORS.NAVY }} className="py-3 text-sm font-medium">
                    {invoice.name}
                  </td>
                  <td style={{ color: COLORS.MUTED }} className="py-3 text-sm">
                    {invoice.class}
                  </td>
                  <td style={{ color: COLORS.NAVY }} className="py-3 text-sm font-bold">
                    GHS {invoice.amount}
                  </td>
                  <td className="py-3">
                    <span
                      className="px-3 py-1 rounded-full text-xs font-semibold"
                      style={{
                        background: `${invoice.color}15`,
                        color: invoice.color,
                      }}
                    >
                      {invoice.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* QUICK ACTIONS */}
      <div>
        <h2 style={{ color: COLORS.NAVY }} className="text-lg font-bold mb-4">
          Quick Actions
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { icon: DollarSign, title: "Create Invoice", desc: "Add new payment invoice" },
            { icon: BarChart3, title: "Generate Report", desc: "Fee collection summary" },
            { icon: Zap, title: "Send Reminders", desc: "WhatsApp payment reminders" },
          ].map((action, i) => (
            <div
              key={i}
              className="p-6 rounded-xl border bg-white cursor-pointer transition-all hover:shadow-lg hover:-translate-y-1"
              style={{ borderColor: `${COLORS.AMBER}20` }}
            >
              <div
                className="w-12 h-12 rounded-lg flex items-center justify-center mb-4"
                style={{ background: `${COLORS.AMBER}15` }}
              >
                <action.icon size={24} style={{ color: COLORS.AMBER }} />
              </div>
              <div style={{ color: COLORS.NAVY }} className="font-bold">
                {action.title}
              </div>
              <div style={{ color: COLORS.MUTED }} className="text-sm mt-1">
                {action.desc}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
