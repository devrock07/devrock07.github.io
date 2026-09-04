export const projects = [
  {
    index: '01',
    slug: 'animc',
    name: 'AniMc',
    state: 'active / Svelte',
    summary:
      'A Minecraft profile-picture and pixel-mascot generator with skin uploads, PNG and animated GIF output, and a public render API.',
    build: 'SvelteKit, TypeScript, Sass, Canvas',
    note: 'Pinned first on my GitHub. It supports username and skin-upload flows, styling controls, and endpoints that other apps can call.',
    href: 'https://github.com/devrock07/AniMc',
  },
  {
    index: '02',
    slug: 'pogy-bot',
    name: 'Pogy-Bot',
    state: 'archive / JavaScript',
    summary:
      'A full Discord bot platform with a web dashboard, moderation, anti-nuke, automod, music, and guild configuration.',
    build: 'Node.js, Discord.js, React, MongoDB, Lavalink',
    note: 'Founded by me and later updated with Void. The project is kept public as an archive; active development has ended.',
    href: 'https://github.com/devrock07/Pogy-Bot',
  },
  {
    index: '03',
    slug: 'shafed-billi',
    name: 'Shafed-Billi',
    state: 'active / JavaScript',
    summary:
      'A component-first Discord music bot with interactive player cards, favourites, filters, queue controls, and per-server settings.',
    build: 'Node.js, Discord.js, MongoDB, Lavalink',
    note: 'Built around Discord Components V2 and Lavalink, with MongoDB persistence and shard and cluster support for larger deployments.',
    href: 'https://github.com/devrock07/Shafed-Billi',
  },
  {
    index: '04',
    slug: 'arrkiii',
    name: 'arrkiii',
    state: 'archive / JavaScript',
    summary:
      'An all-in-one Discord bot combining music, moderation, anti-nuke, automation, and a web dashboard.',
    build: 'Discord.js, MongoDB, React, Lavalink',
    note: 'The codebase includes a bot, dashboard, and standalone emoji manager. It remains public for forks, but is no longer maintained.',
    href: 'https://github.com/devrock07/arrkiii',
  },
  {
    index: '05',
    slug: 'rem-aio',
    name: 'REM-AIO',
    state: 'active / Python',
    summary:
      'One Discord bot for moderation, security, music, tickets, games, and the small utilities servers always end up needing.',
    build: 'Python 3.11, discord.py, SQLite, Lavalink',
    note: 'The repository currently holds 119 cogs. The interesting problem is keeping that much surface area understandable instead of turning setup into homework.',
    href: 'https://github.com/devrock07/REM-AIO',
  },
  {
    index: '06',
    slug: 'astryx',
    name: 'astryx',
    state: 'archive / JavaScript',
    summary:
      'A multipurpose Discord bot for moderation, anti-nuke, automod, music, tickets, logging, utilities, and community tools.',
    build: 'Node.js, Discord.js, PostgreSQL, Sequelize, Lavalink',
    note: 'A broad Discord.js v14 codebase backed by PostgreSQL. It is pinned for the work it represents, though the project is now archived.',
    href: 'https://github.com/devrock07/astryx',
  },
] as const;

export const socials = [
  {
    label: 'GitHub',
    detail: '@devrock07',
    href: 'https://github.com/devrock07',
  },
  {
    label: 'Instagram',
    detail: '@d4vrock',
    href: 'https://www.instagram.com/d4vrock/',
  },
  {
    label: 'YouTube',
    detail: '@ZenithSenpai',
    href: 'https://www.youtube.com/@ZenithSenpai',
  },
  {
    label: 'Email',
    detail: 'devrock.alive@gmail.com',
    href: 'mailto:devrock.alive@gmail.com',
  },
] as const;
