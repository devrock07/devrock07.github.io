'use client';

import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { ExternalLinkSharp } from 'pixelarticons/react/ExternalLinkSharp';
import { GithubSolid } from 'pixelarticons/react/GithubSolid';
import { InstagramSolid } from 'pixelarticons/react/InstagramSolid';
import { MailSharp } from 'pixelarticons/react/MailSharp';
import { YoutubeSolid } from 'pixelarticons/react/YoutubeSolid';
import {
  useEffect,
  useState,
  type CSSProperties,
  type MouseEvent,
  type ReactNode,
} from 'react';

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
  useSidebar,
} from '@/components/ui/sidebar';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { socials } from '@/lib/site-content';
import { SiteLink as Link } from '@/components/site-link';
import { createPixelCursors } from '@/lib/pixel-cursors.mjs';
import {
  ACCENT_STORAGE_KEY,
  DEFAULT_ACCENT_HUE,
  parseStoredAccentHue,
  THEME_STORAGE_KEY,
} from '@/lib/site-preferences';

const pages = [
  { href: '/', label: 'About' },
  { href: '/projects', label: 'Projects' },
  { href: '/credits', label: 'Credits' },
] as const;

function isCurrent(pathname: string, href: string) {
  return href === '/' ? pathname === '/' : pathname.startsWith(href);
}

function syncPixelCursors(hue: number, paperMode: boolean) {
  for (const [property, cursor] of Object.entries({
    ...createPixelCursors(hue, paperMode),
    ...createPixelCursors(hue, paperMode, true),
  })) {
    document.documentElement.style.setProperty(property, cursor);
  }
}

function PixelSocialIcon({ label }: { label: string }) {
  if (label === 'GitHub') return <GithubSolid />;
  if (label === 'Instagram') return <InstagramSolid />;
  if (label === 'YouTube') return <YoutubeSolid />;

  return <ExternalLinkSharp />;
}

type ShellContentProps = {
  accentHue: number;
  children: ReactNode;
  setAccentHue: (value: number | readonly number[]) => void;
  paperMode: boolean;
  setPaperMode: (checked: boolean) => void;
};

function ShellContent({
  accentHue,
  children,
  setAccentHue,
  paperMode,
  setPaperMode,
}: ShellContentProps) {
  const pathname = usePathname();
  const { setOpenMobile } = useSidebar();
  const current =
    pages.find((page) => isCurrent(pathname, page.href)) ?? pages[0];

  const closeMobile = () => setOpenMobile(false);
  const closeExternal = (event: MouseEvent<HTMLAnchorElement>) => {
    if (!event.defaultPrevented) setOpenMobile(false);
  };

  return (
    <>
      <a className="skip-link" href="#main-content">
        Skip to content
      </a>

      <Sidebar className="editorial-sidebar" collapsible="offcanvas">
        <SidebarHeader className="sidebar-head">
          <Link
            className="sidebar-wordmark"
            href="/"
            onNavigate={closeMobile}
            prefetch={true}
          >
            <span className="sidebar-logo" aria-hidden="true">
              <Image
                src="/dev-bhakat-mark.png"
                alt=""
                width={64}
                height={64}
                priority
              />
            </span>
            <strong>DEV BHAKAT</strong>
          </Link>
          <button
            className="sidebar-close"
            onClick={() => setOpenMobile(false)}
            type="button"
          >
            CLOSE
          </button>
        </SidebarHeader>

        <SidebarContent className="sidebar-scroll">
          <nav className="sidebar-navigation" aria-label="Site navigation">
            <section>
              <p className="sidebar-label">MAIN</p>
              <div className="sidebar-primary">
                {pages.map((page) => (
                  <Link
                    aria-current={
                      isCurrent(pathname, page.href) ? 'page' : undefined
                    }
                    href={page.href}
                    key={page.href}
                    onNavigate={closeMobile}
                    prefetch={true}
                  >
                    {page.label}
                  </Link>
                ))}
                <Link href="/#contact" onNavigate={closeMobile} prefetch={true}>
                  Contact
                </Link>
              </div>
            </section>

            <section>
              <p className="sidebar-label">EMAIL</p>
              <a
                className="sidebar-email"
                href="mailto:devrock.alive@gmail.com"
                onClick={closeExternal}
              >
                <span className="sidebar-icon-tile" aria-hidden="true">
                  <MailSharp />
                </span>
                <span>devrock.alive@gmail.com</span>
              </a>
            </section>

            <section>
              <p className="sidebar-label">SOCIAL</p>
              <div className="sidebar-socials">
                {socials
                  .filter((social) => social.label !== 'Email')
                  .map((social) => (
                    <a
                      href={social.href}
                      key={social.label}
                      onClick={closeExternal}
                    >
                      <span className="sidebar-social-name">
                        <span className="sidebar-icon-tile" aria-hidden="true">
                          <PixelSocialIcon label={social.label} />
                        </span>
                        <span>{social.label}</span>
                      </span>
                      <span aria-hidden="true">↗</span>
                    </a>
                  ))}
              </div>
            </section>
          </nav>
        </SidebarContent>

        <SidebarFooter className="sidebar-foot">
          <div className="theme-row">
            <label htmlFor="bench-light">{paperMode ? 'PAPER' : 'NIGHT'}</label>
            <Switch
              checked={paperMode}
              className="bench-switch"
              id="bench-light"
              onCheckedChange={setPaperMode}
            />
          </div>
          <div className="accent-control">
            <div className="accent-control-label">
              <span id="accent-color-label">ACCENT HUE</span>
              <output aria-hidden="true">{accentHue}°</output>
            </div>
            <Slider
              aria-labelledby="accent-color-label"
              className="accent-slider"
              max={359}
              min={0}
              onValueChange={setAccentHue}
              step={1}
              value={[accentHue]}
            />
          </div>
          <p>© 2026 DEV BHAKAT</p>
        </SidebarFooter>
      </Sidebar>

      <SidebarInset className="site-stage" id="main-content">
        <header className="mobile-bar">
          <Link href="/" aria-label="Dev Bhakat, about" prefetch={true}>
            <Image
              src="/dev-bhakat-mark.png"
              alt=""
              width={52}
              height={52}
              priority
            />
          </Link>
          <span>{current.label}</span>
          <SidebarTrigger className="sidebar-trigger" />
        </header>

        <div className="page-frame">
          {children}
          <footer className="site-footer">
            <p>DEV BHAKAT · 2026</p>
            <a className="back-to-top" href="#main-content">
              BACK TO TOP ↑
            </a>
          </footer>
        </div>
      </SidebarInset>
    </>
  );
}

