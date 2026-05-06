import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Receipt, 
  Search, 
  BarChart3, 
  PieChart, 
  TrendingDown, 
  Activity,
  Zap,
  Download,
  FileText
} from 'lucide-react';
import Sidebar from '../components/layout/Sidebar';
import DashboardNavbar from '../components/layout/DashboardNavbar';
import { Button } from '../components/ui/Button';

const PLUM = "#381932";
const PLUM_LIGHT = "#512b4a";
const MILK = "#FFF3E6";
const MUTED = "#7D6077";

const FeeReports = ({ onNavigate }) => {
  const [activeItem, setActiveItem] = useState('fee-reports');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  const reportTypes = [
    { id: 1, title: 'Revenue Summary', desc: 'Detailed breakdown of all fees collected this term.', icon: BarChart3, color: '#6366F1' },
    { id: 2, title: 'Outstanding Debtors', desc: 'Generate a list of students with unpaid balances.', icon: Activity, color: '#EF4444' },
    { id: 3, title: 'Collection Rate', desc: 'Visual representation of fee collection progress.', icon: PieChart, color: '#10B981' },
    { id: 4, title: 'Expenditure Logs', desc: 'Overview of operational costs vs revenue.', icon: TrendingDown, color: '#F59E0B' },
  ];

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

      <main className="lg:ml-64 pt-16 p-6 sm:p-8 flex flex-col gap-6">
        {/* Header */}
        <div>
           <h1 style={{ fontFamily: "'Playfair Display', serif", color: PLUM, fontSize: "1.8rem", fontWeight: 800 }}>Financial Intelligence</h1>
           <p style={{ color: MUTED, fontSize: "0.85rem", fontWeight: 600 }}>Generate audit-ready reports and institutional growth analytics.</p>
        </div>

        {/* Reports Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
           {reportTypes.map((report) => (
              <motion.div
                 key={report.id}
                 whileHover={{ y: -5 }}
                 className="p-8 rounded-[40px] border group relative overflow-hidden transition-all hover:shadow-xl bg-white"
                 style={{
                   borderColor: "rgba(56,25,50,0.07)",
                   boxShadow: "0 4px 24px rgba(56,25,50,0.06)",
                 }}
              >
                 <div className="absolute top-0 right-0 w-32 h-32 bg-slate-50/50 rounded-bl-[100px] -mr-8 -mt-8 group-hover:scale-110 transition-transform duration-500" />
                 
                 <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-6 relative z-10 shadow-sm" style={{ background: `${report.color}15` }}>
                    <report.icon size={24} color={report.color} />
                 </div>

                 <h3 style={{ fontFamily: "'Playfair Display', serif", color: PLUM, fontSize: "1.4rem", fontWeight: 800 }} className="mb-2 relative z-10">{report.title}</h3>
                 <p style={{ color: MUTED, fontSize: "0.85rem", fontWeight: 600, marginBottom: "2rem" }} className="leading-relaxed max-w-xs relative z-10">{report.desc}</p>

                 <div className="flex gap-2 relative z-10">
                    <button className="flex-1 py-3.5 rounded-2xl bg-plum text-milk text-[10px] font-black uppercase tracking-widest shadow-lg shadow-plum/20 flex items-center justify-center gap-2">
                       <Download size={14} /> Export PDF
                    </button>
                    <button className="w-14 py-3.5 rounded-2xl border flex items-center justify-center hover:bg-slate-50 transition-colors" style={{ color: PLUM, borderColor: "rgba(56,25,50,0.1)" }}>
                       <FileText size={18} />
                    </button>
                 </div>
              </motion.div>
           ))}
        </div>

        {/* Audit Panel */}
        <div className="bg-plum rounded-[40px] p-10 text-milk relative overflow-hidden group">
           <Zap className="absolute -right-10 -bottom-10 w-48 h-48 text-white/5 group-hover:scale-125 transition-transform duration-700" />
           <div className="flex flex-col md:flex-row justify-between items-center gap-8 relative z-10">
              <div>
                 <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: "1.5rem", fontWeight: 800 }} className="mb-1 italic">Quarterly Audit Manifest</h3>
                 <p style={{ color: "rgba(255,243,230,0.6)", fontSize: "0.8rem", fontWeight: 600 }}>Export the full financial ledger for the current academic session.</p>
              </div>
              <button className="px-10 py-4 rounded-2xl bg-milk text-plum text-xs font-black uppercase tracking-widest shadow-xl shadow-black/20 hover:scale-105 active:scale-95 transition-all">
                 Generate Excel
              </button>
           </div>
        </div>
      </main>
    </div>
  );
};

export default FeeReports;
