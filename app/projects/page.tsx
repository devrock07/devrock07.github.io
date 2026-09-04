import type { Metadata } from 'next';

import { projects } from '@/lib/site-content';

export const dynamic = 'force-static';

export const metadata: Metadata = {
  title: 'Projects',
  description: 'The projects pinned on Dev Bhakat’s GitHub profile.',
};

export default function ProjectsPage() {
  return (
    <div className="projects-page">
      <header className="projects-intro">
        <p className="eyebrow">01 / PINNED WORK</p>
        <h1>Things I kept.</h1>
        <div>
          <p>
            These are the six repositories pinned on my GitHub profile, in the
            same order. Active and archived work sit together here.
          </p>
          <a href="https://github.com/devrock07">GITHUB PROFILE ↗</a>
        </div>
      </header>

      <section className="project-list" aria-label="Pinned projects">
        {projects.map((project) => (
          <article className="project" id={project.slug} key={project.name}>
            <span className="project-number" aria-hidden="true">
              {project.index}
            </span>

            <div className="project-main">
              <div className="project-title-row">
                <h2>{project.name}</h2>
                <span>{project.state}</span>
              </div>
              <p className="project-summary">{project.summary}</p>

              <details className="project-notes">
                <summary>open field notes</summary>
                <div>
                  <p>{project.note}</p>
                  <p>
                    <span>BUILD:</span> {project.build}
                  </p>
                </div>
              </details>
            </div>

            <a className="project-source" href={project.href}>
              SOURCE ↗
            </a>
          </article>
        ))}
      </section>

      <p className="project-footnote">
        Archive means exactly that: the code stays public, but active
        development has ended.
      </p>
    </div>
  );
}
