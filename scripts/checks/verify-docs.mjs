import fs from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert/strict';
import MarkdownIt from 'markdown-it';
import { parse } from 'yaml';
import { frontmatter } from '../content/documents.mjs';

const markdown = new MarkdownIt();
const files = ['README.md', ...(await fs.readdir('docs')).filter(name => name.endsWith('.md')).map(name => 'docs/' + name)];
const parsed = new Map();
const failures = [];
let links = 0, examples = 0;

function anchors(tokens) {
  const found = new Set(), duplicates = new Map();
  tokens.forEach((token, index) => {
    if (token.type !== 'heading_open') return;
    const text = tokens[index + 1].children.filter(child => ['text', 'code_inline'].includes(child.type)).map(child => child.content).join('');
    const base = text.toLowerCase().replace(/[^\p{L}\p{N}_\- ]/gu, '').replaceAll(' ', '-');
    const count = duplicates.get(base) || 0;
    duplicates.set(base, count + 1);
    found.add(base + (count ? '-' + count : ''));
  });
  return found;
}

async function read(file) {
  if (!parsed.has(file)) {
    const text = await fs.readFile(file, 'utf8');
    const tokens = markdown.parse(text, {});
    parsed.set(file, { tokens, anchors: anchors(tokens) });
  }
  return parsed.get(file);
}

for (const file of files) {
  const { tokens } = await read(file);
  const titles = tokens.filter(token => token.type === 'heading_open' && token.tag === 'h1');
  assert.equal(titles.length, 1, file + ': expected one page title');
  for (const token of tokens) {
    if (token.type === 'fence' && token.info === 'yaml') {
      assert(parse(token.content), file + ': empty YAML example');
      examples++;
    }
    for (const child of token.children || []) {
      if (child.type !== 'link_open') continue;
      const href = child.attrGet('href');
      if (/^[a-z]+:/i.test(href)) continue;
      links++;
      const [relative, fragment] = href.split('#');
      const target = path.normalize(relative ? path.join(path.dirname(file), decodeURIComponent(relative)) : file);
      try {
        await fs.access(target);
        if (fragment && target.endsWith('.md')) {
          assert((await read(target)).anchors.has(decodeURIComponent(fragment)), 'missing heading #' + fragment);
        }
      } catch (error) { failures.push(file + ': ' + href + ' (' + error.message + ')'); }
    }
  }
}
for (const name of ['post', 'note', 'course']) {
  const source = await fs.readFile('docs/templates/' + name + '.md', 'utf8');
  const { data } = frontmatter(source);
  for (const key of ['title', 'date', 'lang', 'lang_ref', 'permalink']) assert(data[key], name + ': missing ' + key);
  const collection = name === 'post' ? '_posts' : name === 'note' ? '_notes' : '_courses';
  const directory = '.preview/doc-examples/content/' + collection + '/' + data.lang;
  await fs.mkdir(directory, { recursive: true });
  await fs.writeFile(directory + '/' + (name === 'post' ? '2026-10-28-' : '') + name + '-en.md', source);
}
await fs.copyFile('_config.yml', '.preview/doc-examples/_config.yml');
assert.equal(failures.length, 0, failures.join('\n'));
console.log('Checked ' + files.length + ' documentation pages, ' + links + ' local links/anchors, ' + examples + ' YAML examples, and 3 templates.');
