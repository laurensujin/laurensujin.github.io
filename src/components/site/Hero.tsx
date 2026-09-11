import type { SiteSettings } from "@/lib/data/types";
import { Container } from "./Container";

/** Editorial opening section. All copy comes from Homepage settings in /admin. */
export function Hero({ settings, preview }: { settings: SiteSettings; preview?: boolean }) {
  const lines = settings.heroHeadline.split("\n").filter((l) => l.trim().length);

  return (
    <Container>
      <section className={preview ? "flex flex-col justify-between py-14" : "flex min-h-[calc(100svh-4rem)] flex-col justify-between pb-14 pt-32 md:pb-20 md:pt-44"}>
        <div>
          <p className="eyebrow">{settings.siteName}</p>
          <h1 className="mt-8 max-w-[15ch] font-serif text-[clamp(2.75rem,7vw,6.75rem)] font-light leading-[1.02] tracking-[-0.015em] text-fg">
            {lines.map((line, index) => (
              <span key={index} className="block">
                {line}
              </span>
            ))}
          </h1>
        </div>

        <div className="mt-20 grid gap-10 md:grid-cols-12 md:items-end">
          <div className="md:col-span-4">
            {settings.heroLocation ? <p className="eyebrow">{settings.heroLocation}</p> : null}
            {settings.heroCtaLabel ? (
              <a href="#work" className="eyebrow link-line mt-6 inline-flex items-center gap-3 text-fg">
                {settings.heroCtaLabel}
                <span aria-hidden className="text-sm">
                  ↓
                </span>
              </a>
            ) : null}
          </div>
          {settings.heroDescription ? (
            <p className="max-w-[38ch] text-[1.0625rem] leading-[1.7] text-fg-muted md:col-span-5 md:col-start-8">
              {settings.heroDescription}
            </p>
          ) : null}
        </div>
      </section>
    </Container>
  );
}
