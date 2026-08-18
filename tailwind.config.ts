import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        bg: "rgb(var(--color-bg) / <alpha-value>)",
        panel: "rgb(var(--color-panel) / <alpha-value>)",
        panel2: "rgb(var(--color-panel2) / <alpha-value>)",
        border: "rgb(var(--color-border) / <alpha-value>)",
        ink: "rgb(var(--color-ink) / <alpha-value>)",
        muted: "rgb(var(--color-muted) / <alpha-value>)",
        copper: "rgb(var(--color-copper) / <alpha-value>)",
        "copper-dim": "rgb(var(--color-copper-dim) / <alpha-value>)",
        ok: "rgb(var(--color-ok) / <alpha-value>)",
        soon: "rgb(var(--color-soon) / <alpha-value>)",
        overdue: "rgb(var(--color-overdue) / <alpha-value>)",
        input: "rgb(var(--color-input) / <alpha-value>)",
      },
      fontFamily: {
        display: ["var(--font-oswald)"],
        mono: ["var(--font-jbmono)"],
        sans: ["var(--font-inter)"],
      },
      borderRadius: {
        xl2: "1.1rem",
      },
    },
  },
  plugins: [],
};
export default config;
