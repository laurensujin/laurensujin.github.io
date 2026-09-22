"use client";

import { useSyncExternalStore } from "react";

type Theme = "light" | "dark";

/** The theme lives on <html class="dark">; watch it so the label stays in sync. */
function subscribe(callback: () => void) {
  const observer = new MutationObserver(callback);
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
  return () => observer.disconnect();
}

function getSnapshot(): Theme {
  return document.documentElement.classList.contains("dark") ? "dark" : "light";
}

function getServerSnapshot(): Theme | null {
  return null;
}

/**
 * Two words in a hairline frame, the current one marked. Reads as a setting
 * rather than a control, which is all it needs to be down in the footer.
 */
export function ThemeToggle() {
  const theme = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const set = (next: Theme) => {
    document.documentElement.classList.toggle("dark", next === "dark");
    try {
      localStorage.setItem("theme", next);
    } catch {
      // Private mode etc. - the choice just will not persist.
    }
  };

  return (
    <div className="inline-flex border border-line" role="group" aria-label="Colour theme">
      {(["light", "dark"] as const).map((option) => {
        // Before hydration the theme is unknown, so neither option is marked.
        const active = theme === option;
        return (
          <button
            key={option}
            type="button"
            onClick={() => set(option)}
            aria-pressed={theme === null ? undefined : active}
            className={`eyebrow cursor-pointer px-3 py-2 transition-colors duration-200 ${
              active ? "bg-fg text-bg" : "text-fg-muted hover:text-fg"
            }`}
          >
            {option}
          </button>
        );
      })}
    </div>
  );
}
