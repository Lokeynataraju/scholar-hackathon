import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { nodePolyfills } from 'vite-plugin-node-polyfills'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    nodePolyfills({
      globals: {
        Buffer: true,
      },
    }),
  ],
  server: {
    proxy: {
      // Proxy Algorand API calls to bypass CORS
      '/api/algorand': {
        target: 'https://testnet-api.algonode.cloud',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/algorand/, ''),
        secure: true,
      },
    },
  },
})

