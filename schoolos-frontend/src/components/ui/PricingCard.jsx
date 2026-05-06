import React from 'react';
import { Check } from 'lucide-react';
import { motion } from 'framer-motion';

const PricingCard = ({ 
  plan = "Pro Plan", 
  price = "$29", 
  period = "/month", 
  description = "Perfect for scaling your next big project.", 
  features = ['Unlimited Projects', 'Custom Domains', '24/7 Support', 'Advanced Analytics'],
  isPopular = true,
  onSelect
}) => {
  return (
    <div className="group relative aspect-[3/4] w-full max-w-sm transition-all duration-500 hover:scale-[1.05]">
      {/* OUTER GLOW BLOOM */}
      <div className="absolute -inset-2 rounded-[40px] bg-gradient-to-r from-[#142FE8] via-[#ec4899] to-[#8b5cf6] opacity-0 blur-2xl transition-opacity duration-500 group-hover:opacity-20" />
      
      {/* MASK CONTAINER */}
      <div className="relative h-full w-full overflow-hidden rounded-[32px] bg-zinc-900 p-[2px]">
        
        {/* ROTATING LIQUID GRADIENT */}
        <div className="absolute inset-[-1000%] animate-[border-spin_8s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,#142FE8_0%,#ec4899_25%,#8b5cf6_50%,#ec4899_75%,#142FE8_100%)] group-hover:animate-[border-spin_4s_linear_infinite]" />

        {/* INNER CONTENT CARD */}
        <div className="relative flex h-full w-full flex-col justify-between rounded-[30px] bg-zinc-950/95 p-8 backdrop-blur-xl">
          {/* Subtle Glassmorphism Tint */}
          <div className="absolute inset-0 rounded-[30px] bg-white/5 pointer-events-none" />

          <div className="relative z-10">
            {isPopular && (
              <div className="mb-6 inline-block rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-[10px] font-black uppercase tracking-[0.2em] text-white">
                Most Popular
              </div>
            )}
            
            <h3 className="text-2xl font-black text-white tracking-tight uppercase font-headings">{plan}</h3>
            <p className="mt-2 text-sm font-medium text-zinc-400 leading-relaxed">{description}</p>
            
            <div className="mt-8 flex items-baseline gap-2">
              <span className="text-5xl font-black tracking-tighter text-white">{price}</span>
              <span className="text-xs font-bold uppercase tracking-widest text-zinc-500">{period}</span>
            </div>

            <div className="my-8 h-[1px] w-full bg-white/5" />

            <ul className="space-y-4">
              {features.map((feature) => (
                <li key={feature} className="flex items-center gap-3 text-sm font-medium text-zinc-300">
                  <div className="flex h-5 w-5 items-center justify-center rounded-full bg-[#142FE8]/10 text-[#142FE8]">
                    <Check size={14} strokeWidth={3} />
                  </div>
                  {feature}
                </li>
              ))}
            </ul>
          </div>

          <button 
            onClick={onSelect}
            className="relative z-10 mt-10 w-full overflow-hidden rounded-2xl bg-white px-6 py-4 text-sm font-black uppercase tracking-[0.2em] text-black transition-all hover:bg-zinc-200 active:scale-[0.98] shadow-lg"
          >
            Get Started Now
          </button>
        </div>
      </div>
    </div>
  );
};

export default PricingCard;

