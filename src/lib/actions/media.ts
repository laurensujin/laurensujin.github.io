"use client";

import { z } from "zod";
import { runAdmin } from "@/lib/auth-client";
import type { MediaRef } from "@/lib/content/schema";
import { mediaItemToRef, toMediaItem } from "@/lib/data/mappers";
import { publishToSite } from "@/lib/deploy";
import { MEDIA_BUCKET, renditionPath } from "@/lib/media/url";
import type { Json } from "@/lib/supabase/database.types";

const registerInput = z.object({
  path: z.string().min(1).max(500),
  kind: z.enum(["image", "video", "pdf"]),
  mimeType: z.string().min(1).max(100),
  sizeBytes: z.number().int().nonnegative(),
  width: z.number().int().positive().nullable(),
  height: z.number().int().positive().nullable(),
  sizes: z.array(z.number().int().positive()).catch([]),
  title: z.string().max(200).catch(""),
  altText: z.string().max(500).catch(""),
  originalFilename: z.string().max(300).nullable().catch(null),
});

export type RegisterMediaInput = z.input<typeof registerInput>;

/** Called after the browser has uploaded a file to storage: records it in the library. */
export async function registerMedia(input: RegisterMediaInput) {
  return runAdmin(async (supabase) => {
    const m = registerInput.parse(input);
    const { data, error } = await supabase
      .from("media")
      .insert({
        path: m.path,
        kind: m.kind,
        mime_type: m.mimeType,
        size_bytes: m.sizeBytes,
        width: m.width,
        height: m.height,
        sizes: m.sizes,
        title: m.title,
        alt_text: m.altText,
        original_filename: m.originalFilename,
      })
      .select("*")
      .single();
    if (error) throw new Error(error.message);
    const item = toMediaItem(data);
    return { item, ref: mediaItemToRef(item) };
  });
}

export async function updateMediaDetails(id: string, input: { title: string; altText: string }) {
  return runAdmin(async (supabase) => {
    const { error } = await supabase.from("media").update({ title: input.title.slice(0, 200), alt_text: input.altText.slice(0, 500) }).eq("id", id);
    if (error) throw new Error(error.message);
  });
}

/** Media library contents for the picker dialog (newest first). */
export async function listMediaAction() {
  return runAdmin(async (supabase) => {
    const { data, error } = await supabase.from("media").select("*").order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return data.map(toMediaItem);
  });
}

export interface MediaUsage {
  kind: "project" | "draft" | "photography" | "profile" | "settings";
  label: string;
  href: string;
}

/** Lists everything that currently shows this file. */
export async function getMediaUsage(id: string) {
  return runAdmin(async (supabase) => {
    const usage: MediaUsage[] = [];
    const mentions = (value: unknown) => JSON.stringify(value ?? null).includes(id);

    const [projects, drafts, sets, profile, settings] = await Promise.all([
      supabase.from("projects").select("id, slug, content"),
      supabase.from("project_drafts").select("project_id, content"),
      supabase.from("photography_sets").select("id, title, before_image, after_image"),
      supabase.from("profile").select("image").eq("id", 1).maybeSingle(),
      supabase.from("site_settings").select("og_image, favicon, hero_image").eq("id", 1).maybeSingle(),
    ]);

    for (const p of projects.data ?? []) {
      if (mentions(p.content)) {
        const title = (p.content as { title?: string })?.title || p.slug;
        usage.push({ kind: "project", label: `${title} (live)`, href: `/admin/projects/edit/?id=${p.id}` });
      }
    }
    for (const d of drafts.data ?? []) {
      if (mentions(d.content)) {
        const title = (d.content as { title?: string })?.title || "Untitled project";
        usage.push({ kind: "draft", label: `${title} (draft)`, href: `/admin/projects/edit/?id=${d.project_id}` });
      }
    }
    for (const s of sets.data ?? []) {
      if (mentions(s.before_image) || mentions(s.after_image)) {
        usage.push({ kind: "photography", label: s.title || "Untitled photo set", href: `/admin/photography/edit/?id=${s.id}` });
      }
    }
    if (mentions(profile.data?.image)) usage.push({ kind: "profile", label: "Profile image", href: "/admin/profile/" });
    if (mentions(settings.data?.og_image)) usage.push({ kind: "settings", label: "Social preview image", href: "/admin/settings/" });
    if (mentions(settings.data?.favicon)) usage.push({ kind: "settings", label: "Favicon", href: "/admin/settings/" });
    if (mentions(settings.data?.hero_image)) usage.push({ kind: "settings", label: "Homepage hero image", href: "/admin/homepage/" });
    return usage;
  });
}

/** Recursively replaces every reference to the media id with null. */
function scrub(value: unknown, id: string): unknown {
  if (Array.isArray(value)) return value.map((v) => scrub(v, id));
  if (value && typeof value === "object") {
    const record = value as Record<string, unknown>;
    if (record.id === id && typeof record.path === "string") return null;
    const out: Record<string, unknown> = {};
    for (const [key, val] of Object.entries(record)) out[key] = scrub(val, id);
    return out;
  }
  return value;
}

/**
 * Deletes a file (and its resized copies) from storage and the library, and
 * removes it from every project, draft, photo set, the profile and settings.
 */
export async function deleteMedia(id: string) {
  return runAdmin(async (supabase) => {
    const { data: media, error } = await supabase.from("media").select("*").eq("id", id).single();
    if (error) throw new Error(error.message);
    const mentions = (value: unknown) => JSON.stringify(value ?? null).includes(id);

    const [projects, drafts, sets, profile, settings] = await Promise.all([
      supabase.from("projects").select("id, content"),
      supabase.from("project_drafts").select("project_id, content"),
      supabase.from("photography_sets").select("id, before_image, after_image"),
      supabase.from("profile").select("image").eq("id", 1).maybeSingle(),
      supabase.from("site_settings").select("og_image, favicon, hero_image").eq("id", 1).maybeSingle(),
    ]);

    for (const p of projects.data ?? []) {
      if (mentions(p.content)) await supabase.from("projects").update({ content: scrub(p.content, id) as Json }).eq("id", p.id);
    }
    for (const d of drafts.data ?? []) {
      if (mentions(d.content)) await supabase.from("project_drafts").update({ content: scrub(d.content, id) as Json }).eq("project_id", d.project_id);
    }
    for (const s of sets.data ?? []) {
      if (mentions(s.before_image) || mentions(s.after_image)) {
        await supabase
          .from("photography_sets")
          .update({ before_image: scrub(s.before_image, id) as Json, after_image: scrub(s.after_image, id) as Json })
          .eq("id", s.id);
      }
    }
    if (mentions(profile.data?.image)) await supabase.from("profile").update({ image: null }).eq("id", 1);
    if (mentions(settings.data?.og_image)) await supabase.from("site_settings").update({ og_image: null }).eq("id", 1);
    if (mentions(settings.data?.favicon)) await supabase.from("site_settings").update({ favicon: null }).eq("id", 1);
    if (mentions(settings.data?.hero_image)) await supabase.from("site_settings").update({ hero_image: null }).eq("id", 1);

    const paths = [media.path, ...(media.sizes ?? []).map((w) => renditionPath(media.path, w))];
    const storage = await supabase.storage.from(MEDIA_BUCKET).remove(paths);
    if (storage.error) throw new Error(storage.error.message);

    const removed = await supabase.from("media").delete().eq("id", id);
    if (removed.error) throw new Error(removed.error.message);

    return publishToSite(supabase);
  });
}

export type { MediaRef };
