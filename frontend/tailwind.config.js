/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{ts,tsx,js,jsx}"],
  theme: {
    extend: {
      colors: {
        rails: {
          bg:      "#030712",
          surface: "#0B1117",
          border:  "#1F2937",
          cyan:    "#38BDF8",
          indigo:  "#818CF8",
        },
      },
      fontFamily: {
        sans: ["Inter", "sans-serif"],
      },
    },
  },
  plugins: [],
};
