import type { MediaRef } from "@/lib/content/schema";
import type { SiteSettings } from "@/lib/data/types";
import { splitList } from "@/lib/utils";
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
 * Landing section: a short picture, then the headline on the page colour
 * (never knocked out of a dark scrim). Copy and the image are editable
 * under Admin → Homepage. The crop sits on the lower part of the image.
 */
export function Hero({ settings, visual, preview }: Props) {
  const lines = settings.heroHeadline.split("\n").filter((l) => l.trim().length);
  const ticker = splitList(settings.heroTicker.replace(/·/g, ","));

  return (
    <>
      <section id="hero" className={preview ? "relative" : "relative pt-14"} aria-label="Introduction">
        <div
          className={
            preview
              ? "hero-visual relative h-56 overflow-hidden bg-bg-elevated"
              : "hero-visual relative h-[min(38vh,20rem)] min-h-[11rem] overflow-hidden bg-bg-elevated"
          }
        >
          {visual ? (
            <MediaImage media={visual} fill priority quality={85} sizes="100vw" className="object-[70%_78%]" />
          ) : (
            <PlaceholderArt seed={settings.siteName} frame={false} />
          )}
        </div>

        <Container className="py-8 md:py-10">
          <h1 className="max-w-[16ch] font-serif text-[clamp(2rem,4vw,3.15rem)] font-medium leading-[1.08] tracking-[-0.03em] text-fg">
            {lines.map((line, index) => (
              <span key={index} className="hero-line block">
                <span style={{ ["--i" as string]: index }}>{line}</span>
              </span>
            ))}
          </h1>
          <div className="mt-5 flex flex-wrap items-center justify-between gap-4">
            {settings.heroCtaLabel ? (
              <a href="#work" className="link-line inline-flex items-center gap-2 text-sm font-medium text-fg">
                {settings.heroCtaLabel}
                <span aria-hidden>↓</span>
              </a>
            ) : (
              <span />
            )}
            {settings.heroLocation ? <p className="text-sm text-fg-muted">{settings.heroLocation}</p> : null}
          </div>
        </Container>
      </section>

      {ticker.length ? (
        <Container>
          <p className="flex flex-wrap gap-x-3 gap-y-1 border-y border-line py-3 text-sm text-fg-muted" aria-label={ticker.join(", ")}>
            {ticker.map((item, index) => (
              <span key={`${item}-${index}`}>
                {item}
                {index < ticker.length - 1 ? <span className="ml-3 text-accent">/</span> : null}
              </span>
            ))}
          </p>
        </Container>
      ) : null}

      {settings.heroDescription ? (
        <Container>
          <p className="max-w-[42ch] py-8 text-base leading-relaxed text-fg-muted md:py-10">{settings.heroDescription}</p>
        </Container>
      ) : null}
    </>
  );
}
