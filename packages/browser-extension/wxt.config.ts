import { readFileSync } from 'node:fs'
import { defineConfig } from 'wxt'

const pkg = JSON.parse(readFileSync('./package.json', 'utf-8'))

// See https://wxt.dev/api/config.html
export default defineConfig({
  srcDir: 'src',
  modules: ['@wxt-dev/module-react'],
  vite: () => ({
    define: {
      __VERSION__: JSON.stringify(pkg.version),
    },
    build: {
      chunkSizeWarningLimit: 2000,
      cssCodeSplit: true,
      rollupOptions: {
        onwarn(message, handler) {
          if (message.code === 'EVAL') return
          handler(message)
        },
      },
    },
  }),
  zip: {
    artifactTemplate: 'accessaudit-ext-{{version}}-{{browser}}.zip',
  },
  manifest: {
    name: '__MSG_extName__',
    description: '__MSG_extDescription__',
    default_locale: 'zh_CN',
    permissions: ['tabs', 'tabGroups', 'sidePanel', 'storage', 'activeTab', 'scripting'],
    host_permissions: ['<all_urls>', 'http://localhost:3000/*'],
    web_accessible_resources: [
      {
        resources: ['main-world.js'],
        matches: ['*://*/*'],
      },
    ],
    side_panel: {
      default_path: 'sidepanel/index.html',
    },
    externally_connectable: {
      matches: ['http://localhost/*', 'http://localhost:3000/*'],
    },
  },
})
