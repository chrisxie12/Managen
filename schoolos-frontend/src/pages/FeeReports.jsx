import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence, useMotionValue, useSpring } from 'framer-motion';
import { 
  Receipt, 
  FileDown, 
  Search, 
  Filter, 
  ChevronRight, 
  Calendar, 
  BarChart3, 
  PieChart, 
  TrendingUp, 
  TrendingDown, 
  Activity,
  Zap,
  Sparkles,
  ArrowRight,
  Download,
  FileText
} from 'lucide-react';
import Sidebar from '../components/layout/Sidebar';
import DashboardNavbar from '../components/layout/DashboardNavbar';
import { Button } from '../components/ui/Button';
import { SkeletonLoader } from '../components/ui/SkeletonLoader';

const FeeReports = ({ onNavigate }) => {
  const [activeItem, setActiveItem] = useState('fee-reports');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  const reportTypes = [
    { id: 1, title: 'Termly Revenue Summary', desc: 'Detailed breakdown of all fees collected this term.', icon: BarChart3, color: 'text-accent-primary', bg: 'bg-accent-primary/10' },
    { id: 2, title: 'Outstanding Debtors List', desc: 'Generate a list of students with unpaid balances.', icon: Activity, color: 'text-rose-500', bg: 'bg-rose-500/10' },
    { id: 3, title: 'Collection Rate Analysis', desc: 'Visual representation of fee collection progress.', icon: PieChart, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
    { id: 4, title: 'Expenditure Tracking', desc: 'Overview of operational costs vs revenue.', icon: TrendingDown, color: 'text-amber-500', bg: 'bg-amber-500/10' },
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
      <DashboardNavbar activeItem={activeItem} onMenuClick={() => setSidebarOpen(true)} />

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
                <Receipt size={24} />
              </div>
              <h1 className="text-3xl font-black tracking-tight font-headings">Financial Reports</h1>
            </div>
            <p className="text-text-muted text-sm font-medium tracking-tight">Generate comprehensive financial insights and audit-ready documentation.</p>
          </div>
        </motion.div>

        {/* Reports Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
           {loading ? (
              Array.from({ length: 4 }).map((_, i) => (
                 <div key={i} className="bg-white border border-slate-50 rounded-[40px] p-10 shadow-sm">
                    <SkeletonLoader width="60px" height="60px" borderRadius="16px" className="mb-6" />
                    <SkeletonLoader width="200px" height="24px" className="mb-3" />
                    <SkeletonLoader width="100%" height="40px" className="mb-8" />
                    <SkeletonLoader height="56px" borderRadius="20px" />
                 </div>
              ))
           ) : (
              reportTypes.map((report, i) => (
                 <motion.div
                    key={report.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="bg-white border border-slate-100 rounded-[40px] p-10 shadow-sm hover:shadow-xl transition-all duration-500 group relative overflow-hidden"
                 >
                    <div className="absolute top-0 right-0 w-32 h-32 bg-slate-50/50 rounded-bl-[80px] -mr-8 -mt-8 group-hover:scale-110 transition-transform duration-700" />
                    
                    <div className={`w-16 h-16 ${report.bg} rounded-2xl flex items-center justify-center ${report.color} mb-8 shadow-sm group-hover:rotate-6 transition-transform relative z-10`}>
                       <report.icon size={30} />
                    </div>

                    <h3 className="text-2xl font-black text-text-primary tracking-tight mb-3 font-headings relative z-10">{report.title}</h3>
                    <p className="text-sm font-bold text-slate-400 mb-10 leading-relaxed max-w-xs relative z-10">{report.desc}</p>

                    <div className="flex gap-3 relative z-10">
                       <Button className="flex-1 h-14 rounded-2xl shadow-lg shadow-accent-primary/10 text-xs font-black uppercase tracking-widest">
                          <Download size={18} className="mr-2" /> Generate PDF
                       </Button>
                       <Button variant="secondary" className="px-6 h-14 rounded-2xl border-slate-100">
                          <FileText size={18} />
                       </Button>
                    </div>
                 </motion.div>
              ))
           )}
        </div>

        {/* Quick Export Panel */}
        <div className="mt-12 bg-slate-900 rounded-[40px] p-12 text-white relative overflow-hidden group">
           <Zap className="absolute -right-10 -bottom-10 w-48 h-48 text-white/5 group-hover:scale-125 transition-transform duration-700" />
           <div className="flex flex-col md:flex-row justify-between items-center gap-8 relative z-10">
              <div>
                 <h3 className="text-2xl font-black font-headings tracking-tight leading-none mb-3 italic text-accent-primary">Quarterly Audit Export</h3>
                 <p className="text-slate-400 text-sm font-bold tracking-tight">Export the full financial ledger for the current academic quarter.</p>
              </div>
              <div className="flex gap-4 w-full md:w-auto">
                 <select className="bg-white/10 border border-white/10 rounded-2xl px-6 py-4 text-xs font-black text-white uppercase tracking-widest outline-none cursor-pointer focus:border-accent-primary/30 min-w-[160px]">
                    <option>Q2 - 2026</option>
                    <option>Q1 - 2026</option>
                 </select>
                 <Button className="h-14 px-10 rounded-2xl bg-white text-slate-900 hover:bg-slate-50 font-black text-xs uppercase tracking-widest shadow-xl shadow-black/20">
                    Export Excel
                 </Button>
              </div>
           </div>
        </div>
      </main>
    </div>
  );
};

export default FeeReports;
