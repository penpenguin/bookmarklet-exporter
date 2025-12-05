import { mkdir, rm } from 'node:fs/promises';
import { resolve } from 'node:path';
import { build } from 'esbuild';

const entry = resolve('src/scripts/main.ts');
const outDir = resolve('public/scripts');
const outFile = resolve(outDir, 'main.js');

await mkdir(outDir, { recursive: true });
await rm(outFile, { force: true });

await build({
  entryPoints: [entry],
  bundle: true,
  format: 'esm',
  platform: 'browser',
  target: 'es2019',
  outfile: outFile,
  sourcemap: process.env.NODE_ENV === 'production' ? false : 'inline',
  logLevel: 'info',
});
