import test from 'node:test';
import assert from 'node:assert/strict';
import {JSDOM} from 'jsdom';
import fs from 'node:fs/promises';
import {initTheme} from '../../assets/js/theme.js';
import {initExternalLinks} from '../../assets/js/external-links.js';
import {validMessage,composeMessage,initContact,initScrollTop} from '../../assets/js/contact.js';
const settings={telegram:'petrovortex',x:'petrovortex',discord:'petrovortex',discord_id:''};
test('theme follows the system initially, persists a choice, and survives blocked storage',()=>{
 const dom=new JSDOM('<meta name="theme-color"><button class="theme-toggle" hidden></button>',{url:'https://example.com'});
 let onChange;dom.window.matchMedia=()=>({matches:true,addEventListener:(_,fn)=>{onChange=fn;}});
 initTheme(dom.window.document,{light_mode:'Light',dark_mode:'Dark'});
 assert.equal(dom.window.document.documentElement.dataset.theme,'dark');
 dom.window.document.querySelector('button').click();
 assert.equal(dom.window.localStorage.getItem('site-theme'),'light');
 onChange({matches:true});assert.equal(dom.window.document.documentElement.dataset.theme,'light');
 Object.defineProperty(dom.window,'localStorage',{get(){throw Error('blocked');}});
 dom.window.document.querySelector('button').click();
 assert.equal(dom.window.document.documentElement.dataset.theme,'dark');
 dom.window.close();
});
test('external links open separately, while relative and canonical site links stay internal',async()=>{
 const dom=new JSDOM('<link rel="canonical" href="https://petrovortex.github.io/"><a id="cv" href="https://github.com/petrovortex/resume">CV</a><a id="email" href="mailto:a@example.com">Mail</a><a id="same" href="https://petrovortex.github.io/blog/">Blog</a><a id="relative" href="/library/">Library</a>',{url:'http://127.0.0.1:4000'});
 const doc=dom.window.document;const observer=initExternalLinks(doc);
 assert.equal(doc.querySelector('#cv').target,'_blank');
 assert(doc.querySelector('#cv').relList.contains('noopener'));
 assert.equal(doc.querySelector('#email').target,'_blank');
 assert.equal(doc.querySelector('#same').target,'');
 assert.equal(doc.querySelector('#relative').target,'');
 const late=doc.createElement('a');late.href='https://example.org';doc.body.append(late);
 await new Promise(r=>setImmediate(r));assert.equal(late.target,'_blank');
 observer.disconnect();dom.window.close();
});
test('contact validation permits multilingual text and punctuation, rejects symbols and empty messages',()=>{
 assert(validMessage('Hello! Привет, Александр.\nCafé 123?'));
 assert(!validMessage('Hello 😀'));assert(!validMessage('<script>alert(1)</script>'));
 assert(!validMessage('  '));assert(!validMessage('a'.repeat(2001)));
});
test('draft URLs preserve private text, author identity, and original page',()=>{
 const args={message:'Привет & hello?',canonical:'https://petrovortex.github.io/example/',title:'Example',settings,email:'alex.petrovortex@gmail.com'};
 const tg=composeMessage({...args,platform:'telegram'}),email=composeMessage({...args,platform:'email'});
 assert.equal(new URL(tg.url).pathname,'/petrovortex');
 assert(new URL(tg.url).searchParams.get('text').includes(args.message));
 assert(new URL(email.url).searchParams.get('subject').includes('reader'));
 for(const platform of ['x','discord']){const draft=composeMessage({...args,platform});assert(draft.copy);assert(!draft.url.includes(encodeURIComponent(args.message)));assert(draft.draft.includes(args.canonical));}
});
test('contact form blocks invalid submission and offers a selectable draft if copying fails',async()=>{
 let html=await fs.readFile('_includes/site/contact.html','utf8');
 html=html.replace(/\{[%{][\s\S]*?[%}]\}/g,'');
 const dom=new JSDOM('<link rel="canonical" href="https://example.com/a/">'+html,{url:'https://example.com'});
 const doc=dom.window.document;doc.querySelector('#contact-settings').textContent=JSON.stringify(settings);
 dom.window.HTMLDialogElement.prototype.showModal=function(){this.open=true;};
 dom.window.HTMLDialogElement.prototype.close=function(){this.open=false;};
 let opens=0;dom.window.open=()=>{opens++;return null;};
 Object.defineProperty(dom.window.navigator,'clipboard',{value:{writeText:async()=>{throw Error('blocked');}}});
 initContact({doc,texts:{message_invalid:'Invalid',message_copy_failed:'Copy it'}});
 doc.querySelector('.author-button').click();assert(doc.querySelector('dialog').open);
 const form=doc.querySelector('form'),input=doc.querySelector('#reader-message');
 input.value='😀';form.dispatchEvent(new dom.window.Event('submit',{cancelable:true}));
 assert.equal(opens,0);assert.equal(input.getAttribute('aria-invalid'),'true');
 input.value='A valid message.';doc.querySelector('select').value='discord';
 form.dispatchEvent(new dom.window.Event('submit',{cancelable:true}));
 await new Promise(r=>setImmediate(r));
 assert.equal(opens,1);assert.equal(doc.querySelector('.message-fallback').hidden,false);
 assert(doc.querySelector('#prepared-message').value.includes('A valid message.'));
 dom.window.close();
});
test('back to top appears only while scrolling upward away from the top',()=>{
 const dom=new JSDOM('<button class="back-to-top" hidden></button>');const doc=dom.window.document;
 initScrollTop(doc);
 const scroll=y=>{dom.window.scrollY=y;dom.window.dispatchEvent(new dom.window.Event('scroll'));};
 scroll(800);assert(doc.querySelector('button').hidden);
 scroll(700);assert(!doc.querySelector('button').hidden);
 scroll(750);assert(doc.querySelector('button').hidden);
 scroll(450);assert(doc.querySelector('button').hidden);
 dom.window.close();
});
