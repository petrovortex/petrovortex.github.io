import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { stringify } from 'yaml';
import { importObsidian } from '../../scripts/content/import-obsidian.mjs';
import { frontmatter } from '../../scripts/content/documents.mjs';
import { renderArticle, renderMarkdown } from '../../scripts/content/render-markdown.mjs';
import { JSDOM } from 'jsdom';

async function fixture(t) {
  const base = await fs.mkdtemp(path.join(os.tmpdir(),'site-import-'));
  t.after(()=>fs.rm(base,{recursive:true,force:true}));
  const root=path.join(base,'site'), vault=path.join(base,'vault');
  await fs.mkdir(path.join(root,'config'),{recursive:true}); await fs.mkdir(vault);
  await fs.writeFile(path.join(root,'_config.yml'), 'collections_dir: content\n');
  const item = {id:'first',source:'First.md',destination:'content/_notes/en/first.md',metadata:{title:'First',lang:'en',lang_ref:'first',permalink:'/library/course/first/',course:'course',order:1}};
  const manifest = async (items=[item])=>fs.writeFile(path.join(root,'config/obsidian-imports.yml'),stringify({vault:'../vault',items}));
  await manifest();
  return {root,vault,item,manifest};
}
test('selected imports preserve code, copy only referenced images, drop private front matter, and are idempotent',async t=>{
  const {root,vault}=await fixture(t);
  const raw='---\nprivate: secret\n---\n### Section\n\n%% private comment %%\n![[diagram.png|Diagram]]\n\n#### Details\n\n```md\n[[Private note]]\n### Code heading\n```\n';
  await fs.writeFile(path.join(vault,'First.md'),raw);
  await fs.writeFile(path.join(vault,'diagram.png'),Buffer.from('image bytes'));
  await fs.writeFile(path.join(vault,'private.png'),Buffer.from('private bytes'));
  await importObsidian(root);
  const output=path.join(root,'content/_notes/en/first.md'), result=await fs.readFile(output,'utf8');
  assert(result.includes('## Section')); assert(result.includes('### Details'));
  assert(result.includes('[[Private note]]\n### Code heading'));
  assert(!result.includes('private comment')); assert(!result.includes('secret'));
  assert.match(result,/!\[Diagram\]\(\/assets\/imported\/first\/[a-f0-9]+\.png\)/);
  assert.equal((await fs.readdir(path.join(root,'assets/imported/first'))).length,1);
  assert.equal(await fs.readFile(path.join(vault,'First.md'),'utf8'),raw);
  const before=(await fs.stat(output)).mtimeMs;
  await importObsidian(root);
  assert.equal((await fs.stat(output)).mtimeMs,before);
  await fs.appendFile(path.join(vault,'First.md'),'\nNew paragraph.\n');
  await importObsidian(root);
  assert((await fs.readFile(output,'utf8')).includes('New paragraph.'));
});
test('unselected links and hand-written destinations fail before writing',async t=>{
  const {root,vault}=await fixture(t);
  await fs.writeFile(path.join(vault,'First.md'),'### Title\n[[Private]]');
  await fs.writeFile(path.join(vault,'Private.md'),'secret');
  await assert.rejects(importObsidian(root),/unselected note/);
  await assert.rejects(fs.access(path.join(root,'content/_notes/en/first.md')));
  await fs.writeFile(path.join(vault,'First.md'),'### Title\nText');
  await fs.mkdir(path.join(root,'content/_notes/en'), {recursive:true});
  await fs.writeFile(path.join(root,'content/_notes/en/first.md'),'hand-written');
  await assert.rejects(importObsidian(root),/hand-written/);
  assert.equal(await fs.readFile(path.join(root,'content/_notes/en/first.md'),'utf8'),'hand-written');
});
test('selected note links map to stable public routes and heading anchors; posts use dated filenames',async t=>{
  const {root,vault,item,manifest}=await fixture(t);
  const second={id:'second',source:'Second.md',destination:'content/_posts/en/2026-10-26-second-en.md',metadata:{title:'Second',lang:'en',lang_ref:'second'}};
  await manifest([item,second]);
  await fs.writeFile(path.join(vault,'First.md'),'### Start\n[[Second#A heading|Read more]]');
  await fs.writeFile(path.join(vault,'Second.md'),'## A heading\nHello');
  await importObsidian(root);
  assert((await fs.readFile(path.join(root,item.destination),'utf8')).includes('[Read more](/second-en/#a-heading)'));
  assert.equal(frontmatter(await fs.readFile(path.join(root,second.destination),'utf8')).data.title,'Second');
});
test('path traversal and note embeds are rejected',async t=>{
  const {root,vault,item,manifest}=await fixture(t);
  await manifest([{...item,source:'../outside.md'}]);
  await assert.rejects(importObsidian(root),/escapes/);
  await manifest();
  await fs.writeFile(path.join(vault,'First.md'),'![[First]]');
  await assert.rejects(importObsidian(root),/transclusion/);
});

