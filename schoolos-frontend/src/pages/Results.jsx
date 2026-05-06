import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BarChart3, 
  Search, 
  Filter, 
  Plus, 
  Award, 
  Target, 
  CheckCircle2, 
  X,
  MoreVertical,
  Star,
  TrendingUp,
  Download,
  Send,
  Award as AwardIcon,
  BookOpen,
  ChevronDown
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import Sidebar from '../components/layout/Sidebar';
import DashboardNavbar from '../components/layout/DashboardNavbar';
import { Button } from '../components/ui/Button';
import { buildUrl } from '../services/api';

const PLUM = "#381932";
const PLUM_LIGHT = "#512b4a";
const MILK = "#FFF3E6";
const MUTED = "#7D6077";

const gradeData = [
  { subject: "Math", avg: 78, highest: 96 },
  { subject: "English", avg: 82, highest: 98 },
  { subject: "Science", avg: 74, highest: 94 },
  { subject: "Social", avg: 88, highest: 100 },
  { subject: "ICT", avg: 85, highest: 97 },
  { subject: "French", avg: 71, highest: 91 },
];

const gradeColors = {
  A1: { bg: "#D1FAE5", color: "#065F46" },
  A2: { bg: "#DBEAFE", color: "#1E40AF" },
  B2: { bg: "#FEF3C7", color: "#92400E" },
  C4: { bg: "#FEE2E2", color: "#991B1B" },
};

