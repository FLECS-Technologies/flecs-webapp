// vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import svgr from 'vite-plugin-svgr';
import path from 'path';

export default defineConfig({
  base: '',
  plugins: [react(), svgr()],
  resolve: {
    alias: {
      // New architecture aliases
      '@app': path.resolve(__dirname, './src/app'),
      '@features': path.resolve(__dirname, './src/features'),
      '@shared': path.resolve(__dirname, './src/shared'),
      '@stores': path.resolve(__dirname, './src/stores'),

      // Legacy aliases (still referenced)
      '@pages': path.resolve(__dirname, './src/pages'),
      '@test': path.resolve(__dirname, './src/test'),
      '@assets': path.resolve(__dirname, './src/assets'),
    },
  },
  server: {
    open: true,
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
    coverage: {
      provider: 'v8', // or 'istanbul' for Node < 16
      reporter: ['text', 'html', 'lcov'], // output formats
      all: true, // include files not directly imported in tests
      reportsDirectory: './coverage', // optional
      exclude: [
        'node_modules/**',
        'dist/**',
        'coverage/**',
        '**/__mocks__/**',
        '**/*.{test,spec}.{js,jsx,ts,tsx}',
        '**/*.d.ts',
        'src/test/**',
        '*.config.js',
        'index.ts',
        'types.ts',
      ],
    },
  },
});
