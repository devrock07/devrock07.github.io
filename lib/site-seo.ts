import type { Metadata } from 'next';

import { projects, socials } from '@/lib/site-content';

export const SITE_URL = 'https://devv.is-a.dev';

const socialImage = {
  url: `${SITE_URL}/social/dev-bhakat-preview-v1.png`,
  width: 1731,
  height: 909,
  type: 'image/png',
  alt: 'Dev Bhakat — web developer and bot builder, with his yellow-hoodie avatar on a dark background.',
};

export const pageSeo = {
  about: {
    path: '/',
    title: 'Dev Bhakat — Web Developer & Bot Builder',
    description:
      'I’m Dev Bhakat, also known as devrock07. I build web tools, Discord bots, and automation in Jamshedpur, India. Explore my projects and get in touch.',
  },
  projects: {
    path: '/projects',
    title: 'Projects — Dev Bhakat',
    description:
      'Explore Dev Bhakat’s pinned GitHub projects: AniMc, Pogy-Bot, Shafed-Billi, arrkiii, REM-AIO, and astryx — web tools and Discord bots with source code.',
  },
  credits: {
    path: '/credits',
    title: 'Credits — Dev Bhakat',
    description:
      'The fonts, artwork, and open-source tools behind Dev Bhakat’s portfolio, including Departure Mono, Redaction, Pixelarticons, React, and Vinext.',
  },
} as const;

type PageSeo = (typeof pageSeo)[keyof typeof pageSeo];

export function createPageMetadata(page: PageSeo): Metadata {
  const url = new URL(page.path, SITE_URL).href;

  // Keep each social object complete: metadata merges are shallow in Vinext.
  return {
    title: { absolute: page.title },
    description: page.description,
    alternates: { canonical: url },
    openGraph: {
      type: 'website',
      siteName: 'Dev Bhakat',
      locale: 'en_IN',
      url,
      title: page.title,
      description: page.description,
      images: [socialImage],
    },
    twitter: {
      card: 'summary_large_image',
      title: page.title,
      description: page.description,
      images: [socialImage],
    },
  };
}

const personId = `${SITE_URL}/#person`;
const websiteId = `${SITE_URL}/#website`;

export const identitySchema = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Person',
      '@id': personId,
      name: 'Dev Bhakat',
      alternateName: 'devrock07',
      url: `${SITE_URL}/`,
      image: `${SITE_URL}/dev-bhakat-mark.png`,
      description: 'Web developer and bot builder from Jamshedpur, India.',
      homeLocation: { '@type': 'Place', name: 'Jamshedpur, India' },
      sameAs: socials
        .filter((social) => social.href.startsWith('https://'))
        .map((social) => social.href),
    },
    {
      '@type': 'WebSite',
      '@id': websiteId,
      url: `${SITE_URL}/`,
      name: 'Dev Bhakat',
      alternateName: 'devrock07',
      description: pageSeo.about.description,
      inLanguage: 'en',
      publisher: { '@id': personId },
    },
  ],
};

export const profileSchema = {
  '@context': 'https://schema.org',
  '@type': 'ProfilePage',
  '@id': `${SITE_URL}/#profile-page`,
  url: `${SITE_URL}/`,
  name: pageSeo.about.title,
  description: pageSeo.about.description,
  isPartOf: { '@id': websiteId },
  mainEntity: { '@id': personId },
};

export const projectsSchema = {
  '@context': 'https://schema.org',
  '@type': 'CollectionPage',
  '@id': `${SITE_URL}/projects#projects-page`,
  url: `${SITE_URL}/projects`,
  name: pageSeo.projects.title,
  description: pageSeo.projects.description,
  isPartOf: { '@id': websiteId },
  about: { '@id': personId },
  mainEntity: {
    '@type': 'ItemList',
    numberOfItems: projects.length,
    itemListElement: projects.map((project, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      item: {
        '@type': 'SoftwareSourceCode',
        name: project.name,
        description: project.summary,
        url: project.href,
        codeRepository: project.href,
      },
    })),
  },
};

export const creditsSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebPage',
  '@id': `${SITE_URL}/credits#webpage`,
  url: `${SITE_URL}/credits`,
  name: pageSeo.credits.title,
  description: pageSeo.credits.description,
  isPartOf: { '@id': websiteId },
};
