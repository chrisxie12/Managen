import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { 
  LayoutDashboard, 
  Building2, 
  Wallet, 
  Activity, 
  TrendingUp, 
  ShieldCheck, 
  Plus,
  Globe,
  Bell
} from 'lucide-react';
import { buildUrl, handleApiError } from '../services/api';
import { Button } from '../components/ui/Button';

const SuperAdminDashboard = () => {
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
    { label: 'Total Schools', value: stats?.totalSchools || 0, icon: Building2, color: '#6366F1' },
    { label: 'Active Subscriptions', value: stats?.activeSchools || 0, icon: ShieldCheck, color: '#10B981' },
    { label: 'Platform Revenue', value: stats?.totalRevenue || 0, icon: Wallet, color: '#F59E0B', prefix: '$' },
    { label: 'System Health', value: '99.9', icon: Activity, color: '#EC4899', suffix: '%' },
  ];

  return (
    <div className="p-6 sm:p-8 flex flex-col gap-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-center justify-between gap-4"
      >
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center text-accent-primary" style={{ background: "var(--bg-secondary)" }}>
              <LayoutDashboard size={24} />
            </div>
            <h1 style={{ fontFamily: "'Playfair Display', serif", color: "var(--text-primary)", fontSize: "1.8rem", fontWeight: 800 }}>Platform Node</h1>
          </div>
          <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", fontWeight: 600 }}>Super Admin • Real-time Infrastructure Monitoring</p>
        </div>
        <div className="flex gap-3">
           <Button variant="secondary" className="px-6 rounded-2xl" style={{ borderColor: "var(--border)", color: "var(--text-primary)" }}>
              <Bell size={18} className="mr-2" /> Logs
           </Button>
           <Button className="px-6 rounded-2xl bg-plum text-milk shadow-xl shadow-plum/10">
              <Plus size={18} className="mr-2" /> Deploy Node
           </Button>
        </div>
      </motion.div>

      {status.message && (
        <div className={`p-6 rounded-[32px] border text-sm font-bold flex items-center gap-3 ${status.type === 'error' ? 'bg-rose-50 border-rose-100 text-rose-600' : 'bg-emerald-50 border-emerald-100 text-emerald-600'}`}>
          {status.type === 'error' ? <Activity size={18} /> : <ShieldCheck size={18} />}
          {status.message}
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="border rounded-[32px] p-6 shadow-sm hover:shadow-xl transition-all duration-500 group"
            style={{ background: "var(--card-bg)", borderColor: "var(--border)" }}
          >
            <div className="flex items-center gap-5">
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-500`} style={{ background: `${card.color}15`, color: card.color }}>
                <card.icon size={28} />
              </div>
              <div>
                 <div className="text-2xl font-black tracking-tighter" style={{ color: "var(--text-primary)" }}>
                    {card.prefix}{card.value}{card.suffix}
                 </div>
                 <div className="text-[10px] font-black uppercase tracking-[0.2em]" style={{ color: "var(--text-muted)" }}>{card.label}</div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Live Feed & Growth Pulse */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
         <div className="lg:col-span-2 space-y-8">
            <div className="border rounded-[48px] p-10 shadow-sm relative overflow-hidden group" style={{ background: "var(--card-bg)", borderColor: "var(--border)" }}>
               <div className="absolute top-0 right-0 w-48 h-48 bg-black/[0.02] rounded-bl-[100px] -mr-16 -mt-16 group-hover:scale-110 transition-transform duration-700" />
               <div className="flex justify-between items-center mb-10 relative z-10">
                  <div>
                     <h3 style={{ fontFamily: "'Playfair Display', serif", color: "var(--text-primary)", fontSize: "1.5rem", fontWeight: 800 }}>Infrastructure Status</h3>
                     <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", fontWeight: 600 }}>Multi-tenant nodes and database clusters.</p>
                  </div>
                  <Button variant="secondary" className="px-5" style={{ borderColor: "var(--border)", color: "var(--text-primary)" }}>View Network</Button>
               </div>

               <div className="space-y-6 relative z-10">
                  {[
                     { name: 'Core API Server', region: 'US-EAST-1', status: 'Optimal', load: '12%' },
                     { name: 'Tenant DB Cluster', region: 'US-WEST-2', status: 'Optimal', load: '45%' },
                     { name: 'Asset CDN', region: 'GLOBAL', status: 'Optimal', load: '8%' },
                  ].map((node, idx) => (
                     <div key={idx} className="flex items-center justify-between p-6 rounded-3xl transition-all cursor-default group/node" style={{ background: "var(--bg-secondary)", border: "1px solid var(--border)" }}>
                        <div className="flex items-center gap-5">
                           <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-emerald-500 shadow-sm" style={{ background: "var(--card-bg)" }}>
                              <Globe size={22} className="group-hover/node:rotate-12 transition-transform" />
                           </div>
                           <div>
                              <div className="text-sm font-black" style={{ color: "var(--text-primary)" }}>{node.name}</div>
                              <div className="text-[10px] font-black uppercase tracking-widest" style={{ color: "var(--text-muted)" }}>{node.region}</div>
                           </div>
                        </div>
                        <div className="flex items-center gap-8">
                           <div className="text-right">
                              <div className="text-[10px] font-black uppercase tracking-widest mb-1" style={{ color: "var(--text-muted)" }}>Load</div>
                              <div className="text-xs font-black" style={{ color: "var(--text-primary)" }}>{node.load}</div>
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

         <div className="space-y-8 h-full">
            <div className="bg-plum rounded-[48px] p-10 text-milk relative overflow-hidden group shadow-2xl h-full min-h-[400px]">
               <TrendingUp className="absolute -right-10 -bottom-10 w-48 h-48 text-white/5 group-hover:scale-125 transition-transform duration-700" />
               <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: "1.4rem", fontWeight: 800 }} className="italic mb-2">Growth Pulse</h3>
               <p style={{ color: "rgba(255,243,230,0.6)", fontSize: "0.85rem", fontWeight: 600, marginBottom: "2rem" }}>Platform-wide subscription metrics and retention velocity.</p>
               
               <div className="space-y-8">
                  <div>
                     <div className="flex justify-between items-end mb-3">
                        <span className="text-[10px] font-black uppercase tracking-widest opacity-60">Monthly Target</span>
                        <span className="text-sm font-black">72% Reached</span>
                     </div>
                     <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
                        <motion.div 
                           initial={{ width: 0 }}
                           animate={{ width: '72%' }}
                           transition={{ duration: 2, ease: "easeOut" }}
                           className="h-full bg-milk shadow-[0_0_15px_rgba(255,243,230,0.5)]"
                        />
                     </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                     <div className="p-5 bg-white/5 rounded-[32px] border border-white/5">
                        <div className="text-2xl font-black mb-1">12</div>
                        <div className="text-[9px] font-black opacity-40 uppercase tracking-widest">New Schools</div>
                     </div>
                     <div className="p-5 bg-white/5 rounded-[32px] border border-white/5">
                        <div className="text-2xl font-black text-emerald-400 mb-1">+18%</div>
                        <div className="text-[9px] font-black opacity-40 uppercase tracking-widest">Expansion</div>
                     </div>
                  </div>
                  <Button className="w-full h-14 rounded-2xl bg-milk text-plum font-black text-xs uppercase tracking-widest shadow-xl shadow-black/20">
                     Full Analytics Hub
                  </Button>
               </div>
            </div>
         </div>
      </div>
    </div>
  );
};

export default SuperAdminDashboard;
