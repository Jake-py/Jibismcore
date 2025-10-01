import    { defineConfig } from 'vite'
import    react from '@vitejs/plugin-react'

export default      defineConfig({
  base: '/Jibismcore/', 
  plugins: [react()],
  build: {
    outDir: 'dist'
  }
})
