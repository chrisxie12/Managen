import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Activity, 
  ChevronLeft, 
  ChevronRight, 
  Plus,
  X,
  AlertCircle,
  Send
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { useToast } from '../contexts/ToastContext';

const Attendance = () => {
  const [isMarkModalOpen, setIsMarkModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();
  const [attendanceState, setAttendanceState] = useState({});

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
    <div className="p-6 sm:p-8 flex flex-col gap-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => (
          <div
            key={s.label}
            className="p-5 rounded-[24px] border"
            style={{
              background: "var(--card-bg)",
              borderColor: "var(--border)",
              boxShadow: "var(--shadow-card)",
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
                color: "var(--text-primary)",
                fontSize: "1.4rem",
                fontWeight: 700,
              }}
            >
              {s.value}
            </div>
            <div style={{ color: "var(--text-muted)", fontSize: "0.75rem", fontWeight: 600 }}>{s.label}</div>
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
            background: "var(--card-bg)",
            borderColor: "var(--border)",
            boxShadow: "var(--shadow-card)",
          }}
        >
           <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                 <h3 style={{ fontFamily: "'Playfair Display', serif", color: "var(--text-primary)", fontWeight: 800, fontSize: "1.1rem" }}>Daily Presence Roll</h3>
                 <p style={{ color: "var(--text-muted)", fontSize: "0.75rem", fontWeight: 600 }}>Monitoring attendance across all institutional nodes</p>
              </div>
              <div className="flex gap-2">
                 <div className="flex items-center gap-2 border rounded-xl px-3 py-2 shadow-sm" style={{ background: "var(--bg-secondary)", borderColor: "var(--border)" }}>
                    <button className="hover:opacity-60 transition-opacity"><ChevronLeft size={14} style={{ color: "var(--text-primary)" }} /></button>
                    <span style={{ color: "var(--text-primary)", fontSize: "0.7rem", fontWeight: 800 }}>May 1, 2026</span>
                    <button className="hover:opacity-60 transition-opacity"><ChevronRight size={14} style={{ color: "var(--text-primary)" }} /></button>
                 </div>
                 <button onClick={() => setIsMarkModalOpen(true)} className="flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest bg-plum text-milk shadow-lg shadow-plum/20">
                    <Plus size={14} /> Mark Roll
                 </button>
              </div>
           </div>

           <div className="overflow-x-auto">
              <table className="w-full text-left">
                 <thead>
                    <tr style={{ borderBottom: `1px solid var(--border)`, background: "var(--bg-secondary)" }}>
                       {["Student", "Section", "Status", "Check-in", "Marked By"].map(h => (
                         <th key={h} className="px-6 py-4 text-[10px] font-black uppercase tracking-widest" style={{ color: "var(--text-muted)" }}>{h}</th>
                       ))}
                    </tr>
                 </thead>
                 <tbody>
                    {[1,2,3,4,5].map(i => (
                       <tr key={i} className="hover:bg-black/[0.02] transition-colors border-b last:border-0" style={{ borderColor: "var(--border)" }}>
                          <td className="px-6 py-4">
                             <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full flex items-center justify-center bg-plum/5 text-[10px] font-black text-plum">S{i}</div>
                                <span style={{ color: "var(--text-primary)", fontSize: "0.85rem", fontWeight: 700 }}>Student Name {i}</span>
                             </div>
                          </td>
                          <td className="px-6 py-4">
                             <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-tighter" style={{ background: `var(--bg-secondary)`, color: "var(--text-secondary)" }}>JHS 3A</span>
                          </td>
                          <td className="px-6 py-4">
                             <div className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-black uppercase`} style={i === 4 ? { background: '#FEE2E2', color: '#991B1B' } : { background: '#D1FAE5', color: '#065F46' }}>
                                {i === 4 ? 'Absent' : 'Present'}
                             </div>
                          </td>
                          <td className="px-6 py-4">
                             <span style={{ fontFamily: "'JetBrains Mono', monospace", color: "var(--text-muted)", fontSize: "0.75rem", fontWeight: 600 }}>07:{30+i} AM</span>
                          </td>
                          <td className="px-6 py-4">
                             <span style={{ color: "var(--text-muted)", fontSize: "0.75rem", fontWeight: 600 }}>Mrs. Mensah</span>
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
              <button 
                onClick={() => {
                  showToast({
                    title: 'SMS Dispatching',
                    message: 'Emergency absence notifications are being routed to parents.',
                    type: 'info'
                  });
                }}
                className="w-full py-3 rounded-2xl bg-rose-500 text-white text-[10px] font-black uppercase tracking-widest shadow-lg shadow-rose-500/20 hover:scale-105 transition-all flex items-center justify-center gap-2"
              >
                 <Send size={14} /> Send SMS Alerts
              </button>
           </div>

           <div className="flex-1 rounded-[32px] p-8 border" style={{ background: "var(--card-bg)", borderColor: "var(--border)" }}>
              <h3 style={{ fontFamily: "'Playfair Display', serif", color: "var(--text-primary)", fontWeight: 800, fontSize: "1rem", marginBottom: "1.2rem" }}>Class Pulse</h3>
              <div className="space-y-4">
                 {[
                    { name: "Form 1A", rate: 98, color: "#10B981" },
                    { name: "Form 1B", rate: 94, color: "#10B981" },
                    { name: "Form 2A", rate: 82, color: "#F59E0B" },
                    { name: "Form 2B", rate: 91, color: "#10B981" },
                 ].map((c, i) => (
                    <div key={i} className="space-y-1.5">
                       <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest" style={{ color: "var(--text-muted)" }}>
                          <span>{c.name}</span>
                          <span>{c.rate}%</span>
                       </div>
                       <div className="h-1.5 w-full bg-black/5 rounded-full overflow-hidden">
                          <div className="h-full rounded-full transition-all duration-1000" style={{ width: `${c.rate}%`, background: c.color }} />
                       </div>
                    </div>
                 ))}
              </div>
           </div>
        </div>
      </div>

      {/* Mark Attendance Modal */}
      <AnimatePresence>
        {isMarkModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsMarkModalOpen(false)} className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="w-full max-w-lg rounded-[40px] shadow-2xl relative z-10 overflow-hidden border" style={{ background: "var(--card-bg)", borderColor: "var(--border)" }}>
              <div className="p-8 pb-4 flex justify-between items-center">
                <div>
                  <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "1.5rem", fontWeight: 800, color: "var(--text-primary)" }}>Mark Presence</h2>
                  <p style={{ color: "var(--text-muted)", fontSize: "0.75rem", fontWeight: 600 }}>Daily Roll Management</p>
                </div>
                <button onClick={() => setIsMarkModalOpen(false)} className="w-10 h-10 rounded-full hover:bg-black/5 flex items-center justify-center"><X size={20} style={{ color: "var(--text-muted)" }} /></button>
              </div>
              <div className="p-8 pt-4 space-y-4">
                 <div className="flex gap-4">
                    <div className="flex-1">
                       <label className="text-[10px] font-black uppercase tracking-widest mb-1.5 block ml-1" style={{ color: "var(--text-muted)" }}>Select Class</label>
                       <select className="w-full border rounded-xl px-4 py-3 text-xs font-bold outline-none transition-all cursor-pointer" style={{ background: "var(--bg-secondary)", color: "var(--text-primary)", borderColor: "var(--border)" }}>
                          <option>Form 1A</option>
                       </select>
                    </div>
                    <div className="flex-1">
                       <label className="text-[10px] font-black uppercase tracking-widest mb-1.5 block ml-1" style={{ color: "var(--text-muted)" }}>Date</label>
                       <input type="date" defaultValue={new Date().toISOString().split('T')[0]} className="w-full border rounded-xl px-4 py-3 text-xs font-bold outline-none transition-all" style={{ background: "var(--bg-secondary)", color: "var(--text-primary)", borderColor: "var(--border)" }} />
                    </div>
                 </div>
                 <div className="max-h-[300px] overflow-y-auto pr-2 space-y-2">
                    {[1,2,3,4,5].map(i => (
                       <div key={i} className="flex items-center justify-between p-3 rounded-2xl border border-transparent hover:border-plum/10 transition-all" style={{ background: "var(--bg-secondary)" }}>
                          <span style={{ color: "var(--text-primary)", fontSize: "0.8rem", fontWeight: 700 }}>Student Full Name {i}</span>
                          <div className="flex gap-1">
                             {['P', 'A', 'L'].map(l => (
                                <button 
                                  key={l} 
                                  onClick={() => setAttendanceState(prev => ({ ...prev, [i]: l }))}
                                  className={`w-8 h-8 rounded-lg flex items-center justify-center text-[10px] font-black transition-all ${attendanceState[i] === l ? 'bg-plum text-milk shadow-md' : 'bg-white/10 border text-slate-400'}`}
                                >
                                   {l}
                                </button>
                             ))}
                          </div>
                       </div>
                    ))}
                 </div>
              </div>
              <div className="p-8 bg-black/[0.02] flex gap-3">
                <Button className="flex-1 py-4 rounded-2xl text-xs font-black uppercase tracking-widest bg-plum text-milk" onClick={() => setIsMarkModalOpen(false)}>Sync Roll</Button>
                <Button variant="secondary" className="flex-1 py-4 rounded-2xl text-xs font-black uppercase tracking-widest" style={{ borderColor: "var(--border)", color: "var(--text-primary)" }} onClick={() => setIsMarkModalOpen(false)}>Discard</Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Attendance;
