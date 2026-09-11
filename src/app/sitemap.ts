import type { MetadataRoute } from "next";
import { getPublishedProjects } from "@/lib/data/public";
import { siteUrl } from "@/lib/supabase/env";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = siteUrl();
  const projects = await getPublishedProjects();
  return [
    { url: `${base}/`, changeFrequency: "weekly", priority: 1 },
    ...projects.map((p) => ({
      url: `${base}/work/${p.slug}`,
      lastModified: p.publishedAt ? new Date(p.publishedAt) : undefined,
      changeFrequency: "monthly" as const,
      priority: 0.8,
    })),
  ];
}
