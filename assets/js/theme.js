export function initTheme(doc = document, texts = {}) {
  const button=doc.querySelector('.theme-toggle'); if(!button) return;
  const win=doc.defaultView, media=win.matchMedia?.('(prefers-color-scheme: dark)');
  let preference;
  try {preference=win.localStorage.getItem('site-theme');} catch {}
  function apply(theme) {
    const dark=theme==='dark';
    doc.documentElement.dataset.theme=dark?'dark':'light';
    button.setAttribute('aria-pressed',String(dark));
    button.setAttribute('aria-label',dark?texts.light_mode:texts.dark_mode);
    button.title=dark?texts.light_mode:texts.dark_mode;
    const meta=doc.querySelector('meta[name="theme-color"]'); if(meta) meta.content=dark?'#1d1e1c':'#faf9f6';
  }
  apply(preference==='dark'||preference==='light'?preference:(media?.matches?'dark':'light'));
  button.hidden=false;
  button.addEventListener('click',()=>{
    preference=doc.documentElement.dataset.theme==='dark'?'light':'dark';
    try {win.localStorage.setItem('site-theme',preference);} catch {}
    apply(preference);
  });
  media?.addEventListener?.('change',event=>{if(preference!=='dark'&&preference!=='light') apply(event.matches?'dark':'light');});
  win.addEventListener('storage',event=>{if(event.key==='site-theme'){preference=event.newValue;apply(preference==='dark'||preference==='light'?preference:(media?.matches?'dark':'light'));}});
}
