import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BookOpen, 
  Plus, 
  Users, 
  UserCheck, 
  GraduationCap, 
  X,
  Search,
  MoreVertical
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { useToast } from '../contexts/ToastContext';
import { useAuth } from '../contexts/AuthContext';
import { buildUrl, getHeaders } from '../services/api';
import { debounce } from '../utils/debounce';

const Classes = React.memo(({ onNavigate }) => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();
  const { authSession } = useAuth();

  const debouncedSearch = useMemo(() => debounce((q) => setSearchQuery(q), 300), []);
  
  const handleSearchChange = (e) => {
    setSearch(e.target.value);
    debouncedSearch(e.target.value);
  };
  
  const [classes, setClasses] = useState([]);
  const [newClass, setNewClass] = useState({
    name: '', capacity: 40, department: 'Junior High', teacher_id: ''
  });

  const fetchClasses = async () => {
    setLoading(true);
    try {
      const res = await fetch(buildUrl('/api/school/classes'), {
        headers: getHeaders(authSession?.token),
        credentials: 'include'
      });
      const json = await res.json();
      if (res.ok) {
        setClasses(json.data.classes || []);
      } else {
        throw new Error(json.error || 'Failed to load classes');
      }
    } catch (err) {
      showToast({ title: 'Sync Error', message: err.message, type: 'error' });
    } finally {
      setTimeout(() => setLoading(false), 800);
    }
  };

  useEffect(() => {
    fetchClasses();
  }, []);

  const handleAddClass = async () => {
    try {
      const res = await fetch(buildUrl('/api/school/classes'), {
        method: 'POST',
        headers: getHeaders(authSession?.token),
        body: JSON.stringify(newClass),
        credentials: 'include'
      });
      if (res.ok) {
        setIsAddModalOpen(false);
        fetchClasses();
        showToast({
          title: 'Section Provisioned',
          message: `${newClass.name} has been integrated into the node.`,
          type: 'success'
        });
        setNewClass({ name: '', capacity: 40, department: 'Junior High', teacher_id: '' });
      } else {
        const json = await res.json();
        throw new Error(json.error || 'Failed to create class');
      }
    } catch (err) {
      showToast({ title: 'Error', message: err.message, type: 'error' });
    }
  };

  const stats = useMemo(() => [
    { label: 'Academic Classes', value: 24, icon: BookOpen, color: '#6366F1' },
    { label: 'Total Enrollment', value: 847, icon: GraduationCap, color: '#10B981' },
    { label: 'Avg Class Size', value: 35, icon: Users, color: '#F59E0B' },
    { label: 'Lead Teachers', value: 24, icon: UserCheck, color: '#EC4899' },
  ], []);

  const filteredClasses = useMemo(() => {
    return classes.filter(c => 
      (c.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.teacher || '').toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [classes, searchQuery]);

  return (
    <div className="p-6 sm:p-8 flex flex-col gap-6">
        <div className="mb-2">
           <h1 style={{ fontFamily: "'Playfair Display', serif", color: "var(--text-primary)", fontSize: "1.8rem", fontWeight: 800 }}>Academic Structure</h1>
           <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", fontWeight: 600 }}>Managing institutional sections, enrollment capacity and classroom nodes</p>
        </div>
        {/* Metric Row */}
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

        {/* Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-4">
           <div className="flex-1 flex items-center gap-3 border rounded-2xl px-4 py-3 shadow-sm max-w-md" style={{ background: "var(--card-bg)", borderColor: "var(--border)" }}>
              <Search size={16} style={{ color: "var(--text-muted)" }} />
              <input 
                placeholder="Search class or teacher..."
                className="bg-transparent border-none outline-none text-sm font-medium w-full"
                style={{ color: "var(--text-primary)" }}
                value={search}
                onChange={handleSearchChange}
              />
           </div>
           <div className="flex gap-2">
              <button onClick={() => setIsAddModalOpen(true)} className="flex items-center gap-2 px-5 py-3 rounded-2xl text-xs font-black uppercase tracking-widest bg-plum text-milk shadow-lg shadow-plum/20">
                 <Plus size={16} /> New Section
              </button>
           </div>
        </div>

        {/* Class Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
           {filteredClasses.map((c) => {
              const occupancy = (c.students / c.capacity) * 100;
              return (
                 <motion.div
                    key={c.id}
                    whileHover={{ y: -5 }}
                    className="p-8 rounded-[32px] border group relative overflow-hidden transition-all hover:shadow-xl"
                    style={{
                      background: "var(--card-bg)",
                      borderColor: "var(--border)",
                      boxShadow: "var(--shadow-card)",
                    }}
                 >
                    <div className="absolute top-0 right-0 w-24 h-24 bg-black/[0.02] rounded-bl-[60px] -mr-8 -mt-8 group-hover:scale-110 transition-transform duration-500" />
                    <div className="flex justify-between items-start mb-6 relative z-10">
                       <span className="px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest" style={{ background: "var(--bg-secondary)", color: "var(--text-muted)" }}>{c.dept}</span>
                       <button aria-label="More options" className="text-slate-300 hover:text-plum transition-colors"><MoreVertical size={18} /></button>
                    </div>

                    <h3 style={{ fontFamily: "'Playfair Display', serif", color: "var(--text-primary)", fontSize: "1.5rem", fontWeight: 800, marginBottom: "0.5rem" }} className="relative z-10">{c.name}</h3>
                    
                    <div className="flex items-center gap-3 mb-8 relative z-10">
                       <div className="w-8 h-8 rounded-xl flex items-center justify-center font-black text-[10px] bg-plum text-milk">{c.initials}</div>
                       <span style={{ color: "var(--text-muted)", fontSize: "0.8rem", fontWeight: 700 }}>{c.teacher}</span>
                    </div>

                    <div className="space-y-3 relative z-10 mb-8">
                       <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest" style={{ color: "var(--text-muted)" }}>
                          <span>Enrollment</span>
                          <span>{c.students} / {c.capacity}</span>
                       </div>
                       <div className="h-2 w-full bg-black/5 rounded-full overflow-hidden">
                          <div className="h-full rounded-full transition-all duration-1000" style={{ width: `${occupancy}%`, background: occupancy > 90 ? '#EF4444' : '#10B981' }} />
                       </div>
                    </div>

                     <div className="flex gap-2 relative z-10">
                       <button 
                         onClick={() => {
                           showToast({
                             title: 'Loading Roster',
                             message: `Retrieving student list for ${c.name}.`,
                             type: 'info'
                           });
                         }}
                         className="flex-1 py-3 rounded-2xl border text-xs font-black uppercase tracking-widest transition-colors" 
                         style={{ color: "var(--text-primary)", borderColor: "var(--border)" }}
                       >
                         Roster
                       </button>
                       <button 
                         onClick={() => {
                           showToast({
                             title: 'Loading Schedule',
                             message: `Accessing academic timetable for ${c.name}.`,
                             type: 'info'
                           });
                         }}
                         className="flex-1 py-3 rounded-2xl border text-xs font-black uppercase tracking-widest transition-colors" 
                         style={{ color: "var(--text-primary)", borderColor: "var(--border)" }}
                       >
                         Schedule
                       </button>
                    </div>
                 </motion.div>
              );
           })}
        </div>

        {/* Add Class Modal */}
      <AnimatePresence>
        {isAddModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsAddModalOpen(false)} className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="w-full max-w-lg rounded-[40px] shadow-2xl relative z-10 overflow-hidden border" style={{ background: "var(--card-bg)", borderColor: "var(--border)" }}>
              <div className="p-8 pb-4 flex justify-between items-center">
                <div>
                  <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "1.5rem", fontWeight: 800, color: "var(--text-primary)" }}>New Academic Section</h2>
                  <p style={{ color: "var(--text-muted)", fontSize: "0.75rem", fontWeight: 600 }}>Structure • Class Management</p>
                </div>
                <button aria-label="Close" onClick={() => setIsAddModalOpen(false)} className="w-10 h-10 rounded-full hover:bg-black/5 flex items-center justify-center"><X size={20} style={{ color: "var(--text-muted)" }} /></button>
              </div>
              <div className="p-8 pt-4 space-y-4">
                 <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2">
                       <label className="text-xs font-black uppercase tracking-widest mb-1.5 block ml-1" style={{ color: "var(--text-muted)" }}>Class Name</label>
                       <input placeholder="e.g. Form 1A" className="w-full border rounded-xl px-4 py-3 text-sm font-bold outline-none transition-all" style={{ background: "var(--bg-secondary)", color: "var(--text-primary)", borderColor: "var(--border)" }} />
                    </div>
                    <div>
                       <label className="text-xs font-black uppercase tracking-widest mb-1.5 block ml-1" style={{ color: "var(--text-muted)" }}>Capacity</label>
                       <input type="number" placeholder="40" className="w-full border rounded-xl px-4 py-3 text-sm font-bold outline-none transition-all" style={{ background: "var(--bg-secondary)", color: "var(--text-primary)", borderColor: "var(--border)" }} />
                    </div>
                    <div>
                       <label className="text-xs font-black uppercase tracking-widest mb-1.5 block ml-1" style={{ color: "var(--text-muted)" }}>Department</label>
                       <select className="w-full border rounded-xl px-4 py-3 text-sm font-bold outline-none transition-all cursor-pointer" style={{ background: "var(--bg-secondary)", color: "var(--text-primary)", borderColor: "var(--border)" }}>
                          <option>Junior High</option>
                          <option>Senior High</option>
                       </select>
                    </div>
                  </div>
               </div>
              <div className="p-8 bg-black/[0.02] flex gap-3">
                <Button 
                  className="flex-1 py-4 rounded-2xl text-xs font-black uppercase tracking-widest bg-plum text-milk" 
                  onClick={handleAddClass}
                >
                  Create Section
                </Button>
                <Button variant="secondary" className="flex-1 py-4 rounded-2xl text-xs font-black uppercase tracking-widest" style={{ borderColor: "var(--border)", color: "var(--text-primary)" }} onClick={() => setIsAddModalOpen(false)}>Discard</Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
});

export default Classes;
