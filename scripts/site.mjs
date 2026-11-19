import fs from 'node:fs/promises';
import path from 'node:path';
import net from 'node:net';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const usage = 'Usage: node scripts/site.mjs [serve|build|validate|fixtures] [--port 4000]';

export function parseArguments(args) {
  const [command = 'serve', ...options] = args;
  if (!['serve', 'build', 'validate', 'fixtures'].includes(command)) throw new Error(usage);
  let port = 4000;
  if (options.length) {
    if (command !== 'serve' || options.length !== 2 || options[0] !== '--port' || !/^\d+$/.test(options[1])) throw new Error(usage);
    port = Number(options[1]);
    if (port < 1 || port > 65535) throw new Error('Port must be an integer between 1 and 65535.');
  }
  return { command, port };
}

export async function ensurePortAvailable(port) {
  await new Promise((resolve, reject) => {
    const server = net.createServer();
    server.once('error', error => reject(error.code === 'EADDRINUSE'
      ? new Error('Port ' + port + ' is already in use. Open http://127.0.0.1:' + port + '/ or stop its preview terminal with Ctrl+C. For a separate preview: npm run dev -- --port 4001.')
      : error));
    server.listen(port, '127.0.0.1', () => server.close(resolve));
  });
}

async function cleanOutput() {
  const output = path.resolve(root, '_site');
  if (path.relative(root, output) !== '_site') throw new Error('Unexpected generated output path: ' + output);
  const existing = await fs.lstat(output).catch(error => {
    if (error.code === 'ENOENT') return null;
    throw error;
  });
  if (existing?.isSymbolicLink()) throw new Error('Refusing to clean a linked output directory: ' + output);
  await fs.rm(output, { recursive: true, force: true });
}

async function main() {
  const { command, port } = parseArguments(process.argv.slice(2));
  if (command === 'serve') await ensurePortAvailable(port);
  const eleventy = path.join(root, 'node_modules/@11ty/eleventy/cmd.cjs');
  const browserSync = path.join(root, 'node_modules/browser-sync/dist/bin.js');
  try { await fs.access(eleventy); }
  catch { throw new Error('Site dependencies are missing. Run npm ci in the site folder first.'); }
  if (command === 'serve') {
    try { await fs.access(browserSync); }
    catch { throw new Error('Preview dependencies are missing. Run npm ci in the site folder first.'); }
  }
  const children = new Set();
  let stopping = false;
  const stop = () => {
    stopping = true;
    for (const child of children) child.kill('SIGTERM');
  };
  process.on('SIGINT', stop);
  process.on('SIGTERM', stop);

  function run(args, label) {
    const child = spawn(process.execPath, args, {
      cwd: root, stdio: 'inherit', shell: false, windowsHide: true,
      env: { ...process.env, SITE_PREVIEW: command === 'serve' ? '1' : '0' },
    });
    children.add(child);
    return new Promise((resolve, reject) => {
      child.once('error', error => {
        children.delete(child);
        reject(new Error(label + ' could not start: ' + error.message));
      });
      child.once('close', (code, signal) => {
        children.delete(child);
        if (stopping || code === 0) resolve();
        else reject(new Error(label + ' stopped (' + (signal || 'exit ' + code) + '). See the first error above.'));
      });
    });
  }

  try {
    if (command === 'build') {
      await run([path.join(root, 'scripts/content.mjs'), '--exports-only'], 'Download generation');
    }
    if (stopping) return;
    if (command === 'serve' || command === 'build') await cleanOutput();
    if (command === 'serve') {
      console.log('Preview prepares pages, Markdown downloads and link images. PDF generation is separate: npm run content:exports.');
      await run([eleventy], 'Initial preview build');
      if (stopping) return;
      const watcher = run([eleventy, '--watch', '--ignore-initial'], 'Eleventy watcher');
      const server = run([browserSync, 'start', '--config', path.join(root, 'config/preview.cjs'), '--port', String(port)], 'BrowserSync');
      // If either standard tool exits, stop the other instead of leaving an orphaned preview.
      try { await Promise.race([watcher, server]); }
      finally { stop(); await Promise.allSettled([watcher, server]); }
    } else if (command === 'build') {
      await run([eleventy], 'Eleventy build');
    } else if (command === 'validate') {
      await run([path.join(root, 'scripts/site/validate-content.mjs')], 'Content validation');
    } else {
      await run([path.join(root, 'scripts/site/build-fixtures.mjs')], 'Fixture build');
    }
  } finally {
    stop();
    process.removeListener('SIGINT', stop);
    process.removeListener('SIGTERM', stop);
  }
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().catch(error => { console.error(error.message); process.exitCode = 1; });
}
