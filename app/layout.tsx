import type { Metadata } from 'next';
import type { ReactNode } from 'react';

import { SiteShell } from '@/components/site-shell';
import {
  ACCENT_STORAGE_KEY,
  DEFAULT_ACCENT_HUE,
  THEME_STORAGE_KEY,
} from '@/lib/site-preferences';

import './globals.css';

const preferenceScript = `
  (function () {
    try {
      var theme = localStorage.getItem(${JSON.stringify(THEME_STORAGE_KEY)});
      var storedHue = localStorage.getItem(${JSON.stringify(ACCENT_STORAGE_KEY)});
      var hue = storedHue === null || storedHue.trim() === ''
        ? ${DEFAULT_ACCENT_HUE}
        : Number(storedHue);

      document.documentElement.dataset.theme = theme === 'paper' ? 'paper' : 'night';
      if (Number.isFinite(hue) && hue >= 0 && hue <= 359) {
        document.documentElement.style.setProperty('--accent-hue', Math.round(hue) + 'deg');
      }
    } catch (_) {}
  })();
`;

export const metadata: Metadata = {
  metadataBase: new URL('https://devv.is-a.dev'),
  title: {
    default: 'Dev Bhakat — Web Developer & Bot Builder',
    template: '%s — Dev Bhakat',
  },
  description:
    'Dev Bhakat builds fast web tools, Discord bots, automation, and interfaces from Jamshedpur, India.',
  icons: {
    icon: [
      {
        url: '/dev-bhakat-mark.png',
        type: 'image/png',
        sizes: '1024x1024',
      },
    ],
    shortcut: '/dev-bhakat-mark.png',
    apple: '/dev-bhakat-mark.png',
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: preferenceScript }} />
      </head>
      <body>
        <SiteShell>{children}</SiteShell>
      </body>
    </html>
  );
}
