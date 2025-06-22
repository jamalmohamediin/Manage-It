// tailwind.config.ts
import forms from '@tailwindcss/forms';

export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        segoe: ['"Segoe UI"', 'sans-serif'],
        sans: ['"Segoe UI"', 'sans-serif'],
      },
      colors: {
        cream: {
          100: '#fefcf9',
        },
        brown: {
          700: '#5c3a21',
          800: '#3b2615',
        },
      },
    },
  },
  plugins: [forms],
};
