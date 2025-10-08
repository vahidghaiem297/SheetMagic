import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: 'https://github.com/vahidghaiem297/SheetMagic.git', // مهم! اسم ریپوی تو رو بذار
   build: {
    outDir: 'dist',
    sourcemap: false,
    chunkSizeWarningLimit: 1600
  },
  test: {
    environment: 'jsdom',
    setupFiles: ['./tests/setupTests.ts'],
    css: true,
    restoreMocks: true,
  },
})