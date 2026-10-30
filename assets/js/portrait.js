export function initPortrait(doc = document, texts = {}) {
  const button = doc.querySelector('.portrait-toggle');
  if (!button) return;
  button.disabled = false;
  button.addEventListener('click', () => {
    const alternate = button.getAttribute('aria-pressed') !== 'true';
    button.setAttribute('aria-pressed', String(alternate));
    button.setAttribute('aria-label', alternate ? texts.portrait_reset : texts.portrait_flip);
    button.title = button.getAttribute('aria-label');
  });
}
