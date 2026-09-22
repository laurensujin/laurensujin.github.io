import type { MediaRef } from "@/lib/content/schema";
import type { SiteSettings } from "@/lib/data/types";
import { Container } from "./Container";
import { MediaImage } from "./MediaImage";
import { PlaceholderArt } from "./PlaceholderArt";

interface Props {
  settings: SiteSettings;
  /** Hero image from settings, or a featured project's cover as a fallback. */
  visual?: MediaRef | null;
  preview?: boolean;
}

/**
 * Landing: the headline and the picture share one row on the page colour,
 * bottom-aligned so the type sits on the same line as the image edge.
 * Copy and the image are editable under Admin → Homepage.
 */
export function Hero({ settings, visual, preview }: Props) {
  const lines = settings.heroHeadline.split("\n").filter((l) => l.trim().length);

  return (
    <section id="hero" className={preview ? "relative" : "relative pt-16"} aria-label="Introduction">
      <Container className="grid items-end gap-10 py-12 md:grid-cols-12 md:gap-12 md:py-16">
        <div className={visual ? "md:col-span-5" : "md:col-span-8"}>
          <h1 className="t-display enter-up max-w-[15ch] text-balance text-fg">
            {lines.map((line, index) => (
              <span key={index} className="block">
                {line}
              </span>
            ))}
          </h1>

          {settings.heroDescription ? (
            <p className="t-body enter-up mt-6 max-w-[38ch] text-fg-muted" style={{ ["--delay" as string]: 90 }}>
              {settings.heroDescription}
            </p>
          ) : null}

          <div
            className="enter-up mt-10 flex flex-wrap items-center gap-x-8 gap-y-3 border-t border-line pt-5"
            style={{ ["--delay" as string]: 160 }}
          >
            {settings.heroCtaLabel ? (
              <a href="#work" className="link-line eyebrow inline-flex items-center gap-2 text-fg">
                {settings.heroCtaLabel}
                <span aria-hidden>↓</span>
              </a>
            ) : null}
            {settings.heroLocation ? <p className="eyebrow">{settings.heroLocation}</p> : null}
          </div>
        </div>

        <div
          className={`enter-up relative aspect-[4/3] overflow-hidden bg-bg-elevated ${visual ? "md:col-span-7" : "md:col-span-4"}`}
          style={{ ["--delay" as string]: 120 }}
        >
          {visual ? (
            <MediaImage media={visual} fill priority quality={85} sizes="(min-width: 768px) 58vw, 100vw" className="object-[70%_78%]" />
          ) : (
            <PlaceholderArt seed={settings.siteName} frame={false} />
          )}
        </div>
      </Container>
    </section>
  );
}
