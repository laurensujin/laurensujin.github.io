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
  className?: string;
  priority?: boolean;
}

/** One picture in the wall of work, with its project name underneath. */
export function ProjectPreview({ project, media, className, priority }: Props) {
  const { content, slug } = project;
  const image = media ?? content.cover;

  return (
    <Reveal as="li" className={cn("list-none", className)}>
      <Link href={`/work/${slug}`} className="group block">
        <div className="image-hover relative aspect-square w-full overflow-hidden bg-bg-elevated">
          {image ? (
            <MediaImage
              media={image}
              fill
              priority={priority}
              sizes="(min-width: 1024px) 25vw, (min-width: 768px) 33vw, 50vw"
              className="object-center"
            />
          ) : (
            <EmptyCover title={content.title} />
          )}
          {content.coverVideo && image?.path === content.cover?.path ? (
            <div className="absolute inset-0">
              <MediaVideo media={content.coverVideo} poster={content.cover} className="h-full w-full object-cover" />
            </div>
          ) : null}
        </div>
        <h3 className="t-body mt-2.5 text-fg decoration-1 underline-offset-4 group-hover:underline">{content.title}</h3>
      </Link>
    </Reveal>
  );
}
