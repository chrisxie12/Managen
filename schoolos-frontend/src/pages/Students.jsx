import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, 
  Search, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  X,
  ChevronRight,
  Phone,
  Mail,
  MapPin,
  Download,
  Filter,
  MoreHorizontal
} from 'lucide-react';
import Sidebar from '../components/layout/Sidebar';
import DashboardNavbar from '../components/layout/DashboardNavbar';
import { buildUrl } from '../services/api';
import { Button } from '../components/ui/Button';

const PLUM = "#381932";
const PLUM_LIGHT = "#512b4a";
const MILK = "#FFF3E6";
const MUTED = "#7D6077";

const FeeStatusBadge = ({ status }) => {
  const map = {
    paid: { bg: "#D1FAE5", color: "#065F46", label: "Paid", icon: CheckCircle2 },
    partial: { bg: "#FEF3C7", color: "#92400E", label: "Partial", icon: Clock },
    overdue: { bg: "#FEE2E2", color: "#991B1B", label: "Overdue", icon: AlertCircle },
  };
  const s = map[status] || map.paid;
  return (
    <span
      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full"
      style={{ background: s.bg, color: s.color, fontSize: "0.72rem", fontWeight: 700 }}
    >
      <s.icon size={10} />
      {s.label}
    </span>
  );
};

