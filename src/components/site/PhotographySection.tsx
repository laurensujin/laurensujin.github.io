import type { PhotographySet, SiteSettings } from "@/lib/data/types";
import { Container } from "./Container";
import { MediaGallery } from "./MediaGallery";
import { SectionHeader } from "./SectionHeader";

/** Portrait photography section. Hidden until at least one set is published. */
export function PhotographySection({ settings, sets }: { settings: SiteSettings; sets: PhotographySet[] }) {
  if (!sets.length) return null;

  return (
    <Container>
      <section id="photography" className="scroll-mt-24 pt-16 md:pt-24" aria-labelledby="photography-heading">
        <SectionHeader
          id="photography-heading"
          label={settings.photographyLabel}
          meta={`${sets.length} ${sets.length === 1 ? "set" : "sets"}`}
          title={settings.photographySubtitle || undefined}
          description={settings.photographyDescription || undefined}
        />
        <MediaGallery sets={sets} />
      </section>
    </Container>
  );
}
