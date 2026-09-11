import { Hero } from "@/components/site/Hero";
import { PhotographySection } from "@/components/site/PhotographySection";
import { WorkGrid } from "@/components/site/WorkGrid";
import { getPublishedPhotographySets, getPublishedProjects, getSiteSettings } from "@/lib/data/public";

export default async function HomePage() {
  const [settings, projects, sets] = await Promise.all([getSiteSettings(), getPublishedProjects(), getPublishedPhotographySets()]);

  // Hero image: the one chosen under Homepage, else the first featured cover.
  const featuredCover = (projects.find((p) => p.isFeatured) ?? projects[0])?.content.cover ?? null;
  const visual = settings.heroImage ?? featuredCover;

  return (
    <>
      <Hero settings={settings} visual={visual} />
      <WorkGrid label={settings.selectedWorkLabel} projects={projects} />
      <PhotographySection settings={settings} sets={sets} />
    </>
  );
}
