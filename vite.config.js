import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/SheetMagic/',
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false,
    minify: 'terser',
    rollupOptions: {
      external: ['react-dropzone'] // اگر نیاز است
    }
  },
  optimizeDeps: {
    include: ['react-dropzone']
  }
})