test('vault cover variants are copied and imported creation dates survive later saves',async t=>{
 const {root,vault,item}=await fixture(t);
 await fs.writeFile(path.join(vault,'cover.svg'),'<svg xmlns="http://www.w3.org/2000/svg"/>');
 await fs.writeFile(path.join(vault,'cover-dark.svg'),'<svg xmlns="http://www.w3.org/2000/svg" width="20"/>');
 await fs.writeFile(path.join(vault,'First.md'),'---\nimage: cover.svg\nimage_dark: cover-dark.svg\npreview_image_dark: cover-dark.svg\n---\n## Start\nHello');
 await importObsidian(root);
 const imported=path.join(root,item.destination);
 const first=frontmatter(await fs.readFile(imported,'utf8')).data;
 for (const field of ['image','image_dark','preview_image_dark']) {
   assert.match(first[field],/^\/assets\/imported\/first\/[a-f0-9]+\.svg$/);
   await fs.access(path.join(root,first[field]));
 }
 assert.notEqual(first.image,first.image_dark);
 await fs.appendFile(path.join(vault,'First.md'),'\nUpdated');
 await importObsidian(root);
 assert.equal(frontmatter(await fs.readFile(imported,'utf8')).data.date,first.date);
});
test('math output is static, accessible, and does not transform code; heading ids are unique',()=>{
  const html=renderMarkdown('## Cost $W$\n\nInline $x^2$ formula.\n\n$$X^{(l+1)}=f_l(W,X)$$\n\n`$untouched$`\n\n## Cost $W$',true);
  const doc=new JSDOM(html).window.document;
  assert.equal(doc.querySelectorAll('.math-inline svg').length,3);
  assert.equal(doc.querySelectorAll('.math-display svg').length,1);
  assert.equal(doc.querySelector('code').textContent,'$untouched$');
  assert.equal(doc.querySelectorAll('h2[id]').length,2);
  assert.notEqual(...[...doc.querySelectorAll('h2')].map(h=>h.id));
  assert(doc.querySelector('svg').getAttribute('aria-label'));
});

test('manifest update timestamps override vault timestamps without changing creation dates', async t => {
  const { root, vault, item, manifest } = await fixture(t);
  const source = path.join(vault, 'First.md');
  const created = '2026-01-01T09:00:00+07:00';
  const vaultUpdated = '2026-01-02T09:00:00+07:00';
  await fs.writeFile(source, `---\ncreated: ${created}\nupdated: ${vaultUpdated}\n---\n## Start\nHello`);

  const readImported = async () => frontmatter(await fs.readFile(path.join(root, item.destination), 'utf8')).data;
  item.metadata.last_modified_at = '2026-01-04T09:00:00+07:00';
  item.metadata.updated = '2026-01-03T09:00:00+07:00';
  await manifest();
  await importObsidian(root);
  assert.equal((await readImported()).last_modified_at, item.metadata.last_modified_at);

  delete item.metadata.last_modified_at;
  await manifest();
  await importObsidian(root);
  assert.equal((await readImported()).last_modified_at, item.metadata.updated);

  delete item.metadata.updated;
  await manifest();
  await importObsidian(root);
  assert.equal((await readImported()).last_modified_at, vaultUpdated);
  assert.equal((await readImported()).date, created);
});

