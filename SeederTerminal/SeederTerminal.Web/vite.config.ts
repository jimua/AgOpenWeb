import { defineConfig } from 'vite'
import { svelte } from '@sveltejs/vite-plugin-svelte'
import tailwindcss from '@tailwindcss/vite'

// Proxy the Seeder Desktop development backend for telemetry and map assets.
export default defineConfig({
  plugins: [tailwindcss(), svelte()],
  server: {
    port: 5175,
    strictPort: true,
    proxy: {
      '/ws': { target: 'ws://127.0.0.1:5174', ws: true },
      '/vendor': 'http://127.0.0.1:5174',
      '/sattile': 'http://127.0.0.1:5174',
      '/backpic.png': 'http://127.0.0.1:5174',
      '/icons': 'http://127.0.0.1:5174',
      '/sounds': 'http://127.0.0.1:5174',
    },
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  },
})
