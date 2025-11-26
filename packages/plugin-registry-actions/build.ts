#!/usr/bin/env bun
import { createBuildRunner } from '../../build-utils';

const run = createBuildRunner({
  packageName: '@elizaos/plugin-registry-actions',
  buildOptions: {
    entrypoints: ['src/index.ts'],
    outdir: 'dist',
    target: 'node',
    format: 'esm',
    external: [
      '@elizaos/core',
    ],
    sourcemap: true,
    minify: false,
    generateDts: true,
  },
});

run().catch((error) => {
  console.error('Build script error:', error);
  process.exit(1);
});
