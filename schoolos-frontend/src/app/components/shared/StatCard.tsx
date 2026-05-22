import React from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface StatCardProps {
  title: string;
  value: string | React.ReactNode;
  subtitle?: string | React.ReactNode;
  icon?: React.ReactNode;
  borderColorClass?: string; // e.g., 'border-l-teal-500'
  trend?: React.ReactNode;
  footer?: React.ReactNode;
  badge?: React.ReactNode;
  onClick?: () => void;
  className?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon,
  borderColorClass = 'border-l-gray-300',
  trend,
  footer,
  badge,
  onClick,
  className
}) => {
  return (
    <div 
      onClick={onClick}
      className={cn(
        "bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all duration-150 p-5 flex flex-col relative overflow-hidden",
        borderColorClass ? `border-l-4 ${borderColorClass}` : '',
        onClick ? 'cursor-pointer hover:-translate-y-0.5' : '',
        className
      )}
    >
      {badge && <div className="absolute top-4 right-4">{badge}</div>}
      
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-[11px] font-bold uppercase tracking-widest text-gray-400 mb-1">
            {title}
          </h3>
          <div className="flex items-end gap-3">
            <span className="text-2xl font-bold text-gray-900 font-mono tracking-tight">
              {value}
            </span>
            {trend && <div className="mb-1">{trend}</div>}
          </div>
        </div>
        {icon && (
          <div className="w-10 h-10 rounded-full flex items-center justify-center bg-gray-50 text-gray-600 shrink-0">
            {icon}
          </div>
        )}
      </div>

      {(subtitle || footer) && (
        <div className="mt-auto pt-4 border-t border-gray-100 flex flex-col gap-2">
          {subtitle && <div className="text-xs text-gray-500">{subtitle}</div>}
          {footer && <div>{footer}</div>}
        </div>
      )}
    </div>
  );
};
