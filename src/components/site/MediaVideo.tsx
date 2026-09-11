import type { MediaRef } from "@/lib/content/schema";
import { refUrl } from "@/lib/media/url";
import { cn } from "@/lib/utils";

interface Props {
  media: MediaRef;
  poster?: MediaRef | null;
  autoplay?: boolean;
  loop?: boolean;
  className?: string;
}

/** Uploaded video. Autoplaying videos are muted so browsers allow them. */
export function MediaVideo({ media, poster, autoplay = true, loop = true, className }: Props) {
  const src = refUrl(media);
  if (!src) return null;
  const posterUrl = refUrl(poster) ?? undefined;

  return (
    <video
      src={src}
      poster={posterUrl}
      autoPlay={autoplay}
      muted={autoplay}
      loop={loop}
      playsInline
      controls={!autoplay}
      preload={autoplay ? "auto" : "metadata"}
      className={cn("h-auto w-full", className)}
      aria-label={media.alt || undefined}
    />
  );
}
