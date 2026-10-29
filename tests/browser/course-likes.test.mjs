import test from 'node:test';
import assert from 'node:assert/strict';
import { JSDOM } from 'jsdom';

test('compact course likes share state with full controls without adding a view',async()=>{
 const dom=new JSDOM('<html lang="en"><body><script id="ui-strings" type="application/json">{"like":"Like","liked":"Liked"}</script><div class="engagement-compact" data-stats-id="course--test"><button data-like><span data-count="likes">—</span></button></div><div data-stats-id="course--test"><span data-count="views">—</span><button data-like><span data-count="likes">—</span></button></div><div class="toast"></div></body></html>',{url:'http://127.0.0.1:4000/library/',pretendToBeVisual:true});
 for(const key of ['window','document','navigator','location','CustomEvent','localStorage','sessionStorage']) Object.defineProperty(globalThis,key,{value:key==='window'?dom.window:dom.window[key],configurable:true});
 await import('../../assets/js/main.js?course-likes-test');
 const flush=()=>new Promise(done=>setImmediate(done));
 await flush();
 const doc=dom.window.document;
 assert.equal(doc.querySelector('[data-count="views"]').textContent,'0');
 doc.querySelector('.engagement-compact [data-like]').click();
 await flush();
 assert.deepEqual([...doc.querySelectorAll('[data-count="likes"]')].map(el=>el.textContent),['1','1']);
 assert([...doc.querySelectorAll('[data-like]')].every(el=>el.disabled && el.getAttribute('aria-pressed')==='true'));
 assert.equal(doc.querySelector('[data-count="views"]').textContent,'0');
 assert.equal(dom.window.localStorage.getItem('preview_viewed_course--test'),null);
 dom.window.close();
});
