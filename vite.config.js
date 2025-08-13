import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

export default {
  root: '.',
  server: {
    port: 5173,
    open: true
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets'
  }
}
