import Link from "next/link";
import type { ProjectContent } from "@/lib/content/schema";
import type { PublicProject } from "@/lib/data/types";
import { isSafeUrl } from "@/lib/utils";
import { Blocks, workLabels } from "./blocks/BlockRenderer";
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

/** One screen: the name sits against a picture that fills the rest of the page. */
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
      <div className="flex min-h-svh flex-col pt-14">
        <Container className="flex min-h-0 flex-1 flex-col pb-6">
          <div className="grid min-h-0 flex-1 grid-rows-[auto_minmax(16rem,1fr)] gap-6 md:grid-cols-12 md:grid-rows-[minmax(0,1fr)] md:gap-10">
            <div className="flex flex-col justify-between gap-8 md:col-span-4 md:py-2">
              <Link href="/#work" className="link-line inline-flex w-fit items-center gap-2 text-sm font-medium text-fg">
                <span aria-hidden>←</span> Work
              </Link>
              <div>
                <h1 className="max-w-[11ch] font-serif text-4xl font-medium leading-[1.02] tracking-[-0.03em] md:text-5xl">{content.title}</h1>
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
            </div>
            {hasCover ? (
              <div className="relative min-h-0 md:col-span-8">
                <div className="absolute inset-0 overflow-hidden bg-bg-elevated">
                  {content.coverVideo ? (
                    <MediaVideo media={content.coverVideo} poster={content.cover} className="h-full w-full object-cover" />
                  ) : content.cover ? (
                    <MediaImage media={content.cover} fill priority sizes="(min-width: 768px) 66vw, 100vw" quality={90} />
                  ) : null}
                </div>
              </div>
            ) : null}
          </div>

          {previous || next ? (
            <nav className="mt-6 grid gap-4 border-t border-line pt-4 md:grid-cols-2" aria-label="More projects">
              {previous ? <AdjacentLink project={previous} label="Previous" /> : <span />}
              {next ? <AdjacentLink project={next} label="Next" align="right" /> : null}
            </nav>
          ) : null}
        </Container>
      </div>

      <Blocks blocks={content.blocks} />
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