export function SiteShell({ children }: { children: ReactNode }) {
  const [accentHue, setAccentHueState] = useState(DEFAULT_ACCENT_HUE);
  const [paperMode, setPaperModeState] = useState(false);

  useEffect(() => {
    let savedPaperMode = false;
    let savedAccentHue = DEFAULT_ACCENT_HUE;

    try {
      savedPaperMode = localStorage.getItem(THEME_STORAGE_KEY) === 'paper';
      savedAccentHue = parseStoredAccentHue(
        localStorage.getItem(ACCENT_STORAGE_KEY),
      );
    } catch {
      // The site still works when browser storage is unavailable.
    }

    document.documentElement.dataset.theme = savedPaperMode ? 'paper' : 'night';
    document.documentElement.style.setProperty(
      '--accent-hue',
      `${savedAccentHue}deg`,
    );
    syncPixelCursors(savedAccentHue, savedPaperMode);
    setPaperModeState(savedPaperMode);
    setAccentHueState(savedAccentHue);
  }, []);

  const setPaperMode = (checked: boolean) => {
    const theme = checked ? 'paper' : 'night';

    setPaperModeState(checked);
    document.documentElement.dataset.theme = theme;
    syncPixelCursors(accentHue, checked);

    try {
      localStorage.setItem(THEME_STORAGE_KEY, theme);
    } catch {
      // Keep the in-page control working even when storage is unavailable.
    }
  };

  const setAccentHue = (value: number | readonly number[]) => {
    const nextHue =
      typeof value === 'number' ? value : (value[0] ?? DEFAULT_ACCENT_HUE);

    setAccentHueState(nextHue);
    document.documentElement.style.setProperty('--accent-hue', `${nextHue}deg`);
    syncPixelCursors(nextHue, paperMode);

    try {
      localStorage.setItem(ACCENT_STORAGE_KEY, String(nextHue));
    } catch {
      // Keep the in-page control working even when storage is unavailable.
    }
  };

  return (
    <SidebarProvider
      className="site-shell"
      data-theme={paperMode ? 'paper' : 'night'}
      open={true}
      style={{ '--sidebar-width': '15.5rem' } as CSSProperties}
    >
      <ShellContent
        accentHue={accentHue}
        paperMode={paperMode}
        setAccentHue={setAccentHue}
        setPaperMode={setPaperMode}
      >
        {children}
      </ShellContent>
    </SidebarProvider>
  );
}
