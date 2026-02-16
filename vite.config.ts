// vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import svgr from 'vite-plugin-svgr';
import path from 'path';
import basicSsl from '@vitejs/plugin-basic-ssl';

export default defineConfig({
  base: '',
  plugins: [react(), svgr(), basicSsl()],
  resolve: {
    alias: {
      '@components': path.resolve(__dirname, './src/components'),
      '@contexts': path.resolve(__dirname, './src/contexts'),
      '@pages': path.resolve(__dirname, './src/pages'),
      '@hooks': path.resolve(__dirname, './src/hooks'),
      '@utils': path.resolve(__dirname, './src/utils'),
      '@models': path.resolve(__dirname, './src/models'),
      '@api': path.resolve(__dirname, './src/api'),
      '@test': path.resolve(__dirname, './src/test'),
      '@assets': path.resolve(__dirname, './src/assets'),
      '@styles': path.resolve(__dirname, './src/styles'),
      '@data': path.resolve(__dirname, './src/data'),
    },
  },
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
        'src/setupTests.js',
        'src/models/**',
        '*.config.js',
        'index.ts',
        'types.ts',
      ],
    },
  },
});
