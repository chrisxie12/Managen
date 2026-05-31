"use client";
import { ReactNode } from "react";

interface PhoneMockupProps {
  children?: ReactNode;
  width?: number;
  className?: string;
  screenContent?: ReactNode;
}

export default function PhoneMockup({ children, width = 280, className = "", screenContent }: PhoneMockupProps) {
  return (
    <div
      className={`relative flex-shrink-0 ${className}`}
      style={{
        width,
        background: "#0B0F1C",
        borderRadius: 48,
        padding: 12,
        boxShadow: "0 25px 60px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.08)",
      }}
    >
      {/* Dynamic Island */}
      <div
        style={{
          position: "absolute",
          top: 18,
          left: "50%",
          transform: "translateX(-50%)",
          width: 120,
          height: 30,
          background: "#0B0F1C",
          borderRadius: 30,
          zIndex: 10,
        }}
      />
      {/* Screen */}
      <div
        style={{
          background: "white",
          borderRadius: 38,
          overflow: "hidden",
          minHeight: width * 2.1,
          position: "relative",
        }}
      >
        {screenContent || children}
      </div>
    </div>
  );
}
