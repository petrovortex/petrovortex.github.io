import test from 'node:test';
import assert from 'node:assert/strict';
import { JSDOM } from 'jsdom';
let counter=0;
async function fixture({clipboard,share}) {
  const dom=new JSDOM('<html lang="en"><body><script id="ui-strings" type="application/json">{"copied":"Copied","copy_failed":"Select and copy","discord_copied":"Paste in Discord"}</script><details class="share-menu" open><summary>Share</summary><div data-share-url="https://petrovortex.github.io/article/" data-share-title="An article"><button data-share="copy">Copy</button><button data-share="discord">Discord</button></div></details><div class="toast"></div></body></html>',{url:'https://petrovortex.github.io/',pretendToBeVisual:true});
  Object.defineProperty(dom.window.navigator,'clipboard',{value:clipboard,configurable:true});
  Object.defineProperty(dom.window.navigator,'share',{value:share,configurable:true});
  dom.window.HTMLDialogElement.prototype.showModal=function(){this.open=true;};
  dom.window.HTMLDialogElement.prototype.close=function(){this.open=false;this.dispatchEvent(new dom.window.Event('close'));};
  for(const key of ['window','document','navigator','location','CustomEvent']) Object.defineProperty(globalThis,key,{value:key==='window'?dom.window:dom.window[key],configurable:true});
  await import('../../assets/js/main.js?test='+counter++);
  return dom;
}
const flush=()=>new Promise(done=>setImmediate(done));
test('clipboard failure offers a selectable URL instead of claiming success',async()=>{
  const dom=await fixture({clipboard:{writeText:async()=>{throw new Error('blocked');}}});
  dom.window.document.querySelector('[data-share="copy"]').click(); await flush();
  assert.equal(dom.window.document.querySelector('dialog input').value,'https://petrovortex.github.io/article/');
  assert.equal(dom.window.document.querySelector('.toast').textContent,'');
  dom.window.close();
});
test('sharing copies a link without invoking the operating system share dialog',async()=>{
  const copies=[]; let shares=0;
  const dom=await fixture({clipboard:{writeText:async value=>{copies.push(value);}},share:async()=>{shares++;}});
  const doc=dom.window.document;
  for(const action of ['copy','discord']) {
    doc.querySelector('.share-menu').open=true;
    doc.querySelector('[data-share="'+action+'"]').click(); await flush();
    assert.equal(doc.querySelector('.share-menu').open,false);
  }
  assert.deepEqual(copies,['https://petrovortex.github.io/article/','https://petrovortex.github.io/article/']);
  assert.equal(shares,0);
  assert.equal(doc.querySelector('.toast').textContent,'Paste in Discord');
  dom.window.close();
});
