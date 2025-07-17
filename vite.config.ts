// vite.config.ts
import { resolve } from 'path';
import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';

export default defineConfig({
  root: '.', // <-- Add this line: serves from project root
  build: {
    outDir: 'dist',
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'PenpotRenderer',
      fileName: 'penpot-renderer',
    },
  },
  plugins: [
    dts({
      tsconfigPath: resolve(__dirname, 'tsconfig.json'),
      insertTypesEntry: true,
      include: ['src/types/**/*.ts', 'src/index.ts', 'src/renderer.ts'],
    }),
  ],
});
