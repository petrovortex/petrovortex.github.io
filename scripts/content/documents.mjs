import fs from 'node:fs/promises';
import path from 'node:path';
import { parse, stringify } from 'yaml';

export function frontmatter(raw) {
  const match = raw.replace(/^\uFEFF/, '').match(/^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/);
  return match ? { data: parse(match[1]) || {}, body: raw.replace(/^\uFEFF/, '').slice(match[0].length) } : { data: {}, body: raw };
}
export const serialize = (data, body) => '---\n' + stringify(data) + '---\n\n' + body.trim() + '\n';
export async function writeChanged(file, content) {
  try { if ((await fs.readFile(file)).equals(Buffer.from(content))) return false; } catch (e) { if (e.code !== 'ENOENT') throw e; }
  await fs.mkdir(path.dirname(file), { recursive: true });
  await fs.writeFile(file, content);
  return true;
}
export function within(root, relative) {
  const target = path.resolve(root, relative);
  const rel = path.relative(path.resolve(root), target);
  if (rel === '..' || rel.startsWith('..' + path.sep) || path.isAbsolute(rel)) throw new Error('Path escapes its root: ' + relative);
  return target;
}
export async function walk(directory) {
  const entries = await fs.readdir(directory, { withFileTypes: true }).catch(e => { if (e.code === 'ENOENT') return []; throw e; });
  return (await Promise.all(entries.filter(e => !e.name.startsWith('.') && !e.isSymbolicLink()).map(e => e.isDirectory() ? walk(path.join(directory, e.name)) : [path.join(directory, e.name)]))).flat();
}
export const slug = text => text.toLowerCase().trim().replace(/\s+/g, '-').replace(/[^\w\-а-яё]+/g, '').replace(/-+/g, '-');
// Follow Jekyll's collections_dir setting in the existing local content tools.
export function collectionsRoot(root, config) {
  return within(root, config.collections_dir || '.');
}
export function collectionName(file) {
  const parts = file.replaceAll('\\', '/').split('/');
  return ['posts', 'notes', 'courses'].find(name => parts.includes('_' + name));
}
export function pageUrl(file, data) {
  if (data.permalink) return data.permalink;
  if (collectionName(file) === 'posts') return '/' + path.basename(file, '.md').replace(/^\d{4}-\d{2}-\d{2}-/, '') + '/';
  throw new Error(file + ': permalink is required');
}
