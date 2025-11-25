import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'
import type { MinifyOptions } from 'terser'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
  ],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
  build: {
    rollupOptions: {
      output: {
        // 细粒度的代码分割策略
        manualChunks(id) {
          // 核心框架（首屏必需）
          if (id.includes('node_modules/vue/') || id.includes('node_modules/@vue/')) {
            return 'vue-core'
          }
          if (id.includes('node_modules/vue-router')) {
            return 'vue-router'
          }
          if (id.includes('node_modules/pinia')) {
            return 'pinia'
          }
          
          // 网络请求库
          if (id.includes('node_modules/axios')) {
            return 'axios'
          }
          
          // 日期处理库
          if (id.includes('node_modules/dayjs')) {
            return 'dayjs'
          }
          
          // Markdown 渲染生态（按需加载）
          if (id.includes('node_modules/markdown-it')) {
            return 'markdown-renderer'
          }
          if (id.includes('node_modules/dompurify')) {
            return 'markdown-renderer'
          }
          
          // 代码高亮（较大，独立分割）
          if (id.includes('node_modules/highlight.js')) {
            return 'highlight'
          }
          
          // 图标库（最大的依赖，独立分割）
          if (id.includes('node_modules/remixicon')) {
            return 'remixicon'
          }
          
          // VueUse 工具库
          if (id.includes('node_modules/@vueuse')) {
            return 'vueuse'
          }
          
          // 音乐播放器（如果使用）
          if (id.includes('node_modules/aplayer')) {
            return 'aplayer'
          }
          
          // 其他 node_modules（通用第三方库）
          if (id.includes('node_modules/')) {
            return 'vendor-misc'
          }
        },
        
        // 文件命名策略（带 hash 利于长期缓存）
        chunkFileNames: 'js/[name]-[hash].js',
        entryFileNames: 'js/[name]-[hash].js',
        assetFileNames: (assetInfo) => {
          // 根据文件类型分类存放
          if (/\.(png|jpe?g|gif|svg|webp|ico)$/.test(assetInfo.name || '')) {
            return 'img/[name]-[hash].[ext]'
          }
          if (/\.(woff2?|eot|ttf|otf)$/.test(assetInfo.name || '')) {
            return 'fonts/[name]-[hash].[ext]'
          }
          if (/\.css$/.test(assetInfo.name || '')) {
            return 'css/[name]-[hash].[ext]'
          }
          return 'assets/[name]-[hash].[ext]'
        },
      },
    },
    
    // 调整 chunk 大小警告阈值
    chunkSizeWarningLimit: 600, // 600KB（原 1000KB 太宽松）
    
    // CSS 代码分割（每个异步组件独立 CSS）
    cssCodeSplit: true,
    
    // 关闭生产环境 sourcemap（减小体积）
    sourcemap: false,
    
    // Terser 压缩配置（高压缩率）
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,              // 移除所有 console.*
        drop_debugger: true,             // 移除 debugger
        passes: 2,                       // 压缩遍数（提高压缩率）
      },
      mangle: {
        safari10: true,                  // 兼容 Safari 10+
      },
      format: {
        comments: false,                 // 移除所有注释
      },
    } as MinifyOptions,
    
    cssMinify: true,                     // 压缩 CSS
  },
})
