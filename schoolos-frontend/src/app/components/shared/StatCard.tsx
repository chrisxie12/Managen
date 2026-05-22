import { useNavigate } from 'react-router';

interface StatCardProps {
  bg: string;
  label: string;
  value: string;
  icon: string;
  subtitle?: string;
  badge?: { text: string; color: string; pulsing?: boolean };
  href?: string;
  onClick?: () => void;
  loading?: boolean;
}

export function StatCard({ bg, label, value, icon, subtitle, badge, href, onClick, loading }: StatCardProps) {
  const navigate = useNavigate();
  const handleClick = onClick || (href ? () => navigate(href) : undefined);

  if (loading) {
    return (
      <div
        className="rounded-lg p-4 animate-pulse flex flex-col justify-between min-h-[110px] cursor-pointer"
        style={{ backgroundColor: bg, opacity: 0.5 }}
      >
        <div className="flex justify-between items-start">
          <div className="w-8 h-8 rounded-full bg-white/20" />
          <div className="w-6 h-6 rounded-full bg-white/20" />
        </div>
        <div className="space-y-2 mt-3">
          <div className="h-6 w-16 bg-white/20 rounded" />
          <div className="h-3 w-24 bg-white/20 rounded" />
        </div>
      </div>
    );
  }

  return (
    <div
      onClick={handleClick}
      className="rounded-lg p-4 flex flex-col justify-between min-h-[110px] cursor-pointer transition-all duration-200 hover:brightness-110 hover:scale-[1.02] relative overflow-hidden"
      style={{ backgroundColor: bg }}
    >
      {badge && (
        <span
          className={`absolute top-2 right-2 text-[9px] font-bold uppercase px-1.5 py-0.5 rounded-full z-10 ${badge.pulsing ? 'animate-pulse' : ''}`}
          style={{ backgroundColor: badge.color, color: 'white' }}
        >
          {badge.text}
        </span>
      )}
      <div className="flex justify-between items-start">
        <span className="text-[10px] uppercase font-semibold text-white/80 tracking-wider">
          {label}
        </span>
        <span className="text-[16px] leading-none flex-shrink-0 ml-2 mt-1">
          <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-white/20 text-white">
            {icon}
          </span>
        </span>
      </div>
      <div className="mt-1">
        <div className="text-[28px] font-bold leading-tight text-white" style={{ fontFamily: "'DM Mono', monospace" }}>
          {value}
        </div>
        {subtitle && (
          <div className="text-[11px] text-white/70 mt-0.5">
            {subtitle}
          </div>
        )}
      </div>
    </div>
  );
}
