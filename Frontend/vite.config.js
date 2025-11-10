import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'), // 👈 This line fixes the "@/..." import issue
    },
  },
  build: {
    outDir: 'build', // 👈 Output folder name (you can keep "build" or "dist")
  },
});
