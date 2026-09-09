import { defineConfig, Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import fs from 'fs'

function pwaAssetInjector(): Plugin {
  return {
    name: 'pwa-asset-injector',
    apply: 'build',
    closeBundle() {
      const distDir = path.resolve(__dirname, './dist')
      const assetsDir = path.resolve(distDir, 'assets')
      const swPath = path.resolve(distDir, 'sw.js')
      if (fs.existsSync(assetsDir) && fs.existsSync(swPath)) {
        const assetFiles = fs.readdirSync(assetsDir).map((file) => `/assets/${file}`)
        let swContent = fs.readFileSync(swPath, 'utf-8')
        const formattedAssets = assetFiles.map((f) => `  '${f}',`).join('\n')
        swContent = swContent.replace('/* __VITE_PRECACHE_ASSETS__ */', formattedAssets)
        fs.writeFileSync(swPath, swContent, 'utf-8')
        console.log(`[PWA] Injected ${assetFiles.length} build assets into dist/sw.js for 100% offline precache.`)
      }
    },
  }
}

export default defineConfig({
  plugins: [react(), pwaAssetInjector()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5173,
    host: true
  }
})
