"use client";
import { useEffect, useState } from "react";
import { Menu, X, Zap } from "lucide-react";

const NAV_LINKS = [
  { label: "Features", href: "#features" },
  { label: "Pricing", href: "#pricing" },
  { label: "FAQ", href: "#faq" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 24);
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);

  return (
    <>
      <nav
        className="fixed top-0 left-0 right-0 z-50 transition-all duration-500"
        style={{
          height: 72,
          background: scrolled ? "rgba(11,15,28,0.96)" : "transparent",
          backdropFilter: scrolled ? "blur(20px) saturate(180%)" : "none",
          borderBottom: scrolled ? "1px solid rgba(255,255,255,0.06)" : "none",
          boxShadow: scrolled ? "0 4px 32px rgba(0,0,0,0.3)" : "none",
        }}
      >
        <div className="max-w-[1200px] mx-auto px-6 h-full flex items-center justify-between">
          {/* Logo */}
          <a href="#" className="flex items-center gap-2.5 no-underline group">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm transition-all duration-200 group-hover:scale-105"
              style={{ background: "#D4FF00", color: "#0B0F1C", fontFamily: "'Space Grotesk', sans-serif" }}
            >
              M
            </div>
            <span className="text-lg font-semibold text-white" style={{ fontFamily: "'Space Grotesk', sans-serif", letterSpacing: "-0.01em" }}>
              Managen
            </span>
          </a>

          {/* Desktop links */}
          <div className="hidden md:flex items-center gap-8">
            {NAV_LINKS.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="text-sm font-medium no-underline transition-all duration-200 relative group"
                style={{ color: "rgba(255,255,255,0.65)" }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "white")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.65)")}
              >
                {link.label}
                <span className="absolute -bottom-0.5 left-0 w-0 h-px bg-[#D4FF00] transition-all duration-200 group-hover:w-full" />
              </a>
            ))}
          </div>

          {/* Desktop CTA */}
          <div className="hidden md:flex items-center gap-3">
            <a href="#pricing" className="text-sm font-medium no-underline" style={{ color: "rgba(255,255,255,0.6)" }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "white")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.6)")}>
              Sign in
            </a>
            <button
              className="flex items-center gap-2 text-sm font-bold rounded-xl transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
              style={{
                background: "#D4FF00",
                color: "#0B0F1C",
                padding: "10px 20px",
                boxShadow: "0 0 0 0 rgba(212,255,0,0)",
              }}
              onMouseEnter={(e) => { e.currentTarget.style.boxShadow = "0 4px 20px rgba(212,255,0,0.4)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.boxShadow = "0 0 0 0 rgba(212,255,0,0)"; }}
            >
              <Zap size={14} strokeWidth={2.5} />
              Start Free Trial
            </button>
          </div>

          {/* Mobile hamburger */}
          <button className="md:hidden text-white p-2 rounded-lg" style={{ background: "rgba(255,255,255,0.08)" }}
            onClick={() => setMobileOpen((v) => !v)} aria-label="Menu">
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </nav>

      {/* Mobile overlay */}
      <div
        className="fixed inset-0 z-40 md:hidden transition-all duration-300"
        style={{
          background: "rgba(11,15,28,0.98)",
          backdropFilter: "blur(24px)",
          opacity: mobileOpen ? 1 : 0,
          pointerEvents: mobileOpen ? "all" : "none",
          paddingTop: 72,
        }}
      >
        <div className="px-6 py-8 flex flex-col gap-2">
          {NAV_LINKS.map((link, i) => (
            <a key={link.label} href={link.href}
              className="text-xl font-semibold no-underline py-3 border-b transition-all duration-200"
              style={{ color: "rgba(255,255,255,0.9)", borderColor: "rgba(255,255,255,0.06)", transitionDelay: `${i * 50}ms` }}
              onClick={() => setMobileOpen(false)}>
              {link.label}
            </a>
          ))}
          <button className="mt-6 w-full py-4 rounded-2xl text-base font-bold"
            style={{ background: "#D4FF00", color: "#0B0F1C" }}>
            Start Free Trial
          </button>
        </div>
      </div>
    </>
  );
}
