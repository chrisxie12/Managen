import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { 
  GraduationCap, 
  Users, 
  TrendingUp, 
  Activity, 
  Wallet, 
  ClipboardCheck, 
  FileText,
  Calendar,
  Clock,
  ArrowUpRight,
  MoreVertical,
  Bell,
  ChevronRight,
  Sparkles,
  Zap,
  ArrowRight,
  UserPlus,
  Search,
  Share2,
  CheckCircle2,
  BarChart2,
  Globe,
  Plus,
  LayoutDashboard
} from 'lucide-react';
import Sidebar from '../components/layout/Sidebar';
import DashboardNavbar from '../components/layout/DashboardNavbar';
import { buildUrl, handleApiError } from '../services/api';
import { SkeletonLoader } from '../components/ui/SkeletonLoader';
import { Button } from '../components/ui/Button';

const Dashboard = ({ onNavigate }) => {
  const { authSession } = useAuth();
  const [activeItem, setActiveItem] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [dashboardStats, setDashboardStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch(buildUrl('/api/school/dashboard'), { credentials: 'include' });
        if (!res.ok) throw new Error(await handleApiError(res));
        const json = await res.json();
        if (json.data) setDashboardStats(json.data);
      } catch (err) {
        console.error("Failed to fetch dashboard stats", err);
      } finally {
        setTimeout(() => setLoading(false), 800);
      }
    };
    fetchStats();
  }, []);

  return (
    <div className="min-h-screen bg-bg-primary text-text-primary selection:bg-accent-primary/30 font-body">
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

      <main className="md:ml-[280px] pt-24 p-4 sm:p-8 pb-20 relative">
        {/* Background Glows */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-accent-primary/5 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-accent-secondary/5 rounded-full blur-[100px] pointer-events-none" />

        {/* Hero Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative w-full rounded-[32px] sm:rounded-[40px] overflow-hidden bg-card-bg/80 backdrop-blur-3xl border border-border mb-10 p-6 sm:p-10 lg:p-14 flex flex-col lg:flex-row items-center justify-between gap-10 shadow-intense"
        >
          <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-[0.03] pointer-events-none" />
          
          <div className="relative z-10 space-y-6 max-w-2xl">
            <div className="flex items-center gap-3">
              <div className="bg-blue-500/10 text-blue-400 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] border border-blue-500/20 backdrop-blur-md">
                 Active Instance: Node-04
              </div>
              <div className="bg-emerald-500/10 text-emerald-400 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] border border-emerald-500/20 backdrop-blur-md">
                 Optimal Health
              </div>
            </div>
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.1] uppercase italic">
              Empowering <span className="text-accent-primary">Excellence.</span>
            </h1>
            <p className="text-text-secondary font-bold text-lg leading-relaxed max-w-lg">
              Manage your institution with surgical precision. All systems are currently operational and synchronized.
            </p>
            <div className="flex items-center gap-4">
               <Button className="px-8 h-14 rounded-2xl bg-accent-primary text-bg-primary font-black text-xs uppercase tracking-widest hover:bg-accent-secondary shadow-2xl shadow-accent-primary/20">
                  Quick Action <Plus size={18} className="ml-2" />
               </Button>
               <Button variant="secondary" className="px-8 h-14 rounded-2xl border-border text-text-primary font-black text-xs uppercase tracking-widest hover:bg-bg-secondary">
                  Full Reports <FileText size={18} className="ml-2" />
               </Button>
            </div>
          </div>

          <div className="relative z-10 grid grid-cols-2 gap-6 w-full lg:w-auto">
             {[
                { label: 'Students', val: dashboardStats?.totalStudents || '2.4k', icon: GraduationCap, color: 'text-blue-500' },
                { label: 'Staff', val: '124', icon: Users, color: 'text-indigo-400' },
                { label: 'Attendance', val: '94.2%', icon: CheckCircle2, color: 'text-emerald-400' },
                { label: 'Revenue', val: '₵120k', icon: Wallet, color: 'text-amber-400' },
             ].map((stat, i) => (
                <div key={i} className="bg-white/5 backdrop-blur-md p-6 rounded-[32px] border border-white/5 min-w-[160px] group hover:bg-white/10 transition-all duration-500">
                   <stat.icon className={`mb-3 ${stat.color} group-hover:scale-110 transition-transform`} size={24} />
                   <div className="text-2xl font-black tracking-tighter mb-1">{stat.val}</div>
                   <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{stat.label}</div>
                </div>
             ))}
          </div>
        </motion.div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 relative z-10">
          
          {/* Performance Analytics */}
          <div className="lg:col-span-2 space-y-10 min-w-0">
            <div className="bg-slate-900/40 backdrop-blur-3xl rounded-[32px] sm:rounded-[40px] p-6 sm:p-10 border border-white/5 shadow-xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/[0.02] rounded-bl-[120px] -mr-20 -mt-20 group-hover:scale-110 transition-transform duration-1000" />
              
              <div className="flex items-center justify-between mb-12 relative z-10">
                <div>
                   <h3 className="text-2xl font-black tracking-tight uppercase italic mb-1">Performance Matrix</h3>
                   <p className="text-xs font-bold text-text-muted uppercase tracking-widest">Cross-sectional institutional analytics</p>
                </div>
                <div className="flex items-center gap-3">
                   <div className="px-4 py-2 bg-white/5 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-400 border border-white/5">
                      Term 2 • 2026
                   </div>
                </div>
              </div>

              {/* Futuristic Bar Chart */}
              <div className="overflow-x-auto no-scrollbar -mx-2">
                <div className="flex items-end justify-between gap-3 sm:gap-5 h-64 px-2 relative z-10 min-w-[600px] sm:min-w-0">
                  {[40, 65, 45, 80, 55, 90, 70, 85, 60, 75, 50, 65].map((h, i) => (
                    <div key={i} className="flex-1 flex flex-col items-center gap-4 group/bar">
                      <div className="relative w-full h-full bg-white/[0.02] rounded-2xl overflow-hidden border border-white/5">
                         <motion.div 
                           initial={{ height: 0 }}
                           animate={{ height: `${h}%` }}
                           transition={{ duration: 1.5, delay: i * 0.05, ease: "easeOut" }}
                           className={`absolute bottom-0 left-0 right-0 transition-all duration-500 ${i === 5 ? 'bg-accent-primary shadow-[0_0_20px_rgba(56,25,50,0.4)]' : 'bg-accent-primary/10 group-hover/bar:bg-accent-primary/20'}`} 
                         />
                      </div>
                      <span className="text-[10px] font-black text-text-muted uppercase tracking-tighter group-hover/bar:text-accent-primary transition-colors">
                        {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][i]}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
               <div className="bg-white/5 backdrop-blur-md p-8 rounded-[40px] border border-white/5 shadow-xl flex items-center gap-8 group hover:bg-white/10 transition-all">
                  <div className="w-16 h-16 bg-emerald-500/10 rounded-[24px] flex items-center justify-center text-emerald-400 border border-emerald-500/20 group-hover:scale-110 transition-transform">
                    <Activity size={32} />
                  </div>
                  <div>
                    <div className="text-3xl font-black tracking-tighter">94.2%</div>
                    <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Real-time Attendance</div>
                  </div>
               </div>
               <div className="bg-white/5 backdrop-blur-md p-8 rounded-[40px] border border-white/5 shadow-xl flex items-center gap-8 group hover:bg-white/10 transition-all">
                  <div className="w-16 h-16 bg-blue-500/10 rounded-[24px] flex items-center justify-center text-blue-400 border border-blue-500/20 group-hover:scale-110 transition-transform">
                    <UserPlus size={32} />
                  </div>
                  <div>
                    <div className="text-3xl font-black tracking-tighter">24</div>
                    <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Cycle Enrollments</div>
                  </div>
               </div>
            </div>
          </div>

          {/* Infrastructure Sidebar */}
          <div className="space-y-10 min-w-0">
             <div className="bg-slate-900/40 backdrop-blur-3xl rounded-[32px] sm:rounded-[40px] p-6 sm:p-10 border border-white/5 shadow-xl relative overflow-hidden group">
                <div className="absolute bottom-0 right-0 w-32 h-32 bg-indigo-600/[0.03] rounded-tl-[120px] -mr-10 -mb-10 group-hover:scale-110 transition-transform" />
                <div className="flex items-center justify-between mb-10 relative z-10">
                   <h3 className="text-lg font-black uppercase italic tracking-tight">Active Nodes</h3>
                   <button className="text-[10px] font-black uppercase tracking-widest text-blue-500 hover:text-blue-400">Manage Hub</button>
                </div>
                <div className="space-y-8 relative z-10">
                   {[
                     { name: 'Oliver Cranston', role: 'Head of UX', status: 'Online', score: 4.9 },
                     { name: 'Sara Green', role: 'Curriculum Dev', status: 'In-Meeting', score: 4.8 },
                     { name: 'Sam Wilson', role: 'Dean of Students', status: 'Online', score: 4.7 },
                     { name: 'Emily Carter', role: 'Admissions', status: 'Away', score: 4.9 }
                   ].map((staff, i) => (
                     <div key={i} className="flex items-center gap-5 group/item">
                        <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-white font-black border border-white/10 shadow-lg group-hover/item:bg-blue-600 group-hover/item:border-blue-500 transition-all duration-300">
                           {staff.name.charAt(0)}
                        </div>
                        <div className="flex-1 min-w-0">
                           <div className="text-sm font-black text-white truncate">{staff.name}</div>
                           <div className="text-[9px] font-black text-slate-500 uppercase tracking-widest">{staff.role}</div>
                        </div>
                        <div className="flex flex-col items-end gap-1">
                           <div className={`w-2 h-2 rounded-full ${staff.status === 'Online' ? 'bg-emerald-500' : staff.status === 'Away' ? 'bg-amber-500' : 'bg-slate-500'} shadow-[0_0_8px_currentColor]`} />
                           <div className="text-[9px] font-black text-blue-500 italic">{staff.score}</div>
                        </div>
                     </div>
                   ))}
                </div>
                <button className="w-full mt-12 py-4 bg-white/5 rounded-[20px] text-[10px] font-black uppercase tracking-widest text-slate-500 hover:bg-white/10 hover:text-white transition-all border border-white/5">
                  Platform Directory
                </button>
             </div>

             <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-[32px] sm:rounded-[40px] p-8 sm:p-10 text-white relative overflow-hidden shadow-2xl group border border-white/10">
                <TrendingUp className="absolute -right-10 -bottom-10 w-48 h-48 text-white/5 group-hover:scale-125 transition-transform duration-700" />
                <div className="relative z-10">
                   <h3 className="text-2xl font-black italic uppercase tracking-tight mb-3">Scale Instance</h3>
                   <p className="text-sm font-bold text-white/70 mb-10 leading-relaxed uppercase tracking-widest text-[10px]">Initialize multi-campus synchronization and unlock advanced analytics.</p>
                   <button className="w-full py-5 bg-white text-blue-600 rounded-[20px] text-[10px] font-black uppercase tracking-widest shadow-2xl hover:bg-slate-50 transition-all active:scale-95 flex items-center justify-center gap-3">
                     Provision Upgrade <Zap size={16} />
                   </button>
                </div>
             </div>
          </div>

        </div>
      </main>
    </div>
  );
};

export default Dashboard;
