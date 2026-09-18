/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        "background": "#08141f",
        "surface": "#08141f",
        "surface-subtle": "#111D28",
        "surface-card": "#15212C",
        "surface-elevated": "#1F2B37",
        "surface-border": "#1B3A4A",
        "surface-container": "#15212c",
        "surface-container-high": "#202b37",
        "surface-container-lowest": "#040f1a",
        "primary": "#28d7ff",
        "primary-hover": "#53d7f0",
        "primary-dim": "#b0ebff",
        "text-main": "#D7E4F4",
        "text-secondary": "#8EA7B7",
        "text-muted": "#5E7888",
        "status-operational": "#31D48C",
        "status-warning": "#F5B84B",
        "status-critical": "#FF5B67",
        "status-info": "#6B9CFF",
        "tertiary": "#64fcb0",
        "outline": "#859398",
        "outline-variant": "#3c494d",
      },
      fontFamily: {
        sans: ["Inter", "sans-serif"],
        mono: ["'JetBrains Mono'", "monospace"],
      },
      fontSize: {
        "metric-display": ["28px", { lineHeight: "32px", letterSpacing: "-0.02em", fontWeight: "700" }],
        "metric-tabular": ["13px", { lineHeight: "16px", letterSpacing: "0.02em", fontWeight: "500" }],
        "headline-lg": ["20px", { lineHeight: "28px", letterSpacing: "-0.01em", fontWeight: "600" }],
        "headline-md": ["16px", { lineHeight: "24px", letterSpacing: "-0.005em", fontWeight: "600" }],
        "display-lg": ["32px", { lineHeight: "40px", letterSpacing: "-0.02em", fontWeight: "600" }],
        "body-lg": ["14px", { lineHeight: "20px", letterSpacing: "0em", fontWeight: "400" }],
        "body-md": ["13px", { lineHeight: "18px", letterSpacing: "0em", fontWeight: "400" }],
        "body-sm": ["12px", { lineHeight: "16px", letterSpacing: "0.01em", fontWeight: "400" }],
        "label-lg": ["12px", { lineHeight: "16px", letterSpacing: "0.04em", fontWeight: "600" }],
        "label-sm": ["10px", { lineHeight: "14px", letterSpacing: "0.06em", fontWeight: "600" }],
      },
      spacing: {
        "space-xs": "0.25rem",
        "space-sm": "0.5rem",
        "space-md": "1rem",
        "space-lg": "1.5rem",
        "space-xl": "2rem",
      },
      keyframes: {
        pulse: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.5" }
        },
        'fade-in-up': {
          '0%': { opacity: '0', transform: 'translateY(15px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'scan-line': {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(200%)' },
        }
      },
      animation: {
        pulse: "pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        'fade-in-up': 'fade-in-up 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'fade-in': 'fade-in 0.3s ease-out forwards',
        'scan-line': 'scan-line 3s linear infinite',
      }
    },
  },
  plugins: [],
}
