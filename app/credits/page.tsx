import { StructuredData } from '@/components/structured-data';
import { createPageMetadata, creditsSchema, pageSeo } from '@/lib/site-seo';

export const dynamic = 'force-static';

export const metadata = createPageMetadata(pageSeo.credits);

const credits = [
  {
    index: '01',
    kind: 'TYPEFACE',
    name: 'Departure Mono',
    description:
      'Designed by Helena Zhang. Used for navigation, labels, notes, and small interface details. Licensed under the SIL Open Font License 1.1.',
    links: [
      { label: 'FONT SITE ↗', href: 'https://departuremono.com/' },
      { label: 'LICENSE ↗', href: '/fonts/departure-mono/LICENSE.txt' },
    ],
  },
  {
    index: '02',
    kind: 'TYPEFACE',
    name: 'Redaction',
    description:
      'Copyright MCKL Inc. Used for headings and reading text. Distributed under the SIL Open Font License 1.1 and LGPL 2.1.',
    links: [{ label: 'LICENSE ↗', href: '/fonts/redaction/LICENSE.txt' }],
  },
  {
    index: '03',
    kind: 'OPEN SOURCE',
    name: 'The working parts',
    description:
      'React, Vinext, Tailwind CSS, Base UI, and Pixelarticons provide the runtime and interface foundations.',
    links: [
      { label: 'REACT ↗', href: 'https://react.dev/' },
      { label: 'VINEXT ↗', href: 'https://github.com/cloudflare/vinext' },
      { label: 'TAILWIND ↗', href: 'https://tailwindcss.com/' },
      { label: 'BASE UI ↗', href: 'https://base-ui.com/' },
      { label: 'PIXELARTICONS ↗', href: 'https://pixelarticons.com/' },
      {
        label: 'ICON LICENSE ↗',
        href: '/licenses/pixelarticons-MIT.txt',
      },
    ],
  },
  {
    index: '04',
    kind: 'ARTWORK',
    name: 'Portrait mark',
    description: 'This is my avatar icon made by me.',
    links: [],
  },
  {
    index: '05',
    kind: 'HOW IT’S MADE',
    name: 'Human-directed. AI-accelerated.',
    description:
      'I set the direction and make the design calls. AI tools were used for coding, debugging, and the link-preview artwork. The sticker is my own disclosure, not a third-party certification.',
    links: [
      { label: 'AI HONESTY BADGE ↗', href: 'https://www.aihonestybadge.com/' },
    ],
  },
] as const;

export default function CreditsPage() {
  return (
    <div className="credits-page">
      <StructuredData data={creditsSchema} />
      <header className="credits-intro">
        <p className="eyebrow">CREDITS / COLOPHON</p>
        <h1>The small print.</h1>
        <p className="credits-deck">
          Fonts, open-source tools, and artwork used to make this site.
        </p>
      </header>

      <section className="credits-list" aria-label="Site credits">
        {credits.map((credit) => (
          <article
            className="credit-row"
            id={credit.index === '05' ? 'ai-use' : undefined}
            key={credit.index}
          >
            <span className="credit-number" aria-hidden="true">
              {credit.index}
            </span>
            <div className="credit-copy">
              <p>{credit.kind}</p>
              <h2>{credit.name}</h2>
              <p>{credit.description}</p>
            </div>
            {credit.links.length > 0 ? (
              <div className="credit-links">
                {credit.links.map((link) => (
                  <a href={link.href} key={link.href}>
                    {link.label}
                  </a>
                ))}
              </div>
            ) : (
              <span className="credit-owned">PERSONAL ASSET</span>
            )}
          </article>
        ))}
      </section>
    </div>
  );
}
