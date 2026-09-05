'use client';

import { useEffect, useRef, useState } from 'react';
import { Check } from 'pixelarticons/react/Check';
import { CopySharp } from 'pixelarticons/react/CopySharp';
import { GithubSolid } from 'pixelarticons/react/GithubSolid';
import { InstagramSolid } from 'pixelarticons/react/InstagramSolid';
import { YoutubeSolid } from 'pixelarticons/react/YoutubeSolid';
import { socials } from '@/lib/site-content';

const icons = {
  GitHub: GithubSolid,
  Instagram: InstagramSolid,
  YouTube: YoutubeSolid,
};
const email = 'devrock.alive@gmail.com';

export function ContactLinks() {
  const [copyState, setCopyState] = useState<'idle' | 'copied' | 'error'>(
    'idle',
  );
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );

  async function copyEmail() {
    if (timer.current) clearTimeout(timer.current);
    try {
      await navigator.clipboard.writeText(email);
      setCopyState('copied');
    } catch {
      setCopyState('error');
    }
    timer.current = setTimeout(() => setCopyState('idle'), 3500);
  }

  return (
    <>
      <div className="contact-email-row">
        <a className="big-mail" href={`mailto:${email}`}>
          <span>{email}</span>
          <span aria-hidden="true">↗</span>
        </a>
        <button
          className="copy-email"
          type="button"
          onClick={copyEmail}
          aria-label="Copy email address"
        >
          {copyState === 'copied' ? (
            <Check aria-hidden="true" />
          ) : (
            <CopySharp aria-hidden="true" />
          )}
          <span>{copyState === 'copied' ? 'COPIED' : 'COPY'}</span>
        </button>
      </div>
      <output className="copy-feedback" aria-live="polite">
        {copyState === 'copied'
          ? 'Email address copied.'
          : copyState === 'error'
            ? 'Couldn’t copy automatically. Select the address above to copy it.'
            : '\u00a0'}
      </output>
      <nav className="contact-social-tiles" aria-label="Social links">
        {socials
          .filter((social) => social.label !== 'Email')
          .map((social) => {
            const Icon = icons[social.label as keyof typeof icons];
            return (
              <a
                href={social.href}
                key={social.label}
                className="contact-social-tile"
              >
                <span className="contact-social-icon">
                  <Icon aria-hidden="true" />
                </span>
                <span>
                  <strong>{social.label}</strong>
                  <small>{social.detail}</small>
                </span>
                <span className="contact-social-arrow" aria-hidden="true">
                  ↗
                </span>
              </a>
            );
          })}
      </nav>
    </>
  );
}
