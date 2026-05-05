import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence, useMotionValue, useSpring } from 'framer-motion';
import { 
  GraduationCap, 
  Plus, 
  FileDown, 
  Search, 
  Filter, 
  CheckCircle2, 
  XCircle, 
  UserPlus, 
  Eye, 
  Edit2, 
  Trash2, 
  X,
  ChevronRight,
  ChevronLeft,
  Mail,
  Phone,
  Calendar,
  MoreVertical
} from 'lucide-react';
import Sidebar from '../components/layout/Sidebar';
import DashboardNavbar from '../components/layout/DashboardNavbar';
import { buildUrl } from '../services/api';
import { Button } from '../components/ui/Button';
import { SkeletonLoader } from '../components/ui/SkeletonLoader';
import { EmptyState } from '../components/ui/EmptyState';

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

const Students = ({ onNavigate }) => {
  const [activeItem, setActiveItem] = useState('students');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [hoveredRow, setHoveredRow] = useState(null);
  
  const [students, setStudents] = useState([]);
  const [totalStudents, setTotalStudents] = useState(0);
  const [loading, setLoading] = useState(true);
  const [newStudent, setNewStudent] = useState({
    name: '',
    admission_no: '',
    email: '',
    parent_phone: '',
    dob: '',
    gender: 'Male',
    class_name: 'Form 1A'
  });

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const res = await fetch(buildUrl('/api/school/students'), { credentials: 'include' });
      const json = await res.json();
      if (json.data) {
        setStudents(json.data.students || []);
        setTotalStudents(json.data.total || 0);
      }
    } catch (err) {
      console.error("Failed to fetch students", err);
    } finally {
      // Simulate a bit of loading for premium feel
      setTimeout(() => setLoading(false), 800);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  const filteredStudents = useMemo(() => {
    return students.filter(s => 
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.admission_no.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [students, searchQuery]);

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
          name: '', admission_no: '', email: '', parent_phone: '', dob: '', gender: 'Male', class_name: 'Form 1A'
        });
      }
    } catch (err) {
      console.error("Error adding student", err);
    }
  };

  const stats = [
    { label: 'Total Students', value: totalStudents, icon: GraduationCap, color: 'text-accent-primary', bg: 'bg-accent-primary/10' },
    { label: 'Active', value: totalStudents, icon: CheckCircle2, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
    { label: 'Inactive', value: 0, icon: XCircle, color: 'text-red-500', bg: 'bg-red-500/10' },
    { label: 'New This Month', value: 0, icon: UserPlus, color: 'text-amber-500', bg: 'bg-amber-500/10' },
  ];

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

      <main className="md:ml-[260px] pt-20 p-8 text-text-primary">
        {/* Page Header */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-4"
        >
          <div>
            <div className="flex items-center gap-3 mb-1">
              <div className="w-10 h-10 bg-accent-primary/10 rounded-xl flex items-center justify-center text-accent-primary">
                <GraduationCap size={24} />
              </div>
              <h1 className="text-3xl font-black tracking-tight font-headings">Students</h1>
            </div>
            <p className="text-text-muted text-sm font-medium">Centralized repository for all student profiles and academic history.</p>
          </div>
          <div className="flex gap-3">
            <Button variant="secondary" className="px-5">
              <FileDown size={18} className="mr-2" /> Export
            </Button>
            <Button onClick={() => setIsModalOpen(true)} className="px-5 shadow-lg shadow-accent-primary/20">
              <Plus size={18} className="mr-2" /> Add Student
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
              className="bg-white border border-slate-100 rounded-[24px] p-6 shadow-sm hover:shadow-md transition-all duration-300 group"
            >
              <div className="flex items-center gap-5">
                <div className={`w-14 h-14 rounded-2xl ${stat.bg} flex items-center justify-center ${stat.color} group-hover:scale-110 transition-transform`}>
                  <stat.icon size={28} />
                </div>
                <div>
                  <div className="text-3xl font-black text-text-primary tracking-tight">
                    <CountUp value={stat.value} />
                  </div>
                  <div className="text-[10px] text-text-muted font-black uppercase tracking-widest">{stat.label}</div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Filter Bar */}
        <div className="bg-slate-50 border border-slate-100 rounded-[28px] p-2 mb-8 flex flex-col lg:flex-row items-center gap-2">
          <div className="relative flex-1 w-full lg:w-auto">
            <Search size={18} className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              placeholder="Search by name, admission ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white border border-slate-100 rounded-[22px] py-4 pl-14 pr-6 text-sm text-text-primary outline-none focus:border-accent-primary/30 transition-all font-medium placeholder:text-slate-400"
            />
          </div>
          <div className="flex items-center gap-2 w-full lg:w-auto overflow-x-auto no-scrollbar p-1">
            {['All Classes', 'Status', 'Gender'].map((label, idx) => (
              <div key={idx} className="relative group">
                <select className="appearance-none bg-white border border-slate-100 rounded-[20px] px-6 py-3.5 pr-10 text-xs font-bold text-slate-600 outline-none cursor-pointer hover:border-accent-primary/30 transition-all min-w-[140px]">
                  <option>{label}</option>
                </select>
                <Filter size={12} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              </div>
            ))}
            <Button variant="ghost" className="h-12 w-12 p-0 rounded-full bg-white border border-slate-100">
              <MoreVertical size={18} />
            </Button>
          </div>
        </div>

        {/* Data Table */}
        <div className="bg-white border border-slate-100 rounded-[32px] overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50 text-slate-400 text-[10px] uppercase tracking-widest font-black">
                  <th className="px-8 py-5 w-12"><input type="checkbox" className="rounded-md border-slate-200 text-accent-primary focus:ring-accent-primary/20" /></th>
                  <th className="px-6 py-5">Full Student Name</th>
                  <th className="px-6 py-5">Admission</th>
                  <th className="px-6 py-5">Assigned Class</th>
                  <th className="px-6 py-5">Guardianship</th>
                  <th className="px-6 py-5">Current Status</th>
                  <th className="px-8 py-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i}>
                      <td className="px-8 py-6"><SkeletonLoader width="18px" height="18px" /></td>
                      <td className="px-6 py-6">
                        <div className="flex items-center gap-3">
                          <SkeletonLoader width="36px" height="36px" borderRadius="999px" />
                          <div className="space-y-2">
                            <SkeletonLoader width="140px" height="14px" />
                            <SkeletonLoader width="100px" height="10px" />
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-6"><SkeletonLoader width="80px" height="14px" /></td>
                      <td className="px-6 py-6"><SkeletonLoader width="70px" height="14px" /></td>
                      <td className="px-6 py-6"><SkeletonLoader width="110px" height="14px" /></td>
                      <td className="px-6 py-6"><SkeletonLoader width="60px" height="20px" borderRadius="99px" /></td>
                      <td className="px-8 py-6 text-right"><SkeletonLoader width="80px" height="32px" className="ml-auto" /></td>
                    </tr>
                  ))
                ) : filteredStudents.length > 0 ? (
                  filteredStudents.map((s, i) => (
                    <motion.tr
                      key={s.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: i * 0.03 }}
                      onMouseEnter={() => setHoveredRow(s.id)}
                      onMouseLeave={() => setHoveredRow(null)}
                      className="hover:bg-slate-50/50 transition-colors group cursor-pointer"
                    >
                      <td className="px-8 py-5"><input type="checkbox" className="rounded-md border-slate-200 text-accent-primary" /></td>
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-accent-primary/10 to-accent-secondary/10 flex items-center justify-center text-accent-primary font-black text-xs border border-accent-primary/5">
                            {s.name.substring(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <div className="text-sm font-bold text-text-primary group-hover:text-accent-primary transition-colors">{s.name}</div>
                            <div className="text-[11px] text-text-muted font-medium flex items-center gap-1.5">
                              <Mail size={10} /> {s.email || 'No email registered'}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <span className="text-xs font-black text-slate-400 uppercase tracking-tighter">ID: </span>
                        <span className="text-xs font-bold text-text-secondary">{s.admission_no}</span>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-accent-primary" />
                          <span className="text-sm font-bold text-text-primary tracking-tight">{s.class_name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex flex-col">
                          <span className="text-xs font-bold text-text-secondary flex items-center gap-1.5">
                            <Phone size={10} className="text-slate-300" /> {s.parent_phone}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border ${
                          s.is_active !== false 
                            ? 'bg-emerald-50 border-emerald-100 text-emerald-600' 
                            : 'bg-rose-50 border-rose-100 text-rose-600'
                        }`}>
                          <div className={`w-1.5 h-1.5 rounded-full ${s.is_active !== false ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                          <span className="text-[10px] font-black uppercase tracking-wider">
                            {s.is_active !== false ? 'Enrolled' : 'Withdrawn'}
                          </span>
                        </div>
                      </td>
                      <td className="px-8 py-5 text-right">
                        <div className={`inline-flex items-center gap-1 transition-all duration-200 ${hoveredRow === s.id ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-2'}`}>
                          <Button variant="ghost" size="sm" className="w-9 h-9 p-0 rounded-xl hover:bg-white hover:shadow-sm"><Eye size={16} /></Button>
                          <Button variant="ghost" size="sm" className="w-9 h-9 p-0 rounded-xl text-accent-primary hover:bg-white hover:shadow-sm"><Edit2 size={16} /></Button>
                          <Button variant="ghost" size="sm" className="w-9 h-9 p-0 rounded-xl text-rose-500 hover:bg-rose-50"><Trash2 size={16} /></Button>
                        </div>
                      </td>
                    </motion.tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7}>
                      <EmptyState 
                        isSearch={searchQuery.length > 0}
                        title={searchQuery ? "No matching students" : "Start your student roster"}
                        description={searchQuery 
                          ? `We couldn't find any student matching "${searchQuery}". Please refine your search terms.`
                          : "Your school doesn't have any students enrolled yet. Digitalize your records by adding your first student profile."}
                        actionLabel={!searchQuery && "Onboard First Student"}
                        onAction={() => setIsModalOpen(true)}
                      />
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Footer Controls */}
          <div className="px-8 py-6 bg-slate-50/50 border-t border-slate-100 flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-[11px] text-slate-400 font-bold uppercase tracking-widest">
              Total Managed: <span className="text-text-primary">{filteredStudents.length}</span> / {totalStudents}
            </div>
            <div className="flex items-center gap-3">
              <Button variant="secondary" size="sm" className="h-10 px-4 rounded-xl text-xs font-bold border-slate-200" disabled>
                <ChevronLeft size={16} className="mr-1" /> Previous
              </Button>
              <div className="flex gap-1.5">
                {[1].map((n) => (
                  <button key={n} className="w-10 h-10 rounded-xl text-xs font-black bg-accent-primary text-white shadow-lg shadow-accent-primary/20">
                    {n}
                  </button>
                ))}
              </div>
              <Button variant="secondary" size="sm" className="h-10 px-4 rounded-xl text-xs font-bold border-slate-200" disabled>
                Next <ChevronRight size={16} className="ml-1" />
              </Button>
            </div>
          </div>
        </div>
      </main>

      {/* Add Student Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
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
                  <h2 className="text-2xl font-black tracking-tight text-text-primary font-headings">New Student Profile</h2>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Academics • Student Onboarding</p>
                </div>
                <button onClick={() => setIsModalOpen(false)} className="w-12 h-12 flex items-center justify-center rounded-full bg-white border border-slate-100 text-slate-400 hover:text-text-primary transition-colors shadow-sm">
                  <X size={20} />
                </button>
              </div>

              <div className="p-10 max-h-[60vh] overflow-y-auto no-scrollbar">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {[
                    { label: 'Full Student Name', key: 'name', placeholder: 'e.g. John Smith' },
                    { label: 'Admission ID', key: 'admission_no', placeholder: 'OS-2026-001' },
                    { label: 'Email Address', key: 'email', type: 'email', placeholder: 'student@school.com' },
                    { label: 'Guardian Phone', key: 'parent_phone', placeholder: '+233...' },
                    { label: 'Date of Birth', key: 'dob', type: 'date' },
                  ].map((field) => (
                    <div key={field.key} className="flex flex-col gap-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] ml-1">{field.label}</label>
                      <input 
                        type={field.type || 'text'}
                        value={newStudent[field.key]}
                        onChange={(e) => setNewStudent({...newStudent, [field.key]: e.target.value})}
                        placeholder={field.placeholder}
                        className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 text-sm font-bold text-text-primary outline-none focus:bg-white focus:border-accent-primary/30 transition-all shadow-sm"
                      />
                    </div>
                  ))}
                  <div className="flex flex-col gap-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] ml-1">Assigned Class</label>
                    <div className="relative group">
                      <select 
                        value={newStudent.class_name}
                        onChange={(e) => setNewStudent({...newStudent, class_name: e.target.value})}
                        className="w-full appearance-none bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 text-sm font-bold text-text-primary outline-none focus:bg-white focus:border-accent-primary/30 transition-all shadow-sm cursor-pointer"
                      >
                        <option value="Form 1A">Form 1A</option>
                        <option value="Form 1B">Form 1B</option>
                        <option value="Form 2A">Form 2A</option>
                      </select>
                      <Filter size={14} className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none" />
                    </div>
                  </div>
                </div>
              </div>

              <div className="px-10 py-8 bg-slate-50/50 border-t border-slate-50 flex gap-4">
                <Button className="flex-1 h-14 rounded-2xl shadow-xl shadow-accent-primary/10 font-black text-sm uppercase tracking-widest" onClick={handleAddStudent}>Create Profile</Button>
                <Button variant="secondary" className="flex-1 h-14 rounded-2xl font-black text-xs uppercase tracking-widest border-slate-200" onClick={() => setIsModalOpen(false)}>Cancel</Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Students;
