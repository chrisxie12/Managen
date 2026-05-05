import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowUpRight, 
  Zap, 
  CheckCircle2, 
  Users, 
  Wallet, 
  BarChart3, 
  ShieldCheck, 
  Globe, 
  Smartphone, 
  Menu, 
  X,
  Activity,
  ArrowRight,
  TrendingUp,
  MessageSquare,
  Lock
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

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.2, delayChildren: 0.3 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
  };

  return (
    <div className="min-h-screen bg-white font-['DM_Sans',sans-serif] text-[#0F172A] overflow-x-hidden">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;700;900&family=Playfair+Display:ital,wght@1,700&display=swap');
        .playfair { font-family: 'Playfair Display', serif; }
        .glass { background: rgba(255, 255, 255, 0.8); backdrop-filter: blur(20px) saturate(180%); }
        .hero-gradient { background: radial-gradient(circle at top right, rgba(45, 125, 250, 0.08), transparent 40%), radial-gradient(circle at bottom left, rgba(45, 125, 250, 0.05), transparent 40%); }
        .phone-frame { position: relative; width: 100%; max-width: 800px; margin: 0 auto; z-index: 10; }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>

      {/* Navbar */}
      <nav className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-500 ${scrolled ? 'glass py-4 shadow-sm border-b border-slate-100' : 'py-8'}`}>
        <div className="max-w-[1440px] mx-auto px-6 lg:px-12 flex items-center justify-between">
          <div className="flex items-center gap-12">
            <div className="flex items-center gap-3 cursor-pointer group" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
              <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-lg border border-slate-100 overflow-hidden group-hover:scale-110 transition-transform">
                <img src={logo} alt="S" className="w-7 h-7 object-contain mix-blend-multiply" />
              </div>
              <span className="text-2xl font-black tracking-tighter">SchoolOS<span className="text-blue-500">.</span></span>
            </div>
            <div className="hidden lg:flex items-center gap-8">
              {['Platform', 'Features', 'Pricing', 'Resources'].map(link => (
                <a key={link} href={`#${link.toLowerCase()}`} className="text-sm font-bold text-slate-500 hover:text-blue-600 transition-colors">{link}</a>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button onClick={() => onNavigate('login')} className="hidden sm:block text-sm font-bold text-slate-600 hover:text-blue-600 px-4">Log In</button>
            <button onClick={() => onNavigate('signup')} className="bg-[#0F172A] text-white px-8 py-3 rounded-full text-sm font-bold shadow-xl shadow-black/10 hover:bg-blue-600 transition-all active:scale-95">Get Started</button>
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
              <button onClick={() => setMobileMenuOpen(false)} className="p-2"><X size={32} /></button>
            </div>
            <div className="flex flex-col gap-8 mb-auto">
              {['Platform', 'Features', 'Pricing', 'Resources'].map(link => (
                <a key={link} href="#" className="text-4xl font-black tracking-tight hover:text-blue-600 transition-colors" onClick={() => setMobileMenuOpen(false)}>{link}</a>
              ))}
            </div>
            <div className="flex flex-col gap-4">
              <button onClick={() => { onNavigate('login'); setMobileMenuOpen(false); }} className="w-full py-5 rounded-3xl bg-slate-100 text-[#0F172A] font-black text-lg">Log In</button>
              <button onClick={() => { onNavigate('signup'); setMobileMenuOpen(false); }} className="w-full py-5 rounded-3xl bg-[#0F172A] text-white font-black text-lg">Get Started</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hero Section */}
      <header className="pt-48 pb-32 px-6 lg:px-12 hero-gradient relative">
        <div className="max-w-[1440px] mx-auto grid lg:grid-cols-2 gap-20 items-center">
          <motion.div variants={containerVariants} initial="hidden" animate="visible">
            <motion.div variants={itemVariants} className="inline-flex items-center gap-2 bg-blue-50 text-blue-600 px-4 py-2 rounded-full text-[11px] font-black uppercase tracking-widest mb-8">
              <Zap size={14} fill="currentColor" /> The Standard in Modern Education
            </motion.div>
            <motion.h1 variants={itemVariants} className="playfair italic text-[clamp(56px,8vw,96px)] font-[900] leading-[0.95] mb-10 tracking-tighter">
              Stop drowning <br/>
              in tabs. Start <br/>
              <span className="text-blue-600 not-italic">Winning.</span>
            </motion.h1>
            <motion.p variants={itemVariants} className="text-xl text-slate-500 font-medium max-w-[540px] leading-relaxed mb-12">
              Transform your institution with an all-in-one student workspace built for the next generation of academic excellence.
            </motion.p>
            <motion.div variants={itemVariants} className="flex flex-wrap gap-6">
              <button onClick={() => onNavigate('signup')} className="bg-blue-600 text-white px-10 py-5 rounded-2xl font-black shadow-2xl shadow-blue-500/30 hover:bg-blue-700 transition-all active:scale-95 flex items-center gap-3">
                Start Free Trial <ArrowRight size={20} />
              </button>
              <button className="bg-white border border-slate-200 px-10 py-5 rounded-2xl font-black text-slate-700 hover:bg-slate-50 transition-all">
                Watch Demo
              </button>
            </motion.div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, x: 100, scale: 0.9 }} 
            animate={{ opacity: 1, x: 0, scale: 1 }} 
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
            className="relative"
          >
            <div className="rounded-[48px] overflow-hidden shadow-[0_80px_160px_-40px_rgba(0,0,0,0.15)] border border-slate-100 bg-white p-4">
              <img src={campusBg} alt="Dashboard Preview" className="rounded-[36px] w-full" />
            </div>
            <motion.div animate={{ y: [0, -20, 0] }} transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }} className="absolute -left-12 top-1/4 bg-white p-6 rounded-[32px] shadow-2xl z-20 hidden xl:block border border-slate-50">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600"><TrendingUp size={24} /></div>
                <div>
                  <div className="text-2xl font-black tracking-tight text-[#0F172A]">98%</div>
                  <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Efficiency</div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </header>

      {/* Trust Strip */}
      <section className="py-20 border-y border-slate-100 bg-slate-50/50 overflow-hidden">
        <div className="max-w-[1440px] mx-auto px-6">
          <p className="text-center text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 mb-12">Trusted by 2,500+ Institutions Worldwide</p>
          <div className="flex flex-wrap justify-center items-center gap-x-20 gap-y-12 opacity-30 grayscale">
            {[ShieldCheck, Globe, Activity, Layout, Users].map((Icon, i) => (
              <div key={i} className="flex items-center gap-3">
                <Icon size={32} />
                <span className="text-xl font-black tracking-tighter">PARTNER NODE</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Feature Grid */}
      <section id="features" className="py-32 px-6 lg:px-12 max-w-[1440px] mx-auto">
        <div className="text-center mb-24">
          <h2 className="text-[11px] font-black uppercase tracking-[0.3em] text-blue-600 mb-6">Unrivaled Power</h2>
          <p className="playfair italic text-[clamp(40px,5vw,72px)] font-[900] tracking-tight leading-none">The ecosystem for growth.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {[
            { title: 'Academic Hub', desc: 'Auto-generate terminal reports and track grades with AI insights.', icon: BarChart3 },
            { title: 'Fee Engine', desc: 'Instant USSD and Card payments with automated reminder logic.', icon: Wallet },
            { title: 'Student CRM', desc: '360° student lifecycle tracking from enrollment to graduation.', icon: Users },
            { title: 'Smart Attendance', desc: 'Instant SMS notifications to parents for safe campus tracking.', icon: Smartphone },
            { title: 'Library Node', desc: 'Full digital cataloging and automated late-return management.', icon: Globe },
            { title: 'Pro Security', desc: 'Enterprise-grade encryption and role-based access control.', icon: Lock }
          ].map((f, i) => (
            <motion.div 
              key={i} 
              whileHover={{ y: -12 }} 
              className="p-12 rounded-[40px] bg-white border border-slate-100 shadow-sm hover:shadow-2xl transition-all duration-500 group"
            >
              <div className="w-16 h-16 bg-slate-50 rounded-3xl flex items-center justify-center mb-10 group-hover:bg-blue-600 group-hover:text-white transition-all">
                <f.icon size={32} />
              </div>
              <h3 className="text-2xl font-black mb-6 tracking-tight">{f.title}</h3>
              <p className="text-slate-500 font-medium leading-relaxed">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Killer Feature Highlight */}
      <section className="py-32 px-6 lg:px-12 bg-[#0F172A] text-white rounded-[64px] mx-6 lg:mx-12 my-20 overflow-hidden relative">
        <div className="absolute top-0 right-0 w-1/2 h-full bg-blue-600/10 blur-[120px] rounded-full -mr-32" />
        <div className="max-w-[1440px] mx-auto grid lg:grid-cols-2 gap-24 items-center relative z-10">
          <div>
            <h2 className="playfair italic text-6xl font-[900] mb-8 leading-tight">Revenue on <br/><span className="text-blue-400">Autopilot.</span></h2>
            <p className="text-xl text-white/60 leading-relaxed mb-12">Stop chasing paper receipts. Recover 30% more fees in your first term with our automated financial engine.</p>
            <div className="space-y-6">
              {['Instant USSD Support', 'Automatic Defaulter Lock', 'Bank-Grade Sync'].map(item => (
                <div key={item} className="flex items-center gap-4 text-lg font-bold">
                  <CheckCircle2 className="text-blue-400" size={24} /> {item}
                </div>
              ))}
            </div>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-[40px] p-10 backdrop-blur-3xl shadow-2xl">
             <div className="flex items-center justify-between mb-10">
                <span className="text-xs font-black uppercase tracking-widest text-blue-400">Term Balance</span>
                <span className="text-3xl font-black">GHS 124K</span>
             </div>
             <div className="space-y-4">
                {[1, 2, 3].map(i => (
                  <div key={i} className="h-16 bg-white/5 rounded-2xl border border-white/5 flex items-center px-6 justify-between">
                    <div className="w-8 h-8 rounded-full bg-blue-500/20" />
                    <div className="w-32 h-2 bg-white/10 rounded-full" />
                    <div className="w-16 h-2 bg-emerald-500/20 rounded-full" />
                  </div>
                ))}
             </div>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <Pricing onNavigate={onNavigate} />

      {/* Footer */}
      <footer className="bg-white py-32 px-6 lg:px-12 border-t border-slate-100">
        <div className="max-w-[1440px] mx-auto grid md:grid-cols-4 gap-20">
          <div className="col-span-2">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-lg border border-slate-100 overflow-hidden">
                <img src={logo} alt="S" className="w-7 h-7 object-contain mix-blend-multiply" />
              </div>
              <span className="text-2xl font-black tracking-tighter">SchoolOS.</span>
            </div>
            <p className="text-slate-500 font-medium leading-relaxed max-w-sm">The operating system for modern African schools. Precision tools for academic excellence and growth.</p>
          </div>
          <div>
            <h4 className="font-black text-[10px] uppercase tracking-[0.2em] text-slate-400 mb-8">Platform</h4>
            <ul className="space-y-4 text-sm font-bold text-slate-600">
              <li><a href="#" className="hover:text-blue-600 transition-colors">Results</a></li>
              <li><a href="#" className="hover:text-blue-400 transition-colors">Fees</a></li>
              <li><a href="#" className="hover:text-blue-400 transition-colors">Staff</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-black text-[10px] uppercase tracking-[0.2em] text-slate-400 mb-8">Resources</h4>
            <ul className="space-y-4 text-sm font-bold text-slate-600">
              <li><a href="#" className="hover:text-blue-600 transition-colors">Docs</a></li>
              <li><a href="#" className="hover:text-blue-400 transition-colors">Pricing</a></li>
              <li><a href="#" className="hover:text-blue-400 transition-colors">Help</a></li>
            </ul>
          </div>
        </div>
      </footer>
    </div>
  );
};

const Layout = ({ children }) => <div className="flex items-center gap-2">{children}</div>;

export default LandingPage;