const Students = ({ onNavigate }) => {
  const [activeItem, setActiveItem] = useState('students');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newStudent, setNewStudent] = useState({
    name: '', admission_no: '', email: '', parent_phone: '', dob: '', gender: 'Male', class_name: 'JHS 3A', address: ''
  });

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const res = await fetch(buildUrl('/api/school/students'), { credentials: 'include' });
      const json = await res.json();
      if (json.data) {
        // Map backend data to UI format if needed
        const mapped = (json.data.students || []).map(s => ({
          ...s,
          feeStatus: s.is_active !== false ? 'paid' : 'overdue', // Mocking fee status for now
          attendance: Math.floor(Math.random() * 20) + 80, // Mocking attendance
          gpa: Math.floor(Math.random() * 30) + 70, // Mocking gpa
          address: s.address || 'Cantonments, Accra'
        }));
        setStudents(mapped);
      }
    } catch (err) {
      console.error("Failed to fetch students", err);
    } finally {
      setTimeout(() => setLoading(false), 800);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  const filtered = useMemo(() => {
    return students.filter(s => 
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.admission_no.toLowerCase().includes(search.toLowerCase())
    );
  }, [students, search]);

  const handleAddStudent = async () => {
    try {
      const res = await fetch(buildUrl('/api/school/students'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newStudent),
        credentials: 'include'
      });
      const json = await res.json();
      if (json.data) {
        setIsModalOpen(false);
        fetchStudents();
        setNewStudent({
          name: '', admission_no: '', email: '', parent_phone: '', dob: '', gender: 'Male', class_name: 'JHS 3A', address: ''
        });
      }
    } catch (err) {
      console.error("Error adding student", err);
    }
  };

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

      <main className="lg:ml-64 pt-16 p-6 h-[calc(100vh-64px)] overflow-hidden">
        <div className="flex gap-6 h-full">
          {/* Left Panel: List */}
          <div className="flex-1 flex flex-col min-w-0 h-full">
            {/* Toolbar */}
            <div className="flex flex-wrap gap-3 mb-6">
              <div
                className="flex items-center gap-2 px-3 py-2.5 rounded-xl flex-1 min-w-[200px] border transition-all focus-within:border-plum/20 shadow-sm"
                style={{ background: "white", borderColor: "rgba(56,25,50,0.08)" }}
              >
                <Search size={14} color={MUTED} />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search students or IDs..."
                  className="bg-transparent outline-none text-sm flex-1 font-medium"
                  style={{ color: PLUM }}
                />
              </div>

              <button
                onClick={() => setIsModalOpen(true)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold active:scale-95 transition-transform"
                style={{
                  background: `linear-gradient(135deg, ${PLUM}, ${PLUM_LIGHT})`,
                  color: MILK,
                  boxShadow: "0 4px 14px rgba(56,25,50,0.2)",
                }}
              >
                <Plus size={16} /> Add Student
              </button>
            </div>

            {/* Table Container */}
            <div
              className="rounded-[24px] overflow-hidden flex-1 border flex flex-col"
              style={{
                background: "white",
                borderColor: "rgba(56,25,50,0.07)",
                boxShadow: "0 4px 24px rgba(56,25,50,0.06)",
              }}
            >
              <div className="overflow-y-auto flex-1 no-scrollbar">
                <table className="w-full text-left">
                  <thead className="sticky top-0 bg-white z-10">
                    <tr style={{ borderBottom: `1px solid rgba(56,25,50,0.06)` }}>
                      {["Student", "Class", "Attendance", "Fees", "GPA", ""].map((h) => (
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
                        onClick={() => setSelected(s)}
                        className="cursor-pointer hover:bg-[#FFF3E6]/40 transition-colors border-b last:border-0"
                        style={{
                          borderColor: "rgba(56,25,50,0.04)",
                          background: selected?.id === s.id ? `rgba(56,25,50,0.04)` : undefined,
                        }}
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div
                              className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 font-bold text-xs"
                              style={{
                                background: `linear-gradient(135deg, ${PLUM}15, ${PLUM_LIGHT}25)`,
                                color: PLUM,
                              }}
                            >
                              {s.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                            </div>
                            <div>
                              <p style={{ color: PLUM, fontSize: "0.85rem", fontWeight: 700 }}>{s.name}</p>
                              <p style={{ color: MUTED, fontSize: "0.7rem", fontFamily: "'JetBrains Mono', monospace", fontWeight: 600 }}>{s.admission_no}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-tighter" style={{ background: `rgba(56,25,50,0.07)`, color: PLUM_LIGHT }}>
                            {s.class_name}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <div className="h-1.5 w-12 rounded-full overflow-hidden bg-black/5">
                              <div className="h-full rounded-full" style={{ width: `${s.attendance}%`, background: s.attendance > 90 ? '#10B981' : '#F59E0B' }} />
                            </div>
                            <span style={{ fontFamily: "'JetBrains Mono', monospace", color: PLUM, fontSize: "0.75rem", fontWeight: 700 }}>{s.attendance}%</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <FeeStatusBadge status={s.feeStatus} />
                        </td>
                        <td className="px-6 py-4">
                          <span style={{ fontFamily: "'JetBrains Mono', monospace", color: PLUM, fontSize: "0.8rem", fontWeight: 800 }}>{s.gpa}%</span>
                        </td>
                        <td className="px-6 py-4">
                          <ChevronRight size={14} color={MUTED} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="px-6 py-3 border-t flex items-center justify-between" style={{ borderColor: "rgba(56,25,50,0.06)" }}>
                <p style={{ color: MUTED, fontSize: "0.75rem", fontWeight: 600 }}>Showing {filtered.length} students</p>
                <button className="flex items-center gap-1 text-[10px] font-black uppercase tracking-widest hover:opacity-70 transition-opacity" style={{ color: PLUM_LIGHT }}>
                  <Download size={12} /> Export
                </button>
              </div>
            </div>
          </div>

          {/* Right Panel: Detail */}
          <AnimatePresence mode="wait">
            {selected ? (
              <motion.div
                key={selected.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="w-80 flex-shrink-0 rounded-[24px] overflow-hidden flex flex-col border"
                style={{
                  background: "white",
                  borderColor: "rgba(56,25,50,0.07)",
                  boxShadow: "0 4px 24px rgba(56,25,50,0.08)",
                }}
              >
                <div className="p-6 pb-8 text-white relative" style={{ background: `linear-gradient(135deg, ${PLUM} 0%, ${PLUM_LIGHT} 100%)` }}>
                  <button onClick={() => setSelected(null)} className="absolute top-4 right-4 p-1 hover:bg-white/10 rounded-full transition-colors">
                    <X size={18} />
                  </button>
                  <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-5 shadow-lg" style={{ background: "rgba(255,243,230,0.15)", fontSize: "1.4rem", fontWeight: 800, fontFamily: "'Playfair Display', serif" }}>
                    {selected.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                  </div>
                  <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: "1.25rem", fontWeight: 800 }}>{selected.name}</h3>
                  <p style={{ color: "rgba(255,243,230,0.6)", fontSize: "0.8rem", fontFamily: "'JetBrains Mono', monospace", fontWeight: 600 }}>{selected.admission_no} · {selected.class_name}</p>
                  <div className="flex gap-2 mt-4">
                    <FeeStatusBadge status={selected.feeStatus} />
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase" style={{ background: "rgba(255,243,230,0.12)", color: "rgba(255,243,230,0.8)" }}>{selected.gender}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 divide-x divide-y border-b" style={{ borderColor: "rgba(56,25,50,0.05)" }}>
                  {[
                    { label: "GPA", value: `${selected.gpa}%` },
                    { label: "Attendance", value: `${selected.attendance}%` },
                    { label: "Class", value: selected.class_name },
                    { label: "Gender", value: selected.gender },
                  ].map((m, i) => (
                    <div key={i} className="p-4 text-center bg-slate-50/30">
                      <div style={{ fontFamily: "'JetBrains Mono', monospace", color: PLUM, fontSize: "0.95rem", fontWeight: 800 }}>{m.value}</div>
                      <div style={{ color: MUTED, fontSize: "0.7rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>{m.label}</div>
                    </div>
                  ))}
                </div>

                <div className="p-6 flex-1 space-y-4">
                  <p className="uppercase tracking-widest font-black text-[10px]" style={{ color: MUTED }}>Contact Information</p>
                  <div className="space-y-3">
                    {[
                      { icon: Phone, label: selected.parent_phone },
                      { icon: Mail, label: selected.email || 'No email' },
                      { icon: MapPin, label: selected.address },
                    ].map(({ icon: Icon, label }, i) => (
                      <div key={i} className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: `rgba(56,25,50,0.05)` }}>
                          <Icon size={14} color={PLUM_LIGHT} />
                        </div>
                        <span style={{ color: PLUM_LIGHT, fontSize: "0.82rem", fontWeight: 600 }} className="truncate">{label}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="p-5 flex flex-col gap-2">
                  <button className="w-full py-3 rounded-full text-xs font-black transition-all active:scale-95" style={{ background: `linear-gradient(135deg, ${PLUM}, ${PLUM_LIGHT})`, color: MILK }}>
                    SEND WHATSAPP REPORT
                  </button>
                  <button className="w-full py-3 rounded-full text-xs font-black transition-all active:scale-95 border-2" style={{ borderColor: "rgba(56,25,50,0.15)", color: PLUM }}>
                    EDIT PROFILE
                  </button>
                </div>
              </motion.div>
            ) : (
              <div className="w-80 flex-shrink-0 hidden lg:flex flex-col items-center justify-center rounded-[24px] border-2 border-dashed p-8 text-center" style={{ borderColor: "rgba(56,25,50,0.1)" }}>
                <div className="w-16 h-16 rounded-3xl flex items-center justify-center mb-4 bg-slate-50">
                  <GraduationCap size={28} color={MUTED} />
                </div>
                <p style={{ color: PLUM, fontWeight: 800, fontSize: "0.95rem" }}>Select a student</p>
                <p style={{ color: MUTED, fontSize: "0.8rem", fontWeight: 500, lineHeight: 1.6, marginTop: "0.5rem" }}>Click any row to view the full student profile and academic stats.</p>
              </div>
            )}
          </AnimatePresence>
        </div>
      </main>

      {/* Modal remains largely same but updated aesthetic */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-6">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsModalOpen(false)} className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="w-full max-w-xl bg-white rounded-[40px] shadow-2xl relative z-10 overflow-hidden border">
              <div className="p-8 pb-4 flex justify-between items-center">
                <div>
                  <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "1.5rem", fontWeight: 800, color: PLUM }}>New Student</h2>
                  <p style={{ color: MUTED, fontSize: "0.75rem", fontWeight: 600 }}>Institutional Enrollment Form</p>
                </div>
                <button onClick={() => setIsModalOpen(false)} className="w-10 h-10 rounded-full hover:bg-slate-50 flex items-center justify-center"><X size={20} color={MUTED} /></button>
              </div>
              <div className="p-8 pt-4 grid grid-cols-2 gap-4">
                {[
                  { label: "Full Name", key: "name", placeholder: "e.g. Ama Mensah" },
                  { label: "Admission ID", key: "admission_no", placeholder: "OS-2024-001" },
                  { label: "Parent Phone", key: "parent_phone", placeholder: "+233..." },
                  { label: "Email", key: "email", placeholder: "optional" },
                  { label: "Address", key: "address", placeholder: "e.g. Accra" },
                  { label: "Gender", key: "gender", type: "select", options: ["Male", "Female"] },
                ].map((f) => (
                  <div key={f.key} className={f.key === 'name' || f.key === 'address' ? 'col-span-2' : ''}>
                    <label className="text-[10px] font-black uppercase tracking-widest mb-1.5 block ml-1" style={{ color: MUTED }}>{f.label}</label>
                    {f.type === 'select' ? (
                      <select value={newStudent[f.key]} onChange={(e) => setNewStudent({...newStudent, [f.key]: e.target.value})} className="w-full bg-slate-50 border rounded-xl px-4 py-3 text-sm font-bold outline-none focus:border-plum/30 transition-all" style={{ color: PLUM }}>
                        {f.options.map(o => <option key={o}>{o}</option>)}
                      </select>
                    ) : (
                      <input value={newStudent[f.key]} onChange={(e) => setNewStudent({...newStudent, [f.key]: e.target.value})} placeholder={f.placeholder} className="w-full bg-slate-50 border rounded-xl px-4 py-3 text-sm font-bold outline-none focus:border-plum/30 transition-all" style={{ color: PLUM }} />
                    )}
                  </div>
                ))}
              </div>
              <div className="p-8 bg-slate-50 flex gap-3">
                <Button className="flex-1 py-4 rounded-2xl text-xs font-black uppercase tracking-widest" onClick={handleAddStudent}>Onboard Student</Button>
                <Button variant="secondary" className="flex-1 py-4 rounded-2xl text-xs font-black uppercase tracking-widest border-slate-200" onClick={() => setIsModalOpen(false)}>Cancel</Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Students;
