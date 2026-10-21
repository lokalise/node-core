import { defineConfig } from 'tsup'

// biome-ignore lint/style/noDefaultExport: tsup loads its config from the default export
export default defineConfig({
  entry: ['src/index.ts'],
  format: ['cjs', 'esm'],
  outDir: 'dist',
  clean: true,
  dts: true,
  sourcemap: true,
})
