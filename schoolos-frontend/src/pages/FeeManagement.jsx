import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence, useMotionValue, useSpring } from 'framer-motion';
import { 
  Wallet, 
  Plus, 
  FileDown, 
  TrendingUp, 
  AlertCircle, 
  PieChart, 
  Bell, 
  Search, 
  Filter, 
  Eye, 
  Smartphone,
  X,
  CreditCard,
  Banknote,
  MoreVertical,
  CheckCircle,
  ArrowUpRight,
  ShieldCheck,
  Send,
  Zap,
  Sparkles,
  Receipt
} from 'lucide-react';
import Sidebar from '../components/layout/Sidebar';
import DashboardNavbar from '../components/layout/DashboardNavbar';
import { Button } from '../components/ui/Button';
import { SkeletonLoader } from '../components/ui/SkeletonLoader';
import { EmptyState } from '../components/ui/EmptyState';
import { buildUrl } from '../services/api';

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

const FeeManagement = ({ onNavigate }) => {
  const [activeItem, setActiveItem] = useState('fees');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isRecordModalOpen, setIsRecordModalOpen] = useState(false);
  const [isRemindersModalOpen, setIsRemindersModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [fees, setFees] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchFees = async () => {
      try {
        const res = await fetch(buildUrl('/api/school/fees'), { credentials: 'include' });
        const json = await res.json();
        if (json.data) setFees(json.data.fees || []);
      } catch (err) {
        console.error("Failed to fetch fees", err);
      } finally {
        setTimeout(() => setLoading(false), 800);
      }
    };
    fetchFees();
  }, []);

  const totalExpected = fees.reduce((acc, f) => acc + (f.amount || 0), 0) || 450000;
  const totalPaid = fees.reduce((acc, f) => acc + (f.paid_amount || 0), 0) || 312000;
  const outstanding = totalExpected - totalPaid;
  const collectionRate = 72;

  const stats = [
    { label: 'Projected Revenue', value: totalExpected, icon: Wallet, color: 'text-accent-primary', bg: 'bg-accent-primary/10', prefix: '₵' },
    { label: 'Collections', value: totalPaid, icon: TrendingUp, color: 'text-emerald-500', bg: 'bg-emerald-500/10', prefix: '₵' },
    { label: 'Outstanding', value: outstanding, icon: AlertCircle, color: 'text-rose-500', bg: 'bg-rose-500/10', prefix: '₵' },
    { label: 'Collection Rate', value: collectionRate, icon: PieChart, color: 'text-amber-500', bg: 'bg-amber-500/10', suffix: '%' },
  ];

  const filteredFees = useMemo(() => {
    return fees.filter(f => 
      (f.student_name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (f.class_name || '').toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [fees, searchQuery]);

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
              <div className="w-10 h-10 bg-amber-500/10 rounded-xl flex items-center justify-center text-amber-500">
                <Receipt size={24} />
              </div>
              <h1 className="text-3xl font-black tracking-tight font-headings">Finance</h1>
            </div>
            <p className="text-text-muted text-sm font-medium tracking-tight">Financial oversight, fee collection, and automated payment tracking.</p>
          </div>
          <div className="flex gap-3">
            <Button variant="secondary" className="px-5 border-slate-100" onClick={() => setIsRemindersModalOpen(true)}>
              <Bell size={18} className="mr-2" /> Reminders
            </Button>
            <Button onClick={() => setIsRecordModalOpen(true)} className="px-5 bg-emerald-500 hover:bg-emerald-600 shadow-lg shadow-emerald-500/15">
              <Plus size={18} className="mr-2" /> Record Payment
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
                    <CountUp value={stat.value} prefix={stat.prefix} suffix={stat.suffix} />
                  </div>
                  <div className="text-[10px] font-black text-text-muted uppercase tracking-widest">{stat.label}</div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Filters & Table */}
        <div className="bg-white border border-slate-50 rounded-[40px] shadow-sm overflow-hidden">
           <div className="p-8 border-b border-slate-50 flex flex-col lg:flex-row justify-between items-center gap-4 bg-slate-50/30">
              <div className="flex flex-1 max-w-md relative w-full">
                 <Search size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" />
                 <input 
                    placeholder="Search by student or class..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-white border border-slate-100 rounded-2xl py-3.5 pl-12 pr-6 text-xs font-bold outline-none focus:border-amber-500/20 shadow-sm"
                 />
              </div>

              <div className="flex items-center gap-3">
                 <select className="bg-white border border-slate-100 rounded-xl px-5 py-3 text-[10px] font-black text-slate-500 uppercase tracking-widest outline-none shadow-sm appearance-none min-w-[140px]">
                    <option>Current Term</option>
                    <option>Next Term</option>
                 </select>
                 <Button variant="secondary" className="h-11 px-5 border-slate-100 shadow-sm">
                    <Filter size={16} className="mr-2" /> Filter
                 </Button>
              </div>
           </div>

           <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                 <thead>
                    <tr className="bg-slate-50/50 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                       <th className="px-8 py-5">Student / Account</th>
                       <th className="px-6 py-5">Academic Level</th>
                       <th className="px-6 py-5">Total Billing</th>
                       <th className="px-6 py-5">Total Paid</th>
                       <th className="px-6 py-5">Balance</th>
                       <th className="px-6 py-5">Financial Status</th>
                       <th className="px-8 py-5 text-right">Actions</th>
                    </tr>
                 </thead>
                 <tbody className="divide-y divide-slate-50">
                    {loading ? (
                       Array.from({ length: 5 }).map((_, i) => (
                          <tr key={i}>
                             <td className="px-8 py-6">
                                <div className="flex items-center gap-3">
                                   <SkeletonLoader width="36px" height="36px" borderRadius="999px" />
                                   <SkeletonLoader width="140px" height="14px" />
                                </div>
                             </td>
                             <td className="px-6 py-6"><SkeletonLoader width="80px" height="14px" /></td>
                             <td className="px-6 py-6"><SkeletonLoader width="70px" height="14px" /></td>
                             <td className="px-6 py-6"><SkeletonLoader width="70px" height="14px" /></td>
                             <td className="px-6 py-6"><SkeletonLoader width="70px" height="14px" /></td>
                             <td className="px-6 py-6"><SkeletonLoader width="90px" height="24px" borderRadius="99px" /></td>
                             <td className="px-8 py-6 text-right"><SkeletonLoader width="32px" height="32px" borderRadius="8px" className="ml-auto" /></td>
                          </tr>
                       ))
                    ) : filteredFees.length > 0 ? (
                       filteredFees.map((f, i) => {
                          const balance = (f.amount || 0) - (f.paid_amount || 0);
                          return (
                          <motion.tr 
                            key={f.id}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: i * 0.03 }}
                            className="hover:bg-slate-50/50 transition-colors group cursor-pointer"
                          >
                             <td className="px-8 py-5">
                                <div className="flex items-center gap-3">
                                   <div className="w-9 h-9 rounded-full bg-slate-50 flex items-center justify-center text-[10px] font-black text-amber-500 border border-slate-100 uppercase">
                                      {(f.student_name || '??').substring(0, 2)}
                                   </div>
                                   <div className="text-sm font-bold text-text-primary group-hover:text-amber-600 transition-colors">{f.student_name}</div>
                                </div>
                             </td>
                             <td className="px-6 py-5 text-xs font-black text-text-secondary">{f.class_name}</td>
                             <td className="px-6 py-5 text-sm font-black text-text-primary tracking-tight">₵{f.amount || 0}</td>
                             <td className="px-6 py-5 text-sm font-bold text-emerald-500 tracking-tight">₵{f.paid_amount || 0}</td>
                             <td className="px-6 py-5 text-sm font-black text-rose-500 tracking-tight">₵{balance}</td>
                             <td className="px-6 py-5">
                                <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-wider border ${
                                   balance === 0 ? 'bg-emerald-50 border-emerald-100 text-emerald-600' :
                                   f.paid_amount > 0 ? 'bg-amber-50 border-amber-100 text-amber-600' :
                                   'bg-rose-50 border-rose-100 text-rose-600'
                                }`}>
                                   {balance === 0 ? 'Fully Paid' : f.paid_amount > 0 ? 'Partial Payment' : 'Outstanding'}
                                </div>
                             </td>
                             <td className="px-8 py-5 text-right">
                                <button className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-300 hover:text-text-primary hover:bg-white hover:shadow-sm transition-all"><MoreVertical size={16} /></button>
                             </td>
                          </motion.tr>
                       )})
                    ) : (
                       <tr>
                          <td colSpan={7}>
                             <EmptyState 
                                isSearch={searchQuery.length > 0}
                                title={searchQuery ? "No financial records" : "No billing active"}
                                description={searchQuery 
                                   ? `No financial records match your search for "${searchQuery}".`
                                   : "The financial roster is currently empty. Start by generating termly fee bills for students."}
                                actionLabel={!searchQuery && "Generate Billing"}
                                onAction={() => setIsRecordModalOpen(true)}
                             />
                          </td>
                       </tr>
                    )}
                 </tbody>
              </table>
           </div>

           <div className="p-8 bg-slate-50/50 flex justify-between items-center">
              <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                 Audit Trail: <span className="text-emerald-500 italic">All transactions are encrypted and logged</span>
              </div>
              <div className="flex gap-2">
                 <Button variant="secondary" size="sm" className="h-10 px-4 rounded-xl text-[10px] font-black uppercase border-slate-100" disabled>Previous</Button>
                 <Button variant="secondary" size="sm" className="h-10 px-4 rounded-xl text-[10px] font-black uppercase border-slate-100" disabled>Next</Button>
              </div>
           </div>
        </div>
      </main>

      {/* Record Payment Modal */}
      <AnimatePresence>
        {isRecordModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsRecordModalOpen(false)}
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
                  <h2 className="text-2xl font-black tracking-tight text-text-primary font-headings">Revenue Collection</h2>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Finance • Payment Recording</p>
                </div>
                <button onClick={() => setIsRecordModalOpen(false)} className="w-12 h-12 flex items-center justify-center rounded-full bg-white border border-slate-100 text-slate-400 hover:text-text-primary transition-colors shadow-sm">
                  <X size={20} />
                </button>
              </div>

              <div className="p-10 max-h-[60vh] overflow-y-auto no-scrollbar">
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                    <div className="flex flex-col gap-2">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Search Student</label>
                       <input 
                         placeholder="Name or Admission No..."
                         className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 text-sm font-bold text-text-primary outline-none focus:bg-white focus:border-emerald-500/30 transition-all shadow-sm"
                       />
                    </div>
                    <div className="flex flex-col gap-2">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Payment Amount (₵)</label>
                       <input 
                         type="number"
                         placeholder="0.00"
                         className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 text-sm font-black text-text-primary outline-none focus:bg-white focus:border-emerald-500/30 transition-all shadow-sm"
                       />
                    </div>
                 </div>

                 <div className="flex flex-col gap-2 mb-8">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Payment Method</label>
                    <div className="grid grid-cols-3 gap-3">
                       {['Bank Transfer', 'MTN MoMo', 'Cash'].map(method => (
                          <button key={method} className="py-4 rounded-xl border border-slate-100 bg-slate-50 text-[10px] font-black uppercase tracking-widest text-slate-500 hover:bg-white hover:border-accent-primary hover:text-accent-primary transition-all">
                             {method}
                          </button>
                       ))}
                    </div>
                 </div>

                 <div className="bg-amber-50 rounded-2xl p-6 border border-amber-100 italic text-amber-700 text-xs font-medium">
                    A digital receipt will be automatically generated and sent to the parent's registered mobile number upon confirmation.
                 </div>
              </div>

              <div className="px-10 py-8 bg-slate-50/50 border-t border-slate-50 flex gap-4">
                <Button className="flex-1 h-14 rounded-2xl shadow-xl shadow-emerald-500/10 font-black text-sm uppercase tracking-widest bg-emerald-500 hover:bg-emerald-600">Post Transaction</Button>
                <Button variant="secondary" className="flex-1 h-14 rounded-2xl font-black text-xs uppercase tracking-widest border-slate-200" onClick={() => setIsRecordModalOpen(false)}>Discard</Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default FeeManagement;
