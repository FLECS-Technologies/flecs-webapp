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
Docker image is built. Real customer configs and assets are not stored in this
repository; they live in the private `flecs-whitelabel` repository. This repository
only contains `brands/example-brand/` so developers can preview and understand the
contract without exposing customer data.

Runtime files are served from the web root and also work when the app is mounted
below `/ui/`:

```txt
config.json
theme.css
logo.svg
favicon.ico or favicon.svg
logo192.png
logo512.png
```

`config.json` controls tenant metadata and feature flags such as
`branding.show_app_title`. `theme.css` overrides brand color/background CSS
variables, including `--brand-primary`, generated/manual `--brand-end`, and
light/dark background tokens. `logo.svg` is loaded by the layout with a FLECS
fallback.

For local developer preview, `.env.development` enables the example brand with:

```txt
VITE_DEV_BRAND_PREVIEW=true
```

For external customer white-label builds, generate the brand package in the
private `flecs-whitelabel` repository and point Vite at the generated folder:

```sh
VITE_BRAND_DIR=/path/to/flecs-whitelabel/dist/<brand> npm run build
docker buildx bake --var "NAMED_TAG=<tag>"
```

`VITE_BRAND_DIR` copies the full generated package into `dist` atomically, so
`config.json`, `theme.css`, logos, and favicons stay in sync.

## Tech Stack

React 19 · TypeScript · Vite 7 · Tailwind CSS v4 · TanStack Query v5 · Orval · Zustand · Sonner · Vitest · MSW · Playwright
