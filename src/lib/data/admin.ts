/**
 * Read functions for the ADMIN area. They use the cookie-based client, so the
 * signed-in administrator can see drafts and hidden content.
 */
import { createClient } from "@/lib/supabase/server";
import { parseProjectContent } from "@/lib/content/schema";
import type {
  AdminProject,
  Education,
  MediaItem,
  PhotographySet,
  Profile,
  ResumeFile,
  SiteSettings,
  SocialLink,
} from "./types";
import {
  toAdminProject,
  toEducation,
  toMediaItem,
  toPhotographySet,
  toProfile,
  toResumeFile,
  toSiteSettings,
  toSocialLink,
} from "./mappers";

const PROJECT_WITH_DRAFT = "*, project_drafts(content, updated_at)";

export async function listProjectsForAdmin(): Promise<AdminProject[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("projects")
    .select(PROJECT_WITH_DRAFT)
    .order("sort_order")
    .order("created_at");
  if (error) throw error;
  return (data ?? []).map(toAdminProject);
}

export async function getProjectForAdmin(id: string): Promise<AdminProject | null> {
  const supabase = await createClient();
  const { data, error } = await supabase.from("projects").select(PROJECT_WITH_DRAFT).eq("id", id).maybeSingle();
  if (error) throw error;
  if (!data) return null;

  const project = toAdminProject(data);
  // Older rows may not have a draft yet: start one from the live content.
  if (project.draftUpdatedAt === null) {
    const content = parseProjectContent(data.content);
    await supabase.from("project_drafts").upsert({ project_id: id, content }, { onConflict: "project_id" });
    project.draft = content;
  }
  return project;
}

export async function listPhotographySetsForAdmin(): Promise<PhotographySet[]> {
  const supabase = await createClient();
  const { data, error } = await supabase.from("photography_sets").select("*").order("sort_order").order("created_at");
  if (error) throw error;
  return (data ?? []).map(toPhotographySet);
}

export async function getPhotographySetForAdmin(id: string): Promise<PhotographySet | null> {
  const supabase = await createClient();
  const { data, error } = await supabase.from("photography_sets").select("*").eq("id", id).maybeSingle();
  if (error) throw error;
  return data ? toPhotographySet(data) : null;
}

export async function getProfileForAdmin(): Promise<{ profile: Profile; education: Education[]; links: SocialLink[] }> {
  const supabase = await createClient();
  const [profile, education, links] = await Promise.all([
    supabase.from("profile").select("*").eq("id", 1).maybeSingle(),
    supabase.from("education").select("*").order("sort_order"),
    supabase.from("social_links").select("*").order("sort_order"),
  ]);
  for (const result of [profile, education, links]) {
    if (result.error) throw result.error;
  }
  return {
    profile: toProfile(profile.data),
    education: (education.data ?? []).map(toEducation),
    links: (links.data ?? []).map(toSocialLink),
  };
}

export async function getSiteSettingsForAdmin(): Promise<SiteSettings> {
  const supabase = await createClient();
  const { data, error } = await supabase.from("site_settings").select("*").eq("id", 1).maybeSingle();
  if (error) throw error;
  return toSiteSettings(data);
}

export async function listMedia(): Promise<MediaItem[]> {
  const supabase = await createClient();
  const { data, error } = await supabase.from("media").select("*").order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []).map(toMediaItem);
}

export async function listResumeFiles(): Promise<ResumeFile[]> {
  const supabase = await createClient();
  const { data, error } = await supabase.from("resume_files").select("*").order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []).map(toResumeFile);
}

export async function getDashboardStats() {
  const [projects, sets, media, resumes] = await Promise.all([
    listProjectsForAdmin(),
    listPhotographySetsForAdmin(),
    listMedia(),
    listResumeFiles(),
  ]);
  return {
    projects,
    publishedProjects: projects.filter((p) => p.status === "published").length,
    draftProjects: projects.filter((p) => p.status !== "published").length,
    withUnpublishedChanges: projects.filter((p) => p.hasUnpublishedChanges),
    photographySets: sets.length,
    publishedSets: sets.filter((s) => s.status === "published").length,
    mediaCount: media.length,
    activeResume: resumes.find((r) => r.isActive) ?? null,
  };
}
