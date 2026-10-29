export function sortItems(items, sort, stats = new Map(), locale = 'en') {
  const collator = new Intl.Collator(locale, { sensitivity: 'base', numeric: true });
  const timestamp = item => sort === 'updated' ? (item.updated ?? item.date) : item.date;

  return [...items].sort((a, b) => {
    if (sort === 'title') {
      return collator.compare(a.title || '', b.title || '') || a.id.localeCompare(b.id);
    }
    if (sort === 'views' || sort === 'likes') {
      const aCount = stats.get(a.id)?.[sort];
      const bCount = stats.get(b.id)?.[sort];
      if (aCount != null && bCount == null) return -1;
      if (aCount == null && bCount != null) return 1;
      if (aCount != null && bCount != null && aCount !== bCount) return bCount - aCount;
    }
    return timestamp(b) - timestamp(a) || a.id.localeCompare(b.id);
  });
}

// Blog posts and library courses use the same controls; chapter lists do not.
export function initListings(doc = document) {
  const list = doc.querySelector('[data-listing]');
  if (!list) return;

  const controls = doc.querySelector('.listing-controls');
  const sort = controls.querySelector('select');
  const picker = controls.querySelector('.topic-picker');
  const search = picker.querySelector('input[type="search"]');
  const choices = picker.querySelector('.topic-options');
  const count = picker.querySelector('[data-topic-count]');
  const empty = doc.querySelector('.filter-empty');
  const result = doc.querySelector('.list-status');
  const win = doc.defaultView;
  const locale = doc.documentElement.lang || 'en';
  const rows = [...list.querySelectorAll('[data-list-item]')].map(el => ({
    el,
    id: el.dataset.postId,
    date: Number(el.dataset.date),
    updated: Number(el.dataset.updated || el.dataset.date),
    title: el.dataset.title,
    tags: JSON.parse(el.dataset.tags || '[]') || []
  }));
  const allTopics = [...new Set(rows.flatMap(row => row.tags))];
  const stats = new Map();
  const selected = new Set();
  const defaultSort = sort.options[0].value;

  function renderTopics() {
    choices.replaceChildren();
    const topics = [...new Set([...allTopics, ...selected])].sort(
      new Intl.Collator(locale, { sensitivity: 'base', numeric: true }).compare
    );
    const query = search.value.trim().toLocaleLowerCase(locale);

    for (const topic of topics.filter(topic => topic.toLocaleLowerCase(locale).includes(query))) {
      const label = doc.createElement('label');
      const input = doc.createElement('input');
      const text = doc.createElement('span');
      input.type = 'checkbox';
      input.value = topic;
      input.checked = selected.has(topic);
      text.textContent = topic;
      label.append(input, text);
      choices.append(label);
    }
    picker.querySelector('[data-no-topics]').hidden = Boolean(choices.childElementCount);
    count.textContent = selected.size ? ' (' + selected.size + ')' : '';
    controls.querySelector('[data-clear-topics]').hidden = selected.size === 0;
  }

  function render() {
    let visible = 0;
    for (const row of sortItems(rows, sort.value, stats, locale)) {
      row.el.hidden = selected.size > 0 && !row.tags.some(topic => selected.has(topic));
      if (!row.el.hidden) visible++;
      list.append(row.el);
    }
    empty.hidden = visible > 0;
    const forms = JSON.parse(list.dataset.resultForms || '{}');
    result.textContent = visible + ' ' + (
      forms[new Intl.PluralRules(locale).select(visible)] || list.dataset.resultLabel
    );
    renderTopics();
  }

  function readQuery() {
    const query = new URLSearchParams(win.location.search);
    sort.value = [...sort.options].some(option => option.value === query.get('sort'))
      ? query.get('sort') : defaultSort;
    selected.clear();
    // Preserve links created before multiple topic selection was introduced.
    for (const topic of [...query.getAll('topic'), ...query.getAll('tag')]) {
      if (topic) selected.add(topic);
    }
  }

  function change() {
    const url = new URL(win.location.href);
    url.searchParams.delete('tag');
    url.searchParams.delete('topic');
    [...selected].sort().forEach(topic => url.searchParams.append('topic', topic));
    if (sort.value === defaultSort) url.searchParams.delete('sort');
    else url.searchParams.set('sort', sort.value);
    win.history.pushState({}, '', url);
    render();
  }

  function clear() {
    selected.clear();
    search.value = '';
    change();
  }

  sort.addEventListener('change', change);
  search.addEventListener('input', renderTopics);
  choices.addEventListener('change', event => {
    const input = event.target.closest('input[type="checkbox"]');
    if (!input) return;
    if (input.checked) selected.add(input.value);
    else selected.delete(input.value);
    // Regenerating the checkbox list must not lose keyboard focus.
    const focused = input.value;
    change();
    [...choices.querySelectorAll('input')].find(el => el.value === focused)?.focus();
  });
  controls.querySelector('[data-clear-topics]').addEventListener('click', clear);
  doc.querySelector('[data-clear-filter]').addEventListener('click', clear);
  list.addEventListener('click', event => {
    const link = event.target.closest('[data-tag-link]');
    if (!link || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    if (selected.has(link.dataset.tagLink)) selected.delete(link.dataset.tagLink);
    else selected.add(link.dataset.tagLink);
    change();
  });
  doc.addEventListener('click', event => {
    if (!picker.contains(event.target)) picker.open = false;
  });
  doc.addEventListener('keydown', event => {
    if (event.key === 'Escape' && picker.open) {
      picker.open = false;
      picker.querySelector('summary').focus();
    }
  });
  win.addEventListener('popstate', () => {
    readQuery();
    render();
  });
  doc.addEventListener('site:stats', event => {
    if (event.detail.ready) stats.set(event.detail.id, event.detail);
    // Defer reordering while someone is using a link or button in the list.
    if (!list.contains(doc.activeElement)) render();
  });
  list.addEventListener('focusout', () => win.setTimeout(() => {
    if (!list.contains(doc.activeElement)) render();
  }, 0));

  readQuery();
  render();
  controls.hidden = false;
  return { selected, render };
}
