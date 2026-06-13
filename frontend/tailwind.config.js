/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{ts,tsx,js,jsx}"],
  theme: {
    extend: {
      colors: {
        rails: {
          bg:       "#010810",
          surface:  "#010e16",
          border:   "#0e2a35",
          accent:   "#06B6D4",   // cyan-500 — trust/governance tone
          accentLo: "#164E63",   // muted accent for secondary text
          glow:     "#67E8F9",   // light cyan for highlights
        },
      },
      fontFamily: {
        mono: ["'Cascadia Code'", "'Fira Code'", "ui-monospace", "monospace"],
        sans: ["Inter", "sans-serif"],
      },
    },
  },
  plugins: [],
};