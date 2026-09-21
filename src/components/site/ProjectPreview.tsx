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

/** Card in the Selected Work grid: a modest picture, the title, one line. */
export function ProjectPreview({ project, variant, className, priority }: Props) {
  const { content, slug } = project;
  const line = (content.subtitle || content.categories[0] || "").split(/[·•]/)[0].trim();

  return (
    <Reveal as="li" className={cn("list-none", className)}>
      <Link href={`/work/${slug}`} className="group block">
        <div className="image-hover relative aspect-[3/2] w-full overflow-hidden bg-bg-elevated">
          {content.cover ? (
            <MediaImage
              media={content.cover}
              fill
              priority={priority}
              sizes={variant === "featured" ? "(min-width: 1024px) 33vw, 100vw" : "(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"}
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

        <h3 className="mt-3 font-serif text-lg font-medium leading-tight text-fg">{content.title}</h3>
        {line ? <p className="mt-1 line-clamp-1 text-sm text-fg-muted">{line}</p> : null}
      </Link>
    </Reveal>
  );
}
