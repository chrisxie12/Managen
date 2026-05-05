import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence, useMotionValue, useSpring } from 'framer-motion';
import { 
  BookMarked, 
  Plus, 
  BookOpen, 
  CheckCircle2, 
  AlertCircle, 
  FileDown, 
  Search, 
  Filter, 
  X,
  Bell,
  Clock,
  User,
  MoreVertical,
  ChevronRight,
  Library as LibraryIcon,
  Sparkles,
  Zap,
  Bookmark
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

const Library = ({ onNavigate }) => {
  const [activeItem, setActiveItem] = useState('library');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('Catalog');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  const stats = [
    { label: 'Books in Catalog', value: 1240, icon: BookMarked, color: 'text-accent-primary', bg: 'bg-accent-primary/10' },
    { label: 'Shelf Available', value: 986, icon: CheckCircle2, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
    { label: 'Active Loans', value: 254, icon: BookOpen, color: 'text-amber-500', bg: 'bg-amber-500/10' },
    { label: 'Overdue items', value: 18, icon: AlertCircle, color: 'text-rose-500', bg: 'bg-rose-500/10' },
  ];

  const booksData = [
    { id: 1, title: 'Mathematics for JHS', author: 'Dr. K. Ababio', cat: 'Textbook', total: 5, avail: 3, initials: 'MJ' },
    { id: 2, title: 'English Grammar Master', author: 'R. Murphy', cat: 'Reference', total: 8, avail: 8, initials: 'EG' },
    { id: 3, title: 'Integrated Science Pro', author: 'Prof. Wiredu', cat: 'Textbook', total: 6, avail: 2, initials: 'IS' },
    { id: 4, title: 'Social Studies Atlas', author: 'E. Antwi', cat: 'Textbook', total: 4, avail: 0, initials: 'SS' },
    { id: 5, title: 'ICT Fundamentals 2.0', author: 'S. Mensah', cat: 'Textbook', total: 3, avail: 3, initials: 'IF' },
    { id: 6, title: 'French for Beginners', author: 'Jean Dubois', cat: 'Language', total: 5, avail: 4, initials: 'FB' },
  ];

  const filteredBooks = useMemo(() => {
    return booksData.filter(b => 
      b.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.author.toLowerCase().includes(searchQuery.toLowerCase())
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
                <Bookmark size={24} />
              </div>
              <h1 className="text-3xl font-black tracking-tight font-headings">Library</h1>
            </div>
            <p className="text-text-muted text-sm font-medium tracking-tight">Curate academic resources, manage borrowing, and track catalog growth.</p>
          </div>
          <div className="flex gap-3">
            <Button variant="secondary" className="px-5 border-slate-100">
              <FileDown size={18} className="mr-2" /> Catalog
            </Button>
            <Button onClick={() => setIsAddModalOpen(true)} className="px-5 shadow-lg shadow-accent-primary/15">
              <Plus size={18} className="mr-2" /> Add Resource
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
                <div className={`w-14 h-14 rounded-2xl ${stat.bg} flex items-center justify-center ${stat.color} group-hover:rotate-12 transition-transform`}>
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

        {/* Tabs Bar */}
        <div className="flex border-b border-slate-100 gap-10 mb-8 overflow-x-auto no-scrollbar">
           {['Catalog', 'Issued', 'Reservations', 'Analytics'].map(tab => (
              <button 
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`pb-4 text-xs font-black uppercase tracking-[0.2em] transition-all relative ${activeTab === tab ? 'text-accent-primary' : 'text-slate-400 hover:text-slate-600'}`}
              >
                 {tab}
                 {activeTab === tab && (
                    <motion.div layoutId="tab-line" className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent-primary rounded-full" />
                 )}
              </button>
           ))}
        </div>

        {/* Filters */}
        <div className="bg-slate-50 border border-slate-100 rounded-[30px] p-2.5 mb-10 flex flex-col lg:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search size={18} className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300" />
            <input 
              placeholder="Search by title, author or ISBN..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white border border-slate-100 rounded-[22px] py-4 pl-14 pr-6 text-sm font-medium text-text-primary outline-none focus:border-accent-primary/30 transition-all shadow-sm"
            />
          </div>
          <div className="flex items-center gap-3 w-full lg:w-auto">
            <select className="bg-white border border-slate-100 rounded-[20px] px-6 py-4 text-xs font-black text-slate-500 uppercase tracking-widest outline-none cursor-pointer focus:border-accent-primary/30 min-w-[160px] shadow-sm appearance-none">
              <option>All Categories</option>
              <option>Textbooks</option>
              <option>Reference</option>
            </select>
            <Button variant="secondary" className="h-[56px] px-6 rounded-[20px] bg-white border border-slate-100 text-slate-500 shadow-sm">
              <Filter size={18} className="mr-2" /> Filters
            </Button>
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="bg-white border border-slate-50 rounded-[40px] p-6 shadow-sm">
                 <SkeletonLoader height="160px" borderRadius="24px" className="mb-6" />
                 <SkeletonLoader width="140px" height="18px" className="mb-2" />
                 <SkeletonLoader width="100px" height="12px" className="mb-6" />
                 <SkeletonLoader height="40px" borderRadius="12px" />
              </div>
            ))}
          </div>
        ) : filteredBooks.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
             <AnimatePresence>
                {filteredBooks.map((b, i) => {
                   const availability = (b.avail / b.total) * 100;
                   return (
                    <motion.div
                      key={b.id}
                      layout
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      transition={{ delay: i * 0.05 }}
                      className="bg-white border border-slate-100 rounded-[40px] p-6 shadow-sm hover:shadow-xl hover:border-accent-primary/20 transition-all duration-500 group overflow-hidden flex flex-col h-full"
                    >
                       <div className="aspect-[3/4] rounded-[24px] bg-gradient-to-br from-slate-100 to-slate-50 mb-6 flex items-center justify-center relative overflow-hidden group-hover:scale-[1.02] transition-transform duration-700">
                          <div className="absolute inset-0 bg-accent-primary/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                          <div className="w-20 h-28 bg-white rounded-lg shadow-xl border border-slate-100 flex items-center justify-center text-2xl font-black text-accent-primary relative z-10">
                             {b.initials}
                          </div>
                          <div className="absolute bottom-4 left-4 right-4 h-1.5 bg-white/50 rounded-full overflow-hidden">
                             <motion.div 
                               initial={{ width: 0 }}
                               animate={{ width: `${availability}%` }}
                               className={`h-full ${availability > 0 ? 'bg-accent-primary' : 'bg-rose-500'}`}
                             />
                          </div>
                       </div>
                       
                       <div className="flex-1">
                          <h3 className="text-lg font-black text-text-primary tracking-tight mb-1 group-hover:text-accent-primary transition-colors">{b.title}</h3>
                          <p className="text-xs font-bold text-slate-400 mb-4 italic">{b.author}</p>
                          <div className="flex items-center justify-between mb-6">
                             <div className="px-3 py-1 rounded-full bg-slate-50 text-[9px] font-black uppercase tracking-widest text-slate-400 border border-slate-100">
                                {b.cat}
                             </div>
                             <div className="text-[10px] font-black text-text-primary">
                                {b.avail} <span className="text-slate-300">/ {b.total}</span>
                             </div>
                          </div>
                       </div>

                       <Button variant={b.avail > 0 ? 'primary' : 'secondary'} className={`w-full h-12 rounded-2xl text-[10px] font-black uppercase tracking-widest ${b.avail === 0 ? 'opacity-50 grayscale' : ''}`} disabled={b.avail === 0}>
                          {b.avail > 0 ? 'Issue Resource' : 'Out of Stock'}
                       </Button>
                    </motion.div>
                   );
                })}
             </AnimatePresence>
          </div>
        ) : (
          <EmptyState 
            isSearch={searchQuery.length > 0}
            title={searchQuery ? "No matching books" : "Catalog is empty"}
            description={searchQuery 
              ? `No resources match your search for "${searchQuery}". Please check your filter or ISBN.`
              : "Your school library doesn't have any resources listed yet. Start by populating the catalog."}
            actionLabel={!searchQuery && "Add First Book"}
            onAction={() => setIsAddModalOpen(true)}
          />
        )}
      </main>

      {/* Add Book Modal */}
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
                  <h2 className="text-2xl font-black tracking-tight text-text-primary font-headings">Catalog Entry</h2>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Acquisitions • Resource Management</p>
                </div>
                <button onClick={() => setIsAddModalOpen(false)} className="w-12 h-12 flex items-center justify-center rounded-full bg-white border border-slate-100 text-slate-400 hover:text-text-primary transition-colors shadow-sm">
                  <X size={20} />
                </button>
              </div>

              <div className="p-10 max-h-[60vh] overflow-y-auto no-scrollbar">
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="flex flex-col gap-2 md:col-span-2">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Resource Title</label>
                       <input 
                         placeholder="e.g. Mathematics for JHS"
                         className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 text-sm font-bold text-text-primary outline-none focus:bg-white focus:border-accent-primary/30 transition-all shadow-sm"
                       />
                    </div>
                    <div className="flex flex-col gap-2">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Author / Editor</label>
                       <input 
                         placeholder="Full Name"
                         className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 text-sm font-bold text-text-primary outline-none focus:bg-white focus:border-accent-primary/30 transition-all shadow-sm"
                       />
                    </div>
                    <div className="flex flex-col gap-2">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Category</label>
                       <select className="w-full appearance-none bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 text-sm font-bold text-text-primary outline-none focus:bg-white focus:border-accent-primary/30 transition-all shadow-sm cursor-pointer">
                          <option>Textbook</option>
                          <option>Reference</option>
                          <option>Journal</option>
                       </select>
                    </div>
                    <div className="flex flex-col gap-2">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">ISBN / Index No</label>
                       <input 
                         placeholder="978-0-..."
                         className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 text-sm font-bold text-text-primary outline-none focus:bg-white focus:border-accent-primary/30 transition-all shadow-sm"
                       />
                    </div>
                    <div className="flex flex-col gap-2">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Stock Quantity</label>
                       <input 
                         type="number"
                         placeholder="1"
                         className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 text-sm font-black text-text-primary outline-none focus:bg-white focus:border-accent-primary/30 transition-all shadow-sm"
                       />
                    </div>
                 </div>
              </div>

              <div className="px-10 py-8 bg-slate-50/50 border-t border-slate-50 flex gap-4">
                <Button className="flex-1 h-14 rounded-2xl shadow-xl shadow-accent-primary/10 font-black text-sm uppercase tracking-widest">Register Book</Button>
                <Button variant="secondary" className="flex-1 h-14 rounded-2xl font-black text-xs uppercase tracking-widest border-slate-200" onClick={() => setIsAddModalOpen(false)}>Discard</Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Library;
