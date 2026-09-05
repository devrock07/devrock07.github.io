'use client';

import { useEffect, useRef, useState, useSyncExternalStore } from 'react';
import { useSearchParams } from 'next/navigation';
import { DiscordSolid } from 'pixelarticons/react/DiscordSolid';
import { GithubSolid } from 'pixelarticons/react/GithubSolid';
import { InstagramSolid } from 'pixelarticons/react/InstagramSolid';
import { YoutubeSolid } from 'pixelarticons/react/YoutubeSolid';
import { Code } from 'pixelarticons/react/Code';
import { Gamepad } from 'pixelarticons/react/Gamepad';
import { Pixelarticons } from 'pixelarticons/react/Pixelarticons';
import { Star } from 'pixelarticons/react/Star';
import { CloudSun } from 'pixelarticons/react/CloudSun';
import { DoorClosed } from 'pixelarticons/react/DoorClosed';
import { MagicEdit } from 'pixelarticons/react/MagicEdit';
import { Shield } from 'pixelarticons/react/Shield';
import { Sparkles } from 'pixelarticons/react/Sparkles';
import { Coins } from 'pixelarticons/react/Coins';
import { Heart } from 'pixelarticons/react/Heart';
import { Moon } from 'pixelarticons/react/Moon';
import { Search } from 'pixelarticons/react/Search';
import { CopySharp } from 'pixelarticons/react/CopySharp';
import { Check } from 'pixelarticons/react/Check';
import { SiteLink } from '@/components/site-link';
import { stampCategories, stamps, type Stamp } from '@/lib/site-stamps';
import {
  filterStamps,
  readStampFilters,
  stampViewHref,
} from '@/lib/stamp-filter.mjs';

const filterChangeEvent = 'devrock:stamp-filter-change';

function subscribeToFilterLocation(onChange: () => void) {
  window.addEventListener('popstate', onChange);
  window.addEventListener(filterChangeEvent, onChange);
  return () => {
    window.removeEventListener('popstate', onChange);
    window.removeEventListener(filterChangeEvent, onChange);
  };
}

const readFilterLocation = () => window.location.search;
const serverFilterLocation = () => '';

function StampMark({ id }: { id: Stamp['id'] }) {
  switch (id) {
    case 'discord':
      return <DiscordSolid />;
    case 'github':
      return <GithubSolid />;
    case 'youtube':
      return <YoutubeSolid />;
    case 'instagram':
      return <InstagramSolid />;
    case 'minecraft':
      return <Gamepad />;
    case 'pixels':
      return <Pixelarticons />;
    case 'source':
      return <Code />;
    case 'javascript':
      return <span>JS</span>;
    case 'typescript':
      return <span>TS</span>;
    case 'python':
      return <span>Py</span>;
    case 'node':
      return <span>n.</span>;
    case 'svelte':
      return <span>S</span>;
    case 'your-name':
      return <Star />;
    case 'weathering-with-you':
      return <CloudSun />;
    case 'suzume':
      return <DoorClosed />;
    case 'mushoku-tensei':
      return <MagicEdit />;
    case 'kaiju-no-8':
      return <Shield />;
    case 'dandadan':
      return <Sparkles />;
    case 'noragami':
      return <Coins />;
    case 'villager-level-999':
      return <span className="stamp-level">999</span>;
    case 'a-condition-called-love':
      return <Heart />;
    case 'trapped-in-a-dating-sim':
      return <Gamepad />;
    case 'daemons-of-the-shadow-realm':
      return <Moon />;
  }
}

