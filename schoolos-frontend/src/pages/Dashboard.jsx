import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { 
  Users, 
  Wallet, 
  Clock, 
  TrendingUp, 
  TrendingDown, 
  MessageSquare, 
  CheckCircle2, 
  AlertCircle, 
  ChevronRight, 
  Star,
  Zap,
  LayoutGrid,
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
import { buildUrl } from '../services/api';

const Dashboard = React.memo(({ onNavigate }) => {
  const { authSession } = useAuth();
  const { isDarkMode } = useTheme();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch(buildUrl('/api/school/dashboard'), { credentials: 'include' });
        const json = await res.json();
        if (json.data) setStats(json.data);
      } catch (err) {
        console.error("Dashboard fetch error", err);
      } finally {
        setTimeout(() => setLoading(false), 800);
      }
    };
    fetchStats();
  }, []);

  const revenueData = useMemo(() => [
    { month: "Sep", amount: 42000 },
    { month: "Oct", amount: 58000 },
    { month: "Nov", amount: 49000 },
    { month: "Dec", amount: 63000 },
    { month: "Jan", amount: 71000 },
    { month: "Feb", amount: 86000 },
    { month: "Mar", amount: 94000 },
  ], []);

  const pieData = useMemo(() => [
    { name: "Paid", value: 812, color: "#10B981" },
    { name: "Partial", value: 276, color: "#F59E0B" },
    { name: "Overdue", value: 160, color: "#EF4444" },
  ], []);

  const recentActivity = useMemo(() => [
    { type: "fee", text: "Fee payment from Kofi Adu (JHS 3)", time: "2 min ago", status: "success" },
    { type: "report", text: "Term 1 reports sent to 248 parents via WhatsApp", time: "1 hr ago", status: "success" },
    { type: "alert", text: "6 students overdue on fees (>30 days)", time: "3 hrs ago", status: "warning" },
    { type: "attend", text: "Attendance marked for all 12 classes", time: "This morning", status: "success" },
  ], []);

  const topStudents = useMemo(() => [
    { id: "GH-24-001", name: "Ama Owusu", class: "JHS 3A", avg: 96.4, trend: "up" },
    { id: "GH-24-012", name: "Kwesi Boateng", class: "JHS 2B", avg: 94.1, trend: "up" },
    { id: "GH-24-034", name: "Efua Mensah", class: "JHS 3A", avg: 91.7, trend: "down" },
    { id: "GH-24-047", name: "Yaw Darko", class: "JHS 1C", avg: 90.2, trend: "up" },
  ], []);

  const metrics = useMemo(() => [
    { label: "Total Students", value: stats?.totalStudents || "1,248", change: "+24 this term", positive: true, icon: Users, color: "#6366F1", path: "students" },
    { label: "Term Revenue", value: stats?.revenue ? `₵${stats.revenue.toLocaleString()}` : "₵186,400", change: "+18.2%", positive: true, icon: Wallet, color: "#10B981", path: "fees" },
    { label: "Avg Attendance", value: "91.4%", change: "-2.1% week", positive: false, icon: Clock, color: "#F59E0B", path: "attendance" },
    { label: "Reports Sent", value: "2,340", change: "WhatsApp Live", positive: true, icon: MessageSquare, color: "#25D366", path: "communication" },
  ], [stats]);

  const handleNavigate = useCallback((path) => {
    onNavigate(path);
  }, [onNavigate]);

  return (
    <div className="p-6 sm:p-8 flex flex-col gap-6">
      {/* Welcome Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
         <div>
            <h1 style={{ fontFamily: "'Playfair Display', serif", color: "var(--text-primary)", fontSize: "1.8rem", fontWeight: 800 }}>Command Center</h1>
            <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", fontWeight: 600 }}>Welcome back, <span className="underline decoration-plum/20 underline-offset-4" style={{ color: "var(--text-primary)" }}>{authSession?.user?.name || 'Administrator'}</span></p>
         </div>
         <div className="flex gap-2">
            <button 
               className="p-2.5 rounded-xl border shadow-sm hover:bg-black/5 transition-colors" 
               title="Notifications" 
               aria-label="Notifications"
               style={{ background: "var(--card-bg)", borderColor: "var(--border)" }}
            >
               <Bell size={18} style={{ color: "var(--text-primary)" }} />
            </button>
            <button className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest shadow-lg shadow-plum/20 hover:scale-105 active:scale-95 transition-all bg-plum text-milk">
               <Zap size={14} /> Global Action
            </button>
         </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((card) => (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            onClick={() => handleNavigate(card.path)}
            className="p-5 rounded-[24px] cursor-pointer hover:shadow-xl transition-all border group relative overflow-hidden"
            style={{
              background: "var(--card-bg)",
              borderColor: "var(--border)",
              boxShadow: "var(--shadow-card)",
            }}
          >
            <div className="absolute top-0 right-0 w-16 h-16 bg-black/[0.02] rounded-bl-full -mr-8 -mt-8 group-hover:scale-125 transition-transform duration-500" />
            <div className="flex items-start justify-between mb-4 relative z-10">
              <div className="w-10 h-10 rounded-2xl flex items-center justify-center" style={{ background: `${card.color}15` }}>
                <card.icon size={18} color={card.color} />
              </div>
              <ChevronRight size={14} style={{ color: "var(--text-muted)" }} className="group-hover:translate-x-1 transition-transform" />
            </div>
            <div style={{ fontFamily: "'JetBrains Mono', monospace", color: "var(--text-primary)", fontSize: "1.4rem", fontWeight: 800, lineHeight: 1.1, marginBottom: "0.2rem" }} className="relative z-10">
              {card.value}
            </div>
            <div style={{ color: "var(--text-muted)", fontSize: "0.72rem", marginBottom: "0.4rem", fontWeight: 700 }} className="relative z-10 uppercase tracking-widest">
              {card.label}
            </div>
            <div className="flex items-center gap-1.5 text-[10px] font-black relative z-10" style={{ color: card.positive ? "#10B981" : "#EF4444" }}>
              {card.positive ? <TrendingUp size={11} strokeWidth={3} /> : <TrendingDown size={11} strokeWidth={3} />}
              {card.change}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Middle Row: Chart & Status */}
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 p-8 rounded-[32px] border" style={{ background: "var(--card-bg)", borderColor: "var(--border)", boxShadow: "var(--shadow-card)" }}>
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 style={{ fontFamily: "'Playfair Display', serif", color: "var(--text-primary)", fontWeight: 800, fontSize: "1.1rem" }}>Fee Collection Flow</h3>
              <p style={{ color: "var(--text-muted)", fontSize: "0.75rem", fontWeight: 600 }}>Monthly revenue intake vs projected</p>
            </div>
            <div className="flex gap-2">
               <button onClick={() => onNavigate("fees")} className="px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border hover:bg-black/5 transition-colors" style={{ color: "var(--text-primary)", borderColor: "var(--border)" }}>Ledger Details</button>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={revenueData}>
              <defs>
                <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={isDarkMode ? "var(--text-primary)" : "#381932"} stopOpacity={0.2} />
                  <stop offset="95%" stopColor={isDarkMode ? "var(--text-primary)" : "#381932"} stopOpacity={0.01} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 10, fill: "var(--text-muted)", fontWeight: 700 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: "var(--text-muted)", fontWeight: 700 }} axisLine={false} tickLine={false} tickFormatter={(v) => `${(v / 1000).toFixed(0)}K`} />
              <Tooltip
                contentStyle={{ background: "var(--card-bg)", border: `1px solid var(--border)`, borderRadius: 16, fontSize: 11, fontWeight: 700, boxShadow: "var(--shadow-card)", color: "var(--text-primary)" }}
                formatter={(v) => [`₵${v.toLocaleString()}`, "Revenue"]}
              />
              <Area type="monotone" dataKey="amount" stroke={isDarkMode ? "var(--text-primary)" : "#381932"} strokeWidth={3} fill="url(#revenueGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="p-8 rounded-[32px] border flex flex-col" style={{ background: "var(--card-bg)", borderColor: "var(--border)", boxShadow: "var(--shadow-card)" }}>
          <h3 style={{ fontFamily: "'Playfair Display', serif", color: "var(--text-primary)", fontWeight: 800, fontSize: "1.1rem", marginBottom: "1.5rem" }}>Financial Status</h3>
          <div className="flex-1 flex items-center justify-center relative">
             <ResponsiveContainer width="100%" height={180}>
               <PieChart>
                 <Pie data={pieData} cx="50%" cy="50%" innerRadius={55} outerRadius={75} paddingAngle={8} dataKey="value">
                   {pieData.map((entry, index) => (
                     <Cell key={`cell-${index}`} fill={entry.color} strokeWidth={0} />
                   ))}
                 </Pie>
                 <Tooltip />
               </PieChart>
             </ResponsiveContainer>
             <div className="absolute flex flex-col items-center">
                <span style={{ color: "var(--text-primary)", fontSize: "1.2rem", fontWeight: 800 }}>812</span>
                <span style={{ color: "var(--text-muted)", fontSize: "0.6rem", fontWeight: 800, textTransform: "uppercase" }}>Paid</span>
             </div>
          </div>
          <div className="space-y-3 mt-4">
             {pieData.map(d => (
               <div key={d.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                     <div className="w-2 h-2 rounded-full" style={{ background: d.color }} />
                     <span style={{ color: "var(--text-muted)", fontSize: "0.75rem", fontWeight: 700 }}>{d.name}</span>
                  </div>
                  <span style={{ fontFamily: "'JetBrains Mono', monospace", color: "var(--text-primary)", fontSize: "0.8rem", fontWeight: 800 }}>{d.value}</span>
               </div>
             ))}
          </div>
        </div>
      </div>

      {/* Bottom Row: Activity & Performers */}
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 p-8 rounded-[32px] border" style={{ background: "var(--card-bg)", borderColor: "var(--border)", boxShadow: "var(--shadow-card)" }}>
          <h3 style={{ fontFamily: "'Playfair Display', serif", color: "var(--text-primary)", fontWeight: 800, fontSize: "1.1rem", marginBottom: "1.5rem" }}>System Feed</h3>
          <div className="space-y-6">
            {recentActivity.map((item, i) => (
              <div key={i} className="flex items-start gap-4 group cursor-pointer">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-transform group-hover:rotate-12" style={{ background: item.status === "success" ? "#D1FAE5" : "#FEF3C7" }}>
                  {item.status === "success" ? <CheckCircle2 size={18} color="#10B981" /> : <AlertCircle size={18} color="#F59E0B" />}
                </div>
                <div className="flex-1 border-b pb-4" style={{ borderColor: "var(--border)" }}>
                  <p style={{ color: "var(--text-primary)", fontSize: "0.9rem", fontWeight: 700, lineHeight: 1.4 }}>{item.text}</p>
                  <div className="flex items-center gap-2 mt-1">
                     <span style={{ color: "var(--text-muted)", fontSize: "0.72rem", fontWeight: 700 }}>{item.time}</span>
                     <span className="w-1 h-1 rounded-full bg-slate-200" />
                     <span style={{ color: "var(--text-muted)", fontSize: "0.72rem", fontWeight: 700, textTransform: "capitalize" }}>{item.type}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-6">
           <div className="p-8 rounded-[32px] shadow-xl relative overflow-hidden bg-plum" style={{ boxShadow: "var(--shadow-glow)" }}>
              <Star className="absolute -right-6 -top-6 w-32 h-32 opacity-10 rotate-12 text-milk" />
              <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: "1.2rem", fontWeight: 800, marginBottom: "1.2rem", color: "var(--bg-primary)" }}>Top Performers</h3>
              <div className="space-y-4">
                 {topStudents.map((s, i) => (
                   <div key={s.id} className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full flex items-center justify-center font-black text-xs" style={{ background: i === 0 ? "#F59E0B" : "rgba(255,243,230,0.15)", color: "var(--bg-primary)" }}>
                         {i + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                         <p className="text-sm font-bold truncate" style={{ color: "var(--bg-primary)" }}>{s.name}</p>
                         <p className="text-[10px] font-bold opacity-60" style={{ color: "var(--bg-primary)" }}>{s.class} · {s.id}</p>
                      </div>
                      <div style={{ fontFamily: "'JetBrains Mono', monospace", fontWeight: 800, fontSize: "0.95rem", color: "var(--bg-primary)" }}>{s.avg}%</div>
                   </div>
                 ))}
              </div>
              <button onClick={() => onNavigate('results')} className="mt-6 w-full py-3 rounded-2xl bg-milk text-plum text-[10px] font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all">View Full Ranking</button>
           </div>

           <div className="p-8 rounded-[32px] border flex flex-col gap-4" style={{ background: "var(--card-bg)", borderColor: "var(--border)" }}>
              <h3 style={{ fontFamily: "'Playfair Display', serif", color: "var(--text-primary)", fontWeight: 800, fontSize: "1rem" }}>Quick Hub</h3>
              <div className="grid grid-cols-2 gap-2">
                 {[
                   { label: "Add Student", icon: Plus, color: "#EC4899", path: "students" },
                   { label: "Timetable", icon: LayoutGrid, color: "#6366F1", path: "timetable" },
                   { label: "Payroll", icon: Wallet, color: "#10B981", path: "payroll" },
                   { label: "Messages", icon: MessageSquare, color: "#25D366", path: "communication" },
                 ].map(act => (
                   <button key={act.label} onClick={() => onNavigate(act.path)} className="p-3 rounded-2xl flex flex-col items-center gap-2 transition-all hover:bg-black/5" style={{ background: `${act.color}08`, border: `1px solid ${act.color}15` }}>
                      <act.icon size={16} color={act.color} />
                      <span style={{ color: "var(--text-primary)", fontSize: "0.7rem", fontWeight: 800, textTransform: "uppercase" }}>{act.label.split(' ')[1] || act.label}</span>
                   </button>
                 ))}
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
