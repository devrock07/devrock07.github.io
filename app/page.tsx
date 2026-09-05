import type { Metadata } from 'next';
import { SiteLink as Link } from '@/components/site-link';

import { socials } from '@/lib/site-content';

export const metadata: Metadata = {
  title: 'About',
  description:
    'Dev Bhakat is a web developer and bot builder from Jamshedpur, India.',
};

export default function AboutPage() {
  return (
    <div className="about-page">
      <section className="hero" aria-labelledby="hero-title">
        <p className="eyebrow">WEB DEVELOPER / BOT BUILDER</p>
        <h1 id="hero-title">Dev Bhakat</h1>

        <div className="hero-grid">
          <p className="hero-intro">
            I build fast web tools, Discord bots, and interfaces with a little
            chaos in the right places.
          </p>
          <aside className="hero-note">
            <span aria-hidden="true">↳</span>
            <p>I break code, then make it better.</p>
          </aside>
        </div>

        <div className="hero-links">
          <a href="mailto:devrock.alive@gmail.com">EMAIL ↗</a>
          <a href="https://github.com/devrock07">GITHUB ↗</a>
          <Link href="/projects" prefetch={true}>
            PROJECTS →
          </Link>
        </div>
      </section>

      <section className="section about" aria-labelledby="about-title">
        <header className="section-heading">
          <p>01 / ABOUT</p>
          <h2 id="about-title">Mostly curious. Occasionally careful.</h2>
        </header>

        <div className="about-body">
          <div className="about-copy">
            <p>
              I&apos;m Dev—usually <mark>devrock07</mark> online. Most of my
              public work lives around Discord bots, web tools, automation
              experiments, and interfaces that feel quick without hiding how
              they work.
            </p>
            <p>
              I use JavaScript and Node.js, Python, TypeScript, and Svelte. I’m
              based in Jamshedpur, Jharkhand, and speak English, Hindi, and
              Bengali.
            </p>
          </div>

          <dl className="facts">
            <div>
              <dt>ALSO KNOWN AS</dt>
              <dd>devrock / ZenithSenpai</dd>
            </div>
            <div>
              <dt>USUAL TERRITORY</dt>
              <dd>bots / web tools / automation</dd>
            </div>
            <div>
              <dt>DEFAULT LOOP</dt>
              <dd>build / break / read logs / repeat</dd>
            </div>
          </dl>
        </div>
      </section>

      <section className="section notes" aria-labelledby="notes-title">
        <header className="section-heading section-heading--compact">
          <p>02 / MARGIN LOG</p>
          <h2 id="notes-title">Notes from the workbench.</h2>
        </header>

        <div className="logbook">
          <article>
            <time dateTime="2026-09-04">04 SEP 2026</time>
            <p>Rebuilding this corner of the web from a blank folder.</p>
            <span>NOW</span>
          </article>
          <article>
            <time dateTime="2026-08">AUG 2026</time>
            <p>Rockdactyl is becoming a full panel distribution.</p>
            <span>SHIPPED</span>
          </article>
          <article>
            <time>ALWAYS</time>
            <p>No skill bars. No buzzword soup. The work can speak.</p>
            <span>RULE</span>
          </article>
        </div>
      </section>

      <section className="contact" id="contact" aria-labelledby="contact-title">
        <p className="contact-index">03 / CONTACT</p>
        <h2 id="contact-title">Found a bug?</h2>
        <p>I probably know. Send it anyway—or just say hello.</p>
        <a className="big-mail" href="mailto:devrock.alive@gmail.com">
          devrock.alive@gmail.com <span>↗</span>
        </a>

        <div className="social-row" aria-label="Social links">
          {socials
            .filter((social) => social.label !== 'Email')
            .map((social) => (
              <a href={social.href} key={social.label}>
                {social.label}
              </a>
            ))}
        </div>
      </section>
    </div>
  );
}
