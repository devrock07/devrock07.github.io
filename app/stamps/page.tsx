import { StampCollection } from '@/components/stamp-collection';
import { StructuredData } from '@/components/structured-data';
import { createPageMetadata, pageSeo, stampsSchema } from '@/lib/site-seo';

export const dynamic = 'force-static';
export const metadata = createPageMetadata(pageSeo.stamps);

export default function StampsPage() {
  return (
    <div className="stamps-page">
      <StructuredData data={stampsSchema} />
      <header className="stamps-intro">
        <p className="eyebrow">STAMPS / APPS & INTERESTS</p>
        <h1>Stamps & stuff.</h1>
        <div className="stamps-deck">
          <p>
            Apps I use, tools I build with, and anime and manga I’m into. A
            little sticker sheet for this corner of the web.
          </p>
          <span className="stamp-postmark" aria-hidden="true">
            <span>DEVROCK07</span>
            <span>SMALL WEB</span>
            <span>A BIT OF ME</span>
          </span>
        </div>
      </header>
      <StampCollection />
    </div>
  );
}
