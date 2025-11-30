import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [
    react({
      // Enable Fast Refresh
      fastRefresh: true,
      // Optimize JSX runtime
      jsxRuntime: 'automatic',
    }),
  ],
  build: {
    target: 'es2015',
    outDir: 'dist',
    sourcemap: false,
    minify: 'terser',
    cssMinify: true,
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          // Vendor chunks for better caching
          if (id.includes('node_modules')) {
            if (id.includes('react') || id.includes('react-dom')) {
              return 'react-vendor';
            }
            if (id.includes('leaflet')) {
              return 'map-vendor';
            }
            if (id.includes('react-aria')) {
              return 'aria-vendor';
            }
            // Other node_modules go into vendor chunk
            return 'vendor';
          }
          // Split by feature
          if (id.includes('/components/')) {
            return 'components';
          }
          if (id.includes('/services/')) {
            return 'services';
          }
        },
        // Optimize chunk naming for better caching
        chunkFileNames: 'assets/[name]-[hash].js',
        entryFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]',
      },
    },
    // Terser options for better minification
    terserOptions: {
      compress: {
        drop_console: true, // Remove console.log in production
        drop_debugger: true,
        pure_funcs: ['console.log', 'console.info', 'console.debug'],
      },
      format: {
        comments: false, // Remove comments
      },
    },
    // Enable compression reporting
    reportCompressedSize: true,
  },
  optimizeDeps: {
    include: ['react', 'react-dom', 'leaflet', 'react-aria'],
    // Exclude large dependencies that should be loaded on demand
    exclude: [],
  },
  // Performance optimizations
  server: {
    hmr: {
      overlay: true,
    },
    // Enable compression in dev mode
    compress: true,
  },
  // Preview server configuration
  preview: {
    port: 4173,
    strictPort: true,
    open: true,
  },
  test: {
    globals: true,
    environment: 'happy-dom',
    setupFiles: './src/test/setup.ts',
  },
});