const Results = ({ onNavigate }) => {
  const [activeItem, setActiveItem] = useState('results');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("results");
  const [loading, setLoading] = useState(true);
  const [results, setResults] = useState([]);
  const [search, setSearch] = useState("");
  const [generatingReport, setGeneratingReport] = useState(null);

  useEffect(() => {
    const fetchResults = async () => {
      try {
        const res = await fetch(buildUrl('/api/school/results'), { credentials: 'include' });
        const json = await res.json();
        if (json.data) {
          const mapped = (json.data.results || []).map((r, i) => ({
            ...r,
            grade: r.score >= 80 ? 'A1' : (r.score >= 70 ? 'A2' : 'B2'),
            position: i + 1,
            avg: r.score
          }));
          setResults(mapped);
        }
      } catch (err) {
        console.error("Failed to fetch results", err);
      } finally {
        setTimeout(() => setLoading(false), 800);
      }
    };
    fetchResults();
  }, []);

  const handleGenerate = (id) => {
    setGeneratingReport(id);
    setTimeout(() => setGeneratingReport(null), 2000);
  };

  const filtered = useMemo(() => {
    return (results.length > 0 ? results : []).filter(r => 
      (r.student_name || '').toLowerCase().includes(search.toLowerCase()) ||
      (r.subject_name || '').toLowerCase().includes(search.toLowerCase())
    );
  }, [results, search]);

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
          {[
            { label: "Class Average", value: "87.3%", icon: Target, color: "#6366F1" },
            { label: "Top Performer", value: "95.5%", icon: Star, color: "#F59E0B" },
            { label: "Pass Rate", value: "92.4%", icon: CheckCircle2, color: "#10B981" },
            { label: "Completion", value: "29/32", icon: BookOpen, color: "#EC4899" },
          ].map((s) => (
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

        {/* Tab Hub */}
        <div className="flex flex-wrap gap-4 items-center justify-between">
          <div className="flex items-center gap-4">
            <div
              className="flex p-1 rounded-2xl border"
              style={{ background: "white", borderColor: "rgba(56,25,50,0.08)" }}
            >
              {[
                { id: "results", label: "Results Ledger", icon: Award },
                { id: "exams", label: "Exam Schedule", icon: BookOpen },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id);
                    if (tab.id === 'exams') onNavigate('exams');
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
                placeholder="Search students..."
                className="bg-transparent outline-none text-xs flex-1 font-medium"
                style={{ color: PLUM }}
              />
            </div>
          </div>

          <button
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest active:scale-95 transition-transform"
            style={{
              background: `linear-gradient(135deg, ${PLUM}, ${PLUM_LIGHT})`,
              color: MILK,
              boxShadow: "0 4px 14px rgba(56,25,50,0.25)",
            }}
          >
            <Plus size={16} /> Enter Grades
          </button>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Results Table */}
          <div
            className="lg:col-span-2 rounded-[24px] overflow-hidden border flex flex-col"
            style={{
              background: "white",
              borderColor: "rgba(56,25,50,0.07)",
              boxShadow: "0 4px 24px rgba(56,25,50,0.06)",
            }}
          >
            <div className="px-6 py-4 border-b flex items-center justify-between" style={{ borderColor: "rgba(56,25,50,0.06)" }}>
               <h3 style={{ fontFamily: "'Playfair Display', serif", color: PLUM, fontWeight: 800, fontSize: "1.05rem" }}>Terminal Results Ledger</h3>
               <button className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest hover:opacity-70" style={{ color: PLUM_LIGHT }}><Download size={13} /> Export CSV</button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr style={{ borderBottom: `1px solid rgba(56,25,50,0.06)` }}>
                    {["#", "Student", "Subject", "Score", "Grade", "Action"].map((h) => (
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
                  {filtered.map((s) => (
                    <tr
                      key={s.id}
                      className="hover:bg-[#FFF3E6]/40 transition-colors border-b last:border-0"
                      style={{ borderColor: "rgba(56,25,50,0.04)" }}
                    >
                      <td className="px-6 py-4">
                        {s.position === 1 ? <AwardIcon size={14} color="#F59E0B" /> : <span style={{ color: MUTED, fontSize: "0.75rem", fontWeight: 600 }}>{s.position}</span>}
                      </td>
                      <td className="px-6 py-4">
                        <p style={{ color: PLUM, fontSize: "0.85rem", fontWeight: 700 }}>{s.student_name}</p>
                        <p style={{ color: MUTED, fontSize: "0.65rem", fontFamily: "'JetBrains Mono', monospace", fontWeight: 600 }}>{s.admission_no}</p>
                      </td>
                      <td className="px-6 py-4">
                         <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase" style={{ background: `rgba(56,25,50,0.07)`, color: PLUM_LIGHT }}>{s.subject_name}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span style={{ fontFamily: "'JetBrains Mono', monospace", color: PLUM, fontSize: "0.85rem", fontWeight: 800 }}>{s.score}%</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-black" style={gradeColors[s.grade] || gradeColors.B2}>
                          {s.grade}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => handleGenerate(s.id)}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest active:scale-95 transition-transform"
                          style={{
                            background: generatingReport === s.id ? "#D1FAE5" : `rgba(56,25,50,0.06)`,
                            color: generatingReport === s.id ? "#065F46" : PLUM,
                          }}
                        >
                          {generatingReport === s.id ? "Report Sent" : <><Send size={12} /> WhatsApp</>}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Performance Charts */}
          <div className="flex flex-col gap-6">
            <div
              className="p-6 rounded-[24px] border"
              style={{
                background: "white",
                borderColor: "rgba(56,25,50,0.07)",
                boxShadow: "0 4px 24px rgba(56,25,50,0.06)",
              }}
            >
              <h3 style={{ fontFamily: "'Playfair Display', serif", color: PLUM, fontWeight: 800, fontSize: "1.05rem", marginBottom: "1.5rem" }}>
                Subject Performance
              </h3>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={gradeData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(56,25,50,0.04)" horizontal={false} />
                  <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 10, fill: MUTED, fontWeight: 600 }} axisLine={false} tickLine={false} />
                  <YAxis dataKey="subject" type="category" tick={{ fontSize: 10, fill: PLUM_LIGHT, fontWeight: 700 }} axisLine={false} tickLine={false} width={45} />
                  <Tooltip contentStyle={{ background: "white", border: `1px solid rgba(56,25,50,0.1)`, borderRadius: 12, fontSize: 11, fontWeight: 600 }} />
                  <Bar dataKey="avg" fill={PLUM} radius={[0, 4, 4, 0]} barSize={10} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div
              className="p-6 rounded-[24px]"
              style={{
                background: `linear-gradient(135deg, ${PLUM} 0%, ${PLUM_LIGHT} 100%)`,
                boxShadow: "0 8px 28px rgba(56,25,50,0.2)",
              }}
            >
              <h3 style={{ fontFamily: "'Playfair Display', serif", color: MILK, fontWeight: 800, fontSize: "1.05rem", marginBottom: "1.2rem" }}>
                BECE Grade Scale
              </h3>
              {[
                { grade: "A1", range: "80 – 100", desc: "Distinction" },
                { grade: "B2", range: "70 – 79", desc: "Very Good" },
                { grade: "C4", range: "50 – 59", desc: "Credit" },
                { grade: "F9", range: "0 – 39", desc: "Fail" },
              ].map((g) => (
                <div key={g.grade} className="flex items-center justify-between py-2 border-b last:border-0" style={{ borderColor: "rgba(255,243,230,0.1)" }}>
                  <div className="flex items-center gap-2">
                    <span className="w-8 text-center py-0.5 rounded text-[9px] font-black uppercase" style={{ background: "rgba(255,243,230,0.15)", color: MILK }}>{g.grade}</span>
                    <span style={{ color: "rgba(255,243,230,0.7)", fontSize: "0.75rem", fontWeight: 600 }}>{g.desc}</span>
                  </div>
                  <span style={{ color: "rgba(255,243,230,0.5)", fontSize: "0.7rem", fontFamily: "'JetBrains Mono', monospace", fontWeight: 700 }}>{g.range}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Results;
