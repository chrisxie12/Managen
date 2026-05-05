import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence, useMotionValue, useSpring } from 'framer-motion';
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
  MoreVertical,
  Search,
  MessageSquare,
  Smartphone,
  X,
  User,
  ArrowUpRight,
  TrendingUp,
  AlertCircle,
  Filter,
  ShieldCheck,
  Send,
  Zap
} from 'lucide-react';
import Sidebar from '../components/layout/Sidebar';
import DashboardNavbar from '../components/layout/DashboardNavbar';
import { Button } from '../components/ui/Button';
import { SkeletonLoader } from '../components/ui/SkeletonLoader';
import { EmptyState } from '../components/ui/EmptyState';
import { buildUrl } from '../services/api';

// Count Up Component
const CountUp = ({ value, prefix = "", suffix = "" }) => {
  const motionValue = useMotionValue(0);
  const springValue = useSpring(motionValue, { damping: 30, stiffness: 100 });
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    motionValue.set(value);
  }, [value, motionValue]);

  useEffect(() => {
    return springValue.on("change", (latest) => {
      setDisplayValue(Math.floor(latest));
    });
  }, [springValue]);

  return (
    <span>
      {prefix}
      {displayValue.toLocaleString()}
      {suffix}
    </span>
  );
};

const Attendance = ({ onNavigate }) => {
  const [activeItem, setActiveItem] = useState('attendance');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMarkModalOpen, setIsMarkModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [records, setRecords] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchAttendance = async () => {
      try {
        const res = await fetch(buildUrl('/api/school/attendance'), { credentials: 'include' });
        const json = await res.json();
        if (json.data) setRecords(json.data.records || []);
      } catch (err) {
        console.error("Failed to fetch attendance", err);
      } finally {
        setTimeout(() => setLoading(false), 800);
      }
    };
    fetchAttendance();
  }, []);

  const stats = [
    { label: 'Present Today', value: records.filter(r => r.status === 'Present').length || 812, icon: CheckCircle2, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
    { label: 'Absent Today', value: records.filter(r => r.status === 'Absent').length || 35, icon: XCircle, color: 'text-rose-500', bg: 'bg-rose-500/10' },
    { label: 'Late Entries', value: records.filter(r => r.status === 'Late').length || 12, icon: Clock, color: 'text-amber-500', bg: 'bg-amber-500/10' },
    { label: 'Avg. Rate', value: 96, icon: Activity, color: 'text-accent-primary', bg: 'bg-accent-primary/10', suffix: '%' },
  ];

  const classSummaries = [
    { name: 'Form 1A', present: 33, total: 35, teacher: 'Mrs. Mensah' },
    { name: 'Form 1B', present: 30, total: 34, teacher: 'Mr. Asante' },
    { name: 'Form 2A', present: 36, total: 38, teacher: 'Mrs. Boateng' },
    { name: 'Form 2B', present: 32, total: 36, teacher: 'Mr. Kwame' },
  ];

  const filteredRecords = useMemo(() => {
    return records.filter(r => 
      (r.student_name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (r.admission_no || '').toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [records, searchQuery]);

  return (
    <div className="min-h-screen bg-white">
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

      <main className="md:ml-[280px] pt-20 p-8 text-text-primary">
        {/* Page Header */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-4"
        >
          <div>
            <div className="flex items-center gap-3 mb-1">
              <div className="w-10 h-10 bg-emerald-500/10 rounded-xl flex items-center justify-center text-emerald-500">
                <ClipboardCheck size={24} />
              </div>
              <h1 className="text-3xl font-black tracking-tight font-headings">Attendance</h1>
            </div>
            <p className="text-text-muted text-sm font-medium tracking-tight">Monitor daily student presence and manage absent notifications.</p>
          </div>
          <div className="flex gap-3">
            <Button variant="secondary" className="px-5 border-slate-100">
              <FileDown size={18} className="mr-2" /> Report
            </Button>
            <Button onClick={() => setIsMarkModalOpen(true)} className="px-5 bg-emerald-500 hover:bg-emerald-600 shadow-lg shadow-emerald-500/15">
              <Plus size={18} className="mr-2" /> Mark Presence
            </Button>
          </div>
        </motion.div>

        {/* Stats Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          {stats.map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="bg-white border border-slate-50 rounded-[28px] p-6 shadow-sm hover:shadow-md transition-all duration-300 group"
            >
              <div className="flex items-center gap-5">
                <div className={`w-14 h-14 rounded-2xl ${stat.bg} flex items-center justify-center ${stat.color} group-hover:rotate-6 transition-transform`}>
                  <stat.icon size={26} />
                </div>
                <div>
                  <div className="text-2xl font-black text-text-primary tracking-tight leading-none mb-1">
                    <CountUp value={stat.value} suffix={stat.suffix} />
                  </div>
                  <div className="text-[10px] font-black text-text-muted uppercase tracking-widest">{stat.label}</div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Class Pulse Summary */}
        <div className="flex gap-4 overflow-x-auto no-scrollbar pb-6 mb-8">
           {classSummaries.map((c, i) => {
              const rate = (c.present / c.total) * 100;
              return (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.05 }}
                  className="min-w-[280px] bg-white border border-slate-50 rounded-[32px] p-6 shadow-sm hover:shadow-md transition-all cursor-pointer group"
                >
                   <div className="flex justify-between items-center mb-4">
                      <div className="text-sm font-black text-text-primary">{c.name}</div>
                      <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{c.present} / {c.total}</div>
                   </div>
                   <div className="flex items-center gap-4">
                      <div className="relative w-12 h-12 flex items-center justify-center">
                         <svg className="w-full h-full transform -rotate-90">
                            <circle cx="24" cy="24" r="20" fill="transparent" stroke="#f1f5f9" strokeWidth="4" />
                            <motion.circle 
                              cx="24" cy="24" r="20" fill="transparent" 
                              stroke={rate > 90 ? '#10b981' : rate > 75 ? '#f59e0b' : '#ef4444'} 
                              strokeWidth="4"
                              strokeDasharray={`${2 * Math.PI * 20}`}
                              initial={{ strokeDashoffset: 2 * Math.PI * 20 }}
                              animate={{ strokeDashoffset: (2 * Math.PI * 20) * (1 - rate / 100) }}
                              transition={{ duration: 1.5, delay: 0.5 }}
                              strokeLinecap="round"
                            />
                         </svg>
                         <span className="absolute text-[10px] font-black text-text-primary">{Math.round(rate)}%</span>
                      </div>
                      <div>
                         <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Teacher</div>
                         <div className="text-xs font-bold text-text-secondary">{c.teacher}</div>
                      </div>
                   </div>
                </motion.div>
              );
           })}
        </div>

        {/* Filters & Table */}
        <div className="bg-white border border-slate-50 rounded-[40px] shadow-sm overflow-hidden">
           <div className="p-8 border-b border-slate-50 flex flex-col lg:flex-row justify-between items-center gap-4 bg-slate-50/30">
              <div className="flex items-center gap-4 bg-white border border-slate-100 rounded-2xl px-4 py-2 shadow-sm">
                 <button className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-accent-primary transition-colors"><ChevronLeft size={18} /></button>
                 <div className="flex items-center gap-2 text-sm font-black text-text-primary">
                    <Calendar size={16} className="text-accent-primary" />
                    <span>May 1st, 2026</span>
                 </div>
                 <button className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-accent-primary transition-colors"><ChevronRight size={18} /></button>
              </div>
              
              <div className="flex flex-1 max-w-md relative w-full">
                 <Search size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" />
                 <input 
                    placeholder="Search records..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-white border border-slate-100 rounded-2xl py-3.5 pl-12 pr-6 text-xs font-bold outline-none focus:border-emerald-500/20 shadow-sm"
                 />
              </div>

              <div className="flex items-center gap-3">
                 <select className="bg-white border border-slate-100 rounded-xl px-5 py-3 text-[10px] font-black text-slate-500 uppercase tracking-widest outline-none shadow-sm appearance-none min-w-[140px]">
                    <option>All Classes</option>
                    <option>Form 1A</option>
                 </select>
                 <Button variant="secondary" className="h-11 px-5 border-slate-100 shadow-sm">
                    <Filter size={16} className="mr-2" /> Filter
                 </Button>
              </div>
           </div>

           <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                 <thead>
                    <tr className="bg-slate-50/50 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                       <th className="px-8 py-5">Student Profile</th>
                       <th className="px-6 py-5">Admission</th>
                       <th className="px-6 py-5">Section</th>
                       <th className="px-6 py-5">Status</th>
                       <th className="px-6 py-5">Check-In</th>
                       <th className="px-6 py-5">Marked By</th>
                       <th className="px-8 py-5 text-right">Actions</th>
                    </tr>
                 </thead>
                 <tbody className="divide-y divide-slate-50">
                    {loading ? (
                       Array.from({ length: 5 }).map((_, i) => (
                          <tr key={i}>
                             <td className="px-8 py-6">
                                <div className="flex items-center gap-3">
                                   <SkeletonLoader width="36px" height="36px" borderRadius="999px" />
                                   <SkeletonLoader width="140px" height="14px" />
                                </div>
                             </td>
                             <td className="px-6 py-6"><SkeletonLoader width="80px" height="14px" /></td>
                             <td className="px-6 py-6"><SkeletonLoader width="70px" height="14px" /></td>
                             <td className="px-6 py-6"><SkeletonLoader width="80px" height="24px" borderRadius="99px" /></td>
                             <td className="px-6 py-6"><SkeletonLoader width="60px" height="14px" /></td>
                             <td className="px-6 py-6"><SkeletonLoader width="90px" height="14px" /></td>
                             <td className="px-8 py-6 text-right"><SkeletonLoader width="32px" height="32px" borderRadius="8px" className="ml-auto" /></td>
                          </tr>
                       ))
                    ) : filteredRecords.length > 0 ? (
                       filteredRecords.map((r, i) => (
                          <motion.tr 
                            key={r.id}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: i * 0.03 }}
                            className="hover:bg-slate-50/50 transition-colors group cursor-pointer"
                          >
                             <td className="px-8 py-5">
                                <div className="flex items-center gap-3">
                                   <div className="w-9 h-9 rounded-full bg-slate-50 flex items-center justify-center text-[10px] font-black text-accent-primary border border-slate-100">
                                      {(r.student_name || '??').substring(0, 2).toUpperCase()}
                                   </div>
                                   <div className="text-sm font-bold text-text-primary group-hover:text-accent-primary transition-colors">{r.student_name}</div>
                                </div>
                             </td>
                             <td className="px-6 py-5 text-xs font-bold text-slate-400">{r.admission_no}</td>
                             <td className="px-6 py-5 text-xs font-black text-text-secondary">{r.class_name}</td>
                             <td className="px-6 py-5">
                                <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-wider border ${
                                   r.status === 'Present' ? 'bg-emerald-50 border-emerald-100 text-emerald-600' :
                                   r.status === 'Absent' ? 'bg-rose-50 border-rose-100 text-rose-600' :
                                   'bg-amber-50 border-amber-100 text-amber-600'
                                }`}>
                                   {r.status}
                                </div>
                             </td>
                             <td className="px-6 py-5 text-xs font-bold text-slate-500">{r.check_in_time || '--:--'}</td>
                             <td className="px-6 py-5 text-[11px] font-bold text-slate-400">{r.marked_by_name || 'System'}</td>
                             <td className="px-8 py-5 text-right">
                                <button className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-300 hover:text-text-primary hover:bg-white hover:shadow-sm transition-all"><MoreVertical size={16} /></button>
                             </td>
                          </motion.tr>
                       ))
                    ) : (
                       <tr>
                          <td colSpan={7}>
                             <EmptyState 
                                isSearch={searchQuery.length > 0}
                                title={searchQuery ? "No matching records" : "No attendance data"}
                                description={searchQuery 
                                   ? `We couldn't find any attendance logs matching "${searchQuery}".`
                                   : "Attendance hasn't been recorded for this date yet. Select a class to begin marking presence."}
                                actionLabel={!searchQuery && "Mark Now"}
                                onAction={() => setIsMarkModalOpen(true)}
                             />
                          </td>
                       </tr>
                    )}
                 </tbody>
              </table>
           </div>

           <div className="p-8 bg-slate-50/50 flex justify-between items-center">
              <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                 System Pulse: <span className="text-emerald-500">Online & Syncing</span>
              </div>
              <div className="flex gap-2">
                 <Button variant="secondary" size="sm" className="h-10 px-4 rounded-xl text-[10px] font-black uppercase border-slate-100" disabled>Previous</Button>
                 <Button variant="secondary" size="sm" className="h-10 px-4 rounded-xl text-[10px] font-black uppercase border-slate-100" disabled>Next</Button>
              </div>
           </div>
        </div>

        {/* Alert Zone */}
        <div className="mt-10 bg-rose-50 border border-rose-100 rounded-[32px] p-8 relative overflow-hidden group">
           <AlertCircle className="absolute -right-6 -bottom-6 w-32 h-32 text-rose-500/10 group-hover:scale-125 transition-transform duration-700" />
           <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative z-10">
              <div className="flex items-center gap-6">
                 <div className="w-14 h-14 bg-rose-500 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-rose-500/20">
                    <Send size={24} />
                 </div>
                 <div>
                    <h3 className="text-xl font-black font-headings text-rose-900 tracking-tight leading-none mb-1">Unnotified Absences</h3>
                    <p className="text-sm font-bold text-rose-600/80 italic">There are 2 students absent today without parental notification.</p>
                 </div>
              </div>
              <Button className="bg-rose-500 hover:bg-rose-600 shadow-xl shadow-rose-500/20 h-14 px-8 rounded-2xl text-[11px] font-black uppercase tracking-[0.2em]">
                 Trigger SMS Alerts
              </Button>
           </div>
        </div>
      </main>

      {/* Mark Attendance Modal */}
      <AnimatePresence>
        {isMarkModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMarkModalOpen(false)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="w-full max-w-2xl bg-white rounded-[40px] shadow-2xl relative z-[101] overflow-hidden border border-slate-100"
            >
              <div className="px-10 py-8 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
                <div>
                  <h2 className="text-2xl font-black tracking-tight text-text-primary font-headings">Daily Presence Roll</h2>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Management • Attendance Marking</p>
                </div>
                <button onClick={() => setIsMarkModalOpen(false)} className="w-12 h-12 flex items-center justify-center rounded-full bg-white border border-slate-100 text-slate-400 hover:text-text-primary transition-colors shadow-sm">
                  <X size={20} />
                </button>
              </div>

              <div className="p-10 max-h-[60vh] overflow-y-auto no-scrollbar">
                 <div className="bg-slate-50 rounded-2xl p-6 mb-8 border border-slate-50 flex gap-6">
                    <div className="flex-1 space-y-2">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Select Class</label>
                       <select className="w-full bg-white border border-slate-100 rounded-xl px-4 py-3 text-sm font-bold shadow-sm outline-none">
                          <option>Form 1A</option>
                       </select>
                    </div>
                    <div className="flex-1 space-y-2">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Session Date</label>
                       <input type="date" className="w-full bg-white border border-slate-100 rounded-xl px-4 py-3 text-sm font-bold shadow-sm outline-none" defaultValue={new Date().toISOString().split('T')[0]} />
                    </div>
                 </div>

                 <div className="space-y-3">
                    {[1, 2, 3, 4, 5].map(i => (
                       <div key={i} className="flex items-center justify-between p-4 bg-white border border-slate-50 rounded-2xl shadow-sm">
                          <div className="flex items-center gap-3">
                             <div className="w-9 h-9 rounded-xl bg-slate-50 flex items-center justify-center text-[10px] font-black text-slate-400">S{i}</div>
                             <span className="text-sm font-bold text-text-primary">Student Full Name {i}</span>
                          </div>
                          <div className="flex gap-1.5 p-1 bg-slate-50 rounded-xl border border-slate-100">
                             {['P', 'A', 'L'].map(l => (
                                <button key={l} className={`w-9 h-9 rounded-lg text-xs font-black transition-all ${l === 'P' ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' : 'text-slate-400 hover:text-text-primary'}`}>
                                   {l}
                                </button>
                             ))}
                          </div>
                       </div>
                    ))}
                 </div>
              </div>

              <div className="px-10 py-8 bg-slate-50/50 border-t border-slate-50 flex gap-4">
                <Button className="flex-1 h-14 rounded-2xl shadow-xl shadow-emerald-500/10 font-black text-sm uppercase tracking-widest bg-emerald-500 hover:bg-emerald-600">Sync Attendance</Button>
                <Button variant="secondary" className="flex-1 h-14 rounded-2xl font-black text-xs uppercase tracking-widest border-slate-200" onClick={() => setIsMarkModalOpen(false)}>Cancel</Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Attendance;
