import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        bg: "#14161a",
        panel: "#1c1f24",
        panel2: "#22262c",
        border: "#2b2f36",
        ink: "#ece9e2",
        muted: "#8b8f98",
        copper: "#c08552",
        "copper-dim": "#8a5f3b",
        ok: "#6fa97a",
        soon: "#d9a441",
        overdue: "#c1554f",
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
