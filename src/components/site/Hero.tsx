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
 * Landing: the headline and the picture sit on one row, on the page colour.
 * Copy and the image are editable under Admin → Homepage.
 */
export function Hero({ settings, visual, preview }: Props) {
  const lines = settings.heroHeadline.split("\n").filter((l) => l.trim().length);

  return (
    <section id="hero" className={preview ? "relative" : "relative pt-14"} aria-label="Introduction">
      <Container className="grid items-end gap-8 py-8 md:grid-cols-12 md:gap-10 md:py-12">
        <div className={visual ? "md:col-span-5" : "md:col-span-8"}>
          <h1 className="max-w-[14ch] font-serif text-[clamp(2.1rem,4vw,3.4rem)] font-medium leading-[1.02] tracking-[-0.03em] text-fg">
            {lines.map((line, index) => (
              <span key={index} className="hero-line block">
                <span style={{ ["--i" as string]: index }}>{line}</span>
              </span>
            ))}
          </h1>
          {settings.heroDescription ? <p className="mt-4 max-w-[34ch] text-sm leading-relaxed text-fg-muted">{settings.heroDescription}</p> : null}
          <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm">
            {settings.heroCtaLabel ? (
              <a href="#work" className="link-line inline-flex items-center gap-2 font-medium text-fg">
                {settings.heroCtaLabel}
                <span aria-hidden>↓</span>
              </a>
            ) : null}
            {settings.heroLocation ? <p className="text-fg-muted">{settings.heroLocation}</p> : null}
          </div>
        </div>
        <div className={`hero-visual relative aspect-[4/3] overflow-hidden bg-bg-elevated ${visual ? "md:col-span-7" : "md:col-span-4"}`}>
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
