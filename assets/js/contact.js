export function validMessage(message) {
  return message.trim().length > 0 && message.length <= 2000 && /^[\p{L}\p{M}\p{N}\p{P}\p{Zs}\t\r\n]+$/u.test(message);
}
export function composeMessage({platform, message, canonical, title, settings, email, subject='Message from a reader'}) {
  const draft=subject+'\n\n'+message.trim()+'\n\n'+title+'\n'+canonical;
  if(platform==='telegram') return {url:'https://t.me/'+settings.telegram+'?text='+encodeURIComponent(draft),draft,copy:false};
  if(platform==='email') return {url:'mailto:'+email+'?subject='+encodeURIComponent(subject)+'&body='+encodeURIComponent(message.trim()+'\n\n'+title+'\n'+canonical),draft,copy:false};
  if(platform==='x') return {url:'https://x.com/'+settings.x,draft,copy:true};
  if(platform==='discord') return {url:/^\d+$/.test(settings.discord_id || '')?'https://discord.com/users/'+settings.discord_id:'https://discord.com/channels/@me',draft,copy:true};
  throw new Error('Unsupported message platform');
}
export function initContact({doc=document,texts={}}={}) {
  const button=doc.querySelector('.author-button'), dialog=doc.querySelector('.contact-dialog');
  if(!button || !dialog || typeof dialog.showModal!=='function') return;
  const win=doc.defaultView, settings=JSON.parse(doc.getElementById('contact-settings')?.textContent || '{}');
  const form=dialog.querySelector('form'), input=form.querySelector('#reader-message'), platform=form.querySelector('select');
  const error=form.querySelector('.form-error'), result=form.querySelector('.contact-result'), fallback=form.querySelector('.message-fallback');
  button.hidden=false;
  button.addEventListener('click',()=>{dialog.showModal();input.focus();});
  dialog.querySelector('[data-close-contact]').addEventListener('click',()=>dialog.close());
  dialog.addEventListener('close',()=>button.focus());
  function hint() {
    const copy=['x','discord'].includes(platform.value);
    form.querySelector('.platform-hint').textContent = platform.value==='discord' && !settings.discord_id ? texts.discord_message_hint : copy?texts.copy_message_hint:texts.draft_message_hint;
    form.querySelector('.contact-submit').textContent=copy?texts.copy_and_open:texts.open_draft;
  }
  input.addEventListener('input',()=>{
    form.querySelector('[data-message-count]').textContent=input.value.length+' / 2000';
    error.hidden=true; input.removeAttribute('aria-invalid');
  });
  platform.addEventListener('change',()=>{hint();result.textContent='';fallback.hidden=true;});
  hint();
  form.addEventListener('submit',async event=>{
    event.preventDefault();
    if(!validMessage(input.value)) {error.textContent=texts.message_invalid;error.hidden=false;input.setAttribute('aria-invalid','true');input.focus();return;}
    error.hidden=true; input.removeAttribute('aria-invalid');fallback.hidden=true;
    const composed=composeMessage({platform:platform.value,message:input.value,canonical:doc.querySelector('link[rel="canonical"]')?.href||win.location.href,title:doc.querySelector('h1')?.textContent||doc.title,settings,email:dialog.dataset.email,subject:texts.message_subject});
    // Open from this click, before awaiting clipboard, to retain the user gesture.
    win.open(composed.url,'_blank','noopener,noreferrer');
    const open=form.querySelector('[data-open-platform]');open.href=composed.url;
    if(composed.copy) {
      try {await win.navigator.clipboard.writeText(composed.draft);result.textContent=texts.message_copied;}
      catch {
        fallback.hidden=false;form.querySelector('#prepared-message').value=composed.draft;
        result.textContent=texts.message_copy_failed;
        form.querySelector('#prepared-message').focus();form.querySelector('#prepared-message').select();
      }
    } else {
      result.textContent=texts.message_draft_opened;
      // A visible link also works when the browser blocks popups or no mail client is configured.
      fallback.hidden=false;form.querySelector('#prepared-message').value=composed.draft;
    }
  });
}
export function initScrollTop(doc = document) {
  const button=doc.querySelector('.back-to-top');if(!button) return;
  const win=doc.defaultView;let previous=win.scrollY, direction=0;
  win.addEventListener('scroll',()=>{
    const current=Math.max(0,win.scrollY), delta=current-previous;
    if(Math.abs(delta)>3){direction=delta;previous=current;}
    button.hidden=current<500 || direction>=0;
  },{passive:true});
  button.addEventListener('click',()=>win.scrollTo({top:0,behavior:win.matchMedia?.('(prefers-reduced-motion: reduce)').matches?'auto':'smooth'}));
}
