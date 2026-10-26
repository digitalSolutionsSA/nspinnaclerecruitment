import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // The project lives on a network share (\\Server-pc\dssa), where native
    // fs.watch fails with "UNKNOWN: unknown error, watch". Poll instead.
    watch: {
      usePolling: true,
      interval: 300,
    },
  },
})
