"use client";

import { useId, useState } from "react";
import type { MediaRef } from "@/lib/content/schema";
import { refAspect } from "@/lib/media/url";
import { cn } from "@/lib/utils";
import { MediaImage } from "./MediaImage";

interface Props {
  before: MediaRef | null;
  after: MediaRef | null;
  beforeLabel?: string;
  afterLabel?: string;
  sizes?: string;
  className?: string;
  /** Force an aspect ratio (width / height); defaults to the after image's ratio. */
  aspect?: number;
}

/**
 * Drag (mouse or touch) or use the arrow keys to compare two images.
 * A transparent range input covers the image, which gives us dragging,
 * touch and keyboard support for free.
 */
export function BeforeAfterSlider({ before, after, beforeLabel = "Before", afterLabel = "After", sizes = "100vw", className, aspect }: Props) {
  const [position, setPosition] = useState(50);
  const labelId = useId();
  const ratio = aspect ?? refAspect(after ?? before, 4 / 5);

  if (!before && !after) return null;

  // With only one image there is nothing to compare: show it plainly.
  if (!before || !after) {
    const only = (after ?? before)!;
    return (
      <div className={cn("relative w-full overflow-hidden bg-bg-elevated", className)} style={{ aspectRatio: ratio }}>
        <MediaImage media={only} fill sizes={sizes} />
      </div>
    );
  }

  return (
    <div className={cn("relative w-full select-none overflow-hidden bg-bg-elevated", className)} style={{ aspectRatio: ratio }}>
      <MediaImage media={after} fill sizes={sizes} alt={after.alt || afterLabel} />
      <div className="absolute inset-0" style={{ clipPath: `inset(0 ${100 - position}% 0 0)` }} aria-hidden>
        <MediaImage media={before} fill sizes={sizes} alt="" />
      </div>

      <span className="eyebrow pointer-events-none absolute left-3 top-3 bg-bg/80 px-2 py-1 text-fg backdrop-blur-sm" aria-hidden>
        {beforeLabel}
      </span>
      <span className="eyebrow pointer-events-none absolute right-3 top-3 bg-bg/80 px-2 py-1 text-fg backdrop-blur-sm" aria-hidden>
        {afterLabel}
      </span>

      <input
        type="range"
        min={0}
        max={100}
        step={0.5}
        value={position}
        onChange={(e) => setPosition(Number(e.target.value))}
        aria-label={`Compare ${beforeLabel} and ${afterLabel}`}
        aria-describedby={labelId}
        className="compare-range absolute inset-0 z-10 m-0 h-full w-full"
      />
      <span id={labelId} className="sr-only">
        Drag or use the arrow keys to reveal more of the before or after image.
      </span>

      <div className="compare-handle pointer-events-none absolute inset-y-0 w-px bg-bg" style={{ left: `${position}%` }} aria-hidden>
        <div className="absolute left-1/2 top-1/2 flex h-10 w-10 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-bg/70 bg-fg/70 text-bg shadow-md backdrop-blur-sm">
          <svg width="16" height="10" viewBox="0 0 16 10" fill="none" stroke="currentColor" strokeWidth="1.25">
            <path d="M5 1 1 5l4 4M11 1l4 4-4 4" />
          </svg>
        </div>
      </div>
    </div>
  );
}