export function StampCollection() {
  // Subscribe to framework-led navigation, including same-page finder links.
  useSearchParams();
  // Static exports hydrate from an empty query snapshot. Read the real address
  // after hydration so a directly opened shared view keeps its filter/search.
  const search = useSyncExternalStore(
    subscribeToFilterLocation,
    readFilterLocation,
    serverFilterLocation,
  );
  const { category, query } = readStampFilters(search);
  const visible: readonly Stamp[] = filterStamps(stamps, category, query);
  const viewHref = stampViewHref(category, query);
  const [copyFeedback, setCopyFeedback] = useState<{
    href: string;
    status: 'copied' | 'error';
  } | null>(null);
  const copyState = copyFeedback?.href === viewHref ? copyFeedback.status : 'idle';
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );

  function updateView(nextCategory: string, nextQuery: string, push = false) {
    const href = stampViewHref(nextCategory, nextQuery);
    if (href === window.location.pathname + window.location.search) return;
    // Vinext observes native History updates without requesting another page.
    // Preserve the router's history metadata, including back/forward restoration.
    window.history[push ? 'pushState' : 'replaceState'](
      window.history.state,
      '',
      href,
    );
    window.dispatchEvent(new Event(filterChangeEvent));
    setCopyFeedback(null);
  }

  async function copyView() {
    if (timer.current) clearTimeout(timer.current);
    try {
      await navigator.clipboard.writeText(
        new URL(viewHref, window.location.origin).href,
      );
      setCopyFeedback({ href: viewHref, status: 'copied' });
    } catch {
      setCopyFeedback({ href: viewHref, status: 'error' });
    }
    timer.current = setTimeout(() => setCopyFeedback(null), 3500);
  }

  return (
    <section className="stamp-collection" aria-label="Stamp collection">
      <div className="stamp-search-row">
        <label className="stamp-search">
          <Search aria-hidden="true" />
          <span className="sr-only">Search stamps</span>
          <input
            type="search"
            value={query}
            maxLength={100}
            placeholder="Find a title, app, or little obsession…"
            onChange={(event) => updateView(category, event.target.value)}
          />
        </label>
        <button type="button" className="stamp-share" onClick={copyView}>
          {copyState === 'copied' ? (
            <Check aria-hidden="true" />
          ) : (
            <CopySharp aria-hidden="true" />
          )}
          <span>{copyState === 'copied' ? 'Copied' : 'Copy view link'}</span>
        </button>
      </div>
      <output className="stamp-share-status" aria-live="polite">
        {copyState === 'copied'
          ? 'Link copied, including your current filter.'
          : copyState === 'error'
            ? 'Couldn’t copy. You can copy this page’s address instead.'
            : 'Search stays on this site. Share a filter with its own link.'}
      </output>
      <div className="stamp-toolbar">
        <fieldset className="stamp-filters" aria-label="Filter stamps">
          {stampCategories.map((filter) => (
            <button
              type="button"
              key={filter}
              aria-pressed={category === filter}
              onClick={() => updateView(filter, query, true)}
            >
              {filter}
            </button>
          ))}
        </fieldset>
        <output className="stamp-count" aria-live="polite" aria-atomic="true">
          <span aria-hidden="true">
            {String(visible.length).padStart(2, '0')} / {stamps.length}
          </span>
          <span className="sr-only">
            {visible.length} of {stamps.length} stamps shown
          </span>
        </output>
      </div>

      {visible.length === 0 ? (
        <div className="stamp-empty">
          <p>No stamps match that.</p>
          <span>Try another title, or take a look at the whole sheet.</span>
          <button type="button" onClick={() => updateView('All stamps', '')}>
            Show all stamps
          </button>
        </div>
      ) : null}

      <ul className="stamp-sheet">
        {visible.map((stamp) => {
          const StampLink = stamp.href.startsWith('/') ? SiteLink : 'a';
          return (
            <li className="stamp-item" key={stamp.id}>
              <StampLink
                className="web-stamp"
                data-stamp={stamp.id}
                data-category={stamp.category}
                href={stamp.href}
                aria-describedby={`stamp-note-${stamp.id}`}
              >
                <span className="stamp-mark" aria-hidden="true">
                  <StampMark id={stamp.id} />
                </span>
                <span className="stamp-lettering">
                  <span>{stamp.line}</span>
                  <strong>{stamp.name}</strong>
                </span>
              </StampLink>
              <p id={`stamp-note-${stamp.id}`}>{stamp.note}</p>
            </li>
          );
        })}
      </ul>
      <p className="stamp-sheet-note">
        Every stamp is a link. Anime and manga stamps open official title pages.
      </p>
    </section>
  );
}
