import { appBasePath } from './base-path';

// White-label runtime files (config.json, theme.css, logos, favicon, fonts) live
// under the `theming/` subtree so they form a single swappable brand overlay kept
// separate from Vite build output. They resolve against the runtime mount prefix,
// since the reverse-proxy path prefix is unknown at build time and
// import.meta.env.BASE_URL can't be relied on. See base-path.ts.
export function themingAssetPath(filename: string): string {
  return `${appBasePath()}theming/${filename}`;
}
