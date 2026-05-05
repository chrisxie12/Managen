import React from 'react';

export const Badge = ({ children, type = 'default' }) => {
  const styles = {
    default: 'bg-slate-100/80 text-slate-700 border-slate-200/50',
    success: 'bg-emerald-100/80 text-emerald-700 border-emerald-200/50',
    warning: 'bg-amber-100/80 text-amber-700 border-amber-200/50',
    danger: 'bg-rose-100/80 text-rose-700 border-rose-200/50',
    primary: 'bg-sky-100/80 text-sky-700 border-sky-200/50',
  };
  return (
    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border backdrop-blur-md ${styles[type]}`}>
      {children}
    </span>
  );
};
