import { spawn } from 'node:child_process';

const esbuild = spawn('node', ['scripts/build-client.mjs', '--watch'], {
  stdio: 'inherit',
});

const astro = spawn('astro', ['dev'], {
  stdio: 'inherit',
});

const shutdown = (signal) => {
  astro.kill(signal);
  esbuild.kill(signal);
};

astro.on('exit', (code) => {
  esbuild.kill('SIGINT');
  process.exit(code ?? 0);
});

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));
