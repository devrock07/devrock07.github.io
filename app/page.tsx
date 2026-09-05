import { SiteLink as Link } from '@/components/site-link';
import { StructuredData } from '@/components/structured-data';
import { ContactLinks } from '@/components/contact-links';
import { LocalClock } from '@/components/local-clock';
import { PixelScratchpad } from '@/components/pixel-scratchpad';
import { createPageMetadata, pageSeo, profileSchema } from '@/lib/site-seo';
import './home-discovery.css';

export const metadata = createPageMetadata(pageSeo.about);

export default function AboutPage() {
  return (
    <div className="about-page">
      <StructuredData data={profileSchema} />
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
            <LocalClock />
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
            <p>Away from code, I’m into anime and manga.</p>
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

        <nav className="home-discovery" aria-labelledby="discovery-title">
          <h3 id="discovery-title">Elsewhere on this site</h3>
          <ul className="home-discovery-list">
            <li>
              <Link
                href="/stamps?category=anime"
                className="home-discovery-link"
              >
                <span className="home-discovery-title">
                  Anime &amp; manga <span aria-hidden="true">→</span>
                </span>
                <span className="home-discovery-description">
                  Your Name, Suzume, Dandadan, and a few more.
                </span>
                <span className="home-discovery-destination">
                  THE STAMP WALL
                </span>
              </Link>
            </li>
            <li>
              <Link
                href="/stamps?category=toolkit"
                className="home-discovery-link"
              >
                <span className="home-discovery-title">
                  Tools I use <span aria-hidden="true">→</span>
                </span>
                <span className="home-discovery-description">
                  JavaScript, Python, Svelte, and the rest of my toolkit.
                </span>
                <span className="home-discovery-destination">THE TOOLKIT</span>
              </Link>
            </li>
            <li>
              <Link href="/#pixel-pad" className="home-discovery-link">
                <span className="home-discovery-title">
                  Leave a few pixels <span aria-hidden="true">↓</span>
                </span>
                <span className="home-discovery-description">
                  A small drawing pad. Make something and take it with you.
                </span>
                <span className="home-discovery-destination">FURTHER DOWN</span>
              </Link>
            </li>
          </ul>
        </nav>
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

      <section
        className="section detour"
        id="pixel-pad"
        aria-labelledby="detour-title"
      >
        <div className="detour-copy">
          <p className="eyebrow">03 / A LITTLE DETOUR</p>
          <h2 id="detour-title">Got a minute?</h2>
          <p>
            A few pixels to mess around with while you’re here. Draw something.
            Erase it. Start again.
          </p>
          <p className="detour-footnote">
            The ink follows your accent color.
            <br />
            Nothing is posted or sent anywhere.
          </p>
        </div>
        <PixelScratchpad />
      </section>

      <section className="contact" id="contact" aria-labelledby="contact-title">
        <p className="contact-index">04 / CONTACT</p>
        <h2 id="contact-title">Found a bug?</h2>
        <p>I probably know. Send it anyway—or just say hello.</p>
        <ContactLinks />
      </section>
    </div>
  );
}
