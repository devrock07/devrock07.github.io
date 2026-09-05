'use client';

import { Dialog } from '@base-ui/react/dialog';
import { Close } from 'pixelarticons/react/Close';
import { Search } from 'pixelarticons/react/Search';
import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type KeyboardEvent,
} from 'react';

import { SiteLink } from '@/components/site-link';
import { projects } from '@/lib/site-content';
import { searchSite } from '@/lib/site-search.mjs';
import '@/app/site-finder.css';

const entries = [
  {
    title: 'About',
    description: 'The front door. A little introduction.',
    href: '/',
    group: 'Pages',
    keywords: 'home dev bhakat devrock',
  },
  {
    title: 'Projects',
    description: 'Web tools, Discord bots, and source code.',
    href: '/projects',
    group: 'Pages',
    keywords: 'work builds repositories github',
  },
  {
    title: 'Stamps',
    description: 'A little collection of interests, apps, and web buttons.',
    href: '/stamps',
    group: 'Pages',
    keywords: 'interests apps software tools stamps buttons collection',
  },
  {
    title: 'Credits',
    description: 'Typefaces, icons, and what went into this site.',
    href: '/credits',
    group: 'Pages',
    keywords: 'fonts departure mono redaction pixelarticons colophon',
  },
  {
    title: 'About me',
    description: 'What I make and how I work.',
    href: '/#about-title',
    group: 'On this site',
    keywords: 'bio introduction interests',
  },
  {
    title: 'Margin log',
    description: 'Notes from the workbench.',
    href: '/#notes-title',
    group: 'On this site',
    keywords: 'notes journal updates log',
  },
  {
    title: 'Get in touch',
    description: 'Email and socials.',
    href: '/#contact',
    group: 'On this site',
    keywords: 'contact devrock.alive@gmail.com instagram youtube github',
  },
  {
    title: 'Pixel pad',
    description: 'A tiny canvas for a little detour.',
    href: '/#pixel-pad',
    group: 'On this site',
    keywords: 'draw drawing pixel art sketch doodle',
  },
  ...projects.map((project) => ({
    title: project.name,
    description: project.summary,
    href: `/projects#${project.slug}`,
    group: 'Projects',
    keywords: `${project.build} ${project.state}`,
  })),
];

const groups = ['Pages', 'On this site', 'Projects'];

function isTyping(target: EventTarget | null) {
  return (
    target instanceof HTMLElement &&
    (target.isContentEditable ||
      Boolean(
        target.closest(
          'input, textarea, select, [role="textbox"], [role="combobox"]',
        ),
      ))
  );
}

