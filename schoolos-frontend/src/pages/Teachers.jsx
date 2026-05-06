import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, 
  Plus, 
  Search, 
  CheckCircle2, 
  Clock, 
  BookOpen,
  X,
  MoreVertical
} from 'lucide-react';
import { Button } from '../components/ui/Button';

const Teachers = ({ onNavigate }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  const stats = [
    { label: 'Total Teachers', value: 62, icon: Users, color: '#6366F1' },
    { label: 'Active Status', value: 58, icon: CheckCircle2, color: '#10B981' },
    { label: 'On Leave', value: 4, icon: Clock, color: '#F59E0B' },
    { label: 'Specialties', value: 18, icon: BookOpen, color: '#EC4899' },
  ];

  const teachers = [
    { id: 1, name: 'Mrs. Abena Mensah', dept: 'Mathematics', role: 'Form 1 Teacher', exp: '8 years', classes: 4, students: 140, subjects: ['Maths', 'Core Maths'], initials: 'AM' },
    { id: 2, name: 'Mr. Kofi Asante', dept: 'English', role: 'Form 2 Teacher', exp: '5 years', classes: 5, students: 165, subjects: ['English', 'Lit'], initials: 'KA' },
    { id: 3, name: 'Mrs. Akosua Boateng', dept: 'Science', role: 'Subject Teacher', exp: '12 years', classes: 6, students: 210, subjects: ['Physics', 'Chem'], initials: 'AB' },
    { id: 4, name: 'Mr. Kwame Osei', dept: 'Social Studies', role: 'Form 3 Teacher', exp: '3 years', classes: 3, students: 105, subjects: ['Social'], initials: 'KO' },
    { id: 5, name: 'Mrs. Efua Darko', dept: 'ICT', role: 'Subject Teacher', exp: '6 years', classes: 4, students: 140, subjects: ['ICT', 'CS'], initials: 'ED' },
    { id: 6, name: 'Mr. Yaw Mensah', dept: 'Languages', role: 'Subject Teacher', exp: '9 years', classes: 4, students: 140, subjects: ['French', 'Ga'], initials: 'YM' },
  ];

  const filteredTeachers = teachers.filter(t => 
    t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.dept.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-6 sm:p-8 flex flex-col gap-6">
        {/* KPI Row */}
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
                placeholder="Search staff or department..."
                className="bg-transparent border-none outline-none text-sm font-medium w-full"
                style={{ color: "var(--text-primary)" }}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
           </div>
           <button onClick={() => setIsModalOpen(true)} className="flex items-center gap-2 px-5 py-3 rounded-2xl text-xs font-black uppercase tracking-widest bg-plum text-milk shadow-lg shadow-plum/20">
              <Plus size={16} /> Add Teacher
           </button>
        </div>

        {/* Staff Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
           {filteredTeachers.map((t) => (
              <motion.div
                 key={t.id}
                 whileHover={{ y: -5 }}
                 className="p-8 rounded-[40px] border group relative overflow-hidden transition-all hover:shadow-xl"
                 style={{
                   background: "var(--card-bg)",
                   borderColor: "var(--border)",
                   boxShadow: "var(--shadow-card)",
                 }}
              >
                 <div className="absolute top-0 right-0 w-32 h-32 bg-black/[0.02] rounded-bl-[100px] -mr-8 -mt-8 group-hover:scale-110 transition-transform duration-500" />
                 
                 <div className="flex flex-col items-center text-center relative z-10">
                    <div className="w-20 h-20 rounded-[28px] bg-plum flex items-center justify-center text-milk font-black text-2xl mb-6 shadow-xl shadow-plum/10">
                       {t.initials}
                    </div>
                    
                    <h3 style={{ fontFamily: "'Playfair Display', serif", color: "var(--text-primary)", fontSize: "1.25rem", fontWeight: 800 }} className="mb-1">{t.name}</h3>
                    <div className="px-4 py-1 rounded-full text-[9px] font-black uppercase tracking-widest mb-6" style={{ background: "var(--bg-secondary)", color: "var(--text-muted)" }}>{t.role}</div>

                    <div className="flex flex-wrap justify-center gap-1.5 mb-8">
                       {t.subjects.map(s => (
                          <span key={s} className="px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-tighter" style={{ background: `var(--bg-secondary)`, color: "var(--text-primary)" }}>{s}</span>
                       ))}
                    </div>

                    <div className="w-full grid grid-cols-3 gap-2 rounded-3xl p-4 mb-8" style={{ background: "var(--bg-secondary)" }}>
                       <div className="text-center">
                          <div style={{ color: "var(--text-primary)", fontSize: "1rem", fontWeight: 800 }}>{t.classes}</div>
                          <div style={{ color: "var(--text-muted)", fontSize: "0.6rem", fontWeight: 800, textTransform: "uppercase" }}>Classes</div>
                       </div>
                       <div className="text-center border-x" style={{ borderColor: "var(--border)" }}>
                          <div style={{ color: "var(--text-primary)", fontSize: "1rem", fontWeight: 800 }}>{t.students}</div>
                          <div style={{ color: "var(--text-muted)", fontSize: "0.6rem", fontWeight: 800, textTransform: "uppercase" }}>Students</div>
                       </div>
                       <div className="text-center">
                          <div style={{ color: "var(--text-primary)", fontSize: "1rem", fontWeight: 800 }}>{t.exp.split(' ')[0]}</div>
                          <div style={{ color: "var(--text-muted)", fontSize: "0.6rem", fontWeight: 800, textTransform: "uppercase" }}>Years</div>
                       </div>
                    </div>

                    <div className="flex w-full gap-2">
                       <button className="flex-1 py-3 rounded-2xl border text-[10px] font-black uppercase tracking-widest transition-colors" style={{ color: "var(--text-primary)", borderColor: "var(--border)" }}>Profile</button>
                       <button className="flex-1 py-3 rounded-2xl bg-plum text-milk text-[10px] font-black uppercase tracking-widest shadow-sm">Message</button>
                    </div>
                 </div>
              </motion.div>
           ))}
        </div>
    </div>

      {/* Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsModalOpen(false)} className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="w-full max-w-lg rounded-[40px] shadow-2xl relative z-10 overflow-hidden border" style={{ background: "var(--card-bg)", borderColor: "var(--border)" }}>
              <div className="p-8 pb-4 flex justify-between items-center">
                <div>
                  <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "1.5rem", fontWeight: 800, color: "var(--text-primary)" }}>Staff Registration</h2>
                  <p style={{ color: "var(--text-muted)", fontSize: "0.75rem", fontWeight: 600 }}>Institutional Faculty Onboarding</p>
                </div>
                <button onClick={() => setIsModalOpen(false)} className="w-10 h-10 rounded-full hover:bg-black/5 flex items-center justify-center"><X size={20} style={{ color: "var(--text-muted)" }} /></button>
              </div>
              <div className="p-8 pt-4 space-y-4">
                 <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2">
                       <label className="text-[10px] font-black uppercase tracking-widest mb-1.5 block ml-1" style={{ color: "var(--text-muted)" }}>Full Name</label>
                       <input placeholder="e.g. Mrs. Abena Mensah" className="w-full border rounded-xl px-4 py-3 text-sm font-bold outline-none transition-all" style={{ background: "var(--bg-secondary)", color: "var(--text-primary)", borderColor: "var(--border)" }} />
                    </div>
                    <div>
                       <label className="text-[10px] font-black uppercase tracking-widest mb-1.5 block ml-1" style={{ color: "var(--text-muted)" }}>Staff ID</label>
                       <input placeholder="EMP-2024-001" className="w-full border rounded-xl px-4 py-3 text-sm font-bold outline-none transition-all" style={{ background: "var(--bg-secondary)", color: "var(--text-primary)", borderColor: "var(--border)" }} />
                    </div>
                    <div>
                       <label className="text-[10px] font-black uppercase tracking-widest mb-1.5 block ml-1" style={{ color: "var(--text-muted)" }}>Department</label>
                       <select className="w-full border rounded-xl px-4 py-3 text-sm font-bold outline-none transition-all cursor-pointer" style={{ background: "var(--bg-secondary)", color: "var(--text-primary)", borderColor: "var(--border)" }}>
                          <option>Mathematics</option>
                          <option>Science</option>
                          <option>ICT</option>
                       </select>
                    </div>
                 </div>
              </div>
              <div className="p-8 bg-black/[0.02] flex gap-3">
                <Button className="flex-1 py-4 rounded-2xl text-xs font-black uppercase tracking-widest bg-plum text-milk" onClick={() => setIsModalOpen(false)}>Onboard Staff</Button>
                <Button variant="secondary" className="flex-1 py-4 rounded-2xl text-xs font-black uppercase tracking-widest" style={{ borderColor: "var(--border)", color: "var(--text-primary)" }} onClick={() => setIsModalOpen(false)}>Cancel</Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Teachers;
