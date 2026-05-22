import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface TrendBadgeProps {
  value: number; // Percentage change
  label?: string; // e.g., 'vs last month'
}

export const TrendBadge: React.FC<TrendBadgeProps> = ({ value, label }) => {
  const isPositive = value > 0;
  const isNeutral = value === 0;
  
  const colorClass = isNeutral 
    ? 'text-gray-500 bg-gray-50' 
    : isPositive 
      ? 'text-green-600 bg-green-50' 
      : 'text-red-600 bg-red-50';
      
  const Icon = isNeutral ? Minus : isPositive ? TrendingUp : TrendingDown;

  return (
    <div className="flex items-center gap-1.5">
      <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold ${colorClass}`}>
        <Icon className="w-3 h-3" />
        {Math.abs(value)}%
      </span>
      {label && <span className="text-[10px] text-gray-400">{label}</span>}
    </div>
  );
};
