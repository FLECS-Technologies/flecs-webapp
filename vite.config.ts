// vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import svgr from 'vite-plugin-svgr';
import path from 'path';
import basicSsl from '@vitejs/plugin-basic-ssl';

export default defineConfig({
  base: '',
  plugins: [react(), svgr(), basicSsl()],
  server: {
    open: true,
  },
  build: {
    // We want to keep a flat asset structure without chunk/ directory to
    // keep our webserver config simple ("try_files")
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
    global: 'globalThis', // <–– fixes fbjs / draft-js issues
  },
  test: {
    environment: 'jsdom',
    globals: true, // optional, useful for @testing-library,
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
        'src/setupTests.js',
        'src/models/**',
        '*.config.js',
        'index.ts',
        'types.ts',
      ],
    },
  },
});
