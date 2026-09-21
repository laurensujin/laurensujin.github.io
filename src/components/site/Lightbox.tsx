"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { PhotographySet } from "@/lib/data/types";
import { cn } from "@/lib/utils";
import { BeforeAfterSlider } from "./BeforeAfterSlider";

interface Props {
  sets: PhotographySet[];
  index: number | null;
  onClose: () => void;
  onNavigate: (index: number) => void;
}

/** Full-screen viewer for photography sets with keyboard and swipe navigation. */
export function Lightbox({ sets, index, onClose, onNavigate }: Props) {
  const open = index !== null;
  const set = index !== null ? sets[index] : null;
  const closeRef = useRef<HTMLButtonElement>(null);
  const touchStart = useRef<number | null>(null);
  // View mode resets to "compare" whenever a different set is shown.
  const [modeState, setModeState] = useState<{ index: number | null; mode: "compare" | "after" | "before" }>({ index: null, mode: "compare" });
  const mode = modeState.index === index ? modeState.mode : "compare";
  const setMode = (next: "compare" | "after" | "before") => setModeState({ index, mode: next });

  const go = useCallback(
    (delta: number) => {
      if (index === null || sets.length < 2) return;
      onNavigate((index + delta + sets.length) % sets.length);
    },
    [index, sets.length, onNavigate],
  );

  useEffect(() => {
    if (!open) return;
    const previous = document.documentElement.style.overflow;
    document.documentElement.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") go(1);
      if (e.key === "ArrowLeft") go(-1);
    };
    window.addEventListener("keydown", onKey);
    const t = window.setTimeout(() => closeRef.current?.focus(), 30);
    return () => {
      document.documentElement.style.overflow = previous;
      window.removeEventListener("keydown", onKey);
      window.clearTimeout(t);
    };
  }, [open, onClose, go]);

  if (!open || !set) return null;
  const hasBoth = Boolean(set.before && set.after);
  const credits = [
    set.photographerCredit ? `Photography: ${set.photographerCredit}` : null,
    set.retouchingCredit ? `Retouching: ${set.retouchingCredit}` : null,
  ].filter(Boolean);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={set.title || "Photograph"}
      className="fixed inset-0 z-[60] flex flex-col bg-bg text-fg"
      onTouchStart={(e) => (touchStart.current = e.touches[0].clientX)}
      onTouchEnd={(e) => {
        if (touchStart.current === null) return;
        const dx = e.changedTouches[0].clientX - touchStart.current;
        if (Math.abs(dx) > 60) go(dx < 0 ? 1 : -1);
        touchStart.current = null;
      }}
    >
      <div className="flex items-center justify-between px-6 py-5 md:px-10">
        <p className="eyebrow">
          {String(index! + 1).padStart(2, "0")} / {String(sets.length).padStart(2, "0")}
        </p>
        <div className="flex items-center gap-6">
          {hasBoth ? (
            <div className="hidden items-center gap-4 sm:flex" role="group" aria-label="View mode">
              {(["compare", "before", "after"] as const).map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setMode(m)}
                  className={cn("eyebrow cursor-pointer", mode === m ? "text-fg underline underline-offset-4" : "text-fg-muted")}
                >
                  {m}
                </button>
              ))}
            </div>
          ) : null}
          <button ref={closeRef} type="button" onClick={onClose} className="eyebrow link-line inline-flex cursor-pointer items-center gap-2 text-fg">
            Close <span aria-hidden className="text-base leading-none">×</span>
          </button>
        </div>
      </div>

      <div className="relative flex flex-1 items-center justify-center px-6 pb-4 md:px-16">
        {sets.length > 1 ? (
          <>
            <button type="button" onClick={() => go(-1)} aria-label="Previous" className="absolute left-2 top-1/2 hidden -translate-y-1/2 cursor-pointer p-3 text-2xl text-fg-muted hover:text-fg md:block">
              ←
            </button>
            <button type="button" onClick={() => go(1)} aria-label="Next" className="absolute right-2 top-1/2 hidden -translate-y-1/2 cursor-pointer p-3 text-2xl text-fg-muted hover:text-fg md:block">
              →
            </button>
          </>
        ) : null}

        <div className="max-h-[calc(100svh-11rem)] w-full max-w-[min(90vw,calc((100svh-11rem)*var(--ratio)))]" style={{ "--ratio": ratioOf(set) } as React.CSSProperties}>
          <BeforeAfterSlider
            key={`${set.id}-${mode}`}
            before={mode === "after" ? null : set.before}
            after={mode === "before" ? null : set.after}
            sizes="90vw"
          />
        </div>
      </div>

      <div className="px-6 pb-6 md:px-10">
        {set.title ? <p className="font-serif text-xl font-medium">{set.title}</p> : null}
        {set.caption ? <p className="mt-1 max-w-[60ch] text-sm text-fg-muted">{set.caption}</p> : null}
        {credits.length ? <p className="eyebrow mt-3">{credits.join("   ·   ")}</p> : null}
      </div>
    </div>
  );
}

function ratioOf(set: PhotographySet): number {
  const ref = set.after ?? set.before;
  return ref?.width && ref?.height ? ref.width / ref.height : 4 / 5;
}
