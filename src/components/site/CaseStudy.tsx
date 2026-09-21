import Link from "next/link";
import type { ProjectContent } from "@/lib/content/schema";
import type { PublicProject } from "@/lib/data/types";
import { isSafeUrl } from "@/lib/utils";
import { Blocks } from "./blocks/BlockRenderer";
import { Container } from "./Container";
import { MediaImage } from "./MediaImage";
import { MediaVideo } from "./MediaVideo";

interface Props {
  content: ProjectContent;
  previous?: PublicProject | null;
  next?: PublicProject | null;
  /** Shown at the top when previewing an unpublished draft from /admin. */
  previewBanner?: React.ReactNode;
}

/** Project page: title, one line, a modest cover, then the work itself. */
export function CaseStudy({ content, previous, next, previewBanner }: Props) {
  const timeline = content.dateRange || content.year;
  const summary = [content.subtitle || content.categories[0], timeline].filter((value) => value?.trim()).join("  ·  ");
  const links = [
    isSafeUrl(content.projectUrl) ? { label: content.projectUrlLabel || "Visit project", url: content.projectUrl } : null,
    isSafeUrl(content.socialUrl) ? { label: content.socialLabel || "Instagram", url: content.socialUrl } : null,
  ].filter(Boolean) as { label: string; url: string }[];

  return (
    <article>
      {previewBanner}
      <Container>
        <header className="pb-6 pt-24 md:pt-28">
          <Link href="/#work" className="link-line inline-flex items-center gap-2 text-sm font-medium text-fg">
            <span aria-hidden>←</span> Work
          </Link>
          <h1 className="mt-4 max-w-[20ch] font-serif text-4xl font-medium leading-[1.05] tracking-[-0.03em] md:text-5xl">{content.title}</h1>
          {summary || links.length ? (
            <p className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-fg-muted">
              {summary ? <span>{summary}</span> : null}
              {links.map((l) => (
                <a key={l.url} href={l.url} target="_blank" rel="noopener noreferrer" className="link-line text-fg">
                  {l.label}
                </a>
              ))}
            </p>
          ) : null}
        </header>
      </Container>

      {content.coverVideo ? (
        <Container>
          <div className="relative mx-auto aspect-[3/2] w-full max-w-3xl overflow-hidden bg-bg-elevated">
            <MediaVideo media={content.coverVideo} poster={content.cover} className="h-full w-full object-cover" />
          </div>
        </Container>
      ) : content.cover ? (
        <Container>
          <div className="relative mx-auto aspect-[3/2] w-full max-w-3xl overflow-hidden bg-bg-elevated">
            <MediaImage media={content.cover} fill priority sizes="(min-width: 768px) 48rem, 100vw" quality={90} />
          </div>
        </Container>
      ) : null}

      <div className="pt-10 md:pt-12">
        <Blocks blocks={content.blocks} />
      </div>

      {content.tags.length ? (
        <Container className="mt-12">
          <p className="text-sm text-fg-muted">{content.tags.join("  ·  ")}</p>
        </Container>
      ) : null}

      {previous || next ? (
        <Container className="mt-14 md:mt-16">
          <nav className="grid gap-6 border-t border-line pt-6 md:grid-cols-2" aria-label="More projects">
            {previous ? <AdjacentLink project={previous} label="Previous" /> : <span />}
            {next ? <AdjacentLink project={next} label="Next" align="right" /> : null}
          </nav>
        </Container>
      ) : null}
    </article>
  );
}

function AdjacentLink({ project, label, align }: { project: PublicProject; label: string; align?: "right" }) {
  return (
    <Link href={`/work/${project.slug}`} className={`group block ${align === "right" ? "md:text-right" : ""}`}>
      <p className="text-sm text-fg-muted">{label}</p>
      <p className="link-line mt-1 inline-block text-base font-medium">{project.content.title}</p>
    </Link>
  );
}
