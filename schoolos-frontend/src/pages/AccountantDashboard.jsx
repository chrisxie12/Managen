import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence, useMotionValue, useSpring } from 'framer-motion';
import { 
  Wallet, 
  TrendingUp, 
  TrendingDown, 
  Users, 
  Receipt, 
  CreditCard, 
  Banknote, 
  AlertCircle, 
  ArrowUpRight, 
  ArrowDownRight,
  Plus,
  Search,
  Bell,
  Filter,
  Download,
  CheckCircle2,
  PieChart,
  BarChart3,
  Calendar,
  Sparkles,
  Zap,
  DollarSign,
  Smartphone,
  ChevronRight
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

const AccountantDashboard = ({ onNavigate }) => {
  const [activeItem, setActiveItem] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  const stats = [
    { label: 'Total Revenue', value: 482500, icon: Wallet, color: 'text-accent-primary', bg: 'bg-accent-primary/10', trend: '+12%', prefix: '₵' },
    { label: 'Collections', value: 312400, icon: TrendingUp, color: 'text-emerald-500', bg: 'bg-emerald-500/10', trend: '+8.4%', prefix: '₵' },
    { label: 'Outstanding', value: 170100, icon: AlertCircle, color: 'text-rose-500', bg: 'bg-rose-500/10', trend: '-2.1%', prefix: '₵' },
    { label: 'Operational Costs', value: 89400, icon: TrendingDown, color: 'text-amber-500', bg: 'bg-amber-500/10', trend: '+4.2%', prefix: '₵' },
  ];

  const recentTransactions = [
    { id: 1, student: 'Ama Mensah', type: 'Tuition Fee', amount: 2400, date: '10 mins ago', status: 'Success', method: 'MTN MoMo' },
    { id: 2, student: 'Kofi Asante', type: 'Bus Fee', amount: 450, date: '25 mins ago', status: 'Success', method: 'Cash' },
    { id: 3, student: 'Adwoa Boateng', type: 'Tuition Fee', amount: 1800, date: '1 hour ago', status: 'Pending', method: 'Bank' },
    { id: 4, student: 'Kwame Osei', type: 'Library Fine', amount: 25, date: '3 hours ago', status: 'Success', method: 'Cash' },
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
                <BarChart3 size={24} />
              </div>
              <h1 className="text-3xl font-black tracking-tight font-headings uppercase tracking-tighter">Finance Hub</h1>
            </div>
            <p className="text-text-muted text-sm font-medium tracking-tight">Welcome back, <span className="text-accent-primary font-black">Chief Accountant</span>. Here's your financial pulse for today.</p>
          </div>
          <div className="flex gap-3">
            <Button variant="secondary" className="px-5 border-slate-100">
              <Download size={18} className="mr-2" /> Financial Statement
            </Button>
            <Button className="px-5 shadow-lg shadow-accent-primary/15">
              <Plus size={18} className="mr-2" /> Record Receipt
            </Button>
          </div>
        </motion.div>

        {/* Financial Pulse Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          {stats.map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="bg-white border border-slate-50 rounded-[32px] p-7 shadow-sm hover:shadow-md transition-all duration-300 group relative overflow-hidden"
            >
               <div className="absolute top-0 right-0 w-24 h-24 bg-slate-50/50 rounded-bl-[60px] -mr-8 -mt-8 group-hover:scale-110 transition-transform duration-700" />
              <div className="flex flex-col gap-6 relative z-10">
                <div className="flex justify-between items-start">
                   <div className={`w-14 h-14 rounded-2xl ${stat.bg} flex items-center justify-center ${stat.color} group-hover:rotate-6 transition-transform shadow-sm`}>
                     <stat.icon size={26} />
                   </div>
                   <div className={`px-3 py-1 rounded-full text-[10px] font-black ${stat.trend.startsWith('+') ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                      {stat.trend}
                   </div>
                </div>
                <div>
                  <div className="text-3xl font-black text-text-primary tracking-tighter leading-none mb-1">
                    <CountUp value={stat.value} prefix={stat.prefix} />
                  </div>
                  <div className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em]">{stat.label}</div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
           {/* Revenue Analytics Chart Mockup */}
           <div className="xl:col-span-2 bg-white border border-slate-50 rounded-[40px] p-10 shadow-sm relative overflow-hidden group">
              <div className="flex justify-between items-center mb-10">
                 <div>
                    <h3 className="text-xl font-black font-headings tracking-tight leading-none mb-2 text-text-primary">Revenue Streams</h3>
                    <p className="text-[10px] font-black text-text-muted uppercase tracking-widest">Monthly Collection Projection (2026)</p>
                 </div>
                 <div className="flex gap-2">
                    <div className="flex items-center gap-2 px-4 py-2 bg-slate-50 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-400">
                       <div className="w-2 h-2 rounded-full bg-accent-primary" /> Target
                    </div>
                    <div className="flex items-center gap-2 px-4 py-2 bg-slate-50 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-400">
                       <div className="w-2 h-2 rounded-full bg-emerald-500" /> Actual
                    </div>
                 </div>
              </div>

              <div className="h-[300px] flex items-end justify-between gap-6 px-4">
                 {[40, 65, 45, 80, 55, 90, 70, 85].map((val, i) => (
                    <div key={i} className="flex-1 flex flex-col items-center gap-3 h-full justify-end">
                       <div className="w-full flex gap-1 items-end h-full">
                          <motion.div 
                            initial={{ height: 0 }}
                            animate={{ height: `${val}%` }}
                            transition={{ duration: 1, delay: i * 0.1 }}
                            className="flex-1 bg-slate-100 rounded-t-xl group-hover:bg-accent-primary/20 transition-colors"
                          />
                          <motion.div 
                            initial={{ height: 0 }}
                            animate={{ height: `${val * 0.8}%` }}
                            transition={{ duration: 1.2, delay: i * 0.1 + 0.2 }}
                            className="flex-1 bg-accent-primary rounded-t-xl group-hover:bg-accent-primary transition-colors shadow-lg shadow-accent-primary/10"
                          />
                       </div>
                       <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">{['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug'][i]}</span>
                    </div>
                 ))}
              </div>
           </div>

           {/* Quick Actions / Summary */}
           <div className="flex flex-col gap-6">
              <div className="bg-emerald-500 border border-emerald-400 rounded-[40px] p-10 shadow-xl shadow-emerald-500/15 relative overflow-hidden group">
                 <Zap className="absolute -right-6 -bottom-6 w-32 h-32 text-white/10 group-hover:scale-125 transition-transform duration-700" />
                 <h3 className="text-xl font-black text-white font-headings tracking-tight leading-none mb-6 relative z-10">Instant Collection</h3>
                 <div className="space-y-4 relative z-10">
                    <button className="w-full h-14 bg-white rounded-2xl flex items-center justify-center gap-3 text-emerald-600 font-black text-[11px] uppercase tracking-widest hover:bg-slate-50 transition-all shadow-lg shadow-black/5">
                       <Smartphone size={18} /> Mobile Money Portal
                    </button>
                    <button className="w-full h-14 bg-white/20 border border-white/20 rounded-2xl flex items-center justify-center gap-3 text-white font-black text-[11px] uppercase tracking-widest hover:bg-white/30 transition-all">
                       <Download size={18} /> Download Fee Log
                    </button>
                 </div>
              </div>

              <div className="bg-white border border-slate-50 rounded-[40px] p-8 shadow-sm flex-1">
                 <h3 className="text-sm font-black text-text-primary uppercase tracking-widest mb-6 flex items-center justify-between">
                    Alert Queue
                    <span className="w-6 h-6 bg-rose-500 text-white rounded-full flex items-center justify-center text-[10px] font-black shadow-lg shadow-rose-500/20">3</span>
                 </h3>
                 <div className="space-y-4">
                    {[
                       { msg: 'Defaulter Alert: 42 Students', time: '12m ago', color: 'text-rose-500' },
                       { msg: 'Bank Sync: 12 New Deposits', time: '1h ago', color: 'text-emerald-500' },
                       { msg: 'Staff Payroll: Pending Review', time: '3h ago', color: 'text-amber-500' },
                    ].map((alert, i) => (
                       <div key={i} className="flex items-center gap-4 p-4 bg-slate-50/50 rounded-2xl hover:bg-slate-50 transition-all cursor-pointer group">
                          <div className={`w-2 h-2 rounded-full ${alert.color.replace('text-', 'bg-')} shadow-[0_0_8px] ${alert.color.replace('text-', 'shadow-')}`} />
                          <div className="flex-1">
                             <div className="text-xs font-bold text-text-secondary group-hover:text-text-primary transition-colors">{alert.msg}</div>
                             <div className="text-[10px] font-bold text-slate-400 mt-1">{alert.time}</div>
                          </div>
                          <ChevronRight size={14} className="text-slate-300" />
                       </div>
                    ))}
                 </div>
              </div>
           </div>
        </div>

        {/* Transaction Ledger */}
        <div className="mt-10 bg-white border border-slate-50 rounded-[40px] shadow-sm overflow-hidden">
           <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-slate-50/30">
              <h3 className="text-xl font-black font-headings tracking-tight text-text-primary">Live Ledger</h3>
              <div className="flex gap-3">
                 <div className="relative">
                    <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
                    <input placeholder="Receipt No..." className="bg-white border border-slate-100 rounded-xl py-2.5 pl-10 pr-4 text-[10px] font-black uppercase tracking-widest outline-none focus:border-accent-primary/20 shadow-sm" />
                 </div>
                 <Button variant="secondary" className="h-10 px-4 rounded-xl text-[10px] font-black uppercase tracking-widest border-slate-100">Ledger History</Button>
              </div>
           </div>

           <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                 <thead>
                    <tr className="bg-slate-50/50 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                       <th className="px-8 py-5">Entity / Account</th>
                       <th className="px-6 py-5">Nature of Transaction</th>
                       <th className="px-6 py-5">Amount</th>
                       <th className="px-6 py-5">Channel</th>
                       <th className="px-6 py-5">Timestamp</th>
                       <th className="px-8 py-5 text-right">Status</th>
                    </tr>
                 </thead>
                 <tbody className="divide-y divide-slate-50">
                    {loading ? (
                       Array.from({ length: 4 }).map((_, i) => (
                          <tr key={i}>
                             <td className="px-8 py-6"><SkeletonLoader width="140px" height="14px" /></td>
                             <td className="px-6 py-6"><SkeletonLoader width="100px" height="14px" /></td>
                             <td className="px-6 py-6"><SkeletonLoader width="80px" height="14px" /></td>
                             <td className="px-6 py-6"><SkeletonLoader width="90px" height="14px" /></td>
                             <td className="px-6 py-6"><SkeletonLoader width="70px" height="14px" /></td>
                             <td className="px-8 py-6 text-right"><SkeletonLoader width="80px" height="24px" borderRadius="99px" className="ml-auto" /></td>
                          </tr>
                       ))
                    ) : (
                       recentTransactions.map((tx, i) => (
                          <motion.tr 
                            key={tx.id}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: i * 0.05 }}
                            className="hover:bg-slate-50/50 transition-colors group cursor-pointer"
                          >
                             <td className="px-8 py-5">
                                <div className="text-sm font-bold text-text-primary group-hover:text-accent-primary transition-colors">{tx.student}</div>
                             </td>
                             <td className="px-6 py-5 text-xs font-black text-slate-400 uppercase tracking-tight">{tx.type}</td>
                             <td className="px-6 py-5 text-sm font-black text-text-primary">₵{tx.amount}</td>
                             <td className="px-6 py-5">
                                <div className="flex items-center gap-2 text-xs font-bold text-text-secondary">
                                   <CreditCard size={14} className="text-slate-300" />
                                   {tx.method}
                                </div>
                             </td>
                             <td className="px-6 py-5 text-[11px] font-bold text-slate-400">{tx.date}</td>
                             <td className="px-8 py-5 text-right">
                                <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-wider ${
                                   tx.status === 'Success' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
                                }`}>
                                   {tx.status}
                                </div>
                             </td>
                          </motion.tr>
                       ))
                    )}
                 </tbody>
              </table>
           </div>
        </div>
      </main>
    </div>
  );
};

export default AccountantDashboard;
