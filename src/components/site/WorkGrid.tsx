import type { PublicProject } from "@/lib/data/types";
import { Container } from "./Container";
import { ProjectPreview } from "./ProjectPreview";

/** Selected Work: equal cards, picture first, one line of what it is. */
export function WorkGrid({ label, projects }: { label: string; projects: PublicProject[] }) {
  return (
    <Container>
      <section id="work" className="scroll-mt-20 pb-4 pt-2" aria-labelledby="work-heading">
        <h2 id="work-heading" className="text-sm font-medium text-fg">
          {label}
        </h2>

        {projects.length ? (
          <ul className="mt-5 grid grid-cols-2 gap-x-3 gap-y-6 md:gap-x-5 lg:grid-cols-3">
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
