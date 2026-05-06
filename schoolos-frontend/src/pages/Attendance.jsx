import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ClipboardCheck, 
  Plus, 
  FileDown, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Activity, 
  ChevronLeft, 
  ChevronRight, 
  Calendar, 
  Search,
  X,
  TrendingUp,
  AlertCircle,
  Filter,
  Send,
  User,
  MoreVertical
} from 'lucide-react';
import Sidebar from '../components/layout/Sidebar';
import DashboardNavbar from '../components/layout/DashboardNavbar';
import { Button } from '../components/ui/Button';
import { buildUrl } from '../services/api';

const PLUM = "#381932";
const PLUM_LIGHT = "#512b4a";
const MILK = "#FFF3E6";
const MUTED = "#7D6077";

const Attendance = ({ onNavigate }) => {
  const [activeItem, setActiveItem] = useState('attendance');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMarkModalOpen, setIsMarkModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [records, setRecords] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  const stats = [
    { label: 'Present Today', value: '812', icon: CheckCircle2, color: '#10B981', sub: '+12 vs yesterday' },
    { label: 'Absent Today', value: '35', icon: XCircle, color: '#EF4444', sub: '-3 vs yesterday' },
    { label: 'Late Entries', value: '12', icon: Clock, color: '#F59E0B', sub: 'Stable' },
    { label: 'Avg. Rate', value: '96.4%', icon: Activity, color: '#6366F1', sub: 'Top 5% region' },
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
        {/* KPI Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((s) => (
            <div
              key={s.label}
              className="p-5 rounded-[24px] border"
              style={{
                background: "white",
                borderColor: "rgba(56,25,50,0.07)",
                boxShadow: "0 4px 24px rgba(56,25,50,0.06)",
              }}
            >
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center mb-3"
                style={{ background: `${s.color}15` }}
              >
                <s.icon size={16} color={s.color} />
              </div>
              <div
                style={{
                  fontFamily: "'JetBrains Mono', monospace",
                  color: PLUM,
                  fontSize: "1.4rem",
                  fontWeight: 700,
                }}
              >
                {s.value}
              </div>
              <div style={{ color: MUTED, fontSize: "0.75rem", fontWeight: 600 }}>{s.label}</div>
              <div style={{ color: s.color, fontSize: "0.65rem", marginTop: "0.2rem", fontWeight: 700 }}>{s.sub}</div>
            </div>
          ))}
        </div>

        {/* Main Content Hub */}
        <div className="grid lg:grid-cols-3 gap-6">
           {/* Attendance Feed */}
           <div
            className="lg:col-span-2 rounded-[32px] p-8 border flex flex-col gap-6"
            style={{
              background: "white",
              borderColor: "rgba(56,25,50,0.07)",
              boxShadow: "0 4px 24px rgba(56,25,50,0.06)",
            }}
          >
             <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                   <h3 style={{ fontFamily: "'Playfair Display', serif", color: PLUM, fontWeight: 800, fontSize: "1.1rem" }}>Daily Presence Roll</h3>
                   <p style={{ color: MUTED, fontSize: "0.75rem", fontWeight: 600 }}>Monitoring attendance across all institutional nodes</p>
                </div>
                <div className="flex gap-2">
                   <div className="flex items-center gap-2 bg-slate-50 border rounded-xl px-3 py-2 shadow-sm">
                      <button className="hover:opacity-60 transition-opacity"><ChevronLeft size={14} color={PLUM} /></button>
                      <span style={{ color: PLUM, fontSize: "0.7rem", fontWeight: 800 }}>May 1, 2026</span>
                      <button className="hover:opacity-60 transition-opacity"><ChevronRight size={14} color={PLUM} /></button>
                   </div>
                   <button onClick={() => setIsMarkModalOpen(true)} className="flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest bg-plum text-milk shadow-lg shadow-plum/20">
                      <Plus size={14} /> Mark Roll
                   </button>
                </div>
             </div>

             <div className="overflow-x-auto">
                <table className="w-full text-left">
                   <thead>
                      <tr style={{ borderBottom: `1px solid rgba(56,25,50,0.06)`, background: "rgba(56,25,50,0.02)" }}>
                         {["Student", "Section", "Status", "Check-in", "Marked By"].map(h => (
                           <th key={h} className="px-6 py-4 text-[10px] font-black uppercase tracking-widest" style={{ color: MUTED }}>{h}</th>
                         ))}
                      </tr>
                   </thead>
                   <tbody>
                      {[1,2,3,4,5].map(i => (
                         <tr key={i} className="hover:bg-bg-primary/30 transition-colors border-b last:border-0" style={{ borderColor: "rgba(56,25,50,0.04)" }}>
                            <td className="px-6 py-4">
                               <div className="flex items-center gap-3">
                                  <div className="w-8 h-8 rounded-full flex items-center justify-center bg-slate-100 text-[10px] font-black text-plum">S{i}</div>
                                  <span style={{ color: PLUM, fontSize: "0.85rem", fontWeight: 700 }}>Student Name {i}</span>
                               </div>
                            </td>
                            <td className="px-6 py-4">
                               <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-tighter" style={{ background: `rgba(56,25,50,0.07)`, color: PLUM_LIGHT }}>JHS 3A</span>
                            </td>
                            <td className="px-6 py-4">
                               <div className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-black uppercase`} style={i === 4 ? { background: '#FEE2E2', color: '#991B1B' } : { background: '#D1FAE5', color: '#065F46' }}>
                                  {i === 4 ? 'Absent' : 'Present'}
                               </div>
                            </td>
                            <td className="px-6 py-4">
                               <span style={{ fontFamily: "'JetBrains Mono', monospace", color: MUTED, fontSize: "0.75rem", fontWeight: 600 }}>07:{30+i} AM</span>
                            </td>
                            <td className="px-6 py-4">
                               <span style={{ color: MUTED, fontSize: "0.75rem", fontWeight: 600 }}>Mrs. Mensah</span>
                            </td>
                         </tr>
                      ))}
                   </tbody>
                </table>
             </div>
          </div>

          {/* Side Alerts */}
          <div className="flex flex-col gap-6">
             <div className="rounded-[32px] p-8 bg-rose-50 border border-rose-100 flex flex-col gap-4 relative overflow-hidden group">
                <AlertCircle className="absolute -right-6 -bottom-6 w-32 h-32 text-rose-500/10 group-hover:scale-110 transition-transform duration-700" />
                <h3 style={{ fontFamily: "'Playfair Display', serif", color: "#991B1B", fontSize: "1.1rem", fontWeight: 800 }}>Unnotified Absences</h3>
                <p style={{ color: "#B91C1C", fontSize: "0.75rem", fontWeight: 600, lineHeight: 1.5 }}>There are 2 students absent today without parental notification. Immediate action required.</p>
                <button className="w-full py-3 rounded-2xl bg-rose-500 text-white text-[10px] font-black uppercase tracking-widest shadow-lg shadow-rose-500/20 hover:scale-105 transition-all flex items-center justify-center gap-2">
                   <Send size={14} /> Send SMS Alerts
                </button>
             </div>

             <div className="flex-1 rounded-[32px] p-8 border" style={{ background: "white", borderColor: "rgba(56,25,50,0.07)" }}>
                <h3 style={{ fontFamily: "'Playfair Display', serif", color: PLUM, fontWeight: 800, fontSize: "1rem", marginBottom: "1.2rem" }}>Class Pulse</h3>
                <div className="space-y-4">
                   {[
                      { name: "Form 1A", rate: 98, color: "#10B981" },
                      { name: "Form 1B", rate: 94, color: "#10B981" },
                      { name: "Form 2A", rate: 82, color: "#F59E0B" },
                      { name: "Form 2B", rate: 91, color: "#10B981" },
                   ].map((c, i) => (
                      <div key={i} className="space-y-1.5">
                         <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest" style={{ color: MUTED }}>
                            <span>{c.name}</span>
                            <span>{c.rate}%</span>
                         </div>
                         <div className="h-1.5 w-full bg-slate-50 rounded-full overflow-hidden">
                            <div className="h-full rounded-full transition-all duration-1000" style={{ width: `${c.rate}%`, background: c.color }} />
                         </div>
                      </div>
                   ))}
                </div>
             </div>
          </div>
        </div>
      </main>

      {/* Mark Attendance Modal */}
      <AnimatePresence>
        {isMarkModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsMarkModalOpen(false)} className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="w-full max-w-lg bg-white rounded-[40px] shadow-2xl relative z-10 overflow-hidden border">
              <div className="p-8 pb-4 flex justify-between items-center">
                <div>
                  <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "1.5rem", fontWeight: 800, color: PLUM }}>Mark Presence</h2>
                  <p style={{ color: MUTED, fontSize: "0.75rem", fontWeight: 600 }}>Daily Roll Management</p>
                </div>
                <button onClick={() => setIsMarkModalOpen(false)} className="w-10 h-10 rounded-full hover:bg-slate-50 flex items-center justify-center"><X size={20} color={MUTED} /></button>
              </div>
              <div className="p-8 pt-4 space-y-4">
                 <div className="flex gap-4">
                    <div className="flex-1">
                       <label className="text-[10px] font-black uppercase tracking-widest mb-1.5 block ml-1" style={{ color: MUTED }}>Select Class</label>
                       <select className="w-full bg-slate-50 border rounded-xl px-4 py-3 text-xs font-bold outline-none focus:border-plum/30 transition-all cursor-pointer" style={{ color: PLUM }}>
                          <option>Form 1A</option>
                       </select>
                    </div>
                    <div className="flex-1">
                       <label className="text-[10px] font-black uppercase tracking-widest mb-1.5 block ml-1" style={{ color: MUTED }}>Date</label>
                       <input type="date" defaultValue={new Date().toISOString().split('T')[0]} className="w-full bg-slate-50 border rounded-xl px-4 py-3 text-xs font-bold outline-none focus:border-plum/30 transition-all" style={{ color: PLUM }} />
                    </div>
                 </div>
                 <div className="max-h-[300px] overflow-y-auto pr-2 space-y-2">
                    {[1,2,3,4,5].map(i => (
                       <div key={i} className="flex items-center justify-between p-3 rounded-2xl bg-bg-primary/30 border border-transparent hover:border-plum/10 transition-all">
                          <span style={{ color: PLUM, fontSize: "0.8rem", fontWeight: 700 }}>Student Full Name {i}</span>
                          <div className="flex gap-1">
                             {['P', 'A', 'L'].map(l => (
                                <button key={l} className={`w-8 h-8 rounded-lg flex items-center justify-center text-[10px] font-black transition-all ${l === 'P' ? 'bg-plum text-milk shadow-md' : 'bg-white border text-slate-400'}`}>
                                   {l}
                                </button>
                             ))}
                          </div>
                       </div>
                    ))}
                 </div>
              </div>
              <div className="p-8 bg-slate-50 flex gap-3">
                <Button className="flex-1 py-4 rounded-2xl text-xs font-black uppercase tracking-widest" onClick={() => setIsMarkModalOpen(false)}>Sync Roll</Button>
                <Button variant="secondary" className="flex-1 py-4 rounded-2xl text-xs font-black uppercase tracking-widest border-slate-200" onClick={() => setIsMarkModalOpen(false)}>Discard</Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Attendance;
