// The app is served under a variable path prefix (e.g. /ui/) chosen by the
// reverse proxy and unknown at build time, so root-absolute URLs like
// `/config.json` never reach this container. The built entry chunk lives at
// <prefix>/assets/<file>.js, so its own URL (import.meta.url) reveals the
// mount root regardless of the current route; strip the assets/ tail to
// recover it. In dev there is no assets/ segment, so we fall back to the
// server root. Returns a base ending in `/`, e.g. `https://host/ui/` or `/`.
export function appBasePath(): string {
  const match = import.meta.url.match(/^(.*\/)assets\/[^/]+$/);
  return match ? match[1] : '/';
}
