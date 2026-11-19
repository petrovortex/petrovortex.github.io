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
  const course = { title: 'Course', lang: 'en', lang_ref: 'course', date: '2025-01-01T10:00:00Z', permalink: '/library/example/',
    course_id: 'example', description: 'Test', topics: ['Testing'], status: 'complete', source_author: 'Teacher', source_url: 'https://example.org/' };
  const note = { title: 'Note', lang: 'en', lang_ref: 'note', date: '2025-01-02T10:00:00Z', permalink: '/library/example/first/', course: 'example', order: 1 };
  const save = async (file, data) => {
    const target = path.join(root, 'content', file);
    await fs.mkdir(path.dirname(target), { recursive: true });
    await fs.writeFile(target, '---\n' + stringify(data) + '---\n\nBody.\n');
  };
  await save('_courses/en/example.md', course);
  await save('_notes/en/first.md', note);
  return { root, course, note, save };
}

test('content validation keeps course membership, sequence, and language consistent', async t => {
  const { root, note, save } = await fixture(t);
  await validateContent(root);
  await save('_notes/en/first.md', { ...note, course: 'missing' });
  await assert.rejects(validateContent(root), /course must exist in the same language/);
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
