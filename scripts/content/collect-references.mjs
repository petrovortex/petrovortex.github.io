function escapeLabel(text) {
  return text.replace(/[\\`*_\[\]<>~&$]/g, '\\$&');
}

// Keep code spans in the list even when the code itself contains backticks.
function codeSpan(text) {
  const longest = Math.max(0, ...Array.from(text.matchAll(/`+/g), match => match[0].length));
  const fence = '`'.repeat(longest + 1);
  const pad = /^`|`$|^ .* $/.test(text) && text.trim() ? ' ' : '';
  return fence + pad + text + pad + fence;
}

export function collectReferences(tokens, reservedIds) {
  const sources = new Map();
  for (const block of tokens) {
    // Already-authored footnotes are rendered separately by the reader.
    if (block.type === 'footnote_block_open') break;
    if (block.type !== 'inline') continue;
    let link = null, label = '';
    for (const token of block.children) {
      if (token.type === 'link_open') {
        link = token;
        label = '';
      } else if (token.type === 'link_close') {
        const url = link?.attrGet('href');
        if (/^https?:\/\//i.test(url) && label.trim()) {
          if (!sources.has(url)) sources.set(url, { number: sources.size + 1, label: label.trim(), mentions: [] });
          const source = sources.get(url);
          const title = link.attrGet('title')?.trim();
          if (title && !source.title) source.title = escapeLabel(title.replace(/\s+/g, ' '));
          let id = 'source-ref-' + source.number + '-' + (source.mentions.length + 1);
          while (reservedIds.has(id)) id += '-ref';
          reservedIds.add(id);
          link.attrSet('id', id);
          source.mentions.push(id);
        }
        link = null;
      } else if (link) {
        if (token.type === 'text') label += escapeLabel(token.content);
        if (token.type === 'code_inline') label += codeSpan(token.content);
        if (token.type === 'softbreak' || token.type === 'hardbreak') label += ' ';
      }
    }
  }
  return sources;
}

export function referenceList(sources, lang, hasFootnotes, articleUrl = '') {
  if (!sources.size) return '';
  const heading = lang === 'ru'
    ? (hasFootnotes ? 'Ссылки из текста' : 'Ссылки на материалы')
    : (hasFootnotes ? 'Links in the text' : 'References');
  const list = [];
  for (const [url, source] of sources) {
    const arrows = source.mentions.map((id, index) => {
      const arrow = source.mentions.length === 1 ? '↩' : '↩' + (index + 1);
      const position = source.number + '.' + (index + 1);
      const title = lang === 'ru' ? 'Вернуться к упоминанию ' + position : 'Return to mention ' + position;
      return `[${arrow}](<${articleUrl}#${id}> "${title}")`;
    });
    list.push(`${source.number}. [${source.title || source.label}](<${url}>) ${arrows.join(' ')}`);
  }
  return '## ' + heading + '\n\n' + list.join('\n') + '\n';
}
