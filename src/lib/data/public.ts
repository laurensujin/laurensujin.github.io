/**
 * Read functions for the PUBLIC website. They use the anonymous client, so
 * Row Level Security guarantees only published content comes back. Every
 * function fails soft (returns empty defaults) so a hiccup never breaks a build.
 */
import { publicClient } from "@/lib/supabase/public";
import type { PhotographySet, ProfileData, PublicProject, SiteSettings } from "./types";
import {
  toEducation,
  toPhotographySet,
  toProfile,
  toPublicProject,
  toResumeFile,
  toSiteSettings,
  toSocialLink,
} from "./mappers";

function logError(scope: string, error: unknown) {
  console.error(`[data/public] ${scope}:`, error instanceof Error ? error.message : error);
}

export async function getSiteSettings(): Promise<SiteSettings> {
  try {
    const { data, error } = await publicClient().from("site_settings").select("*").eq("id", 1).maybeSingle();
    if (error) throw error;
    return toSiteSettings(data);
  } catch (error) {
    logError("getSiteSettings", error);
    return toSiteSettings(null);
  }
}

export async function getProfileData(): Promise<ProfileData> {
  try {
    const supabase = publicClient();
    const [profile, education, links, resume] = await Promise.all([
      supabase.from("profile").select("*").eq("id", 1).maybeSingle(),
      supabase.from("education").select("*").order("sort_order"),
      supabase.from("social_links").select("*").order("sort_order"),
      supabase.from("resume_files").select("*").eq("is_active", true).maybeSingle(),
    ]);
    for (const result of [profile, education, links, resume]) {
      if (result.error) throw result.error;
    }
    return {
      profile: toProfile(profile.data),
      education: (education.data ?? []).map(toEducation),
      links: (links.data ?? []).map(toSocialLink),
      resume: resume.data ? toResumeFile(resume.data) : null,
    };
  } catch (error) {
    logError("getProfileData", error);
    return { profile: toProfile(null), education: [], links: [], resume: null };
  }
}

export async function getPublishedProjects(): Promise<PublicProject[]> {
  try {
    const { data, error } = await publicClient()
      .from("projects")
      .select("*")
      .eq("status", "published")
      .order("sort_order")
      .order("created_at");
    if (error) throw error;
    return (data ?? []).map(toPublicProject);
  } catch (error) {
    logError("getPublishedProjects", error);
    return [];
  }
}

export async function getPublishedProject(slug: string): Promise<PublicProject | null> {
  try {
    const { data, error } = await publicClient()
      .from("projects")
      .select("*")
      .eq("status", "published")
      .eq("slug", slug)
      .maybeSingle();
    if (error) throw error;
    return data ? toPublicProject(data) : null;
  } catch (error) {
    logError("getPublishedProject", error);
    return null;
  }
}

/** Previous and next published projects, for the navigation at the end of a case study. */
export async function getAdjacentProjects(slug: string): Promise<{ previous: PublicProject | null; next: PublicProject | null }> {
  const projects = await getPublishedProjects();
  const index = projects.findIndex((p) => p.slug === slug);
  if (index === -1 || projects.length < 2) return { previous: null, next: null };
  return {
    previous: projects[(index - 1 + projects.length) % projects.length],
    next: projects[(index + 1) % projects.length],
  };
}

export async function getPublishedPhotographySets(): Promise<PhotographySet[]> {
  try {
    const { data, error } = await publicClient()
      .from("photography_sets")
      .select("*")
      .eq("status", "published")
      .order("sort_order")
      .order("created_at");
    if (error) throw error;
    // A set needs at least one image to be worth showing.
    return (data ?? []).map(toPhotographySet).filter((set) => set.after || set.before);
  } catch (error) {
    logError("getPublishedPhotographySets", error);
    return [];
  }
}
