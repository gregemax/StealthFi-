import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        bg: "#0a0a0f",
        surface: "#111118",
        "surface-2": "#1a1a24",
        border: "#1e1e2e",
        accent: "#00d4ff",
        "accent-dim": "#00d4ff33",
        muted: "#4a4a6a",
        text: "#e2e2f0",
        "text-dim": "#8888aa",
      },
      fontFamily: {
        sans: ["var(--font-geist-sans)", "sans-serif"],
        mono: ["var(--font-geist-mono)", "monospace"],
      },
      animation: {
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
      },
    },
  },
  plugins: [],
};

export default config;
