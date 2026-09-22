import type { SiteSettings } from "@/lib/data/types";
import { Container } from "./Container";

interface Props {
  settings: SiteSettings;
  preview?: boolean;
}

/**
 * Landing: a centred statement of what the work is, and nothing else. The
 * work itself starts immediately underneath, rather than below a large
 * picture that says nothing about it.
 */
export function Hero({ settings, preview }: Props) {
  const discipline = settings.heroHeadline.split("\n").map((l) => l.trim()).filter(Boolean).join(" ");

  return (
    <section id="hero" className={preview ? "relative" : "relative pt-16"} aria-label="Introduction">
      <Container className="py-14 text-center md:py-20">
        {/* The page heading is what the work is, not the sentence about it. */}
        {discipline ? <h1 className="t-title enter-up text-accent">{discipline}</h1> : null}

        <hr className="enter-up mx-auto mt-5 max-w-[56rem] border-0 border-t border-accent" style={{ ["--delay" as string]: 60 }} />

        {settings.heroDescription ? (
          <p
            className="t-display-sm enter-up mx-auto mt-7 max-w-[34ch] text-balance text-fg"
            style={{ ["--delay" as string]: 110 }}
          >
            {settings.heroDescription}
          </p>
        ) : null}

        {settings.heroLocation ? (
          <p className="eyebrow enter-up mt-7" style={{ ["--delay" as string]: 160 }}>
            {settings.heroLocation}
          </p>
        ) : null}
      </Container>
    </section>
  );
}
