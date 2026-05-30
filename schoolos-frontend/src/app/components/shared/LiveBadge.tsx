import React from 'react';

interface LiveBadgeProps {
  text?: string;
}

export const LiveBadge: React.FC<LiveBadgeProps> = ({ text = "LIVE" }) => {
  return (
    <span className="flex items-center gap-1.5 bg-red-50 px-2 py-1 rounded-full border border-red-100">
      <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
      <span className="text-[10px] font-bold text-red-600 tracking-wider">{text}</span>
    </span>
  );
};
