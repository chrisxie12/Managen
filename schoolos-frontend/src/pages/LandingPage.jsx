import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowUpRight, Zap, CheckCircle2, Users, Wallet, BarChart3, 
  ShieldCheck, Globe, Smartphone, Menu, X, Activity, 
  ArrowRight, TrendingUp, MessageSquare, Lock, Star, Layout
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
        .glass-nav { background: rgba(255, 255, 255, 0.8); backdrop-filter: blur(20px) saturate(180%); }
        .bento-card { transition: all 0.5s cubic-bezier(0.16, 1, 0.3, 1); }
        .bento-card:hover { transform: translateY(-8px); box-shadow: 0 40px 80px -20px rgba(0,0,0,0.08); }
      `}</style>

      {/* Navbar */}
      <nav className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-500 ${scrolled ? 'glass-nav py-4 border-b border-slate-100 shadow-sm' : 'py-8'}`}>
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          <div className="flex items-center gap-10">
            <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
              <div className="w-9 h-9 bg-[#0F172A] rounded-xl flex items-center justify-center shadow-md overflow-hidden">
                <img src={logo} alt="S" className="w-6 h-6 object-contain brightness-0 invert" />
              </div>
              <span className="text-xl font-black tracking-tighter">SchoolOS.</span>
            </div>
            <div className="hidden lg:flex items-center gap-8">
              {['Features', 'Pricing', 'Demo'].map(l => (
                <a key={l} href={`#${l.toLowerCase()}`} className="text-sm font-bold text-slate-500 hover:text-black transition-colors">{l}</a>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button onClick={() => onNavigate('login')} className="hidden sm:block text-sm font-bold text-slate-600 hover:text-black px-4 transition-colors">Log In</button>
            <button onClick={() => onNavigate('signup')} className="bg-[#0F172A] text-white px-7 py-3 rounded-full text-sm font-bold hover:bg-black/90 transition-all active:scale-95 shadow-xl shadow-black/10">Start Free Trial</button>
            <button className="lg:hidden p-2 text-slate-900" onClick={() => setMobileMenuOpen(true)}><Menu size={24} /></button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div initial={{ opacity: 0, x: '100%' }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: '100%' }} className="fixed inset-0 z-[200] bg-white p-8 flex flex-col">
            <div className="flex items-center justify-between mb-16">
               <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 bg-[#0F172A] rounded-xl flex items-center justify-center"><img src={logo} alt="S" className="w-6 h-6 brightness-0 invert" /></div>
                  <span className="text-xl font-black tracking-tighter">SchoolOS.</span>
               </div>
               <button onClick={() => setMobileMenuOpen(false)}><X size={32} /></button>
            </div>
            <div className="flex flex-col gap-8 mb-auto">
               {['Features', 'Pricing', 'Demo'].map(link => (
                 <a key={link} href="#" className="text-4xl font-black tracking-tight" onClick={() => setMobileMenuOpen(false)}>{link}</a>
               ))}
            </div>
            <div className="flex flex-col gap-4">
               <button onClick={() => onNavigate('login')} className="w-full py-5 rounded-3xl bg-slate-100 font-black text-[#0F172A]">Log In</button>
               <button onClick={() => onNavigate('signup')} className="w-full py-5 rounded-3xl bg-[#0F172A] text-white font-black">Start Free Trial</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hero */}
      <header className="pt-48 pb-24 px-6 relative overflow-hidden">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
          <motion.div initial="hidden" animate="visible" variants={{ visible: { transition: { staggerChildren: 0.1 } } }}>
            <motion.h1 variants={fadeInUp} className="text-[clamp(48px,6vw,84px)] font-[900] leading-[0.95] mb-8 tracking-tighter">
              Manage your school <br/> without spreadsheets <br/> or stress.
            </motion.h1>
            <motion.p variants={fadeInUp} className="text-lg text-slate-500 font-medium max-w-[480px] leading-relaxed mb-10">
              Automate student records, fee collection, and terminal reports in one seamless workspace. Built for the future of African education.
            </motion.p>
            <motion.div variants={fadeInUp} className="flex flex-wrap gap-4">
              <button onClick={() => onNavigate('signup')} className="bg-[#0F172A] text-white px-9 py-4.5 rounded-full font-black shadow-2xl shadow-black/20 hover:bg-black/90 transition-all">
                Start 14-Day Free Trial
              </button>
              <button className="bg-slate-50 border border-slate-100 px-9 py-4.5 rounded-full font-black text-slate-700 hover:bg-slate-100 transition-all">
                Watch Product Tour
              </button>
            </motion.div>
          </motion.div>
          <motion.div initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 1 }} className="relative">
            <div className="rounded-[40px] border border-slate-100 bg-white p-3 shadow-2xl overflow-hidden">
               <img src={campusBg} alt="Dashboard Preview" className="rounded-[28px] w-full h-auto" />
            </div>
          </motion.div>
        </div>
      </header>

      {/* Trust Strip */}
      <section className="py-20 border-y border-slate-100 bg-slate-50/50">
        <div className="max-w-7xl mx-auto px-6">
          <p className="text-center text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 mb-12">Built for Africa • Supports WAEC & BECE • Trusted Security</p>
          <div className="flex flex-wrap justify-center items-center gap-x-20 gap-y-12 opacity-30 grayscale contrast-125">
            <div className="flex items-center gap-3"><ShieldCheck size={32} /><span className="text-xl font-black">WAEC & BECE</span></div>
            <div className="flex items-center gap-3"><Wallet size={32} /><span className="text-xl font-black">PAYSTACK</span></div>
            <div className="flex items-center gap-3"><Activity size={32} /><span className="text-xl font-black">FLUTTERWAVE</span></div>
          </div>
        </div>
      </section>

      {/* Value Cards */}
      <section className="py-32 px-6 max-w-7xl mx-auto">
        <div className="grid md:grid-cols-3 gap-12">
           {[
             { title: '2,500+ schools', desc: 'The gold standard for private institutions in GH & NG.', icon: Star },
             { title: '30% Recovery', desc: 'Automated tracking reduces fee leakage instantly.', icon: TrendingUp },
             { title: 'Bank-Grade Security', desc: 'Encryption and tenant isolation for every school.', icon: Lock },
           ].map((v, i) => (
             <div key={i} className="text-center group">
                <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-8 transition-transform group-hover:scale-110">
                   <v.icon size={28} className="text-[#0F172A]" />
                </div>
                <h3 className="text-xl font-black mb-4">{v.title}</h3>
                <p className="text-slate-500 text-sm font-medium leading-relaxed">{v.desc}</p>
             </div>
           ))}
        </div>
      </section>

      {/* The Comparison */}
      <section className="py-32 px-6 bg-slate-50">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-20">
           <div className="p-12 rounded-[48px] bg-white border border-rose-50 shadow-sm relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-rose-50 rounded-full blur-[60px] -mr-10 -mt-10" />
              <h3 className="text-2xl font-black text-rose-600 mb-6">The Chaos</h3>
              <p className="text-xl font-medium text-slate-400 leading-relaxed">Manual paperwork, unread SMS, and hidden revenue leaks hold you back.</p>
           </div>
           <div className="p-12 rounded-[48px] bg-[#0F172A] text-white shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/20 rounded-full blur-[60px] -mr-10 -mt-10" />
              <h3 className="text-2xl font-black text-blue-400 mb-6">The Clarity</h3>
              <p className="text-xl font-medium text-white/60 leading-relaxed">One-click reports, automated WhatsApp reminders, and 100% financial transparency—powered by SchoolOS.</p>
           </div>
        </div>
      </section>

      {/* Bento Grid */}
      <section id="features" className="py-32 px-6 max-w-7xl mx-auto">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
           {[
             { title: 'Academics', desc: 'AI-powered terminal reports (WAEC/BECE compliant).', icon: BarChart3 },
             { title: 'Finance', desc: 'Automated fee tracking via USSD & Bank Transfer.', icon: Wallet },
             { title: 'WhatsApp Node', desc: 'Direct result delivery to parents via WhatsApp.', icon: MessageSquare },
             { title: 'Smart Attendance', desc: 'Instant arrivals/departure alerts.', icon: Smartphone },
             { title: 'Staff Payroll', desc: 'Automated NGN/GHS payroll with local tax logic.', icon: Wallet },
             { title: 'Security', desc: 'Bank-grade encryption and tenant isolation.', icon: Lock },
           ].map((f, i) => (
             <div key={i} className="bento-card p-10 rounded-[40px] bg-white border border-slate-100">
                <div className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center mb-8"><f.icon size={24} /></div>
                <h3 className="text-lg font-black mb-4">{f.title}</h3>
                <p className="text-slate-500 text-sm font-medium leading-relaxed">{f.desc}</p>
             </div>
           ))}
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-32 px-6 bg-slate-50">
        <div className="max-w-7xl mx-auto text-center mb-24">
           <h2 className="text-[clamp(40px,5vw,64px)] font-[900] tracking-tight">Surgical Pricing</h2>
           <p className="text-slate-400 font-bold mt-4">No credit card required. Pay in GHS/NGN.</p>
        </div>
        <div className="max-w-5xl mx-auto grid md:grid-cols-3 gap-8">
           {[
             { name: 'Starter', price: 'Free', desc: 'Up to 50 students, basic CRM, core security.' },
             { name: 'Pro', price: 'GHS 999', desc: 'Advanced finance, WhatsApp nodes, full integrations.', active: true },
             { name: 'Enterprise', price: 'Custom', desc: 'Full suite, white-glove onboarding, local support.' },
           ].map((p, i) => (
             <div key={i} className={`p-10 rounded-[40px] bg-white border transition-all ${p.active ? 'border-[#0F172A] shadow-2xl scale-105 z-10' : 'border-slate-100 shadow-sm'}`}>
                <h3 className="text-lg font-black mb-2">{p.name}</h3>
                <div className="text-4xl font-black mb-6">{p.price}<span className="text-sm text-slate-400 font-bold">/mo</span></div>
                <p className="text-slate-500 text-sm font-medium mb-10 h-12">{p.desc}</p>
                <button onClick={() => onNavigate('signup')} className={`w-full py-4 rounded-full font-black transition-all ${p.active ? 'bg-[#0F172A] text-white hover:bg-black' : 'bg-slate-50 text-slate-700 hover:bg-slate-100'}`}>Get Started</button>
             </div>
           ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="py-32 px-6 border-t border-slate-100">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-20">
           <div className="col-span-2">
              <div className="flex items-center gap-2.5 mb-8">
                 <div className="w-9 h-9 bg-[#0F172A] rounded-xl flex items-center justify-center"><img src={logo} alt="S" className="w-6 h-6 brightness-0 invert" /></div>
                 <span className="text-xl font-black tracking-tighter">SchoolOS.</span>
              </div>
              <p className="text-slate-500 text-sm font-medium max-w-xs">Built for the future of institutional management. High-precision tools for academic excellence.</p>
           </div>
           <div>
              <h4 className="font-black text-[10px] uppercase tracking-widest text-slate-400 mb-8">Platform</h4>
              <ul className="space-y-4 text-sm font-bold text-slate-600">
                 <li><a href="#" className="hover:text-black">Dashboard</a></li>
                 <li><a href="#" className="hover:text-black">Result Engine</a></li>
                 <li><a href="#" className="hover:text-black">Admissions</a></li>
              </ul>
           </div>
           <div>
              <h4 className="font-black text-[10px] uppercase tracking-widest text-slate-400 mb-8">Company</h4>
              <ul className="space-y-4 text-sm font-bold text-slate-600">
                 <li><a href="#" className="hover:text-black">About</a></li>
                 <li><a href="#" className="hover:text-black">Pricing</a></li>
                 <li><a href="#" className="hover:text-black">Contact</a></li>
              </ul>
           </div>
        </div>
        <div className="max-w-7xl mx-auto mt-24 pt-12 border-t border-slate-50 text-center">
           <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">© 2026 SchoolOS. Built for Africa.</p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
