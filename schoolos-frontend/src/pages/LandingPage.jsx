import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowUpRight, 
  Star, 
  Smartphone, 
  LayoutDashboard, 
  Users, 
  Wallet, 
  TrendingUp,
  CheckCircle2,
  Zap,
  Globe,
  Plus,
  ShieldCheck,
  Sparkles,
  BarChart3,
  Calendar,
  MessageSquare,
  ArrowRight,
  GraduationCap
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
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.2, delayChildren: 0.3 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
  };

  return (
    <div className="min-h-screen bg-white font-['DM_Sans',sans-serif] text-[#0F172A] overflow-x-hidden">
      <style>{`
        .hero-section {
          position: relative;
          background-image: url('${campusBg}');
          background-size: cover;
          background-position: center;
          border-radius: 0 0 40px 40px;
          overflow: visible;
        }

        @media (min-width: 1024px) {
          .hero-section {
            border-radius: 0 0 100px 100px;
          }
        }

        .hero-section::after {
          content: '';
          position: absolute; 
          inset: 0;
          background: linear-gradient(
            115deg,
            rgba(15, 23, 42, 0.92) 0%,
            rgba(15, 23, 42, 0.65) 45%,
            rgba(15, 23, 42, 0.2) 100%
          );
          z-index: 1;
          border-radius: 0 0 40px 40px;
        }

        @media (min-width: 1024px) {
          .hero-section::after {
            border-radius: 0 0 100px 100px;
          }
        }

        .hero-content {
          position: relative;
          z-index: 10;
        }

        .navbar {
          padding: 20px 16px;
          transition: all 0.6s cubic-bezier(0.16, 1, 0.3, 1);
          background: transparent;
        }

        @media (min-width: 1024px) {
          .navbar {
            padding: 32px 80px;
          }
        }

        .navbar.scrolled {
          padding: 12px 16px;
          background: rgba(255, 255, 255, 0.9);
          backdrop-filter: blur(20px) saturate(180%);
          border-bottom: 1px solid rgba(15, 23, 42, 0.05);
          box-shadow: 0 10px 30px -10px rgba(0,0,0,0.05);
        }

        @media (min-width: 1024px) {
          .navbar.scrolled {
            padding: 16px 80px;
          }
        }

        .premium-heading {
          font-family: 'Playfair Display', serif;
          letter-spacing: -0.04em;
          line-height: 1.1;
        }

        @media (min-width: 1024px) {
          .premium-heading {
            line-height: 0.9;
          }
        }

        .black-pill {
          background: #2D7DFA;
          color: #FFFFFF;
          border-radius: 99px;
          padding: 16px 32px;
          font-weight: 700;
          display: inline-flex;
          align-items: center;
          gap: 12px;
          transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
          box-shadow: 0 20px 40px -10px rgba(45, 125, 250, 0.4);
          font-size: 14px;
        }

        @media (min-width: 1024px) {
          .black-pill {
            padding: 20px 48px;
            font-size: 16px;
          }
        }

        .black-pill:hover {
          transform: translateY(-4px);
          box-shadow: 0 30px 60px -12px rgba(45, 125, 250, 0.5);
          background: #142FE8;
        }

        .glass-pill {
          background: rgba(255, 255, 255, 0.1) !important;
          backdrop-filter: blur(20px) !important;
          border: 1px solid rgba(255, 255, 255, 0.2) !important;
          border-radius: 99px;
          padding: 16px 32px;
          font-weight: 700;
          color: white !important;
          display: inline-flex;
          align-items: center;
          gap: 12px;
          transition: all 0.4s ease;
          font-size: 14px;
        }

        @media (min-width: 1024px) {
          .glass-pill {
            padding: 20px 48px;
            font-size: 16px;
          }
        }

        .glass-pill:hover {
          background: rgba(255, 255, 255, 0.2) !important;
          border-color: rgba(255, 255, 255, 0.4) !important;
        }

        .phone-frame {
          max-width: 380px;
          width: 100%;
          aspect-ratio: 380 / 780;
          background: #000;
          border-radius: 40px;
          padding: 8px;
          position: relative;
          box-shadow: 0 80px 160px -30px rgba(0,0,0,0.6);
          border: 8px solid #1f1f1f;
        }

        @media (min-width: 1024px) {
          .phone-frame {
            border-radius: 64px;
            padding: 12px;
            border: 12px solid #1f1f1f;
          }
        }

        .feature-card {
          background: #FFFFFF;
          border-radius: 32px;
          padding: 32px;
          border: 1px solid rgba(15, 23, 42, 0.05);
          transition: all 0.5s cubic-bezier(0.16, 1, 0.3, 1);
        }

        @media (min-width: 1024px) {
          .feature-card {
            border-radius: 40px;
            padding: 48px;
          }
        }

        .feature-card:hover {
          transform: translateY(-12px);
          box-shadow: 0 40px 80px -20px rgba(0,0,0,0.08);
          border-color: rgba(45, 125, 250, 0.15);
        }

        .nav-link {
          position: relative;
          font-weight: 600;
          font-size: 15px;
          color: rgba(255, 255, 255, 0.7) !important;
          transition: all 0.3s ease;
        }

        .navbar.scrolled .nav-link {
          color: #475569 !important;
        }

        .nav-link:hover {
          color: white !important;
        }

        .navbar.scrolled .nav-link:hover {
          color: #2D7DFA !important;
        }
      `}</style>

      {/* Navbar */}
      <nav className={`fixed top-0 left-0 right-0 z-[100] navbar ${scrolled ? 'scrolled' : ''}`}>
        <div className="flex items-center justify-between max-w-[1440px] mx-auto w-full px-4">
          <div className="flex items-center gap-16">
            <div className="flex items-center gap-3 group cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
               <div className="bg-blue-600 w-10 h-10 flex items-center justify-center rounded-xl shadow-lg shadow-blue-500/20">
                  <Sparkles className="text-white" size={20} />
               </div>
               <span className={`text-2xl font-black tracking-tight transition-colors ${scrolled ? 'text-[#0F172A]' : 'text-white'}`}>SchoolOS<span className="text-blue-400">.</span></span>
            </div>
            <div className="hidden lg:flex items-center gap-10">
               {['Platform', 'Modules', 'Pricing', 'Resources'].map(link => (
                 <a key={link} href="#" className="nav-link">{link}</a>
               ))}
            </div>
          </div>
          
          <div className="flex items-center gap-4 sm:gap-8">
            <button 
              onClick={() => onNavigate('login')} 
              className={`text-sm font-bold transition-colors hidden sm:block ${scrolled ? 'text-[#0F172A]' : 'text-white/80 hover:text-white'}`}
            >
              Log In
            </button>
            <button 
              onClick={() => onNavigate('signup')} 
              className={`rounded-full px-6 sm:px-8 py-2.5 sm:py-3.5 text-xs sm:text-sm font-black flex items-center gap-2 transition-all group ${
                scrolled 
                  ? 'bg-[#0F172A] text-white hover:bg-blue-600' 
                  : 'bg-white text-[#0F172A] hover:bg-blue-50'
              }`}
            >
              Get Started <ArrowUpRight size={18} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </button>
            
            <button 
              onClick={() => setMobileMenuOpen(true)}
              className={`p-2 lg:hidden transition-colors ${scrolled ? 'text-[#0F172A]' : 'text-white'}`}
            >
              <Menu size={24} />
            </button>
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
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed inset-0 z-[200] bg-white p-8 flex flex-col"
          >
            <div className="flex items-center justify-between mb-16">
              <div className="flex items-center gap-3">
                <div className="bg-blue-600 w-10 h-10 flex items-center justify-center rounded-xl shadow-lg">
                  <Sparkles className="text-white" size={20} />
                </div>
                <span className="text-2xl font-black tracking-tight text-[#0F172A]">SchoolOS.</span>
              </div>
              <button onClick={() => setMobileMenuOpen(false)} className="p-2 text-[#0F172A]">
                <Menu size={32} className="rotate-45" /> {/* Close button represented as rotated Menu icon */}
              </button>
            </div>

            <div className="flex flex-col gap-8 mb-auto">
              {['Platform', 'Modules', 'Pricing', 'Resources'].map(link => (
                <a 
                  key={link} 
                  href="#" 
                  className="text-4xl font-black tracking-tight text-[#0F172A] hover:text-blue-600 transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {link}
                </a>
              ))}
            </div>

            <div className="flex flex-col gap-4">
              <button 
                onClick={() => { onNavigate('login'); setMobileMenuOpen(false); }}
                className="w-full py-5 rounded-3xl bg-slate-100 text-[#0F172A] font-black text-lg"
              >
                Log In
              </button>
              <button 
                onClick={() => { onNavigate('signup'); setMobileMenuOpen(false); }}
                className="w-full py-5 rounded-3xl bg-[#0F172A] text-white font-black text-lg shadow-2xl"
              >
                Get Started
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hero Section */}
      <header className="hero-section min-h-screen pt-32 sm:pt-48 px-6 sm:px-10 pb-20 relative">
        <div className="max-w-[1400px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-16 items-center hero-content">
          
          {/* Left Content */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="lg:col-span-7"
          >
            <motion.div variants={itemVariants} className="inline-flex items-center gap-2 bg-blue-500/10 backdrop-blur-md px-4 py-2 rounded-full border border-blue-400/20 text-[12px] font-bold tracking-tight text-blue-400 mb-8">
               <Zap size={14} fill="currentColor" /> The standard in modern education management
            </motion.div>

            <motion.h1 variants={itemVariants} className="premium-heading text-[clamp(64px,8vw,120px)] font-[900] text-white mb-10">
              The OS for <br/>
              Modern <br/>
              <span className="text-blue-400">Schools.</span>
            </motion.h1>

            <motion.p variants={itemVariants} className="text-[20px] font-medium text-white/60 max-w-[580px] leading-relaxed mb-12">
              Transform your institution with an all-in-one ecosystem built for the next generation of academic excellence.
            </motion.p>

            <motion.div variants={itemVariants} className="flex flex-wrap items-center gap-6 mb-16">
              <button onClick={() => onNavigate('signup')} className="black-pill">
                Start Free Trial <ArrowRight size={20} />
              </button>
              <button className="glass-pill">
                Book Live Demo <ArrowUpRight size={20} />
              </button>
            </motion.div>

            <motion.div variants={itemVariants} className="flex items-center gap-12">
               <div className="flex items-center gap-4">
                  <div className="flex -space-x-3">
                    {[1, 2, 3, 4].map(i => (
                      <div key={i} className="w-12 h-12 rounded-full border-2 border-[#1e293b] bg-[#334155] flex items-center justify-center text-[12px] font-bold text-white">
                        {['JD', 'SM', 'AK', 'RL'][i-1]}
                      </div>
                    ))}
                  </div>
                  <div className="text-[14px] font-medium text-white/50">
                    <span className="text-white font-bold block">4.9/5 Rating</span>
                    from 2,500+ global schools
                  </div>
               </div>
            </motion.div>
          </motion.div>

          {/* Right Content - Split Panel Preview */}
          <div className="lg:col-span-5 relative h-full flex items-center justify-center lg:justify-end">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, x: 50 }}
              animate={{ opacity: 1, scale: 1, x: 0 }}
              transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
              className="relative w-full max-w-[450px]"
            >
              {/* Floating Performance Indicator */}
              <motion.div 
                animate={{ y: [0, -15, 0] }}
                transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }}
                className="absolute -left-12 top-1/4 bg-white p-6 rounded-[32px] shadow-2xl border border-slate-100 z-20 hidden md:block"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600">
                    <TrendingUp size={24} />
                  </div>
                  <div>
                    <div className="text-[24px] font-black text-[#0F172A] leading-none mb-1">98%</div>
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Efficiency</div>
                  </div>
                </div>
              </motion.div>

              <div className="phone-frame mx-auto lg:mr-0">
                <div className="dynamic-island" />
                <div className="phone-screen">
                    <div className="h-full flex flex-col bg-[#F8FAFC]">
                      <div className="p-8 pt-12 pb-6">
                        <div className="flex items-center justify-between mb-8">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-xl bg-[#2D7DFA] flex items-center justify-center text-white font-black text-lg">S</div>
                              <div>
                                  <div className="text-[10px] font-bold text-slate-400">Campus A</div>
                                  <div className="text-[12px] font-black">SchoolOS Int.</div>
                              </div>
                            </div>
                            <div className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center border border-slate-100">
                              <LayoutDashboard size={18} className="text-slate-600" />
                            </div>
                        </div>

                        <div className="bg-[#0F172A] p-8 rounded-[40px] text-white relative overflow-hidden group">
                            <div className="absolute right-[-20px] top-[-20px] w-32 h-32 bg-blue-500/10 rounded-full blur-2xl" />
                            <div className="text-[11px] font-bold uppercase tracking-widest opacity-40 mb-2">Term Revenue</div>
                            <div className="text-[32px] font-black tracking-tight mb-6">GHS 842K</div>
                            <div className="flex justify-between items-center">
                              <div className="flex items-center gap-2 text-[11px] font-bold text-emerald-400">
                                  <TrendingUp size={14} /> +18.2%
                              </div>
                              <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
                                <ArrowRight size={14} />
                              </div>
                            </div>
                        </div>
                      </div>

                      <div className="px-8 flex-1">
                        <div className="flex items-center justify-between mb-6">
                          <div className="text-[11px] font-black uppercase tracking-widest text-slate-400">Core Modules</div>
                          <div className="text-[10px] font-bold text-blue-600">View All</div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            {[
                              { label: 'Students', icon: Users, color: 'text-emerald-500', bg: 'bg-emerald-50' },
                              { label: 'Finances', icon: Wallet, color: 'text-blue-500', bg: 'bg-blue-50' },
                              { label: 'Exams', icon: BarChart3, color: 'text-amber-500', bg: 'bg-amber-50' },
                              { label: 'Attendance', icon: CheckCircle2, color: 'text-rose-500', bg: 'bg-rose-50' }
                            ].map((item, i) => (
                              <div key={i} className="bg-white p-5 rounded-[28px] border border-slate-100 shadow-sm hover:border-blue-200 transition-colors cursor-pointer group">
                                <div className={`${item.bg} ${item.color} w-12 h-12 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                                    <item.icon size={22} />
                                </div>
                                <div className="text-[13px] font-black tracking-tight">{item.label}</div>
                              </div>
                            ))}
                        </div>
                      </div>
                    </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </header>

      {/* Trust Section */}
      <section className="bg-slate-50 py-16 sm:py-24 border-y border-slate-100 overflow-hidden">
        <div className="max-w-[1400px] mx-auto px-6 sm:px-10">
          <p className="text-center text-[12px] font-black uppercase tracking-[0.3em] text-slate-400 mb-16">The gold standard for modern education management</p>
          <div className="flex flex-wrap justify-center items-center gap-x-24 gap-y-16">
             {[
               { icon: ShieldCheck, name: 'EDU-GOV' },
               { icon: GraduationCap, name: 'ACADEMIA' },
               { icon: Globe, name: 'GLOBAL-LEARN' },
               { icon: LayoutDashboard, name: 'SCHOOL-GRID' },
               { icon: Sparkles, name: 'VIRTUE-OS' }
             ].map((logo, i) => (
               <div key={i} className="flex items-center gap-3 opacity-40 grayscale hover:grayscale-0 hover:opacity-100 transition-all duration-500 cursor-default group">
                  <logo.icon size={28} className="text-[#0F172A] group-hover:text-blue-600 transition-colors" />
                  <span className="text-xl font-[900] tracking-tighter text-[#0F172A]">{logo.name}</span>
               </div>
             ))}
          </div>
        </div>
      </section>

      {/* Modules Grid */}
      <section className="max-w-[1400px] mx-auto px-6 sm:px-10 py-24 sm:py-48">
        <div className="text-center mb-16 sm:mb-32">
           <motion.div 
             initial={{ opacity: 0, y: 20 }}
             whileInView={{ opacity: 1, y: 0 }}
             className="inline-flex items-center gap-2 bg-blue-600 px-6 py-2.5 rounded-full text-[12px] font-black text-white shadow-xl shadow-blue-500/20 tracking-widest uppercase mb-10"
           >
              <Sparkles size={16} /> The Full Ecosystem
           </motion.div>
           <h2 className="premium-heading text-[clamp(48px,6vw,92px)] font-[900] text-[#0F172A] mb-10">
             Everything you need. <br/>
             <span className="text-blue-600/30 italic">None of the complexity.</span>
           </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
           {[
             { title: 'Student Lifecycle', desc: 'From admission to graduation, track every milestone with detailed profiles and AI insights.', icon: Users, color: 'emerald' },
             { title: 'Finance & Payroll', desc: 'Securely handle fee collection, automated invoicing, and full-scale payroll for faculty.', icon: Wallet, color: 'blue' },
             { title: 'Academic Hub', desc: 'Manage exams, results, and timetables with Conflict-Resolution technology.', icon: BarChart3, color: 'amber' },
             { title: 'Communication', desc: 'Centralized messaging for parents, teachers, and students with smart notifications.', icon: MessageSquare, color: 'rose' },
             { title: 'Reports & Analytics', desc: 'Real-time data visualization of school performance, attendance, and financial health.', icon: TrendingUp, color: 'indigo' },
             { title: 'Security & Auth', desc: 'Enterprise-grade security with role-based access control and encrypted data storage.', icon: ShieldCheck, color: 'slate' }
           ].map((m, i) => (
             <div key={i} className="feature-card group cursor-pointer relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-slate-50 rounded-bl-[80px] -mr-16 -mt-16 transition-all group-hover:bg-blue-50/50" />
                <div className={`w-16 h-16 bg-white shadow-xl rounded-2xl flex items-center justify-center mb-12 group-hover:scale-110 transition-all border border-slate-50 relative z-10`}>
                   <m.icon size={32} className="text-[#0F172A] group-hover:text-blue-600 transition-colors" />
                </div>
                <h3 className="text-2xl font-black mb-6 tracking-tight text-[#0F172A] relative z-10">{m.title}</h3>
                <p className="text-slate-500 font-medium leading-relaxed relative z-10">{m.desc}</p>
                <div className="mt-10 flex items-center gap-2 text-blue-600 font-black text-[12px] uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-all translate-y-4 group-hover:translate-y-0">
                  Explore Module <ArrowRight size={14} />
                </div>
             </div>
           ))}
        </div>
      </section>

      {/* Pricing Section */}
      <Pricing onNavigate={onNavigate} />

      {/* Final CTA & Footer Wrapper */}
      <div className="bg-[#0F172A] relative">
         {/* Transition Gradient */}
         <div className="absolute top-0 left-0 right-0 h-64 bg-gradient-to-b from-[#0F172A] to-transparent z-0" />
         
         <section className="max-w-[1440px] mx-auto px-6 sm:px-10 py-24 sm:py-40 relative z-10">
            <div className="bg-white/5 rounded-[40px] sm:rounded-[80px] p-10 sm:p-24 text-center text-white border border-white/5 relative overflow-hidden shadow-2xl">
               <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 to-transparent pointer-events-none" />
               <div className="relative z-10">
                 <h2 className="premium-heading text-[clamp(40px,5vw,72px)] font-[900] mb-16 text-white leading-tight">
                    Ready to redefine your <br/>
                    school's potential?
                 </h2>
                 <div className="flex flex-wrap items-center justify-center gap-8">
                    <button onClick={() => onNavigate('signup')} className="bg-[#2D7DFA] text-white rounded-full px-12 py-6 text-lg font-black hover:bg-blue-600 transition-all shadow-2xl shadow-blue-500/40">
                       Get Started Now
                    </button>
                    <button className="bg-white/10 backdrop-blur-md border border-white/10 text-white rounded-full px-12 py-6 text-lg font-black hover:bg-white/20 transition-all">
                       View Live Demo
                    </button>
                 </div>
               </div>
            </div>
         </section>

         <footer className="bg-[#0F172A] py-24 sm:py-32 px-6 sm:px-10 border-t border-white/5">
            <div className="max-w-[1400px] mx-auto">
               <div className="flex flex-col md:flex-row justify-between items-start gap-16 mb-24">
                  <div className="max-w-sm">
                     <div className="flex items-center gap-3 mb-8">
                       <div className="bg-[#2D7DFA] w-10 h-10 flex items-center justify-center rounded-xl shadow-lg">
                         <Sparkles className="text-white" size={20} />
                       </div>
                       <span className="text-2xl font-black tracking-tight text-white">SchoolOS.</span>
                     </div>
                     <p className="text-white/50 font-medium leading-relaxed mb-10">
                        The global standard for modern education management. Trusted by over 2,500 institutions worldwide.
                     </p>
                     <div className="flex gap-4">
                       {[Globe, Smartphone, MessageSquare].map((Icon, i) => (
                         <div key={i} className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white/30 hover:bg-blue-500 hover:text-white transition-all cursor-pointer">
                           <Icon size={18} />
                         </div>
                       ))}
                     </div>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-24">
                     <div>
                        <h4 className="font-black text-[12px] uppercase tracking-[0.2em] text-white mb-10">Platform</h4>
                        <ul className="space-y-5 text-white/40 font-bold text-sm">
                           <li><a href="#" className="hover:text-[#2D7DFA] transition-colors">Features</a></li>
                           <li><a href="#" className="hover:text-[#2D7DFA] transition-colors">Solutions</a></li>
                           <li><a href="#" className="hover:text-[#2D7DFA] transition-colors">Security</a></li>
                           <li><a href="#" className="hover:text-[#2D7DFA] transition-colors">Integrations</a></li>
                        </ul>
                     </div>
                     <div>
                        <h4 className="font-black text-[12px] uppercase tracking-[0.2em] text-white mb-10">Company</h4>
                        <ul className="space-y-5 text-white/40 font-bold text-sm">
                           <li><a href="#" className="hover:text-[#2D7DFA] transition-colors">About Us</a></li>
                           <li><a href="#" className="hover:text-[#2D7DFA] transition-colors">Contact</a></li>
                           <li><a href="#" className="hover:text-[#2D7DFA] transition-colors">Support</a></li>
                           <li><a href="#" className="hover:text-[#2D7DFA] transition-colors">Careers</a></li>
                        </ul>
                     </div>
                  </div>
               </div>
               <div className="pt-12 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-8 text-[11px] font-bold text-white/20 uppercase tracking-[0.2em]">
                  <div>© 2026 SchoolOS Ecosystem. All Rights Reserved.</div>
                  <div className="flex gap-12">
                     <a href="#" className="hover:text-[#2D7DFA] transition-colors">Privacy</a>
                     <a href="#" className="hover:text-[#2D7DFA] transition-colors">Terms</a>
                     <a href="#" className="hover:text-[#2D7DFA] transition-colors">Cookies</a>
                  </div>
               </div>
            </div>
         </footer>
      </div>
    </div>

  );
};

export default LandingPage;
