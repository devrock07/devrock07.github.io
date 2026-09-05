'use client';

import { useRouter } from 'next/navigation';
import { useCallback, useEffect, type ComponentProps } from 'react';

import '@/lib/install-static-navigation';

type SiteLinkProps = Omit<ComponentProps<'a'>, 'href'> & {
  href: string;
  prefetch?: boolean;
  onNavigate?: () => void;
};

// Use the public router directly. Vinext beta.5's Link dynamically imports
// private navigation exports that are missing from its production bundle.
export function SiteLink({
  href,
  prefetch = true,
  onNavigate,
  onClick,
  onMouseEnter,
  onFocus,
  onTouchStart,
  ...props
}: SiteLinkProps) {
  const router = useRouter();
  const warmPage = useCallback(() => {
    if (!prefetch) return;
    const url = new URL(href, window.location.href);
    if (
      url.origin !== window.location.origin ||
      (url.pathname === window.location.pathname &&
        url.search === window.location.search)
    ) {
      return;
    }
    router.prefetch(url.pathname + url.search);
  }, [href, prefetch, router]);

  useEffect(warmPage, [warmPage]);

  return (
    <a
      {...props}
      href={href}
      onMouseEnter={(event) => {
        onMouseEnter?.(event);
        if (!event.defaultPrevented) warmPage();
      }}
      onFocus={(event) => {
        onFocus?.(event);
        if (!event.defaultPrevented) warmPage();
      }}
      onTouchStart={(event) => {
        onTouchStart?.(event);
        if (!event.defaultPrevented) warmPage();
      }}
      onClick={(event) => {
        onClick?.(event);
        if (
          event.defaultPrevented ||
          event.button !== 0 ||
          event.metaKey ||
          event.ctrlKey ||
          event.shiftKey ||
          event.altKey ||
          event.currentTarget.hasAttribute('download') ||
          (event.currentTarget.target && event.currentTarget.target !== '_self')
        ) {
          return;
        }
        const url = new URL(href, window.location.href);
        if (url.origin !== window.location.origin) return;

        event.preventDefault();
        onNavigate?.();
        router.push(url.pathname + url.search + url.hash);
      }}
    />
  );
}
