import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 8890,
    host: '0.0.0.0', // Allow access from network
  },
  build: {
    // Optimize chunk splitting for better caching
    rollupOptions: {
      output: {
        manualChunks: {
          // Vendor chunk for core libraries
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          // Data fetching libraries
          'vendor-query': ['@tanstack/react-query'],
          // State management
          'vendor-state': ['zustand'],
          // Payment library
          'vendor-stripe': ['@stripe/react-stripe-js', '@stripe/stripe-js'],
          // Socket.io for real-time features
          'vendor-socket': ['socket.io-client'],
        },
      },
    },
    // Increase chunk size warning limit (default is 500kb)
    chunkSizeWarningLimit: 1000,
    // Enable minification (esbuild is faster than terser)
    minify: 'esbuild',
  },
})
