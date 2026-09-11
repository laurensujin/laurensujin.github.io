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

/** Full case study page: header, cover, content blocks, next/previous links. */
export function CaseStudy({ content, previous, next, previewBanner }: Props) {
  const timeline = content.dateRange || content.year;
  const meta = [
    { label: "Category", value: content.categories.join(", ") },
    { label: "Timeline", value: timeline },
    { label: "Status", value: content.projectStatus },
    { label: "Role", value: content.role.join(", ") },
  ].filter((m) => m.value.trim());
  const links = [
    isSafeUrl(content.projectUrl) ? { label: content.projectUrlLabel || "Visit project", url: content.projectUrl } : null,
    isSafeUrl(content.socialUrl) ? { label: content.socialLabel || "Instagram", url: content.socialUrl } : null,
  ].filter(Boolean) as { label: string; url: string }[];

  return (
    <article>
      {previewBanner}
      <Container>
        <header className="pb-12 pt-32 md:pb-16 md:pt-44">
          <Link href="/#work" className="eyebrow link-line inline-flex items-center gap-2 text-fg">
            <span aria-hidden>←</span> Work
          </Link>
          <h1 className="mt-10 max-w-[16ch] font-serif text-[clamp(2.75rem,7vw,6.5rem)] font-light leading-[1.02] tracking-[-0.015em]">
            {content.title}
          </h1>
          {content.subtitle ? <p className="mt-6 max-w-[48ch] text-lg leading-relaxed text-fg-muted md:text-xl">{content.subtitle}</p> : null}

          {meta.length || links.length ? (
            <dl className="mt-14 grid grid-cols-2 gap-x-8 gap-y-8 border-t border-line pt-6 md:grid-cols-4">
              {meta.map((m) => (
                <div key={m.label}>
                  <dt className="eyebrow">{m.label}</dt>
                  <dd className="mt-2 text-[15px] leading-relaxed text-fg">{m.value}</dd>
                </div>
              ))}
              {links.length ? (
                <div>
                  <dt className="eyebrow">Links</dt>
                  <dd className="mt-2 flex flex-col gap-1 text-[15px]">
                    {links.map((l) => (
                      <a key={l.url} href={l.url} target="_blank" rel="noopener noreferrer" className="link-line inline-flex w-fit items-center gap-2 text-fg">
                        {l.label} <span aria-hidden className="text-fg-muted">↗</span>
                      </a>
                    ))}
                  </dd>
                </div>
              ) : null}
            </dl>
          ) : null}
        </header>
      </Container>

      {content.coverVideo ? (
        <div className="relative w-full overflow-hidden bg-bg-elevated">
          <MediaVideo media={content.coverVideo} poster={content.cover} />
        </div>
      ) : content.cover ? (
        <div className="relative aspect-[4/5] w-full overflow-hidden bg-bg-elevated md:aspect-[16/9]">
          <MediaImage media={content.cover} fill priority sizes="100vw" quality={90} />
        </div>
      ) : null}

      <div className="pt-16 md:pt-24">
        <Blocks blocks={content.blocks} />
      </div>

      {content.tags.length ? (
        <Container className="mt-20">
          <p className="eyebrow mx-auto max-w-[64rem]">{content.tags.join("  ·  ")}</p>
        </Container>
      ) : null}

      {previous || next ? (
        <Container className="mt-24 md:mt-32">
          <nav className="grid gap-8 border-t border-line pt-8 md:grid-cols-2" aria-label="More projects">
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
      <p className="eyebrow">{label}</p>
      <p className="link-line mt-3 inline-block font-serif text-3xl font-light leading-tight md:text-4xl">{project.content.title}</p>
    </Link>
  );
}
