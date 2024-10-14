const {nextui} = require("@nextui-org/react");

/** @type {import('tailwindcss').Config} */

module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./node_modules/@nextui-org/theme/dist/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      maxWidth: {
        '1320': '1320px', // Добавляем кастомное значение
      },
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
      },
      fontFamily: {
        montserrat: ['Montserrat', 'sans-serif'], // Добавляем шрифт Montserrat
      },
    },
  },
  darkMode: "class",
  plugins: [nextui()],
};
