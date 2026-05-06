import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FileText, 
  Plus, 
  Clock, 
  CheckCircle2, 
  Search, 
  Calendar, 
  MoreVertical,
  X,
  Award,
  Download,
  Star,
  ClipboardList
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { buildUrl, getHeaders, handleApiError } from '../services/api';
import { useToast } from '../contexts/ToastContext';
import { useAuth } from '../contexts/AuthContext';

const Exams = ({ onNavigate }) => {
  const [activeTab, setActiveTab] = useState("exams");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [exams, setExams] = useState([]);
  const [search, setSearch] = useState("");
  const { showToast } = useToast();
  const { authSession } = useAuth();
  
  const [newExam, setNewExam] = useState({
    name: '', date: new Date().toISOString().split('T')[0], total_marks: 100, subject: 'Mathematics', class_name: ''
  });

  const fetchExams = async () => {
    setLoading(true);
    try {
      const res = await fetch(buildUrl('/api/school/exams'), {
        headers: getHeaders(authSession?.token),
        credentials: 'include'
      });
      const json = await res.json();
      if (res.ok) {
        setExams(json.data.exams || []);
      } else {
        throw new Error(json.error || 'Failed to fetch exams');
      }
    } catch (err) {
      showToast({ title: 'Sync Error', message: err.message, type: 'error' });
    } finally {
      setTimeout(() => setLoading(false), 800);
    }
  };

  useEffect(() => {
    fetchExams();
  }, []);

  const handleAddExam = async () => {
    try {
      const res = await fetch(buildUrl('/api/school/exams'), {
        method: 'POST',
        headers: getHeaders(authSession?.token),
        body: JSON.stringify(newExam),
        credentials: 'include'
      });
      if (res.ok) {
        setIsAddModalOpen(false);
        fetchExams();
        showToast({
          title: 'Assessment Registered',
          message: `${newExam.name} has been scheduled successfully.`,
          type: 'success'
        });
        setNewExam({ name: '', date: new Date().toISOString().split('T')[0], total_marks: 100, subject: 'Mathematics', class_name: '' });
      } else {
        const error = await handleApiError(res);
        throw new Error(error);
      }
    } catch (err) {
      showToast({ title: 'Error', message: err.message, type: 'error' });
    }
  };

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
    <div className="p-6 sm:p-8 flex flex-col gap-6">
      {/* Header */}
      <div className="mb-2">
         <h1 style={{ fontFamily: "'Playfair Display', serif", color: "var(--text-primary)", fontSize: "1.8rem", fontWeight: 800 }}>Academic Assessments</h1>
         <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", fontWeight: 600 }}>Managing examination schedules, terminal reports, and student rankings</p>
      </div>

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
          </div>
        ))}
      </div>

      {/* Tab Controls */}
      <div className="flex flex-wrap gap-4 items-center justify-between">
        <div className="flex items-center gap-4">
          <div
            className="flex p-1 rounded-2xl border"
            style={{ background: "var(--card-bg)", borderColor: "var(--border)" }}
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
                  background: activeTab === tab.id ? "var(--accent-primary)" : "transparent",
                  color: activeTab === tab.id ? "var(--bg-primary)" : "var(--text-muted)",
                  fontWeight: activeTab === tab.id ? 700 : 500,
                }}
              >
                <tab.icon size={14} />
                {tab.label}
              </button>
            ))}
          </div>

          <div
            className="hidden md:flex items-center gap-2 px-3 py-2 rounded-xl border group"
            style={{ background: "var(--card-bg)", borderColor: "var(--border)", width: 240 }}
          >
            <Search size={14} style={{ color: "var(--text-muted)" }} className="group-focus-within:scale-110 transition-transform" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search exams..."
              className="bg-transparent outline-none text-xs flex-1 font-medium"
              style={{ color: "var(--text-primary)" }}
            />
          </div>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest active:scale-95 transition-transform bg-plum text-milk shadow-lg shadow-plum/20"
        >
          <Plus size={16} /> Schedule Assessment
        </button>
      </div>

      {/* Exam Schedule View */}
      <div
        className="rounded-[24px] overflow-hidden border flex flex-col"
        style={{
          background: "var(--card-bg)",
          borderColor: "var(--border)",
          boxShadow: "var(--shadow-card)",
        }}
      >
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr style={{ borderBottom: `1px solid var(--border)`, background: "var(--bg-secondary)" }}>
                {["Examination Name", "Subject", "Class", "Date", "Status", "Actions"].map((h) => (
                  <th
                    key={h}
                    className="px-6 py-4 text-[10px] font-black uppercase tracking-widest"
                    style={{ color: "var(--text-muted)" }}
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
                  className="hover:bg-black/[0.02] transition-colors border-b last:border-0"
                  style={{ borderColor: "var(--border)" }}
                >
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl flex items-center justify-center text-plum/30 border" style={{ background: "var(--bg-secondary)", borderColor: "var(--border)" }}>
                        <FileText size={18} />
                      </div>
                      <span style={{ color: "var(--text-primary)", fontSize: "0.85rem", fontWeight: 700 }}>{e.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <span className="px-2 py-0.5 rounded-full text-xs font-black uppercase tracking-widest" style={{ background: `var(--bg-secondary)`, color: "var(--text-secondary)" }}>
                      {e.subject}
                    </span>
                  </td>
                  <td className="px-6 py-5">
                    <span style={{ color: "var(--text-muted)", fontSize: "0.75rem", fontWeight: 600 }}>{e.class_name}</span>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-2 text-xs font-bold" style={{ color: "var(--text-primary)" }}>
                      <Calendar size={14} style={{ color: "var(--text-muted)" }} />
                      {new Date(e.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <span
                      className="px-2.5 py-1 rounded-full text-xs font-black uppercase tracking-widest border"
                      style={new Date(e.date) < new Date() 
                        ? { background: "#D1FAE5", color: "#065F46", borderColor: "#A7F3D0" } 
                        : { background: "#FEF3C7", color: "#92400E", borderColor: "#FDE68A" }}
                    >
                      {new Date(e.date) < new Date() ? 'Completed' : 'Upcoming'}
                    </span>
                  </td>
                  <td className="px-6 py-5">
                    <button aria-label="More options" className="p-2 hover:bg-black/5 rounded-lg transition-colors"><MoreVertical size={16} style={{ color: "var(--text-muted)" }} /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="px-6 py-3 border-t flex items-center justify-between" style={{ borderColor: "var(--border)" }}>
          <p style={{ color: "var(--text-muted)", fontSize: "0.75rem", fontWeight: 600 }}>Total: {filteredExams.length} assessments</p>
          <button 
            onClick={() => {
              showToast({
                title: 'Preparing Export',
                message: 'The examination schedule is being compiled into a CSV file.',
                type: 'info'
              });
            }}
            className="flex items-center gap-1.5 text-xs font-black uppercase tracking-widest hover:opacity-70 transition-opacity" 
            style={{ color: "var(--text-primary)" }}
          >
            <Download size={13} /> Export Schedule
          </button>
        </div>
      </div>

      {/* Modal */}
      <AnimatePresence>
        {isAddModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsAddModalOpen(false)} className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="w-full max-w-lg rounded-[40px] shadow-2xl relative z-10 overflow-hidden border" style={{ background: "var(--card-bg)", borderColor: "var(--border)" }}>
              <div className="p-8 pb-4 flex justify-between items-center">
                <div>
                  <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "1.5rem", fontWeight: 800, color: "var(--text-primary)" }}>New Assessment</h2>
                  <p style={{ color: "var(--text-muted)", fontSize: "0.75rem", fontWeight: 600 }}>Examination Registration Portal</p>
                </div>
                <button aria-label="Close" onClick={() => setIsAddModalOpen(false)} className="w-10 h-10 rounded-full hover:bg-black/5 flex items-center justify-center"><X size={20} style={{ color: "var(--text-muted)" }} /></button>
              </div>
              <div className="p-8 pt-4 space-y-4">
                {[
                  { label: "Exam Name", key: "name", placeholder: "e.g. End of Term Math" },
                  { label: "Subject", key: "subject", placeholder: "Mathematics" },
                  { label: "Class", key: "class_name", placeholder: "e.g. Form 1A" },
                  { label: "Date", key: "date", type: "date" },
                  { label: "Total Marks", key: "total_marks", type: "number", placeholder: "100" },
                ].map((f) => (
                  <div key={f.label}>
                    <label className="text-xs font-black uppercase tracking-widest mb-1.5 block ml-1" style={{ color: "var(--text-muted)" }}>{f.label}</label>
                    <input 
                      type={f.type || 'text'} 
                      value={newExam[f.key]}
                      onChange={(e) => setNewExam({...newExam, [f.key]: f.type === 'number' ? parseInt(e.target.value) : e.target.value})}
                      placeholder={f.placeholder} 
                      className="w-full border rounded-xl px-4 py-3 text-sm font-bold outline-none transition-all" 
                      style={{ background: "var(--bg-secondary)", color: "var(--text-primary)", borderColor: "var(--border)" }} 
                    />
                  </div>
                ))}
              </div>
              <div className="p-8 bg-black/[0.02] flex gap-3">
                <Button 
                  className="flex-1 py-4 rounded-2xl text-xs font-black uppercase tracking-widest bg-plum text-milk" 
                  onClick={handleAddExam}
                >
                  Register Exam
                </Button>
                <Button variant="secondary" className="flex-1 py-4 rounded-2xl text-xs font-black uppercase tracking-widest" style={{ borderColor: "var(--border)", color: "var(--text-primary)" }} onClick={() => setIsAddModalOpen(false)}>Discard</Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Exams;

