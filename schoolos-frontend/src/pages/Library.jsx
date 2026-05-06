import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BookMarked, 
  Plus, 
  BookOpen, 
  CheckCircle2, 
  AlertCircle, 
  Search, 
  X
} from 'lucide-react';
import Sidebar from '../components/layout/Sidebar';
import DashboardNavbar from '../components/layout/DashboardNavbar';
import { Button } from '../components/ui/Button';

const Library = ({ onNavigate }) => {
  const [activeItem, setActiveItem] = useState('library');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  const stats = [
    { label: 'Total Catalog', value: 1240, icon: BookMarked, color: '#6366F1' },
    { label: 'Available', value: 986, icon: CheckCircle2, color: '#10B981' },
    { label: 'Active Loans', value: 254, icon: BookOpen, color: '#F59E0B' },
    { label: 'Overdue', value: 18, icon: AlertCircle, color: '#EF4444' },
  ];

  const booksData = [
    { id: 1, title: 'Mathematics for JHS', author: 'Dr. K. Ababio', cat: 'Textbook', total: 5, avail: 3, initials: 'MJ' },
    { id: 2, title: 'English Grammar Master', author: 'R. Murphy', cat: 'Reference', total: 8, avail: 8, initials: 'EG' },
    { id: 3, title: 'Integrated Science Pro', author: 'Prof. Wiredu', cat: 'Textbook', total: 6, avail: 2, initials: 'IS' },
    { id: 4, title: 'Social Studies Atlas', author: 'E. Antwi', cat: 'Textbook', total: 4, avail: 0, initials: 'SS' },
    { id: 5, title: 'ICT Fundamentals 2.0', author: 'S. Mensah', cat: 'Textbook', total: 3, avail: 3, initials: 'IF' },
    { id: 6, title: 'French for Beginners', author: 'Jean Dubois', cat: 'Language', total: 5, avail: 4, initials: 'FB' },
  ];

  const filteredBooks = booksData.filter(b => 
    b.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    b.author.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-bg-primary text-text-primary font-body transition-all duration-300">
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
                placeholder="Search catalog or author..."
                className="bg-transparent border-none outline-none text-sm font-medium w-full"
                style={{ color: "var(--text-primary)" }}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
           </div>
           <button onClick={() => setIsAddModalOpen(true)} className="flex items-center gap-2 px-5 py-3 rounded-2xl text-xs font-black uppercase tracking-widest bg-plum text-milk shadow-lg shadow-plum/20">
              <Plus size={16} /> New Resource
           </button>
        </div>

        {/* Resource Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
           {filteredBooks.map((b) => (
              <motion.div
                 key={b.id}
                 whileHover={{ y: -5 }}
                 className="p-5 rounded-[32px] border group relative overflow-hidden transition-all hover:shadow-xl flex flex-col"
                 style={{
                   background: "var(--card-bg)",
                   borderColor: "var(--border)",
                   boxShadow: "var(--shadow-card)",
                 }}
              >
                 <div className="aspect-[4/5] rounded-[24px] mb-4 flex items-center justify-center relative overflow-hidden" style={{ background: "var(--bg-secondary)" }}>
                    <div className="w-16 h-20 rounded-lg shadow-lg border flex items-center justify-center text-xl font-black bg-white" style={{ color: "var(--accent-primary)", borderColor: "var(--border)" }}>
                       {b.initials}
                    </div>
                    <div className="absolute top-3 right-3 px-2 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest bg-white" style={{ color: "var(--accent-primary)" }}>{b.cat}</div>
                 </div>

                 <h3 style={{ fontFamily: "'Playfair Display', serif", color: "var(--text-primary)", fontSize: "1.1rem", fontWeight: 800 }} className="mb-0.5 truncate">{b.title}</h3>
                 <p style={{ color: "var(--text-muted)", fontSize: "0.7rem", fontWeight: 700, marginBottom: "1rem" }} className="italic truncate">{b.author}</p>

                 <div className="flex items-center justify-between mb-4 mt-auto">
                    <div className="text-[10px] font-black" style={{ color: "var(--text-primary)" }}>{b.avail} <span style={{ color: "var(--text-muted)" }}>/ {b.total}</span></div>
                    <div className="flex gap-0.5">
                       {[1,2,3,4,5].map(i => (
                          <div key={i} className={`h-1 w-3 rounded-full ${i <= (b.avail/b.total)*5 ? 'bg-plum' : 'bg-black/5'}`} />
                       ))}
                    </div>
                 </div>

                 <button className={`w-full py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${b.avail > 0 ? 'bg-plum text-milk shadow-md' : 'bg-black/5 text-black/20 cursor-not-allowed'}`} disabled={b.avail === 0}>
                    {b.avail > 0 ? 'Issue Book' : 'Out of Stock'}
                 </button>
              </motion.div>
           ))}
        </div>
      </main>

      {/* Modal */}
      <AnimatePresence>
        {isAddModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsAddModalOpen(false)} className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="w-full max-w-lg rounded-[40px] shadow-2xl relative z-10 overflow-hidden border" style={{ background: "var(--card-bg)", borderColor: "var(--border)" }}>
              <div className="p-8 pb-4 flex justify-between items-center">
                <div>
                  <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "1.5rem", fontWeight: 800, color: "var(--text-primary)" }}>Catalog Entry</h2>
                  <p style={{ color: "var(--text-muted)", fontSize: "0.75rem", fontWeight: 600 }}>Institutional Acquisitions Management</p>
                </div>
                <button onClick={() => setIsAddModalOpen(false)} className="w-10 h-10 rounded-full hover:bg-black/5 flex items-center justify-center"><X size={20} style={{ color: "var(--text-muted)" }} /></button>
              </div>
              <div className="p-8 pt-4 space-y-4">
                 <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2">
                       <label className="text-[10px] font-black uppercase tracking-widest mb-1.5 block ml-1" style={{ color: "var(--text-muted)" }}>Resource Title</label>
                       <input placeholder="e.g. Mathematics for JHS" className="w-full border rounded-xl px-4 py-3 text-sm font-bold outline-none transition-all" style={{ background: "var(--bg-secondary)", color: "var(--text-primary)", borderColor: "var(--border)" }} />
                    </div>
                    <div>
                       <label className="text-[10px] font-black uppercase tracking-widest mb-1.5 block ml-1" style={{ color: "var(--text-muted)" }}>Category</label>
                       <select className="w-full border rounded-xl px-4 py-3 text-sm font-bold outline-none transition-all cursor-pointer" style={{ background: "var(--bg-secondary)", color: "var(--text-primary)", borderColor: "var(--border)" }}>
                          <option>Textbook</option>
                          <option>Reference</option>
                          <option>Novel</option>
                       </select>
                    </div>
                    <div>
                       <label className="text-[10px] font-black uppercase tracking-widest mb-1.5 block ml-1" style={{ color: "var(--text-muted)" }}>Quantity</label>
                       <input type="number" placeholder="5" className="w-full border rounded-xl px-4 py-3 text-sm font-bold outline-none transition-all" style={{ background: "var(--bg-secondary)", color: "var(--text-primary)", borderColor: "var(--border)" }} />
                    </div>
                 </div>
              </div>
              <div className="p-8 bg-black/[0.02] flex gap-3">
                <Button className="flex-1 py-4 rounded-2xl text-xs font-black uppercase tracking-widest bg-plum text-milk" onClick={() => setIsAddModalOpen(false)}>Register Item</Button>
                <Button variant="secondary" className="flex-1 py-4 rounded-2xl text-xs font-black uppercase tracking-widest" style={{ borderColor: "var(--border)", color: "var(--text-primary)" }} onClick={() => setIsAddModalOpen(false)}>Cancel</Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Library;
