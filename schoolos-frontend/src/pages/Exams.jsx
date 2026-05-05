import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence, useMotionValue, useSpring } from 'framer-motion';
import { 
  FileText, 
  Plus, 
  FileDown, 
  Clock, 
  CheckCircle2, 
  Activity, 
  Search, 
  Filter, 
  Calendar, 
  List, 
  MoreVertical,
  X,
  User,
  GraduationCap,
  Award,
  ChevronRight,
  Send,
  Download,
  Zap,
  Sparkles,
  ClipboardList
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

const Exams = ({ onNavigate }) => {
  const [activeItem, setActiveItem] = useState('exams');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [exams, setExams] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchExams = async () => {
      try {
        const res = await fetch(buildUrl('/api/school/exams'), { credentials: 'include' });
        const json = await res.json();
        if (json.data) setExams(json.data.exams || []);
      } catch (err) {
        console.error("Failed to fetch exams", err);
      } finally {
        setTimeout(() => setLoading(false), 800);
      }
    };
    fetchExams();
  }, []);

  const stats = [
    { label: 'Upcoming Exams', value: 12, icon: FileText, color: 'text-accent-primary', bg: 'bg-accent-primary/10' },
    { label: 'Completed', value: 48, icon: CheckCircle2, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
    { label: 'Avg. Attendance', value: 98, icon: Activity, color: 'text-amber-500', bg: 'bg-amber-500/10', suffix: '%' },
    { label: 'Top Score', value: 99, icon: Award, color: 'text-indigo-500', bg: 'bg-indigo-500/10', suffix: '%' },
  ];

  const filteredExams = useMemo(() => {
    return exams.filter(e => 
      (e.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (e.subject || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (e.class_name || '').toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [exams, searchQuery]);

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
              <div className="w-10 h-10 bg-rose-500/10 rounded-xl flex items-center justify-center text-rose-500">
                <ClipboardList size={24} />
              </div>
              <h1 className="text-3xl font-black tracking-tight font-headings">Exams</h1>
            </div>
            <p className="text-text-muted text-sm font-medium tracking-tight">Organize assessments, manage schedules, and coordinate faculty invigilation.</p>
          </div>
          <div className="flex gap-3">
            <Button variant="secondary" className="px-5 border-slate-100">
              <Download size={18} className="mr-2" /> Schedule
            </Button>
            <Button onClick={() => setIsAddModalOpen(true)} className="px-5 bg-rose-500 hover:bg-rose-600 shadow-lg shadow-rose-500/15">
              <Plus size={18} className="mr-2" /> Schedule Exam
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
                <div className={`w-14 h-14 rounded-2xl ${stat.bg} flex items-center justify-center ${stat.color} group-hover:scale-110 transition-transform`}>
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

        {/* Filters & Table */}
        <div className="bg-white border border-slate-50 rounded-[40px] shadow-sm overflow-hidden">
           <div className="p-8 border-b border-slate-50 flex flex-col lg:flex-row justify-between items-center gap-4 bg-slate-50/30">
              <div className="flex flex-1 max-w-md relative w-full">
                 <Search size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" />
                 <input 
                    placeholder="Search by exam name or subject..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-white border border-slate-100 rounded-2xl py-3.5 pl-12 pr-6 text-xs font-bold outline-none focus:border-rose-500/20 shadow-sm"
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
                       <th className="px-8 py-5">Assessment Detail</th>
                       <th className="px-6 py-5">Subject</th>
                       <th className="px-6 py-5">Assigned Section</th>
                       <th className="px-6 py-5">Exam Date</th>
                       <th className="px-6 py-5">Max Score</th>
                       <th className="px-6 py-5">Operational Status</th>
                       <th className="px-8 py-5 text-right">Actions</th>
                    </tr>
                 </thead>
                 <tbody className="divide-y divide-slate-50">
                    {loading ? (
                       Array.from({ length: 5 }).map((_, i) => (
                          <tr key={i}>
                             <td className="px-8 py-6">
                                <div className="flex items-center gap-3">
                                   <SkeletonLoader width="36px" height="36px" borderRadius="10px" />
                                   <SkeletonLoader width="140px" height="14px" />
                                </div>
                             </td>
                             <td className="px-6 py-6"><SkeletonLoader width="100px" height="14px" /></td>
                             <td className="px-6 py-6"><SkeletonLoader width="80px" height="14px" /></td>
                             <td className="px-6 py-6"><SkeletonLoader width="110px" height="14px" /></td>
                             <td className="px-6 py-6"><SkeletonLoader width="40px" height="14px" /></td>
                             <td className="px-6 py-6"><SkeletonLoader width="90px" height="24px" borderRadius="99px" /></td>
                             <td className="px-8 py-6 text-right"><SkeletonLoader width="32px" height="32px" borderRadius="8px" className="ml-auto" /></td>
                          </tr>
                       ))
                    ) : filteredExams.length > 0 ? (
                       filteredExams.map((e, i) => (
                          <motion.tr 
                            key={e.id}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: i * 0.03 }}
                            className="hover:bg-slate-50/50 transition-colors group cursor-pointer"
                          >
                             <td className="px-8 py-5">
                                <div className="flex items-center gap-3">
                                   <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-rose-500 border border-slate-100 group-hover:bg-rose-50 transition-colors">
                                      <FileText size={18} />
                                   </div>
                                   <div className="text-sm font-bold text-text-primary group-hover:text-rose-600 transition-colors">{e.name}</div>
                                </div>
                             </td>
                             <td className="px-6 py-5 text-xs font-black text-text-secondary uppercase tracking-tight">{e.subject}</td>
                             <td className="px-6 py-5 text-xs font-bold text-slate-500">{e.class_name}</td>
                             <td className="px-6 py-5">
                                <div className="flex items-center gap-2 text-xs font-bold text-text-primary">
                                   <Calendar size={14} className="text-slate-300" />
                                   {new Date(e.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                </div>
                             </td>
                             <td className="px-6 py-5 text-sm font-black text-text-primary">{e.total_marks || 100}</td>
                             <td className="px-6 py-5">
                                <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-wider border ${
                                   new Date(e.date) < new Date() ? 'bg-emerald-50 border-emerald-100 text-emerald-600' : 'bg-rose-50 border-rose-100 text-rose-600'
                                }`}>
                                   {new Date(e.date) < new Date() ? 'Completed' : 'Scheduled'}
                                </div>
                             </td>
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
                                title={searchQuery ? "No matching exams" : "No assessments scheduled"}
                                description={searchQuery 
                                   ? `We couldn't find any exams matching "${searchQuery}". Please check your search term.`
                                   : "The academic examination calendar is currently clear. Start by scheduling your first assessment."}
                                actionLabel={!searchQuery && "Schedule New Exam"}
                                onAction={() => setIsAddModalOpen(true)}
                             />
                          </td>
                       </tr>
                    )}
                 </tbody>
              </table>
           </div>

           <div className="p-8 bg-slate-50/50 flex justify-between items-center">
              <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                 Exam Server Status: <span className="text-emerald-500">Live & Synchronized</span>
              </div>
              <div className="flex gap-2">
                 <Button variant="secondary" size="sm" className="h-10 px-4 rounded-xl text-[10px] font-black uppercase border-slate-100" disabled>Previous</Button>
                 <Button variant="secondary" size="sm" className="h-10 px-4 rounded-xl text-[10px] font-black uppercase border-slate-100" disabled>Next</Button>
              </div>
           </div>
        </div>
      </main>

      {/* Schedule Exam Modal */}
      <AnimatePresence>
        {isAddModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsAddModalOpen(false)}
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
                  <h2 className="text-2xl font-black tracking-tight text-text-primary font-headings">New Assessment</h2>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Academics • Exam Coordination</p>
                </div>
                <button onClick={() => setIsAddModalOpen(false)} className="w-12 h-12 flex items-center justify-center rounded-full bg-white border border-slate-100 text-slate-400 hover:text-text-primary transition-colors shadow-sm">
                  <X size={20} />
                </button>
              </div>

              <div className="p-10 max-h-[60vh] overflow-y-auto no-scrollbar">
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="flex flex-col gap-2 md:col-span-2">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Examination Name</label>
                       <input 
                         placeholder="e.g. End of Term Mathematics"
                         className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 text-sm font-bold text-text-primary outline-none focus:bg-white focus:border-rose-500/30 transition-all shadow-sm"
                       />
                    </div>
                    <div className="flex flex-col gap-2">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Subject</label>
                       <select className="w-full appearance-none bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 text-sm font-bold text-text-primary outline-none focus:bg-white focus:border-rose-500/30 transition-all shadow-sm cursor-pointer">
                          <option>Mathematics</option>
                          <option>Integrated Science</option>
                       </select>
                    </div>
                    <div className="flex flex-col gap-2">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Class Section</label>
                       <select className="w-full appearance-none bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 text-sm font-bold text-text-primary outline-none focus:bg-white focus:border-rose-500/30 transition-all shadow-sm cursor-pointer">
                          <option>Form 1A</option>
                          <option>Form 1B</option>
                       </select>
                    </div>
                    <div className="flex flex-col gap-2">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Exam Date</label>
                       <input 
                         type="date"
                         className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 text-sm font-bold text-text-primary outline-none focus:bg-white focus:border-rose-500/30 transition-all shadow-sm"
                       />
                    </div>
                    <div className="flex flex-col gap-2">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Total Marks</label>
                       <input 
                         type="number"
                         placeholder="100"
                         className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 text-sm font-black text-text-primary outline-none focus:bg-white focus:border-rose-500/30 transition-all shadow-sm"
                       />
                    </div>
                 </div>
              </div>

              <div className="px-10 py-8 bg-slate-50/50 border-t border-slate-50 flex gap-4">
                <Button className="flex-1 h-14 rounded-2xl shadow-xl shadow-rose-500/10 font-black text-sm uppercase tracking-widest bg-rose-500 hover:bg-rose-600">Register Exam</Button>
                <Button variant="secondary" className="flex-1 h-14 rounded-2xl font-black text-xs uppercase tracking-widest border-slate-200" onClick={() => setIsAddModalOpen(false)}>Discard</Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Exams;
