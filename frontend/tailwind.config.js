const { toRadixVar, toRadixVars } = require("windy-radix-palette/vars");

/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  content: ["./app/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: toRadixVars("blue"),
        gray: toRadixVars("sage"),
        info: toRadixVars("blue"),
        success: toRadixVars("teal"),
        danger: toRadixVars("red"),
        error: toRadixVar("red", 11),
      },
      fontFamily: {
        sans: ["Inter", "sans-serif"],
      },
    },
  },
  plugins: [require("windy-radix-palette")],
};
