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

| Command              | Description                              |
| -------------------- | ---------------------------------------- |
| `npm run dev`        | Start the Vite dev server (HTTPS)        |
| `npm run build`      | Production build                         |
| `npm run generate`   | Generate hooks/types from OpenAPI specs  |
| `npm test`           | Run tests (Vitest)                       |
| `npm run coverage`   | Run tests with coverage report           |
| `npm run test:e2e`   | Run Playwright E2E tests                 |
| `npm run lint`       | Lint with ESLint                         |
| `npm run format`     | Format with Prettier                     |

## Tech Stack

React 19 · TypeScript · Vite 7 · Tailwind CSS v4 · TanStack Query v5 · Orval · Zustand · Sonner · Vitest · MSW · Playwright
