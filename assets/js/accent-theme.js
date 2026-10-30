export function initAccentTheme(doc = document, texts = {}) {
  const button = doc.querySelector('.rainbow-toggle');
  if (!button) return;
  const win = doc.defaultView;
  function apply(rainbow) {
    if (rainbow) doc.documentElement.dataset.accent = 'rainbow';
    else delete doc.documentElement.dataset.accent;
    button.setAttribute('aria-pressed', String(rainbow));
    button.setAttribute('aria-label', rainbow ? texts.rainbow_off : texts.rainbow_on);
    button.title = button.getAttribute('aria-label');
  }
  let saved;
  try { saved = win.localStorage.getItem('site-accent'); } catch {}
  apply(saved === 'rainbow');
  button.hidden = false;
  button.addEventListener('click', () => {
    const rainbow = doc.documentElement.dataset.accent !== 'rainbow';
    apply(rainbow);
    try {
      if (rainbow) win.localStorage.setItem('site-accent', 'rainbow');
      else win.localStorage.removeItem('site-accent');
    } catch {}
  });
  win.addEventListener('storage', event => {
    if (event.key === 'site-accent' || event.key === null) apply(event.newValue === 'rainbow');
  });
}
