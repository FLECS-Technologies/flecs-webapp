// vite.config.ts
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import svgr from 'vite-plugin-svgr';
import path from 'path';
import fs from 'fs';
import { execSync, type ExecSyncOptionsWithStringEncoding } from 'child_process';
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

// The SBOMs ship at two URLs: content-hashed under /assets/ via the `?url`
// imports (immutable, used by the in-app download links), and unhashed at the SPA
// root so /sbom.<format>.json stays stable for external tooling. Copies rather
// than a redirect, because the mount prefix is variable and the image has no
// entrypoint to emit a hash-aware rule. ~60 KB per format.
const sbomFilenames = ['sbom.spdx.json', 'sbom.cyclonedx.json'];

function sbomRootCopyPlugin(sbomDir: string): Plugin {
  let config: ResolvedConfig;

  return {
    name: 'sbom-root-copy',
    configResolved(resolvedConfig) {
      config = resolvedConfig;
    },
    configureServer(server) {
      // Mirror the built layout in dev. Matched on basename, like nginx does, so
      // the stable paths also resolve under a proxy prefix.
      server.middlewares.use((req, res, next) => {
        if (!req.url) return next();

        const url = new URL(req.url, 'http://localhost');

        // Vite serves the same files as ES modules for the `?url` imports, from
        // /src/assets/ and with a query (?import&url). Answering those with raw
        // JSON fails strict module MIME checking and blanks the page, so leave
        // them to Vite's transform.
        if (url.search) return next();

        const pathname = decodeURIComponent(url.pathname);
        if (pathname.includes('/src/')) return next();

        const filename = pathname.slice(pathname.lastIndexOf('/') + 1);
        if (!sbomFilenames.includes(filename)) return next();

        const filePath = path.join(sbomDir, filename);
        if (!fs.existsSync(filePath)) return next();

        res.setHeader('Content-Type', mimeTypes['.json']);
        fs.createReadStream(filePath).pipe(res);
      });
    },
    // Not `publicDir`: the sources stay in src/assets/ so the hashed copies exist.
    writeBundle() {
      for (const filename of sbomFilenames) {
        fs.copyFileSync(path.join(sbomDir, filename), path.join(config.build.outDir, filename));
      }
    },
  };
}

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

function gitInfo(): { sha: string; dirty: boolean; changes: string } {
  try {
    const opts: ExecSyncOptionsWithStringEncoding = {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
    };
    const sha = execSync('git rev-parse --short HEAD', opts).trim();
    // Build outputs (generated/, dist/, src/assets/sbom.*) are gitignored, so the
    // prebuild steps do not dirty a clean checkout.
    const changes = execSync('git status --porcelain', opts).trim();
    return { sha, dirty: changes.length > 0, changes };
  } catch {
    // Not a git checkout (e.g. a source tarball); fall back to a stable marker.
    return { sha: 'unknown', dirty: false, changes: '' };
  }
}

// The webapp version baked into the bundle (surfaced via VITE_APP_VERSION).
// package.json is the single source of truth for the released version.
//   release build (RELEASE set) -> the package.json version verbatim, e.g. "5.3.0"
//   any other build            -> "<base>-next-dev-<git-sha>[-dirty]", e.g. "5.3.0-next-dev-0b6950c"
function resolveAppVersion(): string {
  const pkg = JSON.parse(fs.readFileSync(path.resolve(__dirname, 'package.json'), 'utf8')) as {
    version: string;
  };
  const fullVersion = pkg.version;
  const isRelease = process.env.RELEASE === '1' || process.env.RELEASE === 'true';
  const { sha, dirty, changes } = gitInfo();

  // A release bundle carries no git sha, so the version alone has to identify the
  // source. Only stamp it when the checkout provably matches a commit.
  if (isRelease) {
    if (sha === 'unknown') {
      throw new Error(
        `Refusing to build release ${fullVersion}: not a git checkout, so the working ` +
          `tree cannot be verified. Build from a git clone, or use "npm run build".`,
      );
    }
    if (dirty) {
      throw new Error(
        `Refusing to build release ${fullVersion} from a dirty working tree:\n${changes}\n` +
          `Commit or stash these changes, or use "npm run build".`,
      );
    }
    return fullVersion;
  }

  const base = /^\d+\.\d+\.\d+/.exec(fullVersion)?.[0] ?? fullVersion;
  return `${base}-next-dev-${sha}${dirty ? '-dirty' : ''}`;
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const appVersion = resolveAppVersion();
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
      sbomRootCopyPlugin(path.resolve(__dirname, './src/assets')),
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
      'import.meta.env.VITE_APP_VERSION': JSON.stringify(appVersion),
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
