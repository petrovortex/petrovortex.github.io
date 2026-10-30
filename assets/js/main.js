import { initTheme } from './theme.js';
import { initNavigation } from './navigation.js';
import { initPortrait } from './portrait.js';
import { initAccentTheme } from './accent-theme.js';
import { initExternalLinks } from './external-links.js';
import { initContact, initScrollTop } from './contact.js';
import { initListings } from './listings.js';
import { initReader } from './reader.js';
import { initMathCopy } from './math-copy.js';
import { safeStorage, createEngagementStore, createPreviewAdapter, createFirebaseAdapter } from './engagement.js';

document.documentElement.classList.add('js');
const texts = JSON.parse(document.getElementById('ui-strings')?.textContent || '{}');
let toastTimer;
function toast(message) {
  const el = document.querySelector('.toast');
  el.textContent = message; el.classList.add('visible');
  clearTimeout(toastTimer); toastTimer = setTimeout(() => el.classList.remove('visible'), 3000);
}
async function copy(value, message = texts.copied, { failureMessage = texts.copy_failed, label = texts.copy, multiline = false } = {}) {
  try {
    await navigator.clipboard.writeText(value);
    toast(message);
  } catch {
    const dialog = document.createElement('dialog'); dialog.className = 'copy-dialog';
    const description = document.createElement('p'); description.textContent = failureMessage; description.id = 'copy-dialog-label'; dialog.setAttribute('aria-labelledby', description.id);
    const input = document.createElement(multiline ? 'textarea' : 'input');
    if (multiline) input.rows = Math.min(8, Math.max(2, value.split('\n').length));
    else input.type = 'text';
    input.value = value; input.readOnly = true; input.setAttribute('aria-label', label);
    const button = document.createElement('button'); button.textContent = 'OK'; button.addEventListener('click', () => dialog.close());
    const previousFocus = document.activeElement;
    dialog.append(description, input, button); document.body.append(dialog);
    dialog.addEventListener('close', () => { dialog.remove(); previousFocus?.focus(); });
    dialog.showModal(); input.select();
  }
}
initNavigation();
document.addEventListener('click', event => {
  document.querySelectorAll('.share-menu[open]').forEach(details => { if (!details.contains(event.target)) details.open = false; });
});
document.addEventListener('keydown', event => {
  if (event.key !== 'Escape') return;
  document.querySelectorAll('.share-menu[open]').forEach(details => { details.open = false; details.querySelector('summary').focus(); });
});
document.querySelectorAll('[data-share]').forEach(button => button.addEventListener('click', async () => {
  const options = button.closest('[data-share-url]');
  const url = options.dataset.shareUrl;
  if (!['copy', 'discord'].includes(button.dataset.share)) return;
  const details = button.closest('details'); details.open = false; details.querySelector('summary').focus();
  await copy(url, button.dataset.share === 'discord' ? texts.discord_copied : texts.copied);
}));
initTheme(document, texts);
initAccentTheme(document, texts);
initPortrait(document, texts);
initContact({ texts });
initScrollTop();
initExternalLinks();
document.querySelectorAll('[data-copy-handle]').forEach(button => {
  button.hidden=false;
  button.addEventListener('click',()=>copy(button.dataset.copyHandle,texts.username_copied));
});
initListings();
initReader({ texts, copy });
initMathCopy({ texts, copy });

// Engagement is isolated from core UI, including failure to load Firebase itself.
async function initEngagement() {
  const elements = [...document.querySelectorAll('[data-stats-id]')];
  if (!elements.length) return;
  const isLive = location.hostname === 'petrovortex.github.io' && document.body.dataset.engagementMode !== 'preview';
  let persistent, transient;
  try { persistent = localStorage; } catch {}
  try { transient = sessionStorage; } catch {}
  // Preview storage is namespaced, even when a preview is explicitly requested on the live origin.
  const prefix = isLive ? '' : 'preview_';
  const stored = safeStorage(persistent);
  const storage = { get: key => stored.get(prefix + key), set: (key, value) => stored.set(prefix + key, value) };
  const cached = safeStorage(transient);
  const cache = { get: key => cached.get(prefix + key), set: (key, value) => cached.set(prefix + key, value) };
  let adapter;
  try { adapter = isLive ? await createFirebaseAdapter() : createPreviewAdapter(stored); }
  catch {
    elements.forEach(el => { el.title = texts.stats_failed; const button = el.querySelector('[data-like]'); button.disabled = true; });
    return;
  }
  const lock = navigator.locks ? (key, action) => navigator.locks.request(key, action) : undefined;
  const store = createEngagementStore({ adapter, storage, cache, lock });
  const groups = new Map();
  for (const el of elements) {
    const id = el.dataset.statsId;
    if (!groups.has(id)) groups.set(id, []);
    groups.get(id).push(el);
    el.querySelector('[data-like]').addEventListener('click', async () => {
      try { await store.like(id); }
      catch { toast(texts.like_failed); }
    });
  }
  groups.forEach((nodes, id) => store.watch(id, state => {
    for (const el of nodes) {
      ['views', 'likes'].forEach(metric => { const count = el.querySelector('[data-count="' + metric + '"]'); if (count) count.textContent = state.ready ? new Intl.NumberFormat(document.documentElement.lang).format(state[metric]) : '—'; });
      const button = el.querySelector('[data-like]');
      button.setAttribute('aria-pressed', String(state.liked));
      button.setAttribute('aria-label', state.liked ? texts.liked : texts.like);
      button.setAttribute('aria-busy', String(state.busy));
      button.disabled = state.busy || state.liked;
      el.title = state.error ? texts.stats_failed : '';
    }
    document.dispatchEvent(new CustomEvent('site:stats', { detail: { id, ...state } }));
  }));
  const articleId = document.querySelector('[data-article-id]')?.dataset.articleId;
  if (articleId) store.view(articleId).catch(() => {});
  window.addEventListener('pagehide', event => { if (!event.persisted) store.destroy(); });
}
initEngagement();
