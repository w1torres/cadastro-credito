import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    // Bind mounts do Docker Desktop no Windows não propagam eventos nativos
    // de sistema de arquivos para dentro do container — sem polling o HMR
    // fica "surdo" para mudanças feitas no host.
    watch: {
      usePolling: true,
    },
  },
})
