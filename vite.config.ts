import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue()],
  server: {
    proxy: {
      '/api': 'http://localhost:8787',
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules/vue') || id.includes('node_modules/pinia')) {
            return 'vendor-vue'
          }
          if (id.includes('node_modules/element-plus')) {
            return 'vendor-element-plus'
          }
          // js-tiktoken: don't force into manual chunk —
          // openaiTokenizer.ts uses dynamic import() so Vite can code-split it
          if (id.includes('node_modules/lucide-vue-next')) {
            return 'vendor-icons'
          }
        },
      },
    },
    chunkSizeWarningLimit: 500,
  },
})
