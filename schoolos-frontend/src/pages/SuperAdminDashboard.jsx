import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { 
  LayoutDashboard, 
  Building2, 
  Wallet, 
  Users, 
  Activity, 
  TrendingUp, 
  ShieldCheck, 
  Plus,
  ArrowUpRight,
  Globe,
  Bell
} from 'lucide-react';
import Sidebar from '../components/layout/Sidebar';
import DashboardNavbar from '../components/layout/DashboardNavbar';
import { buildUrl, handleApiError } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/Button';

export const SuperAdminDashboard = ({ onNavigate }) => {
  const { authSession, signOut } = useAuth();
  const [activeItem, setActiveItem] = useState('superadmin-dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState({ type: '', message: '' });

  const loadDashboardData = async () => {
    try {
      const response = await fetch(buildUrl('/api/superadmin/dashboard'), {
        credentials: 'include',
      });
      if (!response.ok) {
          const msg = await handleApiError(response);
          throw new Error(msg);
      }
      const result = await response.json();
      setStats(result.data?.stats || result.stats || null);
    } catch(e) {
      setStatus({ type: 'error', message: e.message });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  const statCards = [
    { label: 'Total Schools', value: stats?.totalSchools || 0, icon: Building2, color: 'text-accent-primary', bg: 'bg-accent-primary/10' },
    { label: 'Active Subscriptions', value: stats?.activeSchools || 0, icon: ShieldCheck, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
    { label: 'Platform Revenue', value: stats?.totalRevenue || 0, icon: Wallet, color: 'text-amber-500', bg: 'bg-amber-500/10', prefix: '$' },
    { label: 'System Health', value: '99.9', icon: Activity, color: 'text-indigo-500', bg: 'bg-indigo-500/10', suffix: '%' },
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
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-4"
        >
          <div>
            <div className="flex items-center gap-3 mb-1">
              <div className="w-10 h-10 bg-accent-primary/10 rounded-xl flex items-center justify-center text-accent-primary shadow-lg shadow-accent-primary/5">
                <LayoutDashboard size={24} />
              </div>
              <h1 className="text-3xl font-black tracking-tight font-headings uppercase italic">Platform Node</h1>
            </div>
            <p className="text-text-muted text-sm font-bold uppercase tracking-widest opacity-60">Super Admin • Real-time Infrastructure Monitoring</p>
          </div>
          <div className="flex gap-3">
             <Button variant="secondary" className="px-6 rounded-2xl border-slate-100">
                <Bell size={18} className="mr-2" /> Logs
             </Button>
             <Button className="px-6 rounded-2xl bg-[#0F172A] hover:bg-black shadow-xl shadow-black/10">
                <Plus size={18} className="mr-2" /> Deploy Node
             </Button>
          </div>
        </motion.div>

        {status.message && (
          <div className={`p-6 mb-8 rounded-[32px] border text-sm font-bold flex items-center gap-3 ${status.type === 'error' ? 'bg-rose-50 border-rose-100 text-rose-600' : 'bg-emerald-50 border-emerald-100 text-emerald-600'}`}>
            {status.type === 'error' ? <Activity size={18} /> : <ShieldCheck size={18} />}
            {status.message}
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {statCards.map((card, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="bg-white border border-slate-50 rounded-[32px] p-6 shadow-sm hover:shadow-xl transition-all duration-500 group"
            >
              <div className="flex items-center gap-5">
                <div className={`w-14 h-14 rounded-2xl ${card.bg} flex items-center justify-center ${card.color} group-hover:scale-110 transition-transform duration-500`}>
                  <card.icon size={28} />
                </div>
                <div>
                   <div className="text-2xl font-black text-text-primary tracking-tighter">
                      {card.prefix}{card.value}{card.suffix}
                   </div>
                   <div className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em]">{card.label}</div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Live Feed & Recent Schools */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
           <div className="lg:col-span-2 space-y-8">
              <div className="bg-white border border-slate-50 rounded-[48px] p-10 shadow-sm relative overflow-hidden group">
                 <div className="absolute top-0 right-0 w-48 h-48 bg-accent-primary/[0.02] rounded-bl-[100px] -mr-16 -mt-16 group-hover:scale-110 transition-transform duration-700" />
                 <div className="flex justify-between items-center mb-10 relative z-10">
                    <div>
                       <h3 className="text-2xl font-black tracking-tight font-headings">Infrastructure Status</h3>
                       <p className="text-sm font-bold text-slate-400 mt-1">Multi-tenant nodes and database clusters.</p>
                    </div>
                    <Button variant="secondary" className="px-5 border-slate-100">View Network</Button>
                 </div>

                 <div className="space-y-6 relative z-10">
                    {[
                       { name: 'Core API Server', region: 'US-EAST-1', status: 'Optimal', load: '12%' },
                       { name: 'Tenant DB Cluster', region: 'US-WEST-2', status: 'Optimal', load: '45%' },
                       { name: 'Asset CDN', region: 'GLOBAL', status: 'Optimal', load: '8%' },
                    ].map((node, idx) => (
                       <div key={idx} className="flex items-center justify-between p-6 bg-slate-50/50 border border-slate-50 rounded-3xl hover:bg-white hover:shadow-md transition-all cursor-default group/node">
                          <div className="flex items-center gap-5">
                             <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-emerald-500 shadow-sm">
                                <Globe size={22} className="group-hover/node:rotate-12 transition-transform" />
                             </div>
                             <div>
                                <div className="text-sm font-black text-text-primary">{node.name}</div>
                                <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{node.region}</div>
                             </div>
                          </div>
                          <div className="flex items-center gap-8">
                             <div className="text-right">
                                <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Load</div>
                                <div className="text-xs font-black text-text-primary">{node.load}</div>
                             </div>
                             <div className="px-4 py-1.5 bg-emerald-50 text-emerald-600 text-[10px] font-black uppercase tracking-widest rounded-full border border-emerald-100">
                                {node.status}
                             </div>
                          </div>
                       </div>
                    ))}
                 </div>
              </div>
           </div>

           <div className="space-y-8">
              <div className="bg-[#0F172A] rounded-[48px] p-10 text-white relative overflow-hidden group shadow-2xl">
                 <TrendingUp className="absolute -right-10 -bottom-10 w-48 h-48 text-white/5 group-hover:scale-125 transition-transform duration-700" />
                 <h3 className="text-xl font-black font-headings italic mb-2 text-accent-primary">Growth Pulse</h3>
                 <p className="text-sm font-bold text-slate-400 mb-8 leading-relaxed">Platform-wide subscription metrics and retention velocity.</p>
                 
                 <div className="space-y-8">
                    <div>
                       <div className="flex justify-between items-end mb-3">
                          <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Monthly Target</span>
                          <span className="text-sm font-black text-white">72% Reached</span>
                       </div>
                       <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                          <motion.div 
                             initial={{ width: 0 }}
                             animate={{ width: '72%' }}
                             transition={{ duration: 2, ease: "easeOut" }}
                             className="h-full bg-accent-primary shadow-[0_0_15px_rgba(45,125,250,0.5)]"
                          />
                       </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                       <div className="p-5 bg-white/5 rounded-[32px] border border-white/5">
                          <div className="text-2xl font-black text-white mb-1">12</div>
                          <div className="text-[9px] font-black text-slate-500 uppercase tracking-widest">New Schools</div>
                       </div>
                       <div className="p-5 bg-white/5 rounded-[32px] border border-white/5">
                          <div className="text-2xl font-black text-emerald-500 mb-1">+18%</div>
                          <div className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Expansion</div>
                       </div>
                    </div>
                    <Button className="w-full h-14 rounded-2xl bg-white text-[#0F172A] font-black text-xs uppercase tracking-widest hover:bg-slate-100 shadow-xl shadow-black/20">
                       Full Analytics Hub
                    </Button>
                 </div>
              </div>
           </div>
        </div>
      </main>
    </div>
  );
};

export default SuperAdminDashboard;
