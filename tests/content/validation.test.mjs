import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { stringify } from 'yaml';
import { validateContent } from '../../scripts/site/validate-content.mjs';

async function fixture(t) {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), 'site-validation-'));
  t.after(() => fs.rm(root, { recursive: true, force: true }));
  await fs.writeFile(path.join(root, '_config.yml'), 'collections_dir: content\n');
  const notebook = { title: 'Notebook', lang: 'en', lang_ref: 'notebook', date: '2025-01-01T10:00:00Z', permalink: '/library/example/',
    notebook_id: 'example', description: 'Test', topics: ['Testing'], status: 'complete', source_author: 'Teacher', source_url: 'https://example.org/' };
  const note = { title: 'Note', lang: 'en', lang_ref: 'note', date: '2025-01-02T10:00:00Z', permalink: '/library/example/first/', notebook: 'example', order: 1 };
  const save = async (file, data) => {
    const target = path.join(root, 'content', file);
    await fs.mkdir(path.dirname(target), { recursive: true });
    await fs.writeFile(target, '---\n' + stringify(data) + '---\n\nBody.\n');
  };
  await save('_notebooks/en/example.md', notebook);
  await save('_notes/en/first.md', note);
  return { root, notebook, note, save };
}

test('content validation keeps notebook membership, sequence, and language consistent', async t => {
  const { root, note, save } = await fixture(t);
  await validateContent(root);
  await save('_notes/en/first.md', { ...note, notebook: 'missing' });
  await assert.rejects(validateContent(root), /notebook must exist in the same language/);
  await save('_notes/en/first.md', { ...note, lang: 'ru' });
  await assert.rejects(validateContent(root), /language must match/);
  await save('_notes/en/first.md', note);
  await save('_notes/en/second.md', { ...note, lang_ref: 'second', permalink: '/library/example/second/' });
  await assert.rejects(validateContent(root), /duplicate order/);
});

test('content validation rejects broken routes, dates, and translated identifiers before rendering', async t => {
  const { root, note, save } = await fixture(t);
  await save('_notes/en/first.md', { ...note, permalink: '/library/another/first/' });
  await assert.rejects(validateContent(root), /note URL/);
  await save('_notes/en/first.md', { ...note, date: 'not-a-date' });
  await assert.rejects(validateContent(root), /invalid date/);
  await save('_notes/en/first.md', note);
  await save('_notes/en/second.md', { ...note, permalink: '/library/example/second/', order: 2 });
  await assert.rejects(validateContent(root), /duplicate translation reference/);
});
