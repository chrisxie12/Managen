import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Settings2, 
  User, 
  Building2, 
  ShieldCheck, 
  Bell, 
  Database, 
  Globe, 
  CreditCard, 
  Plus,
  ChevronRight,
  Mail,
  Phone,
  Camera,
  CheckCircle2,
  Lock,
  Zap,
  Smartphone,
  TrendingUp
} from 'lucide-react';
import Sidebar from '../components/layout/Sidebar';
import DashboardNavbar from '../components/layout/DashboardNavbar';
import { Button } from '../components/ui/Button';
import { useAuth } from '../contexts/AuthContext';

const Settings = ({ onNavigate }) => {
  const { authSession } = useAuth();
  const [activeItem, setActiveItem] = useState('settings');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const role = (authSession?.user?.role || authSession?.role || 'admin').toLowerCase();

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    }, 1500);
  };

  const tabs = [
    { id: 'profile', label: 'My Profile', icon: User },
    { id: 'school', label: 'School Info', icon: Building2, roles: ['admin', 'superadmin'] },
    { id: 'security', label: 'Security', icon: ShieldCheck },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'subscription', label: 'Subscription', icon: CreditCard, roles: ['admin', 'superadmin'] },
    { id: 'system', label: 'System Logs', icon: Database, roles: ['superadmin'] },
  ].filter(tab => !tab.roles || tab.roles.includes(role));

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
          className="flex flex-col md:flex-row md:items-center justify-between mb-12 gap-4"
        >
          <div>
            <div className="flex items-center gap-3 mb-1">
              <div className="w-10 h-10 bg-accent-primary/10 rounded-xl flex items-center justify-center text-accent-primary shadow-lg shadow-accent-primary/5">
                <Settings2 size={24} />
              </div>
              <h1 className="text-3xl font-black tracking-tight font-headings uppercase italic">Preferences</h1>
            </div>
            <p className="text-text-muted text-sm font-bold uppercase tracking-widest opacity-60">Manage your account, institution, and security settings.</p>
          </div>
          <div className="flex gap-3">
             <AnimatePresence>
                {showSuccess && (
                  <motion.div 
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="flex items-center gap-2 px-6 py-3 bg-emerald-50 text-emerald-600 border border-emerald-100 rounded-2xl font-black text-xs uppercase tracking-widest"
                  >
                    <CheckCircle2 size={16} /> Changes Persistent
                  </motion.div>
                )}
             </AnimatePresence>
             <Button 
               onClick={handleSave} 
               disabled={isSaving}
               className="px-8 rounded-2xl bg-[#0F172A] hover:bg-black shadow-xl shadow-black/10 min-w-[160px]"
             >
                {isSaving ? 'Syncing...' : 'Save Changes'}
             </Button>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
           {/* Navigation Tabs */}
           <div className="lg:col-span-1 space-y-2">
              {tabs.map((tab) => (
                 <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl transition-all duration-300 font-black text-sm tracking-tight ${
                       activeTab === tab.id 
                       ? 'bg-accent-primary text-white shadow-xl shadow-accent-primary/20' 
                       : 'text-slate-400 hover:bg-slate-50 hover:text-text-primary'
                    }`}
                 >
                    <tab.icon size={18} strokeWidth={2.5} />
                    {tab.label}
                    {activeTab === tab.id && <motion.div layoutId="tabPill" className="ml-auto w-1.5 h-1.5 rounded-full bg-white shadow-[0_0_8px_white]" />}
                 </button>
              ))}
           </div>

           {/* Content Area */}
           <div className="lg:col-span-3">
              <motion.div
                 key={activeTab}
                 initial={{ opacity: 0, y: 10 }}
                 animate={{ opacity: 1, y: 0 }}
                 className="bg-white border border-slate-50 rounded-[48px] p-12 shadow-sm relative overflow-hidden group"
              >
                 <div className="absolute top-0 right-0 w-64 h-64 bg-accent-primary/[0.02] rounded-bl-[120px] -mr-20 -mt-20 group-hover:scale-110 transition-transform duration-1000" />
                 
                 {activeTab === 'profile' && (
                    <div className="space-y-12 relative z-10">
                       <div className="flex items-center gap-10">
                          <div className="relative group/avatar">
                             <div className="w-32 h-32 rounded-[48px] bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-black text-4xl shadow-2xl shadow-blue-500/20">
                                {(authSession?.user?.name || 'A').substring(0, 1).toUpperCase()}
                             </div>
                             <button className="absolute -bottom-2 -right-2 w-10 h-10 bg-white rounded-2xl shadow-xl flex items-center justify-center text-slate-400 hover:text-accent-primary transition-all border border-slate-50 group-hover/avatar:scale-110">
                                <Camera size={18} />
                             </button>
                          </div>
                          <div>
                             <h2 className="text-2xl font-black text-text-primary tracking-tight font-headings uppercase italic">Personal Identity</h2>
                             <p className="text-slate-400 font-bold text-xs uppercase tracking-widest mt-1">Global Platform UID: <span className="text-accent-primary italic">#OS-8821-X</span></p>
                          </div>
                       </div>

                       <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                          <SettingsInput label="Display Name" placeholder="e.g. John Doe" defaultValue={authSession?.user?.name} icon={User} />
                          <SettingsInput label="Account Email" placeholder="user@schoolos.com" defaultValue={authSession?.user?.email} icon={Mail} />
                          <SettingsInput label="Phone Connection" placeholder="+233..." icon={Phone} />
                          <SettingsInput label="Preferred Language" placeholder="English (UK)" icon={Globe} />
                       </div>
                    </div>
                 )}

                 {activeTab === 'school' && (
                    <div className="space-y-12 relative z-10">
                       <h2 className="text-2xl font-black text-text-primary tracking-tight font-headings uppercase italic">Institutional Metadata</h2>
                       <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                          <SettingsInput label="Official School Name" placeholder="Greenfield Academy" icon={Building2} />
                          <SettingsInput label="Digital Domain" placeholder="greenfield.schoolos.io" icon={Globe} />
                          <SettingsInput label="Registrar Email" placeholder="admin@greenfield.edu" icon={Mail} />
                          <SettingsInput label="Primary Campus Address" placeholder="Accra, Ghana" icon={Globe} />
                       </div>
                       
                       <div className="pt-8 border-t border-slate-50">
                          <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6">Regional Infrastructure</h4>
                          <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100 flex items-center justify-between">
                             <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-accent-primary shadow-sm">
                                   <Zap size={22} />
                                </div>
                                <div>
                                   <div className="text-sm font-black text-text-primary">Data Center: Africa (West)</div>
                                   <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Latency: 12ms • Node: ACC-01</div>
                                </div>
                             </div>
                             <div className="px-4 py-1.5 bg-emerald-50 text-emerald-600 text-[10px] font-black uppercase tracking-widest rounded-full">Optimized</div>
                          </div>
                       </div>
                    </div>
                 )}

                 {activeTab === 'security' && (
                    <div className="space-y-12 relative z-10">
                       <h2 className="text-2xl font-black text-text-primary tracking-tight font-headings uppercase italic">Access Controls</h2>
                       <div className="space-y-6">
                          <SecurityOption 
                             title="Multi-Factor Authentication" 
                             desc="Require a secondary code sent to your mobile device for all logins." 
                             icon={Smartphone} 
                             active={true}
                          />
                          <SecurityOption 
                             title="Session Monitoring" 
                             desc="Auto-terminate inactive sessions after 30 minutes of platform idle time." 
                             icon={Lock} 
                             active={false}
                          />
                          <SecurityOption 
                             title="Advanced Threat Protection" 
                             desc="AI-driven analysis of login attempts and unusual traffic patterns." 
                             icon={Zap} 
                             active={true}
                          />
                       </div>
                       <Button variant="secondary" className="px-10 h-14 rounded-2xl border-slate-100 font-black text-xs uppercase tracking-widest">
                          Update Password Cluster
                       </Button>
                    </div>
                 )}
                 
                 {activeTab === 'subscription' && (
                    <div className="space-y-12 relative z-10">
                       <div className="flex justify-between items-start">
                          <div>
                             <h2 className="text-2xl font-black text-text-primary tracking-tight font-headings uppercase italic">Billing Ecosystem</h2>
                             <p className="text-slate-400 font-bold text-xs uppercase tracking-widest mt-1">Plan: <span className="text-accent-primary italic">Enterprise (Trial)</span></p>
                          </div>
                          <div className="text-right">
                             <div className="text-4xl font-black text-text-primary tracking-tighter">₵1,800</div>
                             <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Next Invoice: June 1, 2026</div>
                          </div>
                       </div>

                       <div className="bg-[#0F172A] rounded-[32px] p-10 text-white relative overflow-hidden group/sub">
                          <TrendingUp className="absolute -right-10 -bottom-10 w-48 h-48 text-white/5 group-hover/sub:scale-125 transition-transform duration-700" />
                          <div className="flex flex-col md:flex-row justify-between items-center gap-8 relative z-10">
                             <div className="flex-1">
                                <h4 className="text-lg font-black italic mb-2 text-accent-primary">Scale your infrastructure</h4>
                                <p className="text-sm font-bold text-slate-400 leading-relaxed">Upgrade to a multi-campus yearly plan to save 20% on all platform features.</p>
                             </div>
                             <Button className="h-14 px-10 rounded-2xl bg-white text-[#0F172A] font-black text-xs uppercase tracking-widest hover:bg-slate-100 shadow-xl shadow-black/20 shrink-0">
                                View Enterprise Tiers
                             </Button>
                          </div>
                       </div>
                       
                       <div className="space-y-4">
                          <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Payment Methods</h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                             <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100 flex items-center justify-between group/card hover:bg-white hover:shadow-md transition-all cursor-pointer">
                                <div className="flex items-center gap-4">
                                   <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-slate-400 shadow-sm group-hover/card:text-accent-primary transition-colors">
                                      <CreditCard size={22} />
                                   </div>
                                   <div>
                                      <div className="text-sm font-black text-text-primary">Visa Ending in 4242</div>
                                      <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Expires 12/28 • Primary</div>
                                   </div>
                                </div>
                                <ChevronRight size={18} className="text-slate-300" />
                             </div>
                             <button className="p-6 rounded-3xl border-2 border-dashed border-slate-100 hover:border-accent-primary/30 hover:bg-accent-primary/[0.02] transition-all flex items-center justify-center gap-3 text-[11px] font-black uppercase tracking-widest text-slate-400 hover:text-accent-primary">
                                <Plus size={18} /> Add Method
                             </button>
                          </div>
                       </div>
                    </div>
                 )}
              </motion.div>
           </div>
        </div>
      </main>
    </div>
  );
};

const SettingsInput = ({ label, icon: Icon, defaultValue, placeholder }) => (
   <div className="space-y-2">
      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{label}</label>
      <div className="relative flex items-center group">
         <Icon size={18} className="absolute left-5 text-slate-300 group-focus-within:text-accent-primary transition-colors" />
         <input 
            defaultValue={defaultValue}
            placeholder={placeholder}
            className="w-full bg-slate-50 border border-slate-50 rounded-2xl py-4 pl-14 pr-6 text-sm font-bold text-text-primary outline-none focus:bg-white focus:border-accent-primary/20 transition-all shadow-sm"
         />
      </div>
   </div>
);

const SecurityOption = ({ title, desc, icon: Icon, active }) => (
   <div className="flex items-center justify-between p-8 bg-slate-50/50 border border-slate-50 rounded-[32px] hover:bg-white hover:shadow-md transition-all cursor-pointer group">
      <div className="flex items-center gap-6">
         <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all ${active ? 'bg-accent-primary text-white shadow-xl shadow-accent-primary/20' : 'bg-white text-slate-300 shadow-sm'}`}>
            <Icon size={24} />
         </div>
         <div>
            <div className="text-base font-black text-text-primary tracking-tight">{title}</div>
            <p className="text-xs font-bold text-slate-400 mt-1 max-w-sm">{desc}</p>
         </div>
      </div>
      <div className={`w-14 h-8 rounded-full p-1 transition-all duration-300 ${active ? 'bg-emerald-500' : 'bg-slate-200'}`}>
         <div className={`w-6 h-6 bg-white rounded-full shadow-md transition-all duration-300 ${active ? 'translate-x-6' : 'translate-x-0'}`} />
      </div>
   </div>
);

export default Settings;
