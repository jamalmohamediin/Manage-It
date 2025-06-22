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
          100: '#fffaf5',
          200: '#fff1dc',
        },
        brown: {
          DEFAULT: '#3b2615',
          700: '#5c3a21',
          800: '#3b2615',
        },
        gold: {
          DEFAULT: '#d4af37',
        },
        beige: '#fff6ec',
        'soft-beige': '#bca58a',
        'luxe-border': '#e0cdbb',
        'muted': '#4b4b4b',
      },
    },
  },
  plugins: [
    forms,
    function ({ addComponents, theme }) {
      addComponents({
        '.btn-cream': {
          backgroundColor: theme('colors.cream.100'),
          color: theme('colors.gold.DEFAULT'),
          border: `1px solid ${theme('colors.brown.800')}`,
          fontWeight: '600',
          padding: `${theme('spacing.2')} ${theme('spacing.5')}`,
          borderRadius: theme('borderRadius.lg'),
          boxShadow: theme('boxShadow.md'),
          transition: 'all 0.2s ease-in-out',
          '&:hover': {
            backgroundColor: theme('colors.cream.200'),
          },
        },
        '.header-title': {
          color: theme('colors.gold.DEFAULT'),
          fontWeight: theme('fontWeight.bold'),
        },
        '.text-primary': {
          color: theme('colors.gold.DEFAULT'),
        },
      });
    },
  ],
};
