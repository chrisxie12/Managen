import React from 'react';

const Logo = ({ size = 36, className = "" }) => {
  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <div 
        className="relative flex items-center justify-center rounded-2xl overflow-hidden shadow-lg shadow-plum/10"
        style={{ width: size, height: size, background: 'linear-gradient(135deg, #381932 0%, #512b4a 100%)' }}
      >
        <svg 
          viewBox="0 0 24 24" 
          fill="none" 
          className="w-3/5 h-3/5 text-milk"
          stroke="currentColor" 
          strokeWidth="2.5" 
          strokeLinecap="round" 
          strokeLinejoin="round"
        >
          <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
          <path d="M6 12v5c3 3 9 3 12 0v-5" />
        </svg>
        <div className="absolute inset-0 bg-gradient-to-tr from-white/10 to-transparent pointer-events-none" />
      </div>
      <div className="flex flex-col leading-none">
        <span 
          className="text-lg font-black tracking-tight"
          style={{ fontFamily: "'Playfair Display', serif", color: 'var(--text-primary)' }}
        >
          School<span className="text-plum dark:text-milk">OS</span>
        </span>
        <span 
          className="text-[10px] font-bold uppercase tracking-widest opacity-60 mt-0.5"
          style={{ color: 'var(--text-muted)' }}
        >
          Institutional Node
        </span>
      </div>
    </div>
  );
};

export default Logo;

