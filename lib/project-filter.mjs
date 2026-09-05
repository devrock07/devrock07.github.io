/** @typedef {'all' | 'active' | 'archived'} ProjectStatus */

/**
 * @typedef {{ name: string, slug: string, state: string, summary: string, build: string }} SearchableProject
 */

function normalize(value) {
  return String(value)
    .normalize('NFKD')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

/**
 * Keep the pinned order, even when a query matches several projects.
 * @template {SearchableProject} T
 * @param {ReadonlyArray<T>} projects
 * @param {string} [query]
 * @param {ProjectStatus} [status]
 * @returns {T[]}
 */
export function filterProjects(projects, query = '', status = 'all') {
  const words = normalize(query).split(/\s+/).filter(Boolean);
  return projects.filter((project) => {
    const archived = /^archive(?:d)?\b/i.test(project.state);
    if (status === 'active' && archived) return false;
    if (status === 'archived' && !archived) return false;

    const haystack = normalize(
      `${project.name} ${project.state} ${project.summary} ${project.build}`,
    );
    return words.every((word) => haystack.includes(word));
  });
}

/**
 * Resolve only actual project anchors, including encoded hashes.
 * @param {ReadonlyArray<{ slug: string }>} projects
 * @param {string} hash
 * @returns {string | null}
 */
export function projectSlugFromHash(projects, hash) {
  try {
    const slug = decodeURIComponent(hash.replace(/^#/, ''));
    return projects.some((project) => project.slug === slug) ? slug : null;
  } catch {
    return null;
  }
}
