"use client";

const COLUMNS = [
  {
    label: "Product",
    links: ["Features", "Pricing", "Changelog", "Roadmap"],
  },
  {
    label: "Resources",
    links: ["Documentation", "API", "Blog", "Support"],
  },
  {
    label: "Company",
    links: ["About", "Careers", "Contact", "Privacy", "Terms"],
  },
];

export default function Footer() {
  return (
    <footer style={{ background: "#0B0F1C", borderTop: "1px solid rgba(255,255,255,0.08)" }}>
      <div className="max-w-[1200px] mx-auto px-6 py-[60px]">
        <div className="grid grid-cols-2 md:grid-cols-[2fr_1fr_1fr_1fr] gap-12">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2.5 mb-3">
              <div style={{ width: 32, height: 32, borderRadius: 8, background: "#D4FF00", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 14, color: "#0B0F1C", fontFamily: "'Space Grotesk', sans-serif", flexShrink: 0 }}>M</div>
              <span style={{ fontSize: 18, fontWeight: 600, color: "white", fontFamily: "'Space Grotesk', sans-serif", letterSpacing: "-0.01em" }}>Managen</span>
            </div>
            <p className="text-sm mb-6" style={{ color: "rgba(255,255,255,0.5)" }}>
              School management for Ghanaian schools.
            </p>
            <div className="flex items-center gap-4">
              {["𝕏", "in", "💬"].map((icon) => (
                <button
                  key={icon}
                  className="w-9 h-9 rounded-xl flex items-center justify-center text-sm transition-all duration-200 hover:text-white"
                  style={{
                    background: "rgba(255,255,255,0.06)",
                    color: "rgba(255,255,255,0.5)",
                    border: "1px solid rgba(255,255,255,0.08)",
                  }}
                >
                  {icon}
                </button>
              ))}
            </div>
          </div>

          {COLUMNS.map((col) => (
            <div key={col.label}>
              <div
                className="text-xs font-semibold uppercase mb-4"
                style={{ color: "rgba(255,255,255,0.35)", letterSpacing: "0.1em", fontFamily: "'Space Grotesk', sans-serif" }}
              >
                {col.label}
              </div>
              <ul className="space-y-2.5">
                {col.links.map((link) => (
                  <li key={link}>
                    <a
                      href="#"
                      className="text-sm transition-colors duration-200 no-underline block"
                      style={{ color: "rgba(255,255,255,0.55)" }}
                      onMouseEnter={(e) => (e.currentTarget.style.color = "white")}
                      onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.55)")}
                    >
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div
          className="flex flex-col md:flex-row items-center justify-between gap-4 mt-12 pt-6"
          style={{ borderTop: "1px solid rgba(255,255,255,0.08)" }}
        >
          <p className="text-sm" style={{ color: "rgba(255,255,255,0.35)" }}>
            © 2026 Managen. All rights reserved.
          </p>
          <p className="text-sm" style={{ color: "rgba(255,255,255,0.35)" }}>
            Built with ❤️ in Ghana 🇬🇭
          </p>
        </div>
      </div>
    </footer>
  );
}
