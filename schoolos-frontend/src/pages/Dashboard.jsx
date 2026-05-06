import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { 
  Users, 
  Wallet, 
  Clock, 
  TrendingUp, 
  TrendingDown, 
  BookOpen, 
  MessageSquare, 
  ArrowRight, 
  CheckCircle2, 
  AlertCircle, 
  Circle, 
  ChevronRight, 
  Bell, 
  Plus
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import Sidebar from '../components/layout/Sidebar';
import DashboardNavbar from '../components/layout/DashboardNavbar';
import { buildUrl, handleApiError } from '../services/api';

const PLUM = "#381932";
const PLUM_LIGHT = "#512b4a";
const MILK = "#FFF3E6";
const MUTED = "#7D6077";

const revenueData = [
  { month: "Sep", amount: 42000 },
  { month: "Oct", amount: 58000 },
  { month: "Nov", amount: 49000 },
  { month: "Dec", amount: 63000 },
  { month: "Jan", amount: 71000 },
  { month: "Feb", amount: 86000 },
  { month: "Mar", amount: 94000 },
];

const pieData = [
  { name: "Paid", value: 812, color: "#10B981" },
  { name: "Partial", value: 276, color: "#F59E0B" },
  { name: "Overdue", value: 160, color: "#EF4444" },
];

const recentActivity = [
  { type: "fee", text: "Fee payment from Kofi Adu (JHS 3)", time: "2 min ago", status: "success" },
  { type: "report", text: "Term 1 reports sent to 248 parents via WhatsApp", time: "1 hr ago", status: "success" },
  { type: "alert", text: "6 students overdue on fees (>30 days)", time: "3 hrs ago", status: "warning" },
  { type: "attend", text: "Attendance marked for all 12 classes", time: "This morning", status: "success" },
];

const Dashboard = ({ onNavigate }) => {
  const { authSession } = useAuth();
  const [activeItem, setActiveItem] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [dashboardStats, setDashboardStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch(buildUrl('/api/school/dashboard'), { credentials: 'include' });
        if (!res.ok) throw new Error(await handleApiError(res));
        const json = await res.json();
        if (json.data) setDashboardStats(json.data);
      } catch (err) {
        console.error("Failed to fetch dashboard stats", err);
      } finally {
        setTimeout(() => setLoading(false), 800);
      }
    };
    fetchStats();
  }, []);

  const stats = [
    {
      label: "Total Students",
      value: dashboardStats?.totalStudents || "1,248",
      change: "+24 this term",
      positive: true,
      icon: Users,
      color: "#6366F1",
      path: "students",
    },
    {
      label: "Term Revenue",
      value: dashboardStats?.revenue ? `GHS ${dashboardStats.revenue}` : "GHS 186,400",
      change: "+18% vs last term",
      positive: true,
      icon: Wallet,
      color: "#10B981",
      path: "fees",
    },
    {
      label: "Avg Attendance",
      value: "91.4%",
      change: "-2.1% this week",
      positive: false,
      icon: Clock,
      color: "#F59E0B",
      path: "attendance",
    },
    {
      label: "Reports Sent",
      value: "2,340",
      change: "WhatsApp delivered",
      positive: true,
      icon: MessageSquare,
      color: "#25D366",
      path: "communication",
    },
  ];

  return (
    <div className="min-h-screen bg-bg-primary text-text-primary font-body">
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

      <main className="lg:ml-64 pt-16 p-6 sm:p-8 flex flex-col gap-6">
        {/* Metric Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((card) => (
            <motion.div
              key={card.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              onClick={() => onNavigate(card.path)}
              className="p-5 rounded-[24px] cursor-pointer hover:scale-[1.02] transition-all border"
              style={{
                background: "white",
                borderColor: "rgba(56,25,50,0.07)",
                boxShadow: "0 4px 24px rgba(56,25,50,0.06)",
              }}
            >
              <div className="flex items-start justify-between mb-4">
                <div
                  className="w-10 h-10 rounded-2xl flex items-center justify-center"
                  style={{ background: `${card.color}15` }}
                >
                  <card.icon size={18} color={card.color} />
                </div>
                <ChevronRight size={14} color={MUTED} />
              </div>
              <div
                style={{
                  fontFamily: "'JetBrains Mono', monospace",
                  color: PLUM,
                  fontSize: "clamp(1.1rem, 2.5vw, 1.4rem)",
                  fontWeight: 700,
                  lineHeight: 1.1,
                  marginBottom: "0.2rem",
                }}
              >
                {card.value}
              </div>
              <div style={{ color: MUTED, fontSize: "0.72rem", marginBottom: "0.3rem", fontWeight: 600 }}>
                {card.label}
              </div>
              <div
                className="flex items-center gap-1 text-[10px] font-bold"
                style={{ color: card.positive ? "#10B981" : "#EF4444" }}
              >
                {card.positive ? (
                  <TrendingUp size={11} />
                ) : (
                  <TrendingDown size={11} />
                )}
                {card.change}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Charts Row */}
        <div className="grid lg:grid-cols-3 gap-6">
          <div
            className="lg:col-span-2 p-6 rounded-[24px] border"
            style={{
              background: "white",
              borderColor: "rgba(56,25,50,0.07)",
              boxShadow: "0 4px 24px rgba(56,25,50,0.06)",
            }}
          >
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 style={{ fontFamily: "'Playfair Display', serif", color: PLUM, fontWeight: 800, fontSize: "1.05rem" }}>
                  Fee Collection
                </h3>
                <p style={{ color: MUTED, fontSize: "0.75rem", fontWeight: 600 }}>This academic year</p>
              </div>
              <button
                onClick={() => onNavigate("fees")}
                className="flex items-center gap-1 text-xs font-bold hover:opacity-70 transition-opacity"
                style={{ color: PLUM_LIGHT }}
              >
                View all <ArrowRight size={13} />
              </button>
            </div>
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={revenueData}>
                <defs>
                  <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={PLUM} stopOpacity={0.15} />
                    <stop offset="95%" stopColor={PLUM} stopOpacity={0.01} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(56,25,50,0.05)" vertical={false} />
                <XAxis
                  dataKey="month"
                  tick={{ fontSize: 10, fill: MUTED, fontWeight: 600 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 10, fill: MUTED, fontWeight: 600 }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v) => `${(v / 1000).toFixed(0)}K`}
                />
                <Tooltip
                  contentStyle={{
                    background: "white",
                    border: `1px solid rgba(56,25,50,0.1)`,
                    borderRadius: 12,
                    fontSize: 11,
                    fontWeight: 600
                  }}
                  formatter={(v) => [`GHS ${v.toLocaleString()}`, "Revenue"]}
                />
                <Area
                  type="monotone"
                  dataKey="amount"
                  stroke={PLUM}
                  strokeWidth={2.5}
                  fill="url(#revenueGrad)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div
            className="p-6 rounded-[24px] border"
            style={{
              background: "white",
              borderColor: "rgba(56,25,50,0.07)",
              boxShadow: "0 4px 24px rgba(56,25,50,0.06)",
            }}
          >
            <h3 style={{ fontFamily: "'Playfair Display', serif", color: PLUM, fontWeight: 800, fontSize: "1.05rem", marginBottom: "0.2rem" }}>
              Fee Status
            </h3>
            <p style={{ color: MUTED, fontSize: "0.75rem", fontWeight: 600, marginBottom: "1rem" }}>
              {dashboardStats?.totalStudents || "1,248"} students
            </p>

            <ResponsiveContainer width="100%" height={160}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={45}
                  outerRadius={65}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} strokeWidth={0} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    background: "white",
                    border: `1px solid rgba(56,25,50,0.1)`,
                    borderRadius: 8,
                    fontSize: 11,
                  }}
                />
              </PieChart>
            </ResponsiveContainer>

            <div className="space-y-2 mt-4">
              {pieData.map((d) => (
                <div key={d.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full" style={{ background: d.color }} />
                    <span style={{ color: MUTED, fontSize: "0.75rem", fontWeight: 600 }}>{d.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span style={{ fontFamily: "'JetBrains Mono', monospace", color: PLUM, fontSize: "0.8rem", fontWeight: 700 }}>
                      {d.value}
                    </span>
                    <span
                      className="px-1.5 py-0.5 rounded-full text-[9px] font-bold"
                      style={{ background: `${d.color}15`, color: d.color }}
                    >
                      {((d.value / 1248) * 100).toFixed(0)}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Row */}
        <div className="grid lg:grid-cols-3 gap-6">
          <div
            className="lg:col-span-2 p-6 rounded-[24px] border"
            style={{
              background: "white",
              borderColor: "rgba(56,25,50,0.07)",
              boxShadow: "0 4px 24px rgba(56,25,50,0.06)",
            }}
          >
            <h3 style={{ fontFamily: "'Playfair Display', serif", color: PLUM, fontWeight: 800, fontSize: "1.05rem", marginBottom: "1.5rem" }}>
              Recent Activity
            </h3>
            <div className="space-y-5">
              {recentActivity.map((item, i) => (
                <div key={i} className="flex items-start gap-4">
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                    style={{
                      background: item.status === "success" ? "#D1FAE5" : "#FEF3C7"
                    }}
                  >
                    {item.status === "success" ? (
                      <CheckCircle2 size={14} color="#10B981" />
                    ) : (
                      <AlertCircle size={14} color="#F59E0B" />
                    )}
                  </div>
                  <div className="flex-1">
                    <p style={{ color: PLUM_LIGHT, fontSize: "0.88rem", fontWeight: 600, lineHeight: 1.4 }}>
                      {item.text}
                    </p>
                    <p style={{ color: MUTED, fontSize: "0.72rem", fontWeight: 600, marginTop: "0.2rem" }}>
                      {item.time}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-6">
            <div
              className="p-6 rounded-[24px] border"
              style={{
                background: "white",
                borderColor: "rgba(56,25,50,0.07)",
                boxShadow: "0 4px 24px rgba(56,25,50,0.06)",
              }}
            >
              <h3 style={{ fontFamily: "'Playfair Display', serif", color: PLUM, fontWeight: 800, fontSize: "1.05rem", marginBottom: "1rem" }}>
                Quick Actions
              </h3>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { label: "Attendance", icon: Clock, color: "#6366F1", path: "attendance" },
                  { label: "Reminders", icon: Bell, color: "#F59E0B", path: "communication" },
                  { label: "Reports", icon: BookOpen, color: "#10B981", path: "results" },
                  { label: "Add Student", icon: Plus, color: "#EC4899", path: "students" },
                ].map((action) => (
                  <button
                    key={action.label}
                    onClick={() => onNavigate(action.path)}
                    className="p-3 rounded-2xl text-left hover:scale-[1.05] transition-transform active:scale-95"
                    style={{ background: `${action.color}10`, border: `1px solid ${action.color}20` }}
                  >
                    <action.icon size={16} color={action.color} className="mb-2" />
                    <p style={{ color: PLUM, fontSize: "0.75rem", fontWeight: 700, lineHeight: 1.2 }}>
                      {action.label}
                    </p>
                  </button>
                ))}
              </div>
            </div>

            <div
              className="p-6 rounded-[24px] flex-1 text-white relative overflow-hidden shadow-xl"
              style={{ background: `linear-gradient(135deg, ${PLUM} 0%, ${PLUM_LIGHT} 100%)` }}
            >
              <TrendingUp className="absolute -right-8 -bottom-8 w-32 h-32 opacity-10" />
              <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: "1.1rem", fontWeight: 800, marginBottom: "0.5rem" }}>
                Platform Health
              </h3>
              <p style={{ fontSize: "0.75rem", color: "rgba(255,243,230,0.7)", marginBottom: "1.5rem", fontWeight: 600 }}>
                All institutional nodes are currently synchronized and operational.
              </p>
              <button
                onClick={() => onNavigate('settings')}
                className="w-full py-3 rounded-full text-xs font-black transition-all active:scale-95 flex items-center justify-center gap-2"
                style={{ background: MILK, color: PLUM }}
              >
                System Status <ChevronRight size={12} />
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
