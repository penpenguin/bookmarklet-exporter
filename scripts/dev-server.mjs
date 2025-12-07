#!/usr/bin/env node
import { context } from 'esbuild';
import { spawn } from 'node:child_process';

const esbuildCtx = await context({
  entryPoints: {
    main: 'src/scripts/main.ts',
    'editor.worker': 'src/monaco/editor.worker.ts',
    'json.worker': 'src/monaco/json.worker.ts',
    'ts.worker': 'src/monaco/ts.worker.ts',
  },
  bundle: true,
  format: 'esm',
  target: 'es2020',
  outdir: 'public/scripts',
  sourcemap: true,
  logLevel: 'silent',
  loader: {
    '.css': 'css',
    '.ttf': 'file',
    '.woff': 'file',
    '.woff2': 'file',
  },
});

await esbuildCtx.watch();

const astro = spawn('npx', ['astro', 'dev', '--host'], {
  stdio: 'inherit',
  env: process.env,
});

process.on('SIGINT', async () => {
  astro.kill('SIGINT');
  await esbuildCtx.dispose();
  process.exit(0);
});

astro.on('close', async () => {
  await esbuildCtx.dispose();
  process.exit(0);
});
