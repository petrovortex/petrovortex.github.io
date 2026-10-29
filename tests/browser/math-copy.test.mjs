import test from 'node:test';
import assert from 'node:assert/strict';
import { JSDOM } from 'jsdom';
import { renderMarkdown } from '../../scripts/content/render-markdown.mjs';
import { initMathCopy } from '../../assets/js/math-copy.js';

const inline = String.raw`$\text{"cost"} < \alpha + \$5$`;
const display = '$$\n' + String.raw`\begin{aligned}a &= b+c\\ d &= \frac{x}{y}\end{aligned}` + '\n$$';
const texts = {
  copy_formula: 'Copy formula as Markdown',
  formula_copied: 'Formula copied',
  formula_copy_failed: 'Select and copy the formula below.'
};
const article = () => '<div class="article-body">' + renderMarkdown(
  'Inline ' + inline + '.\n\n' + display + '\n\n`$code$`', true
) + '</div>';

test('math preserves exact source delimiters, escaping, and multiline TeX', () => {
  const dom = new JSDOM(article());
  const doc = dom.window.document;
  assert.deepEqual([...doc.querySelectorAll('[data-math-source]')].map(el => el.dataset.mathSource), [inline, display]);
  assert.equal(doc.querySelector('code').textContent, '$code$');
  assert.equal(doc.querySelector('code').hasAttribute('data-math-source'), false);
  assert.equal(doc.querySelectorAll('.math-inline svg').length, 1);
  assert.equal(doc.querySelectorAll('.math-display svg').length, 1);
  dom.window.close();
});

test('mouse and keyboard copy the formula without changing its visual markup', () => {
  const dom = new JSDOM(article());
  const doc = dom.window.document, copies = [];
  const graphics = [...doc.querySelectorAll('svg g')].map(el => el.outerHTML);
  initMathCopy({ doc, texts, copy: (...args) => copies.push(args) });
  const formulas = [...doc.querySelectorAll('[data-math-source]')];
  formulas[0].querySelector('svg').dispatchEvent(new dom.window.MouseEvent('click', { bubbles: true }));
  for (const key of ['Enter', ' ']) {
    const event = new dom.window.KeyboardEvent('keydown', { key, bubbles: true, cancelable: true });
    formulas[1].dispatchEvent(event);
    assert(event.defaultPrevented);
  }
  formulas[1].dispatchEvent(new dom.window.KeyboardEvent('keydown', { key: ' ', repeat: true }));
  assert.deepEqual(copies.map(args => args[0]), [inline, display, display]);
  assert(copies.every(args => args[1] === texts.formula_copied && args[2].multiline));
  assert(formulas.every(el => el.tabIndex === 0 && el.getAttribute('role') === 'button'));
  assert(formulas.every(el => el.title === texts.copy_formula && !el.hasAttribute('style')));
  assert.deepEqual([...doc.querySelectorAll('svg g')].map(el => el.outerHTML), graphics);
  dom.window.close();
});

test('blocked clipboard keeps multiline formulas intact in a selectable fallback', async () => {
  const dom = new JSDOM('<html lang="en"><body><script id="ui-strings" type="application/json">' +
    JSON.stringify(texts) + '</script>' + article() + '<div class="toast"></div></body></html>',
    { url: 'http://127.0.0.1:4000/', pretendToBeVisual: true });
  Object.defineProperty(dom.window.navigator, 'clipboard', { value: { writeText: async () => { throw Error('blocked'); } } });
  dom.window.HTMLDialogElement.prototype.showModal = function () { this.open = true; };
  dom.window.HTMLDialogElement.prototype.close = function () { this.open = false; this.dispatchEvent(new dom.window.Event('close')); };
  for (const key of ['window', 'document', 'navigator', 'location', 'CustomEvent']) {
    Object.defineProperty(globalThis, key, { value: key === 'window' ? dom.window : dom.window[key], configurable: true });
  }
  await import('../../assets/js/main.js?math-copy-fallback');
  const doc = dom.window.document, formula = doc.querySelector('.math-display');
  formula.focus();
  formula.click();
  await new Promise(resolve => setImmediate(resolve));
  const textarea = doc.querySelector('.copy-dialog textarea');
  assert.equal(textarea.value, display);
  assert.equal(textarea.selectionStart, 0);
  assert.equal(textarea.selectionEnd, display.length);
  assert.equal(doc.querySelector('.copy-dialog p').textContent, texts.formula_copy_failed);
  assert.equal(doc.querySelector('.toast').textContent, '');
  doc.querySelector('.copy-dialog button').click();
  assert.equal(doc.activeElement, formula);
  assert.equal(doc.querySelector('.copy-dialog'), null);
  dom.window.close();
});
