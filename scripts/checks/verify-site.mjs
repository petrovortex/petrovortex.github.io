import fs from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert/strict';
import { JSDOM } from 'jsdom';
import { parse } from 'yaml';

const directory = path.resolve(process.argv[2] || '_site');
const origin = 'https://petrovortex.github.io';
const failures = [];
async function walk(dir) {
  const items = await fs.readdir(dir, { withFileTypes: true });
  return (await Promise.all(items.map(item => item.isDirectory() ? walk(path.join(dir, item.name)) : [path.join(dir, item.name)]))).flat();
}
const files = await walk(directory);
const htmlFiles = files.filter(file => file.endsWith('.html'));
assert.deepEqual(await fs.readdir(path.join(directory, 'resume')), ['cv.pdf'], 'Publish only the finished CV');
const docs = new Map();
for (const file of htmlFiles) {
  const url = '/' + path.relative(directory, file).replaceAll('\\', '/').replace(/index\.html$/, '');
  const doc = new JSDOM(await fs.readFile(file, 'utf8'), { url: origin + url }).window.document;
  docs.set(file, doc);
  assert(doc.querySelector('h1'), file + ': missing H1');
  assert(doc.querySelector('link[rel="canonical"]'), file + ': missing canonical');
  const ids = [...doc.querySelectorAll('[id]')].map(el => el.id);
  if (new Set(ids).size !== ids.length) failures.push(file + ': duplicate IDs');
  if (doc.body.textContent.includes('[[')) failures.push(file + ': unresolved wiki links');
}
for (const [file, doc] of docs) {
  const meta = name => doc.querySelector('meta[property="' + name + '"], meta[name="' + name + '"]')?.content;
  for (const button of doc.querySelectorAll('a.cv-link')) {
    assert.equal(button.getAttribute('href'), '/resume/cv.pdf', file + ': CV must link directly to the PDF');
    assert.equal(button.target, '_blank', file + ': CV must open in a new tab');
  }
  for (const name of ['og:title', 'og:description', 'og:image', 'twitter:card', 'twitter:title', 'twitter:description', 'twitter:image']) {
    assert(meta(name)?.trim(), file + ': missing ' + name);
  }
  assert.equal(meta('twitter:title'), meta('og:title'));
  assert.equal(meta('twitter:description'), meta('og:description'));
  assert.equal(meta('twitter:image'), meta('og:image'));
  const preview = new URL(meta('og:image'));
  assert(/\.(png|jpe?g|webp|gif)$/i.test(preview.pathname), file + ': preview must be a raster image');
  if (preview.origin === origin) await fs.access(path.join(directory, decodeURIComponent(preview.pathname)));
  for (const el of doc.querySelectorAll('a[href], img[src], script[src], link[rel="stylesheet"]')) {
    const url = new URL(el.getAttribute('href') || el.getAttribute('src'), doc.URL);
    if (url.origin !== origin) continue;
    let target = path.join(directory, decodeURIComponent(url.pathname));
    if (url.pathname.endsWith('/')) target = path.join(target, 'index.html');
    try { await fs.access(target); } catch { failures.push(path.relative(directory, file) + ': broken target ' + url.pathname); continue; }
    if (url.hash && target.endsWith('.html')) {
      const targetDoc = docs.get(target);
      if (targetDoc && !targetDoc.getElementById(decodeURIComponent(url.hash.slice(1)))) failures.push(path.relative(directory, file) + ': broken anchor ' + url.pathname + url.hash);
    }
  }
}
if (directory.endsWith('_site')) {
  const read = async file => new JSDOM(await fs.readFile(path.join(directory, file), 'utf8')).window.document;
  const home = await read('index.html');
  const ru = await read('ru/index.html');
  assert.equal(home.documentElement.lang, 'en');
  assert.equal(ru.documentElement.lang, 'ru');
  const { timeline } = parse(await fs.readFile('_data/profile.yml', 'utf8'));
  for (const [page, prefix] of [[home, ''], [ru, '/ru']]) {
    assert.deepEqual([...page.querySelectorAll('.timeline li h3')].map(heading => heading.textContent),
      timeline.map(event => event.title[page.documentElement.lang]));
    assert.deepEqual([...page.querySelectorAll('.hero-navigation a')].map(a => new URL(a.getAttribute('href'), origin + prefix + '/').pathname), [prefix + '/blog/', prefix + '/library/', prefix + '/publications/', prefix + '/links/']);
    assert(page.querySelector('.portrait-front[src$="main_page.jpg"]'));
    assert(page.querySelector('.portrait-back[src$="main_page_back.jpg"]'));
    assert.equal(page.querySelector('.portrait-toggle').getAttribute('aria-pressed'), 'false');
    assert.equal(page.querySelectorAll('.header-settings .theme-toggle').length, 1);
    assert.equal(page.querySelector('.menu-toggle').getAttribute('aria-controls'), 'header-menu');
    assert(page.querySelector('.rainbow-toggle'));
    assert(page.querySelector('meta[property="og:image"]').content.includes('/social/main_page-'));
    assert.equal(page.querySelector('meta[property="og:description"]').content, page.querySelector('.hero-bio').textContent.trim());
  }
  assert.equal(home.querySelectorAll('.post-row').length, 0);
  const library = await read('library/index.html');
  const notebook = await read('library/efficient-ml/index.html');
  assert(library.querySelector('.notebook-row a[href="/library/efficient-ml/"]'));
  assert(!library.querySelector('.card-source'));
  const materials = notebook.querySelector('.notebook-materials');
  assert(materials && !materials.open);
  assert.equal(materials.querySelector('summary').textContent.trim(), 'Notebook materials');
  assert.deepEqual([...materials.querySelectorAll('a')].map(a => a.getAttribute('href')), ['https://efficientml.ai/']);
  const blog = await read('blog/index.html');
  const publications = await read('publications/index.html');
  const publicationsRu = await read('ru/publications/index.html');
  assert(publications.querySelector('.publication p'));
  assert.equal(publications.querySelector('.publication-list').innerHTML, publicationsRu.querySelector('.publication-list').innerHTML, 'Both languages must share the same bibliography');
  for (const page of [publications, publicationsRu]) {
    assert.equal(page.querySelector('.page-heading .eyebrow').textContent, 'per aspera ad astra');
    assert(page.querySelector('.page-banner .art-light[src$="/publications.svg"]'));
    assert(page.querySelector('.page-banner .art-dark[src$="/publications-dark.svg"]'));
    assert.equal(page.querySelector('.publication-list').lang, 'en');
    assert.deepEqual([...page.querySelectorAll('.site-nav a')].map(a => a.dataset.section), ['blog', 'library', 'publications', 'links']);
    assert.equal(page.querySelector('.site-nav [aria-current]').dataset.section, 'publications');
    assert(page.querySelector('.language-nav a[href$="/publications/"]'));
  }
  for (const prefix of ['', 'ru/']) {
    const blogPage = await read(prefix + 'blog/index.html');
    const libraryPage = await read(prefix + 'library/index.html');
    const linksPage = await read(prefix + 'links/index.html');
    assert.equal(blogPage.querySelector('.page-heading h1').textContent, 'Open Notes');
    assert.equal(blogPage.querySelector('.page-heading .eyebrow').textContent, prefix ? 'Блог' : 'Blog');
    assert.equal(libraryPage.querySelector('.page-heading .eyebrow').textContent, 'sapere aude');
    assert.equal(linksPage.querySelector('.page-heading .eyebrow').textContent, prefix ? 'Где меня найти' : 'Find me');
    assert(!linksPage.querySelector('.link-row .link-description'));
    const research = linksPage.querySelector('#links-research').closest('section');
    const competitions = linksPage.querySelector('#links-competitions').closest('section');
    assert.deepEqual([...research.querySelectorAll('.link-row strong')].map(el => el.textContent), ['Google Scholar', 'ORCID', 'GitHub']);
    assert.deepEqual([...competitions.querySelectorAll('.link-row strong')].map(el => el.textContent), ['Kaggle', 'LeetCode']);
    for (const link of research.querySelectorAll('.link-row')) {
      assert.equal(link.target, '_blank');
      assert(link.querySelector('svg path[d]'));
    }
  }
  const sortOptions = doc => [...doc.querySelectorAll('.listing-controls option')].map(option => [option.value, option.textContent]);
  assert.deepEqual(sortOptions(library), sortOptions(blog));
  assert.deepEqual(sortOptions(blog).map(([value]) => value), ['date', 'updated', 'views', 'likes', 'title']);
  for (const listing of [library, blog]) {
    assert(listing.querySelector('.listing-card .card-actions [data-count="views"]'));
    assert(listing.querySelector('.listing-card .card-actions [data-like]'));
    assert(listing.querySelector('.listing-card .card-actions .share-menu'));
    assert(listing.querySelector('.share-options a[href^="mailto:"]'));
    assert(!listing.querySelector('[data-share="native"]'));
    assert(listing.querySelector('.card-preview .art-light').getAttribute('src').endsWith('-preview.svg'));
    assert(listing.querySelector('.card-preview .art-dark').getAttribute('src').endsWith('-preview-dark.svg'));
  }
  const efficientMLCard = library.querySelector('a[href="/library/efficient-ml/"]').closest('.notebook-row');
  assert.equal(efficientMLCard.querySelector('.card-actions [data-stats-id]').dataset.statsId, notebook.querySelector('[data-stats-id]').dataset.statsId);
  assert(notebook.querySelector('.chapter-preview .art-light').getAttribute('src').endsWith('efficient-ml-01-preview.svg'));
  assert(notebook.querySelector('.chapter-preview .art-dark'));
  assert(!library.querySelector('[data-article-id]'), 'Library visits must not count as notebook views');
  const lecture = await read('library/efficient-ml/lecture-1-introduction/index.html');
  assert(!lecture.querySelector('.reader-header .source-credit'));
  for (const [file, label] of [['dls-agent-en/index.html', 'Post'], ['dls-agent-ru/index.html', 'Пост']]) {
    const post = await read(file);
    assert.equal(post.querySelector('.reader-header .eyebrow').textContent, label);
    assert.equal(post.querySelectorAll('.references-section').length, 1);
    assert.equal(post.querySelectorAll('.footnote-item').length, 5);
    assert.equal(post.querySelector('#references').parentElement, post.querySelector('.article-body'));
  }
  for (const prefix of ['', 'ru/']) {
    const notebookPath = '/' + prefix + 'library/onigiri/';
    const listing = await read(prefix + 'library/index.html');
    assert(listing.querySelector(`.notebook-row a[href="${notebookPath}"]`));
    const podcast = await read(prefix + 'library/onigiri/index.html');
    assert(podcast.querySelector(`a[href="${notebookPath}whats-next-for-ai/"]`));
    const episode = await read(prefix + 'library/onigiri/whats-next-for-ai/index.html');
    assert(episode.querySelector('.breadcrumbs a[href="' + notebookPath + '"]'));
    assert(episode.querySelector('.article-body img[src^="/assets/imported/"]'));
    for (const formula of episode.querySelectorAll('.math-inline, .math-display')) {
      const delimiter = formula.classList.contains('math-display') ? '$$' : '$';
      const tex = formula.querySelector('svg').getAttribute('aria-label');
      assert.equal(formula.dataset.mathSource, delimiter + tex + delimiter, 'Compiled formula is missing its exact Markdown source');
    }
  }
  assert.equal(lecture.querySelectorAll('.article-downloads a').length, 2);
  assert.equal(lecture.querySelectorAll('.article-cover').length, 1);
  assert(lecture.querySelector('.article-cover .art-dark'));
  assert.equal((await read('blog/index.html')).querySelectorAll('.post-row').length, 1);
  assert((await read('blog/index.html')).querySelector('.post-preview .art-dark'));
  assert((await read('links/index.html')).querySelector('a[href="https://www.youtube.com/@petrovortex"]'));
  for (const name of ['feed.xml', 'ru/feed.xml']) {
    const feed = new JSDOM(await fs.readFile(path.join(directory, name), 'utf8'), { contentType: 'application/xml' }).window.document;
    assert.equal(feed.querySelectorAll('entry').length, 1);
    assert(feed.querySelector('content').textContent.includes('<h2'));
    assert(!feed.querySelector('content').textContent.includes('src="/'));
  }
}
if (directory.endsWith('fixture-site')) {
  const list = new JSDOM(await fs.readFile(path.join(directory, 'blog/index.html'), 'utf8')).window.document;
  for (const slug of ['hidden-draft-en', 'future-post-en']) {
    await assert.rejects(fs.access(path.join(directory, slug, 'index.html')), { code: 'ENOENT' });
    assert(!list.querySelector('a[href="/' + slug + '/"]'));
    assert(!(await fs.readFile(path.join(directory, 'feed.xml'), 'utf8')).includes('/' + slug + '/'));
  }
  const fixtureDownloads = JSON.parse(await fs.readFile(path.join(directory, '../fixture-source/_data/downloads.json'), 'utf8'));
  assert(!fixtureDownloads['/hidden-draft-en/'] && !fixtureDownloads['/future-post-en/']);
  const firstNote = new JSDOM(await fs.readFile(path.join(directory, 'library/example/first/index.html'), 'utf8')).window.document;
  assert(firstNote.querySelector('.article-body').textContent.includes('{{ user.name }}'));
  assert(firstNote.querySelector('.article-body').textContent.includes('{% if example %}'));
  assert.equal(firstNote.querySelector('.math-inline').dataset.mathSource, '$a_1^2 + b_1^2$');
  assert(firstNote.querySelector('.math-display svg'));
  assert.equal(firstNote.querySelector('#references').parentElement, firstNote.querySelector('.article-body'));
  assert(firstNote.querySelector('.footnotes-list a[href="https://example.org/reference"]'));
  assert(firstNote.querySelector('.article-downloads a[href$=".md"]'));
  assert(!firstNote.querySelector('.article-downloads a[href$=".pdf"]'), 'A new note must not link to an ungenerated PDF');
  const article = new JSDOM(await fs.readFile(path.join(directory, 'image-demo-en/index.html'), 'utf8')).window.document;
  assert.equal(list.querySelector('[data-post-id="image-example"] .card-description').textContent.trim(), 'Automatically generated summary with emphasis.');
  assert.equal(article.querySelector('meta[property="og:description"]').content, 'Automatically generated summary with emphasis.');
  assert(list.querySelector('.post-preview img[src$="base_scheme.svg"]'));
  assert(article.querySelector('.article-cover img[alt="Inputs and output of the project"]'));
  assert(article.querySelector('.article-cover figcaption'));
  const notebook = new JSDOM(await fs.readFile(path.join(directory, 'library/example/index.html'), 'utf8')).window.document;
  assert(!notebook.querySelector('.notebook-materials').open);
  assert.deepEqual([...notebook.querySelectorAll('.notebook-materials a')].map(a => [a.textContent, a.getAttribute('href')]), [
    ['Notebook website', 'https://example.com/notebook'], ['Slides', 'https://example.com/notebook/slides'],
  ]);
  const library = new JSDOM(await fs.readFile(path.join(directory, 'library/index.html'), 'utf8')).window.document;
  assert.equal(notebook.querySelectorAll('.article-cover').length, 1);
  assert(notebook.querySelector('.article-cover .art-light[src$="favicon-ap.png"][alt="Uploaded raster cover"]'));
  assert(notebook.querySelector('.article-cover .art-dark[src$="favicon-ap.png"]'));
  assert.equal(notebook.querySelector('.article-cover figcaption').textContent, 'A caption for the uploaded cover.');
  assert(!notebook.querySelector('.page-banner'), 'An uploaded cover must replace the named SVG banner');
  assert(notebook.querySelector('meta[property="og:image"]').content.includes('/social/favicon-ap-'), 'Preview must also prefer the uploaded cover');
  assert(library.querySelector('.notebook-row .card-preview img[src$="base_scheme.svg"]'), 'The list must use its separate thumbnail');

}
if (directory.endsWith('_site')) {
  const exports = JSON.parse(await fs.readFile('_data/downloads.json', 'utf8'));
  for (const [url, entry] of Object.entries(exports)) {
    const md = await fs.readFile(path.join(directory, entry.md), 'utf8');
    assert(md.includes('Aleksandr Petrov'));
    assert(md.includes(origin + url));
    const pdf = await fs.readFile(path.join(directory, entry.pdf));
    assert.equal(pdf.subarray(0, 5).toString(), '%PDF-');
    assert(pdf.equals(await fs.readFile(entry.pdf.slice(1))), 'Generated PDF copy is stale: ' + entry.pdf);
  }
}
if (failures.length) { console.error([...new Set(failures)].join('\n')); process.exitCode = 1; }
else console.log('Verified ' + htmlFiles.length + ' generated pages: routes, assets, heading links, language, metadata, and feeds.');
