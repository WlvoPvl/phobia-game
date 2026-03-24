import { defineConfig } from 'vite';

export default defineConfig({
  root: '.',
  publicDir: 'public',
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false,
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
        pure_funcs: ['console.log', 'console.info', 'console.warn']
      }
    },
    rollupOptions: {
      input: {
        main: 'index.html'
      },
      output: {
        entryFileNames: 'assets/[name]-[hash].js',
        chunkFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]'
      }
    },
    target: 'es2020',
    cssTarget: 'chrome80'
  },
  server: {
    port: 5173,
    open: true,
    cors: true
  },
  optimizeDeps: {
    include: ['three'],
    exclude: []
  },
  plugins: [{
    name: 'remove-console',
    transform(code, id) {
      if (id.includes('node_modules')) return;
      return code
        .replace(/console\.log\([^)]*\)\s*;?/g, '')
        .replace(/console\.info\([^)]*\)\s*;?/g, '')
        .replace(/console\.warn\([^)]*\)\s*;?/g, '');
    }
  }]
});
