import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, 
  Mail, 
  Lock, 
  ShieldCheck, 
  Globe, 
  ChevronRight,
  Sparkles,
  Zap,
  GraduationCap,
  Building2,
  Wallet,
  BookOpen,
  Users,
  User,
  Shield
} from 'lucide-react';
import { buildUrl } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

const PLUM = "#381932";
const PLUM_LIGHT = "#512b4a";
const MILK = "#FFF3E6";
const MUTED = "#64748b";

const roles = [
  { id: 'superadmin', label: 'Super Admin', icon: Shield, desc: 'Platform Root' },
  { id: 'admin', label: 'School Admin', icon: Building2, desc: 'Institution Manager' },
  { id: 'headmaster', label: 'Headmaster', icon: GraduationCap, desc: 'Academic Lead' },
  { id: 'accountant', label: 'Accountant', icon: Wallet, desc: 'Financial Desk' },
  { id: 'teacher', label: 'Teacher', icon: BookOpen, desc: 'Faculty Portal' },
  { id: 'parent', label: 'Parent', icon: Users, desc: 'Family Access' },
  { id: 'student', label: 'Student', icon: User, desc: 'Learner Station' },
];

const Login = ({ onNavigate }) => {
  const { setAuthSession } = useAuth();
  const [selectedRole, setSelectedRole] = useState('admin');
  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [detectedSchool, setDetectedSchool] = useState(null);

  useEffect(() => {
    if (loginForm.email.includes('@')) {
      const domain = loginForm.email.split('@')[1];
      if (domain.length > 3) {
        setDetectedSchool('Global Institution Node');
      }
    } else {
      setDetectedSchool(null);
    }
  }, [loginForm.email]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Demo SuperAdmin Check
      if (selectedRole === 'superadmin' && loginForm.email.trim() === 'gyanchris131@gmail.com' && loginForm.password === 'Admin1234!') {
        setAuthSession({
          kind: 'superadmin',
          role: 'superadmin',
          label: 'Platform Admin',
          email: loginForm.email.trim()
        });
        onNavigate('dashboard');
        return;
      }

      const response = await fetch(buildUrl('/api/auth/login'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...loginForm, role: selectedRole }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Login failed');

      setAuthSession({
        kind: 'tenant',
        role: selectedRole,
        token: data?.data?.token,
        label: data?.data?.user?.name || roles.find(r => r.id === selectedRole).label,
        school: data?.data?.school || null,
        user: data?.data?.user || null
      });
      onNavigate('dashboard');

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex overflow-hidden font-body" style={{ background: MILK }}>
      {/* Left Panel: Brand & Narrative */}
      <div className="hidden lg:flex w-[42%] p-16 flex-col justify-between relative overflow-hidden" style={{ background: `linear-gradient(135deg, ${PLUM} 0%, ${PLUM_LIGHT} 100%)` }}>
        <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]" />
        
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-20 cursor-pointer" onClick={() => onNavigate('landing')}>
            <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow-lg" style={{ background: MILK }}>
              <GraduationCap size={22} color={PLUM} />
            </div>
            <span className="text-xl font-bold tracking-tight text-white" style={{ fontFamily: "'Playfair Display', serif" }}>SchoolOS</span>
          </div>

          <div className="max-w-md">
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-5xl text-white leading-tight mb-8"
              style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700 }}
            >
              The unified <br/> 
              <span style={{ fontStyle: 'italic', color: 'rgba(255,255,255,0.9)' }}>experience</span> <br/>
              for every role.
            </motion.h1>
            <div className="flex items-center gap-4 text-white text-xs font-black uppercase tracking-[0.2em]">
               <div className="w-12 h-px bg-white/40" /> 
               Multi-Tenant Architecture
            </div>
          </div>
        </div>

        <div className="relative z-10 grid grid-cols-2 gap-4">
           {[
              { label: 'Uptime', val: '99.9%', icon: Globe },
              { label: 'Security', val: 'AES-256', icon: ShieldCheck }
           ].map((stat, i) => (
              <div key={i} className="bg-white/5 border border-white/10 rounded-3xl p-5 backdrop-blur-xl">
                 <stat.icon size={20} className="text-white/40 mb-3" />
                 <div className="text-white font-black text-xl leading-none mb-1">{stat.val}</div>
                 <div className="text-white/40 font-black uppercase tracking-widest text-[9px]">{stat.label}</div>
              </div>
           ))}
        </div>
      </div>

      {/* Right Panel: Entry Form */}
      <div className="flex-1 flex flex-col px-8 sm:px-12 lg:px-24 relative overflow-y-auto py-12">
        <div className="max-w-xl w-full mx-auto">
          <button 
            onClick={() => onNavigate('landing')}
            className="flex items-center gap-2 text-xs font-black uppercase tracking-widest mb-12 hover:opacity-70 transition-opacity"
            style={{ color: PLUM_LIGHT }}
          >
            <ArrowLeft size={14} /> Back to home
          </button>

          <div className="mb-10">
            <h2 className="text-4xl font-black tracking-tight mb-3" style={{ color: PLUM }}>Access Node.</h2>
            <p style={{ color: MUTED, fontWeight: 600 }} className="leading-relaxed text-sm">Select your institutional role to continue to your dashboard.</p>
          </div>

          {/* Role Selector */}
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3 mb-10">
             {roles.map((role) => (
                <button
                   key={role.id}
                   type="button"
                   onClick={() => setSelectedRole(role.id)}
                   className={`p-3 rounded-2xl border transition-all flex flex-col items-center gap-2 group relative ${selectedRole === role.id ? 'bg-plum text-milk border-plum shadow-xl shadow-plum/20 scale-105' : 'bg-white border-slate-100 text-slate-400 hover:border-plum/20'}`}
                >
                   <role.icon size={20} className={selectedRole === role.id ? 'text-milk' : 'group-hover:text-plum transition-colors'} />
                   <span className="text-[8px] font-black uppercase tracking-widest text-center">{role.label}</span>
                   {selectedRole === role.id && (
                      <motion.div layoutId="activeRole" className="absolute -bottom-1 w-1 h-1 bg-milk rounded-full" />
                   )}
                </button>
             ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <AnimatePresence>
              {detectedSchool && (
                <motion.div 
                   initial={{ opacity: 0, height: 0 }}
                   animate={{ opacity: 1, height: 'auto' }}
                   exit={{ opacity: 0, height: 0 }}
                   className="p-4 rounded-2xl flex items-center gap-3 mb-4"
                   style={{ background: "white", border: `1px solid rgba(56,25,50,0.08)` }}
                >
                   <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white shadow-sm" style={{ background: PLUM }}><Globe size={16} /></div>
                   <span className="text-xs font-black uppercase tracking-widest" style={{ color: PLUM_LIGHT }}>{detectedSchool}</span>
                </motion.div>
              )}
            </AnimatePresence>

            {error && (
              <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="p-4 bg-red-50 border border-red-100 rounded-2xl text-red-600 text-sm font-bold flex items-center gap-3">
                <Zap size={18} /> {error}
              </motion.div>
            )}

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest ml-1" style={{ color: MUTED }}>{roles.find(r => r.id === selectedRole).label} Email</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2" size={18} color={MUTED} />
                <input
                  type="email"
                  required
                  className="w-full h-14 pl-12 pr-4 bg-white border rounded-2xl outline-none transition-all font-bold text-sm shadow-sm focus:border-plum/30"
                  style={{ color: PLUM, borderColor: "rgba(56,25,50,0.08)" }}
                  placeholder="name@school.edu"
                  value={loginForm.email}
                  onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between ml-1">
                <label className="text-[10px] font-black uppercase tracking-widest" style={{ color: MUTED }}>Access Key</label>
                <button type="button" className="text-[10px] font-black uppercase tracking-widest hover:opacity-70" style={{ color: PLUM_LIGHT }}>Forgot?</button>
              </div>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2" size={18} color={MUTED} />
                <input
                  type="password"
                  required
                  className="w-full h-14 pl-12 pr-4 bg-white border rounded-2xl outline-none transition-all font-bold text-sm shadow-sm focus:border-plum/30"
                  style={{ color: PLUM, borderColor: "rgba(56,25,50,0.08)" }}
                  placeholder="••••••••"
                  value={loginForm.password}
                  onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full h-14 rounded-2xl font-black text-xs uppercase tracking-widest transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-3 shadow-xl"
              style={{ background: `linear-gradient(135deg, ${PLUM}, ${PLUM_LIGHT})`, color: MILK, boxShadow: "0 8px 24px rgba(56,25,50,0.2)" }}
            >
              {loading ? 'Decrypting Security Node...' : 'Access Dashboard'}
              {!loading && <ChevronRight size={18} />}
            </button>

            <div className="pt-6">
              <button 
                type="button"
                onClick={() => {
                  if (selectedRole === 'superadmin') {
                    setLoginForm({ email: 'gyanchris131@gmail.com', password: 'Admin1234!' });
                  } else {
                    setLoginForm({ email: 'admin@demo.com', password: 'password123' });
                  }
                }}
                className="w-full py-3 rounded-xl border-2 border-dashed border-plum/20 text-[10px] font-black uppercase tracking-widest hover:bg-plum/[0.03] transition-all flex items-center justify-center gap-2"
                style={{ color: PLUM }}
              >
                <Zap size={14} fill={PLUM} /> Auto-fill {roles.find(r => r.id === selectedRole).label} Demo
              </button>
            </div>
          </form>

          <p className="mt-10 text-center text-xs font-bold" style={{ color: MUTED }}>
            Institution not onboarded?{' '}
            <button onClick={() => onNavigate('signup')} style={{ color: PLUM_LIGHT }} className="font-black hover:underline underline-offset-4">Provision Node</button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;

