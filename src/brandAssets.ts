import { appBasePath } from './base-path';

// Brand assets (config, theme, logo) are resolved against the runtime mount
// prefix, since the reverse-proxy path prefix is unknown at build time and
// import.meta.env.BASE_URL can't be relied on. See base-path.ts.
export function publicAssetPath(filename: string): string {
  return `${appBasePath()}${filename}`;
}
