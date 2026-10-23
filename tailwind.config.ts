import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        // Modern Glass Foundations
        stone: {
          bg: "#F5EFEB",
          card: "rgba(255, 255, 255, 0.88)",
          elevated: "#EDE5DE",
          border: "#E2D7CD",
        },
        charcoal: {
          bg: "#0B0D12",
          sidebar: "#0E1117",
          card: "#12151D",
          elevated: "#171C26",
          border: "#1E2433",
        },
        // Text & Accent Palettes (Aligned with Chat Theme)
        romantic: {
          textLight: "#0F172A",
          textLightSec: "#475569",
          textLightMuted: "#94A3B8",
          textDark: "#F3F4F6",
          textDarkSec: "#94A3B8",
          textDarkMuted: "#64748B",
          rose: "#D4A853",
          roseLight: "#E5B869",
          wine: "#A0782A",
          roseDark: "#D4A853",
          roseDarkSec: "#E5B869",
          wineDark: "#A0782A",
          terracotta: "#D4A853",
        },
        gold: {
          DEFAULT: "#D4A853",
          light: "#E5B869",
          deep: "#A0782A",
          glow: "rgba(212, 168, 83, 0.4)",
        },
        chatGreen: {
          DEFAULT: "#27AE60",
          emerald: "#10B981",
        },
        french: {
          blue: "#2563EB",
          blueLight: "#3B82F6",
          white: "#FFFFFF",
          red: "#EF4444",
          redCrimson: "#DC2626",
        },
        // Semantic aliases
        accent: {
          primary: "var(--accent-primary)",
          secondary: "var(--accent-secondary)",
          deep: "var(--accent-deep)",
        },
        canvas: {
          bg: "var(--bg-main)",
          card: "var(--bg-card)",
          elevated: "var(--bg-elevated)",
          border: "var(--border-subtle)",
        },
        ink: {
          primary: "var(--text-primary)",
          secondary: "var(--text-secondary)",
          muted: "var(--text-muted)",
        },
      },
      fontFamily: {
        serif: ["var(--font-serif)", "Cormorant Garamond", "Newsreader", "Playfair Display", "Georgia", "serif"],
        sans: ["var(--font-sans)", "Inter", "Plus Jakarta Sans", "system-ui", "sans-serif"],
        script: ["var(--font-script)", "Caveat", "cursive"],
      },
      boxShadow: {
        quiet: "0 8px 30px rgba(0, 0, 0, 0.06)",
        "quiet-hover": "0 12px 36px rgba(0, 0, 0, 0.1)",
        dark: "0 12px 36px rgba(0, 0, 0, 0.5)",
        "dark-hover": "0 18px 48px rgba(0, 0, 0, 0.65)",
      },
      animation: {
        "fade-in": "fadeIn 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards",
        "fade-slow": "fadeIn 0.8s ease-in-out forwards",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0", transform: "translateY(6px)" },
          "100%": { opacity: "1", transform: "none" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
