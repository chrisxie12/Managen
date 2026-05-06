import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { 
  User, 
  GraduationCap, 
  Wallet, 
  Clock, 
  TrendingUp, 
  MessageSquare, 
  CheckCircle2, 
  AlertCircle, 
  ChevronRight,
  Zap,
  Bell,
  Smartphone,
  Calendar,
  FileText
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Button } from '../components/ui/Button';

const ParentDashboard = ({ onNavigate }) => {
  const [selectedChild, setSelectedChild] = useState(0);
  
  const children = [
    { name: "Kofi Owusu", class: "JHS 3A", id: "AR-2024-042", status: "In School", avatar: "KO" },
    { name: "Ama Owusu", class: "Class 4B", id: "AR-2024-115", status: "In School", avatar: "AO" }
  ];

  const academicData = [
    { subject: "Math", score: 88 },
    { subject: "Science", score: 92 },
    { subject: "English", score: 85 },
    { subject: "Social", score: 78 },
    { subject: "ICT", score: 95 },
  ];

  const recentGrades = [
    { subject: "Mathematics", assessment: "Mid-Term Test", score: 92, date: "2 days ago" },
    { subject: "Integrated Science", assessment: "Weekly Quiz", score: 88, date: "Yesterday" },
  ];

  return (
    <div className="p-6 sm:p-8 flex flex-col gap-8 min-h-screen" style={{ background: "#FDFCFB" }}>
      {/* Parent Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
           <div className="flex items-center gap-2 mb-1">
              <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-600 text-[10px] font-black uppercase tracking-widest border border-emerald-100">Parent Portal Live</span>
           </div>
           <h1 style={{ fontFamily: "'Playfair Display', serif", color: "#381932", fontSize: "2rem", fontWeight: 800 }}>Parent Station</h1>
           <p className="text-slate-500 font-semibold">Welcome back. Monitoring the growth of <span className="text-plum font-bold">{children.length} scholars</span>.</p>
        </div>
        
        <div className="flex gap-3">
           {children.map((child, i) => (
              <button 
                 key={i}
                 onClick={() => setSelectedRole(i)}
                 className={`flex items-center gap-3 px-4 py-3 rounded-2xl border transition-all ${selectedChild === i ? 'bg-plum text-milk border-plum shadow-xl shadow-plum/20 scale-105' : 'bg-white border-slate-100 text-slate-500 hover:border-plum/20'}`}
              >
                 <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-black text-xs">{child.avatar}</div>
                 <div className="text-left">
                    <div className="text-xs font-black leading-none mb-1">{child.name}</div>
                    <div className="text-[10px] font-bold opacity-60 leading-none">{child.class}</div>
                 </div>
              </button>
           ))}
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Main Stats Column */}
        <div className="lg:col-span-2 space-y-8">
           {/* Child Pulse Metrics */}
           <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                 { label: 'Attendance', value: '96%', sub: 'Always Punctual', icon: Clock, color: 'emerald' },
                 { label: 'Academic Avg', value: '89.4%', sub: 'Top 5% in Class', icon: GraduationCap, color: 'indigo' },
                 { label: 'Behavour', value: 'Excellent', sub: 'Gold Star Badge', icon: Zap, color: 'amber' },
              ].map((m, i) => (
                 <div key={i} className="p-6 rounded-[32px] bg-white border border-slate-100 shadow-sm group hover:shadow-xl transition-all">
                    <div className={`w-10 h-10 rounded-xl bg-${m.color}-50 text-${m.color}-500 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                       <m.icon size={20} />
                    </div>
                    <div className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">{m.label}</div>
                    <div className="text-2xl font-black text-slate-800 tracking-tighter leading-none mb-2">{m.value}</div>
                    <div className="text-[10px] font-bold text-slate-500">{m.sub}</div>
                 </div>
              ))}
           </div>

           {/* Academic Trends */}
           <div className="p-8 rounded-[40px] bg-white border border-slate-100 shadow-sm relative overflow-hidden">
              <div className="flex justify-between items-center mb-8 relative z-10">
                 <div>
                    <h3 className="text-lg font-black text-slate-800 tracking-tight">Academic Pulse</h3>
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Term-over-term progression</p>
                 </div>
                 <div className="flex gap-2">
                    <button className="px-4 py-2 rounded-xl bg-slate-50 text-[10px] font-black uppercase tracking-widest text-slate-500">View Transcript</button>
                 </div>
              </div>
              <div className="h-[300px] w-full">
                 <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={[
                       { name: 'Week 1', score: 75 },
                       { name: 'Week 2', score: 82 },
                       { name: 'Week 3', score: 78 },
                       { name: 'Week 4', score: 88 },
                       { name: 'Week 5', score: 92 },
                       { name: 'Week 6', score: 89 },
                    ]}>
                       <defs>
                          <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                             <stop offset="5%" stopColor="#6366F1" stopOpacity={0.1}/>
                             <stop offset="95%" stopColor="#6366F1" stopOpacity={0}/>
                          </linearGradient>
                       </defs>
                       <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                       <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700, fill: '#94A3B8' }} />
                       <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700, fill: '#94A3B8' }} />
                       <Tooltip contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                       <Area type="monotone" dataKey="score" stroke="#6366F1" strokeWidth={4} fillOpacity={1} fill="url(#colorScore)" />
                    </AreaChart>
                 </ResponsiveContainer>
              </div>
           </div>

           {/* Recent Results Table */}
           <div className="p-8 rounded-[40px] bg-white border border-slate-100 shadow-sm">
              <h3 className="text-lg font-black text-slate-800 tracking-tight mb-6">Recent Assessments</h3>
              <div className="space-y-4">
                 {recentGrades.map((grade, i) => (
                    <div key={i} className="flex items-center justify-between p-5 rounded-3xl bg-slate-50 border border-slate-100 group hover:border-plum/20 transition-all cursor-pointer">
                       <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center text-plum shadow-sm group-hover:scale-110 transition-transform">
                             <FileText size={22} />
                          </div>
                          <div>
                             <div className="text-sm font-black text-slate-800">{grade.subject}</div>
                             <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">{grade.assessment}</div>
                          </div>
                       </div>
                       <div className="text-right">
                          <div className="text-xl font-black text-plum tracking-tighter">{grade.score}%</div>
                          <div className="text-[10px] font-bold text-slate-400">{grade.date}</div>
                       </div>
                    </div>
                 ))}
              </div>
           </div>
        </div>

        {/* Right Sidebar: Fees & Comm */}
        <div className="space-y-8">
           {/* Fee Node - THE MOAT */}
           <div className="p-8 rounded-[40px] bg-indigo-600 text-white shadow-2xl shadow-indigo-100 relative overflow-hidden group">
              <div className="relative z-10">
                 <div className="flex justify-between items-start mb-8">
                    <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center backdrop-blur-md">
                       <Wallet size={24} />
                    </div>
                    <span className="px-3 py-1 rounded-full bg-white/10 text-[10px] font-black uppercase tracking-widest">Term 2 Dues</span>
                 </div>
                 
                 <div className="mb-8">
                    <div className="text-[10px] font-black uppercase tracking-widest opacity-60 mb-1">Outstanding Balance</div>
                    <div className="text-4xl font-black tracking-tighter">₵1,450.00</div>
                    <p className="text-[10px] font-bold opacity-40 mt-1 italic">Due: April 15, 2026</p>
                 </div>

                 <div className="space-y-3">
                    <button className="w-full h-14 rounded-2xl bg-milk text-indigo-600 font-black text-xs uppercase tracking-widest shadow-xl flex items-center justify-center gap-3 hover:scale-105 active:scale-95 transition-all">
                       <Smartphone size={18} /> Pay with MoMo
                    </button>
                    <button className="w-full py-4 rounded-2xl bg-white/10 text-white font-black text-[10px] uppercase tracking-widest hover:bg-white/20 transition-all">
                       View Payment History
                    </button>
                 </div>
              </div>
              <Smartphone className="absolute -right-10 -bottom-10 w-48 h-48 opacity-10 rotate-12 group-hover:scale-110 transition-transform duration-1000" />
           </div>

           {/* School Feed */}
           <div className="p-8 rounded-[40px] bg-white border border-slate-100 shadow-sm space-y-8">
              <div className="flex justify-between items-center">
                 <h3 className="text-sm font-black text-slate-800 tracking-tight">School Feed</h3>
                 <Bell size={18} className="text-slate-300" />
              </div>
              <div className="space-y-6">
                 {[
                    { from: 'Headmaster', text: 'Important: PTA Meeting this Saturday at 10AM in the assembly hall.', time: '2h ago', icon: GraduationCap },
                    { from: 'Accounts', text: 'Mid-term receipts for Ama Owusu have been generated.', time: '1d ago', icon: Wallet },
                    { from: 'Admin', text: 'School re-opening dates for next term published.', time: '3d ago', icon: Calendar },
                 ].map((post, i) => (
                    <div key={i} className="flex gap-4 group cursor-pointer">
                       <div className="w-10 h-10 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-plum group-hover:text-milk transition-all">
                          <post.icon size={18} />
                       </div>
                       <div className="flex-1">
                          <div className="flex justify-between items-center mb-1">
                             <span className="text-[10px] font-black uppercase tracking-widest text-plum">{post.from}</span>
                             <span className="text-[9px] font-bold text-slate-300">{post.time}</span>
                          </div>
                          <p className="text-[11px] font-bold text-slate-600 leading-relaxed">{post.text}</p>
                       </div>
                    </div>
                 ))}
              </div>
              <Button variant="secondary" className="w-full h-12 rounded-2xl text-[10px] font-black uppercase tracking-widest border-2">
                 Chat with School Office
              </Button>
           </div>
        </div>
      </div>
    </div>
  );
};

export default ParentDashboard;
