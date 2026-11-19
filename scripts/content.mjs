import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { parse } from 'yaml';
import { importObsidian, DEFAULT_MANIFEST } from './content/import-obsidian.mjs';
import { exportContent } from './content/export-content.mjs';
import { walk, collectionsRoot } from './content/documents.mjs';
const rootArg = process.argv.indexOf('--root');
if (rootArg >= 0 && !process.argv[rootArg + 1]) throw new Error('--root requires a site folder.');
const root = rootArg >= 0 ? path.resolve(process.argv[rootArg + 1]) : path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const watch = process.argv.includes('--watch'), exportsOnly = process.argv.includes('--exports-only');
const webOnly = process.argv.includes('--web-only');
const arg = process.argv.indexOf('--vault');
const vault = arg >= 0 ? process.argv[arg + 1] : process.env.OBSIDIAN_VAULT;
async function sync() {
  if (!exportsOnly) await importObsidian(root, DEFAULT_MANIFEST, vault);
  // Isolate the SVG renderer from the PDF exporter's WASM instance.
  const previewScript = path.join(path.dirname(fileURLToPath(import.meta.url)), 'artwork/build-social-previews.mjs');
  execFileSync(process.execPath, [previewScript, root], { stdio: 'inherit' });
  await exportContent(root, { pdf: !webOnly });
}
async function fingerprint() {
  const manifestPath = path.join(root, DEFAULT_MANIFEST);
  const manifest = parse(await fs.readFile(manifestPath, 'utf8'));
  const config = parse(await fs.readFile(path.join(root, '_config.yml'), 'utf8'));
  const contentRoot = collectionsRoot(root, config);
  const vaultRoot = path.resolve(root, vault || manifest.vault);
  const sources = exportsOnly ? [] : (manifest.items || []).map(item => path.resolve(vaultRoot, item.source));
  // Attachment changes are detected without importing any additional notes.
  const attachments = exportsOnly ? [] : (await walk(vaultRoot)).filter(f => /\.(png|jpe?g|gif|webp|svg|pdf)$/i.test(f));
  const directories = ['_posts', '_notes', '_courses'].map(dir => path.join(contentRoot, dir));
  directories.push(path.join(root, 'assets/images'), path.join(root, 'assets/imported'));
  const site = (await Promise.all(directories.map(walk))).flat();
  site.push(...await walk(path.join(root, 'pages')), ...await walk(path.join(root, '_data')));
  const hash = createHash('sha256');
  for (const file of [...new Set([manifestPath, path.join(root,'_config.yml'), ...sources, ...attachments, ...site])].sort()) {
    const stat = await fs.stat(file);
    hash.update(file + ':' + stat.size + ':' + stat.mtimeMs);
  }
  return hash.digest('hex');
}
try {
  await sync();
  if (watch) {
    let previous = await fingerprint();
    console.log(exportsOnly
      ? 'Watching site content. Ctrl+C stops.'
      : 'Watching selected Obsidian notes and site content. Ctrl+C stops.');
    // A sequential loop avoids overlapping writes when a save triggers several events.
    while (true) {
      await new Promise(resolve => setTimeout(resolve, 1500));
      try {
        const current = await fingerprint();
        if (current !== previous) {
          previous = current;
          await sync();
          previous = await fingerprint();
        }
      } catch (error) { console.error(error.message); }
    }
  }
} catch (error) { console.error(error.message); process.exitCode = 1; }
