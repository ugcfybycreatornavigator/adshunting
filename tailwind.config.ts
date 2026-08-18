import type { Config } from "tailwindcss";

export default {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#090909",
        muted: "#666666",
        line: "#E7E7E7",
        surface: "#FFFFFF",
        "soft-surface": "#FAFAFA",
        signal: "#E61E32",
        "signal-dark": "#CD1729",
        "soft-red": "#FFF1F2",
      },
      boxShadow: {
        card: "0 1px 2px rgba(9,9,9,0.02), 0 4px 16px rgba(9,9,9,0.03)",
        auth: "0 2px 8px rgba(0,0,0,0.02), 0 12px 32px rgba(0,0,0,0.04)",
      },
      borderRadius: {
        card: "16px",
        auth: "18px",
        button: "12px",
      },
      keyframes: {
        "auth-float": {
          "0%, 100%": { transform: "translateY(0) scale(1)" },
          "50%": { transform: "translateY(-6px) scale(1.02)" },
        }
      },
      animation: {
        "auth-float": "auth-float 12s ease-in-out infinite",
      }
    },
  },
  plugins: [],
} satisfies Config;
