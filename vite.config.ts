// vite.config.ts
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import svgr from 'vite-plugin-svgr';
import path from 'path';
import fs from 'fs';
import tailwindcss from '@tailwindcss/vite';
import type { Plugin, ResolvedConfig } from 'vite';

const mimeTypes: Record<string, string> = {
  '.css': 'text/css; charset=utf-8',
  '.ico': 'image/x-icon',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml; charset=utf-8',
  '.ttf': 'font/ttf',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
};

function copyBrandFiles(srcDir: string, destDir: string) {
  if (!fs.existsSync(srcDir)) return;

  for (const entry of fs.readdirSync(srcDir, { withFileTypes: true })) {
    if (entry.name.startsWith('.')) continue;
    // README.md documents the brand-package contract for developers; it is not a
    // runtime asset, so keep it out of the shipped theming/ overlay.
    if (entry.name.toLowerCase() === 'readme.md') continue;
    const src = path.join(srcDir, entry.name);
    const dest = path.join(destDir, entry.name);

    if (entry.isDirectory()) {
      fs.mkdirSync(dest, { recursive: true });
      copyBrandFiles(src, dest);
      continue;
    }

    if (!entry.isFile()) continue;
    fs.mkdirSync(path.dirname(dest), { recursive: true });
    fs.copyFileSync(src, dest);
    fs.chmodSync(dest, 0o644);
  }
}

function brandOverlayPlugin(brandDir: string): Plugin {
  let config: ResolvedConfig;

  return {
    name: 'brand-overlay',
    configResolved(resolvedConfig) {
      config = resolvedConfig;
    },
    configureServer(server) {
      // Mirror the built layout in dev: brand files are served under /theming/,
      // stripping that prefix to resolve them within brandDir.
      const urlPrefix = '/theming/';
      server.middlewares.use((req, res, next) => {
        if (!req.url) return next();

        const pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
        const idx = pathname.indexOf(urlPrefix);
        if (idx === -1) return next();
        const relativePath = pathname.slice(idx + urlPrefix.length);
        if (!relativePath || relativePath.includes('..')) return next();

        const filePath = path.join(brandDir, relativePath);
        if (!filePath.startsWith(brandDir) || !fs.existsSync(filePath)) return next();

        const stat = fs.statSync(filePath);
        if (!stat.isFile()) return next();

        const contentType = mimeTypes[path.extname(filePath).toLowerCase()];
        if (contentType) res.setHeader('Content-Type', contentType);
        fs.createReadStream(filePath).pipe(res);
      });
    },
    writeBundle() {
      copyBrandFiles(brandDir, path.join(config.build.outDir, 'theming'));
    },
  };
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const coreTarget = env.VITE_CORE_URL || 'https://localhost';
  const devBrandPreview = env.VITE_DEV_BRAND_PREVIEW === 'true';
  const externalBrandDir = env.VITE_BRAND_DIR?.trim();
  const brandDir = externalBrandDir
    ? path.resolve(process.cwd(), externalBrandDir)
    : path.resolve(__dirname, 'brands/example-brand');
  const brandOverlayEnabled = Boolean(externalBrandDir) || devBrandPreview;

  return {
    base: '',
    publicDir: 'public',
    plugins: [
      react(),
      svgr(),
      tailwindcss(),
      brandOverlayEnabled && brandOverlayPlugin(brandDir),
    ].filter(Boolean),
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
        exclude: ['generated/**', 'src/test/**', 'src/**/*.test.{ts,tsx}', 'src/**/*.d.ts'],
      },
    },
  };
});
