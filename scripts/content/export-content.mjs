import fs from 'node:fs/promises';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { parse } from 'yaml';
import { frontmatter, walk, pageUrl, writeChanged, collectionsRoot, collectionName } from './documents.mjs';
import { pdfGeneratorHash, pdfInputHash } from './pdf/cache.mjs';

async function pythonExecutable(root) {
  if (process.env.SITE_PYTHON) {
    try { await fs.access(process.env.SITE_PYTHON); }
    catch { throw new Error('SITE_PYTHON does not point to an existing Python executable: ' + process.env.SITE_PYTHON); }
    return process.env.SITE_PYTHON;
  }
  const candidates = process.platform === 'win32'
    ? [path.resolve(root, '../.site-tools/pdf-env/Scripts/python.exe')]
    : [path.resolve(root, '../.site-tools/pdf-env/bin/python')];
  for (const candidate of candidates) {
    try { await fs.access(candidate); return candidate; } catch {}
  }
  return process.platform === 'win32' ? 'python' : 'python3';
}

export async function exportContent(root, { pdf: buildPdf = true } = {}) {
  const config = parse(await fs.readFile(path.join(root, '_config.yml'), 'utf8'));
  const contentRoot = collectionsRoot(root, config);
  const origin = config.url.replace(/\/$/, '') + (config.baseurl || '');
  const pdfScript = path.join(root, 'scripts/content/pdf/export.py');
  const generatorHash = buildPdf ? await pdfGeneratorHash(root) : null;
  const files = (await Promise.all(['_posts', '_notes'].map(dir => walk(path.join(contentRoot, dir))))).flat().filter(file => file.endsWith('.md')).sort();
  const notebooks = (await Promise.all((await walk(path.join(contentRoot, '_notebooks'))).filter(f => f.endsWith('.md')).map(async file => frontmatter(await fs.readFile(file, 'utf8')).data)));
  const downloads = {}, jobs = [];
  const temp = path.join(root, '.preview/exports');
  for (const file of files) {
    const raw = await fs.readFile(file, 'utf8'), { data, body } = frontmatter(raw);
    if (data.redirect_to || data.published === false) continue;
    const date = data.date ? new Date(data.date) : null;
    if (date && date.getTime() > Date.now()) continue;
    if (!data.title || !/^[a-z0-9_-]+$/.test(data.lang_ref || '') || !['en','ru'].includes(data.lang)) throw new Error(file + ': invalid title / lang_ref / lang');
    const note = collectionName(file) === 'notes';
    const url = pageUrl(file, data), canonical = origin + url;
    const key = (note ? 'note-' : 'post-') + data.lang_ref + '-' + data.lang;
    const year = data.copyright_year || String(data.date || '').slice(0, 4) || new Date().getFullYear();
    const author = config.author || 'Aleksandr Petrov';
    const notebook = note ? notebooks.find(s => s.notebook_id === data.notebook && s.lang === data.lang) : null;
    if (note && !notebook) throw new Error('Missing notebook for ' + file);
    const ownership = '© ' + year + ' ' + author + '. ' + (note ? 'Notes by ' + author + '.' : 'Written by ' + author + '.');
    const source = notebook ? 'Source material by ' + notebook.source_author + '. Original materials belong to their respective authors.' : '';
    const absolute = value => /^https?:/.test(value) ? value : origin + '/' + value.replace(/^\//, '');
    const image = data.image ? '![' + (data.image_alt || data.title) + '](' + absolute(data.image) + ')\n\n' + (data.image_caption ? '*' + data.image_caption + '*\n\n' : '') : '';
    let appendix = '', html = '';
    if (buildPdf || data.collect_references) {
      const { renderArticle, renderMarkdown } = await import('./render-markdown.mjs');
      const article = renderArticle(body, data.math, data.lang, data.collect_references === true);
      appendix = article.referencesMarkdown(canonical);
      if (buildPdf) html = (image ? renderMarkdown(image, data.math, data.lang) : '') + article.html;
    }
    const mdBody = (image + body + (appendix ? '\n\n' + appendix : '')).replace(/(!?\[[^\]\n]*\]\()\/(?!\/)/g, '$1' + origin + '/').replace(/((?:src|href)=["'])\/(?!\/)/g, '$1' + origin + '/');
    const markdown = '# ' + data.title + '\n\n' + ownership + '\n\nOriginal publication: [' + canonical + '](' + canonical + ')\n\n' + (source ? source + '\n\nSource: ' + notebook.source_url + '\n\n' : '') + '---\n\n' + mdBody.trim() + '\n';
    const entry = { md: '/assets/downloads/' + key + '.md' };
    const pdfUrl = '/assets/downloads/' + key + '.pdf';
    const pdf = path.join(root, pdfUrl.slice(1));
    const hasPdf = await fs.access(pdf).then(() => true).catch(() => false);
    if (buildPdf || hasPdf) entry.pdf = pdfUrl;
    downloads[url] = entry;
    await writeChanged(path.join(root, entry.md.slice(1)), markdown);
    if (buildPdf) {
      const job = { key, title: data.title, lang: data.lang, author, ownership, source, source_url: notebook?.source_url, canonical, html, pdf, origin, root };
      job.hash = await pdfInputHash(job, generatorHash);
      job.hashFile = path.join(temp, key + '.sha256');
      const cached = await fs.readFile(job.hashFile, 'utf8').catch(() => '');
      if (cached !== job.hash || !hasPdf) jobs.push(job);
    }
  }
  if (jobs.length) {
    const python = await pythonExecutable(root);
    const { preparePdfImages } = await import('./pdf/images.mjs');
    for (const job of jobs) await preparePdfImages(job);
    const jobFile = path.join(temp, 'jobs.json');
    await writeChanged(jobFile, JSON.stringify(jobs, null, 2));
    const result = spawnSync(python, [pdfScript, jobFile], { stdio: 'inherit' });
    if (result.error || result.status !== 0) throw new Error('PDF export failed with Python "' + python + '". Check that this executable runs and has scripts/content/pdf/requirements.txt installed. ' + (result.error?.message || 'Exit code: ' + result.status));
    for (const job of jobs) await writeChanged(job.hashFile, job.hash);
  }
  const previous = JSON.parse(await fs.readFile(path.join(root, '_data/downloads.json'), 'utf8').catch(() => '{}'));
  const activeFiles = new Set(Object.values(downloads).flatMap(entry => [entry.md, entry.pdf, entry.html].filter(Boolean)));
  for (const entry of Object.values(previous)) {
    for (const old of [entry.md, entry.pdf, entry.html].filter(Boolean)) {
      if (activeFiles.has(old)) continue;
      let target;
      if (/^\/assets\/downloads\/(?:post|note)-[a-z0-9_-]+\.(?:md|pdf)$/.test(old)) target = path.join(root, old.slice(1));
      else if (/^compiled\/(?:post|note)-[a-z0-9_-]+\.html$/.test(old)) target = path.join(root, '_includes', old);
      else throw new Error('Unexpected generated file path: ' + old);
      await fs.rm(target, { force: true });
    }
  }
  await writeChanged(path.join(root, '_data/downloads.json'), JSON.stringify(downloads, null, 2) + '\n');
  console.log('Content: ' + Object.keys(downloads).length + ' articles prepared; ' + (buildPdf ? jobs.length + ' PDF(s) rebuilt.' : 'existing PDFs kept (PDF generation is separate).'));
  return { downloads, pdfsRebuilt: jobs.length };
}
