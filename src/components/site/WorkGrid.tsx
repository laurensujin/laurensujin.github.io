import type { MediaRef, ProjectContent } from "@/lib/content/schema";
import type { PublicProject } from "@/lib/data/types";
import { Container } from "./Container";
import { ProjectPreview } from "./ProjectPreview";

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

  return (
    <Container>
      <section id="work" className="scroll-mt-20 pb-4" aria-label={label}>
        {tiles.length ? (
          <ul className="mt-6 grid grid-cols-1 gap-x-4 gap-y-8 sm:grid-cols-2">
            {tiles.map(({ project, media }, index) => (
              <ProjectPreview key={`${project.id}-${media.path}`} project={project} media={media} priority={index < 4} />
            ))}
          </ul>
        ) : (
          <p className="mt-8 text-base text-fg-muted">Work is on its way.</p>
        )}
      </section>
    </Container>
  );
}
