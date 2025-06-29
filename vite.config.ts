import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [
    react({
      include: "**/*.{jsx,tsx}",
      exclude: /node_modules/,
      jsxRuntime: 'automatic', // Explicitly set JSX runtime to automatic
    })
  ],
  server: {
    host: true,
    port: 5173,
    hmr: {
      overlay: false, // Disable error overlay that might cause issues
    },
  },
  build: {
    sourcemap: true,
  },
  resolve: {
    extensions: ['.js', '.jsx', '.ts', '.tsx'],
  },
  optimizeDeps: {
    // exclude: ['@vitejs/plugin-react'], // Removed as it might interfere with preamble detection
  },
});