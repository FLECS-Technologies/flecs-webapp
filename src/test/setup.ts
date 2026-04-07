import '@testing-library/jest-dom';
import { afterAll, afterEach, beforeAll } from 'vitest';
import { cleanup } from '@testing-library/react';
import { server } from './msw-setup';

// Start MSW server before all tests — generated mocks from OpenAPI specs
beforeAll(() => server.listen({ onUnhandledRequest: 'bypass' }));
afterEach(() => { cleanup(); server.resetHandlers(); });
afterAll(() => server.close());
