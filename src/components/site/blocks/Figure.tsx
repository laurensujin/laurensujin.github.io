import type { MediaRef } from "@/lib/content/schema";
import { cn } from "@/lib/utils";
import { MediaImage } from "../MediaImage";
import { MediaVideo } from "../MediaVideo";

interface Props {
  media: MediaRef | null;
  caption?: string;
  tag?: string;
  sizes: string;
  className?: string;
  /** Crop to a fixed ratio instead of using the image's own ratio. */
  aspect?: "natural" | "square" | "portrait" | "landscape";
  priority?: boolean;
}

const ASPECT: Record<NonNullable<Props["aspect"]>, string> = {
  natural: "",
  square: "aspect-square",
  portrait: "aspect-[4/5]",
  landscape: "aspect-[3/2]",
};

/** Image (or video) with an optional small tag and caption underneath. */
export function Figure({ media, caption, tag, sizes, className, aspect = "natural", priority }: Props) {
  if (!media) return null;
  const cropped = aspect !== "natural";

  return (
    <figure className={className}>
      <div className={cn("relative w-full overflow-hidden bg-bg-elevated", cropped && ASPECT[aspect])}>
        {media.kind === "video" ? (
          <MediaVideo media={media} className={cropped ? "absolute inset-0 h-full w-full object-cover" : undefined} />
        ) : (
          <MediaImage media={media} sizes={sizes} fill={cropped} priority={priority} />
        )}
      </div>
      {caption || tag ? (
        <figcaption className="mt-3 flex flex-wrap items-baseline gap-x-4 gap-y-1">
          {tag ? <span className="eyebrow text-fg">{tag}</span> : null}
          {caption ? <span className="text-sm text-fg-muted">{caption}</span> : null}
        </figcaption>
      ) : null}
    </figure>
  );
}
