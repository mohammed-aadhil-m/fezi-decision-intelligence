import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { handleApiRequest } from './server/apiRouter'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    {
      name: 'fezi-api-plugin',
      configureServer(server) {
        server.middlewares.use((req, res, next) => {
          handleApiRequest(req, res, next)
        })
      },
    },
  ],
})
