"use client";

import { useState } from "react";
import type { PhotographySet } from "@/lib/data/types";
import { Lightbox } from "./Lightbox";
import { MediaImage } from "./MediaImage";
import { Reveal } from "./Reveal";

/** Grid of photo sets that opens a lightbox with the before/after slider. */
export function MediaGallery({ sets }: { sets: PhotographySet[] }) {
  const [active, setActive] = useState<number | null>(null);

  return (
    <>
      <ul className="mt-8 grid grid-cols-2 gap-x-6 gap-y-10 md:grid-cols-3 md:gap-x-8 md:gap-y-12">
        {sets.map((set, index) => {
          const preview = set.after ?? set.before!;
          return (
            <Reveal as="li" key={set.id} className="list-none">
              <button
                type="button"
                onClick={() => setActive(index)}
                className="image-hover group relative block aspect-[3/2] w-full cursor-pointer overflow-hidden bg-bg-elevated text-left"
                aria-label={`Open ${set.title || "photograph"}${set.before && set.after ? ", before and after" : ""}`}
              >
                <MediaImage media={preview} fill sizes="(min-width: 768px) 33vw, 50vw" />
                {set.before && set.after ? (
                  <span className="eyebrow absolute bottom-3 left-3 bg-bg/85 px-2 py-1 text-fg opacity-0 backdrop-blur-sm transition-opacity duration-300 group-hover:opacity-100 group-focus-visible:opacity-100">
                    Before / After
                  </span>
                ) : null}
              </button>
              {set.title ? <p className="t-title mt-4 border-t border-line pt-3 text-fg">{set.title}</p> : null}
            </Reveal>
          );
        })}
      </ul>
      <Lightbox sets={sets} index={active} onClose={() => setActive(null)} onNavigate={setActive} />
    </>
  );
}
