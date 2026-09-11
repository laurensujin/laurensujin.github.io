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

/** Small text toggle in the footer. Remembers the choice in localStorage. */
export function ThemeToggle() {
  const theme = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const toggle = () => {
    const next: Theme = getSnapshot() === "dark" ? "light" : "dark";
    document.documentElement.classList.toggle("dark", next === "dark");
    try {
      localStorage.setItem("theme", next);
    } catch {
      // Private mode etc. - the choice just will not persist.
    }
  };

  return (
    <button
      type="button"
      onClick={toggle}
      className="eyebrow link-line inline-flex cursor-pointer items-center gap-2 text-fg"
      aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
    >
      <span aria-hidden className="inline-block h-2 w-2 rounded-full border border-current" style={{ background: theme === "dark" ? "currentColor" : "transparent" }} />
      {theme === "dark" ? "Dark" : "Light"}
    </button>
  );
}
