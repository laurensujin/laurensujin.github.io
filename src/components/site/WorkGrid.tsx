import type { PublicProject } from "@/lib/data/types";
import { Container } from "./Container";
import { ProjectPreview } from "./ProjectPreview";

/** Selected Work: featured projects span the full width, the rest sit in pairs. */
export function WorkGrid({ label, projects }: { label: string; projects: PublicProject[] }) {
  return (
    <Container>
      <section id="work" className="scroll-mt-24 pt-10 md:pt-16" aria-labelledby="work-heading">
        <div className="flex items-baseline justify-between border-t border-line pt-4">
          <h2 id="work-heading" className="eyebrow text-fg">
            {label}
          </h2>
          <p className="eyebrow">{String(projects.length).padStart(2, "0")}</p>
        </div>

        {projects.length ? (
          <ul className="mt-12 grid grid-cols-1 gap-x-8 gap-y-16 md:grid-cols-2 md:gap-y-24">
            {projects.map((project, index) => (
              <ProjectPreview
                key={project.id}
                project={project}
                priority={index === 0}
                variant={project.isFeatured ? "featured" : "standard"}
                className={project.isFeatured ? "md:col-span-2" : undefined}
              />
            ))}
          </ul>
        ) : (
          <p className="mt-12 font-serif text-2xl font-light italic text-fg-muted">Work is on its way.</p>
        )}
      </section>
    </Container>
  );
}