test('nested language folders preserve post URLs and reject mismatched or unsafe destinations', async t => {
  const { root, vault, item, manifest } = await fixture(t);
  const second = {
    id: 'second-ru', source: 'Second.md',
    destination: 'content/_posts/ru/projects/2026-10-26-second-ru.md',
    metadata: { title: 'Second', lang: 'ru', lang_ref: 'second' }
  };
  item.metadata.tags = ['Private note tags'];
  await fs.writeFile(path.join(vault, 'First.md'), '## Start\n[[Second#A heading|Read more]]');
  await fs.writeFile(path.join(vault, 'Second.md'), '## A heading\nHello');
  await manifest([item, second]);
  await importObsidian(root);
  const first = frontmatter(await fs.readFile(path.join(root, item.destination), 'utf8'));
  assert(first.body.includes('[Read more](/second-ru/#a-heading)'));
  assert.equal(first.data.tags, undefined);
  assert.equal(frontmatter(await fs.readFile(path.join(root, second.destination), 'utf8')).data.lang, 'ru');

  for (const [destination, error] of [
    ['content/_notes/ru/wrong-language.md', /language must match/],
    ['content/_notes/fr/wrong-language.md', /Invalid destination/],
    ['assets/outside-collections.md', /Invalid destination/],
    ['../outside-repository.md', /escapes/],
    ['content/_posts/en/undated.md', /dated filename/]
  ]) {
    await manifest([{ ...item, destination }]);
    await assert.rejects(importObsidian(root), error);
  }
});

test('the importer reads the native collections_dir setting', async t => {
  const { root, vault, item, manifest } = await fixture(t);
  await fs.writeFile(path.join(root, '_config.yml'), 'collections_dir: writing\n');
  item.destination = 'writing/_notes/en/first.md';
  await fs.writeFile(path.join(vault, 'First.md'), '## Start\nHello');
  await manifest();
  await importObsidian(root);
  assert.equal(frontmatter(await fs.readFile(path.join(root, item.destination), 'utf8')).data.title, 'First');
  await assert.rejects(fs.access(path.join(root, 'content')));
});

test('Obsidian photos keep their bytes across wiki, relative and spaced paths; cover settings have explicit precedence', async t => {
  const { root, vault, item, manifest } = await fixture(t);
  item.source = 'Public/First.md';
  await manifest();
  await fs.mkdir(path.join(vault, 'Public'));
  await fs.mkdir(path.join(vault, 'Attachments'));
  const photo = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aC9sAAAAASUVORK5CYII=', 'base64');
  await fs.writeFile(path.join(vault, 'Attachments/experiment photo.png'), photo);
  await fs.writeFile(path.join(vault, 'Attachments/thumbnail.svg'), '<svg xmlns="http://www.w3.org/2000/svg" width="360" height="240"/>');
  const source = [
    '---',
    'image: "Attachments/experiment photo.png"',
    'preview_image: "![[Attachments/thumbnail.svg]]"',
    '---',
    '## Experiment',
    '![[Attachments/experiment photo.png|Experiment setup]]',
    '![Relative photo](<../Attachments/experiment photo.png>)',
    '![Encoded photo](../Attachments/experiment%20photo.png)',
    '![[experiment photo.png|300]]',
    '![External photo](https://example.com/photo.jpg)',
    ''
  ].join('\n');
  await fs.writeFile(path.join(vault, item.source), source);
  await importObsidian(root);
  const readImported = async () => frontmatter(await fs.readFile(path.join(root, item.destination), 'utf8'));
  const first = await readImported();
  assert.match(first.data.image, /^\/assets\/imported\/first\/[a-f0-9]+\.png$/);
  assert.match(first.data.preview_image, /^\/assets\/imported\/first\/[a-f0-9]+\.svg$/);
  assert.equal(first.body.split(first.data.image).length - 1, 4, 'Every local image should resolve to the same copied file');
  assert(first.body.includes('![Experiment setup]('));
  assert(!first.body.includes('![300]('), 'Obsidian display widths should not become alt text');
  assert(first.body.includes('![External photo](https://example.com/photo.jpg)'));
  assert((await fs.readFile(path.join(root, first.data.image))).equals(photo));
  assert.equal((await fs.readdir(path.join(root, 'assets/imported/first'))).length, 2);
  assert.equal(await fs.readFile(path.join(vault, item.source), 'utf8'), source);

  item.metadata.image = '/assets/images/repository-cover.png';
  await manifest();
  await importObsidian(root);
  assert.equal((await readImported()).data.image, item.metadata.image);
  delete item.metadata.image;
  await manifest();
  await importObsidian(root);
  assert.equal((await readImported()).data.image, first.data.image, 'Removing an override should restore the Obsidian cover');
});


