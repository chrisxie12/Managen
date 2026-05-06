import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FileText, 
  Plus, 
  Clock, 
  CheckCircle2, 
  Search, 
  Filter, 
  Calendar, 
  MoreVertical,
  X,
  Award,
  ChevronRight,
  Zap,
  Sparkles,
  ClipboardList,
  Download,
  Star,
  TrendingUp,
  BarChart2
} from 'lucide-react';
import Sidebar from '../components/layout/Sidebar';
import DashboardNavbar from '../components/layout/DashboardNavbar';
import { Button } from '../components/ui/Button';
import { buildUrl } from '../services/api';

const PLUM = "#381932";
const PLUM_LIGHT = "#512b4a";
const MILK = "#FFF3E6";
const MUTED = "#7D6077";

const Exams = ({ onNavigate }) => {
  const [activeItem, setActiveItem] = useState('exams');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("exams");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [exams, setExams] = useState([]);
  const [search, setSearch] = useState("");

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
    { label: 'Upcoming', value: '12', icon: Clock, color: '#6366F1' },
    { label: 'Top Score', value: '98%', icon: Star, color: '#F59E0B' },
    { label: 'Completion', value: '92%', icon: CheckCircle2, color: '#10B981' },
    { label: 'Avg Attendance', value: '95%', icon: Award, color: '#EC4899' },
  ];

  const filteredExams = useMemo(() => {
    return (exams.length > 0 ? exams : []).filter(e => 
      (e.name || '').toLowerCase().includes(search.toLowerCase()) ||
      (e.subject || '').toLowerCase().includes(search.toLowerCase())
    );
  }, [exams, search]);

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
            </div>
          ))}
        </div>

        {/* Tab Controls */}
        <div className="flex flex-wrap gap-4 items-center justify-between">
          <div className="flex items-center gap-4">
            <div
              className="flex p-1 rounded-2xl border"
              style={{ background: "white", borderColor: "rgba(56,25,50,0.08)" }}
            >
              {[
                { id: "exams", label: "Exam Schedule", icon: ClipboardList },
                { id: "results", label: "Results Ledger", icon: Award },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id);
                    if (tab.id === 'results') onNavigate('results');
                  }}
                  className="px-5 py-2 rounded-xl text-xs flex items-center gap-2 transition-all active:scale-95"
                  style={{
                    background: activeTab === tab.id ? PLUM : "transparent",
                    color: activeTab === tab.id ? MILK : MUTED,
                    fontWeight: activeTab === tab.id ? 700 : 500,
                  }}
                >
                  <tab.icon size={14} />
                  {tab.label}
                </button>
              ))}
            </div>

            <div
              className="hidden md:flex items-center gap-2 px-3 py-2 rounded-xl border"
              style={{ background: "white", borderColor: "rgba(56,25,50,0.08)", width: 240 }}
            >
              <Search size={14} color={MUTED} />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search exams..."
                className="bg-transparent outline-none text-xs flex-1 font-medium"
                style={{ color: PLUM }}
              />
            </div>
          </div>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest active:scale-95 transition-transform"
            style={{
              background: `linear-gradient(135deg, ${PLUM}, ${PLUM_LIGHT})`,
              color: MILK,
              boxShadow: "0 4px 14px rgba(56,25,50,0.25)",
            }}
          >
            <Plus size={16} /> Schedule Assessment
          </button>
        </div>

        {/* Exam Schedule View */}
        <div
          className="rounded-[24px] overflow-hidden border flex flex-col"
          style={{
            background: "white",
            borderColor: "rgba(56,25,50,0.07)",
            boxShadow: "0 4px 24px rgba(56,25,50,0.06)",
          }}
        >
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr style={{ borderBottom: `1px solid rgba(56,25,50,0.06)` }}>
                  {["Examination Name", "Subject", "Class", "Date", "Status", "Actions"].map((h) => (
                    <th
                      key={h}
                      className="px-6 py-4 text-[10px] font-black uppercase tracking-widest"
                      style={{ color: MUTED }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredExams.map((e) => (
                  <tr
                    key={e.id}
                    className="hover:bg-[#FFF3E6]/40 transition-colors border-b last:border-0"
                    style={{ borderColor: "rgba(56,25,50,0.04)" }}
                  >
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-slate-50 flex items-center justify-center text-plum/30 border border-slate-100">
                          <FileText size={18} />
                        </div>
                        <span style={{ color: PLUM, fontSize: "0.85rem", fontWeight: 700 }}>{e.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest" style={{ background: `rgba(56,25,50,0.07)`, color: PLUM_LIGHT }}>
                        {e.subject}
                      </span>
                    </td>
                    <td className="px-6 py-5">
                      <span style={{ color: MUTED, fontSize: "0.75rem", fontWeight: 600 }}>{e.class_name}</span>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-2 text-xs font-bold" style={{ color: PLUM }}>
                        <Calendar size={14} color={MUTED} />
                        {new Date(e.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <span
                        className="px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border"
                        style={new Date(e.date) < new Date() 
                          ? { background: "#D1FAE5", color: "#065F46", borderColor: "#A7F3D0" } 
                          : { background: "#FEF3C7", color: "#92400E", borderColor: "#FDE68A" }}
                      >
                        {new Date(e.date) < new Date() ? 'Completed' : 'Upcoming'}
                      </span>
                    </td>
                    <td className="px-6 py-5">
                      <button className="p-2 hover:bg-slate-50 rounded-lg transition-colors"><MoreVertical size={16} color={MUTED} /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="px-6 py-3 border-t flex items-center justify-between" style={{ borderColor: "rgba(56,25,50,0.06)" }}>
            <p style={{ color: MUTED, fontSize: "0.75rem", fontWeight: 600 }}>Total: {filteredExams.length} assessments</p>
            <button className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest hover:opacity-70 transition-opacity" style={{ color: PLUM_LIGHT }}>
              <Download size={13} /> Export Schedule
            </button>
          </div>
        </div>
      </main>

      {/* Modal remains consistent with design */}
      <AnimatePresence>
        {isAddModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsAddModalOpen(false)} className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="w-full max-w-lg bg-white rounded-[40px] shadow-2xl relative z-10 overflow-hidden border">
              <div className="p-8 pb-4 flex justify-between items-center">
                <div>
                  <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "1.5rem", fontWeight: 800, color: PLUM }}>New Assessment</h2>
                  <p style={{ color: MUTED, fontSize: "0.75rem", fontWeight: 600 }}>Examination Registration Portal</p>
                </div>
                <button onClick={() => setIsAddModalOpen(false)} className="w-10 h-10 rounded-full hover:bg-slate-50 flex items-center justify-center"><X size={20} color={MUTED} /></button>
              </div>
              <div className="p-8 pt-4 space-y-4">
                {[
                  { label: "Exam Name", placeholder: "e.g. End of Term Math" },
                  { label: "Date", type: "date" },
                  { label: "Total Marks", placeholder: "100" },
                ].map((f) => (
                  <div key={f.label}>
                    <label className="text-[10px] font-black uppercase tracking-widest mb-1.5 block ml-1" style={{ color: MUTED }}>{f.label}</label>
                    <input type={f.type || 'text'} placeholder={f.placeholder} className="w-full bg-slate-50 border rounded-xl px-4 py-3 text-sm font-bold outline-none focus:border-plum/30 transition-all" style={{ color: PLUM }} />
                  </div>
                ))}
              </div>
              <div className="p-8 bg-slate-50 flex gap-3">
                <Button className="flex-1 py-4 rounded-2xl text-xs font-black uppercase tracking-widest" onClick={() => setIsAddModalOpen(false)}>Register Exam</Button>
                <Button variant="secondary" className="flex-1 py-4 rounded-2xl text-xs font-black uppercase tracking-widest border-slate-200" onClick={() => setIsAddModalOpen(false)}>Discard</Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Exams;
