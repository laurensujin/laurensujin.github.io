import type { MediaRef } from "@/lib/content/schema";
import type { SiteSettings } from "@/lib/data/types";
import { splitList } from "@/lib/utils";
import { Container } from "./Container";
import { MediaImage } from "./MediaImage";
import { PlaceholderArt, monogramFor } from "./PlaceholderArt";

interface Props {
  settings: SiteSettings;
  /** Hero image from settings, or a featured project's cover as a fallback. */
  visual?: MediaRef | null;
  preview?: boolean;
}

/**
 * Landing section, magazine-cover style: a full-bleed visual with the
 * headline set over its lower edge, then a slow line of disciplines and a
 * short introduction. All copy and the image are editable under Admin → Homepage.
 *
 * Height is capped so large screens don't get a full-viewport slab of empty
 * photograph; the crop sits on the lower part of the image (linen, vessel).
 */
export function Hero({ settings, visual, preview }: Props) {
  const lines = settings.heroHeadline.split("\n").filter((l) => l.trim().length);
  const ticker = splitList(settings.heroTicker.replace(/·/g, ","));

  return (
    <>
      <section
        id="hero"
        className={preview ? "relative h-[34rem] overflow-hidden" : "relative h-[min(80svh,44rem)] min-h-[24rem] overflow-hidden"}
        aria-label="Introduction"
      >
        {/* Visual */}
        <div className="hero-visual absolute inset-0 bg-bg-elevated">
          {visual ? (
            <MediaImage media={visual} fill priority quality={85} sizes="100vw" className="object-[70%_78%]" />
          ) : (
            <PlaceholderArt seed={settings.siteName} monogram={monogramFor(settings.siteName)} frame={false} />
          )}
          {/* Scrims keep the header and headline readable on any image. */}
          <div aria-hidden className="absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-black/30 to-transparent" />
          <div aria-hidden className="absolute inset-x-0 bottom-0 h-[58%] bg-gradient-to-t from-black/65 via-black/25 to-transparent" />
        </div>

        {/* Copy */}
        <Container className={preview ? "relative flex h-full flex-col justify-end pb-10" : "relative flex h-full flex-col justify-end pb-10 pt-28 md:pb-12"}>
          <h1 className="hero-headline max-w-[30ch] font-serif text-[clamp(2.4rem,4.6vw,4.75rem)] font-light leading-[1] tracking-[-0.02em] text-[#f5f2ec]">
            {lines.map((line, index) => (
              <span key={index} className="hero-line block">
                <span style={{ ["--i" as string]: index }}>{line}</span>
              </span>
            ))}
          </h1>
          <div className="mt-8 flex flex-wrap items-end justify-between gap-6">
            {settings.heroCtaLabel ? (
              <a href="#work" className="eyebrow link-line inline-flex items-center gap-3 text-[#f5f2ec]">
                {settings.heroCtaLabel}
                <span aria-hidden className="text-sm">
                  ↓
                </span>
              </a>
            ) : (
              <span />
            )}
            {settings.heroLocation ? <p className="eyebrow text-[#f5f2ec]/80">{settings.heroLocation}</p> : null}
          </div>
        </Container>
      </section>

      {ticker.length ? (
        <div className="ticker border-b border-line py-4" aria-label={ticker.join(", ")}>
          <div className="ticker-track" aria-hidden>
            {[0, 1].map((copy) => (
              <span key={copy} className="flex shrink-0 items-center">
                {ticker.map((item, index) => (
                  <span key={`${copy}-${index}`} className="flex items-center">
                    <span className="font-serif text-2xl font-light italic text-fg md:text-[2rem]">{item}</span>
                    <span className="mx-8 h-1 w-1 rounded-full bg-fg-faint md:mx-12" />
                  </span>
                ))}
              </span>
            ))}
          </div>
        </div>
      ) : null}

      {settings.heroDescription ? (
        <Container>
          <div className="grid gap-6 py-14 md:grid-cols-12 md:py-20">
            <p className="eyebrow md:col-span-3">{settings.siteName}</p>
            <p className="max-w-[40ch] font-serif text-2xl font-light leading-[1.35] text-fg md:col-span-7 md:col-start-5 md:text-[1.9rem]">
              {settings.heroDescription}
            </p>
          </div>
        </Container>
      ) : null}
    </>
  );
}
