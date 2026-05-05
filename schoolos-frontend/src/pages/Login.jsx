import React, { useState, useEffect } from 'react';
import logo from '../assets/app-logo.png';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  Globe,
  ArrowRight,
  ShieldCheck,
  GraduationCap,
  Users,
  Briefcase,
  UserCircle,
  Zap
} from 'lucide-react';
import { buildUrl, handleApiError } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

const normalizeSubdomain = (value) => String(value || '').trim().toLowerCase();

export const Login = ({ onNavigate }) => {
  const { setAuthSession } = useAuth();
  const [loginForm, setLoginForm] = useState({ subdomain: '', email: '', password: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState({ type: '', message: '' });
  const [selectedRole, setSelectedRole] = useState('admin');
  const [showPassword, setShowPassword] = useState(false);

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setLoginForm((current) => ({ ...current, [name]: value }));
  };

  const submitLogin = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);
    setStatus({ type: '', message: '' });

    try {
      const isSuperAdmin = selectedRole === 'superadmin';
      const endpoint = isSuperAdmin ? '/api/superadmin/login' : '/api/auth/login';
      
      const payload = { 
        email: loginForm.email.trim(), 
        password: loginForm.password,
        ...(isSuperAdmin ? {} : { subdomain: normalizeSubdomain(loginForm.subdomain) })
      };

      const response = await fetch(buildUrl(endpoint), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload),
      });

      if (!response.ok) throw new Error(await handleApiError(response));
      
      const data = await response.json();
      
      if (isSuperAdmin) {
        setAuthSession({
          kind: 'superadmin',
          label: 'Platform Admin',
          email: loginForm.email.trim()
        });
      } else {
        setAuthSession({
          kind: 'tenant',
          label: data?.data?.user?.name || 'Admin',
          school: data?.data?.school || null,
          user: data?.data?.user || null
        });
      }
    } catch (error) {
      setStatus({ type: 'error', message: error.message });
    } finally {
      setIsSubmitting(false);
    }
  };

  const roles = [
    { id: 'admin', label: 'Admin', icon: ShieldCheck },
    { id: 'teacher', label: 'Teacher', icon: Briefcase },
    { id: 'student', label: 'Student', icon: GraduationCap },
    { id: 'parent', label: 'Parent', icon: Users },
    { id: 'accountant', label: 'Accountant', icon: UserCircle },
    { id: 'superadmin', label: 'Super Admin', icon: Zap }
  ];

  return (
    <div className="min-h-screen w-full bg-[#f8fafc] flex items-center justify-center p-4 lg:p-8 font-['DM_Sans',sans-serif]">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Playfair+Display:ital,wght@1,700&display=swap');
        
        .playfair { font-family: 'Playfair Display', serif; }
        
        .pulse-dot {
          width: 8px;
          height: 8px;
          background: #10b981;
          border-radius: 50%;
          display: inline-block;
          margin-right: 8px;
          box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.7);
          animation: pulse 2s infinite;
        }

        @keyframes pulse {
          0% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.7); }
          70% { box-shadow: 0 0 0 10px rgba(16, 185, 129, 0); }
          100% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0); }
        }

        .input-group:focus-within .icon-box {
          color: #2563eb;
        }
      `}</style>

      <motion.div 
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-[1040px] min-h-[720px] bg-white rounded-[24px] overflow-hidden shadow-2xl grid grid-cols-1 lg:grid-cols-2"
      >
        {/* Left Panel: Welcome */}
        <div className="relative p-12 lg:p-16 flex flex-col justify-between overflow-hidden bg-gradient-to-br from-[#0f172a] via-[#1e3a8a] to-[#1d4ed8]">
          {/* Decorative Accents */}
          <div className="absolute top-[-10%] right-[-10%] w-96 h-96 bg-blue-400/20 rounded-full blur-[100px] pointer-events-none" />
          <div className="absolute bottom-[-5%] left-[-5%] w-80 h-80 bg-orange-400/10 rounded-full blur-[80px] pointer-events-none" />
          
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-20">
               <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-lg border border-white/10 overflow-hidden">
                  <img src={logo} alt="S" className="w-7 h-7 object-contain mix-blend-multiply" />
               </div>
               <span className="text-xl font-bold tracking-tight text-white">School<span className="text-blue-400">OS</span></span>
            </div>

            <div className="space-y-4">
              <h1 className="playfair italic text-7xl lg:text-8xl text-white leading-tight">
                Welcome <br/>
                <span className="text-[#f97316]">Back.</span>
              </h1>
              <p className="text-white/55 text-lg font-medium leading-relaxed max-w-sm">
                Your institution's control centre. <br/>
                Modern tools for modern education.
              </p>
            </div>
          </div>

          <div className="relative z-10 space-y-10">
            <div className="flex items-center gap-8 text-white/90 text-sm font-semibold tracking-wide">
              <div>10K+ <span className="text-white/40 ml-1">Schools</span></div>
              <div className="w-1 h-1 bg-white/20 rounded-full" />
              <div>2M+ <span className="text-white/40 ml-1">Students</span></div>
              <div className="w-1 h-1 bg-white/20 rounded-full" />
              <div>99.9% <span className="text-white/40 ml-1">Uptime</span></div>
            </div>

            <div className="inline-flex items-center px-4 py-2 bg-white/5 backdrop-blur-md border border-white/10 rounded-full">
              <span className="pulse-dot" />
              <span className="text-[10px] font-black text-white/90 uppercase tracking-widest">All Systems Operational</span>
            </div>
          </div>
        </div>

        {/* Right Panel: Form */}
        <div className="p-12 lg:p-16 flex flex-col justify-center bg-white">
          <div className="mb-10 text-center lg:text-left">
            <h2 className="text-[28px] font-bold text-[#0f172a] mb-2">Sign in to your account</h2>
            <p className="text-slate-400 font-medium">Select your role and enter your credentials</p>
          </div>

          {/* Role Grid */}
          <div className="grid grid-cols-3 gap-3 mb-10">
            {roles.map(role => (
              <button
                key={role.id}
                type="button"
                onClick={() => setSelectedRole(role.id)}
                className={`flex flex-col items-center justify-center p-4 rounded-xl border-1.5 transition-all duration-200 group ${
                  selectedRole === role.id 
                  ? 'bg-[#eff6ff] border-[#2563eb] text-[#2563eb]' 
                  : 'bg-[#fafafa] border-[#f0f0f0] text-slate-400 hover:border-slate-300 hover:bg-slate-50'
                }`}
              >
                <role.icon size={20} className={`mb-2 transition-colors ${selectedRole === role.id ? 'text-[#2563eb]' : 'text-slate-400 group-hover:text-slate-500'}`} />
                <span className="text-[10px] font-bold uppercase tracking-wider">{role.label}</span>
              </button>
            ))}
          </div>

          <form onSubmit={submitLogin} className="space-y-6">
            {selectedRole !== 'superadmin' && (
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest ml-1 text-center lg:text-left block">School Subdomain</label>
                <div className="relative flex items-center input-group">
                  <div className="absolute left-4 icon-box text-slate-400 transition-colors">
                    <Globe size={18} />
                  </div>
                  <input 
                    name="subdomain"
                    placeholder="greenvalley"
                    className="w-full bg-[#f8fafc] border border-slate-200 rounded-xl py-4 pl-12 pr-28 text-[#0f172a] font-semibold placeholder:text-slate-400 outline-none focus:border-blue-500 focus:bg-white transition-all"
                    value={loginForm.subdomain}
                    onChange={handleInputChange}
                    required
                  />
                  <div className="absolute right-4 text-sm font-bold text-slate-400">.schoolos.io</div>
                </div>
              </div>
            )}

            <div className="space-y-2">
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest ml-1 text-center lg:text-left block">Email Address</label>
              <div className="relative flex items-center input-group">
                <div className="absolute left-4 icon-box text-slate-400 transition-colors">
                  <Mail size={18} />
                </div>
                <input 
                  type="email"
                  name="email"
                  placeholder="admin@school.com"
                  className="w-full bg-[#f8fafc] border border-slate-200 rounded-xl py-4 pl-12 text-[#0f172a] font-semibold placeholder:text-slate-400 outline-none focus:border-blue-500 focus:bg-white transition-all"
                  value={loginForm.email}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center mb-1">
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest ml-1">Password</label>
                <button type="button" className="text-xs font-bold text-[#2563eb] hover:underline">Forgot password?</button>
              </div>
              <div className="relative flex items-center input-group">
                <div className="absolute left-4 icon-box text-slate-400 transition-colors">
                  <Lock size={18} />
                </div>
                <input 
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="••••••••"
                  className="w-full bg-[#f8fafc] border border-slate-200 rounded-xl py-4 pl-12 pr-12 text-[#0f172a] font-semibold placeholder:text-slate-400 outline-none focus:border-blue-500 focus:bg-white transition-all"
                  value={loginForm.password}
                  onChange={handleInputChange}
                  required
                />
                <button 
                  type="button" 
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <AnimatePresence>
              {status.message && (
                <motion.div 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className={`p-4 rounded-xl text-sm font-semibold flex items-center gap-3 ${
                    status.type === 'error' ? 'bg-red-50 text-red-600' : 'bg-emerald-50 text-emerald-600'
                  }`}
                >
                  <div className={`w-1.5 h-1.5 rounded-full ${status.type === 'error' ? 'bg-red-600' : 'bg-emerald-600'}`} />
                  {status.message}
                </motion.div>
              )}
            </AnimatePresence>

            <button 
              type="submit" 
              disabled={isSubmitting}
              className="w-full h-14 rounded-xl bg-gradient-to-r from-[#1d4ed8] to-[#2563eb] text-white font-bold text-base shadow-[0_4px_20px_rgba(37,99,235,0.35)] hover:shadow-[0_8px_30px_rgba(37,99,235,0.45)] transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2 group"
            >
              {isSubmitting ? (
                <motion.div 
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                  className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
                />
              ) : (
                <>Sign In <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" /></>
              )}
            </button>
          </form>

          <div className="mt-12 text-center">
            <p className="text-sm font-medium text-slate-500">
              Don't have an account? {' '}
              <button 
                type="button" 
                onClick={() => onNavigate('signup')} 
                className="text-[#2563eb] font-bold hover:underline"
              >
                Register your school
              </button>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
