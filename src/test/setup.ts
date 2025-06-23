// src/test/setup.ts

import '@testing-library/jest-dom' // adds custom matchers like .toBeInTheDocument()

// Optional: reset DOM before each test if needed
import { afterEach } from 'vitest'
import { cleanup } from '@testing-library/react'

// Automatically unmount React trees after each test
afterEach(() => {
  cleanup()
})

// Map Jest to Vitest for compatibility with existing tests
globalThis.jest = vi as unknown as typeof jest
