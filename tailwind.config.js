/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        cream: {
          100: "#fefcf9",
        },
        brown: {
          700: "#5c3a21",
          800: "#3b2615",
        },
      },
    },
  },
  plugins: [],
}