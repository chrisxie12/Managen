import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        lime: {
          DEFAULT: "#D4FF00",
          hover: "#DFFF00",
          dark: "#C5F000",
        },
        navy: {
          DEFAULT: "#0B0F1C",
          light: "#1a1f2e",
        },
        warm: {
          50: "#FAFAF9",
          100: "#F5F5F4",
          200: "#E5E7EB",
        },
        forest: "#0B4F30",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
      animation: {
        "bob": "bob 3s ease-in-out infinite",
        "bob-delayed": "bob 3s ease-in-out infinite 0.5s",
        "bob-delayed-2": "bob 3s ease-in-out infinite 1s",
        "pulse-badge": "pulseBadge 2s ease-in-out infinite",
        "fade-in-up": "fadeInUp 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards",
      },
      keyframes: {
        bob: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-8px)" },
        },
        pulseBadge: {
          "0%, 100%": { boxShadow: "0 0 0 0 rgba(212,255,0,0.4)" },
          "50%": { boxShadow: "0 0 0 8px rgba(212,255,0,0)" },
        },
        fadeInUp: {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
    },
  },
  plugins: [],
};
export default config;
