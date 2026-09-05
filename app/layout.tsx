import type { Metadata, Viewport } from 'next';
import type { ReactNode } from 'react';

import { SiteShell } from '@/components/site-shell';
import { StructuredData } from '@/components/structured-data';
import {
  createPageMetadata,
  identitySchema,
  pageSeo,
  SITE_URL,
} from '@/lib/site-seo';
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
  ...createPageMetadata(pageSeo.about),
  metadataBase: new URL(SITE_URL),
  authors: [{ name: 'Dev Bhakat', url: SITE_URL }],
  creator: 'Dev Bhakat',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
      'max-video-preview': -1,
    },
  },
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

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#d5bd4b',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: preferenceScript }} />
      </head>
      <body>
        <StructuredData data={identitySchema} />
        <SiteShell>{children}</SiteShell>
      </body>
    </html>
  );
}
