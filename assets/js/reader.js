export function slugify(text) {
  return text.toLowerCase().trim().replace(/\s+/g, '-').replace(/[^\w\-а-яё]+/g, '').replace(/-+/g, '-');
}

export function addReferences(body, texts) {
  const external = new Map();
  const origins = new Set([body.ownerDocument.location.origin]);
  try { origins.add(new URL(body.ownerDocument.querySelector('link[rel=canonical]')?.href).origin); } catch {}
  for (const link of body.querySelectorAll('a[href]')) {
    if (!/^https?:/.test(link.href) || origins.has(new URL(link.href).origin)) continue;
    link.target = '_blank'; link.rel = 'noopener noreferrer';
    if (!external.has(link.href)) {
      const id = link.id || 'ref-link-' + (external.size + 1);
      if (!link.id) link.id = id;
      external.set(link.href, id);
    }
  }
  if (!external.size || body.querySelector('#references, .footnotes')) return;
  const doc = body.ownerDocument;
  const section = doc.createElement('section'); section.className = 'references-section';
  const heading = doc.createElement('h2'); heading.id = 'references'; heading.textContent = texts.references;
  const list = doc.createElement('ol');
  for (const [url, id] of external) {
    const item = doc.createElement('li');
    const back = doc.createElement('a'); back.href = '#' + id; back.textContent = '↑'; back.className = 'reference-back'; back.setAttribute('aria-label', texts.back);
    const link = doc.createElement('a'); link.href = url; link.textContent = url.replace(/^https?:\/\//, ''); link.target = '_blank'; link.rel = 'noopener noreferrer';
    item.append(back, link); list.append(item);
  }
  section.append(heading, list); body.append(section);
}

export function initReader({ doc = document, texts, copy }) {
  const body = doc.querySelector('.article-body');
  const rail = doc.querySelector('.toc-rail');
  if (!body || !rail) return;
  const win = doc.defaultView;
  if (body.dataset.references !== "false") addReferences(body, texts);
  body.querySelectorAll('table').forEach(table => { const wrap = doc.createElement('div'); wrap.className = 'table-scroll'; table.before(wrap); wrap.append(table); });
  const headings = [...body.querySelectorAll('h2, h3')];
  if (!headings.length) return;
  const taken = new Set([...doc.querySelectorAll('[id]')].map(el => el.id));
  const titles = new Map(headings.map(h => [h, h.textContent.trim()]));
  headings.forEach((heading, index) => {
    if (heading.id) return;
    const stem = slugify(titles.get(heading)) || 'section-' + (index + 1);
    let id = stem, suffix = 2;
    while (taken.has(id)) id = stem + '-' + suffix++;
    heading.id = id; taken.add(id);
  });
  const sections = new Map();
  headings.filter(h => h.tagName === 'H2' && h.parentElement === body).forEach(h2 => {
    const content = doc.createElement('div'); content.className = 'section-content';
    let next = h2.nextSibling;
    const nodes = [];
    while (next && !(next.nodeType === 1 && next.tagName === 'H2')) { nodes.push(next); next = next.nextSibling; }
    h2.after(content); nodes.forEach(node => content.append(node));
    sections.set(h2, content);
  });
  function setFold(heading, hidden) {
    const section = sections.get(heading);
    if (!section) return;
    section.hidden = hidden;
    const button = heading.querySelector('[data-fold]');
    button?.setAttribute('aria-expanded', String(!hidden));
    if (button) button.textContent = hidden ? '+' : '−';
  }
  headings.forEach(heading => {
    const controls = doc.createElement('span'); controls.className = 'heading-controls';
    const anchor = doc.createElement('button'); anchor.type = 'button'; anchor.className = 'heading-control'; anchor.textContent = '#'; anchor.title = texts.section_link; anchor.setAttribute('aria-label', texts.section_link + ': ' + titles.get(heading));
    anchor.addEventListener('click', () => copy(win.location.origin + win.location.pathname + '#' + heading.id));
    controls.append(anchor);
    if (sections.has(heading)) {
      const button = doc.createElement('button'); button.type = 'button'; button.className = 'heading-control'; button.dataset.fold = ''; button.textContent = '−'; button.setAttribute('aria-expanded', 'true'); button.setAttribute('aria-label', texts.fold + ': ' + titles.get(heading));
      const section = sections.get(heading); section.id = 'section-content-' + heading.id;
      button.setAttribute('aria-controls', section.id);
      button.addEventListener('click', () => { setFold(heading, !section.hidden); updateActive(); });
      controls.append(button);
    }
    heading.append(controls);
  });
  const root = doc.createElement('ul');
  const links = new Map();
  const parents = new Map();
  let parent = null;
  headings.forEach(heading => {
    const item = doc.createElement('li');
    const link = doc.createElement('a'); link.href = '#' + heading.id; link.textContent = titles.get(heading); item.append(link); links.set(heading, link);
    if (heading.tagName === 'H2' || !parent) { root.append(item); parent = item; }
    else {
      let sub = parent.querySelector('ul');
      if (!sub) { sub = doc.createElement('ul'); sub.className = 'toc-sublist'; parent.append(sub); }
      sub.append(item);
    }
    parents.set(heading, parent);
  });
  rail.querySelector('.toc-links').append(root); rail.hidden = false;
  const panel = rail.querySelector('details');
  const desktop = win.matchMedia('(min-width: 1100px)');
  function setPanel() { panel.open = desktop.matches; }
  setPanel(); desktop.addEventListener?.('change', setPanel);
  const header = doc.querySelector('.site-header');
  const reduced = () => win.matchMedia('(prefers-reduced-motion: reduce)').matches;
  function reveal(id, scroll = true) {
    const target = doc.getElementById(id);
    if (!target) return false;
    for (const [heading, section] of sections) if (heading === target || section.contains(target)) setFold(heading, false);
    if (scroll) target.scrollIntoView({ behavior: reduced() ? 'auto' : 'smooth', block: 'start' });
    return true;
  }
  function fromHash() {
    try { reveal(decodeURIComponent(win.location.hash.slice(1)), true); } catch {}
  }
  doc.addEventListener('click', event => {
    const link = event.target.closest('a[href^="#"]');
    if (!link || link.getAttribute('href') === '#main') return;
    let id;
    try { id = decodeURIComponent(link.getAttribute('href').slice(1)); } catch { return; }
    if (!doc.getElementById(id)) return;
    event.preventDefault();
    if (rail.contains(link) && !desktop.matches) panel.open = false;
    reveal(id);
    win.history.pushState(null, '', '#' + encodeURIComponent(id));
    const target = doc.getElementById(id); target.setAttribute('tabindex', '-1'); target.focus({ preventScroll: true });
  });
  let frame = 0;
  function updateActive() {
    const threshold = (header?.getBoundingClientRect().height || 82) + 42;
    let active = headings[0];
    for (const heading of headings) {
      if (heading.closest('[hidden]')) continue;
      if (heading.getBoundingClientRect().top <= threshold) active = heading;
    }
    // At the document end the last visible section remains the active location.
    for (const [heading, link] of links) {
      if (heading === active) link.setAttribute('aria-current', 'location');
      else link.removeAttribute('aria-current');
    }
    root.querySelectorAll('.active-section').forEach(item => item.classList.remove('active-section'));
    parents.get(active)?.classList.add('active-section');
    frame = 0;
  }
  win.addEventListener('scroll', () => { if (!frame) frame = win.requestAnimationFrame(updateActive); }, { passive: true });
  win.addEventListener('resize', updateActive);
  win.addEventListener('hashchange', fromHash);
  win.addEventListener('popstate', fromHash);
  win.addEventListener('load', () => { if (win.location.hash) fromHash(); updateActive(); }, { once: true });
  if (win.location.hash) fromHash();
  updateActive();
  return { reveal, updateActive, sections };
}
