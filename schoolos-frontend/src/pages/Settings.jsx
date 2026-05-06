import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User, 
  Building2, 
  ShieldCheck, 
  Bell, 
  Database, 
  Globe, 
  CreditCard, 
  Mail,
  Phone,
  Camera,
  CheckCircle2,
  Lock,
  Zap,
  Smartphone
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';

const Settings = ({ onNavigate }) => {
  const { authSession } = useAuth();
  const { isDarkMode } = useTheme();
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
    }, 1200);
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
    <div className="p-6 sm:p-8 flex flex-col gap-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
           <div>
              <h1 style={{ fontFamily: "'Playfair Display', serif", color: "var(--text-primary)", fontSize: "1.8rem", fontWeight: 800 }}>Preferences</h1>
              <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", fontWeight: 600 }}>Configure your institutional node and personal identity.</p>
           </div>
           <div className="flex gap-3">
              <AnimatePresence>
                 {showSuccess && (
                    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="flex items-center gap-2 px-5 py-2.5 bg-emerald-50 text-emerald-600 border border-emerald-100 rounded-xl font-bold text-[10px] uppercase tracking-widest">
                       <CheckCircle2 size={14} /> Synchronized
                    </motion.div>
                 )}
              </AnimatePresence>
              <button onClick={handleSave} disabled={isSaving} className="px-8 py-3 rounded-2xl bg-plum text-milk text-xs font-black uppercase tracking-widest shadow-lg shadow-plum/20 hover:scale-105 active:scale-95 transition-all disabled:opacity-50">
                 {isSaving ? 'Syncing...' : 'Save Configuration'}
              </button>
           </div>
        </div>

        <div className="grid lg:grid-cols-4 gap-8">
           {/* Navigation */}
           <div className="lg:col-span-1 flex flex-col gap-2">
              {tabs.map((tab) => (
                 <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-3 px-6 py-4 rounded-2xl transition-all font-bold text-sm ${activeTab === tab.id ? 'bg-plum text-milk shadow-xl shadow-plum/10' : 'text-muted hover:bg-black/5'}`}
                    style={{ color: activeTab === tab.id ? undefined : "var(--text-muted)" }}
                 >
                    <tab.icon size={18} />
                    {tab.label}
                 </button>
              ))}
           </div>

           {/* Content Hub */}
           <div className="lg:col-span-3">
              <motion.div
                 key={activeTab}
                 initial={{ opacity: 0, y: 10 }}
                 animate={{ opacity: 1, y: 0 }}
                 className="p-8 sm:p-12 rounded-[40px] border relative overflow-hidden group"
                 style={{
                   background: "var(--card-bg)",
                   borderColor: "var(--border)",
                   boxShadow: "var(--shadow-card)",
                 }}
              >
                 <div className="absolute top-0 right-0 w-64 h-64 bg-black/[0.02] rounded-bl-[120px] -mr-20 -mt-20 group-hover:scale-110 transition-transform duration-1000" />
                 
                 {activeTab === 'profile' && (
                    <div className="space-y-10 relative z-10">
                       <div className="flex items-center gap-8">
                          <div className="relative">
                             <div className="w-24 h-24 rounded-[32px] bg-plum text-milk flex items-center justify-center font-black text-3xl shadow-2xl shadow-plum/20">
                                {(authSession?.user?.name || 'A')[0]}
                             </div>
                             <button className="absolute -bottom-2 -right-2 w-10 h-10 bg-white rounded-xl shadow-xl flex items-center justify-center border hover:scale-110 transition-all">
                                <Camera size={18} color="#381932" />
                             </button>
                          </div>
                          <div>
                             <h2 style={{ fontFamily: "'Playfair Display', serif", color: "var(--text-primary)", fontSize: "1.4rem", fontWeight: 800 }}>Account Profile</h2>
                             <p style={{ color: "var(--text-muted)", fontSize: "0.75rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em" }}>Global ID: <span style={{ color: "var(--text-primary)" }}>#OS-8821-X</span></p>
                          </div>
                       </div>

                       <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <SettingsField label="Full Name" icon={User} value={authSession?.user?.name} />
                          <SettingsField label="Email Address" icon={Mail} value={authSession?.user?.email} />
                          <SettingsField label="Phone Contact" icon={Phone} placeholder="+233..." />
                          <SettingsField label="Language" icon={Globe} value="English (Global)" />
                       </div>
                    </div>
                 )}

                 {activeTab === 'security' && (
                    <div className="space-y-8 relative z-10">
                       <h3 style={{ fontFamily: "'Playfair Display', serif", color: "var(--text-primary)", fontSize: "1.4rem", fontWeight: 800 }}>Digital Shield</h3>
                       <div className="space-y-4">
                          <SecurityCard title="Two-Factor Auth" desc="Secure every login with a verified mobile challenge." icon={Smartphone} active={true} />
                          <SecurityCard title="Session Manager" desc="Automatically revoke access for inactive platform nodes." icon={Lock} active={false} />
                          <SecurityCard title="Threat Intel" desc="Advanced monitoring of suspicious institutional traffic." icon={Zap} active={true} />
                       </div>
                       <button className="px-8 py-3 rounded-2xl border text-[10px] font-black uppercase tracking-widest transition-colors" style={{ color: "var(--text-primary)", borderColor: "var(--border)" }}>Rotate Access Keys</button>
                    </div>
                 )}

                 {activeTab === 'school' && (
                    <div className="space-y-10 relative z-10">
                       <h3 style={{ fontFamily: "'Playfair Display', serif", color: "var(--text-primary)", fontSize: "1.4rem", fontWeight: 800 }}>Institutional metadata</h3>
                       <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <SettingsField label="Institution Name" icon={Building2} placeholder="e.g. Greenfield Academy" />
                          <SettingsField label="Institutional Domain" icon={Globe} placeholder="academy.schoolos.io" />
                          <SettingsField label="Registrar Contact" icon={Mail} placeholder="admin@school.edu" />
                          <SettingsField label="Primary Campus" icon={Globe} placeholder="Accra, Ghana" />
                       </div>
                    </div>
                 )}
              </motion.div>
           </div>
        </div>
    </div>
  );
};

const SettingsField = ({ label, icon: Icon, value, placeholder }) => (
   <div className="space-y-2">
      <label className="text-[10px] font-black uppercase tracking-widest ml-1" style={{ color: "var(--text-muted)" }}>{label}</label>
      <div className="relative group">
         <div className="absolute left-4 top-1/2 -translate-y-1/2">
            <Icon size={16} style={{ color: "var(--text-muted)" }} />
         </div>
         <input 
            defaultValue={value}
            placeholder={placeholder}
            className="w-full border rounded-2xl py-4 pl-12 pr-6 text-sm font-bold outline-none transition-all shadow-sm"
            style={{ color: "var(--text-primary)", background: "var(--bg-secondary)", borderColor: "var(--border)" }}
         />
      </div>
   </div>
);

const SecurityCard = ({ title, desc, icon: Icon, active }) => (
   <div className="flex items-center justify-between p-6 rounded-[28px] border border-transparent hover:border-plum/10 transition-all cursor-pointer group" style={{ background: "var(--bg-secondary)" }}>
      <div className="flex items-center gap-5">
         <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${active ? 'bg-plum text-milk shadow-lg' : 'bg-white/10 text-slate-300'}`}>
            <Icon size={20} />
         </div>
         <div>
            <h4 style={{ color: "var(--text-primary)", fontSize: "0.9rem", fontWeight: 800 }}>{title}</h4>
            <p style={{ color: "var(--text-muted)", fontSize: "0.7rem", fontWeight: 600 }}>{desc}</p>
         </div>
      </div>
      <div className={`w-12 h-6 rounded-full p-1 transition-all ${active ? 'bg-emerald-500' : 'bg-slate-200'}`}>
         <div className={`w-4 h-4 bg-white rounded-full transition-all ${active ? 'translate-x-6' : 'translate-x-0'}`} />
      </div>
   </div>
);

export default Settings;

