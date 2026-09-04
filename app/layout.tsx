import type { Metadata } from 'next';
import type { ReactNode } from 'react';

import { SiteShell } from '@/components/site-shell';

import './globals.css';

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
    <html lang="en">
      <body>
        <SiteShell>{children}</SiteShell>
      </body>
    </html>
  );
}
