// Runs before styles are painted, so navigating between pages keeps the chosen theme.
(function () {
  var saved;
  try { saved = localStorage.getItem('site-theme'); } catch (_) {}
  var dark = saved === 'dark' || (saved !== 'light' && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches);
  document.documentElement.dataset.theme = dark ? 'dark' : 'light';
  try { if (localStorage.getItem('site-accent') === 'rainbow') document.documentElement.dataset.accent = 'rainbow'; } catch (_) {}
  var meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.content = dark ? '#1d1e1c' : '#faf9f6';
})();
