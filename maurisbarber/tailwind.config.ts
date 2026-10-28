import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: {
          DEFAULT: "#111111",
          soft: "#3a3a3a",
          muted: "#767676",
        },
        surface: {
          DEFAULT: "#ffffff",
          alt: "#f7f7f5",
          dark: "#0a0a0a",
        },
        line: "#e5e5e3",
        accent: {
          DEFAULT: "#16a34a",
          soft: "#dcfce7",
          hover: "#15803d",
        },
        // Premium public-site palette (landing + booking flow only — the
        // admin panel keeps the tokens above). Black-and-gold barbershop
        // identity, see the mauris-estudio-visual skill.
        noir: {
          DEFAULT: "#0E0D0B",
          soft: "#1A1815",
        },
        gold: {
          DEFAULT: "#C6A15B",
          light: "#E3CB8F",
        },
        ivory: {
          DEFAULT: "#EFE9DD",
          soft: "#9A9385",
        },
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        display: ["var(--font-display)", "system-ui", "sans-serif"],
      },
      borderRadius: {
        xl: "1rem",
        "2xl": "1.5rem",
        "3xl": "2rem",
      },
      boxShadow: {
        card: "0 1px 2px rgba(0,0,0,0.04), 0 8px 24px -8px rgba(0,0,0,0.08)",
        floating: "0 12px 32px -8px rgba(0,0,0,0.25)",
        gold: "0 8px 30px -8px rgba(198,161,91,0.35)",
      },
      keyframes: {
        "rise-in": {
          "0%": { opacity: "0", transform: "translateY(12px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        "pulse-ring": {
          "0%, 100%": { opacity: "0.55", transform: "scale(1)" },
          "50%": { opacity: "0.9", transform: "scale(1.06)" },
        },
        "draw-line": {
          "0%": { strokeDashoffset: "1" },
          "100%": { strokeDashoffset: "0" },
        },
      },
      animation: {
        "rise-in": "rise-in 0.6s cubic-bezier(0.16, 1, 0.3, 1) both",
        "fade-in": "fade-in 0.4s ease-out both",
        "pulse-ring": "pulse-ring 2.4s ease-in-out infinite",
        "draw-line": "draw-line 1.4s cubic-bezier(0.65, 0, 0.35, 1) 0.5s both",
      },
    },
  },
  plugins: [],
};

export default config;
