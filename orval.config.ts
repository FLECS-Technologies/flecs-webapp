import { defineConfig } from 'orval';

export default defineConfig({
  core: {
    input: { target: 'https://codeberg.org/flecs-tech/flecs-core/raw/branch/main/api/openapi.yaml' },
    output: {
      target: './generated/core',
      client: 'react-query',
      mode: 'tags-split',
      schemas: './generated/core/schemas',
      clean: ['./generated/core'],
      override: {
        mutator: { path: './src/app/api/fetch-instance.ts', name: 'customInstance' },
        query: { useQuery: true, useMutation: true },
      },
      mock: { type: 'msw' },
    },
  },
  marketplace: {
    input: { target: 'https://codeberg.org/flecs-tech/console-api/raw/branch/main/api/openapi.yaml' },
    output: {
      target: './generated/console',
      client: 'react-query',
      mode: 'tags-split',
      schemas: './generated/console/schemas',
      clean: ['./generated/console'],
      override: {
        mutator: { path: './src/app/api/console-fetch-instance.ts', name: 'customInstance' },
        query: { useQuery: true, useMutation: true },
      },
    },
  },
});
