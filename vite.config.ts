import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],

  // Keep your original optimization
  optimizeDeps: {
    exclude: ['lucide-react'],
  },

  // NEW: Fix large chunk warning
  build: {
    chunkSizeWarningLimit: 900, // Optional: raise limit to 600 kB
    rollupOptions: {
      output: {
        manualChunks: {
          // Split heavy libraries into separate chunks
          vendor: ['react', 'react-dom'],
          lucide: ['lucide-react'],
          supabase: ['@supabase/supabase-js'],
          router: ['react-router-dom'],
        },
      },
    },
  },
});