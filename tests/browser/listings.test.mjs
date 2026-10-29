import test from 'node:test';
import assert from 'node:assert/strict';
import { JSDOM } from 'jsdom';
import { initListings, sortItems } from '../../assets/js/listings.js';

test('popularity uses counts, date breaks ties, unknown counts sort last',()=>{
 const posts=[{id:'a',date:10},{id:'b',date:20},{id:'c',date:30},{id:'d',date:40}];
 const stats=new Map([['a',{views:5,likes:9}],['b',{views:5,likes:1}],['c',{views:2,likes:1}]]);
 assert.deepEqual(sortItems(posts,'views',stats).map(p=>p.id),['b','a','c','d']);
 assert.deepEqual(sortItems(posts,'likes',stats).map(p=>p.id),['a','c','b','d']);
 assert.deepEqual(sortItems(posts,'date',stats).map(p=>p.id),['d','c','b','a']);
});
function fixture(query='',kind='blog') {
 const dom=new JSDOM('<html lang="en"><div class="listing-controls" hidden><select><option value="date">Newest</option><option value="updated">Updated</option><option value="title">Title</option><option value="likes">Likes</option><option value="views">Views</option></select><details class="topic-picker"><summary>Topics<span data-topic-count></span></summary><input type="search"><div class="topic-options"></div><p data-no-topics hidden>None</p><button data-clear-topics>Clear</button></details></div><p class="list-status"></p><div data-listing="'+kind+'" data-result-label="items"><article data-list-item data-post-id="a" data-title="Zebra" data-date="10" data-updated="30" data-tags=\'["AI","Systems"]\'><a href="?topic=AI" data-tag-link="AI">AI</a></article><article data-list-item data-post-id="b" data-title="Alpha" data-date="20" data-updated="20" data-tags=\'["Math"]\'></article></div><div class="filter-empty" hidden><button data-clear-filter>Clear</button></div></html>',{url:'https://petrovortex.github.io/'+kind+'/'+query});
 initListings(dom.window.document);return dom;
}
test('shared multi-topic URL matches any topic; legacy URLs and back navigation work',()=>{
 const dom=fixture('?topic=AI&topic=Math&sort=likes'),doc=dom.window.document;
 assert.equal(doc.querySelector('select').value,'likes');
 assert.equal(doc.querySelectorAll('[data-list-item]:not([hidden])').length,2);
 assert.equal(doc.querySelectorAll('input:checked').length,2);
 doc.querySelector('[data-clear-filter]').click();
 assert.equal(new URL(dom.window.location.href).searchParams.has('topic'),false);
 dom.window.history.replaceState({},'','?tag=Math&sort=views');
 dom.window.dispatchEvent(new dom.window.PopStateEvent('popstate'));
 assert.equal(doc.querySelector('[data-post-id=a]').hidden,true);
 assert.equal(doc.querySelector('[data-post-id=b]').hidden,false);
 dom.window.close();
});
test('topics are alphabetical and searchable, selection survives searching',()=>{
 const dom=fixture('?topic=AI'),doc=dom.window.document;
 const values=()=>[...doc.querySelectorAll('.topic-options input')].map(i=>i.value);
 assert.deepEqual(values(),['AI','Math','Systems']);
 const search=doc.querySelector('[type=search]');search.value='sys';search.dispatchEvent(new dom.window.Event('input'));
 assert.deepEqual(values(),['Systems']);
 const box=doc.querySelector('[type=checkbox]');box.checked=true;box.dispatchEvent(new dom.window.Event('change',{bubbles:true}));
 assert.deepEqual(new URL(dom.window.location.href).searchParams.getAll('topic'),['AI','Systems']);
 search.value='';search.dispatchEvent(new dom.window.Event('input'));
 assert.equal(doc.querySelectorAll('input:checked').length,2);
 dom.window.close();
});
test('unknown topics show an empty state and live counts can reorder posts',()=>{
 const dom=fixture('?topic=Missing&sort=views'),doc=dom.window.document;
 assert.equal(doc.querySelector('.filter-empty').hidden,false);
 doc.querySelector('[data-clear-filter]').click();
 doc.dispatchEvent(new dom.window.CustomEvent('site:stats',{detail:{id:'a',ready:true,views:10,likes:0}}));
 assert.equal(doc.querySelector('[data-list-item]').dataset.postId,'a');
 dom.window.close();
});
test('library sorting uses its own topics and title order without changing chapter lists',()=>{
 const dom=fixture('?sort=title','library'),doc=dom.window.document;
 assert.equal(doc.querySelector('[data-list-item]').dataset.postId,'b');
 const course=new JSDOM('<ol class="chapter-list"><li>Second in date, first in course</li><li>First in date, second in course</li></ol>');
 initListings(course.window.document);
 assert.equal(course.window.document.querySelector('li').textContent,'Second in date, first in course');
 course.window.close();dom.window.close();
});

test('library popularity responds to course likes and retains selected topics',()=>{
 const dom=fixture('?sort=likes&topic=AI&topic=Math','library'),doc=dom.window.document;
 const order=()=>[...doc.querySelectorAll('[data-list-item]:not([hidden])')].map(el=>el.dataset.postId);
 doc.dispatchEvent(new dom.window.CustomEvent('site:stats',{detail:{id:'a',ready:true,likes:3}}));
 doc.dispatchEvent(new dom.window.CustomEvent('site:stats',{detail:{id:'b',ready:true,likes:1}}));
 assert.deepEqual(order(),['a','b']);
 doc.dispatchEvent(new dom.window.CustomEvent('site:stats',{detail:{id:'b',ready:true,likes:4}}));
 assert.deepEqual(order(),['b','a']);
 assert.equal(doc.querySelectorAll('input:checked').length,2);
 assert.equal(new URL(dom.window.location.href).searchParams.get('sort'),'likes');
 dom.window.close();
});

test('creation and update sorting stay distinct for both kinds of listing',()=>{
 for(const kind of ['blog','library']) {
  const dom=fixture('?sort=updated',kind),doc=dom.window.document;
  assert.equal(doc.querySelector('[data-list-item]').dataset.postId,'a');
  const sort=doc.querySelector('select'); sort.value='date'; sort.dispatchEvent(new dom.window.Event('change'));
  assert.equal(doc.querySelector('[data-list-item]').dataset.postId,'b');
  dom.window.close();
 }
});
