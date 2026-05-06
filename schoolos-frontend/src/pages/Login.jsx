import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowRight, 
  Mail, 
  Lock, 
  Activity, 
  ShieldCheck, 
  Globe, 
  ChevronRight,
  Sparkles,
  Command,
  Zap
} from 'lucide-react';
import logo from '../assets/app-logo.png';
import { buildUrl } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

const Login = ({ onNavigate }) => {
  const { setAuthSession } = useAuth();
  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [detectedSchool, setDetectedSchool] = useState(null);

  // Mock school detection logic based on email domain
  useEffect(() => {
    if (loginForm.email.includes('@')) {
      const domain = loginForm.email.split('@')[1];
      if (domain.length > 3) {
        setDetectedSchool('British International School Node');
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
      // SuperAdmin check
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
    <div className="min-h-screen bg-bg-primary flex overflow-hidden font-body">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;700;900&family=Playfair+Display:ital,wght@0,700;1,700&display=swap');
        .playfair { font-family: var(--font-headings); }
        .mesh-gradient {
          background-color: var(--accent-primary);
          background-image: 
            radial-gradient(at 0% 0%, rgba(255, 243, 230, 0.05) 0px, transparent 50%),
            radial-gradient(at 100% 0%, rgba(255, 243, 230, 0.03) 0px, transparent 50%),
            radial-gradient(at 100% 100%, rgba(255, 243, 230, 0.05) 0px, transparent 50%),
            radial-gradient(at 0% 100%, rgba(255, 243, 230, 0.03) 0px, transparent 50%);
        }
        .surgical-input:focus {
          background: white;
          box-shadow: 0 0 0 4px rgba(56, 25, 50, 0.1);
          border-color: var(--accent-primary);
        }
      `}</style>

      {/* Left Panel: Narrative & Pulse */}
      <div className="hidden lg:flex w-[45%] mesh-gradient p-16 flex-col justify-between relative overflow-hidden">
        <motion.div 
          animate={{ opacity: [0.3, 0.5, 0.3], scale: [1, 1.1, 1] }} 
          transition={{ duration: 8, repeat: Infinity }}
          className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-20 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]" 
        />
        
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-24 cursor-pointer" onClick={() => onNavigate('landing')}>
            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-lg border border-white/10 overflow-hidden">
              <img src={logo} alt="S" className="w-7 h-7 object-contain mix-blend-multiply" />
            </div>
            <span className="text-xl font-black tracking-tighter text-bg-primary">SchoolOS<span className="text-accent-secondary">.</span></span>
          </div>

          <div className="max-w-md">
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="playfair italic text-5xl text-bg-primary leading-tight mb-8"
            >
              "The standard for <br/> 
              <span className="text-bg-secondary not-italic">Institutional </span> 
              excellence."
            </motion.h2>
            <div className="flex items-center gap-4 text-bg-primary/40 text-sm font-bold uppercase tracking-[0.2em]">
               <div className="w-12 h-px bg-bg-primary/20" /> 
               Platform Node US-EAST
            </div>
          </div>
        </div>

        <div className="relative z-10">
           <div className="bg-white/5 border border-white/10 rounded-[32px] p-8 backdrop-blur-xl max-w-sm">
              <div className="flex items-center gap-4 mb-6">
                 <div className="w-12 h-12 bg-blue-500/20 rounded-2xl flex items-center justify-center text-blue-400">
                    <Activity size={24} />
                 </div>
                 <div>
                    <div className="text-white font-bold">Network Pulse</div>
                    <div className="text-white/40 text-[10px] font-black uppercase tracking-widest">2,500+ Schools Online</div>
                 </div>
              </div>
              <div className="space-y-3">
                 {[1, 2].map(i => (
                    <div key={i} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
                       <div className="w-24 h-2 bg-white/10 rounded-full" />
                       <div className="w-8 h-2 bg-emerald-500/20 rounded-full" />
                    </div>
                 ))}
              </div>
           </div>
        </div>
      </div>

      {/* Right Panel: Entry Form */}
      <div className="flex-1 flex flex-col justify-center px-8 sm:px-12 lg:px-24 bg-white relative">
        <div className="max-w-md w-full mx-auto">
          <div className="mb-12">
            <div className="flex lg:hidden items-center gap-3 mb-12">
              <div className="w-9 h-9 bg-white rounded-xl flex items-center justify-center shadow-lg border border-slate-100 overflow-hidden">
                <img src={logo} alt="S" className="w-6 h-6 object-contain mix-blend-multiply" />
              </div>
              <span className="text-xl font-black tracking-tighter">SchoolOS.</span>
            </div>
            
            <h1 className="text-4xl font-black text-text-primary tracking-tighter mb-3">Welcome back.</h1>
            <p className="text-text-secondary font-medium leading-relaxed">Enter your credentials to access your campus node.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <AnimatePresence>
              {detectedSchool && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="bg-blue-50 border border-blue-100 p-4 rounded-2xl flex items-center gap-3 mb-4"
                >
                  <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white"><Globe size={16} /></div>
                  <span className="text-[11px] font-black uppercase tracking-widest text-blue-600">{detectedSchool}</span>
                </motion.div>
              )}
            </AnimatePresence>

            {error && (
              <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="p-4 bg-rose-50 border border-rose-100 rounded-2xl text-rose-600 text-sm font-bold flex items-center gap-3">
                <Activity size={18} /> {error}
              </motion.div>
            )}

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Administrative Email</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                <input
                  type="email"
                  required
                  className="w-full h-14 pl-12 pr-4 bg-slate-50 border border-slate-100 rounded-2xl surgical-input outline-none transition-all font-medium"
                  placeholder="name@school.edu"
                  value={loginForm.email}
                  onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between ml-1">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Security Key</label>
                <button type="button" className="text-[10px] font-black uppercase tracking-widest text-blue-600 hover:text-blue-700">Forgot?</button>
              </div>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                <input
                  type="password"
                  required
                  className="w-full h-14 pl-12 pr-4 bg-slate-50 border border-slate-100 rounded-2xl surgical-input outline-none transition-all font-medium"
                  placeholder="••••••••"
                  value={loginForm.password}
                  onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full h-14 bg-accent-primary hover:bg-accent-secondary text-bg-primary rounded-2xl font-black text-sm uppercase tracking-widest transition-all shadow-xl shadow-accent-primary/10 active:scale-95 disabled:opacity-50 flex items-center justify-center gap-3"
            >
              {loading ? 'Authenticating Node...' : 'Access Dashboard'}
              {!loading && <ChevronRight size={18} />}
            </button>

            <div className="relative py-4">
               <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-100"></div></div>
               <div className="relative flex justify-center text-[10px] font-black uppercase tracking-widest"><span className="bg-white px-4 text-slate-400">Or Secure Entry</span></div>
            </div>

            <button type="button" className="w-full h-14 bg-white border border-slate-100 text-[#0F172A] rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-50 transition-all flex items-center justify-center gap-3">
               <Zap size={16} className="text-blue-600" /> Send Magic Link
            </button>
          </form>

          <p className="mt-12 text-center text-sm font-medium text-slate-500">
            Don't have a node yet?{' '}
            <button onClick={() => onNavigate('signup')} className="text-blue-600 font-black hover:underline underline-offset-4">Provision SchoolOS</button>
          </p>

          {/* System Heartbeat */}
          <div className="mt-20 flex items-center justify-center gap-4 text-slate-300">
             <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                <span className="text-[10px] font-black uppercase tracking-widest">Node US-EAST Live</span>
             </div>
             <div className="w-px h-3 bg-slate-100" />
             <div className="flex items-center gap-2">
                <ShieldCheck size={14} />
                <span className="text-[10px] font-black uppercase tracking-widest">256-Bit Secure</span>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
