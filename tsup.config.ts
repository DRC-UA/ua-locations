import {defineConfig} from 'tsup'

export default defineConfig({
  entry: {
    index: 'src/index.ts',
  },
  format: ['esm', 'cjs'],
  dts: true,
  esbuildOptions(options) {
    options.charset = 'utf8'
  },
  splitting: true,
  sourcemap: true,
  clean: true,
})
