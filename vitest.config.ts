import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./vitest.setup.ts'],
    exclude: ['node_modules', 'dist', '.aios-core', 'avatars', 'supabase', 'docs'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'text-summary', 'html', 'json', 'lcov'],
      reportOnFailure: true,
      reportsDirectory: './coverage',
      all: true,
      include: [
        'App.tsx',
        'index.tsx',
        'types.ts',
        'components/**/*.{ts,tsx}',
        'context/**/*.{ts,tsx}',
        'pages/**/*.{ts,tsx}',
        'services/**/*.{ts,tsx}',
        'utils/**/*.{ts,tsx}',
        'data/**/*.{ts,tsx}',
      ],
      exclude: [
        'node_modules/',
        'dist/',
        'src/',
        'avatars/',
        'supabase/',
        'docs/',
        'tests/',
        '**/*.d.ts',
        '**/*.test.{ts,tsx}',
        '**/__tests__/**',
      ],
      lines: 60,
      functions: 50,
      branches: 60,
      statements: 60,
      perFile: {
        lines: 50,
        functions: 40,
        branches: 50,
        statements: 50,
      },
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
