import type { PublicProject } from "@/lib/data/types";
import { Container } from "./Container";
import { ProjectPreview } from "./ProjectPreview";

/** Selected Work: equal cards, picture first, one line of what it is. */
export function WorkGrid({ label, projects }: { label: string; projects: PublicProject[] }) {
  return (
    <Container>
      <section id="work" className="scroll-mt-20 pb-4" aria-label={label}>
        {projects.length ? (
          <ul className="mt-6 grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2">
            {projects.map((project, index) => (
              <ProjectPreview key={project.id} project={project} priority={index < 3} variant="standard" />
            ))}
          </ul>
        ) : (
          <p className="mt-8 text-base text-fg-muted">Work is on its way.</p>
        )}
      </section>
    </Container>
  );
}
