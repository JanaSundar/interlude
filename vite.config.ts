import { fileURLToPath, URL } from 'node:url';
import tailwindcss from '@tailwindcss/vite';
import { tanstackStart } from '@tanstack/react-start/plugin/vite';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite-plus';

const isTest = process.env.VITEST === 'true';

export default defineConfig({
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      '@registry': fileURLToPath(new URL('./registry', import.meta.url)),
    },
  },
  plugins: isTest
    ? [react()]
    : [
        tailwindcss(),
        tanstackStart({
          // Static site: crawl every internal link; in-page anchors are the same page.
          prerender: { enabled: true, crawlLinks: true, filter: ({ path }) => !path.includes('#') },
        }),
        react(),
      ],
  test: {
    environment: 'jsdom',
    include: ['registry/**/*.test.{ts,tsx}', 'src/**/*.test.{ts,tsx}'],
    setupFiles: ['./src/test-setup.ts'],
  },
  lint: {
    ignorePatterns: ['dist/**', '.output/**', 'public/r/**', 'src/routeTree.gen.ts'],
    options: { typeAware: true, typeCheck: true },
  },
  fmt: {
    singleQuote: true,
    semi: true,
    ignorePatterns: ['src/routeTree.gen.ts', 'public/r/**'],
  },
});
