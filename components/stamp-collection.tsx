'use client';

import { useState } from 'react';
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
import { SiteLink } from '@/components/site-link';
import { stampCategories, stamps, type Stamp } from '@/lib/site-stamps';

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
  const [category, setCategory] =
    useState<(typeof stampCategories)[number]>('All stamps');
  const visible = stamps.filter(
    (stamp) => category === 'All stamps' || stamp.category === category,
  );

  return (
    <section className="stamp-collection" aria-label="Stamp collection">
      <div className="stamp-toolbar">
        <fieldset className="stamp-filters" aria-label="Filter stamps">
          {stampCategories.map((filter) => (
            <button
              type="button"
              key={filter}
              aria-pressed={category === filter}
              onClick={() => setCategory(filter)}
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
