const categories = Object.freeze({
  all: 'All stamps',
  anime: 'Anime & manga',
  apps: 'Apps',
  toolkit: 'Toolkit',
  interests: 'Interests',
});

export const stampCategories = Object.freeze(Object.values(categories));

export function stampCategoryKey(label) {
  return (
    Object.keys(categories).find((key) => categories[key] === label) ?? 'all'
  );
}

export function readStampFilters(search) {
  const params = new URLSearchParams(search);
  const value = params.get('category') ?? 'all';
  const category = Object.hasOwn(categories, value)
    ? categories[value]
    : categories.all;
  return { category, query: (params.get('q') ?? '').slice(0, 100) };
}

export function stampViewHref(category, query = '') {
  const params = new URLSearchParams();
  const key = stampCategoryKey(category);
  if (key !== 'all') params.set('category', key);
  if (query) params.set('q', query.slice(0, 100));
  const search = params.toString();
  return `/stamps${search ? `?${search}` : ''}`;
}

function normalize(value) {
  return String(value)
    .normalize('NFKD')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

/** Keep collection order; match every query word across the visible stamp copy. */
export function filterStamps(stamps, category, query = '') {
  const words = normalize(query).split(/\s+/).filter(Boolean);
  return stamps.filter((stamp) => {
    if (category !== categories.all && stamp.category !== category)
      return false;
    const text = normalize(
      `${stamp.name} ${stamp.note} ${stamp.line} ${stamp.category}`,
    );
    return words.every((word) => text.includes(word));
  });
}
