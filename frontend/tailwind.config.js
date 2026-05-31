/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,ts,jsx,tsx,mdx}", "./components/**/*.{js,ts,jsx,tsx,mdx}", "./lib/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        bg: "oklch(var(--lv-bg) / <alpha-value>)",
        surface: "oklch(var(--lv-surface) / <alpha-value>)",
        "surface-2": "oklch(var(--lv-surface-2) / <alpha-value>)",
        fg: "oklch(var(--lv-fg) / <alpha-value>)",
        muted: "oklch(var(--lv-muted) / <alpha-value>)",
        border: "oklch(var(--lv-border) / <alpha-value>)",
        "border-cool": "oklch(var(--lv-border-cool) / <alpha-value>)",
        accent: {
          DEFAULT: "oklch(var(--lv-accent) / <alpha-value>)",
          light: "oklch(var(--lv-accent) / 0.07)",
          mid: "oklch(var(--lv-accent) / 0.18)",
        },
        coral: {
          DEFAULT: "oklch(var(--lv-coral) / <alpha-value>)",
          soft: "oklch(var(--lv-coral) / 0.1)",
        },
      },
      fontFamily: {
        display: ["var(--font-display)", "Georgia", "serif"],
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
      },
      boxShadow: {
        soft: "0 18px 45px rgb(34 27 61 / 0.07)",
      },
    },
  },
  plugins: [],
};
