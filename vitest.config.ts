import { defineConfig } from 'vitest/config';

// jsdom gives the tests a real DOM so we can assert ARIA state and keyboard
// behaviour the way a screen-reader/keyboard user would experience it.
export default defineConfig({
  test: {
    environment: 'jsdom',
    globals: true,
    include: ['test/**/*.test.ts'],
  },
});
