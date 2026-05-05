import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence, useMotionValue, useSpring } from 'framer-motion';
import { 
  BookOpen, 
  Plus, 
  Users, 
  UserCheck, 
  GraduationCap, 
  X,
  Calendar,
  Clock,
  ChevronRight,
  Search,
  BookMarked,
  MoreVertical,
  Filter,
  Eye,
  Edit2,
  Trash2,
  LayoutGrid,
  List
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

const Classes = ({ onNavigate }) => {
  const [activeItem, setActiveItem] = useState('classes');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  const stats = [
    { label: 'Academic Classes', value: 24, icon: BookOpen, color: 'text-accent-primary', bg: 'bg-accent-primary/10' },
    { label: 'Total Enrollment', value: 847, icon: GraduationCap, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
    { label: 'Avg Class Size', value: 35, icon: Users, color: 'text-amber-500', bg: 'bg-amber-500/10' },
    { label: 'Lead Teachers', value: 24, icon: UserCheck, color: 'text-indigo-500', bg: 'bg-indigo-500/10' },
  ];

  const classesData = [
    { id: 1, name: 'Form 1A', teacher: 'Mrs. Abena Mensah', students: 35, capacity: 40, dept: 'Junior High', initials: 'AM' },
    { id: 2, name: 'Form 1B', teacher: 'Mr. Kofi Asante', students: 32, capacity: 40, dept: 'Junior High', initials: 'KA' },
    { id: 3, name: 'Form 2A', teacher: 'Mrs. Akosua Boateng', students: 38, capacity: 40, dept: 'Junior High', initials: 'AB' },
    { id: 4, name: 'Form 2B', teacher: 'Mr. Kwame Osei', students: 36, capacity: 40, dept: 'Junior High', initials: 'KO' },
    { id: 5, name: 'Form 3A', teacher: 'Mrs. Efua Darko', students: 34, capacity: 40, dept: 'Senior High', initials: 'ED' },
    { id: 6, name: 'Form 3B', teacher: 'Mr. Yaw Mensah', students: 33, capacity: 40, dept: 'Senior High', initials: 'YM' },
  ];

  const filteredClasses = useMemo(() => {
    return classesData.filter(c => 
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.teacher.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery]);

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
              <div className="w-10 h-10 bg-accent-primary/10 rounded-xl flex items-center justify-center text-accent-primary">
                <BookOpen size={24} />
              </div>
              <h1 className="text-3xl font-black tracking-tight font-headings">Classes</h1>
            </div>
            <p className="text-text-muted text-sm font-medium">Manage and organize school class sections and assignments.</p>
          </div>
          <div className="flex gap-3">
             <div className="bg-slate-50 border border-slate-100 rounded-xl p-1 flex gap-1 mr-2">
                <button 
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-white shadow-sm text-accent-primary' : 'text-slate-400 hover:text-slate-600'}`}
                >
                  <LayoutGrid size={18} />
                </button>
                <button 
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-lg transition-all ${viewMode === 'list' ? 'bg-white shadow-sm text-accent-primary' : 'text-slate-400 hover:text-slate-600'}`}
                >
                  <List size={18} />
                </button>
             </div>
            <Button onClick={() => setIsAddModalOpen(true)} className="px-5 shadow-lg shadow-accent-primary/15">
              <Plus size={18} className="mr-2" /> Add Class
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
                <div className={`w-14 h-14 rounded-2xl ${stat.bg} flex items-center justify-center ${stat.color} group-hover:scale-110 transition-transform`}>
                  <stat.icon size={26} />
                </div>
                <div>
                  <div className="text-2xl font-black text-text-primary tracking-tight leading-none mb-1">
                    <CountUp value={stat.value} />
                  </div>
                  <div className="text-[10px] font-black text-text-muted uppercase tracking-widest">{stat.label}</div>
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
              placeholder="Search by class name or teacher..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white border border-slate-100 rounded-[22px] py-4 pl-14 pr-6 text-sm font-medium text-text-primary outline-none focus:border-accent-primary/30 transition-all shadow-sm"
            />
          </div>
          <div className="flex items-center gap-3 w-full lg:w-auto">
            <select className="bg-white border border-slate-100 rounded-[20px] px-6 py-4 text-xs font-black text-slate-500 uppercase tracking-widest outline-none cursor-pointer focus:border-accent-primary/30 min-w-[160px] shadow-sm appearance-none">
              <option>All Departments</option>
              <option>Junior High</option>
              <option>Senior High</option>
            </select>
            <Button variant="ghost" className="h-[56px] px-6 rounded-[20px] bg-white border border-slate-100 text-slate-500 shadow-sm">
              <Filter size={18} className="mr-2" /> Filters
            </Button>
          </div>
        </div>

        {/* Classes Content */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-white border border-slate-50 rounded-[40px] p-8 shadow-sm">
                 <SkeletonLoader width="60px" height="24px" borderRadius="12px" className="mb-6" />
                 <SkeletonLoader width="180px" height="32px" className="mb-4" />
                 <SkeletonLoader width="140px" height="20px" className="mb-8" />
                 <div className="space-y-4">
                    <SkeletonLoader height="12px" />
                    <div className="flex gap-3">
                       <SkeletonLoader height="40px" className="flex-1" borderRadius="12px" />
                       <SkeletonLoader height="40px" className="flex-1" borderRadius="12px" />
                    </div>
                 </div>
              </div>
            ))}
          </div>
        ) : filteredClasses.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
            <AnimatePresence>
              {filteredClasses.map((c, i) => {
                 const occupancy = (c.students / c.capacity) * 100;
                 return (
                  <motion.div
                    key={c.id}
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ delay: i * 0.05 }}
                    className="bg-white border border-slate-100 rounded-[40px] p-8 shadow-sm hover:shadow-xl hover:border-accent-primary/20 transition-all duration-500 relative group overflow-hidden"
                  >
                    <div className="flex justify-between items-start mb-6">
                      <div className="px-4 py-1.5 bg-slate-50 border border-slate-100 text-slate-500 text-[10px] font-black uppercase tracking-[0.1em] rounded-full">
                        {c.dept}
                      </div>
                      <button className="w-10 h-10 flex items-center justify-center text-slate-300 hover:text-text-primary hover:bg-slate-50 rounded-full transition-all">
                        <MoreVertical size={20} />
                      </button>
                    </div>
                    
                    <h3 className="text-2xl font-black text-text-primary mb-2 group-hover:text-accent-primary transition-colors font-headings tracking-tight">
                      {c.name}
                    </h3>
                    
                    <div className="flex items-center gap-3 mb-8">
                       <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-accent-primary to-accent-secondary flex items-center justify-center text-white font-black text-[10px]">
                          {c.initials}
                       </div>
                       <span className="text-sm font-bold text-slate-500">{c.teacher}</span>
                    </div>

                    <div className="space-y-4 mb-8">
                       <div className="flex justify-between items-end">
                          <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Occupancy</div>
                          <div className="text-xs font-black text-text-primary">{c.students} / {c.capacity}</div>
                       </div>
                       <div className="w-full h-2.5 bg-slate-50 rounded-full overflow-hidden border border-slate-50">
                          <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${occupancy}%` }}
                            transition={{ duration: 1.5, delay: 0.5 }}
                            className={`h-full rounded-full ${occupancy > 90 ? 'bg-rose-500' : occupancy > 75 ? 'bg-amber-500' : 'bg-accent-primary'}`}
                          />
                       </div>
                    </div>

                    <div className="flex w-full gap-3 pt-4 border-t border-slate-50">
                      <Button variant="secondary" className="flex-1 h-12 rounded-2xl text-[11px] font-black uppercase tracking-widest border-slate-100 hover:bg-slate-50">
                        Roster
                      </Button>
                      <Button variant="secondary" className="flex-1 h-12 rounded-2xl text-[11px] font-black uppercase tracking-widest border-slate-100 hover:bg-slate-50">
                        Schedule
                      </Button>
                    </div>
                  </motion.div>
                 );
              })}
            </AnimatePresence>
          </div>
        ) : (
          <EmptyState 
            isSearch={searchQuery.length > 0}
            title={searchQuery ? "No matching classes" : "No classes created"}
            description={searchQuery 
              ? `We couldn't find any class matching "${searchQuery}". Please check your search term.`
              : "Your school structure hasn't been defined yet. Start by creating your first academic class section."}
            actionLabel={!searchQuery && "Define New Class"}
            onAction={() => setIsAddModalOpen(true)}
          />
        )}
      </main>

      {/* Add Class Modal */}
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
                  <h2 className="text-2xl font-black tracking-tight text-text-primary font-headings">New Academic Section</h2>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Structure • Class Management</p>
                </div>
                <button onClick={() => setIsAddModalOpen(false)} className="w-12 h-12 flex items-center justify-center rounded-full bg-white border border-slate-100 text-slate-400 hover:text-text-primary transition-colors shadow-sm">
                  <X size={20} />
                </button>
              </div>

              <div className="p-10 max-h-[60vh] overflow-y-auto no-scrollbar">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="flex flex-col gap-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] ml-1">Class Name</label>
                    <input 
                      placeholder="e.g. Form 1A"
                      className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 text-sm font-bold text-text-primary outline-none focus:bg-white focus:border-accent-primary/30 transition-all shadow-sm"
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] ml-1">Max Capacity</label>
                    <input 
                      type="number"
                      placeholder="40"
                      className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 text-sm font-bold text-text-primary outline-none focus:bg-white focus:border-accent-primary/30 transition-all shadow-sm"
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] ml-1">Class Teacher</label>
                    <select className="w-full appearance-none bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 text-sm font-bold text-text-primary outline-none focus:bg-white focus:border-accent-primary/30 transition-all shadow-sm cursor-pointer">
                      <option>Select Teacher</option>
                      <option>Mrs. Abena Mensah</option>
                      <option>Mr. Kofi Asante</option>
                    </select>
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] ml-1">Department</label>
                    <select className="w-full appearance-none bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 text-sm font-bold text-text-primary outline-none focus:bg-white focus:border-accent-primary/30 transition-all shadow-sm cursor-pointer">
                      <option>Junior High</option>
                      <option>Senior High</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="px-10 py-8 bg-slate-50/50 border-t border-slate-50 flex gap-4">
                <Button className="flex-1 h-14 rounded-2xl shadow-xl shadow-accent-primary/10 font-black text-sm uppercase tracking-widest">Create Class</Button>
                <Button variant="secondary" className="flex-1 h-14 rounded-2xl font-black text-xs uppercase tracking-widest border-slate-200" onClick={() => setIsAddModalOpen(false)}>Discard</Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Classes;
