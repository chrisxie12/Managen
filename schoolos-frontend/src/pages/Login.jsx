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
  GraduationCap
} from 'lucide-react';
import { buildUrl } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

const PLUM = "#381932";
const PLUM_LIGHT = "#512b4a";
const MILK = "#FFF3E6";
const MUTED = "#64748b"; // Updated for WCAG AA compliance (slate-500)

const Login = ({ onNavigate }) => {
  const { setAuthSession } = useAuth();
  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [detectedSchool, setDetectedSchool] = useState(null);

  useEffect(() => {
    if (loginForm.email.includes('@')) {
      const domain = loginForm.email.split('@')[1];
      if (domain.length > 3) {
        setDetectedSchool('Accra Ridge School Node');
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
      const isSuperAdmin = loginForm.email.trim() === 'gyanchris131@gmail.com' && loginForm.password === 'Admin1234!';
      
      if (isSuperAdmin) {
        setAuthSession({
          kind: 'superadmin',
          label: 'Platform Admin',
          email: loginForm.email.trim()
        });
        onNavigate('dashboard');
        return;
      }

      const response = await fetch(buildUrl('/api/auth/login'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(loginForm),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Login failed');

      setAuthSession({
        kind: 'tenant',
        token: data?.data?.token,
        label: data?.data?.user?.name || 'Admin',
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
          <div className="flex items-center gap-3 mb-24 cursor-pointer" onClick={() => onNavigate('landing')}>
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
              The standard for <br/> 
              <span style={{ fontStyle: 'italic', color: 'rgba(255,255,255,0.9)' }}>Institutional</span> <br/>
              excellence.
            </motion.h1>
            <div className="flex items-center gap-4 text-white text-xs font-black uppercase tracking-[0.2em]">
               <div className="w-12 h-px bg-white/40" /> 
               Authorized Access Only
            </div>
          </div>
        </div>

        <div className="relative z-10">
           <div className="bg-white/5 border border-white/10 rounded-[32px] p-8 backdrop-blur-xl max-w-sm">
              <div className="flex items-center gap-4 mb-6">
                 <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center text-white">
                    <ShieldCheck size={24} />
                 </div>
                 <div>
                    <div className="text-white font-bold text-sm">Military-Grade Security</div>
                    <div className="text-white font-black uppercase tracking-widest text-xs">256-Bit SSL Encrypted</div>
                 </div>
              </div>
              <p className="text-white font-medium leading-relaxed text-xs">
                Your institutional data is isolated and encrypted at rest. Node synchronization is currently optimal.
              </p>
           </div>
        </div>
      </div>

      {/* Right Panel: Entry Form */}
      <div className="flex-1 flex flex-col justify-center px-8 sm:px-12 lg:px-24 relative overflow-y-auto">
        <div className="max-w-md w-full mx-auto py-12">
          <button 
            onClick={() => onNavigate('landing')}
            className="flex items-center gap-2 text-xs font-black uppercase tracking-widest mb-12 hover:opacity-70 transition-opacity"
            style={{ color: PLUM_LIGHT }}
          >
            <ArrowLeft size={14} /> Back to home
          </button>

          <div className="mb-12">
            <h2 className="text-4xl font-black tracking-tight mb-3" style={{ color: PLUM }}>Welcome back.</h2>
            <p style={{ color: MUTED, fontWeight: 600 }} className="leading-relaxed text-lg">Enter your administrative credentials to access your node.</p>
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
              <label className="text-xs font-black uppercase tracking-widest ml-1" style={{ color: MUTED }}>Administrative Email</label>
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
                <label className="text-xs font-black uppercase tracking-widest" style={{ color: MUTED }}>Security Key</label>
                <button type="button" className="text-xs font-black uppercase tracking-widest hover:opacity-70" style={{ color: PLUM_LIGHT }}>Forgot?</button>
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
              {loading ? 'Authenticating Node...' : 'Access Dashboard'}
              {!loading && <ChevronRight size={18} />}
            </button>

            <div className="relative py-4">
               <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-black/5"></div></div>
               <div className="relative flex justify-center text-xs font-black uppercase tracking-widest"><span className="px-4 text-slate-600" style={{ background: MILK }}>Or Secure Entry</span></div>
            </div>

            <button type="button" className="w-full h-14 bg-white border rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-50 transition-all flex items-center justify-center gap-3" style={{ color: PLUM, borderColor: "rgba(56,25,50,0.08)" }}>
               <Sparkles size={16} style={{ color: PLUM_LIGHT }} /> Send Magic Link
            </button>

            <div className="pt-6">
              <button 
                type="button"
                onClick={() => {
                  setLoginForm({ email: 'gyanchris131@gmail.com', password: 'Admin1234!' });
                }}
                className="w-full py-3 rounded-xl border-2 border-dashed border-plum/20 text-xs font-black uppercase tracking-widest hover:bg-plum/[0.03] transition-all flex items-center justify-center gap-2"
                style={{ color: PLUM }}
              >
                <Zap size={14} fill={PLUM} /> Auto-fill Demo Credentials
              </button>
            </div>
          </form>

          <p className="mt-12 text-center text-sm font-bold" style={{ color: MUTED }}>
            Don't have a node yet?{' '}
            <button onClick={() => onNavigate('signup')} style={{ color: PLUM_LIGHT }} className="font-black hover:underline underline-offset-4">Provision SchoolOS</button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