export function SiteFinder({ onNavigate }: { onNavigate?: () => void }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);
  const inputId = useId();
  const resultsId = useId();
  const results = searchSite(entries, query);

  const changeOpen = useCallback((nextOpen: boolean) => {
    setOpen(nextOpen);
    if (nextOpen) setQuery('');
  }, []);

  useEffect(() => {
    function handleShortcut(event: globalThis.KeyboardEvent) {
      if (event.defaultPrevented || event.isComposing || event.repeat) return;
      const command =
        (event.ctrlKey || event.metaKey) &&
        !event.altKey &&
        !event.shiftKey &&
        event.key.toLowerCase() === 'k';
      const slash =
        event.key === '/' &&
        !event.ctrlKey &&
        !event.metaKey &&
        !event.altKey &&
        !event.shiftKey &&
        !isTyping(event.target);
      if (!command && !slash) return;
      event.preventDefault();
      changeOpen(!open);
    }
    window.addEventListener('keydown', handleShortcut);
    return () => window.removeEventListener('keydown', handleShortcut);
  }, [changeOpen, open]);

  function navigate() {
    setOpen(false);
    onNavigate?.();
  }

  function handleResultKeys(event: KeyboardEvent<HTMLAnchorElement>) {
    if (
      event.altKey ||
      event.ctrlKey ||
      event.metaKey ||
      event.shiftKey ||
      event.nativeEvent.isComposing
    )
      return;
    const links = Array.from(
      resultsRef.current?.querySelectorAll<HTMLAnchorElement>('a[href]') ?? [],
    );
    const current = links.indexOf(document.activeElement as HTMLAnchorElement);
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      links[(current + 1) % links.length]?.focus();
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      if (current <= 0) inputRef.current?.focus();
      else links[current - 1]?.focus();
    }
  }

  return (
    <Dialog.Root open={open} onOpenChange={changeOpen}>
      <Dialog.Trigger
        className="site-finder-trigger"
        aria-keyshortcuts="Control+k Meta+k /"
      >
        <Search aria-hidden="true" />
        <span>Find something</span>
        <kbd aria-hidden="true">⌘ / Ctrl K</kbd>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Backdrop className="site-finder-backdrop" />
        <Dialog.Popup className="site-finder" initialFocus={inputRef}>
          <div className="site-finder-heading">
            <Dialog.Title>Find your way</Dialog.Title>
            <Dialog.Close
              className="site-finder-close"
              aria-label="Close search"
            >
              <Close aria-hidden="true" />
            </Dialog.Close>
          </div>
          <Dialog.Description className="site-finder-description">
            Pages, projects, and the little things in between.
          </Dialog.Description>
          <div className="site-finder-input-wrap">
            <Search aria-hidden="true" />
            <label className="sr-only" htmlFor={inputId}>
              Search this site
            </label>
            <input
              ref={inputRef}
              id={inputId}
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Try a project, a tool, or contact…"
              autoComplete="off"
              spellCheck={false}
              aria-controls={resultsId}
              onKeyDown={(event) => {
                if (event.nativeEvent.isComposing) return;
                if (event.key === 'ArrowDown' || event.key === 'Enter') {
                  const first =
                    resultsRef.current?.querySelector<HTMLAnchorElement>(
                      'a[href]',
                    );
                  if (!first) return;
                  event.preventDefault();
                  if (event.key === 'Enter') first.click();
                  else first.focus();
                }
              }}
            />
          </div>
          <output className="sr-only" aria-live="polite" aria-atomic="true">
            {results.length} {results.length === 1 ? 'result' : 'results'}
            {query ? ` for ${query}` : ''}.
          </output>
          <div className="site-finder-results" ref={resultsRef} id={resultsId}>
            {groups.map((group) => {
              const matches = results.filter(
                (result) => result.group === group,
              );
              if (!matches.length) return null;
              return (
                <section
                  className="site-finder-group"
                  key={group}
                  aria-label={group}
                >
                  <h3>{group}</h3>
                  <ul>
                    {matches.map((result) => (
                      <li key={result.href}>
                        <SiteLink
                          href={result.href}
                          onNavigate={navigate}
                          onKeyDown={handleResultKeys}
                          prefetch={false}
                        >
                          <span className="site-finder-result-copy">
                            <strong>{result.title}</strong>
                            <span>{result.description}</span>
                          </span>
                          <span
                            className="site-finder-result-arrow"
                            aria-hidden="true"
                          >
                            ↗
                          </span>
                        </SiteLink>
                      </li>
                    ))}
                  </ul>
                </section>
              );
            })}
            {results.length === 0 && (
              <div className="site-finder-empty">
                <p>Nothing here by that name.</p>
                <span>Try “Discord”, “fonts”, or a shorter search.</span>
                <button
                  type="button"
                  onClick={() => {
                    setQuery('');
                    inputRef.current?.focus();
                  }}
                >
                  Show everything
                </button>
              </div>
            )}
          </div>
          <div className="site-finder-footer">
            <span>Just this site. No tracking.</span>
            <span>
              <kbd>↑ ↓</kbd> move <kbd>esc</kbd> close
            </span>
          </div>
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
