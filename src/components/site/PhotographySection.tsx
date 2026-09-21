import type { PhotographySet, SiteSettings } from "@/lib/data/types";
import { Container } from "./Container";
import { MediaGallery } from "./MediaGallery";

/** Portrait photography section. Hidden until at least one set is published. */
export function PhotographySection({ settings, sets }: { settings: SiteSettings; sets: PhotographySet[] }) {
  if (!sets.length) return null;

  return (
    <Container>
      <section id="photography" className="scroll-mt-20 pt-16 md:pt-20" aria-labelledby="photography-heading">
        <div>
          <h2 id="photography-heading" className="text-sm font-medium text-fg">
            {settings.photographyLabel}
          </h2>
          {settings.photographySubtitle ? (
            <p className="mt-3 max-w-[28ch] font-serif text-2xl font-medium leading-tight md:text-3xl">{settings.photographySubtitle}</p>
          ) : null}
          {settings.photographyDescription ? (
            <p className="mt-3 max-w-[42ch] text-sm leading-relaxed text-fg-muted">{settings.photographyDescription}</p>
          ) : null}
        </div>
        <MediaGallery sets={sets} />
      </section>
    </Container>
  );
}
