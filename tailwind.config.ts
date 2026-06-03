import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        white: "rgb(var(--theme-white) / <alpha-value>)",
        slate: {
          50: "rgb(var(--theme-slate-50) / <alpha-value>)",
          100: "rgb(var(--theme-slate-100) / <alpha-value>)",
          200: "rgb(var(--theme-slate-200) / <alpha-value>)",
          300: "rgb(var(--theme-slate-300) / <alpha-value>)",
          400: "rgb(var(--theme-slate-400) / <alpha-value>)",
          500: "rgb(var(--theme-slate-500) / <alpha-value>)",
          600: "rgb(var(--theme-slate-600) / <alpha-value>)",
          700: "rgb(var(--theme-slate-700) / <alpha-value>)",
          800: "rgb(var(--theme-slate-800) / <alpha-value>)",
          900: "rgb(var(--theme-slate-900) / <alpha-value>)",
          950: "rgb(var(--theme-slate-950) / <alpha-value>)",
        }
      },
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"],
      },
    },
  },
};

export default config;