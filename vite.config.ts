import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import { visualizer } from "rollup-plugin-visualizer";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react({
      // 启用更快的开发模式刷新
      fastRefresh: true,
    }),
    // 仅在开发模式使用组件标记
    mode === 'development' && componentTagger(),
    // 在build模式使用分析工具
    mode === 'production' && visualizer({
      filename: 'stats.html', 
      gzipSize: true, 
      brotliSize: true,
      open: false
    }),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    // 启用Terser压缩
    minify: 'terser',
    terserOptions: {
      compress: {
        // 移除console和debugger语句
        drop_console: true,
        drop_debugger: true,
      },
    },
    // 代码分割设置
    rollupOptions: {
      output: {
        manualChunks: {
          // 将React相关库打包在一起
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          // UI组件库单独打包
          'vendor-ui': [
            '@radix-ui/react-accordion',
            '@radix-ui/react-alert-dialog',
            '@radix-ui/react-avatar',
            '@radix-ui/react-checkbox',
            '@radix-ui/react-context-menu',
            '@radix-ui/react-dialog',
            '@radix-ui/react-dropdown-menu',
            '@radix-ui/react-hover-card',
            '@radix-ui/react-label',
            '@radix-ui/react-menubar',
            '@radix-ui/react-navigation-menu',
            '@radix-ui/react-popover',
            '@radix-ui/react-progress',
            '@radix-ui/react-radio-group',
            '@radix-ui/react-scroll-area',
            '@radix-ui/react-select',
            '@radix-ui/react-separator',
            '@radix-ui/react-slider',
            '@radix-ui/react-slot',
            '@radix-ui/react-switch',
            '@radix-ui/react-tabs',
            '@radix-ui/react-toast',
            '@radix-ui/react-toggle',
            '@radix-ui/react-toggle-group',
            '@radix-ui/react-tooltip',
          ],
          // 拖放功能单独打包
          'vendor-dnd': [
            '@dnd-kit/core',
            '@dnd-kit/sortable',
            '@dnd-kit/utilities',
          ],
          // 图表库单独打包 
          'vendor-charts': ['recharts'],
          // 表单相关库单独打包
          'vendor-forms': ['react-hook-form', 'zod', '@hookform/resolvers'],
        },
        // 配置chunk大小警告限制
        chunkSizeWarningLimit: 1000,
      },
    },
    // 设置sourcemap类型
    sourcemap: mode === 'development' ? 'inline' : false,
    // 启用CSS代码分割
    cssCodeSplit: true,
    // 设置资源目录
    assetsDir: 'assets',
    // 启用modulePreload polyfill
    modulePreload: {
      polyfill: true,
    },
  },
  // 优化依赖预构建
  optimizeDeps: {
    // 强制预构建这些依赖
    include: [
      'react', 
      'react-dom', 
      'react-router-dom',
      '@radix-ui/react-dialog',
      '@radix-ui/react-tooltip',
      '@radix-ui/react-tabs',
      'lucide-react',
    ],
  },
  // 配置css处理
  css: {
    // 启用CSS模块化
    modules: {
      localsConvention: 'camelCase',
    },
    // 启用Source Maps
    devSourcemap: true,
  },
}));
