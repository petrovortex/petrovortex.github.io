import MarkdownIt from 'markdown-it';
import footnote from 'markdown-it-footnote';
import { mathjax } from 'mathjax-full/js/mathjax.js';
import { TeX } from 'mathjax-full/js/input/tex.js';
import { SVG } from 'mathjax-full/js/output/svg.js';
import { liteAdaptor } from 'mathjax-full/js/adaptors/liteAdaptor.js';
import { RegisterHTMLHandler } from 'mathjax-full/js/handlers/html.js';
import { AllPackages } from 'mathjax-full/js/input/tex/AllPackages.js';
import { slug } from './documents.mjs';

const adaptor = liteAdaptor();
RegisterHTMLHandler(adaptor);
const mathDocument = mathjax.document('', { InputJax: new TeX({ packages: AllPackages }), OutputJax: new SVG({ fontCache: 'none' }) });
const escape = text => text.replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');
function math(tex, display) {
  const delimiter = display ? '$$' : '$';
  const source = delimiter + tex + delimiter;
  const node = mathDocument.convert(tex, { display });
  const html = adaptor.outerHTML(node);
  if (html.includes('data-mjx-error')) throw new Error('Invalid formula: ' + tex);
  const svg = html.match(/<svg[\s\S]*<\/svg>/)[0].replace('<svg ', '<svg role="img" aria-label="' + escape(tex) + '" ').replace(/(<svg[^>]*>)/, '$1<title>' + escape(tex) + '</title>');
  return '<' + (display ? 'div' : 'span') + ' class="math-' + (display ? 'display' : 'inline') + '" data-math-source="' + escape(source) + '">' + svg + '</' + (display ? 'div' : 'span') + '>';
}
export function renderArticle(source, enableMath = false, lang = 'en') {
  const md = new MarkdownIt({ html: true, linkify: false }).use(footnote);
  const references = lang === 'ru' ? 'Ссылки на материалы' : 'References';
  md.renderer.rules.footnote_caption = (tokens, i) => '[' + (tokens[i].meta.id + 1) + ']';
  md.renderer.rules.footnote_block_open = () => '<section class="references-section footnotes" role="doc-endnotes">\n<h2 id="references">' + references + '</h2>\n<ol class="footnotes-list">\n';
  if (enableMath) {
    md.inline.ruler.before('escape', 'math_inline', (state, silent) => {
      if (state.src[state.pos] !== '$' || state.src[state.pos + 1] === '$' || /\s/.test(state.src[state.pos + 1] || ' ')) return false;
      let end = state.pos + 1;
      while ((end = state.src.indexOf('$', end)) >= 0 && state.src[end - 1] === '\\') end++;
      if (end < 0 || /\n/.test(state.src.slice(state.pos + 1, end)) || /\s/.test(state.src[end - 1])) return false;
      if (!silent) { const token = state.push('math_inline', '', 0); token.content = state.src.slice(state.pos + 1, end); }
      state.pos = end + 1; return true;
    });
    md.block.ruler.before('fence', 'math_block', (state, start, end, silent) => {
      const first = state.bMarks[start] + state.tShift[start];
      if (state.src.slice(first, first + 2) !== '$$') return false;
      const finish = state.src.indexOf('$$', first + 2);
      if (finish < 0) throw new Error('Unclosed display formula');
      if (silent) return true;
      let next = start; while (next < end && state.eMarks[next] < finish + 2) next++;
      const token = state.push('math_block', '', 0); token.content = state.src.slice(first + 2, finish); token.block = true;
      state.line = next + 1; return true;
    });
    md.renderer.rules.math_inline = (tokens, i) => math(tokens[i].content, false);
    md.renderer.rules.math_block = (tokens, i) => math(tokens[i].content, true) + '\n';
  }
  const taken = new Set();
  md.core.ruler.push('heading_ids', state => {
    if (state.env.footnotes?.list?.length) taken.add('references');
    state.tokens.forEach((token, i) => {
      if (token.type !== 'heading_open') return;
      const stem = slug(state.tokens[i + 1].children.map(t => t.content).join('')) || 'section';
      let id = stem, n = 2; while (taken.has(id)) id = stem + '-' + n++;
      taken.add(id); token.attrSet('id', id);
    });
  });
  const env = {};
  const html = md.render(source, env);
  return { html, hasFootnotes: Boolean(env.footnotes?.list?.length) };
}

export function renderMarkdown(source, enableMath = false, lang = 'en') {
  return renderArticle(source, enableMath, lang).html;
}
