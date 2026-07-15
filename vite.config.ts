import path from 'node:path'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  base: '/ssc/',
  plugins: [react(), tailwindcss()],
  resolve: { alias: { '@': path.resolve(__dirname, './src') } },
  build: {
    rolldownOptions: {
      output: {
        codeSplitting: {
          groups: [
            { name: 'animation-vendor', test: /node_modules[\\/](?:@gsap|gsap)[\\/]/, priority: 4 },
            { name: 'react-vendor', test: /node_modules[\\/](?:react|react-dom|scheduler)[\\/]/, priority: 3 },
            { name: 'tanstack-vendor', test: /node_modules[\\/]@tanstack[\\/]/, priority: 3 },
            { name: 'radix-vendor', test: /node_modules[\\/]@radix-ui[\\/]/, priority: 2 },
            { name: 'ui-vendor', test: /node_modules[\\/](?:lucide-react|sonner|zustand|zod)[\\/]/, priority: 1 },
          ],
        },
      },
    },
  },
})
