import Link from "next/link";
import type { MediaRef } from "@/lib/content/schema";
import type { PublicProject } from "@/lib/data/types";
import { cn } from "@/lib/utils";
import { EmptyCover } from "./EmptyCover";
import { MediaImage } from "./MediaImage";
import { MediaVideo } from "./MediaVideo";
import { Reveal } from "./Reveal";

interface Props {
  project: PublicProject;
  /** A specific uploaded picture. Falls back to the project cover. */
  media?: MediaRef | null;
  /** Position in the grid, printed as the tile's index. */
  index: number;
  className?: string;
  priority?: boolean;
}

/** Longest discipline label a tile will print before dropping it, so the
 *  title always keeps the room it needs. */
const META_MAX = 24;

/** One picture in Selected Work: index, name and discipline on one ruled row. */
export function ProjectPreview({ project, media, index, className, priority }: Props) {
  const { content, slug } = project;
  const image = media ?? content.cover;
  const meta = [content.categories[0], content.subtitle.split("·")[0]]
    .map((value) => (value ?? "").trim())
    .find((value) => value.length > 0 && value.length <= META_MAX);

  return (
    <Reveal as="li" className={cn("list-none", className)}>
      <Link href={`/work/${slug}`} className="group block">
        <div className="image-hover relative aspect-[4/3] w-full overflow-hidden bg-bg-elevated">
          {image ? (
            <MediaImage media={image} fill priority={priority} sizes="(min-width: 640px) 50vw, 100vw" className="object-center" />
          ) : (
            <EmptyCover title={content.title} />
          )}
          {content.coverVideo && image?.path === content.cover?.path ? (
            <div className="absolute inset-0">
              <MediaVideo media={content.coverVideo} poster={content.cover} className="h-full w-full object-cover" />
            </div>
          ) : null}
        </div>

        <div className="mt-4 flex items-baseline gap-4 border-t border-line pt-3">
          <span className="eyebrow tabular-nums">{String(index + 1).padStart(2, "0")}</span>
          <h3 className="t-title min-w-0 flex-1 text-fg decoration-1 underline-offset-[6px] group-hover:underline">{content.title}</h3>
          {meta ? <span className="eyebrow shrink-0">{meta}</span> : null}
        </div>
      </Link>
    </Reveal>
  );
}
