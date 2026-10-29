import test from 'node:test';
import assert from 'node:assert/strict';
import { createEngagementStore, createPreviewAdapter, safeStorage } from '../../assets/js/engagement.js';

function setup(adapter) {
  return createEngagementStore({ adapter, storage: safeStorage(), cache: safeStorage() });
}
test('liking keeps views intact and updates every placement for a translation ID', async () => {
  let value = { views: 91, likes: 4 }, subscriber;
  const adapter = { subscribe(_id, next) { subscriber = next; next(value); }, async increment(_id, metric) { value = { ...value, [metric]: value[metric] + 1 }; subscriber(value); return value; } };
  const store = setup(adapter);
  let row, article;
  store.watch('dls_agent', state => { row = state; });
  store.watch('dls_agent', state => { article = state; });
  assert.equal(await store.like('dls_agent'), true);
  assert.equal(row.views, 91);
  assert.equal(row.likes, 5);
  assert.equal(article.likes, 5);
  assert.equal(article.liked, true);
  assert.equal(await store.like('dls_agent'), false);
  assert.equal(row.likes, 5);
});
test('failed likes can be retried; only successful writes set the deduplication flag', async () => {
  let calls = 0;
  const store = setup({ subscribe(_id, next) { next({ views: 7, likes: 2 }); }, async increment() { if (++calls === 1) throw new Error('denied'); return { views: 7, likes: 3 }; } });
  let state; store.watch('id', value => { state = value; });
  await assert.rejects(store.like('id'));
  assert.equal(state.liked, false);
  assert.equal(state.likes, 2);
  assert.equal(state.views, 7);
  await store.like('id');
  assert.equal(state.liked, true);
  assert.equal(state.likes, 3);
});
test('concurrent clicks share one pending write and a listing never increments views', async () => {
  let writes = 0, resolve;
  const store = setup({ subscribe(_id, next) { next({ views: 10, likes: 0 }); }, increment() { writes++; return new Promise(done => { resolve = done; }); } });
  store.watch('same-id', () => {});
  assert.equal(writes, 0);
  const first = store.like('same-id'); const second = store.like('same-id');
  await new Promise(done => setImmediate(done));
  assert.equal(writes, 1); assert.equal(first, second);
  resolve({ views: 10, likes: 1 }); await first;
});
test('view counts are deduplicated across translated pages and failed views are retryable', async () => {
  let calls = 0;
  const store = setup({ subscribe() {}, async increment() { if (++calls === 1) throw new Error('offline'); return { views: 1, likes: 0 }; } });
  await assert.rejects(store.view('translated-post'));
  assert.equal(await store.view('translated-post'), true);
  assert.equal(await store.view('translated-post'), false);
  assert.equal(calls, 2);
});
test('blocked and malformed storage do not stop preview engagement', async () => {
  const blocked = safeStorage({ getItem() { throw new Error('blocked'); }, setItem() { throw new Error('blocked'); } });
  const store = createEngagementStore({ adapter: createPreviewAdapter(blocked), storage: blocked, cache: { get() { return '{broken'; }, set() {} } });
  let state; store.watch('note', next => { state = next; });
  await store.like('note');
  assert.equal(state.likes, 1);
  assert.equal(state.views, 0);
  assert.equal(state.liked, true);
});
