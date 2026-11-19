import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import { exportContent } from '../../scripts/content/export-content.mjs';
import { pdfInputHash } from '../../scripts/content/pdf/cache.mjs';

async function fixture(t) {
  const parent = path.resolve('.preview');
  await fs.mkdir(parent, { recursive: true });
  const root = await fs.mkdtemp(path.join(parent, 'exports-test-'));
  t.after(async () => { assert.equal(path.dirname(root), parent); await fs.rm(root, { recursive: true, force: true }); });
  const write = async (file, bytes) => {
    const target = path.join(root, file);
    await fs.mkdir(path.dirname(target), { recursive: true });
    await fs.writeFile(target, bytes);
  };
  await write('_config.yml', 'url: https://example.com\nauthor: Example Author\ncollections_dir: content\n');
  return { root, write };
}

test('web preparation needs no Python, updates Markdown, and preserves existing PDFs', async t => {
  const { root, write } = await fixture(t);
  const previousPython = process.env.SITE_PYTHON;
  process.env.SITE_PYTHON = path.join(root, 'missing-python.exe');
  t.after(() => { if (previousPython === undefined) delete process.env.SITE_PYTHON; else process.env.SITE_PYTHON = previousPython; });
  const post = 'content/_posts/en/2026-01-01-example-en.md';
  const source = '---\ntitle: Example\nlang: en\nlang_ref: example\nmath: true\ndate: 2026-01-01\n---\n## First\nAn inline $x^2$ and a citation.[^one]\n\n[^one]: [Source](https://example.org/paper)\n';
  await write(post, source);
  let result = await exportContent(root, { pdf: false });
  const entry = result.downloads['/example-en/'];
  assert(entry.md);
  assert.equal(entry.html, undefined, 'Eleventy renders article HTML directly');
  assert.equal(entry.pdf, undefined, 'a new article must not link to a nonexistent PDF');
  assert.equal(result.pdfsRebuilt, 0);
  assert((await fs.readFile(path.join(root, entry.md), 'utf8')).includes('© 2026 Example Author'));
  const markdown = await fs.readFile(path.join(root, entry.md), 'utf8');
  assert(markdown.includes('$x^2$'));
  assert(markdown.includes('[^one]: [Source](https://example.org/paper)'));
  const pdf = '/assets/downloads/post-example-en.pdf';
  await write(pdf, '%PDF-preserved');
  const pdfTime = (await fs.stat(path.join(root, pdf))).mtimeMs;
  await write(post, source.replace('$x^2$', '$x^3$'));
  result = await exportContent(root, { pdf: false });
  assert.equal(result.downloads['/example-en/'].pdf, pdf);
  assert.equal(await fs.readFile(path.join(root, pdf), 'utf8'), '%PDF-preserved');
  assert.equal((await fs.stat(path.join(root, pdf))).mtimeMs, pdfTime);
  assert((await fs.readFile(path.join(root, entry.md), 'utf8')).includes('$x^3$'));
  assert.deepEqual(JSON.parse(await fs.readFile(path.join(root, '_data/downloads.json'), 'utf8')), result.downloads);
});

test('PDF cache ignores unrelated site assets and tracks referenced image bytes and document metadata', async t => {
  const { root, write } = await fixture(t);
  await write('assets/figure.png', 'first image bytes');
  await write('assets/other.png', 'another image');
  await write('assets/css/style.css', 'body { color: black; }');
  const job = { root, origin: 'https://example.com', title: 'A paper', lang: 'en', author: 'Author', ownership: '© Author', canonical: 'https://example.com/paper/', html: '<p>Text</p><img src="https://example.com/assets/figure.png">' };
  const other = { ...job, html: '<p>Another paper</p><img src="/assets/other.png">' };
  const initial = await pdfInputHash(job, 'generator');
  const otherInitial = await pdfInputHash(other, 'generator');
  await write('assets/css/style.css', 'body { color: blue; }');
  await write('assets/unrelated-banner.svg', '<svg/>');
  assert.equal(await pdfInputHash(job, 'generator'), initial);
  await write('assets/figure.png', 'updated image bytes');
  assert.notEqual(await pdfInputHash(job, 'generator'), initial);
  assert.equal(await pdfInputHash(other, 'generator'), otherInitial);
  assert.notEqual(await pdfInputHash({ ...other, source_url: 'https://example.com/course' }, 'generator'), otherInitial);
  assert.notEqual(await pdfInputHash({ ...other, author: 'Different Author' }, 'generator'), otherInitial);
  await assert.rejects(pdfInputHash({ ...job, html: '<img src="/assets/missing.png">' }, 'generator'), /Missing article image/);
  await assert.rejects(pdfInputHash({ ...job, html: '<img src="/../private.png">' }, 'generator'), /escapes its root/);
});

test('an invalid explicit SITE_PYTHON fails clearly instead of selecting a different interpreter', async t => {
  const { root, write } = await fixture(t);
  await write('content/_posts/en/2026-01-01-example-en.md', '---\ntitle: Example\nlang: en\nlang_ref: example\n---\nText.');
  for (const file of ['scripts/content/pdf/export.py', 'scripts/content/pdf/images.mjs', 'scripts/content/pdf/requirements.txt']) {
    await write(file, await fs.readFile(file));
  }
  const previousPython = process.env.SITE_PYTHON;
  process.env.SITE_PYTHON = path.join(root, 'missing-python.exe');
  t.after(() => { if (previousPython === undefined) delete process.env.SITE_PYTHON; else process.env.SITE_PYTHON = previousPython; });
  await assert.rejects(exportContent(root), /SITE_PYTHON does not point to an existing Python executable/);
});
