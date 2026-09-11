import Link from "next/link";
import type { PublicProject } from "@/lib/data/types";
import { cn } from "@/lib/utils";
import { EmptyCover } from "./EmptyCover";
import { MediaImage } from "./MediaImage";
import { MediaVideo } from "./MediaVideo";
import { Reveal } from "./Reveal";

interface Props {
  project: PublicProject;
  variant: "featured" | "standard";
  className?: string;
  priority?: boolean;
}

/** Card in the Selected Work grid: image first, then title and meta. */
export function ProjectPreview({ project, variant, className, priority }: Props) {
  const { content, slug } = project;
  const meta = [content.categories.join(" · "), content.projectStatus].filter(Boolean);

  return (
    <Reveal as="li" className={cn("list-none", className)}>
      <Link href={`/work/${slug}`} className="group block">
        <div
          className={cn(
            "image-hover relative w-full overflow-hidden bg-bg-elevated",
            variant === "featured" ? "aspect-[4/5] md:aspect-[16/10]" : "aspect-[4/5]",
          )}
        >
          {content.cover ? (
            <MediaImage
              media={content.cover}
              fill
              priority={priority}
              sizes={variant === "featured" ? "(min-width: 1440px) 88rem, 100vw" : "(min-width: 768px) 50vw, 100vw"}
            />
          ) : (
            <EmptyCover title={content.title} />
          )}
          {content.coverVideo ? (
            <div className="absolute inset-0">
              <MediaVideo media={content.coverVideo} poster={content.cover} className="h-full w-full object-cover" />
            </div>
          ) : null}
        </div>

        <div className="mt-5 flex items-baseline justify-between gap-6">
          <h3
            className={cn(
              "font-serif font-light leading-[1.05] tracking-tight text-fg",
              variant === "featured" ? "text-3xl md:text-5xl" : "text-3xl md:text-4xl",
            )}
          >
            {content.title}
          </h3>
          {content.year ? <span className="eyebrow shrink-0">{content.year}</span> : null}
        </div>
        {content.subtitle ? <p className="mt-2 text-[15px] text-fg">{content.subtitle}</p> : null}
        {meta.length ? <p className="eyebrow mt-3">{meta.join("  ·  ")}</p> : null}
      </Link>
    </Reveal>
  );
}
