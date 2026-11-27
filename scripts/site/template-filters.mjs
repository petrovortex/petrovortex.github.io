import { renderMarkdown } from '../content/render-markdown.mjs';

const valueAt = (item, key) => key.split('.').reduce((value, part) => value?.[part], item);
const dateValue = value => value == null || value === '' ? null : new Date(value);

export function registerFilters(config, site) {
  const relativeUrl = value => {
    if (value == null) return '';
    const url = String(value);
    if (/^(?:[a-z][a-z\d+.-]*:|\/\/|#)/i.test(url)) return url;
    return (site.baseurl || '').replace(/\/$/, '') + '/' + url.replace(/^\//, '');
  };
  const parts = value => {
    const date = dateValue(value);
    if (!date || Number.isNaN(date.getTime())) return null;
    return Object.fromEntries(new Intl.DateTimeFormat('en-GB', {
      timeZone: site.timezone || 'UTC', year: 'numeric', month: '2-digit', day: '2-digit',
      hour: '2-digit', minute: '2-digit', hourCycle: 'h23', timeZoneName: 'short',
    }).formatToParts(date).map(part => [part.type, part.value]));
  };
  config.addFilter('relativeUrl', relativeUrl);
  config.addFilter('absoluteUrl', value => new URL(relativeUrl(value), site.url).href);
  config.addFilter('filterBy', (items, key, value) => (items || []).filter(item => valueAt(item, key) === value));
  config.addFilter('findBy', (items, key, value) => (items || []).find(item => valueAt(item, key) === value));
  config.addFilter('without', (items, key) => (items || []).filter(item => !valueAt(item, key)));
  config.addFilter('isoDate', value => dateValue(value)?.toISOString() || '');
  config.addFilter('timestamp', value => Math.floor((dateValue(value)?.getTime() || 0) / 1000));
  config.addFilter('displayDate', value => { const p = parts(value); return p ? `${p.day}.${p.month}.${p.year}` : ''; });
  config.addFilter('timestampTitle', value => { const p = parts(value); return p ? `${p.day}.${p.month}.${p.year} ${p.hour}:${p.minute} ${p.timeZoneName}` : ''; });
  config.addFilter('year', value => parts(value)?.year || '');
  config.addFilter('markdown', source => renderMarkdown(String(source || '')));
  config.addFilter('jsonify', value => JSON.stringify(value ?? null).replace(/</g, '\\u003c'));
  config.addFilter('normalizeWhitespace', value => String(value || '').replace(/\s+/g, ' ').trim());
  config.addFilter('notebookLastUpdated', (notebook, notes) => {
    const timestamps = [notebook?.last_modified_at || notebook?.date,
      ...(notes || []).map(note => note.data.last_modified_at || note.data.date)].filter(Boolean).map(value => new Date(value).getTime());
    return timestamps.length ? new Date(Math.max(...timestamps)).toISOString() : null;
  });
}
