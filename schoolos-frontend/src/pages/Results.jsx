import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence, useMotionValue, useSpring } from 'framer-motion';
import { 
  BarChart3, 
  Search, 
  Filter, 
  FileDown, 
  Plus, 
  TrendingUp, 
  Award, 
  Target, 
  Activity, 
  GraduationCap, 
  ChevronRight, 
  X,
  MoreVertical,
  CheckCircle2,
  AlertCircle,
  Eye,
  Edit2,
  Trash2,
  Sparkles
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

const Results = ({ onNavigate }) => {
  const [activeItem, setActiveItem] = useState('results');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [results, setResults] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchResults = async () => {
      try {
        const res = await fetch(buildUrl('/api/school/results'), { credentials: 'include' });
        const json = await res.json();
        if (json.data) setResults(json.data.results || []);
      } catch (err) {
        console.error("Failed to fetch results", err);
      } finally {
        setTimeout(() => setLoading(false), 800);
      }
    };
    fetchResults();
  }, []);

  const stats = [
    { label: 'Avg Score', value: 78, icon: Target, color: 'text-accent-primary', bg: 'bg-accent-primary/10', suffix: '%' },
    { label: 'Pass Rate', value: 92, icon: CheckCircle2, color: 'text-emerald-500', bg: 'bg-emerald-500/10', suffix: '%' },
    { label: 'Top Performers', value: 45, icon: Award, color: 'text-amber-500', bg: 'bg-amber-500/10' },
    { label: 'Improvement', value: 5.4, icon: TrendingUp, color: 'text-indigo-500', bg: 'bg-indigo-500/10', suffix: '%' },
  ];

  const filteredResults = useMemo(() => {
    return results.filter(r => 
      (r.student_name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (r.subject_name || '').toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [results, searchQuery]);

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
              <div className="w-10 h-10 bg-indigo-500/10 rounded-xl flex items-center justify-center text-indigo-500">
                <BarChart3 size={24} />
              </div>
              <h1 className="text-3xl font-black tracking-tight font-headings">Results</h1>
            </div>
            <p className="text-text-muted text-sm font-medium tracking-tight">Academic performance tracking and automated report card generation.</p>
          </div>
          <div className="flex gap-3">
            <Button variant="secondary" className="px-5 border-slate-100">
              <FileDown size={18} className="mr-2" /> Export
            </Button>
            <Button onClick={() => setIsAddModalOpen(true)} className="px-5 bg-indigo-500 hover:bg-indigo-600 shadow-lg shadow-indigo-500/15">
              <Plus size={18} className="mr-2" /> Upload Scores
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

        {/* Filters & Table */}
        <div className="bg-white border border-slate-50 rounded-[40px] shadow-sm overflow-hidden">
           <div className="p-8 border-b border-slate-50 flex flex-col lg:flex-row justify-between items-center gap-4 bg-slate-50/30">
              <div className="flex flex-1 max-w-md relative w-full">
                 <Search size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" />
                 <input 
                    placeholder="Search by student or subject..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-white border border-slate-100 rounded-2xl py-3.5 pl-12 pr-6 text-xs font-bold outline-none focus:border-indigo-500/20 shadow-sm"
                 />
              </div>

              <div className="flex items-center gap-3">
                 <select className="bg-white border border-slate-100 rounded-xl px-5 py-3 text-[10px] font-black text-slate-500 uppercase tracking-widest outline-none shadow-sm appearance-none min-w-[140px]">
                    <option>End of Term</option>
                    <option>Mid-Term</option>
                    <option>Mock Exams</option>
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
                       <th className="px-8 py-5">Student Performance</th>
                       <th className="px-6 py-5">Subject</th>
                       <th className="px-6 py-5">Score</th>
                       <th className="px-6 py-5">Grade</th>
                       <th className="px-6 py-5">Class Position</th>
                       <th className="px-6 py-5">Academic Status</th>
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
                             <td className="px-6 py-6"><SkeletonLoader width="100px" height="14px" /></td>
                             <td className="px-6 py-6"><SkeletonLoader width="60px" height="14px" /></td>
                             <td className="px-6 py-6"><SkeletonLoader width="40px" height="24px" borderRadius="99px" /></td>
                             <td className="px-6 py-6"><SkeletonLoader width="50px" height="14px" /></td>
                             <td className="px-6 py-6"><SkeletonLoader width="90px" height="14px" /></td>
                             <td className="px-8 py-6 text-right"><SkeletonLoader width="32px" height="32px" borderRadius="8px" className="ml-auto" /></td>
                          </tr>
                       ))
                    ) : filteredResults.length > 0 ? (
                       filteredResults.map((r, i) => (
                          <motion.tr 
                            key={r.id}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: i * 0.03 }}
                            className="hover:bg-slate-50/50 transition-colors group cursor-pointer"
                          >
                             <td className="px-8 py-5">
                                <div className="flex items-center gap-3">
                                   <div className="w-9 h-9 rounded-full bg-slate-50 flex items-center justify-center text-[10px] font-black text-indigo-500 border border-slate-100">
                                      {(r.student_name || '??').substring(0, 2).toUpperCase()}
                                   </div>
                                   <div className="text-sm font-bold text-text-primary group-hover:text-indigo-600 transition-colors">{r.student_name}</div>
                                </div>
                             </td>
                             <td className="px-6 py-5 text-xs font-black text-text-secondary">{r.subject_name}</td>
                             <td className="px-6 py-5">
                                <span className="text-sm font-black text-text-primary">{r.score}</span>
                                <span className="text-[10px] text-slate-400 font-bold ml-1">/ 100</span>
                             </td>
                             <td className="px-6 py-5">
                                <div className={`inline-flex items-center justify-center w-9 h-9 rounded-xl font-black text-xs ${
                                   r.score >= 80 ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' :
                                   r.score >= 50 ? 'bg-amber-50 text-amber-600 border border-amber-100' :
                                   'bg-rose-50 text-rose-600 border border-rose-100'
                                }`}>
                                   {r.grade || 'A'}
                                </div>
                             </td>
                             <td className="px-6 py-5">
                                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500">
                                   <Sparkles size={12} className="text-amber-500" />
                                   {r.rank || '1st'}
                                </div>
                             </td>
                             <td className="px-6 py-5">
                                <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-wider ${
                                   r.score >= 50 ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
                                }`}>
                                   {r.score >= 50 ? 'Satisfactory' : 'Needs Review'}
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
                                title={searchQuery ? "No results found" : "No results recorded"}
                                description={searchQuery 
                                   ? `Your search for "${searchQuery}" didn't return any academic records.`
                                   : "The academic performance roster is currently empty. Start by uploading termly scores."}
                                actionLabel={!searchQuery && "Upload First Grade"}
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
                 System Status: <span className="text-emerald-500">Processing Academic Analytics</span>
              </div>
              <div className="flex gap-2">
                 <Button variant="secondary" size="sm" className="h-10 px-4 rounded-xl text-[10px] font-black uppercase border-slate-100" disabled>Previous</Button>
                 <Button variant="secondary" size="sm" className="h-10 px-4 rounded-xl text-[10px] font-black uppercase border-slate-100" disabled>Next</Button>
              </div>
           </div>
        </div>
      </main>

      {/* Upload Scores Modal */}
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
                  <h2 className="text-2xl font-black tracking-tight text-text-primary font-headings">Academic Grading</h2>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Assessment • Performance Management</p>
                </div>
                <button onClick={() => setIsAddModalOpen(false)} className="w-12 h-12 flex items-center justify-center rounded-full bg-white border border-slate-100 text-slate-400 hover:text-text-primary transition-colors shadow-sm">
                  <X size={20} />
                </button>
              </div>

              <div className="p-10 max-h-[60vh] overflow-y-auto no-scrollbar">
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                    <div className="flex flex-col gap-2">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Class Section</label>
                       <select className="w-full appearance-none bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 text-sm font-bold text-text-primary outline-none focus:bg-white focus:border-indigo-500/30 transition-all shadow-sm cursor-pointer">
                          <option>Form 1A</option>
                       </select>
                    </div>
                    <div className="flex flex-col gap-2">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Subject</label>
                       <select className="w-full appearance-none bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 text-sm font-bold text-text-primary outline-none focus:bg-white focus:border-indigo-500/30 transition-all shadow-sm cursor-pointer">
                          <option>Mathematics</option>
                          <option>Science</option>
                       </select>
                    </div>
                 </div>

                 <div className="space-y-4">
                    {[1, 2, 3].map(i => (
                       <div key={i} className="flex items-center justify-between p-5 bg-white border border-slate-50 rounded-2xl shadow-sm">
                          <div className="flex items-center gap-4">
                             <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-[10px] font-black text-slate-300 border border-slate-50">S{i}</div>
                             <span className="text-sm font-bold text-text-primary">Student Full Name {i}</span>
                          </div>
                          <div className="w-32">
                             <input type="number" placeholder="Score" className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm font-black text-center outline-none focus:bg-white focus:border-indigo-500/30 transition-all" />
                          </div>
                       </div>
                    ))}
                 </div>
              </div>

              <div className="px-10 py-8 bg-slate-50/50 border-t border-slate-50 flex gap-4">
                <Button className="flex-1 h-14 rounded-2xl shadow-xl shadow-indigo-500/10 font-black text-sm uppercase tracking-widest bg-indigo-500 hover:bg-indigo-600">Publish Results</Button>
                <Button variant="secondary" className="flex-1 h-14 rounded-2xl font-black text-xs uppercase tracking-widest border-slate-200" onClick={() => setIsAddModalOpen(false)}>Cancel</Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Results;
