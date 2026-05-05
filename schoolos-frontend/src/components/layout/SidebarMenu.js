import React from 'react';
import { Button } from '../ui/Button';

export const SidebarMenu = ({ activeItem, onSelect, role }) => {
  const adminItems = [
    { id: 'dashboard', icon: '📊', label: 'Dashboard' },
    { id: 'students', icon: '🎓', label: 'Students' },
    { id: 'teachers', icon: '👨‍🏫', label: 'Teachers' },
    { id: 'billing', icon: '💳', label: 'Payments' },
    { id: 'settings', icon: '⚙️', label: 'Settings' },
  ];
  
  const items = role === 'admin' ? adminItems : adminItems.slice(0, 3);

  return (
    <nav className="flex flex-col gap-1 p-6 w-72 bg-slate-100/30 dark:bg-slate-900/40 border-r border-slate-200/50 dark:border-slate-800/50 h-screen sticky top-0 flex-shrink-0 backdrop-blur-xl">
      <div className="px-4 py-8 mb-10">
        <h2 className="text-2xl font-black tracking-tighter text-slate-900 dark:text-white flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
            <span className="text-lg">S</span>
          </div>
          <span className="tracking-tight">School<span className="text-indigo-600">OS</span></span>
        </h2>
      </div>

      <div className="flex flex-col gap-1.5 flex-1 px-1">
        {items.map(item => (
          <button
            key={item.id}
            onClick={() => onSelect(item.id)}
            className={`nav-item ${activeItem === item.id ? 'nav-item-active' : ''}`}
          >
            <span className={`text-xl transition-transform duration-300 ${activeItem === item.id ? 'scale-110' : 'opacity-60'}`}>{item.icon}</span>
            <span className="tracking-tight">{item.label}</span>
          </button>
        ))}
      </div>
      
      <div className="mt-auto p-6 bg-white/40 dark:bg-slate-800/40 border border-slate-200/50 dark:border-slate-700/50 rounded-[2rem] backdrop-blur-md">
        <h4 className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] mb-4">Subscription</h4>
        <div className="flex justify-between items-end mb-3">
          <span className="text-sm font-black text-slate-800 dark:text-slate-100">Trial Plan</span>
          <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30 px-2 py-0.5 rounded-full uppercase">28 Days</span>
        </div>
        <div className="w-full bg-slate-200/50 dark:bg-slate-700/50 rounded-full h-2 mb-6">
          <div className="bg-gradient-to-r from-indigo-600 to-violet-600 h-2 rounded-full shadow-[0_0_10px_rgba(79,70,229,0.3)]" style={{ width: '45%' }}></div>
        </div>
        <Button variant="primary" className="w-full text-[11px] py-3 uppercase tracking-[0.1em] shadow-none">
          Upgrade Now
        </Button>
      </div>
    </nav>
  );
};
