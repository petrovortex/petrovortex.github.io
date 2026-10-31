// Social crawlers read static metadata and raster images, not browser scripts.
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
import { parse } from 'yaml';
import { Resvg, initWasm } from '@resvg/resvg-wasm';
import { frontmatter, walk, within, collectionsRoot, writeChanged } from '../content/documents.mjs';

let ready;
async function renderSvg(bytes) {
  ready ||= fs.readFile(fileURLToPath(import.meta.resolve('@resvg/resvg-wasm/index_bg.wasm'))).then(initWasm);
  await ready;
  const renderer = new Resvg(bytes, { fitTo: { mode: 'width', value: 1200 }, background: '#faf9f6' });
  const pixels = renderer.render();
  try { return { bytes: Buffer.from(pixels.asPng()), width: pixels.width, height: pixels.height }; }
  finally { pixels.free(); renderer.free(); }
}

// Keep the order aligned with _includes/site/social-meta.html.
export function previewSource(data, portrait) {
  if (data.image) return data.image;
  if (data.banner) return '/assets/images/banners/' + data.banner + '.svg';
  if (['blog', 'library'].includes(data.layout)) return '/assets/images/banners/' + data.layout + '.svg';
  return data.preview_image || portrait;
}

export async function buildSocialPreviews(root) {
  const config = parse(await fs.readFile(path.join(root, '_config.yml'), 'utf8'));
  const profile = parse(await fs.readFile(path.join(root, '_data/profile.yml'), 'utf8'));
  const sources = new Set([profile.portrait]);
  const files = [...await walk(collectionsRoot(root, config)), ...await walk(path.join(root, 'pages'))];
  for (const file of files.filter(file => /\.(md|html)$/.test(file))) {
    const { data } = frontmatter(await fs.readFile(file, 'utf8'));
    if (data.redirect_to || data.published === false) continue;
    sources.add(previewSource(data, profile.portrait));
  }
  const index = {};
  let changed = 0;
  for (const source of [...sources].filter(Boolean).sort()) {
    // Remote raster covers remain remote; never download remote files at build time.
    if (/^https?:\/\//i.test(source)) {
      if (!/\.(png|jpe?g|gif|webp)(?:[?#]|$)/i.test(source)) throw new Error('Link previews need a local SVG or a raster image: ' + source);
      continue;
    }
    if (!source.startsWith('/assets/')) throw new Error('Preview image must be under /assets/: ' + source);
    const cleanPath = decodeURIComponent(source.split(/[?#]/)[0]);
    const file = within(path.join(root, 'assets'), cleanPath.slice('/assets/'.length));
    const real = await fs.realpath(file);
    within(path.join(root, 'assets'), path.relative(path.join(root, 'assets'), real));
    let bytes = await fs.readFile(file);
    const extension = path.extname(cleanPath).toLowerCase();
    const type = { '.svg': 'image/png', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.gif': 'image/gif', '.webp': 'image/webp' }[extension];
    if (!type) throw new Error('Unsupported preview image: ' + source);
    let width, height;
    if (extension === '.svg') ({ bytes, width, height } = await renderSvg(bytes));
    // New bytes get a new public URL; unchanged images do not create new files.
    const digest = createHash('sha256').update(bytes).digest('hex').slice(0, 16);
    const stem = path.basename(cleanPath, path.extname(cleanPath)).replace(/[^a-z0-9_-]/gi, '-');
    const output = '/assets/images/social/' + stem + '-' + digest + (extension === '.svg' ? '.png' : extension);
    changed += await writeChanged(path.join(root, output.slice(1)), bytes) ? 1 : 0;
    index[source] = { path: output, type, ...(width ? { width, height } : {}) };
  }
  changed += await writeChanged(path.join(root, '_data/social_images.json'), JSON.stringify(index, null, 2) + '\n') ? 1 : 0;
  console.log('Link previews: ' + Object.keys(index).length + ' image(s), ' + changed + ' changed file(s).');
  return index;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const root = process.argv[2] ? path.resolve(process.argv[2]) : fileURLToPath(new URL('../../', import.meta.url));
  await buildSocialPreviews(root);
}
