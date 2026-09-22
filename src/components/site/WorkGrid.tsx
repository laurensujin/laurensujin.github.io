import type { MediaRef, ProjectContent } from "@/lib/content/schema";
import type { PublicProject } from "@/lib/data/types";
import { Container } from "./Container";
import { ProjectPreview } from "./ProjectPreview";
import { SectionHeader } from "./SectionHeader";

/** Cover plus every picture uploaded inside the project. Empty slots are skipped. */
export function imagesIn(content: ProjectContent): MediaRef[] {
  const images: MediaRef[] = [];
  const add = (media: MediaRef | null | undefined) => {
    if (!media?.path || media.kind === "pdf") return;
    if (images.some((item) => item.path === media.path)) return;
    images.push(media);
  };

  add(content.cover);
  for (const block of content.blocks) {
    switch (block.type) {
      case "image_large":
      case "image_full":
        add(block.media);
        break;
      case "image_two_column":
      case "image_grid":
      case "moodboard":
        block.images.forEach((item) => add(item.media));
        break;
      case "image_sequence":
        block.steps.forEach((step) => add(step.media));
        break;
      case "before_after":
        add(block.before);
        add(block.after);
        break;
      case "fragrance":
        add(block.prototypeImage);
        block.referenceImages.forEach((item) => add(item.media));
        break;
      default:
        break;
    }
  }
  return images;
}

/** Selected Work: one tile per uploaded picture. */
export function WorkGrid({ label, projects }: { label: string; projects: PublicProject[] }) {
  const tiles = projects.flatMap((project) => imagesIn(project.content).map((media) => ({ project, media })));
  const count = projects.length;

  return (
    <Container>
      <section id="work" className="scroll-mt-24 pt-4" aria-labelledby="work-heading">
        <SectionHeader
          id="work-heading"
          label={label}
          meta={count ? `${count} ${count === 1 ? "project" : "projects"}` : undefined}
        />
        {tiles.length ? (
          <ul className="mt-8 grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 md:gap-x-8 md:gap-y-14">
            {tiles.map(({ project, media }, index) => (
              <ProjectPreview key={`${project.id}-${media.path}`} project={project} media={media} index={index} priority={index < 4} />
            ))}
          </ul>
        ) : (
          <p className="t-body mt-8 text-fg-muted">Work is on its way.</p>
        )}
      </section>
    </Container>
  );
}
