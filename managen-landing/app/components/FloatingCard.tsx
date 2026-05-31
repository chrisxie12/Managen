"use client";

interface FloatingCardProps {
  icon: string;
  text: string;
  subtext?: string;
  delay?: number;
  className?: string;
}

export default function FloatingCard({ icon, text, subtext, delay = 0, className = "" }: FloatingCardProps) {
  return (
    <div
      className={`flex items-center gap-2 bg-white rounded-xl px-3 py-2.5 text-sm font-medium shadow-lg border border-gray-100 ${className}`}
      style={{
        animation: `bob 3s ease-in-out infinite ${delay}s`,
        color: "#0B4F30",
        zIndex: 20,
      }}
    >
      <span className="text-base">{icon}</span>
      <div>
        <div className="text-xs font-semibold text-[#0B4F30]">{text}</div>
        {subtext && <div className="text-[10px] text-gray-500">{subtext}</div>}
      </div>
    </div>
  );
}
