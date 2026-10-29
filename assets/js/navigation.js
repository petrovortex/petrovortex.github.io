export function initNavigation(doc = document) {
  const header = doc.querySelector('.site-header');
  const button = header?.querySelector('.menu-toggle');
  const panel = header?.querySelector('#header-menu');
  if (!button || !panel) return;
  function setOpen(open) {
    button.setAttribute('aria-expanded', String(open));
    panel.classList.toggle('is-open', open);
  }
  button.hidden = false;
  button.addEventListener('click', () => setOpen(button.getAttribute('aria-expanded') !== 'true'));
  doc.addEventListener('click', event => {
    if (!header.contains(event.target)) setOpen(false);
  });
  doc.addEventListener('keydown', event => {
    if (event.key !== 'Escape' || button.getAttribute('aria-expanded') !== 'true') return;
    setOpen(false);
    button.focus();
  });
  header.addEventListener('focusout', event => {
    if (event.relatedTarget && !header.contains(event.relatedTarget)) setOpen(false);
  });
  const mobile = doc.defaultView.matchMedia('(max-width: 700px)');
  mobile.addEventListener('change', event => { if (!event.matches) setOpen(false); });
  return { setOpen };
}
