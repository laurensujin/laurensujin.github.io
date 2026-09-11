"use client";

import { runAdmin, type Supabase } from "@/lib/auth-client";
import { PROJECT_STATUSES, projectContentSchema, type ContentStatus, type ProjectContent } from "@/lib/content/schema";
import { publishToSite } from "@/lib/deploy";
import type { Json } from "@/lib/supabase/database.types";
import { newId, slugify } from "@/lib/utils";

/** Finds a slug that no other project uses, adding -2, -3, ... when needed. */
async function uniqueSlug(supabase: Supabase, base: string, excludeId?: string): Promise<string> {
  const root = slugify(base) || "project";
  let candidate = root;
  for (let attempt = 2; attempt < 100; attempt++) {
    let query = supabase.from("projects").select("id").eq("slug", candidate);
    if (excludeId) query = query.neq("id", excludeId);
    const { data, error } = await query.maybeSingle();
    if (error) throw new Error(error.message);
    if (!data) return candidate;
    candidate = `${root}-${attempt}`;
  }
  return `${root}-${newId().slice(0, 8)}`;
}

async function nextSortOrder(supabase: Supabase): Promise<number> {
  const { data } = await supabase.from("projects").select("sort_order").order("sort_order", { ascending: false }).limit(1);
  return (data?.[0]?.sort_order ?? 0) + 1;
}

/** Creates an empty draft project and returns its id. */
export async function createProject() {
  return runAdmin(async (supabase) => {
    const title = "Untitled project";
    const slug = await uniqueSlug(supabase, title);
    const content: ProjectContent = projectContentSchema.parse({ title, slug });

    const { data, error } = await supabase
      .from("projects")
      .insert({ slug, status: "draft", sort_order: await nextSortOrder(supabase), content: content as unknown as Json })
      .select("id")
      .single();
    if (error) throw new Error(error.message);

    const draft = await supabase.from("project_drafts").insert({ project_id: data.id, content: content as unknown as Json });
    if (draft.error) throw new Error(draft.error.message);

    return { id: data.id };
  });
}

/** Saves work in progress. Nothing changes on the public site. */
export async function saveProjectDraft(id: string, input: unknown) {
  return runAdmin(async (supabase) => {
    const content = projectContentSchema.parse(input);
    const { data, error } = await supabase
      .from("project_drafts")
      .upsert({ project_id: id, content: content as unknown as Json }, { onConflict: "project_id" })
      .select("updated_at")
      .single();
    if (error) throw new Error(error.message);
    return { updatedAt: data.updated_at, content };
  });
}

/** Saves the draft, then copies it to the live site and asks for a rebuild. */
export async function publishProject(id: string, input: unknown) {
  return runAdmin(async (supabase) => {
    const content = projectContentSchema.parse(input);
    if (!content.title.trim()) throw new Error("Give the project a title before publishing.");

    const slug = await uniqueSlug(supabase, content.slug || content.title, id);
    content.slug = slug;

    const draft = await supabase.from("project_drafts").upsert({ project_id: id, content: content as unknown as Json }, { onConflict: "project_id" });
    if (draft.error) throw new Error(draft.error.message);

    const publishedAt = new Date().toISOString();
    const { error } = await supabase
      .from("projects")
      .update({ content: content as unknown as Json, slug, status: "published", published_at: publishedAt })
      .eq("id", id);
    if (error) throw new Error(error.message);

    const rebuild = await publishToSite(supabase);
    return { slug, publishedAt, content, rebuild };
  });
}

/** Changes visibility without touching content: draft, published or hidden. */
export async function setProjectStatus(id: string, status: ContentStatus) {
  return runAdmin(async (supabase) => {
    if (!PROJECT_STATUSES.includes(status)) throw new Error("Unknown status.");

    if (status === "published") {
      // Re-publishing a hidden project keeps its last published content.
      const { data } = await supabase.from("projects").select("published_at, content").eq("id", id).single();
      const hasContent = data?.content && Object.keys(data.content as object).length > 0;
      if (!data?.published_at || !hasContent) {
        throw new Error("This project has never been published. Use Publish in the editor instead.");
      }
    }

    const { error } = await supabase.from("projects").update({ status }).eq("id", id);
    if (error) throw new Error(error.message);
    return publishToSite(supabase);
  });
}

export async function setProjectFeatured(id: string, featured: boolean) {
  return runAdmin(async (supabase) => {
    const { error } = await supabase.from("projects").update({ is_featured: featured }).eq("id", id);
    if (error) throw new Error(error.message);
    return publishToSite(supabase);
  });
}

/** `ids` is the complete list of project ids in the new order. */
export async function reorderProjects(ids: string[]) {
  return runAdmin(async (supabase) => {
    const { error } = await supabase.rpc("reorder_projects", { ids });
    if (error) throw new Error(error.message);
    return publishToSite(supabase);
  });
}

export async function duplicateProject(id: string) {
  return runAdmin(async (supabase) => {
    const { data: source, error } = await supabase.from("projects").select("content, project_drafts(content)").eq("id", id).single();
    if (error) throw new Error(error.message);

    const joined = source.project_drafts as { content: Json } | { content: Json }[] | null;
    const draftRow = Array.isArray(joined) ? joined[0] : joined;
    const base = projectContentSchema.parse(draftRow?.content ?? source.content);
    const title = `${base.title || "Untitled project"} (Copy)`;
    const slug = await uniqueSlug(supabase, title);
    const content: ProjectContent = { ...base, title, slug };

    const inserted = await supabase
      .from("projects")
      .insert({ slug, status: "draft", sort_order: await nextSortOrder(supabase), content: content as unknown as Json })
      .select("id")
      .single();
    if (inserted.error) throw new Error(inserted.error.message);

    const draft = await supabase.from("project_drafts").insert({ project_id: inserted.data.id, content: content as unknown as Json });
    if (draft.error) throw new Error(draft.error.message);

    return { id: inserted.data.id };
  });
}

export async function deleteProject(id: string) {
  return runAdmin(async (supabase) => {
    const { error } = await supabase.from("projects").delete().eq("id", id);
    if (error) throw new Error(error.message);
    return publishToSite(supabase);
  });
}

/** Throws away unpublished edits and restores the draft from the live version. */
export async function discardProjectDraft(id: string) {
  return runAdmin(async (supabase) => {
    const { data, error } = await supabase.from("projects").select("content").eq("id", id).single();
    if (error) throw new Error(error.message);
    const content = projectContentSchema.parse(data.content);
    const { error: draftError } = await supabase
      .from("project_drafts")
      .upsert({ project_id: id, content: content as unknown as Json }, { onConflict: "project_id" });
    if (draftError) throw new Error(draftError.message);
    return { content };
  });
}
