import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence, useMotionValue, useSpring } from 'framer-motion';
import { 
  Users, 
  Plus, 
  FileDown, 
  Search, 
  Filter, 
  CheckCircle2, 
  Clock, 
  BookOpen,
  MessageSquare,
  User,
  X,
  Mail,
  Phone,
  Briefcase,
  Award,
  MoreVertical,
  ChevronRight,
  ExternalLink,
  ShieldCheck,
  ChevronLeft
} from 'lucide-react';
import Sidebar from '../components/layout/Sidebar';
import DashboardNavbar from '../components/layout/DashboardNavbar';
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

const Teachers = ({ onNavigate }) => {
  const [activeItem, setActiveItem] = useState('teachers');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate data fetch
    const timer = setTimeout(() => setLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  const stats = [
    { label: 'Total Teachers', value: 62, icon: Users, color: 'text-accent-primary', bg: 'bg-accent-primary/10' },
    { label: 'Active', value: 58, icon: CheckCircle2, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
    { label: 'On Leave', value: 4, icon: Clock, color: 'text-amber-500', bg: 'bg-amber-500/10' },
    { label: 'Subjects Covered', value: 18, icon: BookOpen, color: 'text-indigo-500', bg: 'bg-indigo-500/10' },
  ];

  const teachers = [
    { id: 1, name: 'Mrs. Abena Mensah', dept: 'Mathematics', role: 'Form 1 Teacher', exp: '8 years', classes: 4, students: 140, subjects: ['Maths', 'Core Maths'], initials: 'AM' },
    { id: 2, name: 'Mr. Kofi Asante', dept: 'English', role: 'Form 2 Teacher', exp: '5 years', classes: 5, students: 165, subjects: ['English', 'Lit'], initials: 'KA' },
    { id: 3, name: 'Mrs. Akosua Boateng', dept: 'Science', role: 'Subject Teacher', exp: '12 years', classes: 6, students: 210, subjects: ['Physics', 'Chem'], initials: 'AB' },
    { id: 4, name: 'Mr. Kwame Osei', dept: 'Social Studies', role: 'Form 3 Teacher', exp: '3 years', classes: 3, students: 105, subjects: ['Social'], initials: 'KO' },
    { id: 5, name: 'Mrs. Efua Darko', dept: 'ICT', role: 'Subject Teacher', exp: '6 years', classes: 4, students: 140, subjects: ['ICT', 'CS'], initials: 'ED' },
    { id: 6, name: 'Mr. Yaw Mensah', dept: 'Languages', role: 'Subject Teacher', exp: '9 years', classes: 4, students: 140, subjects: ['French', 'Ga'], initials: 'YM' },
  ];

  const filteredTeachers = useMemo(() => {
    return teachers.filter(t => 
      t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.dept.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.subjects.some(s => s.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  }, [searchQuery, teachers]);

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
                <Users size={24} />
              </div>
              <h1 className="text-3xl font-black tracking-tight font-headings">Teachers</h1>
            </div>
            <p className="text-text-muted text-sm font-medium tracking-tight">Manage and monitor academic staff performance and assignments.</p>
          </div>
          <div className="flex gap-3">
            <Button variant="secondary" className="px-5 border-slate-100">
              <FileDown size={18} className="mr-2" /> Export
            </Button>
            <Button onClick={() => setIsModalOpen(true)} className="px-5 shadow-lg shadow-accent-primary/15">
              <Plus size={18} className="mr-2" /> Add Teacher
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
                <div className={`w-14 h-14 rounded-2xl ${stat.bg} flex items-center justify-center ${stat.color} group-hover:rotate-6 transition-transform duration-300`}>
                  <stat.icon size={26} />
                </div>
                <div>
                  <div className="text-2xl font-black text-text-primary tracking-tight leading-none mb-1">
                    <CountUp value={stat.value} />
                  </div>
                  <div className="text-[10px] font-black text-text-muted uppercase tracking-[0.15em]">{stat.label}</div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Filter Bar */}
        <div className="bg-slate-50 border border-slate-100 rounded-[30px] p-2.5 mb-10 flex flex-col lg:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search size={18} className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300" />
            <input 
              placeholder="Search by name, department, or subject..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white border border-slate-100 rounded-[22px] py-4 pl-14 pr-6 text-sm font-medium text-text-primary outline-none focus:border-accent-primary/30 transition-all shadow-sm"
            />
          </div>
          <div className="flex items-center gap-3 w-full lg:w-auto">
            <select className="bg-white border border-slate-100 rounded-[20px] px-6 py-4 text-xs font-black text-slate-500 uppercase tracking-widest outline-none cursor-pointer focus:border-accent-primary/30 min-w-[160px] shadow-sm appearance-none">
              <option>All Departments</option>
              <option>Mathematics</option>
              <option>Science</option>
            </select>
            <Button variant="ghost" className="h-[56px] px-6 rounded-[20px] bg-white border border-slate-100 text-slate-500 shadow-sm">
              <Filter size={18} className="mr-2" /> More Filters
            </Button>
          </div>
        </div>

        {/* Teachers Content */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-8">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-white border border-slate-100 rounded-[40px] p-8 shadow-sm">
                <div className="flex flex-col items-center">
                  <SkeletonLoader width="80px" height="80px" borderRadius="32px" className="mb-6" />
                  <SkeletonLoader width="180px" height="24px" className="mb-2" />
                  <SkeletonLoader width="100px" height="18px" borderRadius="99px" className="mb-6" />
                  <div className="flex gap-2 mb-8">
                    <SkeletonLoader width="60px" height="20px" borderRadius="8px" />
                    <SkeletonLoader width="60px" height="20px" borderRadius="8px" />
                  </div>
                  <div className="w-full grid grid-cols-3 gap-4 mb-8">
                    <SkeletonLoader height="40px" />
                    <SkeletonLoader height="40px" />
                    <SkeletonLoader height="40px" />
                  </div>
                  <div className="w-full flex gap-3">
                    <SkeletonLoader height="48px" className="flex-1" borderRadius="16px" />
                    <SkeletonLoader height="48px" className="flex-1" borderRadius="16px" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : filteredTeachers.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-8">
            <AnimatePresence>
              {filteredTeachers.map((t, i) => (
                <motion.div
                  key={t.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ delay: i * 0.05 }}
                  className="bg-white border border-slate-100 rounded-[40px] p-8 shadow-sm hover:shadow-xl hover:border-accent-primary/20 transition-all duration-500 relative group overflow-hidden"
                >
                  <div className="absolute top-0 right-0 w-32 h-32 bg-accent-primary/[0.02] rounded-bl-[100px] -mr-10 -mt-10 group-hover:scale-150 transition-transform duration-700" />
                  
                  <div className="absolute top-6 right-6 z-10">
                    <button className="w-10 h-10 flex items-center justify-center text-slate-300 hover:text-text-primary hover:bg-slate-50 rounded-full transition-all">
                      <MoreVertical size={20} />
                    </button>
                  </div>

                  <div className="flex flex-col items-center text-center relative z-10">
                    <div className="w-24 h-24 rounded-[36px] bg-gradient-to-br from-accent-primary to-accent-secondary flex items-center justify-center text-white font-black text-3xl mb-6 shadow-2xl shadow-accent-primary/30 group-hover:rotate-6 transition-all duration-500">
                      {t.initials}
                    </div>
                    
                    <h3 className="text-xl font-black text-text-primary mb-1 group-hover:text-accent-primary transition-colors font-headings">
                      {t.name}
                    </h3>
                    
                    <div className="px-4 py-1.5 bg-slate-50 border border-slate-100 text-slate-500 text-[10px] font-black uppercase tracking-[0.1em] rounded-full mb-6">
                      {t.role}
                    </div>
                    
                    <div className="flex flex-wrap justify-center gap-2 mb-8 min-h-[52px]">
                      {t.subjects.map((sub, idx) => (
                        <span key={idx} className="px-3 py-1.5 bg-accent-primary/[0.03] border border-accent-primary/5 rounded-xl text-[10px] font-bold text-accent-primary uppercase tracking-tight">
                          {sub}
                        </span>
                      ))}
                    </div>

                    <div className="w-full grid grid-cols-3 gap-1 bg-slate-50/50 rounded-3xl p-5 mb-8 border border-slate-50">
                      <div className="text-center">
                        <div className="text-lg font-black text-text-primary leading-none tracking-tight">{t.classes}</div>
                        <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-1.5">Classes</div>
                      </div>
                      <div className="text-center border-x border-slate-200/50 px-2">
                        <div className="text-lg font-black text-text-primary leading-none tracking-tight">{t.students}</div>
                        <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-1.5">Managed</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-black text-text-primary leading-none tracking-tight">{t.exp.split(' ')[0]}</div>
                        <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-1.5">Experience</div>
                      </div>
                    </div>

                    <div className="flex w-full gap-3">
                      <Button variant="secondary" className="flex-1 h-12 rounded-2xl text-[11px] font-black uppercase tracking-widest border-slate-100">
                        Profile
                      </Button>
                      <Button className="flex-1 h-12 rounded-2xl text-[11px] font-black uppercase tracking-widest shadow-lg shadow-accent-primary/10">
                        Contact
                      </Button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        ) : (
          <EmptyState 
            isSearch={searchQuery.length > 0}
            title={searchQuery ? "No matching staff members" : "Staff Directory Empty"}
            description={searchQuery 
              ? `Your search for "${searchQuery}" didn't return any results. Please check spelling or try different keywords.`
              : "No faculty members have been registered yet. Start building your school's academic department."}
            actionLabel={!searchQuery && "Register New Staff"}
            onAction={() => setIsModalOpen(true)}
          />
        )}

        {/* Pagination placeholder */}
        {!loading && filteredTeachers.length > 0 && (
          <div className="mt-12 flex justify-between items-center px-8">
            <div className="text-xs font-black text-slate-400 uppercase tracking-widest">
              Faculty Size: <span className="text-text-primary">{filteredTeachers.length}</span>
            </div>
            <div className="flex gap-2">
              <Button variant="secondary" size="sm" className="w-10 h-10 p-0 rounded-xl disabled:opacity-30" disabled><ChevronLeft size={18} /></Button>
              <Button variant="secondary" size="sm" className="w-10 h-10 p-0 rounded-xl bg-accent-primary text-white border-accent-primary">1</Button>
              <Button variant="secondary" size="sm" className="w-10 h-10 p-0 rounded-xl disabled:opacity-30" disabled><ChevronRight size={18} /></Button>
            </div>
          </div>
        )}
      </main>

      {/* Add Teacher Modal */}
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
                  <h2 className="text-2xl font-black tracking-tight text-text-primary font-headings">Staff Registration</h2>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">HR Management • Academic Faculty</p>
                </div>
                <button onClick={() => setIsModalOpen(false)} className="w-12 h-12 flex items-center justify-center rounded-full bg-white border border-slate-100 text-slate-400 hover:text-text-primary transition-colors shadow-sm">
                  <X size={20} />
                </button>
              </div>

              <div className="p-10 max-h-[60vh] overflow-y-auto no-scrollbar">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {[
                    { label: 'Full Staff Name', placeholder: 'e.g. Mrs. Abena Mensah' },
                    { label: 'Employee ID', placeholder: 'EMP-2026-042' },
                    { label: 'Work Email', type: 'email', placeholder: 'faculty@schoolos.com' },
                    { label: 'Contact Number', placeholder: '+233...' },
                  ].map((field, idx) => (
                    <div key={idx} className="flex flex-col gap-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] ml-1">{field.label}</label>
                      <input 
                        type={field.type || 'text'}
                        placeholder={field.placeholder}
                        className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 text-sm font-bold text-text-primary outline-none focus:bg-white focus:border-accent-primary/30 transition-all shadow-sm"
                      />
                    </div>
                  ))}
                  <div className="flex flex-col gap-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] ml-1">Department</label>
                    <select className="w-full appearance-none bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 text-sm font-bold text-text-primary outline-none focus:bg-white focus:border-accent-primary/30 transition-all shadow-sm cursor-pointer">
                      <option>Mathematics</option>
                      <option>Science</option>
                      <option>Languages</option>
                    </select>
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] ml-1">Primary Role</label>
                    <select className="w-full appearance-none bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 text-sm font-bold text-text-primary outline-none focus:bg-white focus:border-accent-primary/30 transition-all shadow-sm cursor-pointer">
                      <option>Form Teacher</option>
                      <option>Subject Teacher</option>
                      <option>HOD</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="px-10 py-8 bg-slate-50/50 border-t border-slate-50 flex gap-4">
                <Button className="flex-1 h-14 rounded-2xl shadow-xl shadow-accent-primary/10 font-black text-sm uppercase tracking-widest">Complete Registration</Button>
                <Button variant="secondary" className="flex-1 h-14 rounded-2xl font-black text-xs uppercase tracking-widest border-slate-200" onClick={() => setIsModalOpen(false)}>Discard</Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Teachers;
