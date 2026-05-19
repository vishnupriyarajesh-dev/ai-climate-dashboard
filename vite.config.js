import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite' // <-- This line is critical

export default defineConfig({
  plugins: [react(), tailwindcss()],
})