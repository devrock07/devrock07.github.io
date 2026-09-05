import { StructuredData } from '@/components/structured-data';
import { ProjectCollection } from '@/components/project-collection';
import { createPageMetadata, pageSeo, projectsSchema } from '@/lib/site-seo';

export const dynamic = 'force-static';

export const metadata = createPageMetadata(pageSeo.projects);

export default function ProjectsPage() {
  return (
    <div className="projects-page">
      <StructuredData data={projectsSchema} />
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

      <ProjectCollection />

      <p className="project-footnote">
        Archive means exactly that: the code stays public, but active
        development has ended.
      </p>
    </div>
  );
}
