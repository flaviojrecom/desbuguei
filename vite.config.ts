import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', 'VITE_');
    return {
      server: {
        port: 3000,
        host: '0.0.0.0',
      },
      plugins: [react()],
      define: {
        '__GEMINI_API_KEY__': JSON.stringify(env.VITE_GEMINI_API_KEY || ''),
        '__SUPABASE_URL__': JSON.stringify(env.VITE_SUPABASE_URL || ''),
        '__SUPABASE_ANON_KEY__': JSON.stringify(env.VITE_SUPABASE_ANON_KEY || ''),
        '__SENTRY_DSN__': JSON.stringify(env.VITE_SENTRY_DSN || '')
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      },
      build: {
        // Generate source maps for production error tracking
        sourcemap: true,
        // Minimize source maps size
        rollupOptions: {
          output: {
            sourcemapIgnoreList: (relativeSourcePath) => {
              return relativeSourcePath.includes('node_modules');
            }
          }
        }
      }
    };
});
