import React from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface StatCardProps {
  title?: string;
  label?: string;
  value: string | React.ReactNode;
  subtitle?: string | React.ReactNode;
  subValue?: string;
  icon?: React.ReactNode;
  borderColorClass?: string;
  bg?: string;
  trend?: React.ReactNode;
  trendValue?: string;
  footer?: React.ReactNode;
  badge?: React.ReactNode;
  onClick?: () => void;
  href?: string;
  className?: string;
  loading?: boolean;
  type?: string;
  sparklineData?: number[];
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  label,
  value,
  subtitle,
  subValue,
  icon,
  borderColorClass = 'border-l-gray-300',
  bg,
  trend,
  footer,
  badge,
  onClick,
  href,
  className,
  loading,
}) => {
  const heading = title || label || '';
  const handleClick = onClick || (href ? () => { window.location.href = href; } : undefined);
  return (
    <div
      onClick={handleClick}
      className={cn(
        "bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all duration-150 p-5 flex flex-col relative overflow-hidden",
        borderColorClass ? `border-l-4 ${borderColorClass}` : '',
        (onClick || href) ? 'cursor-pointer hover:-translate-y-0.5' : '',
        className
      )}
      style={bg ? { background: bg } : undefined}
    >
      {badge && <div className="absolute top-4 right-4">{badge}</div>}

      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-[11px] font-bold uppercase tracking-widest text-gray-400 mb-1">
            {heading}
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

      {loading && (
        <div className="absolute inset-0 bg-white/70 flex items-center justify-center rounded-xl">
          <div className="w-5 h-5 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
        </div>
      )}

      {((subtitle || subValue) || footer) && (
        <div className="mt-auto pt-4 border-t border-gray-100 flex flex-col gap-2">
          {(subtitle || subValue) && <div className="text-xs text-gray-500">{subtitle || subValue}</div>}
          {footer && <div>{footer}</div>}
        </div>
      )}
    </div>
  );
};
