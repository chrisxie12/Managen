import React from 'react';

interface CriticalBadgeProps {
  label?: string;
  count?: number;
}

export const CriticalBadge: React.FC<CriticalBadgeProps> = ({ label = 'CRITICAL' }) => {
  return (
    <span className="bg-red-500 text-white text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide">
      {label}
    </span>
  );
};
