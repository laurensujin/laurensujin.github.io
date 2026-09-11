"use client";

import Image from "next/image";
import type { MediaRef } from "@/lib/content/schema";
import { imageSrc, refUrl } from "@/lib/media/url";
import { cn } from "@/lib/utils";
import { IconFile, IconVideo } from "./icons";

/** Small preview of any media reference for admin lists and pickers. */
export function MediaThumb({ media, className, sizes = "200px" }: { media: MediaRef | null; className?: string; sizes?: string }) {
  const url = refUrl(media);
  return (
    <div className={cn("relative flex items-center justify-center overflow-hidden bg-neutral-100 text-neutral-400", className)}>
      {!media || !url ? null : media.kind === "image" ? (
        <Image src={imageSrc(media) ?? url} alt={media.alt || ""} fill sizes={sizes} className="object-cover" />
      ) : media.kind === "video" ? (
        <>
          <video src={url} muted playsInline preload="metadata" className="absolute inset-0 h-full w-full object-cover" />
          <IconVideo className="relative z-10 rounded bg-white/80 p-0.5 text-neutral-700" width={20} height={20} />
        </>
      ) : (
        <IconFile width={22} height={22} />
      )}
    </div>
  );
}
