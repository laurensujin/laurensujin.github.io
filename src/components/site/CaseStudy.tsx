import Link from "next/link";
import type { ProjectContent } from "@/lib/content/schema";
import type { PublicProject } from "@/lib/data/types";
import { refAspect } from "@/lib/media/url";
import { isSafeUrl } from "@/lib/utils";
import { Blocks, ProjectBrief, workLabels } from "./blocks/BlockRenderer";
import { Container } from "./Container";
import { MediaImage } from "./MediaImage";
import { MediaVideo } from "./MediaVideo";

/**
 * Tallest a cover may be. The picture is given this height and takes whatever
 * width its own proportions need, so a portrait and a landscape cover both sit
 * inside the first screen and neither is cropped.
 */
const COVER_HEIGHT = "76svh";

interface Props {
  content: ProjectContent;
  previous?: PublicProject | null;
  next?: PublicProject | null;
  /** Shown at the top when previewing an unpublished draft from /admin. */
  previewBanner?: React.ReactNode;
}

/** Project page: the title and the whole picture share the top row. */
export function CaseStudy({ content, previous, next, previewBanner }: Props) {
  const summary = (content.subtitle || content.categories[0] || "").trim();
  const { name } = workLabels(content.blocks);
  const links = [
    isSafeUrl(content.projectUrl) ? { label: content.projectUrlLabel || "Visit project", url: content.projectUrl } : null,
    isSafeUrl(content.socialUrl) ? { label: content.socialLabel || "Instagram", url: content.socialUrl } : null,
  ].filter(Boolean) as { label: string; url: string }[];

  // The subtitle is only worth printing when it says something the discipline
  // list does not already say (some projects set it to the same list).
  const disciplines = content.categories.join(" · ");
  const plain = (value: string) => value.toLowerCase().replace(/[^a-z0-9]/g, "");
  const showSummary = Boolean(summary) && plain(summary) !== plain(disciplines);

  const hasCover = Boolean(content.cover || content.coverVideo);
  // A video always plays at 16:9; a photo keeps its own ratio.
  const ratio = content.coverVideo ? 16 / 9 : refAspect(content.cover, 3 / 2);
  const coverWidth = { ["--cover-w" as string]: `calc(${COVER_HEIGHT} * ${ratio})` };

  return (
    <article>
      {previewBanner}

      <Container>
        <header className="pb-14 pt-28 md:pt-32">
          <Link href="/#work" className="link-line eyebrow inline-flex items-center gap-2 text-fg">
            <span aria-hidden>←</span> Work
          </Link>

          {/* The left column stretches to the picture, with the title at the top
              and the details closing the composition at the bottom. */}
          <div className="mt-8 flex flex-col gap-10 md:flex-row md:items-stretch md:gap-12">
            <div className="flex flex-col md:min-w-0 md:flex-1">
              <h1 className="t-display max-w-[14ch] text-balance text-fg">{content.title}</h1>
              {showSummary ? <p className="t-body measure mt-5 text-fg-muted">{summary}</p> : null}

              <dl className="mt-8 max-w-[22rem] border-t border-line pt-4 md:mt-auto">
                {content.categories.length ? (
                  <div className="flex flex-col gap-1 pb-3">
                    <dt className="eyebrow">Discipline</dt>
                    <dd className="t-body text-fg-muted">
                      <ul>
                        {content.categories.map((category) => (
                          <li key={category}>{category}</li>
                        ))}
                      </ul>
                    </dd>
                  </div>
                ) : summary ? (
                  <div className="flex flex-col gap-1 pb-3">
                    <dt className="eyebrow">Discipline</dt>
                    <dd className="t-body text-fg-muted">{summary}</dd>
                  </div>
                ) : null}

                {name && name !== content.title ? (
                  <div className="flex flex-col gap-1 border-t border-line py-3">
                    <dt className="eyebrow">Work</dt>
                    <dd className="t-title text-fg">{name}</dd>
                  </div>
                ) : null}

                {links.length ? (
                  <div className="flex flex-col gap-1 border-t border-line pt-3">
                    <dt className="eyebrow">Links</dt>
                    <dd className="mt-1 flex flex-wrap gap-x-6 gap-y-2">
                      {links.map((l) => (
                        <a
                          key={l.url}
                          href={l.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="link-line group/link t-body inline-flex items-center gap-1.5 text-fg"
                        >
                          {l.label}
                          <span aria-hidden className="transition-transform duration-200 group-hover/link:translate-x-0.5">
                            ↗
                          </span>
                        </a>
                      ))}
                    </dd>
                  </div>
                ) : null}
              </dl>
            </div>

            {hasCover ? (
              <div style={coverWidth} className="w-full shrink-0 self-start overflow-hidden bg-bg-elevated md:w-[min(var(--cover-w),58%)]">
                {content.coverVideo ? (
                  <div className="relative aspect-video w-full">
                    <MediaVideo media={content.coverVideo} poster={content.cover} className="h-full w-full object-cover" />
                  </div>
                ) : content.cover ? (
                  <MediaImage media={content.cover} priority sizes="(min-width: 768px) 58vw, 100vw" quality={90} />
                ) : null}
              </div>
            ) : null}
          </div>
        </header>
      </Container>

      <Blocks blocks={content.blocks} />
      <ProjectBrief blocks={content.blocks} />

      {previous || next ? (
        <Container className="mt-16 md:mt-20">
          <nav className="grid gap-8 border-t border-line pt-6 sm:grid-cols-2" aria-label="More projects">
            {previous ? <AdjacentLink project={previous} label="Previous" /> : <span className="hidden sm:block" />}
            {next ? <AdjacentLink project={next} label="Next" align="right" /> : null}
          </nav>
        </Container>
      ) : null}
    </article>
  );
}

function AdjacentLink({ project, label, align }: { project: PublicProject; label: string; align?: "right" }) {
  const right = align === "right";
  return (
    <Link href={`/work/${project.slug}`} className={`group block ${right ? "sm:text-right" : ""}`}>
      <p className="eyebrow">{label}</p>
      <p
        className={`t-title mt-2 inline-flex items-center gap-2 text-fg decoration-1 underline-offset-[6px] group-hover:underline ${
          right ? "sm:flex-row-reverse" : ""
        }`}
      >
        <span aria-hidden className={`text-fg-faint transition-transform duration-200 ${right ? "group-hover:translate-x-1" : "group-hover:-translate-x-1"}`}>
          {right ? "→" : "←"}
        </span>
        {project.content.title}
      </p>
    </Link>
  );
}
