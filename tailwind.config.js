/** @type {import('tailwindcss').Config} */
import forms from '@tailwindcss/forms';

export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        segoe: ['"Segoe UI"', 'sans-serif'],
         sans: ['"Segoe UI"', 'sans-serif'], // ✅ Sets Segoe UI as default sans
      },
      colors: {
        cream: { 100: "#fefcf9" },
        brown: { 700: "#5c3a21", 800: "#3b2615" },
      },
    },
  },
  plugins: [forms],
};
