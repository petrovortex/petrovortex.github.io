import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { parse } from 'yaml';
import { collectionsRoot, frontmatter, pageUrl, walk } from '../content/documents.mjs';

export async function validateContent(root) {
  const config = parse(await fs.readFile(path.join(root, '_config.yml'), 'utf8'));
  const contentRoot = collectionsRoot(root, config);
  const read = async name => Promise.all((await walk(path.join(contentRoot, '_' + name)))
    .filter(file => file.endsWith('.md')).map(async file => ({ file, ...frontmatter(await fs.readFile(file, 'utf8')) })));
  const [posts, courses, notes] = await Promise.all(['posts', 'courses', 'notes'].map(read));
  const fail = (file, message) => { throw new Error(file + ': ' + message); };
  const required = (file, data, keys) => {
    for (const key of keys) if (data[key] == null || !String(data[key]).trim()) fail(file, key + ' is required');
  };
  const routes = new Set(), refs = new Set();
  for (const { file, data } of [...posts, ...courses, ...notes]) {
    const folderLang = path.relative(contentRoot, file).split(path.sep)[1];
    if (!['en', 'ru'].includes(folderLang) || data.lang !== folderLang) fail(file, 'language must match its en/ru folder');
    if (data.redirect_to) continue;
    required(file, data, ['title', 'date', 'lang_ref']);
    if (!/^[a-z0-9_-]+$/.test(data.lang_ref)) fail(file, 'lang_ref must be a stable slug');
    for (const key of ['date', 'last_modified_at']) {
      if (data[key] != null && Number.isNaN(new Date(data[key]).getTime())) fail(file, 'invalid ' + key + ' timestamp');
    }
    const route = pageUrl(file, data);
    if (routes.has(route)) fail(file, 'duplicate permalink');
    routes.add(route);
    const ref = data.lang + ':' + data.lang_ref;
    if (refs.has(ref)) fail(file, 'duplicate translation reference in one language');
    refs.add(ref);
  }
  const courseKeys = new Map();
  for (const { file, data } of courses) {
    required(file, data, ['course_id', 'description', 'source_author', 'source_url', 'permalink']);
    if (!Array.isArray(data.topics) || !data.topics.every(topic => typeof topic === 'string' && topic.trim())) fail(file, 'topics must be a list of strings');
    if (!['in_progress', 'complete'].includes(data.status)) fail(file, 'status must be in_progress or complete');
    if (!/^https?:\/\//.test(data.source_url)) fail(file, 'source_url must be an absolute web URL');
    if (data.materials != null && (!Array.isArray(data.materials) || !data.materials.length || !data.materials.every(material =>
      typeof material?.title === 'string' && material.title.trim() && typeof material.url === 'string' && /^https?:\/\//.test(material.url)))) {
      fail(file, 'materials must be a nonempty list of titles and absolute web URLs');
    }
    const prefix = data.lang === 'ru' ? '/ru/library/' : '/library/';
    if (!data.permalink.startsWith(prefix) || !/^[a-z0-9-]+\/$/.test(data.permalink.slice(prefix.length))) fail(file, 'invalid course permalink');
    const key = data.lang + ':' + data.course_id;
    if (courseKeys.has(key)) fail(file, 'duplicate course ID');
    courseKeys.set(key, data);
  }
  const orders = new Set();
  for (const { file, data } of notes) {
    required(file, data, ['permalink']);
    const key = data.lang + ':' + data.course;
    const course = courseKeys.get(key);
    if (!course) fail(file, 'course must exist in the same language');
    if (!data.permalink.startsWith(course.permalink) || !/^[a-z0-9-]+\/$/.test(data.permalink.slice(course.permalink.length))) fail(file, 'note URL must be one slug inside its course URL');
    if (!Number.isInteger(data.order) || data.order < 1) fail(file, 'order must be a positive integer');
    const orderKey = key + ':' + data.order;
    if (orders.has(orderKey)) fail(file, 'duplicate order within course');
    orders.add(orderKey);
  }
  console.log(`Content metadata valid (${courses.length} courses, ${notes.length} notes).`);
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  validateContent(path.resolve(process.argv[2] || '.')).catch(error => { console.error(error.message); process.exitCode = 1; });
}
