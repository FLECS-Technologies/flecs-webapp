// vite.config.ts
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import svgr from 'vite-plugin-svgr';
import path from 'path';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const coreTarget = env.VITE_CORE_URL || 'https://localhost';

  return {
    base: '',
    plugins: [react(), svgr(), tailwindcss()],
    resolve: {
      alias: {
        '@app': path.resolve(__dirname, './src/app'),
        '@features': path.resolve(__dirname, './src/features'),
        '@generated': path.resolve(__dirname, './generated'),
        '@stores': path.resolve(__dirname, './src/stores'),
        '@pages': path.resolve(__dirname, './src/pages'),
        '@test': path.resolve(__dirname, './src/test'),
        '@assets': path.resolve(__dirname, './src/assets'),
      },
    },
    server: {
      open: true,
      proxy: {
        '/api': {
          target: coreTarget,
          changeOrigin: true,
          secure: false,
          cookieDomainRewrite: 'localhost',
        },
        '/flecs': {
          target: coreTarget,
          changeOrigin: true,
          cookieDomainRewrite: 'localhost',
          secure: false,
        },
      },
    },
    build: {
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
  };
});
