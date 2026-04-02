// vite.config.ts
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import svgr from 'vite-plugin-svgr';
import path from 'path';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  base: '',
  plugins: [react(), svgr(), tailwindcss()],
  resolve: {
    alias: {
      // New architecture aliases
      '@app': path.resolve(__dirname, './src/app'),
      '@features': path.resolve(__dirname, './src/features'),
      '@generated': path.resolve(__dirname, './generated'),
      '@stores': path.resolve(__dirname, './src/stores'),

      // Legacy aliases (still referenced)
      '@pages': path.resolve(__dirname, './src/pages'),
      '@test': path.resolve(__dirname, './src/test'),
      '@assets': path.resolve(__dirname, './src/assets'),
    },
  },
  server: {
    open: true,
    proxy: {
      '/api': {
        target: 'https://localhost',
        changeOrigin: true,
        secure: false,
        cookieDomainRewrite: 'localhost',
      },
      '/flecs': {
        target: 'https://localhost',
        changeOrigin: true,
        cookieDomainRewrite: 'localhost',
        secure: false,
      },
    },
  },
  build: {
    // Static SPA — single bundle served from assets/ by a simple webserver (try_files)
    chunkSizeWarningLimit: 1200,
    rollupOptions: {
      output: {
        manualChunks: undefined,
        chunkFileNames: 'assets/[name]-[hash].js',
        entryFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]',
      },
    },
  },
  define: {
    global: 'globalThis',
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './src/test/setup.ts',
    include: ['src/**/*.test.{ts,tsx}'],
    exclude: ['node_modules', 'dist', 'generated'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'lcov'],
      reportsDirectory: './coverage',
      include: ['src/**/*.{ts,tsx}'],
      exclude: [
        'generated/**',
        'src/test/**',
        'src/**/*.test.{ts,tsx}',
        'src/**/*.d.ts',
      ],
    },
  },
});
