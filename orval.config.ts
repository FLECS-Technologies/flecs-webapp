import { defineConfig } from 'orval';

export default defineConfig({
  core: {
    input: {
      target: 'https://git.flecs.tech/flecs/flecs-core/raw/branch/main/api/openapi.yaml',
      parserOptions: {
        externalRefs: {
          allow: [
            'https://raw.githubusercontent.com/FLECS-Technologies/app-manifest/refs/heads/3.1.0/manifest.schema.json',
            'https://raw.githubusercontent.com/FLECS-Technologies/flecs-public/main/schema/dos.schema.json',
          ],
        },
      },
    },
    output: {
      target: './generated/core',
      client: 'react-query',
      mode: 'tags-split',
      schemas: './generated/core/schemas',
      clean: ['./generated/core'],
      override: {
        mutator: { path: './src/app/api/fetch-instance.ts', name: 'customInstance' },
      },
      mock: { generators: [{ type: 'msw' }] },
    },
  },
  marketplace: {
    input: {
      target: 'https://git.flecs.tech/flecs/console-api/raw/branch/main/api/openapi.yaml',
    },
    output: {
      target: './generated/console',
      client: 'react-query',
      mode: 'tags-split',
      schemas: './generated/console/schemas',
      clean: ['./generated/console'],
      override: {
        mutator: { path: './src/app/api/console-fetch-instance.ts', name: 'customInstance' },
      },
    },
  },
});
