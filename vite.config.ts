import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    // '@' → src. FSD 레이어 경로가 상대경로로 길어지는 것을 막는다.
    alias: { '@': '/src' },
  },
})
