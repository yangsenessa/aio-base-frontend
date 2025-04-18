import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import fs from 'fs';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 4943,
    https: {
      key: fs.readFileSync('/Users/senyang/project/certificates/private.key'),
      cert: fs.readFileSync('/Users/senyang/project/certificates/certificate.crt')
    },
    proxy: {
      '/api': {
        target: 'https://localhost:4943',
        changeOrigin: true,
        secure: false
      }
    },
    headers: {
      'Content-Security-Policy': `
        default-src * 'unsafe-inline' 'unsafe-eval' data: blob:;
        script-src * 'unsafe-inline' 'unsafe-eval' blob:;
        style-src * 'unsafe-inline';
        img-src * data: blob:;
        connect-src * blob:;
        font-src *;
        object-src *;
        media-src *;
        frame-src *;
      `.replace(/\s+/g, ' ').trim(),
      'Permissions-Policy': '',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': '*',
      'Access-Control-Allow-Headers': '*',
      'Access-Control-Allow-Credentials': 'true',
      'Access-Control-Max-Age': '86400'
    }
  },
  plugins: [
    react(),
    mode === 'development' && componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "declarations": path.resolve(__dirname, "./declarations"),
      "@dfinity/identity": "@dfinity/identity"
    },
  },
  define: {
    // Make environment variables accessible to client code safely
    'process.env.CANISTER_ID_AIO_BASE_BACKEND': JSON.stringify(process.env.CANISTER_ID_AIO_BASE_BACKEND || 'ryjl3-tyaaa-aaaaa-aaaba-cai'),
    'process.env.CANISTER_ID_AIO_BASE_FRONTEND': JSON.stringify(process.env.CANISTER_ID_AIO_BASE_FRONTEND || 'r7inp-6aaaa-aaaaa-aaabq-cai'),
    'process.env.DFX_NETWORK': JSON.stringify(process.env.DFX_NETWORK || 'ic'),
    'window.__CANISTER_ID_AIO_BASE_BACKEND': JSON.stringify(process.env.CANISTER_ID_AIO_BASE_BACKEND || 'ryjl3-tyaaa-aaaaa-aaaba-cai'),
    'window.__CANISTER_ID_AIO_BASE_FRONTEND': JSON.stringify(process.env.CANISTER_ID_AIO_BASE_FRONTEND || 'r7inp-6aaaa-aaaaa-aaabq-cai'),
  },
  optimizeDeps: {
    include: [
      "@dfinity/agent",
      "@dfinity/auth-client",
      "@dfinity/principal",
      "@dfinity/candid",
      "@dfinity/identity"
    ]
  },
  build: {
    // Increase the warning limit to avoid warnings for larger chunks
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        // Implement manual chunks to better organize and split the code
        manualChunks: {
          vendor: [
            'react', 
            'react-dom', 
            'react-router-dom',
            '@tanstack/react-query'
          ],
          dfinity: [
            '@dfinity/agent',
            '@dfinity/auth-client',
            '@dfinity/principal',
            '@dfinity/candid',
            '@dfinity/identity'
          ],
          ui: [
            '@radix-ui/react-accordion',
            '@radix-ui/react-alert-dialog',
            '@radix-ui/react-aspect-ratio',
            '@radix-ui/react-avatar',
            '@radix-ui/react-checkbox',
            '@radix-ui/react-collapsible',
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
            '@radix-ui/react-tooltip'
          ],
          utils: [
            'class-variance-authority',
            'clsx',
            'tailwind-merge',
            'lucide-react',
            'zod',
            'date-fns'
          ],
          forms: [
            'react-hook-form',
            '@hookform/resolvers'
          ]
        }
      }
    }
  }
}));
