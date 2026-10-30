import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import { JSDOM } from 'jsdom';
import { initPortrait } from '../../assets/js/portrait.js';
import { initAccentTheme } from '../../assets/js/accent-theme.js';
import { initTheme } from '../../assets/js/theme.js';
import { initNavigation } from '../../assets/js/navigation.js';

const texts = { portrait_flip: 'Flip photo', portrait_reset: 'First photo', rainbow_on: 'Rainbow', rainbow_off: 'Normal accents', light_mode: 'Light', dark_mode: 'Dark' };
const rainbowMarkup = await fs.readFile('_includes/components/rainbow.html', 'utf8');

test('portrait starts on the first photo and toggles both ways without changing the images', () => {
  const dom = new JSDOM('<button class="portrait-toggle" aria-pressed="false" disabled><img src="first.jpg"><img src="second.jpg"></button>');
  const doc = dom.window.document, button = doc.querySelector('button');
  initPortrait(doc, texts);
  assert.equal(button.disabled, false);
  assert.equal(button.getAttribute('aria-pressed'), 'false');
  button.click();
  assert.equal(button.getAttribute('aria-pressed'), 'true');
  assert.equal(button.getAttribute('aria-label'), texts.portrait_reset);
  button.click();
  assert.equal(button.getAttribute('aria-pressed'), 'false');
  assert.equal(button.getAttribute('aria-label'), texts.portrait_flip);
  assert.deepEqual([...doc.images].map(img => img.getAttribute('src')), ['first.jpg', 'second.jpg']);
  dom.window.close();
});

function appearance({ blocked = false } = {}) {
  const dom = new JSDOM('<button class="theme-toggle" hidden></button><button class="rainbow-toggle" hidden>' + rainbowMarkup + '</button>', { url: 'https://example.com' });
  const doc = dom.window.document;
  dom.window.matchMedia = () => ({ matches: false, addEventListener() {} });
  if (blocked) Object.defineProperty(dom.window, 'localStorage', { get() { throw Error('blocked'); } });
  initTheme(doc, texts);
  return { dom, doc };
}
test('rainbow accents persist, coexist with either main theme, and can be switched off', () => {
  const { dom, doc } = appearance();
  initAccentTheme(doc, texts);
  const button = doc.querySelector('.rainbow-toggle');
  button.click();
  assert.equal(doc.documentElement.dataset.theme, 'light');
  assert.equal(doc.documentElement.dataset.accent, 'rainbow');
  assert.equal(dom.window.localStorage.getItem('site-accent'), 'rainbow');
  assert.equal(button.getAttribute('aria-pressed'), 'true');
  doc.querySelector('.theme-toggle').click();
  assert.equal(doc.documentElement.dataset.theme, 'dark');
  assert.equal(doc.documentElement.dataset.accent, 'rainbow');
  button.click();
  assert.equal(doc.documentElement.dataset.theme, 'dark');
  assert.equal(doc.documentElement.dataset.accent, undefined);
  assert.equal(dom.window.localStorage.getItem('site-accent'), null);
  dom.window.close();
});

test('rainbow restores on another page, follows storage changes, and tolerates blocked storage', () => {
  const { dom, doc } = appearance();
  dom.window.localStorage.setItem('site-accent', 'rainbow');
  initAccentTheme(doc, texts);
  assert.equal(doc.documentElement.dataset.accent, 'rainbow');
  dom.window.dispatchEvent(new dom.window.StorageEvent('storage', { key: 'site-accent', newValue: null }));
  assert.equal(doc.documentElement.dataset.accent, undefined);
  assert.equal(doc.querySelector('.rainbow-toggle').getAttribute('aria-pressed'), 'false');
  dom.window.close();
  const blocked = appearance({ blocked: true });
  initAccentTheme(blocked.doc, texts);
  blocked.doc.querySelector('.rainbow-toggle').click();
  assert.equal(blocked.doc.documentElement.dataset.accent, 'rainbow');
  blocked.dom.window.close();
});

test('rainbow text colours retain at least 4.5:1 contrast on their light and dark surfaces', async () => {
  const css = await fs.readFile('assets/css/style.css', 'utf8');
  const colors = [...css.matchAll(/--rainbow-(?:red|orange|gold|green|blue|purple):\s*(#[a-f0-9]{6})/g)].map(match => match[1]);
  assert.equal(colors.length, 12);
  const luminance = hex => hex.slice(1).match(/../g).map(value => parseInt(value, 16) / 255).map(value => value <= .04045 ? value / 12.92 : ((value + .055) / 1.055) ** 2.4).reduce((sum, value, index) => sum + value * [.2126, .7152, .0722][index], 0);
  colors.forEach((color, index) => {
    const values = [luminance(color), luminance(index < 6 ? '#faf9f6' : '#1d1e1c')].sort((a, b) => b - a);
    assert((values[0] + .05) / (values[1] + .05) >= 4.5, color + ' has insufficient contrast');
  });
});

test('mobile menu closes with Escape, outside click, focus leaving, and a wider viewport', () => {
  const dom = new JSDOM('<header class="site-header"><button class="menu-toggle" aria-expanded="false" hidden></button><div id="header-menu"><a href="/links/">Links</a><button class="theme-toggle">Theme</button></div></header><button id="outside">Outside</button>');
  const doc = dom.window.document;
  let resize;
  const mobile = { matches: true, addEventListener: (_, fn) => { resize = fn; } };
  dom.window.matchMedia = () => mobile;
  initNavigation(doc);
  const button = doc.querySelector('.menu-toggle'), panel = doc.getElementById('header-menu');
  assert(panel.inert, 'closed menu cannot receive focus');
  button.click();
  assert(panel.classList.contains('is-open'));
  assert.equal(panel.inert, false);
  panel.querySelector('a').focus();
  doc.dispatchEvent(new dom.window.KeyboardEvent('keydown', { key: 'Escape' }));
  assert.equal(button.getAttribute('aria-expanded'), 'false');
  assert.equal(doc.activeElement, button);
  button.click(); doc.getElementById('outside').click();
  assert(!panel.classList.contains('is-open'));
  button.click(); panel.querySelector('a').focus(); doc.getElementById('outside').focus();
  assert.equal(button.getAttribute('aria-expanded'), 'false');
  button.click(); mobile.matches = false; resize();
  assert.equal(button.getAttribute('aria-expanded'), 'false');
  assert.equal(panel.inert, false, 'desktop settings remain available');
  mobile.matches = true; resize();
  assert(panel.inert);
  dom.window.close();
});
