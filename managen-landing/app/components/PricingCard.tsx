"use client";
import { Check } from "lucide-react";
import { useState } from "react";

interface PricingCardProps {
  name: string;
  price: string;
  period: string;
  features: string[];
  ctaText: string;
  featured?: boolean;
  badge?: string;
}

export default function PricingCard({ name, price, period, features, ctaText, featured = false, badge }: PricingCardProps) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      className="relative flex flex-col rounded-2xl p-8 bg-white transition-all duration-300 cursor-pointer"
      style={{
        border: featured ? "2px solid #D4FF00" : "1px solid #E5E7EB",
        boxShadow: hovered
          ? "0 16px 48px rgba(0,0,0,0.12)"
          : featured
          ? "0 8px 32px rgba(212,255,0,0.15)"
          : "0 2px 8px rgba(0,0,0,0.04)",
        transform: hovered ? "translateY(-4px)" : "translateY(0)",
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {badge && (
        <div
          className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 text-xs font-bold uppercase tracking-wide rounded-full"
          style={{
            background: "#D4FF00",
            color: "#0B0F1C",
            animation: "pulseBadge 2s ease-in-out infinite",
            boxShadow: "0 0 12px rgba(212,255,0,0.5)",
          }}
        >
          {badge}
        </div>
      )}

      <div className="mb-6">
        <div className="text-sm font-semibold uppercase tracking-wide text-gray-500 mb-3">{name}</div>
        <div className="flex items-baseline gap-1">
          <span className="text-4xl font-bold text-[#0B0F1C]">{price}</span>
          {period && <span className="text-sm text-gray-400">{period}</span>}
        </div>
      </div>

      <ul className="flex-1 space-y-3 mb-8">
        {features.map((feature, i) => (
          <li key={i} className="flex items-start gap-2.5 text-sm text-gray-600">
            <Check size={16} className="text-[#0B4F30] flex-shrink-0 mt-0.5" strokeWidth={2.5} />
            {feature}
          </li>
        ))}
      </ul>

      <button
        className="w-full rounded-xl py-3.5 text-sm font-bold transition-all duration-200"
        style={
          featured
            ? {
                background: "#D4FF00",
                color: "#0B0F1C",
                boxShadow: "0 4px 16px rgba(212,255,0,0.35)",
              }
            : {
                background: "transparent",
                color: "#0B0F1C",
                border: "1.5px solid #E5E7EB",
              }
        }
      >
        {ctaText}
      </button>
    </div>
  );
}
