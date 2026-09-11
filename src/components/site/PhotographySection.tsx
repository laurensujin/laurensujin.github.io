import type { PhotographySet, SiteSettings } from "@/lib/data/types";
import { Container } from "./Container";
import { MediaGallery } from "./MediaGallery";

/** Portrait photography section. Hidden until at least one set is published. */
export function PhotographySection({ settings, sets }: { settings: SiteSettings; sets: PhotographySet[] }) {
  if (!sets.length) return null;

  return (
    <Container>
      <section id="photography" className="scroll-mt-24 pt-32 md:pt-44" aria-labelledby="photography-heading">
        <div className="border-t border-line pt-4">
          <div className="flex items-baseline justify-between">
            <h2 id="photography-heading" className="eyebrow text-fg">
              {settings.photographyLabel}
            </h2>
            <p className="eyebrow">{String(sets.length).padStart(2, "0")}</p>
          </div>
          <div className="mt-10 grid gap-8 md:grid-cols-12">
            <p className="font-serif text-4xl font-light leading-tight md:col-span-6 md:text-6xl">{settings.photographySubtitle}</p>
            {settings.photographyDescription ? (
              <p className="max-w-[40ch] text-[1.0625rem] leading-[1.7] text-fg-muted md:col-span-5 md:col-start-8 md:self-end">
                {settings.photographyDescription}
              </p>
            ) : null}
          </div>
        </div>
        <MediaGallery sets={sets} />
      </section>
    </Container>
  );
}
