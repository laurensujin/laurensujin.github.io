import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CaseStudy } from "@/components/site/CaseStudy";
import { getAdjacentProjects, getPublishedProject, getPublishedProjects } from "@/lib/data/public";
import { refUrl } from "@/lib/media/url";

// New projects published later are rendered on first visit, then cached.
export const dynamicParams = true;

export async function generateStaticParams() {
  const projects = await getPublishedProjects();
  return projects.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: PageProps<"/work/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const project = await getPublishedProject(slug);
  if (!project) return {};
  const { content } = project;
  const title = content.seoTitle || content.title;
  const description = content.seoDescription || content.shortDescription || content.subtitle || undefined;
  const cover = refUrl(content.cover);
  return {
    title,
    description,
    openGraph: { title, description, type: "article", ...(cover ? { images: [{ url: cover }] } : {}) },
  };
}

export default async function ProjectPage({ params }: PageProps<"/work/[slug]">) {
  const { slug } = await params;
  const project = await getPublishedProject(slug);
  if (!project) notFound();
  const { previous, next } = await getAdjacentProjects(slug);

  return <CaseStudy content={project.content} previous={previous} next={next} />;
}
