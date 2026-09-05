/**
 * @typedef {{ title: string, description: string, href: string, group: string, keywords?: string }} SearchEntry
 */

function normalize(value) {
  return String(value)
    .normalize('NFKD')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

/**
 * Search only this site's small, public index. No requests or query storage.
 * @param {ReadonlyArray<SearchEntry>} entries
 * @param {string} query
 * @returns {SearchEntry[]}
 */
export function searchSite(entries, query) {
  const normalizedQuery = normalize(query);
  if (!normalizedQuery) return [...entries];

  const words = normalizedQuery.split(/\s+/);
  return entries
    .map((entry, index) => {
      const title = normalize(entry.title);
      const haystack = normalize(
        `${entry.title} ${entry.description} ${entry.keywords ?? ''}`,
      );
      if (!words.every((word) => haystack.includes(word))) return null;

      const score =
        title === normalizedQuery
          ? 100
          : title.startsWith(normalizedQuery)
            ? 60
            : title.includes(normalizedQuery)
              ? 40
              : words.reduce(
                  (total, word) => total + (title.includes(word) ? 10 : 1),
                  0,
                );
      return { entry, index, score };
    })
    .filter((match) => match !== null)
    .sort((left, right) => right.score - left.score || left.index - right.index)
    .map((match) => match.entry);
}
