import fs from 'node:fs/promises';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { parse } from 'yaml';
import { frontmatter, serialize, within, walk, writeChanged, pageUrl, slug, collectionsRoot } from './documents.mjs';

export const DEFAULT_MANIFEST = 'config/obsidian-imports.yml';

// Only public display properties are inherited from a vault note.
const SOURCE_METADATA_FIELDS = [
  'title', 'description', 'excerpt', 'tags',
  'image', 'image_dark', 'image_alt', 'image_caption',
  'preview_image', 'preview_image_dark', 'math', 'published', 'date'
];

// Leave code fences and inline code unchanged, including example wiki syntax.
export async function transformProse(text, transform) {
  const chunks = text.split(/(^[ \t]*(?:`{3,}|~{3,})[^\n]*\n[\s\S]*?^[ \t]*(?:`{3,}|~{3,})[^\n]*$|`+[^`\n]*`+)/gm);
  return (await Promise.all(chunks.map((part, i) => i % 2 ? part : transform(part)))).join('');
}
async function replaceAsync(text, regex, replace) {
  const matches = [...text.matchAll(regex)];
  const replacements = await Promise.all(matches.map(replace));
  let result = '', offset = 0;
  matches.forEach((match, i) => { result += text.slice(offset, match.index) + replacements[i]; offset = match.index + match[0].length; });
  return result + text.slice(offset);
}
export async function importObsidian(root, manifestFile = DEFAULT_MANIFEST, vaultOverride) {
  const manifest = parse(await fs.readFile(within(root, manifestFile), 'utf8'));
  const config = parse(await fs.readFile(path.join(root, '_config.yml'), 'utf8'));
  const contentRoot = collectionsRoot(root, config);
  const vault = await fs.realpath(path.resolve(root, vaultOverride || manifest.vault));
  const items = manifest.items || [];
  const index = await walk(vault);
  const selected = new Map(), destinations = new Set(), ids = new Set(), locations = new Map();
  for (const item of items) {
    if (!/^[a-z0-9-]+$/.test(item.id) || ids.has(item.id)) throw new Error('Invalid or duplicate import id: ' + item.id);
    ids.add(item.id);
    const destination = within(root, item.destination);
    const relative = path.relative(contentRoot, destination).replaceAll('\\', '/');
    const location = relative.match(/^_(notes|posts)\/(en|ru)\/(?:[a-z0-9-]+\/)*([a-z0-9-]+\.md)$/);
    if (!location) throw new Error('Invalid destination: ' + item.destination);
    if (location[1] === 'posts' && !/^\d{4}-\d{2}-\d{2}-/.test(location[3])) throw new Error('Posts require a dated filename');
    if (destinations.has(destination)) throw new Error('Duplicate destination: ' + item.destination);
    destinations.add(destination);
    locations.set(item.id, { collection: location[1], lang: location[2] });
    const source = await fs.realpath(within(vault, item.source));
    within(vault, path.relative(vault, source));
    selected.set(source.toLowerCase(), item);
  }
  const pending = new Map();
  for (const item of items) {
    const source = await fs.realpath(within(vault, item.source));
    const { data, body: original } = frontmatter(await fs.readFile(source, 'utf8'));
    // Explicit metadata wins; private Obsidian front matter is not copied.
    const sourceMetadata = Object.fromEntries(
      SOURCE_METADATA_FIELDS.filter(key => data[key] !== undefined).map(key => [key, data[key]])
    );
    const manifestMetadata = item.metadata || {};
    const meta = { ...sourceMetadata, ...manifestMetadata, obsidian_import: item.id };
    if (!meta.title || !meta.lang || !meta.lang_ref) throw new Error(item.id + ': title, lang and lang_ref are required');
    const location = locations.get(item.id);
    if (meta.lang !== location.lang) throw new Error(item.id + ': language must match the destination folder');
    const destination = within(root, item.destination);
    let existing = {};
    try {
      existing = frontmatter(await fs.readFile(destination, 'utf8')).data;
      if (existing.obsidian_import !== item.id) throw new Error('Refusing to overwrite a hand-written file: ' + item.destination);
    } catch (e) { if (e.code !== 'ENOENT') throw e; }

    const sourceStat = await fs.stat(source);
    meta.date ||= data.created || data.created_at || existing.date || (sourceStat.birthtimeMs > 0 ? sourceStat.birthtime : sourceStat.mtime).toISOString();
    meta.last_modified_at = manifestMetadata.last_modified_at || manifestMetadata.updated
      || data.last_modified_at || data.updated || sourceStat.mtime.toISOString();
    if (location.collection === 'notes') delete meta.tags;

    async function resolveLocal(target) {
      const decoded = decodeURIComponent(target.replace(/^<|>$/g, '')).replaceAll('\\', '/');
      const candidates = [path.resolve(path.dirname(source), decoded), path.resolve(vault, decoded)];
      for (const candidate of candidates) {
        within(vault, path.relative(vault, candidate));
        for (const file of [candidate, candidate + '.md']) {
          try { const real = await fs.realpath(file); within(vault, path.relative(vault, real)); if ((await fs.stat(real)).isFile()) return real; } catch(e) { if (!['ENOENT','ENOTDIR'].includes(e.code)) throw e; }
        }
      }
      const matches = index.filter(file => path.basename(file).toLowerCase() === decoded.toLowerCase() || path.basename(file, '.md').toLowerCase() === decoded.toLowerCase());
      if (matches.length !== 1) throw new Error(item.id + ': missing or ambiguous vault target: ' + target);
      return matches[0];
    }
    async function link(target, label, embed = false) {
      if (target.startsWith('#')) target = '#' + slug(target.slice(1));
      if (/^(https?:|mailto:|#)/.test(target)) return (embed ? '!' : '') + '[' + label + '](' + target + ')';
      const [filePart, heading] = target.split('#');
      if (heading?.startsWith('^')) throw new Error('Obsidian block references need a heading link: ' + target);
      const file = await resolveLocal(filePart);
      if (/\.md$/i.test(file)) {
        if (embed) throw new Error('Note transclusion is not published automatically: ' + target + '. Use a link.');
        const mapped = selected.get(file.toLowerCase());
        if (!mapped || mapped.metadata?.published === false) throw new Error('Link points to an unselected note: ' + target + '. Add it to the import list or use plain text.');
        const url = pageUrl(mapped.destination, mapped.metadata);
        return '[' + label + '](' + url + (heading ? '#' + slug(heading) : '') + ')';
      }
      if (!/\.(png|jpe?g|gif|webp|svg|pdf)$/i.test(file)) throw new Error('Unsupported attachment: ' + target);
      const bytes = await fs.readFile(file);
      const name = createHash('sha256').update(bytes).digest('hex').slice(0, 16) + path.extname(file).toLowerCase();
      const url = '/assets/imported/' + item.id + '/' + name;
      pending.set(within(root, url.slice(1)), bytes);
      return (embed ? '!' : '') + '[' + label + '](' + url + ')';
    }
    let body = original.replace(/\r\n/g, '\n');
    body = await transformProse(body, async prose => {
      // Obsidian comments are private; do not include them in the public document.
      prose = prose.replace(/%%[\s\S]*?%%/g, '');
      prose = await replaceAsync(prose, /(!?)\[\[([^\]\n]+)\]\]/g, async m => {
        const [target, alias] = m[2].split('|');
        const label = alias && !/^\d+(x\d+)?$/.test(alias) ? alias : path.basename(target.split('#')[0], '.md') || target.slice(1);
        return link(target, label, Boolean(m[1]));
      });
      return replaceAsync(prose, /(!?)\[([^\]\n]*)\]\((<[^>]+>|[^\s)]+)(?:\s+"[^"]*")?\)/g, async m => {
        if (/^(https?:|mailto:|#|\/assets\/|\/library\/|\/ru\/)/.test(m[3])) return m[0];
        // Already converted selected post links are absolute.
        if (items.some(other => pageUrl(other.destination, other.metadata) === m[3].split('#')[0])) return m[0];
        return link(m[3], m[2], Boolean(m[1]));
      });
    });
    // Use H2/H3 for reader navigation without altering headings inside code.
    let shallowest = 6;
    await transformProse(body, prose => { for (const m of prose.matchAll(/^(#{1,6})\s/gm)) shallowest = Math.min(shallowest, m[1].length); return prose; });
    body = await transformProse(body, prose => prose.replace(/^(#{1,6})(\s)/gm, (_, hashes, space) => '#'.repeat(Math.min(6, Math.max(2, hashes.length + 2 - shallowest))) + space));
    for (const field of ['image','image_dark','preview_image','preview_image_dark']) {
      if (meta[field] && !/^(https?:|\/assets\/)/.test(meta[field])) {
        const converted = await link(meta[field].replace(/^!\[\[|\]\]$/g,''), '', true);
        meta[field] = converted.match(/\]\((.*)\)$/)[1];
      }
    }
    pending.set(destination, serialize(meta, body));
  }
  // Validate everything before writing, so unsupported links cannot leave a partial import.
  let changed = 0;
  for (const [file, content] of pending) if (await writeChanged(file, content)) changed++;
  console.log('Obsidian: ' + items.length + ' selected document(s), ' + changed + ' changed file(s).');
}
