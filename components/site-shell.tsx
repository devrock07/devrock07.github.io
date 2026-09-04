'use client';

import Image from 'next/image';
import Link from 'next/link';
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

const pages = [
  { href: '/', label: 'About' },
  { href: '/projects', label: 'Projects' },
  { href: '/credits', label: 'Credits' },
] as const;

function isCurrent(pathname: string, href: string) {
  return href === '/' ? pathname === '/' : pathname.startsWith(href);
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
          <Link className="sidebar-wordmark" href="/" onClick={closeMobile}>
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
                    onClick={closeMobile}
                  >
                    {page.label}
                  </Link>
                ))}
                <Link href="/#contact" onClick={closeMobile}>
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
          <Link href="/" aria-label="Dev Bhakat, about">
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
            <p>ONE LINE AT A TIME.</p>
            <a href="#main-content">BACK TO TOP ↑</a>
          </footer>
        </div>
      </SidebarInset>
    </>
  );
}

export function SiteShell({ children }: { children: ReactNode }) {
  const [accentHue, setAccentHueState] = useState(92);
  const [paperMode, setPaperMode] = useState(false);

  useEffect(() => {
    document.documentElement.style.setProperty(
      '--accent-hue',
      `${accentHue}deg`,
    );
  }, [accentHue]);

  const setAccentHue = (value: number | readonly number[]) => {
    const nextHue = typeof value === 'number' ? value : (value[0] ?? 92);
    setAccentHueState(nextHue);
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
