import Link from "next/link";
import type { ProjectContent } from "@/lib/content/schema";
import type { PublicProject } from "@/lib/data/types";
import { isSafeUrl } from "@/lib/utils";
import { Blocks, ProjectBrief, workLabels } from "./blocks/BlockRenderer";
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

/** Project page: the name and the whole picture share one row. The picture is not cropped to fill the screen. */
export function CaseStudy({ content, previous, next, previewBanner }: Props) {
  const summary = (content.subtitle || content.categories[0] || "").trim();
  const { name } = workLabels(content.blocks);
  const hasCover = Boolean(content.cover || content.coverVideo);
  const links = [
    isSafeUrl(content.projectUrl) ? { label: content.projectUrlLabel || "Visit project", url: content.projectUrl } : null,
    isSafeUrl(content.socialUrl) ? { label: content.socialLabel || "Instagram", url: content.socialUrl } : null,
  ].filter(Boolean) as { label: string; url: string }[];

  return (
    <article>
      {previewBanner}
      <Container>
        <header className="grid items-start gap-8 pb-8 pt-20 md:grid-cols-12 md:gap-10 md:pt-24">
          <div className={hasCover ? "md:col-span-4" : "md:col-span-8"}>
            <Link href="/#work" className="link-line inline-flex items-center gap-2 text-sm font-medium text-fg">
              <span aria-hidden>←</span> Work
            </Link>
            <h1 className="mt-5 max-w-[12ch] font-serif text-4xl font-medium leading-[1.02] tracking-[-0.03em] md:text-5xl">{content.title}</h1>
            {summary ? <p className="mt-3 text-sm leading-relaxed text-fg-muted">{summary}</p> : null}
            {name && name !== content.title ? <p className="mt-4 text-base font-medium text-fg">{name}</p> : null}
            {links.length ? (
              <p className="mt-4 flex flex-wrap gap-x-4 gap-y-1 text-sm">
                {links.map((l) => (
                  <a key={l.url} href={l.url} target="_blank" rel="noopener noreferrer" className="link-line font-medium text-fg">
                    {l.label}
                  </a>
                ))}
              </p>
            ) : null}
          </div>
          {content.coverVideo ? (
            <div className="relative aspect-[4/3] overflow-hidden bg-bg-elevated md:col-span-8">
              <MediaVideo media={content.coverVideo} poster={content.cover} className="h-full w-full object-cover" />
            </div>
          ) : content.cover ? (
            <div className="relative aspect-[4/3] overflow-hidden bg-bg-elevated md:col-span-8">
              <MediaImage media={content.cover} fill priority sizes="(min-width: 768px) 64vw, 100vw" quality={90} className="object-center" />
            </div>
          ) : null}
        </header>
      </Container>

      <Blocks blocks={content.blocks} />
      <ProjectBrief blocks={content.blocks} />

      {previous || next ? (
        <Container className="mt-8">
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
