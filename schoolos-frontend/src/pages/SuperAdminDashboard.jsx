import React, { useEffect, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LayoutDashboard, 
  Building2, 
  Wallet, 
  Activity, 
  TrendingUp, 
  ShieldCheck, 
  Plus,
  Globe,
  Bell,
  Search,
  MoreVertical,
  AlertCircle,
  Clock,
  Shield,
  Settings,
  Users,
  MessageSquare,
  FileText,
  CreditCard,
  CheckCircle2,
  X,
  ShieldAlert,
  HardDrive,
  Database
} from 'lucide-react';
import { 
  LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, 
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from 'recharts';
import { buildUrl, handleApiError } from '../services/api';
import { Button } from '../components/ui/Button';

// --- Sub-components for different views ---

const PlatformOverview = ({ stats, loading }) => {
  const revenueData = [
    { name: 'Mon', revenue: 12000 },
    { name: 'Tue', revenue: 19000 },
    { name: 'Wed', revenue: 15000 },
    { name: 'Thu', revenue: 22000 },
    { name: 'Fri', revenue: 30000 },
    { name: 'Sat', revenue: 28000 },
    { name: 'Sun', revenue: 35000 },
  ];

  const growthData = [
    { name: 'Jan', schools: 40 },
    { name: 'Feb', schools: 65 },
    { name: 'Mar', schools: 55 },
    { name: 'Apr', schools: 90 },
    { name: 'May', schools: 120 },
    { name: 'Jun', schools: 110 },
  ];

  const userData = [
    { name: 'Students', value: 35000, color: '#6366F1' },
    { name: 'Teachers', value: 5000, color: '#A855F7' },
    { name: 'Admins', value: 1200, color: '#EC4899' },
    { name: 'Parents', value: 15000, color: '#22C55E' },
  ];

  const kpis = [
    { label: 'Total Schools', value: '1,245', change: '+12%', icon: Building2, color: 'indigo' },
    { label: 'Total Users', value: '45,230', change: '+8%', icon: Users, color: 'purple' },
    { label: 'Active Subs', value: '1,102', change: '+5%', icon: CreditCard, color: 'blue' },
    { label: 'Revenue', value: '₵120k', change: '+18%', icon: Wallet, color: 'emerald', chart: true },
    { label: 'System Health', value: '99.9%', change: 'Uptime', icon: Activity, color: 'cyan' },
    { label: 'Pending Issues', value: '8', change: 'Critical', icon: ShieldAlert, color: 'rose' },
  ];

  return (
    <div className="space-y-8 pb-12">
      {/* KPI Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
        {kpis.map((kpi, i) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="p-6 rounded-[24px] bg-white border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all group"
          >
            <div className="flex justify-between items-start mb-4">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center bg-slate-50 text-indigo-500 group-hover:scale-110 transition-transform`}>
                <kpi.icon size={20} />
              </div>
              <span className={`text-[10px] font-black uppercase tracking-widest ${kpi.change.startsWith('+') ? 'text-emerald-500' : 'text-slate-400'}`}>
                {kpi.change}
              </span>
            </div>
            <div className="text-2xl font-black text-slate-800 tracking-tighter mb-1">{kpi.value}</div>
            <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">{kpi.label}</div>
            
            {kpi.chart && (
               <div className="h-10 mt-4 opacity-30">
                  <ResponsiveContainer width="100%" height="100%">
                     <LineChart data={revenueData.slice(-4)}>
                        <Line type="monotone" dataKey="revenue" stroke="#10B981" strokeWidth={3} dot={false} />
                     </LineChart>
                  </ResponsiveContainer>
               </div>
            )}
          </motion.div>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        <div className="xl:col-span-2 space-y-8">
           {/* Revenue Chart */}
           <div className="p-8 rounded-[40px] bg-white border border-slate-100 shadow-sm">
              <div className="flex justify-between items-center mb-8">
                 <div>
                    <h3 className="text-lg font-black text-slate-800 tracking-tight">Revenue Over Time</h3>
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Monthly Yield Analytics</p>
                 </div>
                 <div className="flex gap-2">
                    {['Daily', 'Weekly', 'Monthly'].map(t => (
                       <button key={t} className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${t === 'Monthly' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200' : 'bg-slate-50 text-slate-400 hover:bg-slate-100'}`}>
                          {t}
                       </button>
                    ))}
                 </div>
              </div>
              <div className="h-[350px]">
                 <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={revenueData}>
                       <defs>
                          <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                             <stop offset="5%" stopColor="#6366F1" stopOpacity={0.1}/>
                             <stop offset="95%" stopColor="#6366F1" stopOpacity={0}/>
                          </linearGradient>
                       </defs>
                       <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                       <XAxis 
                          dataKey="name" 
                          axisLine={false} 
                          tickLine={false} 
                          tick={{ fontSize: 10, fontWeight: 700, fill: '#94A3B8' }} 
                          dy={10}
                       />
                       <YAxis 
                          axisLine={false} 
                          tickLine={false} 
                          tick={{ fontSize: 10, fontWeight: 700, fill: '#94A3B8' }} 
                       />
                       <Tooltip 
                          contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', padding: '12px' }}
                          labelStyle={{ fontWeight: 800, color: '#1E293B', marginBottom: '4px' }}
                       />
                       <Area type="monotone" dataKey="revenue" stroke="#6366F1" strokeWidth={4} fillOpacity={1} fill="url(#colorRev)" />
                    </AreaChart>
                 </ResponsiveContainer>
              </div>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* School Growth */}
              <div className="p-8 rounded-[40px] bg-white border border-slate-100 shadow-sm">
                 <h3 className="text-sm font-black text-slate-800 tracking-tight mb-1">School Growth</h3>
                 <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-6">Onboarding Velocity</p>
                 <div className="h-[250px]">
                    <ResponsiveContainer width="100%" height="100%">
                       <BarChart data={growthData}>
                          <Bar dataKey="schools" fill="#A855F7" radius={[6, 6, 0, 0]} />
                          <XAxis dataKey="name" hide />
                          <Tooltip cursor={{ fill: 'transparent' }} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                       </BarChart>
                    </ResponsiveContainer>
                 </div>
              </div>

              {/* User Distribution */}
              <div className="p-8 rounded-[40px] bg-white border border-slate-100 shadow-sm">
                 <h3 className="text-sm font-black text-slate-800 tracking-tight mb-1">User Distribution</h3>
                 <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-6">Platform Demographics</p>
                 <div className="h-[250px] flex items-center">
                    <ResponsiveContainer width="100%" height="100%">
                       <PieChart>
                          <Pie
                             data={userData}
                             cx="50%"
                             cy="50%"
                             innerRadius={60}
                             outerRadius={80}
                             paddingAngle={5}
                             dataKey="value"
                          >
                             {userData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                             ))}
                          </Pie>
                          <Tooltip />
                       </PieChart>
                    </ResponsiveContainer>
                 </div>
              </div>
           </div>
        </div>

        {/* Activity Feed (Right Side) */}
        <div className="space-y-8">
           <div className="p-8 rounded-[40px] bg-[#1E1B4B] text-white shadow-xl shadow-indigo-100 relative overflow-hidden">
              <div className="relative z-10">
                 <h3 className="text-lg font-black tracking-tight mb-1">Live Activity</h3>
                 <p className="text-[10px] font-black uppercase tracking-widest opacity-40 mb-8">System Pulse</p>
                 
                 <div className="space-y-6">
                    {[
                       { event: 'School "Accra Academy" onboarded', time: '2m ago', icon: Building2, color: 'emerald' },
                       { event: 'Payment received: GHS 4,500', time: '15m ago', icon: Wallet, color: 'indigo' },
                       { event: 'User login failed: admin@demo', time: '1h ago', icon: ShieldAlert, color: 'rose' },
                       { event: 'Backup completed successfully', time: '3h ago', icon: HardDrive, color: 'blue' },
                       { event: 'New support ticket #4521', time: '5h ago', icon: MessageSquare, color: 'amber' },
                    ].map((act, i) => (
                       <div key={i} className="flex gap-4 group cursor-pointer">
                          <div className={`w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-indigo-400 group-hover:scale-110 transition-transform flex-shrink-0`}>
                             <act.icon size={16} />
                          </div>
                          <div className="flex-1 min-w-0">
                             <div className="text-[11px] font-bold leading-tight mb-1">{act.event}</div>
                             <div className="text-[9px] font-black uppercase tracking-widest opacity-30">{act.time}</div>
                          </div>
                       </div>
                    ))}
                 </div>

                 <Button className="w-full mt-8 bg-white/10 hover:bg-white/20 border-white/10 text-white text-[10px] font-black uppercase tracking-widest py-4 rounded-2xl transition-all">
                    View Full Audit Log
                 </Button>
              </div>
           </div>

           {/* Alerts Panel */}
           <div className="p-8 rounded-[40px] bg-rose-50 border border-rose-100 shadow-sm">
              <h3 className="text-sm font-black text-rose-800 tracking-tight mb-1">Platform Alerts</h3>
              <p className="text-[10px] font-black uppercase tracking-widest text-rose-400 mb-6">Action Required</p>
              
              <div className="space-y-3">
                 <div className="p-4 rounded-2xl bg-white border border-rose-100 flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                    <span className="text-[11px] font-bold text-slate-700">3 Subscriptions expiring soon</span>
                 </div>
                 <div className="p-4 rounded-2xl bg-white border border-rose-100 flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                    <span className="text-[11px] font-bold text-slate-700">Failed auto-payout for Accra Node</span>
                 </div>
              </div>
           </div>
        </div>
      </div>

      {/* Tables Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
         {/* Recent Schools */}
         <div className="p-8 rounded-[40px] bg-white border border-slate-100 shadow-sm">
            <div className="flex justify-between items-center mb-6">
               <div>
                  <h3 className="text-sm font-black text-slate-800 tracking-tight mb-1">Recent Schools</h3>
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Newly Onboarded Institutions</p>
               </div>
               <button className="text-[10px] font-black uppercase tracking-widest text-indigo-600 hover:underline">View All</button>
            </div>
            <div className="overflow-x-auto">
               <table className="w-full text-left">
                  <thead>
                     <tr className="border-b border-slate-50">
                        {['School Name', 'Plan', 'Status', 'Users'].map(h => (
                           <th key={h} className="pb-4 text-[9px] font-black uppercase tracking-widest text-slate-400">{h}</th>
                        ))}
                     </tr>
                  </thead>
                  <tbody>
                     {[
                        { name: 'Accra Academy', plan: 'Premium', status: 'Active', users: '2,450' },
                        { name: 'Wesley Girls', plan: 'Enterprise', status: 'Active', users: '1,890' },
                        { name: 'Prempeh College', plan: 'Basic', status: 'Suspended', users: '3,100' },
                     ].map((s, i) => (
                        <tr key={i} className="group hover:bg-slate-50 transition-colors">
                           <td className="py-4 text-xs font-bold text-slate-700">{s.name}</td>
                           <td className="py-4 text-xs font-bold text-slate-500">{s.plan}</td>
                           <td className="py-4">
                              <span className={`px-2 py-1 rounded-full text-[8px] font-black uppercase tracking-widest ${s.status === 'Active' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                                 {s.status}
                              </span>
                           </td>
                           <td className="py-4 text-xs font-bold text-slate-500">{s.users}</td>
                        </tr>
                     ))}
                  </tbody>
               </table>
            </div>
         </div>

         {/* Recent Users */}
         <div className="p-8 rounded-[40px] bg-white border border-slate-100 shadow-sm">
            <div className="flex justify-between items-center mb-6">
               <div>
                  <h3 className="text-sm font-black text-slate-800 tracking-tight mb-1">Recent Users</h3>
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Latest Platform Logins</p>
               </div>
               <button className="text-[10px] font-black uppercase tracking-widest text-indigo-600 hover:underline">View All</button>
            </div>
            <div className="overflow-x-auto">
               <table className="w-full text-left">
                  <thead>
                     <tr className="border-b border-slate-50">
                        {['Name', 'Role', 'School', 'Last Login'].map(h => (
                           <th key={h} className="pb-4 text-[9px] font-black uppercase tracking-widest text-slate-400">{h}</th>
                        ))}
                     </tr>
                  </thead>
                  <tbody>
                     {[
                        { name: 'David Appiah', role: 'Admin', school: 'Accra Academy', login: '2m ago' },
                        { name: 'Sarah Mensah', role: 'Teacher', school: 'Wesley Girls', login: '15m ago' },
                        { name: 'Kofi Adu', role: 'Student', school: 'Prempeh College', login: '1h ago' },
                     ].map((u, i) => (
                        <tr key={i} className="group hover:bg-slate-50 transition-colors">
                           <td className="py-4 text-xs font-bold text-slate-700">{u.name}</td>
                           <td className="py-4 text-xs font-bold text-slate-500">{u.role}</td>
                           <td className="py-4 text-xs font-bold text-slate-500">{u.school}</td>
                           <td className="py-4 text-xs font-bold text-slate-400">{u.login}</td>
                        </tr>
                     ))}
                  </tbody>
               </table>
            </div>
         </div>
      </div>
      
      {/* Quick Action FAB */}
      <motion.button 
         whileHover={{ scale: 1.1 }}
         whileTap={{ scale: 0.9 }}
         className="fixed bottom-10 right-10 w-16 h-16 rounded-full bg-gradient-to-tr from-indigo-600 to-purple-600 text-white shadow-2xl flex items-center justify-center z-50 group"
      >
         <Plus size={32} className="group-hover:rotate-90 transition-transform duration-500" />
      </motion.button>
    </div>
  );
};

const InstitutionManagement = ({ schools = [] }) => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
         <div>
            <h2 style={{ fontFamily: "'Playfair Display', serif", color: "var(--text-primary)", fontSize: "1.5rem", fontWeight: 800 }}>Institutional Nodes</h2>
            <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", fontWeight: 600 }}>Managing all active tenants on the platform</p>
         </div>
         <Button className="bg-plum text-milk rounded-2xl px-6 py-3 font-black text-xs uppercase tracking-widest shadow-lg shadow-plum/20">
            <Plus size={16} className="mr-2" /> Onboard School
         </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
         {schools.map((school) => (
            <motion.div 
               key={school.id}
               whileHover={{ y: -5 }}
               className="border rounded-[40px] p-8 relative overflow-hidden group transition-all hover:shadow-2xl"
               style={{ background: "var(--card-bg)", borderColor: "var(--border)" }}
            >
               <div className="absolute top-0 right-0 w-24 h-24 bg-black/[0.02] rounded-bl-[60px] -mr-6 -mt-6 group-hover:scale-110 transition-transform duration-500" />
               <div className="flex justify-between items-start mb-6 relative z-10">
                  <div className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${school.status === 'active' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                     {school.status}
                  </div>
                  <button className="text-slate-300 hover:text-plum transition-colors"><MoreVertical size={18} /></button>
               </div>
               
               <h3 style={{ fontFamily: "'Playfair Display', serif", color: "var(--text-primary)", fontSize: "1.25rem", fontWeight: 800, marginBottom: "0.2rem" }}>{school.schoolName}</h3>
               <p style={{ color: "var(--text-muted)", fontSize: "0.75rem", fontWeight: 700, marginBottom: "1.5rem" }}>{school.subdomain}.schoolos.me</p>

               <div className="flex items-center gap-6 mb-8 p-4 rounded-2xl bg-black/[0.02]">
                  <div className="text-center">
                     <div className="text-xs font-black" style={{ color: "var(--text-primary)" }}>{school.plan}</div>
                     <div className="text-[9px] font-black uppercase tracking-widest" style={{ color: "var(--text-muted)" }}>Plan</div>
                  </div>
                  <div className="text-center border-l px-6" style={{ borderColor: "var(--border)" }}>
                     <div className="text-xs font-black" style={{ color: "var(--text-primary)" }}>{school.maxStudents || 500}</div>
                     <div className="text-[9px] font-black uppercase tracking-widest" style={{ color: "var(--text-muted)" }}>Quota</div>
                  </div>
               </div>

               <div className="flex gap-2">
                  <Button variant="secondary" className="flex-1 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest border-2" style={{ borderColor: "var(--border)", color: "var(--text-primary)" }}>Dashboard</Button>
                  <Button className="flex-1 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest bg-plum text-milk shadow-md">Settings</Button>
               </div>
            </motion.div>
         ))}
      </div>
    </div>
  );
};

const SubscriptionManagement = ({ stats }) => {
  const plans = [
    { name: 'Basic', price: '₵499/mo', schools: 45, features: ['Core Admin', '500 Students', 'Email Support'] },
    { name: 'Premium', price: '₵999/mo', schools: 62, features: ['Advanced Analytics', 'Unlimited Students', 'WhatsApp Bot', 'Priority Support'] },
    { name: 'Enterprise', price: 'Custom', schools: 17, features: ['White Label', 'SLA Guarantee', 'Dedicated Manager', 'API Access'] },
  ];

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
         <div>
            <h2 style={{ fontFamily: "'Playfair Display', serif", color: "var(--text-primary)", fontSize: "1.5rem", fontWeight: 800 }}>Subscription Matrix</h2>
            <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", fontWeight: 600 }}>Yield management and tier-based feature access</p>
         </div>
         <Button className="bg-plum text-milk rounded-2xl px-6 py-3 font-black text-xs uppercase tracking-widest shadow-lg shadow-plum/20">
            <Plus size={16} className="mr-2" /> Create Plan
         </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
         {plans.map((plan, i) => (
            <div 
               key={i} 
               className="border rounded-[40px] p-10 relative overflow-hidden group shadow-sm hover:shadow-2xl transition-all duration-500"
               style={{ background: "var(--card-bg)", borderColor: "var(--border)" }}
            >
               <div className="flex justify-between items-start mb-10">
                  <div>
                     <h3 className="text-sm font-black uppercase tracking-[0.2em] mb-1" style={{ color: "var(--text-muted)" }}>{plan.name}</h3>
                     <div className="text-3xl font-black tracking-tighter" style={{ color: "var(--text-primary)" }}>{plan.price}</div>
                  </div>
                  <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-black/5" style={{ color: "var(--text-primary)" }}>
                     <CreditCard size={24} />
                  </div>
               </div>

               <div className="space-y-4 mb-10">
                  {plan.features.map((f, j) => (
                     <div key={j} className="flex items-center gap-3">
                        <CheckCircle2 size={16} className="text-emerald-500" />
                        <span style={{ color: "var(--text-secondary)", fontSize: "0.85rem", fontWeight: 600 }}>{f}</span>
                     </div>
                  ))}
               </div>

               <div className="pt-8 border-t" style={{ borderColor: "var(--border)" }}>
                  <div className="flex justify-between items-center">
                     <span style={{ color: "var(--text-muted)", fontSize: "0.75rem", fontWeight: 800, textTransform: "uppercase" }}>Active Schools</span>
                     <span className="text-lg font-black" style={{ color: "var(--text-primary)" }}>{plan.schools}</span>
                  </div>
               </div>
            </div>
         ))}
      </div>
    </div>
  );
};

const UserManagement = () => {
   return (
      <div className="space-y-6">
         <div className="flex justify-between items-center">
            <div>
               <h2 style={{ fontFamily: "'Playfair Display', serif", color: "var(--text-primary)", fontSize: "1.5rem", fontWeight: 800 }}>Global User Access</h2>
               <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", fontWeight: 600 }}>Cross-tenant identity and permission management</p>
            </div>
            <div className="flex gap-2">
               <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 opacity-30" size={16} />
                  <input placeholder="Search users/roles..." className="pl-11 pr-6 py-3 rounded-2xl border-2 outline-none w-64 text-sm font-bold" style={{ background: "var(--card-bg)", borderColor: "var(--border)", color: "var(--text-primary)" }} />
               </div>
            </div>
         </div>

         <div className="border rounded-[40px] overflow-hidden shadow-sm" style={{ background: "var(--card-bg)", borderColor: "var(--border)" }}>
            <table className="w-full text-left border-collapse">
               <thead>
                  <tr className="border-b" style={{ borderColor: "var(--border)" }}>
                     {['User', 'System Role', 'School', 'Status', 'Last Active', ''].map(h => (
                        <th key={h} className="p-6 text-[10px] font-black uppercase tracking-widest" style={{ color: "var(--text-muted)" }}>{h}</th>
                     ))}
                  </tr>
               </thead>
               <tbody>
                  {[
                     { name: 'David Appiah', email: 'david@ghanaedu.com', role: 'School Admin', school: 'Accra Academy', status: 'Active', active: '2 mins ago' },
                     { name: 'Sarah Mensah', email: 'sarah.m@wesley.edu', role: 'Teacher', school: 'Wesley Girls', status: 'Active', active: '1 hr ago' },
                     { name: 'Kofi Adu', email: 'kofi@prempeh.gh', role: 'Accountant', school: 'Prempeh College', status: 'Suspended', active: '3 days ago' },
                  ].map((u, i) => (
                     <tr key={i} className="border-b last:border-0 hover:bg-black/[0.01] transition-colors" style={{ borderColor: "var(--border)" }}>
                        <td className="p-6">
                           <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-plum text-milk flex items-center justify-center font-black text-xs">{u.name[0]}</div>
                              <div>
                                 <div className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>{u.name}</div>
                                 <div className="text-[10px] font-bold opacity-50" style={{ color: "var(--text-primary)" }}>{u.email}</div>
                              </div>
                           </div>
                        </td>
                        <td className="p-6"><span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-black/5" style={{ color: "var(--text-primary)" }}>{u.role}</span></td>
                        <td className="p-6 text-sm font-bold" style={{ color: "var(--text-secondary)" }}>{u.school}</td>
                        <td className="p-6"><div className={`w-2 h-2 rounded-full ${u.status === 'Active' ? 'bg-emerald-500' : 'bg-rose-500'}`} /></td>
                        <td className="p-6 text-xs font-bold" style={{ color: "var(--text-muted)" }}>{u.active}</td>
                        <td className="p-6"><button className="text-slate-300 hover:text-plum transition-colors"><MoreVertical size={18} /></button></td>
                     </tr>
                  ))}
               </tbody>
            </table>
         </div>
      </div>
   );
};

const SystemConfig = () => {
   return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
         <div className="border rounded-[48px] p-10 space-y-8 shadow-sm" style={{ background: "var(--card-bg)", borderColor: "var(--border)" }}>
            <div>
               <h3 style={{ fontFamily: "'Playfair Display', serif", color: "var(--text-primary)", fontSize: "1.4rem", fontWeight: 800 }}>Platform Branding</h3>
               <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", fontWeight: 600 }}>Customize the global look and feel</p>
            </div>
            
            <div className="space-y-6">
               <div className="grid grid-cols-2 gap-6">
                  <div>
                     <label className="text-[10px] font-black uppercase tracking-widest mb-2 block" style={{ color: "var(--text-muted)" }}>Primary Brand Color</label>
                     <div className="flex items-center gap-3 p-4 rounded-2xl border-2" style={{ borderColor: "var(--border)" }}>
                        <div className="w-8 h-8 rounded-lg bg-plum" />
                        <span className="text-sm font-bold">#381932</span>
                     </div>
                  </div>
                  <div>
                     <label className="text-[10px] font-black uppercase tracking-widest mb-2 block" style={{ color: "var(--text-muted)" }}>Accent Color</label>
                     <div className="flex items-center gap-3 p-4 rounded-2xl border-2" style={{ borderColor: "var(--border)" }}>
                        <div className="w-8 h-8 rounded-lg bg-emerald-500" />
                        <span className="text-sm font-bold">#10B981</span>
                     </div>
                  </div>
               </div>
               <div>
                  <label className="text-[10px] font-black uppercase tracking-widest mb-2 block" style={{ color: "var(--text-muted)" }}>Platform Logo</label>
                  <div className="border-2 border-dashed rounded-[32px] p-10 flex flex-col items-center gap-4 text-center group cursor-pointer hover:border-plum/20 transition-colors" style={{ borderColor: "var(--border)" }}>
                     <div className="w-12 h-12 rounded-2xl bg-black/5 flex items-center justify-center text-slate-400 group-hover:scale-110 transition-transform">
                        <Plus size={24} />
                     </div>
                     <p className="text-sm font-bold" style={{ color: "var(--text-muted)" }}>Upload high-res PNG or SVG<br /><span className="opacity-40 text-xs font-black uppercase tracking-widest">Recommended: 512x512px</span></p>
                  </div>
               </div>
               <Button className="w-full bg-plum text-milk rounded-2xl h-14 font-black uppercase tracking-widest text-xs shadow-xl shadow-plum/10 active:scale-95 transition-transform">Apply Changes</Button>
            </div>
         </div>

         <div className="space-y-8">
            <div className="border rounded-[48px] p-10 space-y-6 shadow-sm" style={{ background: "var(--card-bg)", borderColor: "var(--border)" }}>
               <h3 style={{ fontFamily: "'Playfair Display', serif", color: "var(--text-primary)", fontSize: "1.4rem", fontWeight: 800 }}>Maintenance Mode</h3>
               <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", fontWeight: 600 }}>Toggle system-wide access for maintenance windows</p>
               <div className="flex items-center justify-between p-6 rounded-[32px] bg-rose-50 border border-rose-100">
                  <div className="flex items-center gap-4 text-rose-600">
                     <AlertCircle size={24} />
                     <span className="text-sm font-black uppercase tracking-widest">Offline Mode</span>
                  </div>
                  <div className="w-14 h-8 bg-slate-200 rounded-full p-1 relative cursor-pointer">
                     <div className="w-6 h-6 bg-white rounded-full shadow-sm" />
                  </div>
               </div>
            </div>

            <div className="border rounded-[48px] p-10 space-y-6 shadow-sm" style={{ background: "var(--card-bg)", borderColor: "var(--border)" }}>
               <h3 style={{ fontFamily: "'Playfair Display', serif", color: "var(--text-primary)", fontSize: "1.4rem", fontWeight: 800 }}>Backup Frequency</h3>
               <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", fontWeight: 600 }}>Configure automated cloud snapshot intervals</p>
               <div className="flex gap-2">
                  {['6h', '12h', '24h', 'Weekly'].map(t => (
                     <button key={t} className={`flex-1 py-4 rounded-2xl text-xs font-black transition-all ${t === '24h' ? 'bg-plum text-milk shadow-lg' : 'bg-black/5 hover:bg-black/10'}`}>
                        {t}
                     </button>
                  ))}
               </div>
            </div>
         </div>
      </div>
   );
};

const GlobalCommunication = () => {
   return (
      <div className="space-y-8">
         <div className="flex justify-between items-center">
            <div>
               <h2 style={{ fontFamily: "'Playfair Display', serif", color: "var(--text-primary)", fontSize: "1.5rem", fontWeight: 800 }}>Broadcast Terminal</h2>
               <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", fontWeight: 600 }}>Global announcements and targeted messaging across nodes</p>
            </div>
            <Button className="bg-plum text-milk rounded-2xl px-6 py-3 font-black text-xs uppercase tracking-widest shadow-lg shadow-plum/20">
               <Plus size={16} className="mr-2" /> New Broadcast
            </Button>
         </div>

         <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 border rounded-[48px] p-10 space-y-8 shadow-sm" style={{ background: "var(--card-bg)", borderColor: "var(--border)" }}>
               <div className="space-y-6">
                  <div>
                     <label className="text-[10px] font-black uppercase tracking-widest mb-3 block" style={{ color: "var(--text-muted)" }}>Target Audience</label>
                     <div className="flex gap-2">
                        {['All Schools', 'Premium Only', 'Specific Nodes'].map(t => (
                           <button key={t} className={`px-5 py-3 rounded-2xl text-xs font-black transition-all ${t === 'All Schools' ? 'bg-plum text-milk shadow-md' : 'bg-black/5 hover:bg-black/10'}`}>
                              {t}
                           </button>
                        ))}
                     </div>
                  </div>
                  <div>
                     <label className="text-[10px] font-black uppercase tracking-widest mb-3 block" style={{ color: "var(--text-muted)" }}>Broadcast Channels</label>
                     <div className="grid grid-cols-3 gap-4">
                        {[
                           { name: 'Dashboard Pop-up', icon: LayoutDashboard },
                           { name: 'Email Pulse', icon: Globe },
                           { name: 'WhatsApp Push', icon: MessageSquare },
                        ].map((c, i) => (
                           <div key={i} className="p-5 border-2 rounded-3xl flex flex-col items-center gap-3 cursor-pointer hover:border-plum/20 transition-all group" style={{ borderColor: "var(--border)" }}>
                              <c.icon size={20} className="text-slate-300 group-hover:text-plum transition-colors" />
                              <span className="text-[10px] font-black uppercase tracking-widest text-center">{c.name}</span>
                           </div>
                        ))}
                     </div>
                  </div>
                  <div>
                     <label className="text-[10px] font-black uppercase tracking-widest mb-3 block" style={{ color: "var(--text-muted)" }}>Message Content</label>
                     <textarea 
                        className="w-full p-6 rounded-3xl border-2 outline-none h-48 text-sm font-bold resize-none" 
                        placeholder="Type your global announcement here..."
                        style={{ background: "var(--bg-secondary)", borderColor: "var(--border)", color: "var(--text-primary)" }}
                     />
                  </div>
                  <Button className="w-full bg-plum text-milk rounded-2xl h-14 font-black uppercase tracking-widest text-xs shadow-xl shadow-plum/20">Execute Broadcast</Button>
               </div>
            </div>

            <div className="border rounded-[48px] p-10 space-y-6 shadow-sm" style={{ background: "var(--card-bg)", borderColor: "var(--border)" }}>
               <h3 style={{ fontFamily: "'Playfair Display', serif", color: "var(--text-primary)", fontSize: "1.4rem", fontWeight: 800 }}>Broadcast History</h3>
               <div className="space-y-4">
                  {[
                     { title: 'System Upgrade v2.4', date: 'Yesterday', reach: '100%' },
                     { title: 'New Billing Cycle', date: '3 days ago', reach: '98%' },
                     { title: 'Maintenance Notice', date: 'Last week', reach: '100%' },
                  ].map((h, i) => (
                     <div key={i} className="p-5 rounded-3xl bg-black/[0.02] border" style={{ borderColor: "var(--border)" }}>
                        <div className="text-sm font-bold mb-1" style={{ color: "var(--text-primary)" }}>{h.title}</div>
                        <div className="flex justify-between items-center">
                           <span className="text-[10px] font-black uppercase tracking-widest opacity-40">{h.date}</span>
                           <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">{h.reach} Reach</span>
                        </div>
                     </div>
                  ))}
               </div>
            </div>
         </div>
      </div>
   );
};

const SecurityHub = () => {
   return (
      <div className="space-y-8">
         <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
               <div className="border rounded-[48px] p-10 space-y-8 shadow-sm" style={{ background: "var(--card-bg)", borderColor: "var(--border)" }}>
                  <div className="flex justify-between items-center">
                     <div>
                        <h2 style={{ fontFamily: "'Playfair Display', serif", color: "var(--text-primary)", fontSize: "1.5rem", fontWeight: 800 }}>Threat Intelligence</h2>
                        <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", fontWeight: 600 }}>Real-time security monitoring and anomaly detection</p>
                     </div>
                     <div className="px-4 py-2 bg-emerald-50 text-emerald-600 rounded-full text-[10px] font-black uppercase tracking-widest border border-emerald-100 flex items-center gap-2">
                        <Shield size={14} /> System Secure
                     </div>
                  </div>

                  <div className="space-y-4">
                     {[
                        { event: 'Suspicious Login Attempt', node: 'Accra Node', severity: 'Medium', time: '12 mins ago' },
                        { event: 'API Rate Limit Exceeded', node: 'Kumasi Node', severity: 'Low', time: '1 hr ago' },
                        { event: 'Database Snapshot Verified', node: 'Global', severity: 'Info', time: '3 hrs ago' },
                        { event: 'New SSL Certificate Issued', node: 'Subdomain Node', severity: 'Info', time: '5 hrs ago' },
                     ].map((s, i) => (
                        <div key={i} className="p-6 rounded-3xl bg-black/[0.02] border flex items-center justify-between group hover:border-plum/20 transition-all cursor-default" style={{ borderColor: "var(--border)" }}>
                           <div className="flex items-center gap-5">
                              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${s.severity === 'Medium' ? 'text-amber-500 bg-amber-50' : s.severity === 'Low' ? 'text-blue-500 bg-blue-50' : 'text-emerald-500 bg-emerald-50'}`}>
                                 <AlertCircle size={18} />
                              </div>
                              <div>
                                 <div className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>{s.event}</div>
                                 <div className="text-[10px] font-black uppercase tracking-widest opacity-40">{s.node}</div>
                              </div>
                           </div>
                           <div className="text-right">
                              <div className="text-xs font-black mb-1" style={{ color: "var(--text-primary)" }}>{s.time}</div>
                              <div className="text-[10px] font-black uppercase tracking-widest opacity-30">{s.severity}</div>
                           </div>
                        </div>
                     ))}
                  </div>
               </div>
            </div>

            <div className="space-y-8">
               <div className="border rounded-[48px] p-10 space-y-6 shadow-sm" style={{ background: "var(--card-bg)", borderColor: "var(--border)" }}>
                  <h3 style={{ fontFamily: "'Playfair Display', serif", color: "var(--text-primary)", fontSize: "1.4rem", fontWeight: 800 }}>Access Policies</h3>
                  <div className="space-y-6">
                     {[
                        { title: 'Multi-Factor Auth', desc: 'Mandatory for all Admins', active: true },
                        { title: 'IP Restriction', desc: 'Whitelist specific ranges', active: false },
                        { title: 'Session Timeout', desc: 'Auto-logout after 4 hours', active: true },
                     ].map((p, i) => (
                        <div key={i} className="flex items-center justify-between">
                           <div>
                              <div className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>{p.title}</div>
                              <div className="text-[10px] font-bold opacity-40">{p.desc}</div>
                           </div>
                           <div className={`w-12 h-6 rounded-full p-1 relative cursor-pointer transition-colors ${p.active ? 'bg-emerald-500' : 'bg-slate-200'}`}>
                              <div className={`w-4 h-4 bg-white rounded-full shadow-sm transition-transform ${p.active ? 'translate-x-6' : 'translate-x-0'}`} />
                           </div>
                        </div>
                     ))}
                  </div>
               </div>

               <div className="bg-rose-500 rounded-[48px] p-10 text-milk relative overflow-hidden group shadow-2xl">
                  <ShieldCheck className="absolute -right-10 -bottom-10 w-48 h-48 text-white/5 group-hover:scale-125 transition-transform duration-700" />
                  <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: "1.4rem", fontWeight: 800 }} className="italic mb-2">Emergency Protocols</h3>
                  <p style={{ color: "rgba(255,255,255,0.6)", fontSize: "0.85rem", fontWeight: 600, marginBottom: "2rem" }}>Lockdown platform or restrict data access globally.</p>
                  <Button className="w-full h-14 rounded-2xl bg-milk text-rose-600 font-black text-xs uppercase tracking-widest shadow-xl shadow-black/20 active:scale-95 transition-transform">
                     Platform Lockdown
                  </Button>
               </div>
            </div>
         </div>
      </div>
   );
};

