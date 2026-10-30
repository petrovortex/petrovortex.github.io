import fs from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert/strict';
import { JSDOM } from 'jsdom';

const directory = path.resolve(process.argv[2] || '_site');
const origin = 'https://petrovortex.github.io';
const failures = [];
async function walk(dir) {
  const items = await fs.readdir(dir, { withFileTypes: true });
  return (await Promise.all(items.map(item => item.isDirectory() ? walk(path.join(dir, item.name)) : [path.join(dir, item.name)]))).flat();
}
const files = await walk(directory);
const htmlFiles = files.filter(file => file.endsWith('.html'));
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
  assert.equal(home.querySelectorAll('.timeline li').length, 5);
  for (const [page, prefix] of [[home, ''], [ru, '/ru']]) {
    assert(page.querySelector('.timeline').textContent.includes('2007'));
    assert.deepEqual([...page.querySelectorAll('.hero-navigation a')].map(a => new URL(a.getAttribute('href'), origin + prefix + '/').pathname), [prefix + '/blog/', prefix + '/library/', prefix + '/links/']);
    assert(page.querySelector('.portrait-front[src$="main_page.jpg"]'));
    assert(page.querySelector('.portrait-back[src$="main_page_back.jpg"]'));
    assert.equal(page.querySelector('.portrait-toggle').getAttribute('aria-pressed'), 'false');
    assert.equal(page.querySelectorAll('.header-settings .theme-toggle').length, 1);
    assert.equal(page.querySelector('.menu-toggle').getAttribute('aria-controls'), 'header-menu');
    assert(page.querySelector('.rainbow-toggle'));
  }
  assert.equal(home.querySelectorAll('.post-row').length, 0);
  const library = await read('library/index.html');
  const course = await read('library/efficient-ml/index.html');
  assert.equal(library.querySelectorAll('.course-row').length, 1);
  assert(!library.querySelector('.card-source'));
  const materials = course.querySelector('.course-materials');
  assert(materials && !materials.open);
  assert.equal(materials.querySelector('summary').textContent.trim(), 'Course materials');
  assert.deepEqual([...materials.querySelectorAll('a')].map(a => a.getAttribute('href')), ['https://efficientml.ai/']);
  const blog = await read('blog/index.html');
  for (const prefix of ['', 'ru/']) {
    const blogPage = await read(prefix + 'blog/index.html');
    const libraryPage = await read(prefix + 'library/index.html');
    const linksPage = await read(prefix + 'links/index.html');
    assert.equal(blogPage.querySelector('.page-heading h1').textContent, 'Open Notes');
    assert.equal(blogPage.querySelector('.page-heading .eyebrow').textContent, prefix ? 'Блог' : 'Blog');
    assert.equal(libraryPage.querySelector('.page-heading .eyebrow').textContent, 'Per aspera ad astra');
    assert.equal(linksPage.querySelector('.page-heading .eyebrow').textContent, prefix ? 'Где меня найти' : 'Find me');
    assert(!linksPage.querySelector('.link-row .link-description'));
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
  assert.equal(library.querySelector('.card-actions [data-stats-id]').dataset.statsId, course.querySelector('[data-stats-id]').dataset.statsId);
  assert(course.querySelector('.chapter-preview .art-light').getAttribute('src').endsWith('efficient-ml-01-preview.svg'));
  assert(course.querySelector('.chapter-preview .art-dark'));
  assert(!library.querySelector('[data-article-id]'), 'Library visits must not count as course views');
  const lecture = await read('library/efficient-ml/lecture-1-introduction/index.html');
  assert(!lecture.querySelector('.reader-header .source-credit'));
  for (const [file, label] of [['dls-agent-en/index.html', 'Post'], ['dls-agent-ru/index.html', 'Пост']]) {
    const post = await read(file);
    assert.equal(post.querySelector('.reader-header .eyebrow').textContent, label);
    assert.equal(post.querySelectorAll('.references-section').length, 1);
    assert.equal(post.querySelectorAll('.footnote-item').length, 5);
    assert.equal(post.querySelector('#references').parentElement, post.querySelector('.article-body'));
  }
  assert.equal(lecture.querySelector('#references').parentElement, lecture.querySelector('.article-body'));
  assert.equal(lecture.querySelectorAll('.references-section').length, 1);
  assert(lecture.querySelector('.footnote-ref a[href="#fn1"]'));
  assert(lecture.querySelector('.footnotes-list a[href*="4824-imagenet-classification"]'));
  assert(lecture.querySelector('.math-inline svg'));
  for (const formula of lecture.querySelectorAll('.math-inline, .math-display')) {
    const delimiter = formula.classList.contains('math-display') ? '$$' : '$';
    const tex = formula.querySelector('svg').getAttribute('aria-label');
    assert.equal(formula.dataset.mathSource, delimiter + tex + delimiter, 'Compiled formula is missing its exact Markdown source');
  }
  assert.equal(lecture.querySelectorAll('.article-downloads a').length, 2);
  assert(lecture.querySelector('.article-body h2'));
  assert.equal(lecture.querySelectorAll('.article-cover').length, 1);
  assert(lecture.querySelector('.article-cover .art-dark'));
  assert(!lecture.querySelector('.article-body').textContent.includes('$'));
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
  const article = new JSDOM(await fs.readFile(path.join(directory, 'image-demo-en/index.html'), 'utf8')).window.document;
  assert(list.querySelector('.post-preview img[src$="base_scheme.svg"]'));
  assert(article.querySelector('.article-cover img[alt="Inputs and output of the project"]'));
  assert(article.querySelector('.article-cover figcaption'));
  const course = new JSDOM(await fs.readFile(path.join(directory, 'library/example/index.html'), 'utf8')).window.document;
  assert(!course.querySelector('.course-materials').open);
  assert.deepEqual([...course.querySelectorAll('.course-materials a')].map(a => [a.textContent, a.getAttribute('href')]), [
    ['Course website', 'https://example.com/course'], ['Slides', 'https://example.com/course/slides'],
  ]);
  const library = new JSDOM(await fs.readFile(path.join(directory, 'library/index.html'), 'utf8')).window.document;
  assert.equal(course.querySelectorAll('.article-cover').length, 1);
  assert(course.querySelector('.article-cover .art-light[src$="favicon-ap.png"][alt="Uploaded raster cover"]'));
  assert(course.querySelector('.article-cover .art-dark[src$="favicon-ap.png"]'));
  assert.equal(course.querySelector('.article-cover figcaption').textContent, 'A caption for the uploaded cover.');
  assert(!course.querySelector('.page-banner'), 'An uploaded cover must replace the named SVG banner');
  assert(library.querySelector('.course-row .card-preview img[src$="base_scheme.svg"]'), 'The list must use its separate thumbnail');

}
if (directory.endsWith('_site')) {
  const exports = JSON.parse(await fs.readFile('_data/downloads.json', 'utf8'));
  for (const [url, entry] of Object.entries(exports)) {
    const md = await fs.readFile(path.join(directory, entry.md), 'utf8');
    assert(md.includes('Alexander Petrov'));
    assert(md.includes(origin + url));
    const pdf = await fs.readFile(path.join(directory, entry.pdf));
    assert.equal(pdf.subarray(0, 5).toString(), '%PDF-');
    assert(pdf.equals(await fs.readFile(entry.pdf.slice(1))), 'Generated PDF copy is stale: ' + entry.pdf);
  }
}
if (failures.length) { console.error([...new Set(failures)].join('\n')); process.exitCode = 1; }
else console.log('Verified ' + htmlFiles.length + ' generated pages: routes, assets, heading links, language, metadata, and feeds.');
