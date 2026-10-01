import react from '@vitejs/plugin-react'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { defineConfig, type Plugin } from 'vite'
import pkg from './package.json' with { type: 'json' }

const SW_SOURCE = fileURLToPath(new URL('./src/sw.js', import.meta.url))

/**
 * Public files are copied verbatim, so a build-time `define` cannot reach
 * public/sw.js. This emits it with a real cache version instead, so every
 * production build gets a fresh cache name and installed clients pick up the
 * new bundle on their next visit.
 */
function serviceWorkerPlugin(): Plugin {
  return {
    name: 'aurora-sudoku-service-worker',
    apply: 'build',
    generateBundle() {
      const version = `${pkg.version}-${Date.now()}`
      const source = readFileSync(SW_SOURCE, 'utf8').replace('__SW_VERSION__', version)
      this.emitFile({ type: 'asset', fileName: 'sw.js', source })
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  // Relative asset URLs, so the build also works under a sub-path
  // (e.g. a GitHub Pages project site).
  base: './',
  plugins: [react(), serviceWorkerPlugin()],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id: string) {
          if (id.includes('node_modules/react') || id.includes('node_modules/react-dom')) {
            return 'vendor-react';
          }
          if (id.includes('node_modules/lucide-react')) {
            return 'vendor-icons';
          }
          if (id.includes('node_modules/canvas-confetti')) {
            return 'vendor-confetti';
          }
        },
      },
    },
  },
})
