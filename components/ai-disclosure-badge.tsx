import { SiteLink } from '@/components/site-link';

export function AiDisclosureBadge() {
  return (
    <SiteLink
      className="ai-disclosure-badge"
      href="/credits#ai-use"
      aria-label="AI-accelerated, human-directed — how this site was made"
    >
      <span className="ai-badge-mark" aria-hidden="true">
        AI
      </span>
      <span className="ai-badge-copy">
        <span>HUMAN-DIRECTED</span>
        <strong>AI-ACCELERATED</strong>
      </span>
    </SiteLink>
  );
}
