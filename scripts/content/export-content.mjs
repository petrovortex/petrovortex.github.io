import fs from 'node:fs/promises';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { spawnSync } from 'node:child_process';
import { parse } from 'yaml';
import { frontmatter, walk, pageUrl, writeChanged, collectionsRoot, collectionName } from './documents.mjs';
import { preparePdfImages } from './pdf/images.mjs';
import { renderArticle, renderMarkdown } from './render-markdown.mjs';

export async function exportContent(root) {
  const config = parse(await fs.readFile(path.join(root, '_config.yml'), 'utf8'));
  const contentRoot = collectionsRoot(root, config);
  const origin = config.url.replace(/\/$/, '') + (config.baseurl || '');
  const pdfScript = path.join(root, 'scripts/content/pdf/export.py');
  const generatorHash = createHash('sha256').update(await fs.readFile(pdfScript)).update(await fs.readFile(path.join(root, 'scripts/content/render-markdown.mjs'))).update(await fs.readFile(path.join(root, 'scripts/content/export-content.mjs'))).update(await fs.readFile(path.join(root, 'scripts/content/pdf/images.mjs'))).digest('hex');
  const files = (await Promise.all(['_posts', '_notes'].map(dir => walk(path.join(contentRoot, dir))))).flat().filter(file => file.endsWith('.md')).sort();
  const courses = (await Promise.all((await walk(path.join(contentRoot, '_courses'))).filter(f => f.endsWith('.md')).map(async file => frontmatter(await fs.readFile(file, 'utf8')).data)));
  const downloads = {}, jobs = [];
  const temp = path.join(root, '.preview/exports'); await fs.mkdir(temp, { recursive: true });
  const pythonCandidates = [process.env.SITE_PYTHON, path.resolve(root, '../.site-tools/pdf-env/Scripts/python.exe'), path.resolve(root, '../.site-tools/pdf-env/bin/python')].filter(Boolean);
  const python = (await Promise.all(pythonCandidates.map(async p => await fs.access(p).then(() => p).catch(() => null)))).find(Boolean) || (process.platform === 'win32' ? 'python' : 'python3');
  const assetHash = createHash('sha256');
  for (const file of (await walk(path.join(root, 'assets'))).filter(file => !file.includes(path.sep + 'downloads' + path.sep)).sort()) assetHash.update(await fs.readFile(file));
  const assetDigest = assetHash.digest('hex');
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
    const author = config.author || 'Alexander Petrov';
    const course = note ? courses.find(s => s.course_id === data.course && s.lang === data.lang) : null;
    if (note && !course) throw new Error('Missing course for ' + file);
    const ownership = '© ' + year + ' ' + author + '. ' + (note ? 'Study notes by ' + author + '.' : 'Written by ' + author + '.');
    const source = course ? 'Based on ' + course.title + ' by ' + course.source_author + '. Original course materials belong to their respective authors.' : '';
    const absolute = value => /^https?:/.test(value) ? value : origin + '/' + value.replace(/^\//, '');
    const image = data.image ? '![' + (data.image_alt || data.title) + '](' + absolute(data.image) + ')\n\n' + (data.image_caption ? '*' + data.image_caption + '*\n\n' : '') : '';
    const mdBody = (image + body).replace(/(!?\[[^\]\n]*\]\()\/(?!\/)/g, '$1' + origin + '/').replace(/((?:src|href)=["'])\/(?!\/)/g, '$1' + origin + '/');
    const markdown = '# ' + data.title + '\n\n' + ownership + '\n\nOriginal publication: [' + canonical + '](' + canonical + ')\n\n' + (source ? source + '\n\nCourse: ' + course.source_url + '\n\n' : '') + '---\n\n' + mdBody.trim() + '\n';
    const article = renderArticle(body, data.math, data.lang);
    const html = image ? renderMarkdown(image + body, data.math, data.lang) : article.html;
    const entry = { md: '/assets/downloads/' + key + '.md', pdf: '/assets/downloads/' + key + '.pdf' };
    if (data.math || article.hasFootnotes) {
      entry.html = 'compiled/' + key + '.html';
      await writeChanged(path.join(root, '_includes', entry.html), '{% raw %}\n' + article.html + '{% endraw %}\n');
    }
    downloads[url] = entry;
    await writeChanged(path.join(root, entry.md.slice(1)), markdown);
    const hash = createHash('sha256').update(markdown).update(generatorHash).update(assetDigest).digest('hex');
    const hashFile = path.join(temp, key + '.sha256');
    const pdf = path.join(root, entry.pdf.slice(1));
    const cached = await fs.readFile(hashFile, 'utf8').catch(() => '');
    if (cached !== hash || !await fs.access(pdf).then(() => true).catch(() => false)) {
      jobs.push({ key, title: data.title, lang: data.lang, author, ownership, source, source_url: course?.source_url, canonical, html, pdf, hashFile, hash, origin, root });
    }
  }
  if (jobs.length) {
    for (const job of jobs) await preparePdfImages(job);
    const jobFile = path.join(temp, 'jobs.json');
    await writeChanged(jobFile, JSON.stringify(jobs, null, 2));
    const result = spawnSync(python, [pdfScript, jobFile], { stdio: 'inherit' });
    if (result.error || result.status !== 0) throw new Error('PDF export failed. Set SITE_PYTHON or install scripts/content/pdf/requirements.txt. ' + (result.error?.message || ''));
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
  console.log('Downloads: ' + Object.keys(downloads).length + ' articles, ' + jobs.length + ' PDF(s) rebuilt.');
}
