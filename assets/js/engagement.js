// Storage is best-effort: reading and navigation must work in private/restricted browsers.
export function safeStorage(storage) {
  const memory = new Map();
  return {
    get(key) { try { return storage?.getItem(key) ?? memory.get(key) ?? null; } catch { return memory.get(key) ?? null; } },
    set(key, value) { memory.set(key, String(value)); try { storage?.setItem(key, String(value)); } catch {} }
  };
}

export function normalizeStats(value) {
  return {
    views: Math.max(0, Number(value?.views) || 0),
    likes: Math.max(0, Number(value?.likes) || 0)
  };
}

export function createEngagementStore({ adapter, storage, cache, lock = (_key, action) => action() }) {
  const records = new Map();
  function record(id) {
    if (!records.has(id)) {
      let cached = null;
      try { cached = JSON.parse(cache.get('stats_' + id)); } catch {}
      records.set(id, { data: cached ? normalizeStats(cached) : null, listeners: new Set(), pending: new Map(), started: false, error: null });
    }
    return records.get(id);
  }
  function emit(id) {
    const r = record(id);
    const state = { ...r.data, ready: Boolean(r.data), liked: Boolean(storage.get('liked_' + id)), busy: r.pending.has('likes'), error: r.error };
    r.listeners.forEach(callback => callback(state));
  }
  function update(id, data) {
    const r = record(id);
    r.data = normalizeStats(data);
    r.error = null;
    cache.set('stats_' + id, JSON.stringify(r.data));
    emit(id);
  }
  function watch(id, callback) {
    const r = record(id);
    r.listeners.add(callback);
    emit(id);
    if (!r.started) {
      r.started = true;
      try {
        r.unsubscribe = adapter.subscribe(id, value => update(id, value), error => { r.error = error; emit(id); });
      } catch (error) { r.error = error; emit(id); }
    }
    return () => { r.listeners.delete(callback); };
  }
  function increment(id, metric) {
    const r = record(id);
    if (r.pending.has(metric)) return r.pending.get(metric);
    const key = (metric === 'likes' ? 'liked_' : 'viewed_') + id;
    const work = Promise.resolve().then(() => lock('engagement-' + key, async () => {
      if (storage.get(key)) { emit(id); return false; }
      const data = await adapter.increment(id, metric);
      storage.set(key, 'true');
      update(id, data);
      return true;
    })).catch(error => { r.error = error; emit(id); throw error; }).finally(() => { r.pending.delete(metric); emit(id); });
    r.pending.set(metric, work);
    emit(id);
    return work;
  }
  return { watch, like: id => increment(id, 'likes'), view: id => increment(id, 'views'), destroy() { records.forEach(r => r.unsubscribe?.()); } };
}

export function createPreviewAdapter(storage) {
  const listeners = new Map();
  const key = id => 'preview_stats_' + id;
  const read = id => { try { return normalizeStats(JSON.parse(storage.get(key(id)))); } catch { return normalizeStats(null); } };
  return {
    subscribe(id, next) {
      if (!listeners.has(id)) listeners.set(id, new Set());
      listeners.get(id).add(next);
      queueMicrotask(() => next(read(id)));
      return () => listeners.get(id).delete(next);
    },
    async increment(id, metric) {
      const data = read(id);
      data[metric] += 1;
      storage.set(key(id), JSON.stringify(data));
      listeners.get(id)?.forEach(next => next(data));
      return data;
    }
  };
}

export async function createFirebaseAdapter() {
  const [{ initializeApp }, { getDatabase, ref, onValue, runTransaction }] = await Promise.all([
    import('https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js'),
    import('https://www.gstatic.com/firebasejs/9.23.0/firebase-database.js')
  ]);
  // Public Firebase client configuration, retained from the original site.
  const app = initializeApp({
    apiKey: 'AIzaSyCT8cb1AQ4AylcD1b75bKa07Cbnt32M2yY',
    authDomain: 'open-thoughts-by-petrovortex.firebaseapp.com',
    projectId: 'open-thoughts-by-petrovortex',
    databaseURL: 'https://open-thoughts-by-petrovortex-default-rtdb.asia-southeast1.firebasedatabase.app',
    storageBucket: 'open-thoughts-by-petrovortex.firebasestorage.app',
    messagingSenderId: '26636268836',
    appId: '1:26636268836:web:68d7b00fdf16f9652a6fb1'
  });
  const db = getDatabase(app);
  return {
    subscribe(id, next, error) { return onValue(ref(db, 'posts/' + id), snapshot => next(snapshot.val()), error); },
    async increment(id, metric) {
      const result = await runTransaction(ref(db, 'posts/' + id), current => {
        const data = { ...current, ...normalizeStats(current) };
        data[metric] += 1;
        return data;
      });
      if (!result.committed) throw new Error('Transaction was not committed');
      return result.snapshot.val();
    }
  };
}
