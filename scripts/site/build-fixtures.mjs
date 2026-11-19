import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
import { parse } from 'yaml';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const source = path.join(root, '.preview/fixture-source');
const output = path.join(root, '.preview/fixture-site');
const config = parse(await fs.readFile(path.join(root, '_config.yml'), 'utf8'));
const content = config.collections_dir || 'content';

// Both paths are fixed generated directories under this checkout, never source content.
for (const directory of [source, output]) {
  const relative = path.relative(root, directory);
  if (!relative.startsWith('.preview' + path.sep) || path.isAbsolute(relative)) throw new Error('Unexpected fixture path: ' + directory);
  const existing = await fs.lstat(directory).catch(error => { if (error.code === 'ENOENT') return null; throw error; });
  if (existing?.isSymbolicLink()) throw new Error('Fixture directory must not be a link: ' + directory);
  await fs.rm(directory, { recursive: true, force: true });
}
await fs.mkdir(source, { recursive: true });
for (const name of ['_config.yml', 'eleventy.config.js', '_layouts', '_includes', '_data', 'assets', 'pages', 'scripts', 'config', 'package.json']) {
  await fs.cp(path.join(root, name), path.join(source, name), { recursive: true });
}
for (const name of ['_posts', '_courses', '_notes']) {
  const destination = path.join(source, content, name);
  await fs.mkdir(destination, { recursive: true });
  if (name === '_posts') await fs.cp(path.join(root, content, name), destination, { recursive: true });
  else {
    const directoryData = name + '.11tydata.json';
    await fs.copyFile(path.join(root, content, name, directoryData), path.join(destination, directoryData));
  }
  await fs.cp(path.join(root, 'tests/fixtures/content', name), destination, { recursive: true });
}
const cli = path.join(root, 'node_modules/@11ty/eleventy/cmd.cjs');
const result = spawnSync(process.execPath, [cli, '--output=' + output], {
  cwd: source, stdio: 'inherit', env: { ...process.env, SITE_PREVIEW: '1' },
});
if (result.error) throw result.error;
if (result.status !== 0) process.exitCode = result.status || 1;
else console.log('Synthetic fixtures built under .preview/fixture-site (excluded from publication).');
