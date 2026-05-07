import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        // Base
        bg: "#080810",
        surface: "#0f0f1a",
        elevated: "#161625",
        // Borders
        border: "rgba(255,255,255,0.06)",
        "border-active": "rgba(255,255,255,0.1)",
        // Accents
        blue: "#4f8eff",
        "blue-dim": "rgba(79,142,255,0.12)",
        cyan: "#00d4ff",
        "cyan-dim": "rgba(0,212,255,0.1)",
        purple: "#8b5cf6",
        "purple-dim": "rgba(139,92,246,0.12)",
        green: "#10b981",
        "green-dim": "rgba(16,185,129,0.12)",
        yellow: "#f59e0b",
        "yellow-dim": "rgba(245,158,11,0.12)",
        red: "#ef4444",
        "red-dim": "rgba(239,68,68,0.1)",
        // Text
        primary: "#f0f0ff",
        secondary: "#8888aa",
        tertiary: "#44445a",
        // Legacy aliases (keep for backward compat)
        accent: "#00d4ff",
        "accent-dim": "rgba(0,212,255,0.1)",
        muted: "#44445a",
        text: "#f0f0ff",
        "text-dim": "#8888aa",
        "surface-2": "#161625",
      },
      fontFamily: {
        sans: ["var(--font-inter)", "Inter", "sans-serif"],
        mono: ["var(--font-jetbrains)", "'JetBrains Mono'", "monospace"],
      },
      fontSize: {
        "2xs": ["10px", { lineHeight: "14px" }],
      },
      letterSpacing: {
        tighter: "-0.03em",
        tight: "-0.02em",
      },
      boxShadow: {
        card: "0 0 0 1px rgba(255,255,255,0.06), 0 4px 24px rgba(0,0,0,0.4)",
        "card-hover": "0 0 0 1px rgba(255,255,255,0.1), 0 8px 32px rgba(0,0,0,0.5)",
        glow: "0 0 20px rgba(79,142,255,0.3)",
        "glow-cyan": "0 0 20px rgba(0,212,255,0.25)",
      },
      animation: {
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        shimmer: "shimmer 1.5s infinite",
        "fade-in": "fadeIn 0.3s ease",
      },
      keyframes: {
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        fadeIn: {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
