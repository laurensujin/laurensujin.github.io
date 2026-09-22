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

interface Props {
  label: string;
  projects: PublicProject[];
}

/** Selected Work: a close grid, one tile per uploaded picture. */
export function WorkGrid({ label, projects }: Props) {
  const tiles = projects.flatMap((project) => imagesIn(project.content).map((media) => ({ project, media })));

  return (
    <Container>
      <section id="work" className="scroll-mt-24" aria-labelledby="work-heading">
        <SectionHeader
          id="work-heading"
          label={label}
          meta={projects.length ? `${projects.length} ${projects.length === 1 ? "project" : "projects"}` : undefined}
        />
        {tiles.length ? (
          <ul className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-4 lg:grid-cols-4">
            {tiles.map(({ project, media }, index) => (
              <ProjectPreview key={`${project.id}-${media.path}`} project={project} media={media} priority={index < 8} />
            ))}
          </ul>
        ) : (
          <p className="t-body mt-8 text-fg-muted">Work is on its way.</p>
        )}
      </section>
    </Container>
  );
}
