import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, X, ArrowUpRight, Sparkles, BookOpen, School, Building2, ShieldCheck } from 'lucide-react';

const Pricing = () => {
  const [billingCycle, setBillingCycle] = useState('monthly');

  const plans = [
    {
      name: "Trial",
      icon: BookOpen,
      price: 0,
      period: "/ 7 days",
      desc: "Full access to all premium features for 7 days, no credit card required.",
      features: [
        { name: "Up to 50 students", included: true },
        { name: "Core modules (Students, Attendance)", included: true },
        { name: "Basic dashboard", included: true },
        { name: "SMS/Email notifications", included: true },
        { name: "Results & Exams", included: true }
      ],
      cta: "Start 7-Day Trial",
      variant: "outline"
    },
    {
      name: "Basic",
      icon: School,
      price: 299,
      period: "/ mo",
      desc: "Great for small schools getting started with digital management.",
      features: [
        { name: "Up to 200 students", included: true },
        { name: "Students, Attendance, Fees", included: true },
        { name: "Email notifications", included: true },
        { name: "Results & Exams", included: true },
        { name: "SMS notifications", included: false }
      ],
      cta: "Get Basic",
      variant: "outline"
    },
    {
      name: "Standard",
      icon: Building2,
      price: 599,
      period: "/ mo",
      desc: "The complete solution for growing institutions.",
      features: [
        { name: "Up to 1,000 students", included: true },
        { name: "All modules unlocked", included: true },
        { name: "SMS + Email notifications", included: true },
        { name: "PDF report card exports", included: true },
        { name: "Priority support", included: true }
      ],
      cta: "Get Standard",
      variant: "primary",
      popular: true
    },
    {
      name: "Premium",
      icon: ShieldCheck,
      price: 999,
      period: "/ mo",
      desc: "Enterprise-grade for large schools and school networks.",
      features: [
        { name: "Unlimited students", included: true },
        { name: "Everything in Standard", included: true },
        { name: "Multi-branch management", included: true },
        { name: "Dedicated account manager", included: true },
        { name: "Custom integrations & API", included: true }
      ],
      cta: "Get Premium",
      variant: "outline"
    }
  ];

  return (
    <section className="bg-[#0f172a] py-32 px-6 lg:px-10 overflow-hidden font-['DM_Sans',sans-serif]">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;700;900&family=Playfair+Display:ital,wght@1,700&display=swap');
        
        .playfair { font-family: 'Playfair Display', serif; }
        
        .pricing-toggle-bg {
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.08);
        }
        
        .card-shadow {
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
        }

        .pricing-card {
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid rgba(255, 255, 255, 0.05);
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .pricing-card:hover {
          background: rgba(255, 255, 255, 0.04);
          border-color: rgba(255, 255, 255, 0.1);
          transform: translateY(-8px);
        }

        .pricing-card.popular {
          background: #2563eb;
          border-color: #3b82f6;
          box-shadow: 0 20px 40px -10px rgba(37, 99, 235, 0.3);
        }
        
        .pricing-card.popular:hover {
          background: #1d4ed8;
          transform: translateY(-8px);
        }
      `}</style>

      <div className="max-w-[1400px] mx-auto">
        {/* Header */}
        <div className="text-center mb-24">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 bg-[#1e293b] border border-white/10 px-6 py-2 rounded-full text-[11px] font-black uppercase tracking-[0.2em] text-blue-400 mb-10"
          >
            <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-pulse" />
            Simple, Transparent Pricing
          </motion.div>

          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-6xl lg:text-7xl font-[900] text-white mb-8 tracking-tighter"
          >
            Plans for every <span className="playfair italic text-[#f97316]">school.</span>
          </motion.h2>

          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-white/40 text-lg font-medium max-w-2xl mx-auto mb-16 leading-relaxed"
          >
            Start free, scale as you grow. No hidden fees, no surprises — just powerful school management.
          </motion.p>

          {/* Toggle */}
          <div className="flex items-center justify-center gap-6 mb-8">
            <span className={`text-sm font-bold tracking-tight transition-colors ${billingCycle === 'monthly' ? 'text-white' : 'text-white/40'}`}>Monthly</span>
            <button 
              onClick={() => setBillingCycle(billingCycle === 'monthly' ? 'annual' : 'monthly')}
              className="w-16 h-8 rounded-full p-1 pricing-toggle-bg relative transition-colors"
            >
              <motion.div 
                animate={{ x: billingCycle === 'monthly' ? 0 : 32 }}
                className="w-6 h-6 bg-blue-500 rounded-full shadow-lg"
              />
            </button>
            <div className="flex items-center gap-3">
              <span className={`text-sm font-bold tracking-tight transition-colors ${billingCycle === 'annual' ? 'text-white' : 'text-white/40'}`}>Annual</span>
              <motion.span 
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ repeat: Infinity, duration: 2 }}
                className="bg-[#f97316] text-white text-[10px] font-black uppercase px-2.5 py-1 rounded-full tracking-wider"
              >
                Save 20%
              </motion.span>
            </div>
          </div>
        </div>

        {/* Pricing Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch">
          {plans.map((plan, i) => {
            const annualPrice = Math.round(plan.price * 0.8);
            const savings = (plan.price - annualPrice) * 12;

            return (
              <motion.div
                key={plan.name}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className={`pricing-card relative rounded-[32px] p-10 flex flex-col ${plan.popular ? 'popular' : ''}`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-[#f97316] text-white text-[11px] font-black uppercase px-6 py-2 rounded-full tracking-widest shadow-xl">
                    Most Popular
                  </div>
                )}

                {/* Icon & Label */}
                <div className="mb-10">
                  <div className={`w-14 h-14 ${plan.popular ? 'bg-white/20 text-white' : 'bg-blue-500/10 text-blue-500'} rounded-2xl flex items-center justify-center mb-6 shadow-inner`}>
                    <plan.icon size={28} />
                  </div>
                  <div className={`text-[13px] font-black uppercase tracking-[0.2em] mb-2 ${plan.popular ? 'text-white/60' : 'text-white/40'}`}>
                    {plan.name}
                  </div>
                </div>

                {/* Price */}
                <div className="mb-8 min-h-[140px]">
                  <div className="flex items-baseline gap-2">
                    <span className={`text-xl font-bold ${plan.popular ? 'text-white' : 'text-white'}`}>GHS</span>
                    <span className={`text-6xl font-[900] tracking-tighter ${plan.popular ? 'text-white' : 'text-white'}`}>
                      {billingCycle === 'annual' ? annualPrice : plan.price}
                    </span>
                    <span className={`text-sm font-medium ${plan.popular ? 'text-white/60' : 'text-white/30'}`}>
                      {billingCycle === 'annual' ? '/ mo, billed annually' : '/ mo'}
                    </span>
                  </div>

                  <AnimatePresence mode="wait">
                    {billingCycle === 'annual' && plan.price > 0 && (
                      <motion.div
                        initial={{ opacity: 0, height: 0, y: -10 }}
                        animate={{ opacity: 1, height: 'auto', y: 0 }}
                        exit={{ opacity: 0, height: 0, y: -10 }}
                        className="mt-4 overflow-hidden"
                      >
                        <div className="flex items-center gap-2 text-[13px] font-bold">
                          <span className="text-white/30 line-through">GHS {plan.price}</span>
                          <span className="text-emerald-400">· 🟢 Save GHS {savings.toLocaleString()} / yr</span>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <p className={`text-[13px] font-medium leading-relaxed mt-6 h-12 overflow-hidden ${plan.popular ? 'text-white/80' : 'text-white/40'}`}>
                    {plan.desc}
                  </p>
                </div>

              {/* Features */}
              <div className="space-y-5 flex-1 mb-12">
                {plan.features.map((feat, idx) => (
                  <div key={idx} className="flex items-start gap-4">
                    <div className={`mt-0.5 w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${
                      feat.included 
                        ? (plan.popular ? 'bg-white/20 text-white' : 'bg-emerald-500/10 text-emerald-500')
                        : 'bg-white/5 text-white/10'
                    }`}>
                      {feat.included ? <Check size={12} strokeWidth={4} /> : <X size={12} strokeWidth={4} />}
                    </div>
                    <span className={`text-[13px] font-bold tracking-tight ${
                      feat.included 
                        ? (plan.popular ? 'text-white' : 'text-white/80')
                        : 'text-white/20 line-through decoration-white/10'
                    }`}>
                      {feat.name}
                    </span>
                  </div>
                ))}
              </div>

              {/* CTA */}
              <button className={`w-full py-5 rounded-[20px] text-sm font-black tracking-widest uppercase transition-all active:scale-[0.98] ${
                plan.variant === 'primary'
                  ? 'bg-white text-blue-600 shadow-xl shadow-black/10 hover:shadow-2xl'
                  : 'bg-white/5 text-white border border-white/10 hover:bg-white/10'
              }`}>
                {plan.cta}
              </button>
            </motion.div>
          );
        })}
      </div>

        {/* Footer info */}
        <div className="text-center mt-20">
          <p className="text-white/20 text-sm font-bold tracking-tight">
            All plans include a <span className="text-blue-400">7-day money-back guarantee</span> · No credit card required for Trial · Cancel anytime
          </p>
        </div>
      </div>
    </section>
  );
};

export default Pricing;