test('Obsidian footnotes survive import and render without enabling math', async t => {
  const { root, vault, item } = await fixture(t);
  const source = '### Models\n\nAlexNet[^alexnet]. Again[^alexnet].\n\n[^alexnet]: Author. [Original paper](https://example.com/paper).\n';
  await fs.writeFile(path.join(vault, 'First.md'), source);
  await importObsidian(root);
  const { body } = frontmatter(await fs.readFile(path.join(root, item.destination), 'utf8'));
  assert(body.includes('AlexNet[^alexnet]'));
  assert(body.includes('[^alexnet]: Author. [Original paper](https://example.com/paper).'));
  assert.equal(await fs.readFile(path.join(vault, 'First.md'), 'utf8'), source);
  const article = renderArticle(body);
  assert.equal(article.hasFootnotes, true);
  const doc = new JSDOM(article.html).window.document;
  assert.deepEqual([...doc.querySelectorAll('.footnote-ref a')].map(a => a.textContent), ['[1]', '[1]']);
  assert.equal(doc.querySelectorAll('.footnote-item').length, 1);
  assert.equal(doc.querySelectorAll('.footnote-backref').length, 2);
  assert.equal(doc.querySelectorAll('a[href="https://example.com/paper"]').length, 1);
  assert(![...doc.querySelectorAll('a')].some(a => a.textContent === 'AlexNet'));
  for (const link of doc.querySelectorAll('a[href^="#"]')) assert(doc.getElementById(link.hash.slice(1)));
});

test('references follow first citation order, localize headings, and avoid duplicate IDs', () => {
  const source = '## References\n\nSecond[^b], first[^a], second again[^b].\n\n[^a]: Alpha\n\n[^b]: Beta\n';
  const doc = new JSDOM(renderMarkdown(source, false, 'ru')).window.document;
  assert.deepEqual([...doc.querySelectorAll('.footnote-item')].map(li => li.textContent.trim()[0]), ['B', 'A']);
  assert.deepEqual([...doc.querySelectorAll('.footnote-ref a')].map(a => a.textContent), ['[1]', '[2]', '[1]']);
  assert.equal(doc.querySelector('#references').textContent, 'Ссылки на материалы');
  assert.equal(doc.querySelector('#references').parentElement, doc.body);
  assert.equal(doc.querySelector('#references').nextElementSibling, doc.querySelector('.references-section'));
  assert.equal(doc.querySelector('.references-section').getAttribute('aria-labelledby'), 'references');
  const ids = [...doc.querySelectorAll('[id]')].map(node => node.id);
  assert.equal(new Set(ids).size, ids.length);
});

test('footnote examples in code stay literal and do not create a references list', () => {
  const source = '```md\nExample[^x]\n\n[^x]: Not a citation\n```\n\nInline `[^x]`.';
  const article = renderArticle(source);
  assert.equal(article.hasFootnotes, false);
  assert(!article.html.includes('class="footnotes-list"'));
  assert(article.html.includes('[^x]: Not a citation'));
});
