import assert from 'node:assert/strict';
import test from 'node:test';
import { JSDOM } from 'jsdom';
import { renderArticle, renderMarkdown } from '../../scripts/content/render-markdown.mjs';

test('each source has one entry and a return link to each occurrence', () => {
  const body = [
    '> Source: [Что будет дальше с ИИ? | Стрим](https://example.org/video?id=42)',
    '',
    'Read [**here**](https://example.org/Article_(physics) "The physics of waves") and [`openai/math`](https://example.org/repo).',
    'Another [label for the article](https://example.org/Article_(physics)).',
    'An image ![photo](https://example.org/photo.jpg), [a note](/library/note/) and `[code](https://example.org/code)`.',
    '~~~md',
    '[example](https://example.org/fence)',
    '~~~',
  ].join('\n');
  const canonical = 'https://example.org/ru/library/example/note/';
  const article = renderArticle(body, false, 'ru', true);
  const doc = new JSDOM(article.html).window.document;
  const list = doc.querySelector('ol.collected-references');
  assert.equal(doc.querySelector('h2').textContent, 'Ссылки на материалы');
  const sources = [...list.querySelectorAll('li a[href^="https://"]')];
  assert.deepEqual(sources.map(a => a.href), [
    'https://example.org/video?id=42', 'https://example.org/Article_(physics)', 'https://example.org/repo',
  ]);
  assert.equal(sources[1].textContent, 'The physics of waves');
  assert.equal(sources[2].textContent, 'openai/math');
  const originalLinks = [...doc.querySelectorAll('a[href^="https://"]')].filter(a => !list.contains(a));
  assert.equal(originalLinks[1].querySelector('strong').textContent, 'here');
  assert.equal(originalLinks[2].querySelector('code').textContent, 'openai/math');
  assert.equal(new Set(originalLinks.map(a => a.id)).size, 4);

  const downloadedList = new JSDOM(renderMarkdown(article.referencesMarkdown(canonical))).window.document;
  const downloadedUrls = [...downloadedList.querySelectorAll('a')].map(a => a.href);
  for (const source of sources) {
    const mentions = originalLinks.filter(a => a.href === source.href);
    const arrows = [...source.closest('li').querySelectorAll('a.source-backref')];
    assert.deepEqual(arrows.map(a => doc.getElementById(a.hash.slice(1))), mentions);
    for (const arrow of arrows) {
      assert(arrow.getAttribute('aria-label') || arrow.title, 'Return arrows need descriptive labels');
      assert(downloadedUrls.includes(canonical + arrow.hash));
    }
  }
});

test('automatic references coexist with authored footnotes and exclude footnote definitions', () => {
  const body = 'See [report](https://example.org/report) and the annotation.[^fact]\n\n[^fact]: See [the archive](https://example.org/archive).';
  const doc = new JSDOM(renderMarkdown(body, false, 'en', true)).window.document;
  const list = doc.querySelector('ol.collected-references');
  assert.equal(list.children.length, 1);
  assert.equal(list.querySelector('a[href^="https://"]').href, 'https://example.org/report');
  assert.equal(doc.querySelectorAll('.footnotes-list li').length, 1);
  assert.equal(doc.querySelector('.footnotes-list a').href, 'https://example.org/archive');
  const anchor = list.querySelector('.source-backref').hash.slice(1);
  assert.equal(doc.getElementById(anchor).href, 'https://example.org/report');
});

test('notes without eligible links do not acquire an empty bibliography', () => {
  const source = '![photo](https://example.org/photo.jpg) and [a local link](/library/).';
  const article = renderArticle(source, false, 'ru', true);
  const doc = new JSDOM(article.html).window.document;
  assert(!doc.querySelector('h2, .collected-references, .source-backref'));
  assert.equal(article.referencesMarkdown('https://example.org/note/'), '');
});