const SuperAdminDashboard = ({ activeModule = 'dashboard' }) => {
  const [stats, setStats] = useState(null);
  const [schools, setSchools] = useState([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState({ type: '', message: '' });

  const loadDashboardData = async () => {
    try {
      const response = await fetch(buildUrl('/api/superadmin/dashboard'), { credentials: 'include' });
      if (!response.ok) throw new Error(await handleApiError(response));
      const result = await response.json();
      setStats(result.data?.stats || result.stats || null);
    } catch(e) {
      console.error(e);
    }
  };

  const loadSchools = async () => {
    try {
      const response = await fetch(buildUrl('/api/superadmin/schools'), { credentials: 'include' });
      if (!response.ok) throw new Error(await handleApiError(response));
      const result = await response.json();
      setSchools(result.data?.schools || []);
    } catch(e) {
      console.error(e);
    }
  };

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await Promise.all([loadDashboardData(), loadSchools()]);
      setLoading(false);
    };
    init();
  }, []);

  const renderContent = () => {
    switch(activeModule) {
      case 'superadmin-dashboard': return <PlatformOverview stats={stats} loading={loading} />;
      case 'schools': return <InstitutionManagement schools={schools} />;
      case 'subscriptions': 
      case 'billing': return <SubscriptionManagement stats={stats} />;
      case 'global-users': return <UserManagement />;
      case 'system-config': return <SystemConfig />;
      case 'audit-logs': return <div className="p-20 text-center"><FileText size={48} className="mx-auto mb-4 opacity-10" /><h3 className="text-xl font-bold opacity-30">Audit Stream Processing...</h3></div>;
      case 'support': return <div className="p-20 text-center"><MessageSquare size={48} className="mx-auto mb-4 opacity-10" /><h3 className="text-xl font-bold opacity-30">Support Tickets Loading...</h3></div>;
      case 'communication': return <GlobalCommunication />;
      case 'security': return <SecurityHub />;
      default: return <PlatformOverview stats={stats} loading={loading} />;
    }
  };

  const viewInfo = useMemo(() => {
     const map = {
        'superadmin-dashboard': { title: 'Platform Node', subtitle: 'Real-time Infrastructure Monitoring', icon: LayoutDashboard },
        'schools': { title: 'Institutional Matrix', subtitle: 'Tenant Management Control', icon: Building2 },
        'subscriptions': { title: 'Yield Center', subtitle: 'Revenue & Subscription Control', icon: Wallet },
        'billing': { title: 'Yield Center', subtitle: 'Revenue & Subscription Control', icon: Wallet },
        'global-users': { title: 'Identity Hub', subtitle: 'Global User Access Control', icon: Users },
        'system-config': { title: 'Platform Engine', subtitle: 'Global Configuration & Branding', icon: Settings },
        'audit-logs': { title: 'Audit Stream', subtitle: 'System-wide Activity Intelligence', icon: FileText },
        'support': { title: 'Support Terminal', subtitle: 'Global Ticketing & Help Desk', icon: MessageSquare },
        'communication': { title: 'Broadcast Hub', subtitle: 'Global Messaging & Announcements', icon: MessageSquare },
        'security': { title: 'Security Citadel', subtitle: 'Access Control & Threat Intelligence', icon: Shield },
     };
     return map[activeModule] || map['superadmin-dashboard'];
  }, [activeModule]);

  return (
    <div className="p-6 sm:p-8 flex flex-col gap-8 min-h-screen">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-center justify-between gap-4"
      >
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center text-accent-primary" style={{ background: "var(--bg-secondary)" }}>
              <viewInfo.icon size={24} />
            </div>
            <h1 style={{ fontFamily: "'Playfair Display', serif", color: "var(--text-primary)", fontSize: "1.8rem", fontWeight: 800 }}>
               {viewInfo.title}
            </h1>
          </div>
          <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", fontWeight: 600 }}>
             Super Admin • {viewInfo.subtitle}
          </p>
        </div>
        <div className="flex gap-3">
           <Button variant="secondary" className="px-6 rounded-2xl border-2" style={{ borderColor: "var(--border)", color: "var(--text-primary)" }}>
              <Bell size={18} className="mr-2" /> Global Alerts
           </Button>
           <Button className="px-6 rounded-2xl bg-plum text-milk shadow-xl shadow-plum/20">
              <Plus size={18} className="mr-2" /> Global Action
           </Button>
        </div>
      </motion.div>

      {/* Main View Area */}
      <AnimatePresence mode="wait">
         <motion.div
            key={activeModule}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
         >
            {renderContent()}
         </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default SuperAdminDashboard;
