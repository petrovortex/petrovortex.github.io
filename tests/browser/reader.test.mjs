import test from 'node:test';
import assert from 'node:assert/strict';
import { JSDOM } from 'jsdom';
import { initReader } from '../../assets/js/reader.js';
import { renderMarkdown } from '../../scripts/content/render-markdown.mjs';
const texts = { section_link:'Copy link', fold:'Toggle section', table_scroll:'Table — scroll horizontally to see more' };
function fixture(desktop = true, article = null) {
  const dom = new JSDOM('<header class="site-header"></header><div class="article-body"><h2 id="one">One</h2><p>Intro</p><h3 id="detail">Detail</h3><p>Detail text</p><h2 id="two">Two</h2><p>Next</p><h3 id="other">Other detail</h3><p>Last</p></div><aside class="toc-rail" hidden><details open><summary>Contents</summary><nav class="toc-links"></nav></details></aside>',{url:'https://petrovortex.github.io/article/',pretendToBeVisual:true});
  dom.window.matchMedia = query => ({ matches: query.includes('1100') && desktop, addEventListener() {} });
  dom.window.HTMLElement.prototype.scrollIntoView = function () {};
  const doc=dom.window.document;
  if (article) doc.querySelector('.article-body').innerHTML = article;
  const positions={one:10,detail:60,two:500,other:600};
  doc.querySelectorAll('h2,h3').forEach(h => { h.getBoundingClientRect=()=>({top:positions[h.id]}); });
  doc.querySelector('header').getBoundingClientRect=()=>({height:82});
  const reader=initReader({doc,texts,copy:async()=>{}});
  return {dom,doc,reader,positions};
}
test('scroll tracking reveals only the current section subsections and retains IDs', () => {
  const {dom,doc,reader,positions}=fixture();
  assert.equal(doc.querySelector('a[aria-current]').getAttribute('href'),'#detail');
  assert.equal(doc.querySelectorAll('.active-section').length,1);
  assert.equal(doc.querySelector('.active-section > a').getAttribute('href'),'#one');
  positions.two=20; positions.other=60; reader.updateActive();
  assert.equal(doc.querySelector('a[aria-current]').getAttribute('href'),'#other');
  assert.equal(doc.querySelector('.active-section > a').getAttribute('href'),'#two');
  assert(doc.getElementById('detail'));
  dom.window.close();
});
test('direct links reveal folded H2 sections and nested headings', () => {
  const {dom,doc,reader}=fixture();
  const heading=doc.getElementById('one'); const button=heading.querySelector('[data-fold]');
  button.click(); assert.equal(reader.sections.get(heading).hidden,true);
  reader.reveal('detail'); assert.equal(reader.sections.get(heading).hidden,false);
  button.click(); reader.reveal('one'); assert.equal(reader.sections.get(heading).hidden,false);
  assert.equal(reader.reveal('missing'),false);
  dom.window.close();
});
test('mobile contents is collapsed initially and anchor navigation updates the hash', () => {
  const {dom,doc}=fixture(false);
  assert.equal(doc.querySelector('.toc-rail details').open,false);
  doc.querySelector('.toc-rail details').open=true;
  doc.querySelector('.toc-links a[href="#detail"]').click();
  assert.equal(dom.window.location.hash,'#detail');
  assert.equal(doc.querySelector('.toc-rail details').open,false);
  dom.window.close();
});

test('citation navigation reveals folded content and keeps one references list', () => {
  const article = renderMarkdown('## One\n\nModel[^model].\n\n## Two\n\nMore text.\n\n[^model]: [Original paper](https://example.com/paper).');
  const { dom, doc, reader } = fixture(true, article);
  assert.equal(doc.querySelectorAll('.references-section').length, 1);
  assert(doc.querySelector('.toc-links a[href="#references"]'));
  const first = doc.getElementById('one'), last = doc.getElementById('two'), references = doc.getElementById('references');
  assert.equal(references.parentElement, doc.querySelector('.article-body'));
  assert.equal(reader.sections.size, 3);
  last.querySelector('[data-fold]').click();
  assert(!doc.getElementById('fn1').closest('[hidden]'), 'Folding the previous section must leave references visible');
  references.querySelector('[data-fold]').click();
  assert(reader.sections.get(references).hidden);
  doc.querySelector('.footnote-ref a').click();
  assert.equal(dom.window.location.hash, '#fn1');
  assert(!doc.getElementById('fn1').closest('[hidden]'));
  assert(reader.sections.get(last).hidden, 'Following a citation must not unfold the previous section');
  first.querySelector('[data-fold]').click();
  assert.equal(reader.sections.get(first).hidden, true);
  doc.querySelector('.footnote-backref').click();
  assert.equal(dom.window.location.hash, '#fnref1');
  assert.equal(reader.sections.get(first).hidden, false);
  dom.window.close();
});

test('tables get keyboard-accessible scroll regions without a table of contents', () => {
  const dom = new JSDOM('<div class="article-body"><table><tr><td>One</td></tr></table><table><caption>Model comparison</caption><tr><td>Two</td></tr></table></div>');
  const doc = dom.window.document;
  initReader({ doc, texts });
  initReader({ doc, texts });
  const regions = [...doc.querySelectorAll('.table-scroll')];
  assert.equal(regions.length, 2, 'Repeated initialization must not nest scroll regions');
  assert.deepEqual(regions.map(region => region.getAttribute('aria-label')), [texts.table_scroll, 'Model comparison']);
  for (const region of regions) {
    assert.equal(region.tabIndex, 0);
    assert.equal(region.getAttribute('role'), 'region');
    assert.equal(region.firstElementChild.tagName, 'TABLE');
  }
  dom.window.close();
});
