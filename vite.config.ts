// vite.config.ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import svgr from 'vite-plugin-svgr'
import path from 'path'

export default defineConfig({
  base: '/ui/',
  plugins: [react(), svgr()],
  server: {
    open: true
  },
  define: {
    global: 'globalThis' // <–– fixes fbjs / draft-js issues
  },
  test: {
    environment: 'jsdom',
    globals: true, // optional, useful for @testing-library,
    setupFiles: './src/test/setup.ts',
    coverage: {
      provider: 'v8', // or 'istanbul' for Node < 16
      reporter: ['text', 'html', 'lcov'], // output formats
      all: true, // include files not directly imported in tests
      reportsDirectory: './coverage' // optional
    }
  }
})
