"use client";

import { useCallback, useEffect, useId, useRef } from "react";
import type { ProfileData, SocialLink } from "@/lib/data/types";
import { mediaUrl } from "@/lib/media/url";
import { cn, isSafeUrl } from "@/lib/utils";
import { useDrawer } from "./DrawerProvider";
import { MediaImage } from "./MediaImage";

const FOCUSABLE = 'a[href], button:not([disabled]), input, textarea, select, [tabindex]:not([tabindex="-1"])';

function linkHref(link: SocialLink): string | null {
  const value = link.url.trim();
  if (!value) return null;
  if (link.kind === "email") return value.startsWith("mailto:") ? value : `mailto:${value}`;
  return isSafeUrl(value) ? value : null;
}

/**
 * Right-side panel with the profile. Opens over the current page without
 * navigating, traps focus while open, closes with Escape or the overlay.
 */
export function ProfileDrawer({ data }: { data: ProfileData }) {
  const { open, closeDrawer, triggerRef } = useDrawer();
  const panelRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const scrollYRef = useRef(0);
  const titleId = useId();
  const { profile, education, links, resume } = data;

  // Lock page scrolling without losing the scroll position (works on iOS too).
  useEffect(() => {
    if (!open) return;
    scrollYRef.current = window.scrollY;
    const body = document.body;
    const html = document.documentElement;
    body.style.position = "fixed";
    body.style.top = `-${scrollYRef.current}px`;
    body.style.left = "0";
    body.style.right = "0";
    body.style.width = "100%";
    return () => {
      body.style.position = "";
      body.style.top = "";
      body.style.left = "";
      body.style.right = "";
      body.style.width = "";
      const previous = html.style.scrollBehavior;
      html.style.scrollBehavior = "auto";
      window.scrollTo(0, scrollYRef.current);
      html.style.scrollBehavior = previous;
    };
  }, [open]);

  // Move focus into the panel when it opens, back to the trigger when it closes.
  useEffect(() => {
    if (open) {
      const frame = requestAnimationFrame(() => closeRef.current?.focus());
      return () => cancelAnimationFrame(frame);
    }
    triggerRef.current?.focus();
  }, [open, triggerRef]);

  // Escape closes the drawer wherever focus happens to be.
  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        closeDrawer();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, closeDrawer]);

  // Keep Tab cycling inside the panel while it is open.
  const onKeyDown = useCallback(
    (event: React.KeyboardEvent) => {
      if (event.key !== "Tab" || !panelRef.current) return;
      const focusable = Array.from(panelRef.current.querySelectorAll<HTMLElement>(FOCUSABLE));
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    },
    [],
  );

  const visibleLinks = links.filter((l) => l.showInProfile && linkHref(l));

  return (
    <div
      // After closing, the whole overlay becomes visibility:hidden once the
      // slide-out animation has finished (600ms), so it cannot be focused.
      className={cn(
        "fixed inset-0 z-50 transition-[visibility] duration-0",
        open ? "visible pointer-events-auto delay-0" : "invisible pointer-events-none delay-[600ms]",
      )}
      aria-hidden={!open}
      onKeyDown={onKeyDown}
    >
      {/* Overlay */}
      <button
        type="button"
        tabIndex={-1}
        aria-label="Close profile"
        onClick={closeDrawer}
        className={cn(
          "absolute inset-0 bg-fg/30 transition-opacity duration-500 ease-[var(--ease-editorial)]",
          open ? "opacity-100" : "opacity-0",
        )}
      />

      {/* Panel */}
      <div
        ref={panelRef}
        id="profile-drawer"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className={cn(
          "absolute inset-y-0 right-0 flex w-full flex-col overflow-y-auto overscroll-contain bg-bg shadow-2xl shadow-black/10",
          "sm:w-[min(30rem,100%)] lg:w-[38vw] lg:min-w-[28rem] lg:max-w-[36rem]",
          "transition-transform duration-600 ease-[var(--ease-editorial)]",
          open ? "translate-x-0" : "translate-x-full",
        )}
      >
        <div className="flex items-center justify-between px-6 pt-5 md:px-10">
          <span className="eyebrow">Profile</span>
          <button
            ref={closeRef}
            type="button"
            onClick={closeDrawer}
            className="eyebrow link-line -mr-1 inline-flex cursor-pointer items-center gap-2 p-1 text-fg"
          >
            Close
            <span aria-hidden className="text-base leading-none">
              ×
            </span>
          </button>
        </div>

        <div className="px-6 pb-16 pt-10 md:px-10">
          {profile.image ? (
            <div className="relative aspect-[4/5] w-full max-w-[22rem] overflow-hidden bg-bg-elevated">
              <MediaImage media={profile.image} fill sizes="(min-width: 1024px) 24rem, 90vw" />
            </div>
          ) : null}

          <h2 id={titleId} className="mt-8 font-serif text-5xl font-light leading-none tracking-tight md:text-6xl">
            {profile.name}
          </h2>
          {profile.title ? <p className="mt-4 text-[15px] text-fg">{profile.title}</p> : null}
          {profile.location ? <p className="mt-1 text-[15px] text-fg-muted">{profile.location}</p> : null}

          {profile.about ? (
            <section className="mt-12 border-t border-line pt-6">
              <h3 className="eyebrow">About</h3>
              <p className="mt-4 whitespace-pre-line text-[15px] leading-relaxed text-fg">{profile.about}</p>
            </section>
          ) : null}

          {education.length ? (
            <section className="mt-12 border-t border-line pt-6">
              <h3 className="eyebrow">Education</h3>
              <ul className="mt-4 space-y-5">
                {education.map((e) => (
                  <li key={e.id} className="text-[15px] leading-relaxed">
                    {e.school ? <p className="text-fg">{e.school}</p> : null}
                    {e.college ? <p className="text-fg-muted">{e.college}</p> : null}
                    {e.degree || e.major ? (
                      <p className="mt-2 text-fg">{[e.degree, e.major].filter(Boolean).join(" in ")}</p>
                    ) : null}
                    {e.graduation ? <p className="text-fg-muted">{e.graduation}</p> : null}
                  </li>
                ))}
              </ul>
            </section>
          ) : null}

          {visibleLinks.length || resume ? (
            <section className="mt-12 border-t border-line pt-6">
              <h3 className="eyebrow">Links</h3>
              <ul className="mt-4 space-y-3">
                {visibleLinks.map((link) => {
                  const href = linkHref(link)!;
                  const external = !href.startsWith("mailto:");
                  return (
                    <li key={link.id}>
                      <a
                        href={href}
                        target={external ? "_blank" : undefined}
                        rel={external ? "noopener noreferrer" : undefined}
                        className="link-line inline-flex items-center gap-2 text-[15px] text-fg"
                      >
                        {link.label}
                        <span aria-hidden className="text-fg-muted">
                          ↗
                        </span>
                      </a>
                    </li>
                  );
                })}
                {resume ? (
                  <li>
                    <a
                      href={mediaUrl(resume.path)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="link-line inline-flex items-center gap-2 text-[15px] text-fg"
                    >
                      Resume
                      <span aria-hidden className="text-fg-muted">
                        ↗
                      </span>
                    </a>
                  </li>
                ) : null}
              </ul>
            </section>
          ) : null}
        </div>
      </div>
    </div>
  );
}
