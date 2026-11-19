import fs from 'node:fs/promises';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { JSDOM } from 'jsdom';
import { within } from '../documents.mjs';

export async function pdfGeneratorHash(root) {
  const hash = createHash('sha256');
  for (const file of ['scripts/content/pdf/export.py', 'scripts/content/pdf/images.mjs', 'scripts/content/pdf/requirements.txt']) {
    hash.update(file).update(await fs.readFile(path.join(root, file)));
  }
  hash.update(process.env.SITE_FONT_DIR || 'system fonts');
  return hash.digest('hex');
}

// A PDF depends on its own rendered content and images, not the site's CSS,
// JavaScript, thumbnails, or unrelated articles.
export async function pdfInputHash(job, generatorHash) {
  const { title, lang, author, ownership, source, source_url, canonical, html } = job;
  const hash = createHash('sha256').update(generatorHash).update(JSON.stringify({ title, lang, author, ownership, source, source_url, canonical, html }));
  const dom = new JSDOM(html);
  try {
    const images = new Set([...dom.window.document.querySelectorAll('img[src]')].map(img => img.getAttribute('src')));
    for (let src of [...images].sort()) {
      if (src.startsWith(job.origin + '/')) src = src.slice(job.origin.length);
      else if (/^[a-z][a-z\d+.-]*:/i.test(src) || src.startsWith('//')) continue;
      const file = within(job.root, decodeURIComponent(src).replace(/^\//, ''));
      try { hash.update(src).update(await fs.readFile(file)); }
      catch (error) {
        if (error.code === 'ENOENT') throw new Error('Missing article image: ' + src, { cause: error });
        throw error;
      }
    }
  } finally { dom.window.close(); }
  return hash.digest('hex');
}
