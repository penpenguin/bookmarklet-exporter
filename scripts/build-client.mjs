#!/usr/bin/env node
import { build } from 'esbuild';
import path from 'node:path';

const outdir = path.resolve('public', 'scripts');

await build({
  entryPoints: {
    main: 'src/scripts/main.ts',
    'editor.worker': 'src/monaco/editor.worker.ts',
    'json.worker': 'src/monaco/json.worker.ts',
    'ts.worker': 'src/monaco/ts.worker.ts',
  },
  bundle: true,
  format: 'esm',
  target: 'es2020',
  outdir,
  sourcemap: true,
  logLevel: 'info',
  loader: {
    '.css': 'css',
    '.ttf': 'file',
    '.woff': 'file',
    '.woff2': 'file',
  },
});
