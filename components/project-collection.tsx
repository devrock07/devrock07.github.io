'use client';

import { useEffect, useRef, useState } from 'react';
import { Search } from 'pixelarticons/react/Search';
import { projects } from '@/lib/site-content';
import { filterProjects, projectSlugFromHash } from '@/lib/project-filter.mjs';
import '@/app/project-browser.css';

const filters = [
  { value: 'all', label: 'All' },
  { value: 'active', label: 'Active' },
  { value: 'archived', label: 'Archived' },
] as const;

export function ProjectCollection() {
  const [query, setQuery] = useState('');
  const [status, setStatus] =
    useState<(typeof filters)[number]['value']>('all');
  const [revealSequence, setRevealSequence] = useState(0);
  const pendingAnchor = useRef<string | null>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const visible = filterProjects(projects, query, status);
  const visibleSlugs = new Set(visible.map((project) => project.slug));
  const filtered = query !== '' || status !== 'all';

  useEffect(() => {
    function revealHash(hash: string) {
      const slug = projectSlugFromHash(projects, hash);
      if (!slug) return;
      pendingAnchor.current = slug;
      setQuery('');
      setStatus('all');
      setRevealSequence((sequence) => sequence + 1);
    }

    function revealLocation() {
      revealHash(window.location.hash);
    }

    function revealClickedProject(event: MouseEvent) {
      if (
        event.button !== 0 ||
        event.ctrlKey ||
        event.metaKey ||
        event.shiftKey ||
        event.altKey ||
        !(event.target instanceof Element)
      )
        return;
      const link = event.target.closest<HTMLAnchorElement>('a[href]');
      if (
        !link ||
        link.hasAttribute('download') ||
        (link.target && link.target !== '_self')
      )
        return;
      const url = new URL(link.href, window.location.href);
      if (
        url.origin === window.location.origin &&
        url.pathname.replace(/\/$/, '') === '/projects'
      ) {
        revealHash(url.hash);
      }
    }

    // Router.push uses pushState, which does not emit hashchange. Catch project
    // links before routing so hidden results can be restored before scrolling.
    document.addEventListener('click', revealClickedProject, true);
    window.addEventListener('hashchange', revealLocation);
    window.addEventListener('popstate', revealLocation);
    revealLocation();
    return () => {
      document.removeEventListener('click', revealClickedProject, true);
      window.removeEventListener('hashchange', revealLocation);
      window.removeEventListener('popstate', revealLocation);
    };
  }, []);

  useEffect(() => {
    if (!pendingAnchor.current) return;
    const frame = requestAnimationFrame(() => {
      const slug = pendingAnchor.current;
      pendingAnchor.current = null;
      if (slug)
        document.getElementById(slug)?.scrollIntoView({ block: 'start' });
    });
    return () => cancelAnimationFrame(frame);
  }, [revealSequence]);

  function clearFilters() {
    setQuery('');
    setStatus('all');
    searchRef.current?.focus();
  }

  return (
    <section className="project-browser" aria-label="Pinned projects">
      <div className="project-toolbar">
        <label className="project-search">
          <Search aria-hidden="true" />
          <span className="sr-only">Search projects</span>
          <input
            ref={searchRef}
            type="search"
            value={query}
            placeholder="Name, tool, or language…"
            onChange={(event) => setQuery(event.target.value)}
            autoComplete="off"
            spellCheck={false}
            aria-controls="project-results"
          />
        </label>
        <fieldset className="project-filters" aria-label="Project status">
          {filters.map((filter) => (
            <button
              type="button"
              key={filter.value}
              aria-pressed={status === filter.value}
              aria-controls="project-results"
              onClick={() => setStatus(filter.value)}
            >
              {filter.label}
            </button>
          ))}
        </fieldset>
        <output
          className="project-result-count"
          aria-live="polite"
          aria-atomic="true"
        >
          {visible.length} of {projects.length} projects
        </output>
      </div>
      {filtered && visible.length > 0 && (
        <div className="project-filter-note">
          <span>Still in pinned order.</span>
          <button type="button" onClick={clearFilters}>
            Reset filters ↺
          </button>
        </div>
      )}
      <div className="project-list" id="project-results">
        {projects.map((project) => (
          <article
            className="project"
            id={project.slug}
            key={project.name}
            hidden={!visibleSlugs.has(project.slug)}
          >
            <span className="project-number" aria-hidden="true">
              {project.index}
            </span>
            <div className="project-main">
              <div className="project-title-row">
                <h2>{project.name}</h2>
                <span>{project.state}</span>
              </div>
              <p className="project-summary">{project.summary}</p>
              <details className="project-notes">
                <summary>open field notes</summary>
                <div>
                  <p>{project.note}</p>
                  <p>
                    <span>BUILD:</span> {project.build}
                  </p>
                </div>
              </details>
            </div>
            <a className="project-source" href={project.href}>
              SOURCE ↗
            </a>
          </article>
        ))}
        {visible.length === 0 && (
          <div className="project-empty">
            <p>No projects match that.</p>
            <span>Try a different name or clear the filters.</span>
            <button type="button" onClick={clearFilters}>
              Show all six projects ↗
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
