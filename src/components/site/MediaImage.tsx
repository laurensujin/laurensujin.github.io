import Image from "next/image";
import type { MediaRef } from "@/lib/content/schema";
import { imageSrc } from "@/lib/media/url";
import { cn } from "@/lib/utils";

interface Props {
  media: MediaRef;
  /** Responsive hint for next/image, e.g. "(min-width: 768px) 50vw, 100vw". */
  sizes: string;
  className?: string;
  fill?: boolean;
  priority?: boolean;
  quality?: number;
  alt?: string;
}

/**
 * Renders an uploaded image through next/image. The custom image loader
 * (src/lib/media/image-loader.ts) serves the resized copy that fits the
 * requested width, so visitors never download more pixels than needed.
 */
export function MediaImage({ media, sizes, className, fill, priority, quality = 85, alt }: Props) {
  const src = imageSrc(media);
  if (!src) return null;
  const altText = alt ?? media.alt ?? "";

  if (fill || !media.width || !media.height) {
    return (
      <Image
        src={src}
        alt={altText}
        fill
        sizes={sizes}
        priority={priority}
        quality={quality}
        className={cn("object-cover", className)}
      />
    );
  }

  return (
    <Image
      src={src}
      alt={altText}
      width={media.width}
      height={media.height}
      sizes={sizes}
      priority={priority}
      quality={quality}
      className={cn("h-auto w-full", className)}
    />
  );
}
