import { mkdir, rm } from 'node:fs/promises';
import { resolve } from 'node:path';
import { build, context } from 'esbuild';

const entry = resolve('src/scripts/main.ts');
const outDir = resolve('public/scripts');
const outFile = resolve(outDir, 'main.js');
const watch = process.argv.includes('--watch');

await mkdir(outDir, { recursive: true });
await rm(outFile, { force: true });

const buildOptions = {
  entryPoints: [entry],
  bundle: true,
  format: 'esm',
  platform: 'browser',
  target: 'es2019',
  outfile: outFile,
  sourcemap: process.env.NODE_ENV === 'production' ? false : 'inline',
  logLevel: 'info',
};

if (watch) {
  const ctx = await context({ ...buildOptions, minify: false });
  await ctx.watch();
  console.log('[build-client] watching src/scripts/main.ts -> public/scripts/main.js');

  const close = async () => {
    await ctx.dispose();
    process.exit(0);
  };

  process.on('SIGINT', close);
  process.on('SIGTERM', close);
} else {
  await build(buildOptions);
}
