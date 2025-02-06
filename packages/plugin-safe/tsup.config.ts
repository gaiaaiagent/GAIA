import { defineConfig} from 'tsup'

export default defineConfig({
  entry: ['src/index.ts'],
  outDir: 'dist',
  sourcemap: true,
  clean: true,
  format: ['esm'],
  dts: true,
  external: [
    '@elizaos/core',
    '@safe-global/protocol-kit',
    '@safe-global/api-kit',
    '@safe-global/safe-core-sdk-types',
    '@safe-global/relay-kit'
  ]
})