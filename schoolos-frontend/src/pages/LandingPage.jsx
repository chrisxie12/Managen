import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowUpRight, Zap, CheckCircle2, Users, Wallet, BarChart3, 
  ShieldCheck, Globe, Smartphone, Menu, X, Activity, 
  ArrowRight, TrendingUp, MessageSquare, Lock, Star
} from 'lucide-react';
import logo from '../assets/app-logo.png';
import campusBg from '../assets/campus-bg.png';
import Pricing from '../components/Pricing';

const LandingPage = ({ onNavigate }) => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
  };

  return (
    <div className="min-h-screen bg-white font-['DM_Sans',sans-serif] text-[#0F172A] overflow-x-hidden">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;700;900&family=Playfair+Display:ital,wght@1,700&display=swap');
        .playfair { font-family: 'Playfair Display', serif; }
        .glass-nav { background: rgba(255, 255, 255, 0.7); backdrop-filter: blur(20px) saturate(180%); }
        .bento-card { transition: all 0.5s cubic-bezier(0.16, 1, 0.3, 1); }
        .bento-card:hover { transform: translateY(-8px); box-shadow: 0 40px 80px -20px rgba(0,0,0,0.08); }
      `}</style>

      {/* Navbar */}
      <nav className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-500 ${scrolled ? 'glass-nav py-4 border-b border-slate-100 shadow-sm' : 'py-8'}`}>
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          <div className="flex items-center gap-10">
            <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
              <div className="w-9 h-9 bg-white rounded-xl flex items-center justify-center shadow-md border border-slate-100 overflow-hidden">
                <img src={logo} alt="S" className="w-6 h-6 object-contain mix-blend-multiply" />
              </div>
              <span className="text-xl font-black tracking-tighter">SchoolOS.</span>
            </div>
            <div className="hidden lg:flex items-center gap-8">
              {['Platform', 'Features', 'Pricing'].map(l => (
                <a key={l} href={`#${l.toLowerCase()}`} className="text-sm font-bold text-slate-500 hover:text-blue-600 transition-colors">{l}</a>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button onClick={() => onNavigate('login')} className="hidden sm:block text-sm font-bold text-slate-600 hover:text-blue-600 px-4 transition-colors">Log In</button>
            <button onClick={() => onNavigate('signup')} className="bg-[#0F172A] text-white px-7 py-3 rounded-full text-sm font-bold hover:bg-blue-600 transition-all active:scale-95 shadow-xl shadow-black/10">Get Started</button>
            <button className="lg:hidden p-2 text-slate-900" onClick={() => setMobileMenuOpen(true)}><Menu size={24} /></button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, x: '100%' }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: '100%' }}
            className="fixed inset-0 z-[200] bg-white p-8 flex flex-col"
          >
            <div className="flex items-center justify-between mb-16">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-lg border border-slate-100 overflow-hidden">
                  <img src={logo} alt="S" className="w-7 h-7 object-contain mix-blend-multiply" />
                </div>
                <span className="text-2xl font-black tracking-tight">SchoolOS.</span>
              </div>
              <button onClick={() => setMobileMenuOpen(false)} className="p-2 text-slate-900"><X size={32} /></button>
            </div>
            <div className="flex flex-col gap-8 mb-auto">
              {['Platform', 'Features', 'Pricing'].map(link => (
                <a key={link} href={`#${link.toLowerCase()}`} className="text-4xl font-black tracking-tight hover:text-blue-600 transition-colors" onClick={() => setMobileMenuOpen(false)}>{link}</a>
              ))}
            </div>
            <div className="flex flex-col gap-4">
              <button onClick={() => { onNavigate('login'); setMobileMenuOpen(false); }} className="w-full py-5 rounded-3xl bg-slate-100 text-[#0F172A] font-black text-lg">Log In</button>
              <button onClick={() => { onNavigate('signup'); setMobileMenuOpen(false); }} className="w-full py-5 rounded-3xl bg-[#0F172A] text-white font-black text-lg">Get Started</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hero */}
      <header id="platform" className="pt-44 pb-24 px-6 relative overflow-hidden">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
          <motion.div initial="hidden" animate="visible" variants={{ visible: { transition: { staggerChildren: 0.1 } } }}>
            <motion.div variants={fadeInUp} className="inline-flex items-center gap-2 bg-blue-50 text-blue-600 px-4 py-1.5 rounded-full text-[11px] font-black uppercase tracking-widest mb-8">
              <Zap size={14} fill="currentColor" /> The Standard in Modern Education
            </motion.div>
            <motion.h1 variants={fadeInUp} className="playfair italic text-[clamp(50px,7vw,88px)] font-[900] leading-[0.9] mb-8 tracking-tighter">
              Stop drowning <br/> in tabs. Start <br/> <span className="text-blue-600 not-italic">Winning.</span>
            </motion.h1>
            <motion.p variants={fadeInUp} className="text-lg text-slate-500 font-medium max-w-[480px] leading-relaxed mb-10">
              Transform your institution with an all-in-one student workspace built for the next generation of academic excellence.
            </motion.p>
            <motion.div variants={fadeInUp} className="flex flex-wrap gap-4">
              <button onClick={() => onNavigate('signup')} className="bg-blue-600 text-white px-9 py-4.5 rounded-2xl font-black shadow-2xl shadow-blue-500/30 hover:bg-blue-700 transition-all flex items-center gap-3">
                Start Free Trial <ArrowRight size={20} />
              </button>
              <button className="bg-white border border-slate-200 px-9 py-4.5 rounded-2xl font-black text-slate-700 hover:bg-slate-50 transition-all">Watch Demo</button>
            </motion.div>
          </motion.div>
          <motion.div initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 1 }} className="relative">
            <div className="rounded-[40px] border border-slate-100 bg-white p-3 shadow-2xl overflow-hidden">
               <img src={campusBg} alt="Dashboard Preview" className="rounded-[28px] w-full h-auto" />
            </div>
            <motion.div animate={{ y: [0, -15, 0] }} transition={{ repeat: Infinity, duration: 5 }} className="absolute -left-8 top-1/4 bg-white p-5 rounded-3xl shadow-xl border border-slate-50 hidden xl:block">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600"><TrendingUp size={20} /></div>
                <div>
                  <div className="text-xl font-black text-[#0F172A]">98%</div>
                  <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Efficiency</div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </header>

      {/* Trust Strip */}
      <div className="py-16 border-y border-slate-100 bg-slate-50/40">
        <div className="max-w-7xl mx-auto px-6">
          <p className="text-center text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 mb-10">Trusted by 2,500+ Institutions across Africa</p>
          <div className="flex flex-wrap justify-center items-center gap-x-20 gap-y-10 opacity-30 grayscale contrast-125">
            {[ShieldCheck, Globe, Activity, Star, Users].map((Icon, i) => (
              <div key={i} className="flex items-center gap-2.5">
                <Icon size={28} /> <span className="text-lg font-black tracking-tighter">PARTNER NODE</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Feature Grid */}
      <section id="features" className="py-32 px-6 max-w-7xl mx-auto">
        <div className="text-center mb-24">
          <h2 className="text-[11px] font-black uppercase tracking-[0.3em] text-blue-600 mb-6">The Full Ecosystem</h2>
          <p className="playfair italic text-[clamp(36px,5vw,64px)] font-[900] tracking-tight leading-none">Everything you need. <span className="text-slate-300">Simplified.</span></p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[
            { title: 'Academic Hub', desc: 'Auto-generate terminal reports and track grades with Conflict-Resolution tech.', icon: BarChart3 },
            { title: 'Fee Engine', desc: 'Instant USSD and Card payments with automated reminder logic.', icon: Wallet },
            { title: 'WhatsApp Node', desc: 'Send results and reminders directly to parents where they actually see them.', icon: MessageSquare },
            { title: 'Student CRM', desc: '360° lifecycle tracking from enrollment to alumni graduation.', icon: Users },
            { title: 'Smart Attendance', desc: 'Instant safe-campus notifications to parents on student arrival.', icon: Smartphone },
            { title: 'Enterprise Security', desc: 'Bank-grade 256-bit encryption and role-based access control.', icon: Lock }
          ].map((f, i) => (
            <div key={i} className="bento-card p-10 rounded-[40px] bg-white border border-slate-100 hover:border-blue-100">
              <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center mb-8 group-hover:bg-blue-600">
                <f.icon size={28} className="text-[#0F172A]" />
              </div>
              <h3 className="text-xl font-black mb-5 tracking-tight">{f.title}</h3>
              <p className="text-slate-500 text-sm font-medium leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Killer Feature Highlight */}
      <section className="py-24 px-6 mx-6 lg:mx-12 rounded-[56px] bg-[#0F172A] text-white relative overflow-hidden">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-20 items-center relative z-10">
          <div>
            <h2 className="playfair italic text-6xl font-[900] mb-8 leading-[1.1]">Revenue on <br/><span className="text-blue-400">Autopilot.</span></h2>
            <p className="text-lg text-white/50 leading-relaxed mb-10">Stop chasing paper receipts. Recover 30% more fees in your first term with our automated financial engine.</p>
            <div className="grid gap-5">
              {['Instant USSD Support', 'Automatic Defaulter Lock', 'Real-time GHS/NGN Tracking'].map(t => (
                <div key={t} className="flex items-center gap-3.5 font-bold text-white/90">
                  <CheckCircle2 size={22} className="text-blue-400" /> {t}
                </div>
              ))}
            </div>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-[40px] p-10 backdrop-blur-3xl shadow-2xl">
             <div className="flex items-center justify-between mb-10 border-b border-white/5 pb-8">
                <div className="text-[10px] font-black uppercase tracking-widest text-blue-400">Term Balance</div>
                <div className="text-3xl font-black tracking-tighter">GHS 124,500</div>
             </div>
             <div className="space-y-4">
                {[1, 2].map(i => (
                  <div key={i} className="h-14 bg-white/5 rounded-2xl border border-white/5 flex items-center px-6 justify-between">
                    <div className="w-7 h-7 rounded-full bg-blue-500/20" />
                    <div className="w-1/3 h-2 bg-white/10 rounded-full" />
                    <div className="w-16 h-2 bg-emerald-500/20 rounded-full" />
                  </div>
                ))}
             </div>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <div id="pricing">
        <Pricing onNavigate={onNavigate} />
      </div>

      {/* Footer */}
      <footer className="py-24 px-6 border-t border-slate-100">
        <div className="max-w-7xl mx-auto grid md:grid-cols-4 gap-16">
          <div className="col-span-2">
            <div className="flex items-center gap-2.5 mb-8">
               <div className="w-9 h-9 bg-white rounded-xl flex items-center justify-center shadow-md border border-slate-100 overflow-hidden">
                 <img src={logo} alt="S" className="w-6 h-6 object-contain mix-blend-multiply" />
               </div>
               <span className="text-xl font-black tracking-tighter">SchoolOS.</span>
            </div>
            <p className="text-slate-500 text-sm font-medium leading-relaxed max-w-xs">The operating system for modern African schools. Precision tools for academic excellence and sustainable growth.</p>
          </div>
          <div>
            <h4 className="font-black text-[10px] uppercase tracking-widest text-slate-400 mb-8">Platform</h4>
            <ul className="space-y-4 text-sm font-bold text-slate-600">
              <li><a href="#" className="hover:text-blue-600">Results</a></li>
              <li><a href="#" className="hover:text-blue-600">Finances</a></li>
              <li><a href="#" className="hover:text-blue-600">Security</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-black text-[10px] uppercase tracking-widest text-slate-400 mb-8">Company</h4>
            <ul className="space-y-4 text-sm font-bold text-slate-600">
              <li><a href="#" className="hover:text-blue-600">Pricing</a></li>
              <li><a href="#" className="hover:text-blue-600">Privacy</a></li>
              <li><a href="#" className="hover:text-blue-600">Support</a></li>
            </ul>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
