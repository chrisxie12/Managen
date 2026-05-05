import React from 'react';
import { GlassCard } from './GlassCard';

export const StatCard = ({ label, value, trend, icon }) => {
  const isPositive = trend?.startsWith('+');
  
  return (
    <GlassCard className="flex flex-col group overflow-hidden relative">
      <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full -mr-12 -mt-12 blur-2xl group-hover:bg-primary/10 transition-colors" />
      
      <div className="flex justify-between items-start relative z-10 mb-4">
        <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 text-xl shadow-inner">
          {icon}
        </div>
        {trend && (
          <div className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-black tracking-wide uppercase
            ${isPositive ? 'bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400' : 'bg-rose-500/10 text-rose-600 dark:bg-rose-500/20 dark:text-rose-400'}`}>
            {isPositive ? '↑' : '↓'} {trend.split(' ')[0]}
          </div>
        )}
      </div>

      <div className="relative z-10">
        <p className="text-sm font-bold text-slate-500 dark:text-slate-400 mb-1">{label}</p>
        <h3 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
          {value}
        </h3>
        {trend && (
          <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-2 font-bold uppercase tracking-widest">
            {trend.split(' ').slice(1).join(' ')}
          </p>
        )}
      </div>
    </GlassCard>
  );
};
