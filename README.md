# FLECS WebApp

## Prerequisites

- [Node.js](https://nodejs.org/) 22+
- [npm](https://www.npmjs.com/)

## Getting Started

```bash
npm install
npm run generate   # generate API hooks from OpenAPI specs
npm run dev
```

The dev server starts at [https://localhost:5173](https://localhost:5173).

## Scripts

| Command            | Description                             |
| ------------------ | --------------------------------------- |
| `npm run dev`      | Start the Vite dev server (HTTPS)       |
| `npm run build`    | Production build                        |
| `npm run generate` | Generate hooks/types from OpenAPI specs |
| `npm test`         | Run tests (Vitest)                      |
| `npm run coverage` | Run tests with coverage report          |
| `npm run test:e2e` | Run Playwright E2E tests                |
| `npm run lint`     | Lint with ESLint                        |
| `npm run format`   | Format with Prettier                    |

## White Label Runtime

The webapp supports static white-label runtime files that are injected before the
Docker image is built. This repository
contains `brands/example-brand/` as a reference for developers.

The brand overlay lives in a single `theming/` subtree, served relative to the
(possibly proxied) mount root so it also works when the app is mounted below
`/ui/`:

```txt
theming/config.json
theming/theme.css
theming/logo.svg          # + optional logo-light.svg / logo-dark.svg
theming/favicon.ico
theming/font.ttf
```

Keeping the overlay in one directory separates it from the Vite build output
(`index.html`, `assets/`) and the static PWA files at the SPA root
(`manifest.json`, `logo192.png`, `logo512.png`), so a brand package can be
dropped in as a unit without colliding with anything else.

`config.json` controls tenant metadata and feature flags such as
`branding.show_app_title`. `theme.css` overrides brand color/background CSS
variables, including `--brand-primary`, generated/manual `--brand-end`, and
light/dark background tokens; reference sibling files (fonts, etc.) by bare
relative name so they resolve within `theming/`. `logo.svg` is loaded by the
layout with a FLECS fallback.

For local developer preview, `.env.development` enables the example brand with:

```txt
VITE_DEV_BRAND_PREVIEW=true
```

## Tech Stack

React 19 · TypeScript · Vite 7 · Tailwind CSS v4 · TanStack Query v5 · Orval · Zustand · Sonner · Vitest · MSW · Playwright
