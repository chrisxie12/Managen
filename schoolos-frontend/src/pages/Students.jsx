import React, { useState, useEffect, useMemo, useCallback } from 'react';
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
  GraduationCap
} from 'lucide-react';
import { buildUrl } from '../services/api';
import { Button } from '../components/ui/Button';
import { useToast } from '../contexts/ToastContext';
import { debounce } from '../utils/debounce';

const FeeStatusBadge = React.memo(({ status }) => {
  const map = {
    paid: { bg: "#D1FAE5", color: "#065F46", label: "Paid", icon: CheckCircle2 },
    partial: { bg: "#FEF3C7", color: "#92400E", label: "Partial", icon: Clock },
    overdue: { bg: "#FEE2E2", color: "#991B1B", label: "Overdue", icon: AlertCircle },
  };
  const s = map[status] || map.paid;
  return (
    <span
      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full"
      style={{ background: s.bg, color: s.color, fontSize: "0.75rem", fontWeight: 700 }}
    >
      <s.icon size={12} />
      {s.label}
    </span>
  );
});

const Students = React.memo(({ onNavigate }) => {
  const [search, setSearch] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [selected, setSelected] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { showToast } = useToast();

  const debouncedSearch = useMemo(() => debounce((q) => setSearchQuery(q), 300), []);
  
  const handleSearchChange = (e) => {
    setSearch(e.target.value);
    debouncedSearch(e.target.value);
  };
  
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
        const mapped = (json.data.students || []).map(s => ({
          ...s,
          feeStatus: s.is_active !== false ? 'paid' : 'overdue',
          attendance: Math.floor(Math.random() * 20) + 80,
          gpa: Math.floor(Math.random() * 30) + 70,
          address: s.address || 'Cantonments, Accra'
        }));
        setStudents(mapped);
      }
    } catch (err) {
      console.error("Failed to fetch students", err);
      showToast({
        title: 'Network Error',
        message: 'Could not synchronize student records.',
        type: 'error'
      });
    } finally {
      setTimeout(() => setLoading(false), 800);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  const filtered = useMemo(() => {
    return students.filter(s => 
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.admission_no.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [students, searchQuery]);

  const handleSelect = useCallback((s) => {
    setSelected(s);
  }, []);

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
        showToast({
          title: 'Student Provisioned',
          message: `${newStudent.name} has been added to the node.`,
          type: 'success'
        });
      } else {
        throw new Error(json.message || 'Failed to add student');
      }
    } catch (err) {
      console.error("Error adding student", err);
      showToast({
        title: 'Operation Failed',
        message: err.message,
        type: 'error'
      });
    }
  };

  return (
    <div className="p-6 h-full overflow-hidden">
      <div className="mb-6">
         <h1 style={{ fontFamily: "'Playfair Display', serif", color: "var(--text-primary)", fontSize: "1.8rem", fontWeight: 800 }}>Student Node</h1>
         <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", fontWeight: 600 }}>Institutional enrollment management and academic profile tracking</p>
      </div>
      <div className="flex gap-6 h-full">
          {/* Left Panel: List */}
          <div className="flex-1 flex flex-col min-w-0 h-full">
            {/* Toolbar */}
            <div className="flex flex-wrap gap-3 mb-6">
              <div
                className="flex items-center gap-2 px-3 py-2.5 rounded-xl flex-1 min-w-[200px] border transition-all focus-within:ring-2 focus-within:ring-plum/5 shadow-sm"
                style={{ background: "var(--card-bg)", borderColor: "var(--border)" }}
              >
                <Search size={14} style={{ color: "var(--text-muted)" }} />
                <input
                  value={search}
                  onChange={handleSearchChange}
                  placeholder="Search students or IDs..."
                  className="bg-transparent outline-none text-sm flex-1 font-medium"
                  style={{ color: "var(--text-primary)" }}
                />
              </div>

              <button
                onClick={() => setIsModalOpen(true)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold active:scale-95 transition-transform bg-plum text-milk shadow-lg shadow-plum/20"
              >
                <Plus size={16} /> Add Student
              </button>
            </div>

            {/* Table Container */}
            <div
              className="rounded-[24px] overflow-hidden flex-1 border flex flex-col"
              style={{
                background: "var(--card-bg)",
                borderColor: "var(--border)",
                boxShadow: "var(--shadow-card)",
              }}
            >
              <div className="overflow-y-auto flex-1 no-scrollbar">
                <table className="w-full text-left">
                  <thead className="sticky top-0 z-10" style={{ background: "var(--card-bg)" }}>
                    <tr style={{ borderBottom: `1px solid var(--border)` }}>
                      {["Student", "Class", "Attendance", "Fees", "GPA", ""].map((h) => (
                        <th
                          key={h}
                          className="px-6 py-4 text-xs font-black uppercase tracking-widest"
                          style={{ color: "var(--text-muted)" }}
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
                        onClick={() => handleSelect(s)}
                        className="cursor-pointer transition-colors border-b last:border-0 hover:bg-black/[0.02]"
                        style={{
                          borderColor: "var(--border)",
                          background: selected?.id === s.id ? `var(--bg-secondary)` : undefined,
                        }}
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div
                              className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 font-bold text-xs"
                              style={{
                                background: "var(--bg-secondary)",
                                color: "var(--text-primary)",
                                border: "1px solid var(--border)"
                              }}
                            >
                              {s.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                            </div>
                            <div>
                              <p style={{ color: "var(--text-primary)", fontSize: "0.85rem", fontWeight: 700 }}>{s.name}</p>
                              <p style={{ color: "var(--text-muted)", fontSize: "0.75rem", fontFamily: "'JetBrains Mono', monospace", fontWeight: 600 }}>{s.admission_no}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="px-2 py-0.5 rounded-full text-xs font-black uppercase tracking-tighter" style={{ background: `var(--bg-secondary)`, color: "var(--text-secondary)" }}>
                            {s.class_name}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <div className="h-1.5 w-12 rounded-full overflow-hidden bg-black/5">
                              <div className="h-full rounded-full" style={{ width: `${s.attendance}%`, background: s.attendance > 90 ? '#10B981' : '#F59E0B' }} />
                            </div>
                            <span style={{ fontFamily: "'JetBrains Mono', monospace", color: "var(--text-primary)", fontSize: "0.75rem", fontWeight: 700 }}>{s.attendance}%</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <FeeStatusBadge status={s.feeStatus} />
                        </td>
                        <td className="px-6 py-4">
                          <span style={{ fontFamily: "'JetBrains Mono', monospace", color: "var(--text-primary)", fontSize: "0.8rem", fontWeight: 800 }}>{s.gpa}%</span>
                        </td>
                        <td className="px-6 py-4">
                          <ChevronRight size={14} style={{ color: "var(--text-muted)" }} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="px-6 py-3 border-t flex items-center justify-between" style={{ borderColor: "var(--border)" }}>
                <p style={{ color: "var(--text-muted)", fontSize: "0.75rem", fontWeight: 600 }}>Showing {filtered.length} students</p>
                <button className="flex items-center gap-1 text-xs font-black uppercase tracking-widest hover:opacity-70 transition-opacity" style={{ color: "var(--text-primary)" }}>
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
                className="w-80 flex-shrink-0 rounded-[24px] overflow-hidden flex flex-col border shadow-xl"
                style={{
                  background: "var(--card-bg)",
                  borderColor: "var(--border)",
                }}
              >
                <div className="p-6 pb-8 text-white relative bg-plum">
                  <button onClick={() => setSelected(null)} className="absolute top-4 right-4 p-1 hover:bg-white/10 rounded-full transition-colors">
                    <X size={18} color="white" />
                  </button>
                  <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-5 shadow-lg" style={{ background: "rgba(255,243,230,0.15)", fontSize: "1.4rem", fontWeight: 800, fontFamily: "'Playfair Display', serif" }}>
                    {selected.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                  </div>
                  <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "1.25rem", fontWeight: 800, color: "white" }}>{selected.name}</h2>
                  <p style={{ color: "rgba(255,255,255,0.9)", fontSize: "0.8rem", fontFamily: "'JetBrains Mono', monospace", fontWeight: 600 }}>{selected.admission_no} · {selected.class_name}</p>
                </div>

                <div className="grid grid-cols-2 divide-x divide-y border-b" style={{ borderColor: "var(--border)" }}>
                  {[
                    { label: "GPA", value: `${selected.gpa}%` },
                    { label: "Attendance", value: `${selected.attendance}%` },
                    { label: "Class", value: selected.class_name },
                    { label: "Gender", value: selected.gender },
                  ].map((m, i) => (
                    <div key={i} className="p-4 text-center bg-black/[0.02]">
                      <div style={{ fontFamily: "'JetBrains Mono', monospace", color: "var(--text-primary)", fontSize: "0.95rem", fontWeight: 800 }}>{m.value}</div>
                      <div style={{ color: "var(--text-muted)", fontSize: "0.75rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>{m.label}</div>
                    </div>
                  ))}
                </div>

                <div className="p-6 flex-1 space-y-4">
                  <p className="uppercase tracking-widest font-black text-xs" style={{ color: "var(--text-muted)" }}>Contact Information</p>
                  <div className="space-y-3">
                    {[
                      { icon: Phone, label: selected.parent_phone },
                      { icon: Mail, label: selected.email || 'No email' },
                      { icon: MapPin, label: selected.address },
                    ].map(({ icon: Icon, label }, i) => (
                      <div key={i} className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "var(--bg-secondary)" }}>
                          <Icon size={14} style={{ color: "var(--text-primary)" }} />
                        </div>
                        <span style={{ color: "var(--text-primary)", fontSize: "0.82rem", fontWeight: 600 }} className="truncate">{label}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="p-5 flex flex-col gap-2">
                  <button 
                    onClick={() => {
                      showToast({
                        title: 'Sending Report',
                        message: `WhatsApp ledger for ${selected.name} is being generated.`,
                        type: 'info'
                      });
                    }}
                    className="w-full py-3 rounded-full text-xs font-black transition-all active:scale-95 bg-plum text-milk"
                  >
                    SEND WHATSAPP REPORT
                  </button>
                  <button 
                    onClick={() => {
                      showToast({
                        title: 'Feature Locked',
                        message: 'Profile editing is restricted in the preview node.',
                        type: 'warning'
                      });
                    }}
                    className="w-full py-3 rounded-full text-xs font-black transition-all active:scale-95 border-2" 
                    style={{ borderColor: "var(--border)", color: "var(--text-primary)" }}
                  >
                    EDIT PROFILE
                  </button>
                </div>
              </motion.div>
            ) : (
              <div className="w-80 flex-shrink-0 hidden lg:flex flex-col items-center justify-center rounded-[24px] border-2 border-dashed p-8 text-center" style={{ borderColor: "var(--border)" }}>
                <div className="w-16 h-16 rounded-3xl flex items-center justify-center mb-4 bg-black/5">
                  <GraduationCap size={28} style={{ color: "var(--text-muted)" }} />
                </div>
                <p style={{ color: "var(--text-primary)", fontWeight: 800, fontSize: "0.95rem" }}>Select a student</p>
                <p style={{ color: "var(--text-muted)", fontSize: "0.8rem", fontWeight: 500, lineHeight: 1.6, marginTop: "0.5rem" }}>Click any row to view the full student profile and academic stats.</p>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-6">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsModalOpen(false)} className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="w-full max-w-xl rounded-[40px] shadow-2xl relative z-10 overflow-hidden border" style={{ background: "var(--card-bg)", borderColor: "var(--border)" }}>
              <div className="p-8 pb-4 flex justify-between items-center">
                <div>
                  <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "1.5rem", fontWeight: 800, color: "var(--text-primary)" }}>New Student</h2>
                  <p style={{ color: "var(--text-muted)", fontSize: "0.75rem", fontWeight: 600 }}>Institutional Enrollment Form</p>
                </div>
                <button aria-label="Close" onClick={() => setIsModalOpen(false)} className="w-10 h-10 rounded-full hover:bg-black/5 flex items-center justify-center"><X size={20} style={{ color: "var(--text-muted)" }} /></button>
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
                    <label className="text-xs font-black uppercase tracking-widest mb-1.5 block ml-1" style={{ color: "var(--text-muted)" }}>{f.label}</label>
                    {f.type === 'select' ? (
                      <select value={newStudent[f.key]} onChange={(e) => setNewStudent({...newStudent, [f.key]: e.target.value})} className="w-full border rounded-xl px-4 py-3 text-sm font-bold outline-none focus:ring-2 focus:ring-plum/10 transition-all" style={{ background: "var(--bg-secondary)", color: "var(--text-primary)", borderColor: "var(--border)" }}>
                        {f.options.map(o => <option key={o}>{o}</option>)}
                      </select>
                    ) : (
                      <input value={newStudent[f.key]} onChange={(e) => setNewStudent({...newStudent, [f.key]: e.target.value})} placeholder={f.placeholder} className="w-full border rounded-xl px-4 py-3 text-sm font-bold outline-none focus:ring-2 focus:ring-plum/10 transition-all" style={{ background: "var(--bg-secondary)", color: "var(--text-primary)", borderColor: "var(--border)" }} />
                    )}
                  </div>
                ))}
              </div>
              <div className="p-8 bg-black/[0.02] flex gap-3">
                <Button className="flex-1 py-4 rounded-2xl text-xs font-black uppercase tracking-widest bg-plum text-milk" onClick={handleAddStudent}>Onboard Student</Button>
                <Button variant="secondary" className="flex-1 py-4 rounded-2xl text-xs font-black uppercase tracking-widest" style={{ borderColor: "var(--border)", color: "var(--text-primary)" }} onClick={() => setIsModalOpen(false)}>Cancel</Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Students;
