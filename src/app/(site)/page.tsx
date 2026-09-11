import { Hero } from "@/components/site/Hero";
import { PhotographySection } from "@/components/site/PhotographySection";
import { WorkGrid } from "@/components/site/WorkGrid";
import { getPublishedPhotographySets, getPublishedProjects, getSiteSettings } from "@/lib/data/public";

export default async function HomePage() {
  const [settings, projects, sets] = await Promise.all([
    getSiteSettings(),
    getPublishedProjects(),
    getPublishedPhotographySets(),
  ]);

  return (
    <>
      <Hero settings={settings} />
      <WorkGrid label={settings.selectedWorkLabel} projects={projects} />
      <PhotographySection settings={settings} sets={sets} />
    </>
  );
}
